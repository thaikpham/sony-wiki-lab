# booth-bridge

Minimal C/C++ shim around Sony Camera Remote SDK v2.01.00 Win64.

## Goal

Expose a stable C ABI for the Rust booth host so the host does not need to
understand Sony's C++ types directly.

## Expected exported functions

- `pb_initialize_sdk`
- `pb_shutdown_sdk`
- `pb_enumerate_cameras`
- `pb_connect_first_camera`
- `pb_set_save_directory`
- `pb_capture_single_frame`
- `pb_get_last_file_path`
- `pb_get_status_json`

## SDK source of truth

Use the internal reference bundle at:

`REF/CrSDK_v2.01.00_20260203a_Win64`

Do not commit redistributed Sony binaries outside approved internal use.
