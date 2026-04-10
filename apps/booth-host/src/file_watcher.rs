use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::{broadcast, RwLock};
use tracing::{info, warn};

/// File detection event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileDetectedEvent {
    pub session_id: String,
    pub file_name: String,
    pub file_path: String,
    pub file_size: u64,
    pub detected_at: String,
}

#[derive(Debug, Clone)]
struct SessionWatchState {
    watched_path: PathBuf,
    detected_files: Vec<String>,
    is_watching: bool,
}

/// File watcher manager that handles multiple session folders
pub struct FileWatcherManager {
    event_sender: broadcast::Sender<FileDetectedEvent>,
    sessions: Arc<RwLock<HashMap<String, SessionWatchState>>>,
    watcher: Arc<RwLock<Option<RecommendedWatcher>>>,
    debounce_duration: Duration,
}

impl FileWatcherManager {
    pub fn new() -> Self {
        let (event_sender, _) = broadcast::channel(100);

        let manager = Self {
            event_sender,
            sessions: Arc::new(RwLock::new(HashMap::new())),
            watcher: Arc::new(RwLock::new(None)),
            debounce_duration: Duration::from_millis(500),
        };

        let manager_clone = manager.clone_internal();
        tokio::spawn(async move {
            manager_clone.run_watcher_task().await;
        });

        manager
    }

    fn clone_internal(&self) -> Self {
        Self {
            event_sender: self.event_sender.clone(),
            sessions: self.sessions.clone(),
            watcher: self.watcher.clone(),
            debounce_duration: self.debounce_duration,
        }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<FileDetectedEvent> {
        self.event_sender.subscribe()
    }

    pub async fn start_watching(
        &self,
        session_id: String,
        folder_path: impl AsRef<Path>,
    ) -> anyhow::Result<()> {
        let path = folder_path.as_ref().to_path_buf();

        if !path.exists() {
            tokio::fs::create_dir_all(&path).await?;
            info!("Created session directory: {:?}", path);
        }

        let mut sessions = self.sessions.write().await;

        if sessions.contains_key(&session_id) {
            warn!(
                "Session {} is already being watched, stopping previous watch",
                session_id
            );
            self.stop_watching_internal(&session_id, &mut sessions).await;
        }

        sessions.insert(
            session_id.clone(),
            SessionWatchState {
                watched_path: path.clone(),
                detected_files: Vec::new(),
                is_watching: true,
            },
        );

        let mut watcher_guard = self.watcher.write().await;
        if watcher_guard.is_none() {
            let event_sender = self.event_sender.clone();
            let sessions_clone = self.sessions.clone();
            let debounce = self.debounce_duration;

            let new_watcher = RecommendedWatcher::new(
                move |res: Result<Event, notify::Error>| {
                    if let Ok(event) = res {
                        if event.kind.is_create() {
                            tokio::spawn(handle_file_event(
                                event,
                                sessions_clone.clone(),
                                event_sender.clone(),
                                debounce,
                            ));
                        }
                    }
                },
                Config::default()
                    .with_poll_interval(Duration::from_millis(100))
                    .with_compare_contents(true),
            )?;

            *watcher_guard = Some(new_watcher);
        }

        if let Some(ref mut watcher) = *watcher_guard {
            watcher.watch(&path, RecursiveMode::NonRecursive)?;
            info!("Started watching session {} at path: {:?}", session_id, path);
        }

        self.scan_existing_files(&session_id, &path).await?;
        Ok(())
    }

    pub async fn stop_watching(&self, session_id: &str) {
        let mut sessions = self.sessions.write().await;
        self.stop_watching_internal(session_id, &mut sessions).await;
    }

    async fn stop_watching_internal(
        &self,
        session_id: &str,
        sessions: &mut tokio::sync::RwLockWriteGuard<'_, HashMap<String, SessionWatchState>>,
    ) {
        if let Some(state) = sessions.get(session_id) {
            if state.is_watching {
                let mut watcher_guard = self.watcher.write().await;
                if let Some(ref mut watcher) = *watcher_guard {
                    let _ = watcher.unwatch(&state.watched_path);
                }
            }

            sessions.remove(session_id);
            info!("Stopped watching session {}", session_id);
        }
    }

    pub async fn get_detected_files(&self, session_id: &str) -> Vec<String> {
        let sessions = self.sessions.read().await;
        sessions
            .get(session_id)
            .map(|s| s.detected_files.clone())
            .unwrap_or_default()
    }

    pub async fn is_watching(&self, session_id: &str) -> bool {
        let sessions = self.sessions.read().await;
        sessions
            .get(session_id)
            .map(|s| s.is_watching)
            .unwrap_or(false)
    }

    async fn scan_existing_files(&self, session_id: &str, path: &Path) -> anyhow::Result<()> {
        let mut entries = tokio::fs::read_dir(path).await?;

        while let Some(entry) = entries.next_entry().await? {
            let metadata = entry.metadata().await?;
            if metadata.is_file() {
                let file_name = entry.file_name().to_string_lossy().to_string();
                let file_path = entry.path().to_string_lossy().to_string();
                let file_size = metadata.len();
                let extension = entry
                    .path()
                    .extension()
                    .map(|e| e.to_string_lossy().to_lowercase())
                    .unwrap_or_default();

                if is_supported_image_extension(&extension) {
                    self.add_detected_file(session_id, &file_name, &file_path, file_size)
                        .await;
                }
            }
        }

        Ok(())
    }

    async fn add_detected_file(
        &self,
        session_id: &str,
        file_name: &str,
        file_path: &str,
        file_size: u64,
    ) {
        let mut sessions = self.sessions.write().await;

        if let Some(state) = sessions.get_mut(session_id) {
            if state.detected_files.contains(&file_name.to_string()) {
                return;
            }

            state.detected_files.push(file_name.to_string());

            let event = FileDetectedEvent {
                session_id: session_id.to_string(),
                file_name: file_name.to_string(),
                file_path: file_path.to_string(),
                file_size,
                detected_at: chrono::Utc::now().to_rfc3339(),
            };

            let _ = self.event_sender.send(event);
            info!(
                "New file detected for session {}: {} ({} bytes)",
                session_id, file_name, file_size
            );
        }
    }

    async fn run_watcher_task(&self) {
        loop {
            tokio::time::sleep(Duration::from_secs(1)).await;
        }
    }
}

fn is_supported_image_extension(extension: &str) -> bool {
    ["jpg", "jpeg", "png", "raw", "arw", "nef", "cr2", "cr3"].contains(&extension)
}

async fn handle_file_event(
    event: Event,
    sessions: Arc<RwLock<HashMap<String, SessionWatchState>>>,
    sender: broadcast::Sender<FileDetectedEvent>,
    _debounce: Duration,
) {
    for path in event.paths {
        let sessions_guard = sessions.read().await;

        for (session_id, state) in sessions_guard.iter() {
            if path.starts_with(&state.watched_path) {
                if let Ok(metadata) = tokio::fs::metadata(&path).await {
                    if metadata.is_file() {
                        let file_name = path
                            .file_name()
                            .map(|n| n.to_string_lossy().to_string())
                            .unwrap_or_default();
                        let file_path = path.to_string_lossy().to_string();
                        let extension = path
                            .extension()
                            .map(|e| e.to_string_lossy().to_lowercase())
                            .unwrap_or_default();

                        if is_supported_image_extension(&extension) {
                            let event = FileDetectedEvent {
                                session_id: session_id.clone(),
                                file_name: file_name.clone(),
                                file_path: file_path.clone(),
                                file_size: metadata.len(),
                                detected_at: chrono::Utc::now().to_rfc3339(),
                            };

                            let _ = sender.send(event);
                            info!(
                                "File detected: {} in session {} ({} bytes)",
                                file_name,
                                session_id,
                                metadata.len()
                            );
                        }
                    }
                }
            }
        }
    }
}

pub async fn wait_for_file(
    receiver: &mut broadcast::Receiver<FileDetectedEvent>,
    session_id: &str,
    timeout: Duration,
) -> Option<FileDetectedEvent> {
    let deadline = tokio::time::Instant::now() + timeout;

    loop {
        let remaining = deadline.saturating_duration_since(tokio::time::Instant::now());
        if remaining.is_zero() {
            return None;
        }

        match tokio::time::timeout(remaining, receiver.recv()).await {
            Ok(Ok(event)) if event.session_id == session_id => return Some(event),
            Ok(Ok(_)) => continue,
            Ok(Err(broadcast::error::RecvError::Lagged(_))) => continue,
            Ok(Err(broadcast::error::RecvError::Closed)) => return None,
            Err(_) => return None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_file_watcher() {
        let manager = FileWatcherManager::new();
        assert!(!manager.is_watching("test-session").await);
    }
}
