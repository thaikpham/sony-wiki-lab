# Photobooth Architecture

`Photobooth` là vertical mới trong `apps/web`, dùng đúng ref ở `REF/stitch_giao_dien_photobooth` làm visual source of truth.

## Runtime layers

- `apps/web`: product shell, capture UI, gallery UI, review UI, public share route
- `apps/booth-host`: local Rust runtime trên Windows
- `apps/booth-bridge`: C/C++ shim gọi Sony Camera Remote SDK
- `REF/CrSDK_v2.01.00_20260203a_Win64`: internal SDK reference package

## Responsibilities

### Next.js

- route `/photobooth`
- route `/photobooth/capture`
- route `/photobooth/gallery`
- route `/photobooth/review/[sessionId]`
- route `/photobooth/share/[sessionId]`
- read public share payload

### Rust booth host

- manage session lifecycle
- manage local storage
- coordinate share payload generation
- provide local HTTP API for booth machine

### C++ bridge

- isolate Sony SDK types and callbacks
- expose a small C ABI for Rust
- keep Sony dependency surface out of the web app and Rust business logic
