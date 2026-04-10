use crate::file_watcher::FileDetectedEvent;
use crate::sdk_bridge::SdkBridge;
use crate::settings::{FallbackCaptureMode, SdkCaptureMode, Settings};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{broadcast, mpsc, RwLock};
use tracing::{error, info, warn};
use uuid::Uuid;

/// Session state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionState {
    Idle,
    Ready,
    Countdown,
    Capturing,
    Review,
    Publishing,
    Published,
    Error,
}

impl std::fmt::Display for SessionState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SessionState::Idle => write!(f, "idle"),
            SessionState::Ready => write!(f, "ready"),
            SessionState::Countdown => write!(f, "countdown"),
            SessionState::Capturing => write!(f, "capturing"),
            SessionState::Review => write!(f, "review"),
            SessionState::Publishing => write!(f, "publishing"),
            SessionState::Published => write!(f, "published"),
            SessionState::Error => write!(f, "error"),
        }
    }
}

/// Asset information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub id: String,
    pub file_name: String,
    pub file_path: String,
    pub width: u32,
    pub height: u32,
    pub file_size: u64,
    pub captured_at: DateTime<Utc>,
}

/// Session information
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub title: String,
    pub state: SessionState,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub booth_mode: BoothMode,
    pub event_name: String,
    pub storage_path: String,
    pub countdown_seconds: u32,
    pub selected_asset_id: Option<String>,
    pub assets: Vec<Asset>,
    pub capture_backend: CaptureBackend,
    pub session_folder_path: PathBuf,
    pub file_watch_status: FileWatchStatus,
    pub detected_files: Vec<String>,
    pub latest_asset_file_name: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BoothMode {
    Landscape,
    Portrait,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CaptureBackend {
    SdkPrimary,
    FallbackHdmi,
    FallbackRemote,
    FallbackUsbStream,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FileWatchStatus {
    Idle,
    Watching,
    FileDetected,
    Timeout,
    Error,
}

/// Events that can be emitted by the session manager
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SessionEvent {
    CaptureStarted {
        session_id: String,
        timestamp: DateTime<Utc>,
    },
    CountdownTick {
        session_id: String,
        seconds_remaining: u32,
        timestamp: DateTime<Utc>,
    },
    ShutterTriggered {
        session_id: String,
        timestamp: DateTime<Utc>,
    },
    FileDetected {
        session_id: String,
        file_name: String,
        file_path: String,
        file_size: u64,
        timestamp: DateTime<Utc>,
    },
    AssetRegistered {
        session_id: String,
        asset: Asset,
        timestamp: DateTime<Utc>,
    },
    CaptureFailed {
        session_id: String,
        error: String,
        timestamp: DateTime<Utc>,
    },
    CaptureTimeout {
        session_id: String,
        timestamp: DateTime<Utc>,
    },
    StateChanged {
        session_id: String,
        old_state: SessionState,
        new_state: SessionState,
        timestamp: DateTime<Utc>,
    },
}

/// Session manager that handles all session lifecycle and state transitions
pub struct SessionManager {
    sessions: Arc<RwLock<HashMap<String, Session>>>,
    settings: Arc<RwLock<Settings>>,
    event_sender: mpsc::Sender<SessionEvent>,
    sdk_bridge: Arc<RwLock<Option<SdkBridge>>>,
}

impl SessionManager {
    /// Create a new session manager
    pub fn new(settings: Settings, event_bus: broadcast::Sender<SessionEvent>) -> Self {
        // Create a receiver for the session manager to consume
        let (internal_tx, internal_rx) = mpsc::channel(100);

        let manager = Self {
            sessions: Arc::new(RwLock::new(HashMap::new())),
            settings: Arc::new(RwLock::new(settings)),
            event_sender: internal_tx,
            sdk_bridge: Arc::new(RwLock::new(None)),
        };

        // Start event forwarder task
        let event_bus_clone = event_bus.clone();
        tokio::spawn(async move {
            forward_events(internal_rx, event_bus_clone).await;
        });

        manager
    }

    /// Create a new session
    pub async fn create_session(
        &self,
        event_name: String,
        booth_mode: BoothMode,
        countdown_seconds: u32,
    ) -> anyhow::Result<Session> {
        let settings = self.settings.read().await;
        let session_id = Uuid::new_v4().to_string();
        let folder_path = settings.generate_session_folder_path(&event_name, &session_id);

        // Create the session folder
        tokio::fs::create_dir_all(&folder_path).await?;

        let title = format!(
            "Session {}",
            session_id.split('-').next().unwrap_or(&session_id)
        );
        let now = Utc::now();

        let session = Session {
            id: session_id.clone(),
            title,
            state: SessionState::Ready,
            created_at: now,
            updated_at: now,
            booth_mode,
            event_name: event_name.clone(),
            storage_path: folder_path.to_string_lossy().to_string(),
            countdown_seconds,
            selected_asset_id: None,
            assets: Vec::new(),
            capture_backend: CaptureBackend::SdkPrimary,
            session_folder_path: folder_path,
            file_watch_status: FileWatchStatus::Idle,
            detected_files: Vec::new(),
            latest_asset_file_name: None,
            error_message: None,
        };

        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id.clone(), session.clone());

        info!("Created session {} for event '{}'", session_id, event_name);

        // Emit state change event
        let _ = self.event_sender.try_send(SessionEvent::StateChanged {
            session_id: session_id.clone(),
            old_state: SessionState::Idle,
            new_state: SessionState::Ready,
            timestamp: Utc::now(),
        });

        Ok(session)
    }

    /// Get a session by ID
    pub async fn get_session(&self, session_id: &str) -> Option<Session> {
        let sessions = self.sessions.read().await;
        sessions.get(session_id).cloned()
    }

    /// Get all sessions
    pub async fn get_all_sessions(&self) -> Vec<Session> {
        let sessions = self.sessions.read().await;
        sessions.values().cloned().collect()
    }

    pub async fn update_settings(&self, settings: Settings) {
        let mut guard = self.settings.write().await;
        *guard = settings;
    }

    /// Delete a session
    pub async fn delete_session(&self, session_id: &str) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;

        if let Some(session) = sessions.remove(session_id) {
            // Optionally delete the folder contents
            // tokio::fs::remove_dir_all(&session.session_folder_path).await?;
            info!("Deleted session {}", session_id);
        }

        Ok(())
    }

    /// Start capture workflow for a session
    pub async fn start_capture(
        &self,
        session_id: &str,
        file_event_receiver: &mut broadcast::Receiver<FileDetectedEvent>,
    ) -> anyhow::Result<Session> {
        let mut session = self
            .get_session(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found: {}", session_id))?;

        // Validate state
        if session.state != SessionState::Ready {
            anyhow::bail!("Session is not in ready state");
        }

        // Transition to countdown
        self.transition_state(&mut session, SessionState::Countdown)
            .await?;

        // Emit capture started event
        let _ = self.event_sender.try_send(SessionEvent::CaptureStarted {
            session_id: session_id.to_string(),
            timestamp: Utc::now(),
        });

        // Run countdown
        for i in (1..=session.countdown_seconds).rev() {
            let _ = self.event_sender.try_send(SessionEvent::CountdownTick {
                session_id: session_id.to_string(),
                seconds_remaining: i,
                timestamp: Utc::now(),
            });
            tokio::time::sleep(Duration::from_secs(1)).await;
        }

        // Transition to capturing
        self.transition_state(&mut session, SessionState::Capturing)
            .await?;

        // Trigger SDK capture or fallback
        let settings = self.settings.read().await;
        let capture_result = self.trigger_capture(&session, &settings).await;

        if let Err(e) = capture_result {
            error!("Capture failed for session {}: {}", session_id, e);
            session.error_message = Some(e.to_string());
            self.transition_state(&mut session, SessionState::Error)
                .await?;

            let _ = self.event_sender.try_send(SessionEvent::CaptureFailed {
                session_id: session_id.to_string(),
                error: e.to_string(),
                timestamp: Utc::now(),
            });

            // Update session in storage
            let mut sessions = self.sessions.write().await;
            sessions.insert(session_id.to_string(), session.clone());

            return Ok(session);
        }

        // Emit shutter triggered event
        let _ = self.event_sender.try_send(SessionEvent::ShutterTriggered {
            session_id: session_id.to_string(),
            timestamp: Utc::now(),
        });

        // Wait for file detection with timeout
        let timeout_duration = Duration::from_secs(settings.file_arrival_timeout_seconds);
        session.file_watch_status = FileWatchStatus::Watching;

        // Update session
        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id.to_string(), session.clone());
        drop(sessions);

        let file_result =
            crate::file_watcher::wait_for_file(file_event_receiver, session_id, timeout_duration)
                .await;

        match file_result {
            Some(file_event) => {
                info!(
                    "File detected for session {}: {}",
                    session_id, file_event.file_name
                );
                self.handle_detected_file(session_id, file_event).await?;
                session = self
                    .get_session(session_id)
                    .await
                    .ok_or_else(|| anyhow::anyhow!("Session disappeared during capture"))?;
            }
            None => {
                // Timeout - no file detected
                warn!("File detection timeout for session {}", session_id);

                session.file_watch_status = FileWatchStatus::Timeout;
                session.error_message =
                    Some("File detection timeout - image may not have been saved".to_string());

                // Emit timeout event
                let _ = self.event_sender.try_send(SessionEvent::CaptureTimeout {
                    session_id: session_id.to_string(),
                    timestamp: Utc::now(),
                });

                // Transition to error state
                self.transition_state(&mut session, SessionState::Error)
                    .await?;
            }
        }

        // Update session in storage
        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id.to_string(), session.clone());

        Ok(session)
    }

    /// Trigger the actual capture via SDK or fallback
    async fn trigger_capture(&self, session: &Session, settings: &Settings) -> anyhow::Result<()> {
        match settings.sdk_capture_mode {
            SdkCaptureMode::Primary => {
                // Try SDK first
                let bridge_guard = self.sdk_bridge.read().await;

                if let Some(ref bridge) = *bridge_guard {
                    if bridge.is_camera_connected() {
                        // Set save directory before capture
                        bridge.set_save_directory(&session.storage_path)?;

                        // Trigger capture
                        bridge.capture_single_frame()?;
                        info!("SDK capture triggered for session {}", session.id);
                        return Ok(());
                    }
                }

                // SDK not available - try fallback if enabled
                warn!("SDK camera not connected, attempting fallback");

                if let Some(fallback) = settings.fallback_capture_mode {
                    self.trigger_fallback_capture(fallback).await
                } else {
                    anyhow::bail!("SDK camera not connected and no fallback configured");
                }
            }
            SdkCaptureMode::FallbackOnly => {
                // Use fallback only
                if let Some(fallback) = settings.fallback_capture_mode {
                    self.trigger_fallback_capture(fallback).await
                } else {
                    anyhow::bail!("Fallback mode not configured");
                }
            }
        }
    }

    /// Trigger fallback capture (mock implementation)
    async fn trigger_fallback_capture(&self, _mode: FallbackCaptureMode) -> anyhow::Result<()> {
        // In a real implementation, this would trigger screen capture
        // from the specified fallback source (HDMI, Remote, USB Stream)
        // For now, we just simulate a delay
        tokio::time::sleep(Duration::from_millis(100)).await;

        warn!("Fallback capture triggered (mock implementation)");
        Ok(())
    }

    /// Reset a session to ready state
    pub async fn reset_session(&self, session_id: &str) -> anyhow::Result<Session> {
        let mut session = self
            .get_session(session_id)
            .ok_or_else(|| anyhow::anyhow!("Session not found: {}", session_id))?;

        self.transition_state(&mut session, SessionState::Ready)
            .await?;

        // Clear error state
        session.error_message = None;
        session.file_watch_status = FileWatchStatus::Idle;
        session.latest_asset_file_name = None;

        // Update session
        let mut sessions = self.sessions.write().await;
        sessions.insert(session_id.to_string(), session.clone());

        Ok(session)
    }

    /// Set the SDK bridge
    pub async fn set_sdk_bridge(&self, bridge: SdkBridge) {
        let mut guard = self.sdk_bridge.write().await;
        *guard = Some(bridge);
    }

    pub async fn get_live_view_frame(&self) -> anyhow::Result<Option<Vec<u8>>> {
        let guard = self.sdk_bridge.read().await;

        if let Some(ref bridge) = *guard {
            if !bridge.is_live_view_active() {
                return Ok(None);
            }

            let mut buffer = vec![0_u8; 2 * 1024 * 1024];
            let size = bridge.get_live_view_frame(&mut buffer)?;
            buffer.truncate(size);
            return Ok(Some(buffer));
        }

        Ok(None)
    }

    /// Get SDK bridge status
    pub async fn get_sdk_bridge_status(&self) -> SdkBridgeStatus {
        let guard = self.sdk_bridge.read().await;

        if let Some(ref bridge) = *guard {
            if bridge.is_initialized() {
                if bridge.is_camera_connected() {
                    SdkBridgeStatus::Connected
                } else {
                    SdkBridgeStatus::Initialized
                }
            } else {
                SdkBridgeStatus::Disconnected
            }
        } else {
            SdkBridgeStatus::Disconnected
        }
    }

    /// Handle a detected file from the file watcher
    pub async fn handle_detected_file(
        &self,
        session_id: &str,
        file_event: FileDetectedEvent,
    ) -> anyhow::Result<()> {
        let mut sessions = self.sessions.write().await;

        if let Some(session) = sessions.get_mut(session_id) {
            if !session.detected_files.contains(&file_event.file_name) {
                let old_state = session.state;
                session.detected_files.push(file_event.file_name.clone());
                session.latest_asset_file_name = Some(file_event.file_name.clone());

                // Create asset
                let asset = Asset {
                    id: Uuid::new_v4().to_string(),
                    file_name: file_event.file_name.clone(),
                    file_path: file_event.file_path.clone(),
                    width: 0,
                    height: 0,
                    file_size: file_event.file_size,
                    captured_at: Utc::now(),
                };

                session.assets.push(asset.clone());
                session.selected_asset_id = Some(asset.id.clone());

                // Update state if capturing
                if session.state == SessionState::Capturing {
                    session.state = SessionState::Review;
                    session.file_watch_status = FileWatchStatus::FileDetected;
                }

                session.updated_at = Utc::now();

                // Emit events
                let _ = self.event_sender.try_send(SessionEvent::FileDetected {
                    session_id: session_id.to_string(),
                    file_name: file_event.file_name.clone(),
                    file_path: file_event.file_path.clone(),
                    file_size: file_event.file_size,
                    timestamp: Utc::now(),
                });

                let _ = self.event_sender.try_send(SessionEvent::AssetRegistered {
                    session_id: session_id.to_string(),
                    asset,
                    timestamp: Utc::now(),
                });

                if old_state != session.state {
                    let _ = self.event_sender.try_send(SessionEvent::StateChanged {
                        session_id: session_id.to_string(),
                        old_state,
                        new_state: session.state,
                        timestamp: Utc::now(),
                    });
                }
            }
        }

        Ok(())
    }

    /// Transition session state
    async fn transition_state(
        &self,
        session: &mut Session,
        new_state: SessionState,
    ) -> anyhow::Result<()> {
        let old_state = session.state;

        if old_state == new_state {
            return Ok(());
        }

        // Validate state transition
        let valid_transition = match (old_state, new_state) {
            (SessionState::Idle, SessionState::Ready) => true,
            (SessionState::Ready, SessionState::Countdown) => true,
            (SessionState::Countdown, SessionState::Capturing) => true,
            (SessionState::Capturing, SessionState::Review) => true,
            (SessionState::Capturing, SessionState::Error) => true,
            (SessionState::Review, SessionState::Publishing) => true,
            (SessionState::Review, SessionState::Ready) => true,
            (SessionState::Publishing, SessionState::Published) => true,
            (SessionState::Published, SessionState::Ready) => true,
            (SessionState::Error, SessionState::Ready) => true,
            (SessionState::Error, SessionState::Idle) => true,
            _ => false,
        };

        if !valid_transition {
            anyhow::bail!(
                "Invalid state transition from {} to {}",
                old_state,
                new_state
            );
        }

        session.state = new_state;
        session.updated_at = Utc::now();

        // Emit state change event
        let _ = self.event_sender.try_send(SessionEvent::StateChanged {
            session_id: session.id.clone(),
            old_state,
            new_state,
            timestamp: Utc::now(),
        });

        info!(
            "Session {} state changed: {} -> {}",
            session.id, old_state, new_state
        );

        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SdkBridgeStatus {
    Disconnected,
    Initialized,
    Connected,
}

/// Forward events from internal receiver to external sender
async fn forward_events(
    mut internal_rx: mpsc::Receiver<SessionEvent>,
    external_tx: broadcast::Sender<SessionEvent>,
) {
    while let Some(event) = internal_rx.recv().await {
        let _ = external_tx.send(event);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_session() {
        let settings = Settings::default();
        let (event_tx, _) = broadcast::channel(100);
        let manager = SessionManager::new(settings, event_tx);

        let session = manager
            .create_session("Test Event".to_string(), BoothMode::Landscape, 3)
            .await
            .unwrap();

        assert_eq!(session.event_name, "Test Event");
        assert_eq!(session.booth_mode, BoothMode::Landscape);
        assert_eq!(session.countdown_seconds, 3);
        assert_eq!(session.state, SessionState::Ready);
    }

    #[test]
    fn test_state_transitions() {
        assert!(matches!(
            (SessionState::Idle, SessionState::Ready),
            (SessionState::Idle, SessionState::Ready)
        ));
    }
}
