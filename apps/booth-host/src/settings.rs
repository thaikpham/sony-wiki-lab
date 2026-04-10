use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tracing::{info, warn};

/// Photobooth settings for the SDK tethered-folder workflow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    /// Root directory for storing session folders
    /// Default: Platform-specific (Windows: C:/PhotoboothCaptures, Unix: ~/PhotoboothCaptures)
    #[serde(default = "default_storage_root")]
    pub local_storage_root: String,

    /// Pattern for session folder naming
    /// Available placeholders: {eventName}, {YYYY}, {MM}, {DD}, {id}, {timestamp}
    /// Default: "{eventName}/{YYYY}-{MM}-{DD}/session-{id}"
    #[serde(default = "default_session_folder_pattern")]
    pub session_folder_pattern: String,

    /// SDK capture mode - primary or fallback-only
    #[serde(default = "default_sdk_capture_mode")]
    pub sdk_capture_mode: SdkCaptureMode,

    /// Fallback capture mode when SDK is unavailable
    #[serde(default)]
    pub fallback_capture_mode: Option<FallbackCaptureMode>,

    /// Timeout in seconds for waiting for file arrival after capture
    #[serde(default = "default_file_arrival_timeout")]
    pub file_arrival_timeout_seconds: u64,

    /// Enable live view streaming
    #[serde(default = "default_enable_live_view")]
    pub enable_live_view: bool,

    /// Enable file watching for new images
    #[serde(default = "default_enable_file_watcher")]
    pub enable_file_watcher: bool,

    /// Path to the C++ SDK bridge DLL
    #[serde(default = "default_bridge_dll_path")]
    pub bridge_dll_path: String,

    /// HTTP server bind address
    #[serde(default = "default_bind_address")]
    pub bind_address: String,

    /// HTTP server port
    #[serde(default = "default_port")]
    pub port: u16,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum SdkCaptureMode {
    Primary,
    FallbackOnly,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum FallbackCaptureMode {
    Hdmi,
    Remote,
    UsbStream,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            local_storage_root: default_storage_root(),
            session_folder_pattern: default_session_folder_pattern(),
            sdk_capture_mode: default_sdk_capture_mode(),
            fallback_capture_mode: None,
            file_arrival_timeout_seconds: default_file_arrival_timeout(),
            enable_live_view: default_enable_live_view(),
            enable_file_watcher: default_enable_file_watcher(),
            bridge_dll_path: default_bridge_dll_path(),
            bind_address: default_bind_address(),
            port: default_port(),
        }
    }
}

// Default value functions
fn default_storage_root() -> String {
    if cfg!(target_os = "windows") {
        "C:/PhotoboothCaptures".to_string()
    } else {
        let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
        format!("{}/PhotoboothCaptures", home)
    }
}

fn default_session_folder_pattern() -> String {
    "{eventName}/{YYYY}-{MM}-{DD}/session-{id}".to_string()
}

fn default_sdk_capture_mode() -> SdkCaptureMode {
    SdkCaptureMode::Primary
}

fn default_file_arrival_timeout() -> u64 {
    10
}

fn default_enable_live_view() -> bool {
    true
}

fn default_enable_file_watcher() -> bool {
    true
}

fn default_bridge_dll_path() -> String {
    if cfg!(target_os = "windows") {
        "booth_bridge.dll".to_string()
    } else if cfg!(target_os = "macos") {
        "libbooth_bridge.dylib".to_string()
    } else {
        "libbooth_bridge.so".to_string()
    }
}

fn default_bind_address() -> String {
    "127.0.0.1".to_string()
}

fn default_port() -> u16 {
    3333
}

impl Settings {
    /// Load settings from a TOML file
    pub fn load_from_file<P: AsRef<Path>>(path: P) -> anyhow::Result<Self> {
        let content = std::fs::read_to_string(path)?;
        let settings: Settings = toml::from_str(&content)?;
        Ok(settings)
    }

    /// Save settings to a TOML file
    pub fn save_to_file<P: AsRef<Path>>(&self, path: P) -> anyhow::Result<()> {
        if let Some(parent) = path.as_ref().parent() {
            std::fs::create_dir_all(parent)?;
        }
        let content = toml::to_string_pretty(self)?;
        std::fs::write(path, content)?;
        Ok(())
    }

    /// Get the default config file path
    pub fn default_config_path() -> PathBuf {
        if cfg!(target_os = "windows") {
            PathBuf::from("C:/ProgramData/SonyPhotobooth/config.toml")
        } else {
            let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".to_string());
            PathBuf::from(format!("{}/.config/sony-photobooth/config.toml", home))
        }
    }

    /// Load settings from default location or create defaults
    pub fn load_or_default() -> Self {
        let config_path = Self::default_config_path();

        if config_path.exists() {
            match Self::load_from_file(&config_path) {
                Ok(settings) => {
                    info!("Loaded settings from {:?}", config_path);
                    settings
                }
                Err(e) => {
                    warn!("Failed to load settings from {:?}: {}", config_path, e);
                    warn!("Using default settings");
                    Settings::default()
                }
            }
        } else {
            info!("No config file found at {:?}, using defaults", config_path);
            let settings = Settings::default();

            // Try to create default config file
            if let Some(parent) = config_path.parent() {
                if std::fs::create_dir_all(parent).is_ok() {
                    if let Err(e) = settings.save_to_file(&config_path) {
                        warn!("Failed to save default config: {}", e);
                    } else {
                        info!("Created default config file at {:?}", config_path);
                    }
                }
            }

            settings
        }
    }

    /// Generate a session folder path based on the pattern
    pub fn generate_session_folder_path(&self, event_name: &str, session_id: &str) -> PathBuf {
        let now = chrono::Local::now();

        let folder_name = self
            .session_folder_pattern
            .replace("{eventName}", &sanitize_filename(event_name))
            .replace("{YYYY}", &now.format("%Y").to_string())
            .replace("{MM}", &now.format("%m").to_string())
            .replace("{DD}", &now.format("%d").to_string())
            .replace("{id}", session_id)
            .replace("{timestamp}", &now.timestamp().to_string());

        PathBuf::from(&self.local_storage_root).join(folder_name)
    }

    /// Validate settings
    pub fn validate(&self) -> anyhow::Result<()> {
        // Check storage root is not empty
        if self.local_storage_root.is_empty() {
            anyhow::bail!("local_storage_root cannot be empty");
        }

        // Check pattern contains required placeholders
        if !self.session_folder_pattern.contains("{id}") {
            anyhow::bail!("session_folder_pattern must contain {id} placeholder");
        }

        // Check timeout is reasonable
        if self.file_arrival_timeout_seconds == 0 {
            anyhow::bail!("file_arrival_timeout_seconds must be greater than 0");
        }

        // Check port is valid
        if self.port == 0 {
            anyhow::bail!("port cannot be 0");
        }

        Ok(())
    }

    /// Update settings from partial JSON object
    pub fn update_from_json(&mut self, json: &serde_json::Value) -> anyhow::Result<()> {
        if let Some(value) = json.get("local_storage_root").and_then(|v| v.as_str()) {
            self.local_storage_root = value.to_string();
        }

        if let Some(value) = json.get("session_folder_pattern").and_then(|v| v.as_str()) {
            self.session_folder_pattern = value.to_string();
        }

        if let Some(value) = json.get("sdk_capture_mode").and_then(|v| v.as_str()) {
            self.sdk_capture_mode = match value {
                "primary" => SdkCaptureMode::Primary,
                "fallback-only" => SdkCaptureMode::FallbackOnly,
                _ => anyhow::bail!("Invalid sdk_capture_mode"),
            };
        }

        if let Some(value) = json.get("fallback_capture_mode") {
            if value.is_null() {
                self.fallback_capture_mode = None;
            } else if let Some(mode) = value.as_str() {
                self.fallback_capture_mode = Some(match mode {
                    "hdmi" => FallbackCaptureMode::Hdmi,
                    "remote" => FallbackCaptureMode::Remote,
                    "usb-stream" => FallbackCaptureMode::UsbStream,
                    _ => anyhow::bail!("Invalid fallback_capture_mode"),
                });
            }
        }

        if let Some(value) = json
            .get("file_arrival_timeout_seconds")
            .and_then(|v| v.as_u64())
        {
            self.file_arrival_timeout_seconds = value;
        }

        if let Some(value) = json.get("enable_live_view").and_then(|v| v.as_bool()) {
            self.enable_live_view = value;
        }

        if let Some(value) = json.get("enable_file_watcher").and_then(|v| v.as_bool()) {
            self.enable_file_watcher = value;
        }

        if let Some(value) = json.get("bind_address").and_then(|v| v.as_str()) {
            self.bind_address = value.to_string();
        }

        if let Some(value) = json.get("port").and_then(|v| v.as_u64()) {
            self.port = value as u16;
        }

        self.validate()
    }
}

/// Sanitize a string to be safe for use in filenames
fn sanitize_filename(input: &str) -> String {
    input
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == ' ' || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect::<String>()
        .trim()
        .to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_settings() {
        let settings = Settings::default();
        assert!(!settings.local_storage_root.is_empty());
        assert!(settings.session_folder_pattern.contains("{id}"));
        assert_eq!(settings.file_arrival_timeout_seconds, 10);
        assert!(settings.enable_live_view);
        assert!(settings.enable_file_watcher);
    }

    #[test]
    fn test_generate_session_folder_path() {
        let settings = Settings::default();
        let path = settings.generate_session_folder_path("Test Event", "abc123");

        assert!(path.to_string_lossy().contains("Test_Event"));
        assert!(path.to_string_lossy().contains("abc123"));
        assert!(path.to_string_lossy().contains("session-"));
    }

    #[test]
    fn test_sanitize_filename() {
        assert_eq!(sanitize_filename("Test Event"), "Test Event");
        assert_eq!(sanitize_filename("Test/Event"), "Test_Event");
        assert_eq!(sanitize_filename("Test\\Event"), "Test_Event");
        assert_eq!(sanitize_filename("  Test  "), "Test");
    }

    #[test]
    fn test_validate() {
        let valid = Settings::default();
        assert!(valid.validate().is_ok());

        let mut invalid = Settings::default();
        invalid.local_storage_root = "".to_string();
        assert!(invalid.validate().is_err());

        let mut invalid = Settings::default();
        invalid.session_folder_pattern = "{eventName}/test".to_string();
        assert!(invalid.validate().is_err());
    }
}
