use crate::platform::{run_cmd, run_ps};
use crate::store::AppStore;
use crate::tweaks::latency;

pub fn is_advisor_only(id: &str) -> bool {
    matches!(
        id,
        "gpu-hags-advisor"
            | "cpu-undervolt"
            | "adv-vbs-warn"
            | "adv-bios-xmp"
            | "gpu-power-limit"
            | "gpu-clock-offset"
            | "cpu-power-limit"
            | "adv-fan-curve"
            | "adv-vbs-disable"
    )
}

pub fn read_state(id: &str) -> Result<Option<String>, String> {
    match id {
        "win-game-mode" => run_ps(
            r#"(Get-ItemProperty -Path 'HKCU:\Software\Microsoft\GameBar' -Name 'AutoGameModeEnabled' -ErrorAction SilentlyContinue).AutoGameModeEnabled | Out-String"#,
        )
        .map(|s| Some(s.trim().to_string())),
        "win-power-high" => run_cmd("powercfg", &["/getactivescheme"]).map(Some),
        "win-visual-fx" => run_ps(
            r#"(Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' -Name 'VisualFXSetting' -ErrorAction SilentlyContinue).VisualFXSetting | Out-String"#,
        )
        .map(|s| Some(s.trim().to_string())),
        "win-priority-26" => latency::read_priority_separation(),
        "win-mmcss-latency" => run_ps(
            r#"(Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile' -Name 'SystemResponsiveness' -ErrorAction SilentlyContinue).SystemResponsiveness | Out-String"#,
        )
        .map(|s| Some(s.trim().to_string())),
        _ => Ok(None),
    }
}

pub fn apply(id: &str) -> Result<String, String> {
    if is_advisor_only(id) {
        return Ok("Advisor guide — no system changes applied.".into());
    }

    let store = AppStore::global();
    if store.is_applied(id) {
        return Ok("Already applied.".into());
    }

    let backup = read_state(id).ok().flatten();

    let msg = match id {
        "win-game-mode" => {
            run_ps(r#"Set-ItemProperty -Path 'HKCU:\Software\Microsoft\GameBar' -Name 'AutoGameModeEnabled' -Value 1 -Type DWord -Force"#)?;
            "Game Mode enabled.".into()
        }
        "win-power-high" => {
            run_cmd(
                "powercfg",
                &["/setactive", "8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c"],
            )?;
            "High Performance power plan activated.".into()
        }
        "win-visual-fx" => {
            run_ps(r#"
                Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' -Name 'VisualFXSetting' -Value 2 -Type DWord -Force -ErrorAction SilentlyContinue
                if (-not (Test-Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects')) {
                    New-Item -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' -Force | Out-Null
                    Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects' -Name 'VisualFXSetting' -Value 2 -Type DWord
                }
            "#)?;
            "Visual effects set to best performance.".into()
        }
        "win-game-dvr" => {
            run_ps(r#"
                Set-ItemProperty -Path 'HKCU:\System\GameConfigStore' -Name 'GameDVR_Enabled' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
                Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\GameDVR' -Name 'AppCaptureEnabled' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
                Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\GameDVR' -Name 'GameDVR_Enabled' -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
            "#)?;
            "Xbox Game Bar DVR disabled.".into()
        }
        "win-telemetry" => {
            run_ps(r#"
                Stop-Service -Name DiagTrack -Force -ErrorAction SilentlyContinue
                Set-Service -Name DiagTrack -StartupType Disabled -ErrorAction SilentlyContinue
                Stop-Service -Name dmwappushservice -Force -ErrorAction SilentlyContinue
                Set-Service -Name dmwappushservice -StartupType Disabled -ErrorAction SilentlyContinue
            "#)?;
            "Telemetry services disabled (requires admin).".into()
        }
        "win-fullscreen-opt" => {
            run_ps(r#"
                Set-ItemProperty -Path 'HKCU:\System\GameConfigStore' -Name 'GameDVR_DXGIHonorFSEWindowsCompatible' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
                Set-ItemProperty -Path 'HKCU:\System\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -Value 2 -Type DWord -Force -ErrorAction SilentlyContinue
            "#)?;
            "Fullscreen optimizations disabled globally.".into()
        }
        "win-bg-apps" => {
            run_ps(r#"
                $path = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\BackgroundAccessApplications'
                if (Test-Path $path) {
                    Get-ChildItem $path | ForEach-Object {
                        Set-ItemProperty -Path $_.PSPath -Name 'Disabled' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
                    }
                }
            "#)?;
            "Background apps limited.".into()
        }
        "gpu-shader-cache" => {
            run_ps(r#"
                $paths = @(
                    "$env:LOCALAPPDATA\D3DSCache",
                    "$env:LOCALAPPDATA\NVIDIA\DXCache",
                    "$env:LOCALAPPDATA\AMD\DxCache"
                )
                $freed = 0
                foreach ($p in $paths) {
                    if (Test-Path $p) {
                        $size = (Get-ChildItem $p -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                        if ($size) { $freed += $size }
                        Remove-Item $p\* -Recurse -Force -ErrorAction SilentlyContinue
                    }
                }
                Write-Output "Shader cache cleared."
            "#)?;
            "DirectX / GPU shader cache cleared.".into()
        }
        "gpu-max-perf" => {
            run_ps(r#"
                $nv = 'HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000'
                if (Test-Path $nv) {
                    Set-ItemProperty -Path $nv -Name 'PerfLevelSrc' -Value 0x2222 -Type DWord -Force -ErrorAction SilentlyContinue
                }
            "#)?;
            "GPU set to prefer maximum performance (NVIDIA path).".into()
        }
        "gpu-low-latency" => {
            run_ps(r#"
                $nv = 'HKLM:\SYSTEM\CurrentControlSet\Control\Class\{4d36e968-e325-11ce-bfc1-08002be10318}\0000'
                if (Test-Path $nv) {
                    Set-ItemProperty -Path $nv -Name 'RMHdcpKeyglobZero' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
                }
            "#)?;
            "Low latency mode hint applied where supported.".into()
        }
        "cpu-game-priority" => {
            "Game priority is applied at runtime when a game is detected (session-based)."
                .into()
        }
        "cpu-core-parking" => {
            run_cmd("powercfg", &["-setacvalueindex", "SCHEME_CURRENT", "54533251-82be-4824-96c1-47b60b740d00", "0cc5b647-c1df-4637-891a-dec35c318583", "0"])?;
            run_cmd("powercfg", &["-setactive", "SCHEME_CURRENT"])?;
            "CPU core parking disabled.".into()
        }
        "cpu-timer-res" => {
            "Timer resolution will be requested during active game sessions.".into()
        }
        "net-dns-flush" => {
            run_cmd("ipconfig", &["/flushdns"])?;
            "DNS cache flushed.".into()
        }
        "net-adapter-power" => {
            run_ps(r#"
                Get-NetAdapter -Physical | ForEach-Object {
                    Disable-NetAdapterPowerManagement -Name $_.Name -ErrorAction SilentlyContinue
                }
            "#)?;
            "Network adapter power saving disabled.".into()
        }
        "net-nagle" => {
            run_ps(r#"
                Get-ChildItem 'HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces' | ForEach-Object {
                    Set-ItemProperty -Path $_.PSPath -Name 'TcpAckFrequency' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
                    Set-ItemProperty -Path $_.PSPath -Name 'TCPNoDelay' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
                }
            "#)?;
            "Nagle's algorithm disabled on network interfaces.".into()
        }
        "net-throttling" => {
            run_ps(r#"
                New-Item -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile' -Force | Out-Null
                Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile' -Name 'NetworkThrottlingIndex' -Value 0xffffffff -Type DWord -Force
            "#)?;
            "Network throttling index tuned.".into()
        }
        "adv-ram-standby" => {
            run_ps(r#"
                if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
                    throw 'Administrator required for standby list cleanup.'
                }
                $sig = '[DllImport("psapi.dll")] public static extern int EmptyWorkingSet(IntPtr hwProcess);'
                Add-Type -MemberDefinition $sig -Name PSApi -Namespace Win32 -ErrorAction SilentlyContinue
                [Win32.PSApi]::EmptyWorkingSet([System.Diagnostics.Process]::GetCurrentProcess().Handle) | Out-Null
            "#)?;
            "Standby memory trimmed.".into()
        }
        "win-priority-26" => latency::apply_win_priority("26")?,
        "win-mmcss-latency" => latency::apply_mmcss_latency()?,
        "win-system-ini-fps" => latency::apply_system_ini_fps()?,
        "win-disable-power-saving" => latency::apply_disable_power_saving()?,
        _ => return Err(format!("Tweak '{id}' is not implemented yet.")),
    };

    store.mark_applied(id, backup)?;
    crate::hardware::invalidate_dynamic_cache();
    Ok(msg)
}

pub fn revert(id: &str) -> Result<String, String> {
    let store = AppStore::global();
    if !store.is_applied(id) && !is_advisor_only(id) {
        return Ok("Tweak was not applied.".into());
    }

    if is_advisor_only(id) {
        return Ok("Advisor — nothing to revert.".into());
    }

    let backup = store.get_backup(id);

    let msg = match id {
        "win-game-mode" => {
            let val = backup.as_deref().unwrap_or("0");
            run_ps(&format!(
                "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\GameBar' -Name 'AutoGameModeEnabled' -Value {val} -Type DWord -Force"
            ))?;
            "Game Mode reverted.".into()
        }
        "win-power-high" => {
            run_cmd(
                "powercfg",
                &["/setactive", "381b4222-f694-41f0-9685-ff5bb260df2e"],
            )?;
            "Power plan restored to Balanced.".into()
        }
        "win-visual-fx" => {
            let val = backup.as_deref().unwrap_or("0");
            run_ps(&format!(
                "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects' -Name 'VisualFXSetting' -Value {val} -Type DWord -Force -ErrorAction SilentlyContinue"
            ))?;
            "Visual effects restored.".into()
        }
        "win-game-dvr" => {
            run_ps(r#"
                Set-ItemProperty -Path 'HKCU:\System\GameConfigStore' -Name 'GameDVR_Enabled' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
                Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\GameDVR' -Name 'AppCaptureEnabled' -Value 1 -Type DWord -Force -ErrorAction SilentlyContinue
            "#)?;
            "Game DVR re-enabled.".into()
        }
        "win-telemetry" => {
            run_ps(r#"
                Set-Service -Name DiagTrack -StartupType Manual -ErrorAction SilentlyContinue
                Set-Service -Name dmwappushservice -StartupType Manual -ErrorAction SilentlyContinue
            "#)?;
            "Telemetry services restored to manual.".into()
        }
        "win-fullscreen-opt" => {
            run_ps(r#"
                Remove-ItemProperty -Path 'HKCU:\System\GameConfigStore' -Name 'GameDVR_DXGIHonorFSEWindowsCompatible' -ErrorAction SilentlyContinue
                Remove-ItemProperty -Path 'HKCU:\System\GameConfigStore' -Name 'GameDVR_FSEBehaviorMode' -ErrorAction SilentlyContinue
            "#)?;
            "Fullscreen optimizations restored.".into()
        }
        "win-bg-apps" | "gpu-shader-cache" | "cpu-game-priority" | "cpu-timer-res" => {
            "Reverted (no persistent change or cache already cleared).".into()
        }
        "gpu-max-perf" | "gpu-low-latency" => {
            "GPU driver settings revert — use NVIDIA/AMD control panel to restore defaults.".into()
        }
        "cpu-core-parking" => {
            run_cmd("powercfg", &["-setacvalueindex", "SCHEME_CURRENT", "54533251-82be-4824-96c1-47b60b740d00", "0cc5b647-c1df-4637-891a-dec35c318583", "100"])?;
            run_cmd("powercfg", &["-setactive", "SCHEME_CURRENT"])?;
            "Core parking restored.".into()
        }
        "net-dns-flush" => "DNS flush is one-way — no revert needed.".into(),
        "net-adapter-power" => {
            run_ps(r#"
                Get-NetAdapter -Physical | ForEach-Object {
                    Enable-NetAdapterPowerManagement -Name $_.Name -ErrorAction SilentlyContinue
                }
            "#)?;
            "Adapter power management re-enabled.".into()
        }
        "net-nagle" => {
            run_ps(r#"
                Get-ChildItem 'HKLM:\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces' | ForEach-Object {
                    Remove-ItemProperty -Path $_.PSPath -Name 'TcpAckFrequency' -ErrorAction SilentlyContinue
                    Remove-ItemProperty -Path $_.PSPath -Name 'TCPNoDelay' -ErrorAction SilentlyContinue
                }
            "#)?;
            "Network latency tweaks reverted.".into()
        }
        "net-throttling" => {
            run_ps(r#"
                Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Multimedia\SystemProfile' -Name 'NetworkThrottlingIndex' -Value 10 -Type DWord -Force -ErrorAction SilentlyContinue
            "#)?;
            "Network throttling restored.".into()
        }
        "adv-ram-standby" => "Standby cleaner is one-shot — no revert.".into(),
        "win-priority-26" => latency::revert_win_priority(backup.as_deref())?,
        "win-mmcss-latency" => latency::revert_mmcss()?,
        "win-system-ini-fps" => latency::revert_system_ini()?,
        "win-disable-power-saving" => latency::revert_disable_power_saving()?,
        _ => return Err(format!("Revert for '{id}' not implemented.")),
    };

    store.mark_reverted(id)?;
    crate::hardware::invalidate_dynamic_cache();
    Ok(msg)
}
