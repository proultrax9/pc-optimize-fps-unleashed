use crate::platform::{run_cmd, run_ps};
use crate::store::AppStore;

pub fn read_priority_separation() -> Result<Option<String>, String> {
    let out = run_cmd(
        "reg",
        &[
            "query",
            r"HKLM\SYSTEM\CurrentControlSet\Control\PriorityControl",
            "/v",
            "Win32PrioritySeparation",
        ],
    )?;
    Ok(out.lines().find_map(|line| {
        if line.contains("Win32PrioritySeparation") {
            line.split("0x").nth(1).map(|v| {
                format!(
                    "0x{}",
                    v.trim().split_whitespace().next().unwrap_or_default()
                )
            })
        } else {
            None
        }
    }))
}

pub fn apply_win_priority(preset: &str) -> Result<String, String> {
    let value = match preset {
        "26" => "0x26",
        "28" => "0x28",
        "2a" => "0x2A",
        _ => "0x26",
    };
    run_cmd(
        "reg",
        &[
            "add",
            r"HKLM\SYSTEM\CurrentControlSet\Control\PriorityControl",
            "/v",
            "Win32PrioritySeparation",
            "/t",
            "REG_DWORD",
            "/d",
            value,
            "/f",
        ],
    )?;
    Ok(format!("Win32PrioritySeparation set to {value} (gaming latency profile)."))
}

pub fn revert_win_priority(backup: Option<&str>) -> Result<String, String> {
    let value = backup.unwrap_or("0x2");
    run_cmd(
        "reg",
        &[
            "add",
            r"HKLM\SYSTEM\CurrentControlSet\Control\PriorityControl",
            "/v",
            "Win32PrioritySeparation",
            "/t",
            "REG_DWORD",
            "/d",
            value,
            "/f",
        ],
    )?;
    Ok("Win32PrioritySeparation restored.".into())
}

pub fn apply_mmcss_latency() -> Result<String, String> {
    run_ps(
        r#"
$base = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile'
New-Item -Path $base -Force | Out-Null
Set-ItemProperty -Path $base -Name 'SystemResponsiveness' -Value 0 -Type DWord -Force
Set-ItemProperty -Path $base -Name 'NetworkThrottlingIndex' -Value 0xffffffff -Type DWord -Force -ErrorAction SilentlyContinue
$games = Join-Path $base 'Tasks\Games'
New-Item -Path $games -Force | Out-Null
Set-ItemProperty -Path $games -Name 'GPU Priority' -Value 8 -Type DWord -Force
Set-ItemProperty -Path $games -Name 'Priority' -Value 6 -Type DWord -Force
Set-ItemProperty -Path $games -Name 'Scheduling Category' -Value 'High' -Type String -Force
Set-ItemProperty -Path $games -Name 'SFIO Priority' -Value 'High' -Type String -Force
Set-ItemProperty -Path $games -Name 'Background Only' -Value 'False' -Type String -Force
Set-ItemProperty -Path $games -Name 'Clock Rate' -Value 10000 -Type DWord -Force
Set-ItemProperty -Path $games -Name 'Latency Sensitive' -Value 'True' -Type String -Force
Set-ItemProperty -Path $games -Name 'Lazy Mode' -Value 'True' -Type String -Force -ErrorAction SilentlyContinue
Set-ItemProperty -Path $games -Name 'Lazy Mode Timeout' -Value 9999999 -Type DWord -Force -ErrorAction SilentlyContinue
"#,
    )?;
    Ok("MMCSS gaming profile applied (System Responsiveness 0, Games task tuned).".into())
}

pub fn revert_mmcss() -> Result<String, String> {
    run_ps(
        r#"
$base = 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile'
Set-ItemProperty -Path $base -Name 'SystemResponsiveness' -Value 20 -Type DWord -Force -ErrorAction SilentlyContinue
"#,
    )?;
    Ok("MMCSS SystemResponsiveness restored to default (20).".into())
}

pub fn apply_system_ini_fps() -> Result<String, String> {
    let windir = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
    let ini_path = format!("{windir}\\system.ini");
    let backup_dir = AppStore::global().data_dir().join("backups");
    std::fs::create_dir_all(&backup_dir).map_err(|e| e.to_string())?;
    let backup_path = backup_dir.join("system.ini.bak");

    if std::path::Path::new(&ini_path).exists() && !backup_path.exists() {
        std::fs::copy(&ini_path, &backup_path).map_err(|e| e.to_string())?;
    }

    let profile = r"; FPS Unleashed — latency profile [386Enh]
; for 16-bit app support
[386Enh]
MinTimeSlice=1
AvgTimeSlice=1
MaxTimeSlice=1
WinTimeSlice=1,1
NetAsyncTimeout=0
SyncTimeDivisor=1
TimeWindowMinutes=0
Latency=1

[drivers]
wave=mmdrv.dll
timer=timer.drv
";
    std::fs::write(&ini_path, profile).map_err(|e| format!("Failed to write system.ini: {e}"))?;
    Ok("system.ini latency profile applied (backup saved).".into())
}

pub fn revert_system_ini() -> Result<String, String> {
    let windir = std::env::var("WINDIR").unwrap_or_else(|_| "C:\\Windows".to_string());
    let ini_path = format!("{windir}\\system.ini");
    let backup_path = AppStore::global().data_dir().join("backups").join("system.ini.bak");

    if backup_path.exists() {
        std::fs::copy(&backup_path, &ini_path).map_err(|e| e.to_string())?;
        Ok("system.ini restored from backup.".into())
    } else {
        Err("No system.ini backup found.".into())
    }
}

pub fn apply_disable_power_saving() -> Result<String, String> {
    run_cmd(
        "powercfg",
        &[
            "-setacvalueindex",
            "SCHEME_CURRENT",
            "54533251-82be-4824-96c1-47b60b740d00",
            "893cee8e-2bef-41e0-89c6-b55d0929964a",
            "100",
        ],
    )?;
    run_cmd(
        "powercfg",
        &[
            "-setacvalueindex",
            "SCHEME_CURRENT",
            "54533251-82be-4824-96c1-47b60b740d00",
            "bc5038f7-23e0-4960-96da-33abaf5935ec",
            "100",
        ],
    )?;
    run_cmd(
        "powercfg",
        &[
            "-setacvalueindex",
            "SCHEME_CURRENT",
            "2a737441-1930-4402-8d77-b2bebba308a3",
            "48e6e7a6-50f5-4782-a5d4-53bb8f07e7d0",
            "0",
        ],
    )?;
    run_cmd(
        "powercfg",
        &[
            "-setacvalueindex",
            "SCHEME_CURRENT",
            "5015d140-abb1-4453-9b36-a8ccc6dc5dfa",
            "ee12f906-d277-404b-b6da-e5fa1f576df5",
            "0",
        ],
    )?;
    run_cmd(
        "powercfg",
        &[
            "-setacvalueindex",
            "SCHEME_CURRENT",
            "4f971e90-ee38-47e2-96bc-df3a8b899b35",
            "7648efa3-dd9c-4e3e-b566-50f929386280",
            "0",
        ],
    )?;
    run_cmd(
        "powercfg",
        &[
            "-setacvalueindex",
            "SCHEME_CURRENT",
            "238c9fa8-0aad-41ed-83f4-97be242c8f20",
            "29f6c1db-86da-48c5-9fdb-f2b67b1f44da",
            "0",
        ],
    )?;
    run_cmd("powercfg", &["-setactive", "SCHEME_CURRENT"])?;

    run_ps(
        r#"
Get-NetAdapter -Physical | ForEach-Object {
  Disable-NetAdapterPowerManagement -Name $_.Name -ErrorAction SilentlyContinue
}
"#,
    )
    .ok();

    Ok("Power saving disabled on active plan: CPU min/max 100%, USB selective suspend off, PCIe ASPM off, disk never sleep, Wi-Fi/Ethernet power save off.".into())
}

pub fn revert_disable_power_saving() -> Result<String, String> {
    run_cmd(
        "powercfg",
        &["/setactive", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"],
    )?;
    Ok("High Performance plan re-applied (reset power saving overrides).".into())
}

pub fn scan_msi_devices() -> Result<String, String> {
    run_ps(
        r#"
Get-CimInstance Win32_PnPEntity |
  Where-Object { $_.Name -and $_.PNPDeviceID -match 'PCI|USB|NVMe|Ethernet|Audio|Display' } |
  Select-Object -First 12 Name, PNPDeviceID |
  ConvertTo-Json -Compress
"#,
    )
}
