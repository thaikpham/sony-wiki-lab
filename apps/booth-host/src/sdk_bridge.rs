use libloading::{Library, Symbol};
use serde::{Deserialize, Serialize};
use std::ffi::{CStr, CString, c_char, c_int, c_void};
use std::path::Path;
use std::sync::{Arc, Mutex};
use thiserror::Error;
use tracing::{debug, error, info, warn};

/// Error codes from the C++ bridge
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(C)]
pub enum PbError {
    Ok = 0,
    NotInitialized = -1,
    AlreadyInitialized = -2,
    NoCamera = -3,
    CameraConnectFailed = -4,
    CaptureFailed = -5,
    InvalidParam = -6,
    SdkError = -7,
    NotConnected = -8,
    LiveViewFailed = -9,
}

impl PbError {
    pub fn from_i32(code: i32) -> Self {
        match code {
            0 => PbError::Ok,
            -1 => PbError::NotInitialized,
            -2 => PbError::AlreadyInitialized,
            -3 => PbError::NoCamera,
            -4 => PbError::CameraConnectFailed,
            -5 => PbError::CaptureFailed,
            -6 => PbError::InvalidParam,
            -7 => PbError::SdkError,
            -8 => PbError::NotConnected,
            -9 => PbError::LiveViewFailed,
            _ => PbError::SdkError,
        }
    }

    pub fn is_ok(&self) -> bool {
        matches!(self, PbError::Ok)
    }
}

impl std::fmt::Display for PbError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PbError::Ok => write!(f, "Success"),
            PbError::NotInitialized => write!(f, "SDK not initialized"),
            PbError::AlreadyInitialized => write!(f, "SDK already initialized"),
            PbError::NoCamera => write!(f, "No camera found"),
            PbError::CameraConnectFailed => write!(f, "Failed to connect to camera"),
            PbError::CaptureFailed => write!(f, "Capture failed"),
            PbError::InvalidParam => write!(f, "Invalid parameter"),
            PbError::SdkError => write!(f, "SDK error"),
            PbError::NotConnected => write!(f, "Camera not connected"),
            PbError::LiveViewFailed => write!(f, "Live view failed"),
        }
    }
}

#[derive(Error, Debug)]
pub enum BridgeError {
    #[error("Library loading failed: {0}")]
    LibraryLoad(String),

    #[error("Symbol not found: {0}")]
    SymbolNotFound(String),

    #[error("SDK error: {0}")]
    SdkError(PbError),

    #[error("Camera not connected")]
    CameraNotConnected,

    #[error("Invalid string conversion")]
    InvalidString,

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

/// Camera information structure matching C++ struct
#[repr(C)]
pub struct PbCameraInfo {
    pub model: [c_char; 64],
    pub id: [c_char; 32],
    pub transport: c_int,
    pub firmware: [c_char; 16],
    pub serial: [c_char; 32],
}

impl PbCameraInfo {
    pub fn model(&self) -> String {
        unsafe { c_string_to_string(self.model.as_ptr()) }
    }

    pub fn id(&self) -> String {
        unsafe { c_string_to_string(self.id.as_ptr()) }
    }

    pub fn firmware(&self) -> String {
        unsafe { c_string_to_string(self.firmware.as_ptr()) }
    }

    pub fn serial(&self) -> String {
        unsafe { c_string_to_string(self.serial.as_ptr()) }
    }
}

/// Capture result structure
#[repr(C)]
pub struct PbCaptureResult {
    pub success: c_int,
    pub file_path: [c_char; 512],
    pub error_message: [c_char; 256],
}

impl PbCaptureResult {
    pub fn file_path(&self) -> String {
        unsafe { c_string_to_string(self.file_path.as_ptr()) }
    }

    pub fn error_message(&self) -> String {
        unsafe { c_string_to_string(self.error_message.as_ptr()) }
    }
}

/// Live view frame structure
#[repr(C)]
pub struct PbLiveViewFrame {
    pub data: *const u8,
    pub size: usize,
    pub width: c_int,
    pub height: c_int,
    pub format: c_int, // 0 = MJPEG, 1 = YUV
    pub timestamp: u64,
}

/// Camera settings structure
#[repr(C)]
pub struct PbCameraSettings {
    pub iso: [c_char; 16],
    pub shutter_speed: [c_char; 16],
    pub aperture: [c_char; 8],
    pub white_balance: [c_char; 16],
    pub image_quality: c_int,
    pub image_size: c_int,
}

/// SDK Bridge wrapper for loading and calling C++ DLL
pub struct SdkBridge {
    library: Arc<Mutex<Library>>,
}

// Function type aliases for the C++ bridge functions
type PbInitializeSdk = unsafe extern "C" fn() -> c_int;
type PbShutdownSdk = unsafe extern "C" fn() -> c_int;
type PbIsSdkInitialized = unsafe extern "C" fn() -> c_int;
type PbEnumerateCameras = unsafe extern "C" fn(*mut PbCameraInfo, c_int, *mut c_int) -> c_int;
type PbConnectCamera = unsafe extern "C" fn(*const c_char) -> c_int;
type PbConnectFirstCamera = unsafe extern "C" fn() -> c_int;
type PbDisconnectCamera = unsafe extern "C" fn() -> c_int;
type PbIsCameraConnected = unsafe extern "C" fn() -> c_int;
type PbSetSaveDirectory = unsafe extern "C" fn(*const c_char) -> c_int;
type PbGetSaveDirectory = unsafe extern "C" fn() -> *const c_char;
type PbCaptureSingleFrame = unsafe extern "C" fn() -> c_int;
type PbGetLastFilePath = unsafe extern "C" fn() -> *const c_char;
type PbGetLastCaptureResult = unsafe extern "C" fn(*mut PbCaptureResult) -> c_int;
type PbGetStatusJson = unsafe extern "C" fn() -> *const c_char;
type PbGetCameraInfo = unsafe extern "C" fn(*mut PbCameraInfo) -> c_int;
type PbStartLiveView = unsafe extern "C" fn() -> c_int;
type PbStopLiveView = unsafe extern "C" fn() -> c_int;
type PbIsLiveViewActive = unsafe extern "C" fn() -> c_int;
type PbGetLiveViewFrame = unsafe extern "C" fn(*mut PbLiveViewFrame) -> c_int;
type PbGetLiveViewFrameCopy = unsafe extern "C" fn(*mut u8, usize, *mut usize) -> c_int;
type PbGetCameraSettings = unsafe extern "C" fn(*mut PbCameraSettings) -> c_int;
type PbSetIso = unsafe extern "C" fn(*const c_char) -> c_int;
type PbSetShutterSpeed = unsafe extern "C" fn(*const c_char) -> c_int;
type PbSetAperture = unsafe extern "C" fn(*const c_char) -> c_int;
type PbSetWhiteBalance = unsafe extern "C" fn(*const c_char) -> c_int;
type PbGetVersion = unsafe extern "C" fn() -> *const c_char;
type PbGetLastError = unsafe extern "C" fn() -> *const c_char;
type PbFreeString = unsafe extern "C" fn(*const c_char);

impl SdkBridge {
    /// Load the SDK bridge DLL
    pub fn new<P: AsRef<Path>>(library_path: P) -> Result<Self, BridgeError> {
        info!("Loading SDK bridge from: {:?}", library_path.as_ref());

        let library = unsafe {
            Library::new(library_path.as_ref())
                .map_err(|e| BridgeError::LibraryLoad(e.to_string()))?
        };

        info!("SDK bridge library loaded successfully");

        Ok(Self {
            library: Arc::new(Mutex::new(library)),
        })
    }

    /// Initialize the SDK
    pub fn initialize(&self) -> Result<(), BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbInitializeSdk> = unsafe {
            lib.get(b"pb_initialize_sdk")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_initialize_sdk: {}", e)))?
        };

        let result = unsafe { func() };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("SDK initialized successfully");
            Ok(())
        } else {
            warn!("SDK initialization failed: {}", error);
            Err(BridgeError::SdkError(error))
        }
    }

    /// Shutdown the SDK
    pub fn shutdown(&self) -> Result<(), BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbShutdownSdk> = unsafe {
            lib.get(b"pb_shutdown_sdk")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_shutdown_sdk: {}", e)))?
        };

        let result = unsafe { func() };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("SDK shutdown successfully");
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Check if SDK is initialized
    pub fn is_initialized(&self) -> bool {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbIsSdkInitialized> = unsafe {
            match lib.get(b"pb_is_sdk_initialized") {
                Ok(f) => f,
                Err(_) => return false,
            }
        };

        unsafe { func() != 0 }
    }

    /// Enumerate connected cameras
    pub fn enumerate_cameras(&self) -> Result<Vec<PbCameraInfo>, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbEnumerateCameras> = unsafe {
            lib.get(b"pb_enumerate_cameras")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_enumerate_cameras: {}", e)))?
        };

        let mut cameras: [PbCameraInfo; 16] = unsafe { std::mem::zeroed() };
        let mut count: c_int = 0;

        let result = unsafe { func(cameras.as_mut_ptr(), 16, &mut count) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            let count = count as usize;
            let mut result = Vec::with_capacity(count);
            for i in 0..count {
                result.push(unsafe { std::ptr::read(&cameras[i]) });
            }
            info!("Found {} cameras", count);
            Ok(result)
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Connect to a specific camera
    pub fn connect_camera(&self, camera_id: &str) -> Result<(), BridgeError> {
        let c_id = CString::new(camera_id).map_err(|_| BridgeError::InvalidString)?;

        let lib = self.library.lock().unwrap();
        let func: Symbol<PbConnectCamera> = unsafe {
            lib.get(b"pb_connect_camera")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_connect_camera: {}", e)))?
        };

        let result = unsafe { func(c_id.as_ptr()) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("Connected to camera: {}", camera_id);
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Connect to the first available camera
    pub fn connect_first_camera(&self) -> Result<(), BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbConnectFirstCamera> = unsafe {
            lib.get(b"pb_connect_first_camera")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_connect_first_camera: {}", e)))?
        };

        let result = unsafe { func() };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("Connected to first available camera");
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Disconnect from camera
    pub fn disconnect_camera(&self) -> Result<(), BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbDisconnectCamera> = unsafe {
            lib.get(b"pb_disconnect_camera")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_disconnect_camera: {}", e)))?
        };

        let result = unsafe { func() };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("Disconnected from camera");
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Check if camera is connected
    pub fn is_camera_connected(&self) -> bool {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbIsCameraConnected> = unsafe {
            match lib.get(b"pb_is_camera_connected") {
                Ok(f) => f,
                Err(_) => return false,
            }
        };

        unsafe { func() != 0 }
    }

    /// Set save directory for captured images
    pub fn set_save_directory(&self, directory: &str) -> Result<(), BridgeError> {
        let c_dir = CString::new(directory).map_err(|_| BridgeError::InvalidString)?;

        let lib = self.library.lock().unwrap();
        let func: Symbol<PbSetSaveDirectory> = unsafe {
            lib.get(b"pb_set_save_directory")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_set_save_directory: {}", e)))?
        };

        let result = unsafe { func(c_dir.as_ptr()) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            debug!("Save directory set to: {}", directory);
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Capture a single frame
    pub fn capture_single_frame(&self) -> Result<(), BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbCaptureSingleFrame> = unsafe {
            lib.get(b"pb_capture_single_frame")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_capture_single_frame: {}", e)))?
        };

        let result = unsafe { func() };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("Capture triggered successfully");
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Get the last captured file path
    pub fn get_last_file_path(&self) -> Result<Option<String>, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetLastFilePath> = unsafe {
            lib.get(b"pb_get_last_file_path")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_last_file_path: {}", e)))?
        };

        let free_func: Symbol<PbFreeString> = unsafe {
            lib.get(b"pb_free_string")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_free_string: {}", e)))?
        };

        let ptr = unsafe { func() };

        if ptr.is_null() {
            Ok(None)
        } else {
            let string = unsafe { c_ptr_to_string(ptr) };
            unsafe { free_func(ptr) };
            Ok(Some(string))
        }
    }

    /// Get the full capture result
    pub fn get_last_capture_result(&self) -> Result<PbCaptureResult, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetLastCaptureResult> = unsafe {
            lib.get(b"pb_get_last_capture_result")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_last_capture_result: {}", e)))?
        };

        let mut result: PbCaptureResult = unsafe { std::mem::zeroed() };
        let ret = unsafe { func(&mut result) };
        let error = PbError::from_i32(ret);

        if error.is_ok() {
            Ok(result)
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Get status as JSON string
    pub fn get_status_json(&self) -> Result<String, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetStatusJson> = unsafe {
            lib.get(b"pb_get_status_json")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_status_json: {}", e)))?
        };

        let free_func: Symbol<PbFreeString> = unsafe {
            lib.get(b"pb_free_string")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_free_string: {}", e)))?
        };

        let ptr = unsafe { func() };

        if ptr.is_null() {
            Ok("{}".to_string())
        } else {
            let string = unsafe { c_ptr_to_string(ptr) };
            unsafe { free_func(ptr) };
            Ok(string)
        }
    }

    /// Get camera information
    pub fn get_camera_info(&self) -> Result<PbCameraInfo, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetCameraInfo> = unsafe {
            lib.get(b"pb_get_camera_info")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_camera_info: {}", e)))?
        };

        let mut info: PbCameraInfo = unsafe { std::mem::zeroed() };
        let result = unsafe { func(&mut info) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            Ok(info)
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Start live view
    pub fn start_live_view(&self) -> Result<(), BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbStartLiveView> = unsafe {
            lib.get(b"pb_start_live_view")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_start_live_view: {}", e)))?
        };

        let result = unsafe { func() };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("Live view started");
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Stop live view
    pub fn stop_live_view(&self) -> Result<(), BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbStopLiveView> = unsafe {
            lib.get(b"pb_stop_live_view")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_stop_live_view: {}", e)))?
        };

        let result = unsafe { func() };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            info!("Live view stopped");
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Check if live view is active
    pub fn is_live_view_active(&self) -> bool {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbIsLiveViewActive> = unsafe {
            match lib.get(b"pb_is_live_view_active") {
                Ok(f) => f,
                Err(_) => return false,
            }
        };

        unsafe { func() != 0 }
    }

    /// Get a copy of the live view frame
    pub fn get_live_view_frame(&self, buffer: &mut [u8]) -> Result<usize, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetLiveViewFrameCopy> = unsafe {
            lib.get(b"pb_get_live_view_frame_copy")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_live_view_frame_copy: {}", e)))?
        };

        let mut out_size: usize = 0;
        let result = unsafe { func(buffer.as_mut_ptr(), buffer.len(), &mut out_size) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            Ok(out_size)
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Get camera settings
    pub fn get_camera_settings(&self) -> Result<PbCameraSettings, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetCameraSettings> = unsafe {
            lib.get(b"pb_get_camera_settings")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_camera_settings: {}", e)))?
        };

        let mut settings: PbCameraSettings = unsafe { std::mem::zeroed() };
        let result = unsafe { func(&mut settings) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            Ok(settings)
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Set ISO
    pub fn set_iso(&self, iso: &str) -> Result<(), BridgeError> {
        let c_iso = CString::new(iso).map_err(|_| BridgeError::InvalidString)?;

        let lib = self.library.lock().unwrap();
        let func: Symbol<PbSetIso> = unsafe {
            lib.get(b"pb_set_iso")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_set_iso: {}", e)))?
        };

        let result = unsafe { func(c_iso.as_ptr()) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            debug!("ISO set to: {}", iso);
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Set shutter speed
    pub fn set_shutter_speed(&self, shutter_speed: &str) -> Result<(), BridgeError> {
        let c_shutter = CString::new(shutter_speed).map_err(|_| BridgeError::InvalidString)?;

        let lib = self.library.lock().unwrap();
        let func: Symbol<PbSetShutterSpeed> = unsafe {
            lib.get(b"pb_set_shutter_speed")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_set_shutter_speed: {}", e)))?
        };

        let result = unsafe { func(c_shutter.as_ptr()) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            debug!("Shutter speed set to: {}", shutter_speed);
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Set aperture
    pub fn set_aperture(&self, aperture: &str) -> Result<(), BridgeError> {
        let c_aperture = CString::new(aperture).map_err(|_| BridgeError::InvalidString)?;

        let lib = self.library.lock().unwrap();
        let func: Symbol<PbSetAperture> = unsafe {
            lib.get(b"pb_set_aperture")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_set_aperture: {}", e)))?
        };

        let result = unsafe { func(c_aperture.as_ptr()) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            debug!("Aperture set to: {}", aperture);
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Set white balance
    pub fn set_white_balance(&self, white_balance: &str) -> Result<(), BridgeError> {
        let c_wb = CString::new(white_balance).map_err(|_| BridgeError::InvalidString)?;

        let lib = self.library.lock().unwrap();
        let func: Symbol<PbSetWhiteBalance> = unsafe {
            lib.get(b"pb_set_white_balance")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_set_white_balance: {}", e)))?
        };

        let result = unsafe { func(c_wb.as_ptr()) };
        let error = PbError::from_i32(result);

        if error.is_ok() {
            debug!("White balance set to: {}", white_balance);
            Ok(())
        } else {
            Err(BridgeError::SdkError(error))
        }
    }

    /// Get bridge version
    pub fn get_version(&self) -> Result<String, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetVersion> = unsafe {
            lib.get(b"pb_get_version")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_version: {}", e)))?
        };

        let ptr = unsafe { func() };

        if ptr.is_null() {
            Ok("unknown".to_string())
        } else {
            Ok(unsafe { c_ptr_to_string(ptr) })
        }
    }

    /// Get last error message
    pub fn get_last_error(&self) -> Result<Option<String>, BridgeError> {
        let lib = self.library.lock().unwrap();
        let func: Symbol<PbGetLastError> = unsafe {
            lib.get(b"pb_get_last_error")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_get_last_error: {}", e)))?
        };

        let free_func: Symbol<PbFreeString> = unsafe {
            lib.get(b"pb_free_string")
                .map_err(|e| BridgeError::SymbolNotFound(format!("pb_free_string: {}", e)))?
        };

        let ptr = unsafe { func() };

        if ptr.is_null() {
            Ok(None)
        } else {
            let string = unsafe { c_ptr_to_string(ptr) };
            unsafe { free_func(ptr) };
            Ok(Some(string))
        }
    }
}

/// Safe wrapper for converting C string to Rust String
unsafe fn c_string_to_string(ptr: *const c_char) -> String {
    if ptr.is_null() {
        return String::new();
    }

    CStr::from_ptr(ptr)
        .to_string_lossy()
        .into_owned()
}

/// Safe wrapper for converting C string pointer to Rust String
unsafe fn c_ptr_to_string(ptr: *const c_char) -> String {
    if ptr.is_null() {
        return String::new();
    }

    CStr::from_ptr(ptr)
        .to_string_lossy()
        .into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_codes() {
        assert!(PbError::Ok.is_ok());
        assert!(!PbError::NotInitialized.is_ok());
        assert!(!PbError::SdkError.is_ok());
    }
}
