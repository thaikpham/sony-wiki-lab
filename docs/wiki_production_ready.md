# Wiki Production-Ready Boundary

## Current state

`apps/web` là runtime duy nhất của `wiki` ở thời điểm hiện tại.

- Public surface:
  - `/wiki`
  - `/wiki/[slug]`
  - `/api/search`
- Internal admin surface:
  - inline admin ngay trong `/wiki`
  - `POST /api/wiki/admin/verify`
  - `GET /api/wiki/admin/session`
  - `POST /api/wiki/admin/logout`
  - CRUD routes cho `wiki_categories` và `wiki_products`
  - `POST /api/wiki/media/upload`

`sony-wiki-ref` chỉ còn vai trò **tham chiếu migration** và không còn được dùng ở runtime.

## Legacy mapping

Luồng import legacy hiện đi theo snapshot JSON trong `REF/wiki/legacy-catalog.json` và script `scripts/wiki-import-legacy.ts`.

Rules đã khóa:

- `thumbnail -> main_image`
- `price -> price_vnd`
- giữ nguyên grouped `specs`
- giữ `subcategory`
- import mặc định với `is_published = false`
- upsert theo `slug`

Điều này cho phép migrate lặp lại để QA mà không kéo `ref` quay lại thành dependency của app mới.

## Admin and media workflow

Admin auth đã chuyển từ `sessionStorage + custom header` sang **signed HttpOnly cookie**:

- cookie name: `sony-wiki-admin-session`
- TTL: 8 giờ
- secret: `WIKI_ADMIN_SESSION_SECRET`, fallback về `WIKI_ADMIN_PASSWORD`

Browser không còn giữ raw password sau bước login.

Media workflow dùng Supabase Storage bucket public `wiki-media`:

- upload qua `POST /api/wiki/media/upload`
- URL public được ghi thẳng vào `main_image` và `gallery`
- nhập URL thủ công vẫn được giữ như fallback nâng cao

## Cache and publish semantics

Mỗi mutation ở category/product đều revalidate ngay:

- page listing `/wiki`
- detail `/wiki/[slug]`
- cache tags cho wiki page data và detail data

Publish flow vì vậy có thể thấy dữ liệu mới trên public runtime ngay sau save, không cần chờ TTL hết hạn.

## Public UX hardening

Các thay đổi đã khóa cho public runtime:

- image surface chính dùng `next/image` wrapper thay cho CSS background-image
- fallback nhất quán khi thiếu ảnh
- detail page trả về `{ product, relatedProducts }`
- related products ưu tiên cùng `subcategory`, sau đó cùng `category`, tối đa 4 item published

## Release gates

Các gate đang dùng để coi `wiki` là releasable trong repo hiện tại:

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`

Playwright suite nằm ở `apps/web/tests/e2e/wiki.smoke.spec.ts` và cover:

- top nav vào `/wiki`
- global search tới category/product
- admin login/logout
- create/edit/publish flow
- media upload cho `mainImage` và `gallery`
- category/subcategory/search filtering
- compare + quick view
- detail gallery + related products

## Boundary rule

Khi tiếp tục mở rộng `wiki`, giữ ba nguyên tắc sau:

1. `apps/web` là source of truth duy nhất cho runtime.
2. `sony-wiki-ref` chỉ được đọc để migrate hoặc đối chiếu hành vi legacy thực sự còn cần.
3. Mọi field/runtime/API mới phải được cập nhật trong typed contracts trước, rồi mới lan ra UI hoặc route handlers.
