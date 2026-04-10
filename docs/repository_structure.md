# Repository Structure

Tài liệu này mô tả repo theo logic BMAD: đâu là source of truth, đâu là runtime thật, đâu là vùng planning, và đâu là legacy reference.

## 1. Source of truth

Source of truth hiện tại của dự án là repo `sony-wiki/`, cụ thể:

- runtime: `apps/web`
- project knowledge: `docs/` và các file markdown ở root
- planning artifacts: `_bmad-output`

Không có runtime nào khác trong repo này ngoài `apps/web`.

## 2. Top-level map

```text
sony-wiki/
├── .github/workflows/          # CI hiện có
├── _bmad/                      # BMAD framework
├── _bmad-output/               # Planning + implementation artifacts
├── apps/
│   └── web/                    # Next.js runtime chính
├── docs/                       # BMAD project knowledge
├── scripts/                    # Setup và utility scripts
├── README.md
├── codex.md
├── design_tokens.md
├── project_report.md
├── package.json
└── turbo.json
```

## 3. `apps/web` breakdown

```text
apps/web/
├── app/
│   ├── api/
│   │   ├── search/
│   │   ├── wiki/
│   │   └── color-lab/
│   ├── color-lab/
│   ├── wiki/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── color-lab/
│   ├── layout/
│   ├── scroll/
│   ├── ui/
│   └── wiki/
├── lib/
│   ├── color-lab/
│   ├── supabase/
│   ├── utils/
│   └── wiki/
├── types/
├── .env.local.example
├── package.json
└── tsconfig.json
```

## 4. Vai trò từng vùng trong runtime

### `app/`

Chứa:

- route pages
- root layout
- global CSS
- API routes cho search, wiki admin, color-lab admin

Routes triển khai thật hiện có:

- `/`
- `/wiki`
- `/wiki/[slug]`
- `/color-lab`

API surface hiện có:

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

### `components/layout`

App shell và cross-cutting UI:

- `ClientLayout`
- `TopNavigation`
- `GlobalSearch`
- `ThemeToggle`
- `AuthSlot`
- navigation config và icons

### `components/wiki`

UI riêng cho `Wiki`:

- compare experience + modal
- filters
- product card
- quick view
- spec groups
- admin workspace
- product/category editor modals

### `components/color-lab`

UI riêng cho `Color Lab`:

- recipe rail + URL-synced filter state
- photo masonry gallery
- photo lightbox
- picture profile panel
- transfer guide card
- admin workspace
- recipe/photo editor modals

### `lib/wiki`

Domain logic của `Wiki`:

- query layer
- mappers
- contracts
- search param parsing
- compare helpers
- admin auth/client/helpers/schemas
- presentation formatting

### `lib/color-lab`

Domain logic của `Color Lab`:

- contracts
- helpers + search param parsing
- mock seed data + load-state fallbacks
- mappers
- queries + cache invalidation
- admin helpers/schemas
- storage helpers cho Supabase public preview bucket

### `lib/supabase`

Kết nối dữ liệu:

- `public.ts`: public read client
- `client.ts`: browser client
- `server.ts`: SSR/server client
- `admin.ts`: service-role client
- `migrations/`: SQL schema và index files

### `types`

Shared contracts cho:

- auth
- search
- wiki
- color-lab
- supabase database types

## 5. `docs` as project knowledge

`docs/` là lớp tài liệu sống của repo theo tinh thần BMAD.

Nội dung hiện có:

- `index.md`: điểm vào tài liệu
- `repository_structure.md`: bản đồ repo
- `phase2_wiki_migration_plan.md`: kế hoạch/hardening cho `Wiki`
- `phase3_color_lab_migration_plan.md`: trạng thái Phase 3 cho `Color Lab`
- `navigation_revamp_rollout_checklist.md`: checklist shell/navigation

## 6. `_bmad` vs `_bmad-output`

### `_bmad`

Là framework BMAD:

- skills
- workflows
- templates
- module config

Không phải runtime code.

### `_bmad-output`

Là artifact của chính repo này:

- `planning-artifacts/`: current state, architecture decisions, epics, readiness review
- `implementation-artifacts/`: hardening progress và implementation notes

Nếu current state đổi, đây là nơi cần đồng bộ cùng với docs gốc.

## 7. Legacy reference zone

Legacy repo được repo này tham chiếu là:

- `../sony-wiki-ref/sony-wiki-dev`

Vai trò:

- đọc business rules cũ
- đối chiếu data shape
- lấy migration context cho `Wiki` và `Color Lab`

Không dùng để:

- phát triển feature mới
- sửa runtime chính
- quyết định cấu trúc kiến trúc mới

## 8. Decision rules

Khi có mâu thuẫn giữa các nguồn:

1. ưu tiên code đang chạy trong `apps/web`
2. ưu tiên docs mới trong repo này hơn ghi chú cũ
3. chỉ dùng legacy repo như bằng chứng tham chiếu
4. nếu cần giữ legacy behavior, phải ghi lại trong docs hoặc `_bmad-output`

## 9. Update protocol

Nếu thay đổi những thứ sau:

- route surface
- API surface
- schema/migration
- app shell
- theme/token behavior
- phase/status của `Wiki` hoặc `Color Lab`

thì tối thiểu cần cập nhật:

- `README.md`
- `project_report.md`
- file phù hợp trong `docs/`
- artifact phù hợp trong `_bmad-output`
