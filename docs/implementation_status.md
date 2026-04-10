# SDK Tethered-Folder Photobooth - Implementation Status

## Executive summary

Trạng thái hiện tại của `photobooth` đã tiến thêm một bước rõ rệt:

- web runtime không còn fallback sang mock data mặc định
- SSR pages và API routes đã phân biệt rõ `ok`, `host unavailable`, và `not found`
- smoke script cho photobooth đã được thêm vào CI Node workflow
- booth host đã được vá lại theo hướng event fan-out + file watcher subscription thật
- vẫn chưa nên xem toàn bộ stack là production-ready vì Rust host chưa được verify build/test trong môi trường hiện tại

Đánh giá tổng thể theo current codebase:

| Area | Mức hoàn thiện | Nhận xét |
|------|----------------|----------|
| C++ bridge surface | ~60% | API surface và build config đã có, nhưng call Sony SDK thật vẫn là TODO/mock |
| Rust host architecture | ~75% | Session list, event fan-out, asset serving, live-view binary path, file watcher subscription đã được nối lại; vẫn thiếu compile verification |
| TypeScript contracts | ~90% | Contracts + host normalization rõ hơn và đang làm source of truth cho web layer |
| Web integration | ~80% | Pages/APIs đã host-backed, không dùng silent mock fallback, có unavailable state rõ ràng |
| End-to-end runtime | ~50% | Flow web đã bám runtime semantics đúng hơn, nhưng host Rust chưa có build/test proof local nên chưa thể chốt end-to-end |

Kết luận ngắn:

- Đây không còn là mock-driven photobooth UI như trước
- Web layer đã ở mức `host-first runtime shell`
- Production-ready vẫn bị chặn bởi `Rust toolchain verification + Sony SDK runtime proof`

---

## Verified current state

### 1. Web runtime và route semantics

Đã triển khai:

- `apps/web/lib/photobooth/host-client.ts` chuyển sang host-only client, không còn import fixture để fallback âm thầm
- release metadata được tách ra riêng trong `release-manifest.ts`
- pages `overview`, `capture`, `gallery`, `review`, `share` bây giờ đọc host state thật và render explicit unavailable state khi host không phản hồi
- API routes photobooth đổi semantics:
  - host unavailable => `503`
  - missing session => `404`
  - valid data => `200`

Điều này có nghĩa:

- `mock-data.ts` không còn là nguồn dữ liệu mặc định cho runtime app
- mock fixture hiện chỉ nên được xem là fixture/dev-only data

### 2. Photobooth smoke verification

Đã xác nhận trong repo này:

- `npm run typecheck` pass
- `npx eslint app/photobooth app/api/photobooth components/photobooth lib/photobooth` pass
- `npm test` pass
- `npm run build` pass

Smoke behavior khi booth host **không chạy**:

- `/photobooth` trả `200` và render banner `Booth Host Unavailable`
- `/photobooth/capture` trả `200` và render state `Capture workspace needs a live booth host`
- `/photobooth/gallery` trả `200` và render state unavailable rõ ràng
- `/photobooth/share/[sessionId]` trả `200` và render state unavailable rõ ràng
- `/api/photobooth/gallery` trả `503`
- `/api/photobooth/share/[sessionId]` trả `503`
- `/api/photobooth/public/session/[sessionId]` trả `503`
- negative path `review/share` với session không tồn tại vẫn giữ logic `404`

Ngoài ra:

- smoke script mới `scripts/photobooth-smoke.sh` đã được thêm vào CI
- workflow `.github/workflows/node.js.yml` hiện chạy smoke photobooth ở Node `22.x`

### 3. Rust booth host

Đã cải thiện về mặt code:

- thêm `GET /sessions`
- thêm route phục vụ asset file thật `/sessions/:id/assets/:asset_id`
- `capture_handler` giờ subscribe vào file watcher thật, không còn tạo receiver giả
- file watcher chuyển sang `broadcast`, cho phép nhiều consumer cùng subscribe
- events websocket chuyển sang fan-out từ event bus thật
- live-view websocket gửi binary frame thay vì text placeholder
- event payload `asset_registered` đã map ra asset JSON hợp với web client hiện tại

Điểm còn thiếu:

- chưa verify `cargo build`
- chưa verify `cargo test`
- chưa verify live-view binary path với camera và bridge thật
- dimensions asset vẫn đang là placeholder `0 x 0`

### 4. Toolchain reality

Môi trường hiện tại **không có**:

- `cargo`
- `rustc`

Nên phần Rust host mới chỉ được xác nhận ở mức:

- static inspection
- integration intent với web
- codepath refactor

chứ **chưa có bằng chứng compile/runtime local**.

---

## Logic and code quality assessment

### Điểm mạnh hiện tại

- decomposition `C++ bridge -> Rust host -> Next.js web` tiếp tục là hướng đúng
- web layer đã rõ ràng hơn rất nhiều về source of truth
- error semantics của photobooth bây giờ thực tế hơn, dễ debug hơn
- capture container đã được nâng lên thành runtime-first entrypoint, không còn chỉ là snapshot UI
- booth host bắt đầu có hình dạng của local runtime API thật, không còn chỉ là route scaffold

### Điểm yếu hiện tại

- Rust host vẫn thiếu compile verification
- live-view và asset serving path mới được nối logic nhưng chưa test với bridge thật
- publish/share model vẫn còn ở mức local v1, chưa có proof cloud sync
- docs trước đây bị overstate completion; hiện tại cần tiếp tục giữ nguyên tắc chỉ đánh dấu complete khi có verification thật

### Đánh giá chất lượng

| Tiêu chí | Đánh giá |
|----------|----------|
| Kiến trúc | Tốt |
| Tách lớp / maintainability | Tốt |
| Độ rõ ràng mock vs real | Tốt hơn rõ rệt |
| Độ hoàn thiện runtime | Trung bình khá |
| Độ tin cậy end-to-end | Trung bình |
| Mức production-ready | Chưa đạt |

---

## Current verdict

Nếu mô tả ngắn gọn và chính xác hơn cho current state:

> Photobooth đã chuyển từ mock-backed demo shell sang host-first runtime shell. Web routes, API semantics, và smoke verification đã phản ánh đúng trạng thái booth host hơn trước; tuy nhiên Rust host vẫn chưa có `cargo build/test` proof trong môi trường hiện tại, và Sony SDK runtime thật vẫn chưa được verify end-to-end.

---

## Immediate next steps

1. Khi có Rust toolchain, chạy `cargo build --manifest-path apps/booth-host/Cargo.toml`.
2. Sau đó chạy `cargo test --manifest-path apps/booth-host/Cargo.toml`.
3. Sửa toàn bộ lỗi compile/test còn lại ở `apps/booth-host` trước khi nâng status phase host.
4. Khi host compile pass, chạy smoke flow có host thật:
   - create session
   - capture
   - file detected
   - asset registered
   - gallery/review/share cập nhật
5. Chỉ khi cả `web smoke + cargo build/test + local runtime smoke` đều pass thì mới gọi photobooth là `production-ready v1`.
