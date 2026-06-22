use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::models::{AppSettings, ExpertRiskStatus};

static BATCH_DEFER: std::sync::Mutex<bool> = std::sync::Mutex::new(false);

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppliedRecord {
    pub backup: Option<String>,
    pub applied_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct PersistedState {
    pub applied: HashMap<String, AppliedRecord>,
    pub last_boost: Option<String>,
    pub last_boost_at: Option<String>,
    pub settings: AppSettings,
    #[serde(default)]
    pub expert_risk_waived_at: Option<String>,
}

pub struct AppStore {
    path: PathBuf,
    state: Mutex<PersistedState>,
}

impl AppStore {
    pub fn global() -> &'static AppStore {
        static STORE: std::sync::OnceLock<AppStore> = std::sync::OnceLock::new();
        STORE.get_or_init(AppStore::load)
    }

    fn load() -> Self {
        let path = data_path();
        let state = if path.exists() {
            fs::read_to_string(&path)
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
                .unwrap_or_default()
        } else {
            PersistedState::default()
        };
        Self {
            path,
            state: Mutex::new(state),
        }
    }

    fn save(&self) -> Result<(), String> {
        let state = self.state.lock().map_err(|e| e.to_string())?;
        if let Some(parent) = self.path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let json = serde_json::to_string_pretty(&*state).map_err(|e| e.to_string())?;
        fs::write(&self.path, json).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn is_applied(&self, id: &str) -> bool {
        self.state
            .lock()
            .map(|s| s.applied.contains_key(id))
            .unwrap_or(false)
    }

    pub fn get_backup(&self, id: &str) -> Option<String> {
        self.state
            .lock()
            .ok()
            .and_then(|s| s.applied.get(id).and_then(|r| r.backup.clone()))
    }

    pub fn mark_applied(&self, id: &str, backup: Option<String>) -> Result<(), String> {
        {
            let mut state = self.state.lock().map_err(|e| e.to_string())?;
            state.applied.insert(
                id.to_string(),
                AppliedRecord {
                    backup,
                    applied_at: chrono::Local::now().to_rfc3339(),
                },
            );
        }
        if self.should_save() {
            self.save()?;
        }
        Ok(())
    }

    pub fn applied_ids(&self) -> Vec<String> {
        self.state
            .lock()
            .map(|s| s.applied.keys().cloned().collect())
            .unwrap_or_default()
    }

    pub fn mark_reverted(&self, id: &str) -> Result<(), String> {
        {
            let mut state = self.state.lock().map_err(|e| e.to_string())?;
            state.applied.remove(id);
        }
        if self.should_save() {
            self.save()?;
        }
        Ok(())
    }

    pub fn applied_map(&self) -> HashMap<String, AppliedRecord> {
        self.state
            .lock()
            .map(|s| s.applied.clone())
            .unwrap_or_default()
    }

    pub fn begin_batch(&self) {
        if let Ok(mut batch) = BATCH_DEFER.lock() {
            *batch = true;
        }
    }

    pub fn end_batch(&self) -> Result<(), String> {
        if let Ok(mut batch) = BATCH_DEFER.lock() {
            *batch = false;
        }
        self.save()
    }

    fn should_save(&self) -> bool {
        BATCH_DEFER.lock().map(|b| !*b).unwrap_or(true)
    }

    pub fn set_last_boost(&self, name: &str) -> Result<(), String> {
        {
            let mut state = self.state.lock().map_err(|e| e.to_string())?;
            state.last_boost = Some(name.to_string());
            state.last_boost_at = Some(chrono::Local::now().to_rfc3339());
        }
        if self.should_save() {
            self.save()?;
        }
        Ok(())
    }

    pub fn rollback_info(&self) -> (Vec<(String, String)>, Option<String>, Option<String>) {
        self.state
            .lock()
            .map(|s| {
                let entries = s
                    .applied
                    .iter()
                    .map(|(id, r)| (id.clone(), r.applied_at.clone()))
                    .collect();
                (entries, s.last_boost.clone(), s.last_boost_at.clone())
            })
            .unwrap_or_default()
    }

    pub fn clear_all_applied(&self) -> Result<(), String> {
        {
            let mut state = self.state.lock().map_err(|e| e.to_string())?;
            state.applied.clear();
        }
        self.save()
    }

    pub fn get_settings(&self) -> AppSettings {
        self.state
            .lock()
            .map(|s| s.settings.clone())
            .unwrap_or_default()
    }

    pub fn set_settings(&self, settings: AppSettings) -> Result<(), String> {
        {
            let mut state = self.state.lock().map_err(|e| e.to_string())?;
            state.settings = settings;
        }
        self.save()
    }

    pub fn data_dir(&self) -> PathBuf {
        self.path.parent().unwrap_or(&self.path).to_path_buf()
    }

    pub fn get_expert_risk_status(&self) -> ExpertRiskStatus {
        self.state
            .lock()
            .map(|s| ExpertRiskStatus {
                waived: s.expert_risk_waived_at.is_some(),
                waived_at: s.expert_risk_waived_at.clone(),
            })
            .unwrap_or(ExpertRiskStatus {
                waived: false,
                waived_at: None,
            })
    }

    pub fn waive_expert_risk(&self) -> Result<(), String> {
        {
            let mut state = self.state.lock().map_err(|e| e.to_string())?;
            state.expert_risk_waived_at = Some(chrono::Local::now().to_rfc3339());
        }
        self.save()
    }

    pub fn clear_expert_risk_waiver(&self) -> Result<(), String> {
        {
            let mut state = self.state.lock().map_err(|e| e.to_string())?;
            state.expert_risk_waived_at = None;
        }
        self.save()
    }
}

fn data_path() -> PathBuf {
    dirs::data_local_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("fps-unleashed")
        .join("state.json")
}
