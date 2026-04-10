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
        Self {
            state: BoothState::Idle,
            storage_path: "D:/SonyPhotobooth/captures".to_string(),
        }
    }
}
