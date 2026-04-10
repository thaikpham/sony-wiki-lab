mod file_watcher;
mod routes;
mod sdk_bridge;
mod session_manager;
mod settings;

use crate::file_watcher::FileWatcherManager;
use crate::routes::{create_router, AppState};
use crate::session_manager::SessionManager;
use crate::settings::Settings;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use tracing::{info, warn};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("booth_host=info".parse()?)
                .add_directive("tower_http=debug".parse()?),
        )
        .init();

    info!("Starting Sony Photobooth Host v1.0.0");

    // Load settings
    let settings = Settings::load_or_default();
    info!("Settings loaded: storage_root={}", settings.local_storage_root);

    // Create channels for events
    let (session_event_tx, _) = broadcast::channel(100);

    // Create session manager
    let session_manager = Arc::new(SessionManager::new(settings.clone(), session_event_tx.clone()));

    // Create file watcher
    let file_watcher = Arc::new(FileWatcherManager::new());

    // Try to load SDK bridge
    let bridge_path = std::path::Path::new(&settings.bridge_dll_path);
    if bridge_path.exists() {
        info!("Loading SDK bridge from: {:?}", bridge_path);
        match sdk_bridge::SdkBridge::new(bridge_path) {
            Ok(bridge) => {
                info!("SDK bridge loaded successfully");

                // Initialize SDK
                match bridge.initialize() {
                    Ok(_) => {
                        info!("SDK initialized successfully");

                        // Try to connect to first camera
                        if let Err(e) = bridge.connect_first_camera() {
                            warn!("Failed to connect to camera: {}", e);
                        } else {
                            info!("Camera connected successfully");

                            // Start live view if enabled
                            if settings.enable_live_view {
                                if let Err(e) = bridge.start_live_view() {
                                    warn!("Failed to start live view: {}", e);
                                } else {
                                    info!("Live view started");
                                }
                            }
                        }

                        // Set the bridge in session manager
                        session_manager.set_sdk_bridge(bridge).await;
                    }
                    Err(e) => {
                        warn!("Failed to initialize SDK: {}", e);
                    }
                }
            }
            Err(e) => {
                warn!("Failed to load SDK bridge: {}", e);
                warn!("Running in fallback-only mode");
            }
        }
    } else {
        warn!(
            "SDK bridge not found at: {:?}, running in fallback-only mode",
            bridge_path
        );
    }

    // Spawn file event processor task
    let file_watcher_clone = file_watcher.clone();
    let session_manager_clone = session_manager.clone();
    tokio::spawn(async move {
        let mut file_event_rx = file_watcher_clone.subscribe();
        while let Ok(file_event) = file_event_rx.recv().await {
            let session_id = file_event.session_id.clone();
            if let Err(e) = session_manager_clone
                .handle_detected_file(&session_id, file_event)
                .await
            {
                warn!("Failed to handle detected file for session {}: {}", session_id, e);
            }
        }
    });

    // Spawn session event logger task
    tokio::spawn(async move {
        let mut session_event_rx = session_event_tx.subscribe();
        while let Ok(event) = session_event_rx.recv().await {
            info!("Session event: {:?}", event);
        }
    });

    // Create application state
    let app_state = Arc::new(AppState {
        session_manager: session_manager.clone(),
        file_watcher,
        settings: Arc::new(RwLock::new(settings.clone())),
        event_sender: session_event_tx,
    });

    // Create router
    let app = create_router(app_state);

    // Build server address
    let addr = format!("{}:{}", settings.bind_address, settings.port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    info!("HTTP server listening on http://{}", addr);
    info!("API endpoints available at http://{}/", addr);

    // Start server
    axum::serve(listener, app).await?;

    Ok(())
}
