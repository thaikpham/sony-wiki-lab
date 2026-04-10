# booth-host

Rust local runtime for Sony Photobooth on Windows.

## Responsibilities

- manage booth session lifecycle
- call the Sony SDK bridge through a C ABI
- persist capture metadata and file paths locally
- expose a local HTTP API for the web UI
- generate public share payloads for Next.js routes

## Planned API surface

- `GET /status`
- `POST /sessions`
- `POST /sessions/:id/capture`
- `POST /sessions/:id/publish`
- `POST /sessions/:id/reset`
- `GET /sessions`
- `GET /sessions/:id`
- `PATCH /settings`
- `POST /operator/unlock`

## Integration boundary

This app should talk only to `apps/booth-bridge` and never bind directly to the
Sony C++ SDK from Rust.
