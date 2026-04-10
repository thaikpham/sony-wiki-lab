# Sony Wiki — Codex

Tài liệu này là working protocol cho runtime hiện tại trong `apps/web`. Mục tiêu của nó là giúp mọi lần đọc code, sửa code và cập nhật docs bám đúng source of truth đang có thật.

## 1. Runtime snapshot

### Stack đang dùng thật

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript strict |
| UI Library | HeroUI v3 |
| Styling | Tailwind CSS v4 + shadcn theme bridge |
| Data | Supabase |
| Forms | React Hook Form + Zod |
| Motion | Lenis + GSAP |
| Client state | Zustand |
| Font | Noto Sans |
| Monorepo orchestration | Turborepo |

### Boundary

- `apps/web`: runtime chính
- `docs`: project knowledge / rollout docs
- `_bmad-output`: artifacts mô tả current state, decisions và next stories
- `_bmad`: framework BMAD, không phải runtime sản phẩm
- `../sony-wiki-ref/sony-wiki-dev`: legacy reference only

## 2. Những gì đang có trong web

### App shell

- `ClientLayout`
- `TopNavigation`
- `GlobalSearch`
- `ThemeToggle`
- `AuthSlot`
- `ScrollTop`
- `LenisSmoothScroll`

### Routes

- `/`
- `/wiki`
- `/wiki/[slug]`
- `/color-lab`

### API routes

- `/api/search`
- `/api/wiki/admin/verify`
- `/api/wiki/admin/catalog`
- `/api/wiki/categories`
- `/api/wiki/categories/[id]`
- `/api/wiki/products`
- `/api/wiki/products/[id]`
- `/api/color-lab/admin/catalog`
- `/api/color-lab/recipes`
- `/api/color-lab/recipes/[id]`
- `/api/color-lab/photos`
- `/api/color-lab/photos/[id]`

### Domain boundaries

- `components/layout/*`: app shell và top-level interactions
- `components/wiki/*`: listing, detail helpers, compare UI, admin workspace
- `components/color-lab/*`: recipe library, preview, picture profile panel, admin workspace
- `lib/wiki/*`: typed contracts, mappers, queries, compare helpers, admin validation/auth
- `lib/color-lab/*`: typed contracts, mock data, mappers, queries, admin helpers
- `lib/supabase/*`: public, browser, server và admin clients
- `types/*`: shared contracts

## 3. Runtime behavior rules

### Public reads

- public data nên đi qua typed query layer trong `lib/wiki/queries.ts` hoặc `lib/color-lab/queries.ts`
- public read dùng `createPublicClient()`
- server pages dùng `withTimeout(...)` để giữ failure mode rõ ràng
- `Color Lab` có fallback mock data nếu Supabase chưa có dữ liệu

### Admin writes

- admin flow hiện chưa dùng auth user/session thật
- cả `Wiki` và `Color Lab` đều dùng chung `WIKI_ADMIN_PASSWORD`
- client side xác thực qua `/api/wiki/admin/verify`
- secret được giữ trong `sessionStorage` bằng `sony-wiki-admin-secret`
- mutation routes dùng `createAdminClient()` với `SUPABASE_SERVICE_ROLE_KEY`

### Search & compare

- global search trả về hai loại kết quả: `product`, `category`
- `/wiki` parse route state qua helper `parseWikiSearchParams`
- compare queue giới hạn tối đa 4 sản phẩm
- compare state được giữ trong query string

## 4. Design and UI rules

1. Ưu tiên semantic token trong [design_tokens.md](./design_tokens.md).
2. HeroUI v3 là UI layer mặc định; shadcn là lớp support/theming.
3. App shell hiện tại là top-navigation-only; không quay lại drawer/sidebar làm mặc định nếu chưa có lý do rõ.
4. Auth hiện chỉ là shell; không giả định repo đã có login flow hoàn chỉnh.
5. Theme mode phải luôn đồng bộ `localStorage`, `html[color-scheme]` và class `.dark`.

## 5. Data and schema rules

### Wiki

- schema gốc: `20260408_wiki_schema.sql`
- search indexes: `20260409_wiki_search_indexes.sql`
- runtime fields bổ sung: `20260410_wiki_product_runtime_fields.sql`
- normalized domain types:
  - `WikiCategory`
  - `WikiSpecEntry`
  - `WikiSpecGroup`
  - `WikiProductListItem`
  - `WikiProductDetail`

### Color Lab

- schema gốc: `20260409_color_lab_schema.sql`
- normalized domain types:
  - `ColorLabRecipe`
  - `ColorLabRecipeSettings`
  - `ColorLabPhoto`

## 6. Migration rules

Khi đọc từ `../sony-wiki-ref/sony-wiki-dev`:

1. Chỉ lấy business rule, content model, data field và flow thật sự cần.
2. Không copy nguyên file hoặc nguyên kiến trúc.
3. Tái cấu trúc theo boundary mới trong `apps/web`.
4. Nếu hành vi legacy vẫn cần giữ, ghi nó vào docs hoặc planning artifacts.

## 7. Verification rules

### Local gates

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

### CI note

GitHub Actions hiện mới chạy:

- `npm ci`
- `npm run build --if-present`
- `npm test`

Không giả định CI đã thay local `lint` và `typecheck`.

## 8. BMAD working memory

Mặc định mỗi lần làm việc trong repo này:

1. `Observe`
   - đọc route, component, query layer, migration và docs liên quan
2. `Classify`
   - xác định vertical nào bị tác động: shell, wiki, color-lab, docs, infra
3. `Constrain`
   - xác định source of truth và ranh giới legacy
4. `Implement`
   - ưu tiên thay đổi nhỏ, có thể verify
5. `Verify`
   - chạy gate phù hợp với phạm vi đổi
6. `Sync docs`
   - nếu runtime, API surface, schema, token hoặc phase thay đổi thì cập nhật docs và `_bmad-output`

## 9. AI partner protocol

1. Đọc [docs/index.md](./docs/index.md) trước khi sửa lớn.
2. Xem `apps/web` là runtime duy nhất để triển khai.
3. Chỉ dùng legacy repo làm reference.
4. Khi current state đổi, cập nhật ít nhất `README.md`, `project_report.md` và doc liên quan trong `docs/`.
5. Không chỉnh `_bmad` chỉ để phản ánh trạng thái dự án; nếu cần context planning, cập nhật `_bmad-output` trước.
