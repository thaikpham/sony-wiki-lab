# Sony Wiki — Project Report & Roadmap

Tài liệu này tóm tắt trạng thái hiện tại của dự án theo hướng BMAD: xác định hiện trạng thật, source of truth, legacy zone và bước tiếp theo theo phase.

## Snapshot hiện tại

- Dự án chính: `sony-wiki/`
- Runtime chính: `sony-wiki/apps/web`
- Planning framework: `sony-wiki/_bmad`
- Legacy reference: `sony-wiki-ref/sony-wiki-dev`

### Kết luận hiện tại

- `sony-wiki` là codebase đang phát triển thật.
- `sony-wiki-ref` chỉ là đầu vào để đọc và migrate có chọn lọc.
- Foundation không còn ở mức khởi tạo repo; hiện đã có app shell, search API, wiki schema và wiki detail page.

## Phase 1: Foundation Setup

### Đã hoàn thành

- Thiết lập monorepo với workspace `apps/web`.
- Chuyển runtime sang Next.js 16 App Router.
- Chuẩn hóa stack UI sang HeroUI v3 + Tailwind CSS v4.
- Khởi tạo `shadcn` trong `apps/web` và áp TweakCN theme cho token layer.
- Thiết lập semantic design tokens trong `apps/web/app/globals.css`.
- Ổn định dark/light mode bằng cơ chế sync `localStorage` + `color-scheme` + class `.dark`.
- Sửa `ThemeToggle` theo hướng hydration-safe để tránh mismatch SSR/client.
- Bổ sung contrast override ở top navigation để bảo đảm khả năng đọc với theme hiện tại.
- Thiết lập Supabase client/server foundation.
- Tạo app shell hiện hành:
  - `ClientLayout`
  - `TopNavigation`
  - `GlobalSearch`
  - `ThemeToggle`
  - `AuthSlot`
- Tạo route nền:
  - `/`
  - `/wiki`
  - `/wiki/[slug]`
  - `/color-lab`
  - `/api/search`
- Tạo migration:
  - `20260408_wiki_schema.sql`
  - `20260409_wiki_search_indexes.sql`
- Tạo bộ tài liệu nền:
  - [README.md](./README.md)
  - [codex.md](./codex.md)
  - [design_tokens.md](./design_tokens.md)
- Theme registry đang dùng:
  - `https://tweakcn.com/r/themes/cmnr4nnqp000304kv7jxh4ag3`

### Trạng thái xác nhận

Đã xác nhận ngày `2026-04-09`:

- `npm run lint`: pass
- `npm run build`: pass

### Kết quả của Phase 1

Dự án đã có một nền tảng mới đủ ổn định để tiếp nhận migration theo từng module. Phase 1 được xem là hoàn tất.

## Phase 2: Wiki Migration

### Trạng thái hiện tại

Phase 2 đã bắt đầu và đang ở mức `in progress`.

### Đã có

- schema cơ bản cho `wiki_categories` và `wiki_products`
- global search API cho products và categories
- route detail `/wiki/[slug]` đọc dữ liệu từ Supabase
- route `/wiki` nhận `searchParams` cho `q` và `category`

### Chưa xong

- listing/grid thật cho `/wiki`
- filter UI thật theo category
- compare flow
- admin CRUD cho wiki products/categories
- media/gallery flow hoàn chỉnh
- mapping tài liệu đầy đủ giữa flow cũ và flow mới

### Mục tiêu còn lại

1. Hoàn thiện listing page `/wiki`.
2. Chuẩn hóa service/data access layer cho wiki thay vì để logic query nằm rải rác.
3. Bổ sung category-aware filtering và presentation rõ ràng hơn.
4. Xây admin CRUD cơ bản cho products/categories.
5. Hoàn thiện docs migration và business-rule mapping từ legacy.

Tham chiếu chi tiết: [docs/phase2_wiki_migration_plan.md](./docs/phase2_wiki_migration_plan.md)

## Phase 3: Color Lab Migration

### Trạng thái hiện tại

Chưa bắt đầu thực chất. Route `/color-lab` hiện vẫn là placeholder.

### Phạm vi chính

1. Tái thiết kế recipe model và media flow.
2. Xây dựng listing/detail hoặc workspace phù hợp với App Router hiện tại.
3. Chuẩn hóa storage strategy cho sample photos.
4. Ánh xạ compatibility giữa recipe và dòng máy.

## Vai trò của `sony-wiki-ref`

`sony-wiki-ref/sony-wiki-dev` được giữ lại để:

- tham chiếu UX flow cũ
- đọc business rules
- đối chiếu data fields
- phục vụ migration theo từng phase

Không dùng thư mục này để:

- phát triển feature mới
- sửa runtime chính
- làm chuẩn kiến trúc cho repo hiện tại

## BMAD execution note

Theo BMAD, mọi lần triển khai trong repo này nên đi theo chu trình:

1. Discovery:
   - đọc hiện trạng code và docs liên quan
2. Context framing:
   - xác định phase, phạm vi và source of truth
3. Small implementation:
   - thay đổi nhỏ, kiểm chứng được
4. Verification:
   - ít nhất chạy `lint`, và chạy `build` khi thay đổi ảnh hưởng runtime
5. Documentation sync:
   - cập nhật docs nếu trạng thái thực tế đã đổi

## Protocol cho AI Partner

1. Luôn xem `sony-wiki/apps/web` là runtime chính.
2. Luôn đọc [codex.md](./codex.md), [design_tokens.md](./design_tokens.md) và [docs/repository_structure.md](./docs/repository_structure.md) trước khi mở rộng feature.
3. Khi cần lấy context từ repo cũ, chỉ trích xuất logic cần thiết từ `sony-wiki-ref/sony-wiki-dev`.
4. Mọi planning artifact nên bám luồng BMAD trong `_bmad`.
5. Khi có xung đột giữa tài liệu cũ và cấu trúc mới, ưu tiên cấu trúc mới.

*Cập nhật: 09/04/2026*
*Trạng thái dự án: Phase 1 hoàn tất, Phase 2 đang triển khai*
