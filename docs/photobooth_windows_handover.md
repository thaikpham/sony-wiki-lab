# Photobooth Windows Handover

Tài liệu này dùng cho phiên tiếp theo khi test `Photobooth` trên máy Windows booth machine.

## Goal

Xác nhận ba lớp sau hoạt động nối tiếp nhau:

1. `apps/booth-bridge` load được Sony SDK
2. `apps/booth-host` build/test và chạy được local runtime
3. `apps/web` đọc host thật, tạo session, capture, review, gallery, share đúng

## Current known state from previous session

- web layer đã là host-first runtime shell
- mock data không còn là default runtime source cho photobooth
- Node/web checks đã pass:
  - `npm run test`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
  - `npm run smoke:photobooth`
- Rust host đã được vá thêm:
  - cross-platform `notify`
  - event websocket không còn double-use socket
  - settings sync vào `SessionManager`
  - file detection không duplicate asset/event
  - ownership issue trong `main.rs`
  - runtime helper path không còn hardcode Windows trên mọi OS

## Blocker on Fedora that motivated this handover

Local Fedora hiện đã cài được:

- `cargo`
- `rustc`
- `rustfmt`

Nhưng `cargo build` và `cargo test` của `apps/booth-host` vẫn bị chặn bởi:

```text
error: linker `cc` not found
```

Vì vậy lượt kế tiếp phải verify trên Windows machine có toolchain đầy đủ.

## Suggested Windows prerequisites

- Visual Studio Build Tools hoặc MSVC toolchain đầy đủ
- Rust stable toolchain
- Sony SDK internal bundle
- Sony driver/camera utility cần thiết
- Camera ở mode `PC Remote` hoặc `Remote Shoot`

## Repo locations to focus on

- `apps/booth-host`
- `apps/booth-bridge`
- `apps/web/app/photobooth`
- `apps/web/lib/photobooth`
- `docs/implementation_status.md`

## Test order

### 1. Web baseline

Từ repo root:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
npm run smoke:photobooth
```

Expected:

- toàn bộ pass
- khi host chưa chạy, photobooth pages hiện unavailable state rõ ràng

### 2. Rust host build

Trong `apps/booth-host`:

```bash
cargo build
cargo test
```

Expected:

- không còn compile error
- không còn test fail

Nếu fail:

- chụp nguyên lỗi đầu tiên
- ưu tiên sửa compile error trước runtime behavior

### 3. Bridge + host startup

Sau khi build pass:

```bash
cargo run
```

Expected:

- host bind lên `127.0.0.1:3333` theo config mặc định
- log báo trạng thái bridge rõ ràng
- nếu không thấy SDK bridge thì phải hiện fallback-only warning, không crash

Smoke API:

- `GET /status`
- `GET /sessions`
- `GET /settings`

Expected:

- đều trả response hợp lệ

### 4. Session lifecycle

Test flow:

1. tạo session mới
2. xác nhận host bắt đầu watch folder session
3. trigger capture
4. xác nhận countdown
5. xác nhận shutter trigger
6. xác nhận file detect
7. xác nhận asset registered
8. xác nhận state sang `review`

Expected events:

- `capture_started`
- `countdown_tick`
- `shutter_triggered`
- `file_detected`
- `asset_registered`
- `state_changed`

### 5. Live view

Test `GET /ws/liveview`.

Expected:

- nếu camera + bridge hỗ trợ live view, nhận binary frames
- nếu live view chưa sẵn sàng, host phải degrade rõ ràng chứ không panic

### 6. Web integration with host running

Chạy `apps/web` rồi kiểm tra:

- `/photobooth`
- `/photobooth/capture`
- `/photobooth/gallery`
- `/photobooth/review/[sessionId]`
- `/photobooth/share/[sessionId]`

Expected:

- `/photobooth/capture` tạo hoặc dùng session thật
- gallery hiển thị asset thật từ host
- review/share đọc đúng session thật
- API semantics vẫn đúng:
  - host up + valid data => `200`
  - host up + session missing => `404`

## High-priority files if something breaks

- `apps/booth-host/src/main.rs`
- `apps/booth-host/src/routes.rs`
- `apps/booth-host/src/session_manager.rs`
- `apps/booth-host/src/file_watcher.rs`
- `apps/booth-host/src/settings.rs`
- `apps/booth-host/src/sdk_bridge.rs`
- `apps/web/lib/photobooth/host-client.ts`

## Likely issue classes to watch

- Windows-specific linker/build-tool mismatch
- Sony SDK DLL path mismatch
- bridge symbol load failure
- live-view frame shape mismatch
- file watcher không detect file mới trên Windows
- web/host payload shape mismatch
- asset route trả file path sai

## Definition of success for the next session

Photobooth có thể được nâng lên gần production-ready hơn khi đạt đủ:

1. `cargo build` pass trên Windows
2. `cargo test` pass trên Windows
3. host startup ổn định
4. create session -> capture -> file detect -> asset registered chạy thật
5. web capture/gallery/review/share đồng bộ với host thật

## After test

Sau khi test Windows xong, cập nhật lại ngay:

- `docs/implementation_status.md`
- `README.md`
- `project_report.md`

để trạng thái tài liệu bám đúng với kết quả verify thật.
