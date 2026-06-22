use serde::Deserialize;
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase", default)]
pub struct HardwareProbe {
    pub cpu_name: String,
    pub cpu_cores: u32,
    pub cpu_threads: u32,
    pub cpu_max_mhz: u32,
    pub cpu_current_mhz: u32,
    pub gpu_name: String,
    pub gpu_vram_gb: u32,
    pub memory_total_gb: f64,
    pub memory_type: String,
    pub memory_speed_mhz: u32,
    pub memory_rated_mhz: u32,
    pub memory_manufacturer: String,
    pub os_name: String,
    pub os_version: String,
    pub disk_model: String,
    pub disk_size_gb: f64,
    pub bios_manufacturer: String,
    pub bios_version: String,
    pub bios_serial: String,
    pub bios_release_date: String,
    pub motherboard: String,
    pub system_manufacturer: String,
    pub hags_enabled: Option<bool>,
    pub memory_integrity: Option<bool>,
    pub vbs_enabled: Option<bool>,
    pub power_plan: String,
    pub game_mode_enabled: bool,
}

struct ProbeCache {
    at: Instant,
    data: HardwareProbe,
}

static PROBE_CACHE: std::sync::Mutex<Option<ProbeCache>> = std::sync::Mutex::new(None);
const PROBE_TTL: Duration = Duration::from_secs(10);

pub fn get_probe() -> HardwareProbe {
    if let Ok(cache) = PROBE_CACHE.lock() {
        if let Some(entry) = cache.as_ref() {
            if entry.at.elapsed() < PROBE_TTL {
                return entry.data.clone();
            }
        }
    }

    let data = probe_system();
    if let Ok(mut cache) = PROBE_CACHE.lock() {
        *cache = Some(ProbeCache {
            at: Instant::now(),
            data: data.clone(),
        });
    }
    data
}

pub fn invalidate_probe_cache() {
    if let Ok(mut cache) = PROBE_CACHE.lock() {
        *cache = None;
    }
}

fn probe_system() -> HardwareProbe {
    #[cfg(windows)]
    {
        probe_windows()
    }
    #[cfg(not(windows))]
    {
        HardwareProbe::default()
    }
}

#[cfg(windows)]
fn probe_windows() -> HardwareProbe {
    use crate::platform::run_ps;

    let script = r#"
$ErrorActionPreference = 'SilentlyContinue'

function Get-GpuInfo {
  $gpu = Get-CimInstance Win32_VideoController |
    Where-Object { $_.Name -and $_.Name -notmatch 'Microsoft|Remote|Virtual|Parsec|VMware|Citrix' } |
    Sort-Object { $_.AdapterRAM } -Descending |
    Select-Object -First 1
  $name = if ($gpu) { $gpu.Name.Trim() } else { '' }
  $vramGb = 0

  if ($name -match 'NVIDIA') {
    $smi = & nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>$null | Select-Object -First 1
    if ($smi) {
      $mib = [int]($smi.ToString().Trim())
      if ($mib -gt 0) { $vramGb = [math]::Round($mib / 1024) }
    }
  }

  $regRoot = 'HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}'
  Get-ChildItem $regRoot -ErrorAction SilentlyContinue | ForEach-Object {
    $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    if ($p.DriverDesc -and $p.'HardwareInformation.qwMemorySize' -gt 0) {
      if (-not $name -or $p.DriverDesc -eq $name) {
        if (-not $name) { $name = $p.DriverDesc.Trim() }
        $gb = [math]::Round($p.'HardwareInformation.qwMemorySize' / 1GB)
        if ($gb -gt $vramGb) { $vramGb = $gb }
      }
    }
  }

  if ($vramGb -le 0 -and $gpu -and $gpu.AdapterRAM -ge 536870912) {
    $vramGb = [math]::Round($gpu.AdapterRAM / 1GB)
  }

  @{ name = $name; vramGb = $vramGb }
}

function Get-MemoryType($type) {
  switch ($type) {
    34 { 'DDR5' }
    26 { 'DDR4' }
    24 { 'DDR3' }
    default { 'DDR' }
  }
}

$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$bios = Get-CimInstance Win32_BIOS | Select-Object -First 1
$board = Get-CimInstance Win32_BaseBoard | Select-Object -First 1
$system = Get-CimInstance Win32_ComputerSystem | Select-Object -First 1
$os = Get-CimInstance Win32_OperatingSystem | Select-Object -First 1
$sticks = @(Get-CimInstance Win32_PhysicalMemory)
$disk = Get-CimInstance Win32_DiskDrive | Sort-Object { $_.Size } -Descending | Select-Object -First 1
$gpu = Get-GpuInfo

$memTotalGb = if ($system.TotalPhysicalMemory) { [math]::Round($system.TotalPhysicalMemory / 1GB, 2) } else { 0 }
$memSpeed = ($sticks | Measure-Object -Property ConfiguredClockSpeed -Maximum).Maximum
$memRated = ($sticks | Measure-Object -Property Speed -Maximum).Maximum
$memMfg = ($sticks | Select-Object -First 1).Manufacturer
if ($memMfg) { $memMfg = $memMfg.Trim() }
$memType = Get-MemoryType (($sticks | Select-Object -First 1).SMBIOSMemoryType)

$release = ''
if ($bios.ReleaseDate) {
  $release = ([Management.ManagementDateTimeConverter]::ToDateTime($bios.ReleaseDate)).ToString('M/d/yyyy')
}

$diskModel = if ($disk.Model) { $disk.Model.Trim() } else { '' }
$diskGb = if ($disk.Size) { [math]::Round($disk.Size / 1GB, 1) } else { 0 }

$hags = $null
$hagsReg = reg query 'HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers' /v HwSchMode 2>$null
if ($hagsReg -match '0x1') { $hags = $true }
elseif ($hagsReg -match '0x2') { $hags = $false }

$memIntegrity = $null
$miReg = reg query 'HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard\Scenarios\HypervisorEnforcedCodeIntegrity' /v Enabled 2>$null
if ($miReg -match '0x1') { $memIntegrity = $true }
elseif ($miReg -match '0x0') { $memIntegrity = $false }

$vbs = $null
$vbsReg = reg query 'HKLM\SYSTEM\CurrentControlSet\Control\DeviceGuard' /v EnableVirtualizationBasedSecurity 2>$null
if ($vbsReg -match '0x1') { $vbs = $true }
elseif ($vbsReg -match '0x0') { $vbs = $false }

$gameMode = $false
$gmReg = reg query 'HKCU\Software\Microsoft\GameBar' /v AutoGameModeEnabled 2>$null
if ($gmReg -match '0x1') { $gameMode = $true }

$powerPlan = 'Unknown'
$pp = powercfg /getactivescheme 2>$null
if ($pp -match '\((.+)\)') { $powerPlan = $Matches[1].Trim() }

$boardName = ''
if ($board.Manufacturer -and $board.Product) {
  $boardName = ('{0} {1}' -f $board.Manufacturer.Trim(), $board.Product.Trim()).Trim()
}

$result = [ordered]@{
  cpuName = if ($cpu.Name) { $cpu.Name.Trim() } else { '' }
  cpuCores = [int]($cpu.NumberOfCores)
  cpuThreads = [int]($cpu.NumberOfLogicalProcessors)
  cpuMaxMhz = [int]($cpu.MaxClockSpeed)
  cpuCurrentMhz = [int]($cpu.CurrentClockSpeed)
  gpuName = $gpu.name
  gpuVramGb = [int]$gpu.vramGb
  memoryTotalGb = $memTotalGb
  memoryType = $memType
  memorySpeedMhz = [int]$memSpeed
  memoryRatedMhz = [int]$memRated
  memoryManufacturer = $memMfg
  osName = if ($os.Caption) { $os.Caption.Trim() } else { '' }
  osVersion = if ($os.Version) { $os.Version.Trim() } else { '' }
  diskModel = $diskModel
  diskSizeGb = $diskGb
  biosManufacturer = if ($bios.Manufacturer) { $bios.Manufacturer.Trim() } else { '' }
  biosVersion = if ($bios.SMBIOSBIOSVersion) { $bios.SMBIOSBIOSVersion.Trim() } else { '' }
  biosSerial = if ($bios.SerialNumber) { $bios.SerialNumber.Trim() } else { '' }
  biosReleaseDate = $release
  motherboard = $boardName
  systemManufacturer = if ($system.Manufacturer) { $system.Manufacturer.Trim() } else { '' }
  hagsEnabled = $hags
  memoryIntegrity = $memIntegrity
  vbsEnabled = $vbs
  powerPlan = $powerPlan
  gameModeEnabled = $gameMode
}

$result | ConvertTo-Json -Compress
"#;

    match run_ps(script) {
        Ok(raw) => parse_probe_json(&raw).unwrap_or_else(fallback_probe),
        Err(_) => fallback_probe(),
    }
}

#[cfg(windows)]
fn parse_probe_json(raw: &str) -> Option<HardwareProbe> {
    let trimmed = raw.trim().trim_start_matches('\u{feff}');
    let json_line = trimmed.lines().find(|l| l.starts_with('{'))?;
    serde_json::from_str(json_line).ok()
}

#[cfg(windows)]
fn fallback_probe() -> HardwareProbe {
    let mut sys = sysinfo::System::new();
    sys.refresh_cpu_all();
    sys.refresh_memory();

    let mut probe = HardwareProbe::default();
    probe.cpu_name = sys
        .cpus()
        .first()
        .map(|c| c.brand().trim().to_string())
        .unwrap_or_default();
    probe.cpu_threads = sys.cpus().len().max(1) as u32;
    probe.cpu_cores = probe.cpu_threads;
    probe.memory_total_gb = sys.total_memory() as f64 / 1024.0 / 1024.0 / 1024.0;
    probe.os_name = sysinfo::System::name().unwrap_or_else(|| "Windows".into());
    probe.os_version = sysinfo::System::os_version().unwrap_or_default();
    probe
}

#[cfg(not(windows))]
fn parse_probe_json(_raw: &str) -> Option<HardwareProbe> {
    None
}

#[cfg(not(windows))]
fn fallback_probe() -> HardwareProbe {
    HardwareProbe::default()
}

pub fn fmt_vram(gb: u32) -> String {
    if gb > 0 {
        format!("{gb} GB")
    } else {
        "—".to_string()
    }
}

pub fn or_dash(value: &str) -> String {
    if value.trim().is_empty() {
        "—".to_string()
    } else {
        value.trim().to_string()
    }
}
