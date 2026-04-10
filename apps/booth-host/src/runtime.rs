use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum BoothState {
    Idle,
    Ready,
    Countdown,
    Capturing,
    Review,
    Publishing,
    Published,
    Error,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct BoothRuntime {
    pub state: BoothState,
    pub storage_path: String,
}

impl Default for BoothRuntime {
    fn default() -> Self {
        let storage_path = if cfg!(target_os = "windows") {
            "D:/SonyPhotobooth/captures".to_string()
        } else {
            let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
            format!("{}/SonyPhotobooth/captures", home)
        };

        Self {
            state: BoothState::Idle,
            storage_path,
        }
    }
}
