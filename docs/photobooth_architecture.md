# Photobooth Architecture

`Photobooth` là vertical trong `apps/web`, dùng ref ở `REF/stitch_giao_dien_photobooth` làm visual source of truth và đang tiến dần sang local runtime thật cho booth machine.

## Runtime layers

- `apps/web`: product shell, capture UI, gallery UI, review UI, public share route
- `apps/booth-host`: local Rust runtime, target chính là Windows booth machine
- `apps/booth-bridge`: C/C++ shim gọi Sony Camera Remote SDK
- `REF/CrSDK_v2.01.00_20260203a_Win64`: internal SDK reference package

## Current state

- web layer đã là `host-first runtime shell`
- mock data không còn là default runtime source
- pages và API routes đã phân biệt rõ `ok`, `host unavailable`, `not found`
- Rust host đã có session lifecycle, file watcher, events websocket, asset serving và live-view binary path ở mức code
- validation tiếp theo phải diễn ra trên Windows vì Sony SDK + bridge + booth runtime đều target Windows

## Responsibilities

### Next.js

- route `/photobooth`
- route `/photobooth/capture`
- route `/photobooth/gallery`
- route `/photobooth/review/[sessionId]`
- route `/photobooth/share/[sessionId]`
- đọc host status và session payload
- render unavailable state khi host không phản hồi
- expose host-backed API semantics cho runtime web

### Rust booth host

- manage session lifecycle
- manage local storage/session folders
- wait for file arrival after capture
- serve asset files cho gallery/review/share
- provide local HTTP API và WebSocket endpoints cho booth machine
- fan out session events cho web client

### C++ bridge

- isolate Sony SDK types and callbacks
- expose a small C ABI for Rust
- keep Sony dependency surface out of the web app and Rust business logic
- chịu trách nhiệm cho camera connection, capture trigger và live view gọi qua Sony SDK

## Runtime contract summary

### Web pages

- `/photobooth`: landing và runtime overview
- `/photobooth/capture`: capture workspace, host-backed
- `/photobooth/gallery`: asset gallery, host-backed
- `/photobooth/review/[sessionId]`: session review
- `/photobooth/share/[sessionId]`: public/local share page

### Host HTTP routes

- `GET /status`
- `GET /sessions`
- `POST /sessions`
- `GET /sessions/:id`
- `POST /sessions/:id/capture`
- `POST /sessions/:id/reset`
- `GET /sessions/:id/assets/:asset_id`
- `GET /settings`
- `PATCH /settings`

### Host WebSocket routes

- `GET /ws/liveview`
- `GET /ws/events`

## Validation note

Trên Fedora hiện tại mới chỉ xác nhận được web layer và static Rust review. Validation còn thiếu phải thực hiện trên Windows booth machine; xem `docs/photobooth_windows_handover.md`.
