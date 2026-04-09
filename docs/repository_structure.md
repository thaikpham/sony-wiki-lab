# Repository Structure

Tài liệu này mô tả cấu trúc thư mục theo logic BMAD: xác định rõ workspace chính, vùng planning và vùng tham chiếu legacy.

## 1. Source of Truth

Thư mục làm việc chính là `sony-wiki/`.

Những phần hiện hành của hệ thống:

- `apps/web`: runtime chính đang phát triển
- `docs`: tài liệu dự án, rollout notes, migration plans
- `_bmad`: bộ workflow BMAD dùng cho planning và implementation support
- `codex.md`, `design_tokens.md`, `project_report.md`: tài liệu nền tảng của repo

## 2. Vai trò từng vùng

### `apps/web`

Ứng dụng Next.js 16 App Router hiện tại.

- `app/`: routes, layout, globals và API routes
- `components/layout/`: app shell, navigation, search, auth shell, theme toggle
- `components/scroll/`: smooth scroll và scroll-top helpers
- `lib/supabase/`: client, server và SQL migrations
- `types/`: shared typings cho navigation/search/auth shell

### `docs`

Nơi lưu tài liệu dự án theo phase và trạng thái rollout.

- tài liệu định hướng repo
- kế hoạch migration
- checklist rollout/hardening

### `_bmad`

Khung làm việc BMAD để:

- phân tích hiện trạng
- lập kế hoạch theo phase
- tạo implementation context
- review và đánh giá readiness

Đây không phải runtime code của sản phẩm. Chỉ sửa khi thực sự muốn tùy biến workflow BMAD của repo.

## 3. Runtime map hiện tại

### Routes

- `/`
- `/wiki`
- `/wiki/[slug]`
- `/color-lab`
- `/api/search`

### Dữ liệu

- schema wiki: `apps/web/lib/supabase/migrations/20260408_wiki_schema.sql`
- search index: `apps/web/lib/supabase/migrations/20260409_wiki_search_indexes.sql`

### App shell

- `ClientLayout`
- `TopNavigation`
- `GlobalSearch`
- `ThemeToggle`
- `AuthSlot`

## 4. Legacy Reference Zone

Thư mục `sony-wiki-ref/sony-wiki-dev` là codebase cũ.

Vai trò:

- tham chiếu feature đã từng tồn tại
- đối chiếu data model hoặc UX flow cũ
- làm nguồn đầu vào cho migration `wiki` và `color-lab`

Không nên:

- commit feature mới vào đây
- dùng cấu trúc cũ làm chuẩn cho app mới
- copy nguyên xi layout/runtime cũ sang `apps/web`

## 5. Migration logic

Thứ tự ưu tiên hiện tại:

1. Hoàn thiện `Wiki`
2. Sau đó mới sang `Color Lab`

Chu trình migrate nên là:

1. đọc flow cũ trong `sony-wiki-ref/sony-wiki-dev`
2. bóc tách business rules, data shape, admin use cases
3. ánh xạ vào kiến trúc mới trong `apps/web`
4. cập nhật docs phase và artifact cần thiết
5. mới triển khai runtime

## 6. Quy ước ra quyết định

Khi có mâu thuẫn giữa codebase mới và codebase cũ:

- ưu tiên `sony-wiki/`
- dùng `sony-wiki-ref/` chỉ như bằng chứng tham khảo
- nếu cần giữ lại hành vi cũ, phải ghi rõ trong docs migration hoặc project report

## 7. BMAD note cho lần coding sau

- Đọc hiện trạng runtime trước khi viết code.
- Không sửa `_bmad` chỉ để phản ánh website; cập nhật docs dự án trước.
- Nếu cấu trúc route, shell hoặc phase thay đổi, đồng bộ lại `README.md`, `codex.md` và `project_report.md`.
