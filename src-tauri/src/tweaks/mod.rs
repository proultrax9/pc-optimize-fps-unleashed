pub mod handlers;
pub mod latency;

use crate::models::{ApplyBoostResult, CommandResult, FailedTweak, TweakState};
use crate::store::AppStore;
use handlers::{apply, is_advisor_only, revert};

const ALL_TWEAK_IDS: &[&str] = &[
    "win-game-mode",
    "win-power-high",
    "win-visual-fx",
    "win-game-dvr",
    "win-telemetry",
    "win-fullscreen-opt",
    "win-bg-apps",
    "gpu-shader-cache",
    "gpu-max-perf",
    "gpu-low-latency",
    "gpu-hags-advisor",
    "gpu-power-limit",
    "gpu-clock-offset",
    "cpu-game-priority",
    "cpu-core-parking",
    "cpu-timer-res",
    "cpu-undervolt",
    "cpu-power-limit",
    "net-dns-flush",
    "net-adapter-power",
    "net-nagle",
    "net-throttling",
    "adv-fan-curve",
    "adv-ram-standby",
    "adv-vbs-warn",
    "adv-vbs-disable",
    "adv-bios-xmp",
    "win-priority-26",
    "win-mmcss-latency",
    "win-system-ini-fps",
    "win-disable-power-saving",
];

pub fn boost_tweak_ids(preset: &str) -> Vec<&'static str> {
    match preset {
        "safe" => vec![
            "win-game-mode",
            "win-power-high",
            "win-visual-fx",
            "win-bg-apps",
            "gpu-shader-cache",
            "cpu-game-priority",
            "net-dns-flush",
        ],
        "competitive" => vec![
            "win-game-mode",
            "win-power-high",
            "win-visual-fx",
            "win-game-dvr",
            "win-telemetry",
            "win-fullscreen-opt",
            "win-bg-apps",
            "gpu-shader-cache",
            "gpu-max-perf",
            "gpu-low-latency",
            "cpu-game-priority",
            "cpu-timer-res",
            "net-dns-flush",
            "net-adapter-power",
            "net-nagle",
            "win-disable-power-saving",
            "win-priority-26",
            "win-mmcss-latency",
        ],
        "extreme" => vec![
            "win-game-mode",
            "win-power-high",
            "win-visual-fx",
            "win-game-dvr",
            "win-telemetry",
            "win-fullscreen-opt",
            "win-bg-apps",
            "gpu-shader-cache",
            "gpu-max-perf",
            "gpu-low-latency",
            "cpu-game-priority",
            "cpu-core-parking",
            "cpu-timer-res",
            "net-dns-flush",
            "net-adapter-power",
            "net-nagle",
            "net-throttling",
            "win-priority-26",
            "win-mmcss-latency",
            "win-system-ini-fps",
            "win-disable-power-saving",
            "adv-ram-standby",
        ],
        "expert" => vec![
            "gpu-hags-advisor",
            "cpu-undervolt",
            "adv-vbs-warn",
            "adv-bios-xmp",
        ],
        _ => vec![],
    }
}

pub fn apply_tweak(id: &str) -> CommandResult {
    match apply(id) {
        Ok(msg) => CommandResult::ok(msg),
        Err(e) => CommandResult::err(e),
    }
}

pub fn revert_tweak(id: &str) -> CommandResult {
    match revert(id) {
        Ok(msg) => CommandResult::ok(msg),
        Err(e) => CommandResult::err(e),
    }
}

pub fn applicable_tweak_count() -> u32 {
    ALL_TWEAK_IDS
        .iter()
        .filter(|id| !handlers::is_advisor_only(id))
        .count() as u32
}

pub fn get_tweak_states() -> Vec<TweakState> {
    let store = AppStore::global();
    let applied = store.applied_map();
    ALL_TWEAK_IDS
        .iter()
        .map(|id| {
            let record = applied.get(*id);
            TweakState {
                id: (*id).to_string(),
                applied: record.is_some(),
                applied_at: record.map(|r| r.applied_at.clone()),
            }
        })
        .collect()
}

pub fn apply_boost(preset: &str) -> ApplyBoostResult {
    let ids = boost_tweak_ids(preset);
    let mut applied = Vec::new();
    let mut failed = Vec::new();
    let store = AppStore::global();
    store.begin_batch();

    for id in ids {
        if is_advisor_only(id) {
            applied.push(id.to_string());
            let _ = store.mark_applied(id, None);
            continue;
        }
        match apply(id) {
            Ok(_) => applied.push(id.to_string()),
            Err(e) => failed.push(FailedTweak {
                id: id.to_string(),
                error: e,
            }),
        }
    }

    let name = match preset {
        "safe" => "Safe Boost",
        "competitive" => "Competitive Boost",
        "extreme" => "Extreme Boost",
        "expert" => "Expert Guide",
        _ => preset,
    };
    let _ = store.set_last_boost(name);
    let _ = store.end_batch();
    crate::hardware::invalidate_dynamic_cache();

    let message = if failed.is_empty() {
        format!("{name} applied successfully ({} tweaks).", applied.len())
    } else {
        format!(
            "{name}: {} applied, {} failed. Some tweaks need Administrator.",
            applied.len(),
            failed.len()
        )
    };

    ApplyBoostResult {
        applied: applied.clone(),
        failed,
        message,
    }
}

pub fn rollback_all() -> CommandResult {
    let store = AppStore::global();
    let ids = store.applied_ids();
    let mut errors = Vec::new();

    for id in ids {
        if let Err(e) = revert(&id) {
            errors.push(format!("{id}: {e}"));
        }
    }

    if errors.is_empty() {
        CommandResult::ok("All applied tweaks have been reverted.")
    } else {
        CommandResult::err(format!("Partial rollback: {}", errors.join("; ")))
    }
}
