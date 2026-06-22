use crate::models::{RestorePoint, RollbackEntry, RollbackInfo};
use crate::platform::run_ps;
use crate::store::AppStore;
use crate::tweaks;

pub fn create_restore_point(description: &str) -> Result<String, String> {
    let desc = description.replace('\'', "''");
    run_ps(&format!(
        r#"
        if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {{
            throw 'Administrator privileges required to create a restore point.'
        }}
        Checkpoint-Computer -Description '{desc}' -RestorePointType 'MODIFY_SETTINGS'
        "#
    ))
}

pub fn list_restore_points() -> Vec<RestorePoint> {
    let output = run_ps(
        r#"
        Get-ComputerRestorePoint -ErrorAction SilentlyContinue |
            Select-Object SequenceNumber, Description, CreationTime |
            ConvertTo-Json -Compress
        "#,
    );

    match output {
        Ok(text) if !text.trim().is_empty() => parse_restore_points(&text),
        _ => Vec::new(),
    }
}

fn parse_restore_points(text: &str) -> Vec<RestorePoint> {
    let trimmed = text.trim();
    if let Ok(arr) = serde_json::from_str::<Vec<serde_json::Value>>(trimmed) {
        return arr.into_iter().filter_map(|v| parse_rp(&v)).collect();
    }
    if let Ok(obj) = serde_json::from_str::<serde_json::Value>(trimmed) {
        return parse_rp(&obj).into_iter().collect();
    }
    Vec::new()
}

fn parse_rp(v: &serde_json::Value) -> Option<RestorePoint> {
    Some(RestorePoint {
        sequence_number: v.get("SequenceNumber")?.as_u64()? as u32,
        description: v
            .get("Description")
            .and_then(|d| d.as_str())
            .unwrap_or("Restore Point")
            .to_string(),
        creation_time: v
            .get("CreationTime")
            .and_then(|d| d.as_str())
            .unwrap_or("")
            .to_string(),
    })
}

pub fn get_rollback_info() -> RollbackInfo {
    let store = AppStore::global();
    let (entries, last_boost, last_boost_at) = store.rollback_info();
    RollbackInfo {
        entries: entries
            .into_iter()
            .map(|(tweak_id, applied_at)| RollbackEntry {
                tweak_id,
                applied_at,
            })
            .collect(),
        last_boost,
        last_boost_at,
    }
}

pub fn rollback_all() -> crate::models::CommandResult {
    tweaks::rollback_all()
}
