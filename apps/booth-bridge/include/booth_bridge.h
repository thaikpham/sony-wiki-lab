#pragma once

#include <cstdint>
#include <cstddef>

#ifdef _WIN32
#define PB_EXPORT __declspec(dllexport)
#else
#define PB_EXPORT
#endif

// Error codes
#define PB_OK 0
#define PB_ERR_NOT_INITIALIZED -1
#define PB_ERR_ALREADY_INITIALIZED -2
#define PB_ERR_NO_CAMERA -3
#define PB_ERR_CAMERA_CONNECT_FAILED -4
#define PB_ERR_CAPTURE_FAILED -5
#define PB_ERR_INVALID_PARAM -6
#define PB_ERR_SDK_ERROR -7
#define PB_ERR_NOT_CONNECTED -8
#define PB_ERR_LIVE_VIEW_FAILED -9

// Camera connection transport types
#define PB_TRANSPORT_USB 0
#define PB_TRANSPORT_ETHERNET 1

// Struct for camera information
struct PbCameraInfo {
    char model[64];
    char id[32];
    int transport;
    char firmware[16];
    char serial[32];
};

// Struct for capture result
struct PbCaptureResult {
    int success;
    char file_path[512];
    char error_message[256];
};

// Struct for live view frame
struct PbLiveViewFrame {
    const uint8_t* data;
    size_t size;
    int width;
    int height;
    int format;  // 0 = MJPEG, 1 = YUV
    uint64_t timestamp;
};

// Struct for camera settings
struct PbCameraSettings {
    char iso[16];
    char shutter_speed[16];
    char aperture[8];
    char white_balance[16];
    int image_quality;
    int image_size;
};

extern "C" {

// SDK Lifecycle
PB_EXPORT int pb_initialize_sdk();
PB_EXPORT int pb_shutdown_sdk();
PB_EXPORT int pb_is_sdk_initialized();

// Camera Enumeration and Connection
PB_EXPORT int pb_enumerate_cameras(PbCameraInfo* cameras, int max_count, int* out_count);
PB_EXPORT int pb_connect_camera(const char* camera_id);
PB_EXPORT int pb_connect_first_camera();
PB_EXPORT int pb_disconnect_camera();
PB_EXPORT int pb_is_camera_connected();

// Capture Settings
PB_EXPORT int pb_set_save_directory(const char* directory_path);
PB_EXPORT const char* pb_get_save_directory();

// Capture Operations
PB_EXPORT int pb_capture_single_frame();
PB_EXPORT int pb_capture_with_callback(void (*callback)(const PbCaptureResult* result));

// File Retrieval
PB_EXPORT const char* pb_get_last_file_path();
PB_EXPORT int pb_get_last_capture_result(PbCaptureResult* result);

// Status and Info
PB_EXPORT const char* pb_get_status_json();
PB_EXPORT int pb_get_camera_info(PbCameraInfo* info);

// Live View
PB_EXPORT int pb_start_live_view();
PB_EXPORT int pb_stop_live_view();
PB_EXPORT int pb_is_live_view_active();
PB_EXPORT int pb_get_live_view_frame(PbLiveViewFrame* frame);
PB_EXPORT int pb_get_live_view_frame_copy(uint8_t* buffer, size_t buffer_size, size_t* out_size);

// Camera Settings
PB_EXPORT int pb_get_camera_settings(PbCameraSettings* settings);
PB_EXPORT int pb_set_iso(const char* iso_value);
PB_EXPORT int pb_set_shutter_speed(const char* shutter_speed);
PB_EXPORT int pb_set_aperture(const char* aperture);
PB_EXPORT int pb_set_white_balance(const char* white_balance);

// Utility
PB_EXPORT const char* pb_get_version();
PB_EXPORT const char* pb_get_last_error();
PB_EXPORT void pb_free_string(const char* str);

}  // extern "C"
