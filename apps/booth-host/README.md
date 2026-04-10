# booth-host

Rust local runtime for Sony Photobooth. Target chính là Windows booth machine, nhưng code vẫn được giữ càng portable càng tốt để local review trên Linux/macOS không bị lệch quá nhiều.

## Responsibilities

- manage booth session lifecycle
- call the Sony SDK bridge through a C ABI
- persist capture metadata và file paths locally
- watch session folders và emit file-detected events
- expose local HTTP API và WebSocket endpoints cho web UI
- serve captured assets cho review/gallery/share routes

## Current API surface

- `GET /status`
- `GET /sessions`
- `POST /sessions`
- `GET /sessions/:id`
- `POST /sessions/:id/capture`
- `POST /sessions/:id/reset`
- `GET /sessions/:id/assets/:asset_id`
- `GET /settings`
- `PATCH /settings`
- `GET /ws/liveview`
- `GET /ws/events`

## Current implementation notes

- host đã có event fan-out qua broadcast
- capture flow đã dùng file watcher subscription thật thay vì receiver giả
- live view path hiện gửi binary frames nếu bridge trả được frame
- asset dimensions vẫn đang là placeholder `0 x 0`
- compile/runtime proof cuối cùng vẫn phải xác nhận trên Windows

## Integration boundary

This app should talk only to `apps/booth-bridge` and never bind directly to the Sony C++ SDK from Rust.

## Verification status

- web integration đã được nối theo host-first semantics
- local Fedora hiện đã có `cargo`/`rustc`, nhưng `cargo build/test` vẫn bị chặn vì thiếu linker host `cc`
- lượt verification tiếp theo nên dùng handover tại `docs/photobooth_windows_handover.md`
