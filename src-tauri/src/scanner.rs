use crate::hardware;
use crate::models::{ScanFinding, ScanResult};
use crate::store::AppStore;

pub fn run_scan() -> ScanResult {
    let info = hardware::collect_system_info();
    let probe = hardware::get_hardware_probe();
    let mut findings = Vec::new();
    let mut issues = 0u32;

    let game_mode = info.game_mode_enabled;
    findings.push(ScanFinding {
        id: "game-mode".into(),
        category: "windows".into(),
        title: "Game Mode".into(),
        status: if game_mode { "ok".into() } else { "warn".into() },
        detail: if game_mode {
            "Game Mode is enabled (registry verified).".into()
        } else {
            "Game Mode is disabled.".into()
        },
        recommendation: if game_mode {
            "No action needed.".into()
        } else {
            "Enable Game Mode in Tweaks.".into()
        },
    });
    if !game_mode {
        issues += 1;
    }

    let plan = info.power_plan.to_lowercase();
    let power_ok = plan.contains("high") || plan.contains("ultimate");
    findings.push(ScanFinding {
        id: "power-plan".into(),
        category: "power".into(),
        title: "Power Plan".into(),
        status: if power_ok { "ok".into() } else { "warn".into() },
        detail: format!("Active plan: {}", info.power_plan),
        recommendation: if power_ok {
            "Power plan is performance-oriented.".into()
        } else {
            "Switch to High Performance in Tweaks.".into()
        },
    });
    if !power_ok {
        issues += 1;
    }

    let mem_gb: f64 = info.memory_total_gb.parse().unwrap_or(0.0);
    findings.push(ScanFinding {
        id: "memory".into(),
        category: "hardware".into(),
        title: "System Memory".into(),
        status: if mem_gb >= 16.0 { "ok".into() } else { "warn".into() },
        detail: format!(
            "{} GB {} @ {} MHz",
            info.memory_total_gb,
            probe.memory_type,
            if probe.memory_speed_mhz > 0 {
                probe.memory_speed_mhz.to_string()
            } else {
                "—".into()
            }
        ),
        recommendation: if mem_gb >= 16.0 {
            "Sufficient for competitive gaming.".into()
        } else {
            "16GB+ recommended for modern titles.".into()
        },
    });
    if mem_gb < 16.0 {
        issues += 1;
    }

    findings.push(ScanFinding {
        id: "gpu".into(),
        category: "hardware".into(),
        title: "Graphics".into(),
        status: if info.gpu_name != "—" { "ok".into() } else { "warn".into() },
        detail: format!("{} · {}", info.gpu_name, info.gpu_vram_gb),
        recommendation: if probe.hags_enabled == Some(false) && info.gpu_name.contains("RTX") {
            "HAGS is disabled — consider enabling for DX12 latency.".into()
        } else {
            "Keep GPU drivers up to date.".into()
        },
    });

    let dvr_disabled = check_dvr_disabled();
    findings.push(ScanFinding {
        id: "game-dvr".into(),
        category: "windows".into(),
        title: "Xbox Game DVR".into(),
        status: if dvr_disabled { "ok".into() } else { "warn".into() },
        detail: if dvr_disabled {
            "Background recording is off (registry verified).".into()
        } else {
            "Game DVR may add latency overhead.".into()
        },
        recommendation: if dvr_disabled {
            "No action needed.".into()
        } else {
            "Disable Game DVR in Tweaks or Competitive Boost.".into()
        },
    });
    if !dvr_disabled {
        issues += 1;
    }

    let vbs = probe.memory_integrity == Some(true) || probe.vbs_enabled == Some(true);
    findings.push(ScanFinding {
        id: "vbs".into(),
        category: "security".into(),
        title: "Memory Integrity / VBS".into(),
        status: if vbs { "info".into() } else { "ok".into() },
        detail: if probe.memory_integrity == Some(true) {
            "Memory integrity is enabled.".into()
        } else if probe.vbs_enabled == Some(true) {
            "VBS is enabled.".into()
        } else {
            "Security features off or not detected.".into()
        },
        recommendation: if vbs {
            "May cost 5–15% FPS on some CPUs. See Expert Guide.".into()
        } else {
            "No FPS penalty from VBS detected.".into()
        },
    });

    if probe.memory_speed_mhz > 0
        && probe.memory_rated_mhz > 0
        && probe.memory_speed_mhz < probe.memory_rated_mhz
    {
        issues += 1;
        findings.push(ScanFinding {
            id: "xmp".into(),
            category: "hardware".into(),
            title: "RAM Speed".into(),
            status: "warn".into(),
            detail: format!(
                "Running {} MHz, rated {} MHz — XMP/EXPO may be off",
                probe.memory_speed_mhz, probe.memory_rated_mhz
            ),
            recommendation: "Enable XMP/EXPO in BIOS.".into(),
        });
    }

    let applied = AppStore::global().applied_ids().len();
    findings.push(ScanFinding {
        id: "tweaks".into(),
        category: "optimizer".into(),
        title: "Active Optimizations".into(),
        status: if applied > 0 { "ok".into() } else { "info".into() },
        detail: format!("{applied} tweaks currently applied by FPS Unleashed"),
        recommendation: if applied > 0 {
            "Review Rollback Center before major changes.".into()
        } else {
            "Run Safe Boost or enable individual Tweaks.".into()
        },
    });

    let (fps_gain, latency_gain, stability_risk, recommended_mode) = if issues == 0 {
        ("Low".into(), "Low".into(), "Low".into(), "Maintenance".into())
    } else if issues <= 2 {
        ("Medium".into(), "Medium".into(), "Low".into(), "Safe Boost".into())
    } else if issues <= 4 {
        ("High".into(), "High".into(), "Medium".into(), "Competitive Boost".into())
    } else {
        ("High".into(), "High".into(), "Medium".into(), "Competitive Boost".into())
    };

    ScanResult {
        findings,
        fps_gain,
        latency_gain,
        stability_risk,
        recommended_mode,
        performance_score: info.performance_score,
    }
}

fn check_dvr_disabled() -> bool {
    use crate::platform::run_cmd;

    run_cmd(
        "reg",
        &[
            "query",
            r"HKCU\System\GameConfigStore",
            "/v",
            "GameDVR_Enabled",
        ],
    )
    .map(|out| out.contains("0x0"))
    .unwrap_or(false)
}
