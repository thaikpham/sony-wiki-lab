use axum::{
    extract::{Path, State, WebSocketUpgrade},
    http::{header, StatusCode},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::{broadcast, RwLock};
use tower_http::cors::{Any, CorsLayer};
use tracing::{error, info, warn};

use crate::file_watcher::FileWatcherManager;
use crate::session_manager::{BoothMode, SessionEvent, SessionManager, SessionState};
use crate::settings::Settings;

/// Application state shared across handlers
pub struct AppState {
    pub session_manager: Arc<SessionManager>,
    pub file_watcher: Arc<FileWatcherManager>,
    pub settings: Arc<RwLock<Settings>>,
    pub event_sender: broadcast::Sender<SessionEvent>,
}

/// Request body for creating a session
#[derive(Debug, Deserialize)]
pub struct CreateSessionRequest {
    pub event_name: String,
    pub booth_mode: BoothMode,
    #[serde(default = "default_countdown")]
    pub countdown_seconds: u32,
}

fn default_countdown() -> u32 {
    3
}

/// Request body for capture
#[derive(Debug, Deserialize)]
pub struct CaptureRequest {
    #[serde(default)]
    pub use_fallback: bool,
}

/// API status response
#[derive(Debug, Serialize)]
pub struct StatusResponse {
    pub runtime: String,
    pub camera: CameraState,
    pub current_session_id: Option<String>,
    pub local_storage_path: String,
    pub operator_locked: bool,
    pub latest_share_url: Option<String>,
    pub settings: OperatorSettings,
    pub capture_backend: String,
    pub fallback_capture_mode: Option<String>,
    pub file_watcher_status: String,
    pub file_watcher_root: String,
    pub file_arrival_timeout_seconds: u64,
    pub live_view_status: String,
    pub sdk_bridge_status: String,
    pub sdk_version: String,
    pub bridge_version: String,
}

#[derive(Debug, Serialize)]
pub struct CameraState {
    pub connected: bool,
    pub model: String,
    pub transport: String,
    pub firmware: String,
    pub sdk_version: String,
}

#[derive(Debug, Serialize)]
pub struct OperatorSettings {
    pub aspect_preset: String,
    pub save_destination: String,
    pub shutter_mode: String,
    pub timer_mode: String,
    pub local_host_url: String,
}

/// Settings update request
#[derive(Debug, Deserialize)]
pub struct UpdateSettingsRequest {
    pub local_storage_root: Option<String>,
    pub session_folder_pattern: Option<String>,
    pub sdk_capture_mode: Option<String>,
    pub fallback_capture_mode: Option<String>,
    pub file_arrival_timeout_seconds: Option<u64>,
    pub enable_live_view: Option<bool>,
    pub enable_file_watcher: Option<bool>,
    pub bind_address: Option<String>,
    pub port: Option<u16>,
}

/// Create the router with all routes
pub fn create_router(state: Arc<AppState>) -> Router {
    Router::new()
        .route("/", get(root_handler))
        .route("/status", get(status_handler))
        .route(
            "/sessions",
            get(list_sessions_handler).post(create_session_handler),
        )
        .route("/sessions/:id", get(get_session_handler))
        .route("/sessions/:id/capture", post(capture_handler))
        .route("/sessions/:id/reset", post(reset_session_handler))
        .route("/sessions/:id/assets/:asset_id", get(get_asset_handler))
        .route(
            "/settings",
            get(get_settings_handler).patch(update_settings_handler),
        )
        .route("/ws/liveview", get(live_view_ws_handler))
        .route("/ws/events", get(events_ws_handler))
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .with_state(state)
}

/// Root handler - API info
async fn root_handler() -> impl IntoResponse {
    Json(json!({
        "name": "Sony Photobooth Host API",
        "version": "1.0.0",
        "endpoints": [
            "GET /status",
            "POST /sessions",
            "GET /sessions/:id",
            "POST /sessions/:id/capture",
            "POST /sessions/:id/reset",
            "GET /settings",
            "PATCH /settings",
            "GET /ws/liveview",
            "GET /ws/events"
        ]
    }))
}

/// Get status handler
async fn status_handler(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let settings = state.settings.read().await;
    let bridge_status = state.session_manager.get_sdk_bridge_status().await;

    // Get current session (most recently created that's not published)
    let sessions = state.session_manager.get_all_sessions().await;
    let current_session = sessions
        .into_iter()
        .filter(|s| s.state != SessionState::Published && s.state != SessionState::Error)
        .max_by_key(|s| s.created_at);

    let camera_connected = matches!(
        bridge_status,
        crate::session_manager::SdkBridgeStatus::Connected
    );

    let current_session_id = current_session.as_ref().map(|s| s.id.clone());

    let response = StatusResponse {
        runtime: "local-host".to_string(),
        camera: CameraState {
            connected: camera_connected,
            model: if camera_connected {
                "Sony ILCE-7M4".to_string()
            } else {
                "Not connected".to_string()
            },
            transport: "USB-C".to_string(),
            firmware: "4.01".to_string(),
            sdk_version: "2.01.00".to_string(),
        },
        current_session_id,
        local_storage_path: settings.local_storage_root.clone(),
        operator_locked: false,
        latest_share_url: None,
        settings: OperatorSettings {
            aspect_preset: "landscape-3-2".to_string(),
            save_destination: "pc".to_string(),
            shutter_mode: "single".to_string(),
            timer_mode: "3s".to_string(),
            local_host_url: format!("http://{}:{}", settings.bind_address, settings.port),
        },
        capture_backend: match settings.sdk_capture_mode {
            crate::settings::SdkCaptureMode::Primary => "sdk-primary",
            crate::settings::SdkCaptureMode::FallbackOnly => "fallback-only",
        }
        .to_string(),
        fallback_capture_mode: settings.fallback_capture_mode.map(|m| {
            match m {
                crate::settings::FallbackCaptureMode::Hdmi => "hdmi",
                crate::settings::FallbackCaptureMode::Remote => "remote",
                crate::settings::FallbackCaptureMode::UsbStream => "usb-stream",
            }
            .to_string()
        }),
        file_watcher_status: current_session
            .as_ref()
            .map(|session| match session.file_watch_status {
                crate::session_manager::FileWatchStatus::Idle => "idle",
                crate::session_manager::FileWatchStatus::Watching => "watching",
                crate::session_manager::FileWatchStatus::FileDetected => "file_detected",
                crate::session_manager::FileWatchStatus::Timeout => "timeout",
                crate::session_manager::FileWatchStatus::Error => "error",
            })
            .unwrap_or(if settings.enable_file_watcher {
                "idle"
            } else {
                "error"
            })
            .to_string(),
        file_watcher_root: settings.local_storage_root.clone(),
        file_arrival_timeout_seconds: settings.file_arrival_timeout_seconds,
        live_view_status: if settings.enable_live_view && camera_connected {
            "streaming"
        } else {
            "disconnected"
        }
        .to_string(),
        sdk_bridge_status: match bridge_status {
            crate::session_manager::SdkBridgeStatus::Disconnected => "disconnected",
            crate::session_manager::SdkBridgeStatus::Initialized => "disconnected",
            crate::session_manager::SdkBridgeStatus::Connected => "connected",
        }
        .to_string(),
        sdk_version: "2.01.00".to_string(),
        bridge_version: "1.0.0".to_string(),
    };

    Json(response)
}

/// List sessions handler
async fn list_sessions_handler(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let sessions = state.session_manager.get_all_sessions().await;
    (StatusCode::OK, Json(sessions))
}

/// Create session handler
async fn create_session_handler(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CreateSessionRequest>,
) -> Response {
    match state
        .session_manager
        .create_session(
            request.event_name.clone(),
            request.booth_mode,
            request.countdown_seconds,
        )
        .await
    {
        Ok(session) => {
            // Start file watching for this session
            let folder_path = session.session_folder_path.clone();
            let session_id = session.id.clone();

            if let Err(e) = state
                .file_watcher
                .start_watching(session_id.clone(), folder_path)
                .await
            {
                warn!(
                    "Failed to start file watching for session {}: {}",
                    session_id, e
                );
            }

            (StatusCode::CREATED, Json(session)).into_response()
        }
        Err(e) => {
            error!("Failed to create session: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": e.to_string() })),
            )
                .into_response()
        }
    }
}

/// Get session handler
async fn get_session_handler(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
) -> Response {
    match state.session_manager.get_session(&session_id).await {
        Some(session) => (StatusCode::OK, Json(session)).into_response(),
        None => (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Session not found" })),
        )
            .into_response(),
    }
}

/// Capture handler
async fn capture_handler(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
    Json(_request): Json<CaptureRequest>,
) -> Response {
    let mut rx = state.file_watcher.subscribe();

    // Start capture
    match state
        .session_manager
        .start_capture(&session_id, &mut rx)
        .await
    {
        Ok(session) => (StatusCode::OK, Json(session)).into_response(),
        Err(e) => {
            error!("Capture failed for session {}: {}", session_id, e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": e.to_string() })),
            )
                .into_response()
        }
    }
}

async fn get_asset_handler(
    State(state): State<Arc<AppState>>,
    Path((session_id, asset_id)): Path<(String, String)>,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let session = state
        .session_manager
        .get_session(&session_id)
        .await
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Session not found" })),
            )
        })?;

    let asset = session
        .assets
        .iter()
        .find(|asset| asset.id == asset_id)
        .ok_or_else(|| {
            (
                StatusCode::NOT_FOUND,
                Json(json!({ "error": "Asset not found" })),
            )
        })?;

    let bytes = tokio::fs::read(&asset.file_path).await.map_err(|e| {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": format!("Asset file unavailable: {}", e) })),
        )
    })?;

    let content_type = if asset.file_name.to_lowercase().ends_with(".png") {
        "image/png"
    } else {
        "image/jpeg"
    };

    Ok(([(header::CONTENT_TYPE, content_type)], bytes).into_response())
}

/// Reset session handler
async fn reset_session_handler(
    State(state): State<Arc<AppState>>,
    Path(session_id): Path<String>,
) -> Response {
    match state.session_manager.reset_session(&session_id).await {
        Ok(session) => (StatusCode::OK, Json(session)).into_response(),
        Err(e) => {
            error!("Failed to reset session {}: {}", session_id, e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({ "error": e.to_string() })),
            )
                .into_response()
        }
    }
}

/// Get settings handler
async fn get_settings_handler(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let settings = state.settings.read().await;
    Json(json!(settings.clone()))
}

/// Update settings handler
async fn update_settings_handler(
    State(state): State<Arc<AppState>>,
    Json(request): Json<UpdateSettingsRequest>,
) -> Response {
    let mut settings = state.settings.write().await;

    // Convert request to JSON and update
    let json_request = match serde_json::to_value(&request) {
        Ok(json) => json,
        Err(e) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({ "error": e.to_string() })),
            )
                .into_response();
        }
    };

    if let Err(e) = settings.update_from_json(&json_request) {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": e.to_string() })),
        )
            .into_response();
    }

    let updated_settings = settings.clone();

    // Save to file
    let config_path = Settings::default_config_path();
    if let Err(e) = updated_settings.save_to_file(&config_path) {
        warn!("Failed to save settings: {}", e);
    }

    drop(settings);
    state
        .session_manager
        .update_settings(updated_settings.clone())
        .await;

    (StatusCode::OK, Json(json!(updated_settings))).into_response()
}

/// Live view WebSocket handler
async fn live_view_ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_live_view_ws(socket, state))
}

/// Handle live view WebSocket connection
async fn handle_live_view_ws(mut socket: axum::extract::ws::WebSocket, state: Arc<AppState>) {
    info!("Live view WebSocket connected");

    loop {
        match state.session_manager.get_live_view_frame().await {
            Ok(Some(frame)) => {
                if socket
                    .send(axum::extract::ws::Message::Binary(frame.into()))
                    .await
                    .is_err()
                {
                    break;
                }
            }
            Ok(None) => {
                tokio::time::sleep(std::time::Duration::from_millis(250)).await;
            }
            Err(e) => {
                warn!("Live view frame error: {}", e);
                break;
            }
        }

        tokio::time::sleep(std::time::Duration::from_millis(33)).await;
    }

    info!("Live view WebSocket disconnected");
}

/// Events WebSocket handler
async fn events_ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_events_ws(socket, state))
}

/// Handle events WebSocket connection
async fn handle_events_ws(mut socket: axum::extract::ws::WebSocket, state: Arc<AppState>) {
    info!("Events WebSocket connected");

    let mut rx = state.event_sender.subscribe();
    let settings = state.settings.read().await;
    let asset_base_url = format!("http://{}:{}", settings.bind_address, settings.port);
    drop(settings);

    loop {
        tokio::select! {
            event = rx.recv() => {
                match event {
                    Ok(event) => {
                        let json = serialize_ws_event(&event, &asset_base_url);
                        if socket
                            .send(axum::extract::ws::Message::Text(json.into()))
                            .await
                            .is_err()
                        {
                            break;
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(skipped)) => {
                        warn!("Events WebSocket lagged, skipped {} event(s)", skipped);
                    }
                    Err(broadcast::error::RecvError::Closed) => break,
                }
            }
            msg = socket.recv() => {
                match msg {
                    Some(Ok(axum::extract::ws::Message::Close(_))) => break,
                    Some(Ok(_)) => {}
                    Some(Err(_)) | None => break,
                }
            }
        }
    }

    info!("Events WebSocket disconnected");
}

fn serialize_ws_event(event: &SessionEvent, asset_base_url: &str) -> String {
    let json = match event {
        SessionEvent::CaptureStarted {
            session_id,
            timestamp,
        } => json!({
            "type": "capture_started",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": null
        }),
        SessionEvent::CountdownTick {
            session_id,
            seconds_remaining,
            timestamp,
        } => json!({
            "type": "countdown_tick",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": {
                "seconds_remaining": seconds_remaining
            }
        }),
        SessionEvent::ShutterTriggered {
            session_id,
            timestamp,
        } => json!({
            "type": "shutter_triggered",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": null
        }),
        SessionEvent::FileDetected {
            session_id,
            file_name,
            file_path,
            file_size,
            timestamp,
        } => json!({
            "type": "file_detected",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": {
                "file_name": file_name,
                "file_path": file_path,
                "file_size": file_size
            }
        }),
        SessionEvent::AssetRegistered {
            session_id,
            asset,
            timestamp,
        } => json!({
            "type": "asset_registered",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": {
                "id": asset.id,
                "sessionId": session_id,
                "fileName": asset.file_name,
                "imageUrl": format!("{}/sessions/{}/assets/{}", asset_base_url, session_id, asset.id),
                "thumbnailUrl": format!("{}/sessions/{}/assets/{}", asset_base_url, session_id, asset.id),
                "capturedAt": asset.captured_at,
                "width": asset.width,
                "height": asset.height,
                "deliveryStatus": "local"
            }
        }),
        SessionEvent::CaptureFailed {
            session_id,
            error,
            timestamp,
        } => json!({
            "type": "capture_failed",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": {
                "error": error
            }
        }),
        SessionEvent::CaptureTimeout {
            session_id,
            timestamp,
        } => json!({
            "type": "capture_timeout",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": null
        }),
        SessionEvent::StateChanged {
            session_id,
            old_state,
            new_state,
            timestamp,
        } => json!({
            "type": "state_changed",
            "timestamp": timestamp,
            "sessionId": session_id,
            "payload": {
                "old_state": old_state.to_string(),
                "new_state": new_state.to_string()
            }
        }),
    };

    serde_json::to_string(&json).unwrap_or_else(|_| "{}".to_string())
}
