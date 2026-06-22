mod advisor;
mod cleaner;
mod games;
mod hardware;
mod hardware_probe;
mod models;
mod network;
mod platform;
mod restore;
mod scanner;
mod store;
mod tweaks;

use hardware::SystemInfo;
use models::*;
use tauri::async_runtime::spawn_blocking;

#[tauri::command]
async fn run_advisor_scan(guides: Option<Vec<AdvisorScanGuide>>) -> Vec<GuideAdvisorResult> {
    spawn_blocking(move || advisor::run_advisor_scan(guides))
        .await
        .unwrap_or_default()
}

#[tauri::command]
fn get_expert_risk_status() -> ExpertRiskStatus {
    store::AppStore::global().get_expert_risk_status()
}

#[tauri::command]
async fn waive_expert_risk() -> CommandResult {
    spawn_blocking(|| match store::AppStore::global().waive_expert_risk() {
        Ok(()) => CommandResult::ok("Expert guide risk waiver recorded."),
        Err(e) => CommandResult::err(e),
    })
    .await
    .unwrap_or_else(|e| CommandResult::err(e.to_string()))
}

#[tauri::command]
async fn clear_expert_risk_waiver() -> CommandResult {
    spawn_blocking(|| match store::AppStore::global().clear_expert_risk_waiver() {
        Ok(()) => CommandResult::ok("Risk waiver cleared."),
        Err(e) => CommandResult::err(e),
    })
    .await
    .unwrap_or_else(|e| CommandResult::err(e.to_string()))
}

#[tauri::command]
async fn get_system_info() -> SystemInfo {
    spawn_blocking(hardware::collect_system_info)
        .await
        .unwrap_or_else(|e| panic!("get_system_info task failed: {e}"))
}

#[tauri::command]
async fn get_tweak_states() -> Vec<TweakState> {
    spawn_blocking(tweaks::get_tweak_states)
        .await
        .unwrap_or_default()
}

#[tauri::command]
async fn apply_tweak(id: String) -> CommandResult {
    spawn_blocking(move || tweaks::apply_tweak(&id))
        .await
        .unwrap_or_else(|e| CommandResult::err(e.to_string()))
}

#[tauri::command]
async fn revert_tweak(id: String) -> CommandResult {
    spawn_blocking(move || tweaks::revert_tweak(&id))
        .await
        .unwrap_or_else(|e| CommandResult::err(e.to_string()))
}

#[tauri::command]
async fn apply_boost(preset: String) -> ApplyBoostResult {
    spawn_blocking(move || tweaks::apply_boost(&preset))
        .await
        .unwrap_or_else(|e| ApplyBoostResult {
            applied: vec![],
            failed: vec![FailedTweak {
                id: "boost".into(),
                error: e.to_string(),
            }],
            message: "Boost failed.".into(),
        })
}

#[tauri::command]
async fn run_scanner() -> ScanResult {
    spawn_blocking(scanner::run_scan)
        .await
        .unwrap_or_else(|e| ScanResult {
            findings: vec![],
            fps_gain: "—".into(),
            latency_gain: "—".into(),
            stability_risk: "unknown".into(),
            recommended_mode: "safe".into(),
            performance_score: 0,
        })
}

#[tauri::command]
async fn create_restore_point(description: String) -> CommandResult {
    spawn_blocking(move || match restore::create_restore_point(&description) {
        Ok(msg) => CommandResult::ok(msg),
        Err(e) => CommandResult::err(e),
    })
    .await
    .unwrap_or_else(|e| CommandResult::err(e.to_string()))
}

#[tauri::command]
async fn list_restore_points() -> Vec<RestorePoint> {
    spawn_blocking(restore::list_restore_points)
        .await
        .unwrap_or_default()
}

#[tauri::command]
fn get_rollback_info() -> RollbackInfo {
    restore::get_rollback_info()
}

#[tauri::command]
async fn rollback_all() -> CommandResult {
    spawn_blocking(restore::rollback_all)
        .await
        .unwrap_or_else(|e| CommandResult::err(e.to_string()))
}

#[tauri::command]
async fn run_cleaner(options: CleanOptions) -> CleanResult {
    spawn_blocking(move || cleaner::run_cleaner(options))
        .await
        .unwrap_or_else(|e| CleanResult {
            freed_mb: 0.0,
            items: vec![],
            message: e.to_string(),
        })
}

#[tauri::command]
async fn get_game_profiles() -> Vec<GameProfile> {
    spawn_blocking(games::get_profiles)
        .await
        .unwrap_or_default()
}

#[tauri::command]
async fn ping_test(host: String) -> PingResult {
    let host_for_err = host.clone();
    spawn_blocking(move || network::ping_test(&host))
        .await
        .unwrap_or_else(|e| PingResult {
            host: host_for_err,
            latency_ms: None,
            packet_loss: None,
            message: e.to_string(),
        })
}

#[tauri::command]
fn get_settings() -> AppSettings {
    store::AppStore::global().get_settings()
}

#[tauri::command]
async fn save_settings(settings: AppSettings) -> CommandResult {
    spawn_blocking(move || match store::AppStore::global().set_settings(settings) {
        Ok(()) => CommandResult::ok("Settings saved."),
        Err(e) => CommandResult::err(e),
    })
    .await
    .unwrap_or_else(|e| CommandResult::err(e.to_string()))
}

#[tauri::command]
fn get_data_dir() -> String {
    store::AppStore::global()
        .data_dir()
        .to_string_lossy()
        .to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            run_advisor_scan,
            get_expert_risk_status,
            waive_expert_risk,
            clear_expert_risk_waiver,
            get_tweak_states,
            apply_tweak,
            revert_tweak,
            apply_boost,
            run_scanner,
            create_restore_point,
            list_restore_points,
            get_rollback_info,
            rollback_all,
            run_cleaner,
            get_game_profiles,
            ping_test,
            get_settings,
            save_settings,
            get_data_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
