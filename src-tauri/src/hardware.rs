use crate::hardware_probe::{fmt_vram, get_probe, invalidate_probe_cache, or_dash, HardwareProbe};
use crate::store::AppStore;
use crate::tweaks;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct SystemInfo {
    pub username: String,
    pub performance_score: u32,
    pub cpu_name: String,
    pub cpu_cores: usize,
    pub cpu_physical_cores: usize,
    pub gpu_name: String,
    pub gpu_vram_gb: String,
    pub memory_total_gb: String,
    pub memory_type: String,
    pub os_name: String,
    pub os_version: String,
    pub storage_name: String,
    pub storage_total_gb: String,
    pub tweaks_total: u32,
    pub tweaks_active: u32,
    pub power_plan: String,
    pub game_mode_enabled: bool,
    pub bios_manufacturer: String,
    pub bios_version: String,
    pub bios_serial: String,
    pub bios_release_date: String,
    pub dram_speed_mhz: String,
    pub processor_speed_mhz: String,
}

pub fn collect_system_info() -> SystemInfo {
    let probe = get_probe();
    let tweaks_active = AppStore::global().applied_ids().len() as u32;
    let memory_gb = if probe.memory_total_gb > 0.0 {
        probe.memory_total_gb
    } else {
        16.0
    };

    SystemInfo {
        username: std::env::var("USERNAME").unwrap_or_else(|_| "User".to_string()),
        performance_score: compute_performance_score(
            &probe.power_plan,
            probe.game_mode_enabled,
            memory_gb,
        ),
        cpu_name: or_dash(&probe.cpu_name),
        cpu_cores: effective_cpu_display_cores(&probe),
        cpu_physical_cores: if probe.cpu_cores > 0 {
            probe.cpu_cores as usize
        } else {
            1
        },
        gpu_name: or_dash(&probe.gpu_name),
        gpu_vram_gb: fmt_vram(probe.gpu_vram_gb),
        memory_total_gb: if probe.memory_total_gb > 0.0 {
            format!("{:.2}", probe.memory_total_gb)
        } else {
            "—".to_string()
        },
        memory_type: memory_type_label(&probe),
        os_name: or_dash(&probe.os_name),
        os_version: or_dash(&probe.os_version),
        storage_name: storage_label(&probe),
        storage_total_gb: if probe.disk_size_gb > 0.0 {
            format!("{:.1}", probe.disk_size_gb)
        } else {
            "—".to_string()
        },
        tweaks_total: tweaks::applicable_tweak_count(),
        tweaks_active,
        power_plan: or_dash(&probe.power_plan),
        game_mode_enabled: probe.game_mode_enabled,
        bios_manufacturer: or_dash(&probe.bios_manufacturer),
        bios_version: or_dash(&probe.bios_version),
        bios_serial: or_dash(&probe.bios_serial),
        bios_release_date: or_dash(&probe.bios_release_date),
        dram_speed_mhz: if probe.memory_speed_mhz > 0 {
            probe.memory_speed_mhz.to_string()
        } else {
            "—".to_string()
        },
        processor_speed_mhz: processor_speed_label(&probe),
    }
}

pub fn invalidate_dynamic_cache() {
    invalidate_probe_cache();
}

pub fn gpu_info() -> (String, String) {
    let probe = get_probe();
    (
        or_dash(&probe.gpu_name),
        fmt_vram(probe.gpu_vram_gb),
    )
}

pub fn get_hardware_probe() -> HardwareProbe {
    get_probe()
}

fn effective_cpu_display_cores(probe: &HardwareProbe) -> usize {
    if probe.cpu_threads > 0 {
        probe.cpu_threads as usize
    } else if probe.cpu_cores > 0 {
        probe.cpu_cores as usize
    } else {
        1
    }
}

fn memory_type_label(probe: &HardwareProbe) -> String {
    let mut label = or_dash(&probe.memory_type);
    if !probe.memory_manufacturer.trim().is_empty() && label != "—" {
        label = format!("{} · {}", label, probe.memory_manufacturer.trim());
    }
    label
}

fn storage_label(probe: &HardwareProbe) -> String {
    if !probe.disk_model.trim().is_empty() {
        probe.disk_model.trim().to_string()
    } else {
        "—".to_string()
    }
}

fn processor_speed_label(probe: &HardwareProbe) -> String {
    if probe.cpu_current_mhz > 0 {
        probe.cpu_current_mhz.to_string()
    } else if probe.cpu_max_mhz > 0 {
        probe.cpu_max_mhz.to_string()
    } else {
        "—".to_string()
    }
}

fn compute_performance_score(power_plan: &str, game_mode: bool, memory_gb: f64) -> u32 {
    let mut score: i32 = 55;

    let plan_lower = power_plan.to_lowercase();
    if plan_lower.contains("ultimate") || plan_lower.contains("high performance") {
        score += 20;
    } else if plan_lower.contains("balanced") {
        score += 8;
    }

    if game_mode {
        score += 10;
    }

    if memory_gb >= 32.0 {
        score += 10;
    } else if memory_gb >= 16.0 {
        score += 6;
    } else if memory_gb >= 8.0 {
        score += 3;
    }

    score.clamp(0, 100) as u32
}
