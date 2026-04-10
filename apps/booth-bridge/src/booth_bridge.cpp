#include "booth_bridge.h"

#include <cstring>
#include <string>
#include <vector>
#include <mutex>
#include <chrono>

// NOTE: To integrate with actual Sony Camera Remote SDK v2.01.00:
// 1. Extract headers from REF/CrSDK_v2.01.00_20260203a_Win64/CrSDK_API_Reference_v2.01.00.zip
// 2. Include Sony SDK headers here
// 3. Link against CrSDK libraries
// 4. Replace stub implementations with actual SDK calls

// Example Sony SDK includes (when available):
// #include <CameraRemote_SDK.h>
// #include <CrDeviceProperty.h>
// #include <CrImageDataBlock.h>

namespace {

// Global state (protected by mutex for thread safety)
struct BridgeState {
    std::mutex mutex;
    bool sdk_initialized = false;
    bool camera_connected = false;
    bool live_view_active = false;
    std::string save_directory;
    std::string last_file_path;
    std::string last_error;
    PbCameraInfo camera_info{};
    PbCameraSettings camera_settings{};
    std::vector<PbCameraInfo> discovered_cameras;
    
    // Live view frame buffer
    std::vector<uint8_t> live_view_buffer;
    int live_view_width = 0;
    int live_view_height = 0;
    
    // Mock data for testing without SDK
    bool mock_mode = true;
};

static BridgeState g_state;

// Version string
constexpr const char* kVersion = "1.0.0";

// Helper functions
void SetError(const char* error) {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    g_state.last_error = error;
}

const char* DuplicateString(const std::string& str) {
    char* result = new char[str.length() + 1];
    std::strcpy(result, str.c_str());
    return result;
}

std::string GenerateMockFilePath() {
    auto now = std::chrono::system_clock::now();
    auto time = std::chrono::system_clock::to_time_t(now);
    char timestamp[32];
    std::strftime(timestamp, sizeof(timestamp), "%Y%m%d_%H%M%S", std::localtime(&time));
    
    std::string dir = g_state.save_directory.empty() ? "C:/Temp" : g_state.save_directory;
    return dir + "/DSC_" + timestamp + ".JPG";
}

}  // namespace

// SDK Lifecycle
int pb_initialize_sdk() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (g_state.sdk_initialized) {
        return PB_ERR_ALREADY_INITIALIZED;
    }
    
    // TODO: Call Sony SDK Init function when integrating:
    // CrError err = CrSdk_Init();
    // if (err != CrError_None) {
    //     SetError("SDK initialization failed");
    //     return PB_ERR_SDK_ERROR;
    // }
    
    g_state.sdk_initialized = true;
    g_state.last_error.clear();
    
    return PB_OK;
}

int pb_shutdown_sdk() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.sdk_initialized) {
        return PB_ERR_NOT_INITIALIZED;
    }
    
    // Disconnect camera if connected
    if (g_state.camera_connected) {
        // TODO: Call Sony SDK disconnect
        g_state.camera_connected = false;
    }
    
    // Stop live view if active
    if (g_state.live_view_active) {
        g_state.live_view_active = false;
    }
    
    // TODO: Call Sony SDK Release function:
    // CrSdk_Release();
    
    g_state.sdk_initialized = false;
    g_state.last_error.clear();
    
    return PB_OK;
}

int pb_is_sdk_initialized() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    return g_state.sdk_initialized ? 1 : 0;
}

// Camera Enumeration and Connection
int pb_enumerate_cameras(PbCameraInfo* cameras, int max_count, int* out_count) {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.sdk_initialized) {
        return PB_ERR_NOT_INITIALIZED;
    }
    
    // TODO: Call Sony SDK enumerate function:
    // CrError err = CrEnumCameraObjects(&device_list, &device_count);
    
    // Mock implementation for testing
    g_state.discovered_cameras.clear();
    
    // Add a mock camera for testing
    PbCameraInfo mock_camera;
    std::strncpy(mock_camera.model, "Sony ILCE-7M4", sizeof(mock_camera.model));
    std::strncpy(mock_camera.id, "mock-camera-001", sizeof(mock_camera.id));
    mock_camera.transport = PB_TRANSPORT_USB;
    std::strncpy(mock_camera.firmware, "4.01", sizeof(mock_camera.firmware));
    std::strncpy(mock_camera.serial, "12345678", sizeof(mock_camera.serial));
    g_state.discovered_cameras.push_back(mock_camera);
    
    int count = static_cast<int>(g_state.discovered_cameras.size());
    if (count > max_count) {
        count = max_count;
    }
    
    for (int i = 0; i < count; ++i) {
        cameras[i] = g_state.discovered_cameras[i];
    }
    
    *out_count = count;
    return PB_OK;
}

int pb_connect_camera(const char* camera_id) {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.sdk_initialized) {
        return PB_ERR_NOT_INITIALIZED;
    }
    
    if (g_state.camera_connected) {
        // Already connected to a camera
        return PB_OK;
    }
    
    // TODO: Call Sony SDK connect function:
    // CrDeviceHandle handle;
    // CrError err = CrConnect(device_info, &handle);
    
    // Mock implementation
    std::strncpy(g_state.camera_info.model, "Sony ILCE-7M4", sizeof(g_state.camera_info.model));
    std::strncpy(g_state.camera_info.id, camera_id, sizeof(g_state.camera_info.id));
    g_state.camera_info.transport = PB_TRANSPORT_USB;
    std::strncpy(g_state.camera_info.firmware, "4.01", sizeof(g_state.camera_info.firmware));
    std::strncpy(g_state.camera_info.serial, "12345678", sizeof(g_state.camera_info.serial));
    
    // Set default camera settings
    std::strncpy(g_state.camera_settings.iso, "400", sizeof(g_state.camera_settings.iso));
    std::strncpy(g_state.camera_settings.shutter_speed, "1/125", sizeof(g_state.camera_settings.shutter_speed));
    std::strncpy(g_state.camera_settings.aperture, "f/2.8", sizeof(g_state.camera_settings.aperture));
    std::strncpy(g_state.camera_settings.white_balance, "Auto", sizeof(g_state.camera_settings.white_balance));
    g_state.camera_settings.image_quality = 0;  // Fine
    g_state.camera_settings.image_size = 0;     // Large
    
    g_state.camera_connected = true;
    g_state.last_error.clear();
    
    return PB_OK;
}

int pb_connect_first_camera() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.sdk_initialized) {
        return PB_ERR_NOT_INITIALIZED;
    }
    
    if (!g_state.discovered_cameras.empty()) {
        return pb_connect_camera(g_state.discovered_cameras[0].id);
    }
    
    // If no cameras discovered, try connecting with a mock ID
    return pb_connect_camera("mock-camera-001");
}

int pb_disconnect_camera() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.sdk_initialized) {
        return PB_ERR_NOT_INITIALIZED;
    }
    
    if (!g_state.camera_connected) {
        return PB_OK;  // Not an error if already disconnected
    }
    
    // TODO: Call Sony SDK disconnect function:
    // CrDisconnect(handle);
    
    if (g_state.live_view_active) {
        g_state.live_view_active = false;
    }
    
    g_state.camera_connected = false;
    std::memset(&g_state.camera_info, 0, sizeof(g_state.camera_info));
    
    return PB_OK;
}

int pb_is_camera_connected() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    return g_state.camera_connected ? 1 : 0;
}

// Capture Settings
int pb_set_save_directory(const char* directory_path) {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!directory_path) {
        return PB_ERR_INVALID_PARAM;
    }
    
    g_state.save_directory = directory_path;
    
    // TODO: Call Sony SDK set save directory:
    // CrSetSavePath(handle, directory_path);
    
    return PB_OK;
}

const char* pb_get_save_directory() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (g_state.save_directory.empty()) {
        return nullptr;
    }
    
    return DuplicateString(g_state.save_directory);
}

// Capture Operations
int pb_capture_single_frame() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.sdk_initialized) {
        return PB_ERR_NOT_INITIALIZED;
    }
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    // TODO: Call Sony SDK capture function:
    // CrError err = CrSendCommand(handle, CrCommandId_Release, 0);
    
    // Mock implementation - simulate capture delay and generate file path
    g_state.last_file_path = GenerateMockFilePath();
    
    return PB_OK;
}

int pb_capture_with_callback(void (*callback)(const PbCaptureResult* result)) {
    if (!callback) {
        return PB_ERR_INVALID_PARAM;
    }
    
    int ret = pb_capture_single_frame();
    
    PbCaptureResult result;
    result.success = (ret == PB_OK) ? 1 : 0;
    
    if (ret == PB_OK) {
        std::lock_guard<std::mutex> lock(g_state.mutex);
        std::strncpy(result.file_path, g_state.last_file_path.c_str(), sizeof(result.file_path));
        result.error_message[0] = '\0';
    } else {
        result.file_path[0] = '\0';
        std::strncpy(result.error_message, g_state.last_error.c_str(), sizeof(result.error_message));
    }
    
    callback(&result);
    
    return ret;
}

// File Retrieval
const char* pb_get_last_file_path() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (g_state.last_file_path.empty()) {
        return nullptr;
    }
    
    return DuplicateString(g_state.last_file_path);
}

int pb_get_last_capture_result(PbCaptureResult* result) {
    if (!result) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    result->success = g_state.last_file_path.empty() ? 0 : 1;
    
    if (result->success) {
        std::strncpy(result->file_path, g_state.last_file_path.c_str(), sizeof(result->file_path));
        result->error_message[0] = '\0';
    } else {
        result->file_path[0] = '\0';
        std::strncpy(result->error_message, g_state.last_error.c_str(), sizeof(result->error_message));
    }
    
    return PB_OK;
}

// Status and Info
const char* pb_get_status_json() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    std::string json = "{";
    json += "\"initialized\":" + std::string(g_state.sdk_initialized ? "true" : "false") + ",";
    json += "\"camera_connected\":" + std::string(g_state.camera_connected ? "true" : "false") + ",";
    json += "\"live_view_active\":" + std::string(g_state.live_view_active ? "true" : "false") + ",";
    json += "\"save_directory\":\"" + g_state.save_directory + "\",";
    json += "\"last_file_path\":\"" + g_state.last_file_path + "\",";
    json += "\"camera_model\":\"" + std::string(g_state.camera_info.model) + "\",";
    json += "\"sdk_version\":\"2.01.00\",";
    json += "\"bridge_version\":\"" + std::string(kVersion) + "\"";
    json += "}";
    
    return DuplicateString(json);
}

int pb_get_camera_info(PbCameraInfo* info) {
    if (!info) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    *info = g_state.camera_info;
    return PB_OK;
}

// Live View
int pb_start_live_view() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.sdk_initialized) {
        return PB_ERR_NOT_INITIALIZED;
    }
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    if (g_state.live_view_active) {
        return PB_OK;  // Already active
    }
    
    // TODO: Call Sony SDK start live view:
    // CrError err = CrSetLiveViewProperties(handle, ...);
    // Enable live view transfer
    
    // Initialize mock live view buffer (1024x768 MJPEG placeholder)
    g_state.live_view_width = 1024;
    g_state.live_view_height = 768;
    g_state.live_view_buffer.resize(65536);  // Placeholder size
    
    g_state.live_view_active = true;
    
    return PB_OK;
}

int pb_stop_live_view() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.live_view_active) {
        return PB_OK;  // Not an error if already stopped
    }
    
    // TODO: Call Sony SDK stop live view
    
    g_state.live_view_active = false;
    g_state.live_view_buffer.clear();
    g_state.live_view_width = 0;
    g_state.live_view_height = 0;
    
    return PB_OK;
}

int pb_is_live_view_active() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    return g_state.live_view_active ? 1 : 0;
}

int pb_get_live_view_frame(PbLiveViewFrame* frame) {
    if (!frame) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.live_view_active) {
        return PB_ERR_LIVE_VIEW_FAILED;
    }
    
    // TODO: Call Sony SDK get live view frame:
    // CrImageDataBlock* image_data;
    // CrError err = CrGetLiveViewImage(handle, &image_data);
    
    // Mock implementation - return pointer to buffer
    if (!g_state.live_view_buffer.empty()) {
        frame->data = g_state.live_view_buffer.data();
        frame->size = g_state.live_view_buffer.size();
        frame->width = g_state.live_view_width;
        frame->height = g_state.live_view_height;
        frame->format = 0;  // MJPEG
        frame->timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
    } else {
        frame->data = nullptr;
        frame->size = 0;
    }
    
    return PB_OK;
}

int pb_get_live_view_frame_copy(uint8_t* buffer, size_t buffer_size, size_t* out_size) {
    if (!buffer || !out_size) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.live_view_active) {
        return PB_ERR_LIVE_VIEW_FAILED;
    }
    
    if (g_state.live_view_buffer.empty()) {
        *out_size = 0;
        return PB_OK;
    }
    
    size_t copy_size = g_state.live_view_buffer.size();
    if (copy_size > buffer_size) {
        copy_size = buffer_size;
    }
    
    std::memcpy(buffer, g_state.live_view_buffer.data(), copy_size);
    *out_size = copy_size;
    
    return PB_OK;
}

// Camera Settings
int pb_get_camera_settings(PbCameraSettings* settings) {
    if (!settings) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    // TODO: Call Sony SDK get property functions:
    // CrDeviceProperty property;
    // CrError err = CrGetDeviceProperty(handle, CrDevicePropertyCode_Iso, &property);
    
    *settings = g_state.camera_settings;
    return PB_OK;
}

int pb_set_iso(const char* iso_value) {
    if (!iso_value) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    // TODO: Call Sony SDK set property:
    // CrError err = CrSetDeviceProperty(handle, CrDevicePropertyCode_Iso, iso_value);
    
    std::strncpy(g_state.camera_settings.iso, iso_value, sizeof(g_state.camera_settings.iso));
    
    return PB_OK;
}

int pb_set_shutter_speed(const char* shutter_speed) {
    if (!shutter_speed) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    // TODO: Call Sony SDK set property
    
    std::strncpy(g_state.camera_settings.shutter_speed, shutter_speed, 
                 sizeof(g_state.camera_settings.shutter_speed));
    
    return PB_OK;
}

int pb_set_aperture(const char* aperture) {
    if (!aperture) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    // TODO: Call Sony SDK set property
    
    std::strncpy(g_state.camera_settings.aperture, aperture, 
                 sizeof(g_state.camera_settings.aperture));
    
    return PB_OK;
}

int pb_set_white_balance(const char* white_balance) {
    if (!white_balance) {
        return PB_ERR_INVALID_PARAM;
    }
    
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (!g_state.camera_connected) {
        return PB_ERR_NOT_CONNECTED;
    }
    
    // TODO: Call Sony SDK set property
    
    std::strncpy(g_state.camera_settings.white_balance, white_balance,
                 sizeof(g_state.camera_settings.white_balance));
    
    return PB_OK;
}

// Utility
const char* pb_get_version() {
    return kVersion;
}

const char* pb_get_last_error() {
    std::lock_guard<std::mutex> lock(g_state.mutex);
    
    if (g_state.last_error.empty()) {
        return nullptr;
    }
    
    return DuplicateString(g_state.last_error);
}

void pb_free_string(const char* str) {
    delete[] str;
}
