# Sony Wiki — Project Report & BMAD Snapshot

Tài liệu này tóm tắt trạng thái hiện tại của dự án theo góc nhìn BMAD: repo này là gì, runtime đang có gì thật, phần nào đã operational, phần nào vẫn là backlog/risk.

## 1. Executive summary

- Dự án chính: `sony-wiki`
- Runtime chính: `apps/web`
- Project knowledge: `docs/`
- Planning framework: `_bmad`
- Planning artifacts: `_bmad-output`
- Legacy reference: `../sony-wiki-ref/sony-wiki-dev`

Kết luận hiện tại:

- `sony-wiki` là source of truth cho runtime mới.
- Repo đã vượt qua giai đoạn foundation.
- `Wiki` đã là vertical hoạt động được với read flow, compare flow và admin CRUD.
- `Color Lab` đã lên mức internal-production: live data path, structured compatibility, storage-backed preview gallery và operator-ready admin workflow.
- `Photobooth` đã chuyển từ mock-backed demo shell sang host-first runtime shell ở web layer, nhưng Windows runtime verification vẫn còn mở.
- Điểm yếu còn lại nằm ở hardening, automation coverage, real auth và verification của runtime media/local-host workflow.

## 2. Project classification

- Repository type: monorepo
- Deployable runtime hiện có: 1 app (`apps/web`)
- Project type: web application
- Architecture pattern: single web runtime with vertical feature slices
- Primary language: TypeScript
- Backend/data pattern: Supabase public read + service-role write routes

## 3. Current-state capability map

### Shared shell

- landing page `/` đã có nội dung và định vị 2 workspace chính
- top navigation cố định
- global search cho products/categories
- dark/light theme persistence
- auth shell đủ các state UI nhưng chưa có auth integration thật

### Wiki

- listing runtime qua `/wiki`
- detail runtime qua `/wiki/[slug]`
- typed route state: `q`, `category`, `sort`, `compare`
- compare queue tối đa 4 item
- normalize specs từ JSON sang grouped specs
- admin verify + catalog + CRUD routes
- inline admin workspace ngay trong runtime mới

### Color Lab

- route `/color-lab`
- recipe library + URL-driven filters `q`, `cameraLine`, `profile`
- picture profile panel
- preview gallery gắn đúng recipe và có lightbox
- public read từ Supabase với `live`, `seeded-fallback`, `degraded` load states
- preview photos dùng Supabase Storage public bucket
- transfer guide card giữ lại từ ref cũ dưới dạng component độc lập
- admin catalog + CRUD cho recipes/photos qua shared-password session cookie
- recipe editor có compatibility fields và preset palette
- photo manager dùng upload flow thật, metadata update và storage cleanup

### Photobooth

- routes `/photobooth`, `/photobooth/capture`, `/photobooth/gallery`, `/photobooth/review/[sessionId]`, `/photobooth/share/[sessionId]`
- web layer không còn mock fallback mặc định cho runtime data
- API semantics đã rõ:
  - host unavailable => `503`
  - missing session => `404`
  - valid data => `200`
- capture page là host-backed runtime entrypoint, không còn là snapshot mock mặc định
- Node CI đã có smoke script cho photobooth
- booth host Rust đã có session lifecycle, file watcher subscription, event fan-out, asset serving và live-view websocket ở mức code
- Windows end-to-end verification với Sony SDK và bridge thật vẫn chưa được xác nhận

## 4. Phase assessment

### Phase 1: Foundation

Trạng thái: `completed`

Đã hoàn thành:

- monorepo + Turbo workflow
- Next.js 16 App Router runtime
- TypeScript-first config cho app/tooling chính
- semantic token layer trong `globals.css`
- theme persistence và hydration-safe toggle
- Supabase client foundations
- top-level app shell

### Phase 2: Wiki migration

Trạng thái: `operational, still hardening`

Đã hoàn thành:

- schema `wiki_categories`, `wiki_products`
- search indexes cho global search
- listing, detail, compare
- typed query/mapping/search-param layer
- admin CRUD cho categories và products

Còn lại:

- gallery/media workflow phong phú hơn
- related content hoặc cross-linking ở detail page
- automation coverage cho compare/admin flow
- mapping docs sâu hơn giữa legacy rules và runtime mới

### Phase 3: Color Lab migration

Trạng thái: `internal production ready, still needs browser automation hardening`

Đã hoàn thành:

- schema `color_lab_recipes`, `color_lab_photos`
- typed contracts, search params và mapper layer
- structured compatibility fields: `cameraLines`, `compatibilityNotes`
- real recipe-bound gallery với Supabase Storage public URLs
- URL-driven filters và explicit load-state handling
- lightbox + transfer guide card + preset swatch palette
- admin CRUD cho recipes/photos với upload/delete cleanup

Còn lại:

- browser smoke coverage cho public runtime và admin happy path
- auth/role model mạnh hơn shared-password admin
- deeper ops runbooks cho storage moderation/content lifecycle

### Phase 4: Photobooth runtime

Trạng thái: `host-first web complete, Windows runtime verification pending`

Đã hoàn thành:

- photobooth routes và API surface trong `apps/web`
- unavailable/not-found semantics cho SSR pages và API routes
- bỏ silent mock fallback khỏi runtime data layer
- Node smoke coverage cho photobooth
- Rust host refactor cho:
  - `GET /sessions`
  - `GET /sessions/:id/assets/:asset_id`
  - capture path dùng file watcher subscription thật
  - event websocket fan-out
  - live-view websocket gửi binary frame

Còn lại:

- `cargo build` và `cargo test` pass trên máy Windows có compiler/linker đầy đủ
- verify C++ bridge load và Sony SDK runtime proof
- live view thật với camera
- create session -> capture -> file detected -> asset registered -> review/share update

## 5. Risks and constraints

### Product/runtime risks

- auth thật chưa được nối; admin hiện dùng shared password pattern
- browser automation chưa có cho shell, wiki hay color-lab
- `Color Lab` vẫn có seed fallback cho trường hợp dataset trống hoặc source degraded, nên cần theo dõi load-state khi nghiệm thu
- `Photobooth` Rust host chưa có build/test proof trên máy hiện tại vì Fedora local thiếu linker `cc`
- Windows booth validation vẫn là gate chính trước khi gọi photobooth là production-ready v1

### Process risks

- CI hiện chưa chạy riêng `lint` và `typecheck`
- docs cũ dễ bị trôi khỏi runtime nếu chỉ cập nhật code mà quên `_bmad-output`

### Legacy boundary risk

- repo legacy vẫn hữu ích để đọc flow cũ, nhưng rất dễ kéo nhóm quay lại cấu trúc cũ nếu không giữ boundary rõ

## 6. Recommended next increments

1. Chạy handover test của photobooth trên Windows booth machine và sửa toàn bộ lỗi host/bridge/runtime lộ ra.
2. Bổ sung browser smoke coverage cho top navigation, search, wiki admin và color-lab admin.
3. Mở browser smoke coverage cho lightbox, transfer guide, admin upload flow và cache revalidation của `Color Lab`.
4. Thiết kế lại auth/admin story theo hướng role-based thay cho shared-password session cookie.
5. Tiếp tục chuẩn hóa docs mapping giữa legacy behavior và runtime mới cho các vertical còn đang migrate.

## 7. Verification snapshot

Verification nên dùng bộ gate sau:

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

Lưu ý:

- CI hiện chỉ bao phủ `build` và `npm test`
- `lint` và `typecheck` vẫn là gate local quan trọng

Kết quả xác nhận cục bộ ngày `2026-04-10`:

- `npm run test`: pass
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run build`: pass
- `npm run smoke:photobooth`: pass

## 8. BMAD execution note

Chu trình chuẩn cho repo này:

1. discovery từ code + docs
2. xác định vertical, phase và source of truth
3. thay đổi nhỏ, verified
4. cập nhật docs và `_bmad-output` nếu current state đổi
5. chỉ dùng legacy repo như input, không phải implementation target

*Cập nhật: 10/04/2026*
*Trạng thái tổng quan: Foundation hoàn tất, Wiki đã operational nhưng còn hardening, Color Lab đã đạt internal production, Photobooth đã host-first ở web layer và đang chờ Windows runtime verification*
