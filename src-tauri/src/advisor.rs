use crate::hardware::{get_hardware_probe, gpu_info};
use crate::hardware_probe::HardwareProbe;
use crate::models::{AdvisorFinding, AdvisorScanGuide, GuideAdvisorResult, StepVerification};
use crate::platform::run_ps;
use std::path::Path;

pub fn run_advisor_scan(guides: Option<Vec<AdvisorScanGuide>>) -> Vec<GuideAdvisorResult> {
    let default_guides = default_scan_guides();
    let inputs: Vec<AdvisorScanGuide> = match guides {
        Some(list) if !list.is_empty() => list,
        _ => default_guides,
    };

    inputs
        .iter()
        .map(|input| GuideAdvisorResult {
            guide_id: input.guide_id.clone(),
            findings: scan_guide(&input.guide_id),
            steps: verify_guide_steps(&input.guide_id, &input.verify_keys),
        })
        .collect()
}

fn default_scan_guides() -> Vec<AdvisorScanGuide> {
    vec![
        AdvisorScanGuide {
            guide_id: "gpu-hags-advisor".into(),
            verify_keys: vec![
                None,
                Some("hags_registry_readable".into()),
                Some("hags_gpu_tuned".into()),
                None,
                None,
            ],
        },
        AdvisorScanGuide {
            guide_id: "cpu-undervolt".into(),
            verify_keys: vec![
                Some("undervolt_tool_installed".into()),
                None,
                None,
                None,
                None,
                None,
            ],
        },
        AdvisorScanGuide {
            guide_id: "adv-vbs-warn".into(),
            verify_keys: vec![
                None,
                Some("memory_integrity_readable".into()),
                None,
                Some("memory_integrity_gaming_choice".into()),
                None,
                None,
            ],
        },
        AdvisorScanGuide {
            guide_id: "adv-bios-xmp".into(),
            verify_keys: vec![
                Some("ram_speed_readable".into()),
                Some("ram_speed_matches_label".into()),
                None,
                Some("xmp_profile_enabled".into()),
                None,
                Some("ram_speed_confirmed".into()),
            ],
        },
    ]
}

fn scan_guide(id: &str) -> Vec<AdvisorFinding> {
    match id {
        "gpu-hags-advisor" => scan_hags(),
        "cpu-undervolt" => scan_cpu_undervolt(),
        "adv-vbs-warn" => scan_vbs(),
        "adv-bios-xmp" => scan_xmp(),
        _ => vec![],
    }
}

fn scan_hags() -> Vec<AdvisorFinding> {
    let probe = get_hardware_probe();
    let (gpu_name, gpu_vram) = gpu_info();

    let gpu_value = if gpu_vram != "—" {
        format!("{gpu_name} ({gpu_vram})")
    } else {
        gpu_name
    };

    let (hags_label, hags_status, hags_rec) = match probe.hags_enabled {
        Some(true) => (
            "Enabled",
            if is_modern_gpu(&probe.gpu_name) {
                "pass"
            } else {
                "info"
            },
            if is_modern_gpu(&probe.gpu_name) {
                "HAGS is ON. Benchmark your main game — if you see stutter, try disabling and compare 1% lows."
            } else {
                "HAGS is ON. On older GPUs, disabling may improve stability."
            },
        ),
        Some(false) => (
            "Disabled",
            if is_modern_gpu(&probe.gpu_name) {
                "warn"
            } else {
                "pass"
            },
            if is_modern_gpu(&probe.gpu_name) {
                "HAGS is OFF. Your GPU supports it — enable in Settings → Display → Graphics → Default graphics settings."
            } else {
                "HAGS is OFF — appropriate for older or integrated GPUs."
            },
        ),
        None => (
            "Not detected",
            "info",
            "Could not read HAGS registry key. Check Windows Graphics settings manually.",
        ),
    };

    vec![
        AdvisorFinding {
            label: "Detected GPU".into(),
            value: gpu_value,
            status: "info".into(),
            recommendation: String::new(),
        },
        AdvisorFinding {
            label: "HAGS Status".into(),
            value: hags_label.into(),
            status: hags_status.into(),
            recommendation: hags_rec.into(),
        },
        AdvisorFinding {
            label: "Driver".into(),
            value: probe.gpu_name.clone(),
            status: "info".into(),
            recommendation: "Keep GPU drivers updated via GeForce Experience or AMD Adrenalin.".into(),
        },
    ]
}

fn is_modern_gpu(name: &str) -> bool {
    name.contains("RTX")
        || name.contains("GTX 16")
        || name.contains("RX 6")
        || name.contains("RX 7")
        || name.contains("Arc")
}

fn scan_cpu_undervolt() -> Vec<AdvisorFinding> {
    let probe = get_hardware_probe();
    let is_intel = probe.cpu_name.to_ascii_lowercase().contains("intel");
    let is_amd = probe.cpu_name.to_ascii_lowercase().contains("amd");

    let tool = if is_intel {
        "Intel XTU or BIOS voltage offset"
    } else if is_amd {
        "AMD Ryzen Master or BIOS Curve Optimizer"
    } else {
        "Motherboard BIOS voltage offset"
    };

    let cores = if probe.cpu_cores > 0 && probe.cpu_threads > 0 {
        format!("{} cores / {} threads", probe.cpu_cores, probe.cpu_threads)
    } else {
        "—".to_string()
    };

    let clock = if probe.cpu_current_mhz > 0 {
        format!("{} MHz current", probe.cpu_current_mhz)
    } else if probe.cpu_max_mhz > 0 {
        format!("{} MHz base", probe.cpu_max_mhz)
    } else {
        "—".to_string()
    };

    vec![
        AdvisorFinding {
            label: "Detected CPU".into(),
            value: probe.cpu_name.clone(),
            status: "info".into(),
            recommendation: String::new(),
        },
        AdvisorFinding {
            label: "Core Layout".into(),
            value: cores,
            status: "info".into(),
            recommendation: String::new(),
        },
        AdvisorFinding {
            label: "Clock Speed".into(),
            value: clock,
            status: "info".into(),
            recommendation: String::new(),
        },
        AdvisorFinding {
            label: "Motherboard".into(),
            value: if probe.motherboard.trim().is_empty() {
                probe.system_manufacturer.clone()
            } else {
                probe.motherboard.clone()
            },
            status: "info".into(),
            recommendation: String::new(),
        },
        AdvisorFinding {
            label: "Undervolt Status".into(),
            value: "Not exposed via Windows API".into(),
            status: "info".into(),
            recommendation: format!(
                "Use {tool}. Lower voltage in small steps and stability-test after each change."
            ),
        },
    ]
}

fn scan_vbs() -> Vec<AdvisorFinding> {
    let probe = get_hardware_probe();

    let mi = match probe.memory_integrity {
        Some(true) => ("Enabled", "warn", "Memory integrity is ON — can cost 5–15% FPS on some CPUs."),
        Some(false) => ("Disabled", "pass", "Memory integrity is OFF — max gaming performance, reduced security."),
        None => ("Unknown", "info", "Open Windows Security → Device security → Core isolation."),
    };

    let vbs = match probe.vbs_enabled {
        Some(true) => ("Enabled", "warn", "VBS is active. Disabling requires reboot and reduces security."),
        Some(false) => (
            "Disabled",
            "pass",
            "VBS is not active — good for raw gaming performance.",
        ),
        None => ("Not configured", "info", "VBS status could not be read from registry."),
    };

    vec![
        AdvisorFinding {
            label: "Memory Integrity".into(),
            value: mi.0.into(),
            status: mi.1.into(),
            recommendation: mi.2.into(),
        },
        AdvisorFinding {
            label: "VBS".into(),
            value: vbs.0.into(),
            status: vbs.1.into(),
            recommendation: vbs.2.into(),
        },
    ]
}

fn scan_xmp() -> Vec<AdvisorFinding> {
    let probe = get_hardware_probe();
    let running = probe.memory_speed_mhz;
    let rated = probe.memory_rated_mhz;
    let mem_type = if probe.memory_type.trim().is_empty() {
        "DDR".to_string()
    } else {
        probe.memory_type.clone()
    };

    let mut findings = vec![
        AdvisorFinding {
            label: "Memory Type".into(),
            value: mem_type.clone(),
            status: "info".into(),
            recommendation: String::new(),
        },
        AdvisorFinding {
            label: "Running Speed".into(),
            value: if running > 0 {
                format!("{running} MHz")
            } else {
                "Not detected".into()
            },
            status: "info".into(),
            recommendation: String::new(),
        },
    ];

    if rated > 0 {
        findings.push(AdvisorFinding {
            label: "Rated Speed (SPD)".into(),
            value: format!("{rated} MHz"),
            status: "info".into(),
            recommendation: String::new(),
        });
    }

    if !probe.memory_manufacturer.trim().is_empty() {
        findings.push(AdvisorFinding {
            label: "RAM Manufacturer".into(),
            value: probe.memory_manufacturer.trim().to_string(),
            status: "info".into(),
            recommendation: String::new(),
        });
    }

    let (status, recommendation) = if running > 0 && rated > 0 {
        if running >= rated {
            (
                "pass",
                "RAM is running at or above its rated SPD speed — XMP/EXPO appears enabled.",
            )
        } else if mem_type == "DDR5" && running <= 4800 {
            (
                "warn",
                "DDR5 running at JEDEC 4800 MHz while kit is rated higher. Enable XMP/EXPO in BIOS.",
            )
        } else if mem_type == "DDR4" && running < 2667 {
            (
                "warn",
                "DDR4 below 2667 MHz — XMP may be disabled. Enable XMP Profile 1 in BIOS.",
            )
        } else {
            (
                "info",
                "Running speed is below rated SPD. Check XMP/EXPO in BIOS if you expect higher MHz.",
            )
        }
    } else {
        ("info", "Open Task Manager → Performance → Memory to verify speed.")
    };

    findings.push(AdvisorFinding {
        label: "XMP / EXPO Status".into(),
        value: if running > 0 && rated > 0 && running >= rated {
            "Likely enabled".into()
        } else if running > 0 && rated > 0 {
            "May be disabled".into()
        } else {
            "Unknown".into()
        },
        status: status.into(),
        recommendation: recommendation.into(),
    });

    findings
}

fn verify_guide_steps(_guide_id: &str, verify_keys: &[Option<String>]) -> Vec<StepVerification> {
    let probe = get_hardware_probe();
    verify_keys
        .iter()
        .enumerate()
        .filter_map(|(step_index, key)| {
            let verify_key = key.as_deref()?;
            let (status, detail) = verify_step(verify_key, &probe);
            Some(StepVerification {
                step_index,
                verify_key: verify_key.to_string(),
                status: status.to_string(),
                detail: detail.to_string(),
            })
        })
        .collect()
}

fn verify_step(key: &str, probe: &HardwareProbe) -> (&'static str, String) {
    match key {
        "hags_registry_readable" => match probe.hags_enabled {
            Some(true) => ("verified", "อ่าน registry ได้ — HAGS เปิดอยู่".into()),
            Some(false) => ("verified", "อ่าน registry ได้ — HAGS ปิดอยู่".into()),
            None => (
                "pending",
                "อ่านค่า HAGS ไม่ได้ — เปิด Settings → Display → Graphics แล้วตรวจด้วยตนเอง"
                    .into(),
            ),
        },
        "hags_gpu_tuned" => {
            let modern = is_modern_gpu(&probe.gpu_name);
            match (modern, probe.hags_enabled) {
                (true, Some(true)) => (
                    "verified",
                    "GPU รุ่นใหม่ + HAGS เปิด — ตรงคำแนะนำสำหรับ RTX/RX".into(),
                ),
                (true, Some(false)) => (
                    "pending",
                    "GPU รุ่นใหม่แต่ HAGS ยังปิด — ลองเปิดแล้วเทียบ 1% low FPS".into(),
                ),
                (false, Some(false)) => (
                    "verified",
                    "GPU รุ่นเก่า + HAGS ปิด — เหมาะกับความเสถียร".into(),
                ),
                (false, Some(true)) => (
                    "pending",
                    "GPU รุ่นเก่าแต่ HAGS เปิด — พิจารณาปิดถ้าเกมกระตุก".into(),
                ),
                (_, None) => ("pending", "ยังไม่ทราบสถานะ HAGS — ตรวจใน Windows Settings".into()),
            }
        }
        "undervolt_tool_installed" => {
            let (found, name) = detect_undervolt_tool(probe);
            if found {
                ("verified", format!("พบเครื่องมือ: {name}"))
            } else {
                let hint = if probe.cpu_name.to_ascii_lowercase().contains("intel") {
                    "ติดตั้ง Intel XTU หรือใช้ BIOS voltage offset"
                } else if probe.cpu_name.to_ascii_lowercase().contains("amd") {
                    "ติดตั้ง AMD Ryzen Master หรือใช้ BIOS Curve Optimizer"
                } else {
                    "ติดตั้งเครื่องมือ undervolt ของค่าย mainboard"
                };
                ("pending", hint.into())
            }
        }
        "memory_integrity_readable" => match probe.memory_integrity {
            Some(true) => ("verified", "อ่านค่าได้ — Memory Integrity เปิดอยู่".into()),
            Some(false) => ("verified", "อ่านค่าได้ — Memory Integrity ปิดอยู่".into()),
            None => (
                "pending",
                "อ่านค่าไม่ได้ — เปิด Windows Security → Core isolation".into(),
            ),
        },
        "memory_integrity_gaming_choice" => match probe.memory_integrity {
            Some(false) => (
                "verified",
                "Memory Integrity ปิดแล้ว — เหมาะกับ max gaming performance".into(),
            ),
            Some(true) => (
                "pending",
                "Memory Integrity ยังเปิด — ปิดถ้าต้องการ FPS สูงสุด (ลดความปลอดภัย)".into(),
            ),
            None => ("pending", "ตรวจสถานะ Memory Integrity ใน Windows Security".into()),
        },
        "ram_speed_readable" => {
            if probe.memory_speed_mhz > 0 {
                (
                    "verified",
                    format!(
                        "อ่านความเร็ว RAM ได้ — {} MHz",
                        probe.memory_speed_mhz
                    ),
                )
            } else {
                (
                    "pending",
                    "อ่านความเร็ว RAM ไม่ได้ — เปิด Task Manager → Performance → Memory"
                        .into(),
                )
            }
        }
        "ram_speed_matches_label" | "ram_speed_confirmed" => xmp_speed_verdict(probe),
        "xmp_profile_enabled" => xmp_speed_verdict(probe),
        _ => ("manual", "ขั้นตอนนี้ต้องทำด้วยตนเอง — ติ๊กเมื่อทำเสร็จ".into()),
    }
}

fn xmp_speed_verdict(probe: &HardwareProbe) -> (&'static str, String) {
    let running = probe.memory_speed_mhz;
    let rated = probe.memory_rated_mhz;
    if running > 0 && rated > 0 {
        if running >= rated {
            (
                "verified",
                format!("RAM รันที่ {running} MHz (rated {rated} MHz) — XMP/EXPO น่าจะเปิดแล้ว"),
            )
        } else {
            (
                "failed",
                format!(
                    "RAM รัน {running} MHz แต่ rated {rated} MHz — เปิด XMP/EXPO ใน BIOS"
                ),
            )
        }
    } else if running > 0 {
        (
            "pending",
            format!("รัน {running} MHz — เปรียบเทียบกับสติกเกอร์บนแรม"),
        )
    } else {
        ("pending", "ยังอ่านความเร็ว RAM ไม่ได้".into())
    }
}

fn detect_undervolt_tool(probe: &HardwareProbe) -> (bool, String) {
    let is_intel = probe.cpu_name.to_ascii_lowercase().contains("intel");
    let is_amd = probe.cpu_name.to_ascii_lowercase().contains("amd");

    let candidates: Vec<(&str, &str)> = if is_intel {
        vec![
            (
                "Intel XTU",
                r"C:\Program Files\Intel\Intel(R) Extreme Tuning Utility\Client\XTUCli.exe",
            ),
            (
                "Intel XTU",
                r"C:\Program Files (x86)\Intel\Intel(R) Extreme Tuning Utility\Client\XTUCli.exe",
            ),
        ]
    } else if is_amd {
        vec![
            ("AMD Ryzen Master", r"C:\Program Files\AMD\RyzenMaster\bin\RyzenMaster.exe"),
            (
                "AMD Ryzen Master",
                r"C:\Program Files\AMD\RyzenMaster\RyzenMaster.exe",
            ),
        ]
    } else {
        vec![]
    };

    for (name, path) in &candidates {
        if Path::new(path).exists() {
            return (true, (*name).to_string());
        }
    }

    if run_ps(
        r#"
$names = @('XTUCli','RyzenMasterService','RyzenMaster')
Get-Process -Name $names -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Name
"#,
    )
    .map(|s| !s.trim().is_empty())
    .unwrap_or(false)
    {
        return (true, "Undervolt tool (running process)".into());
    }

    (false, String::new())
}
