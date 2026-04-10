# Sony Wiki

Sony Wiki là repo làm việc chính cho runtime mới của dự án. Đây là monorepo dùng Turborepo, hiện có một ứng dụng triển khai thật tại `apps/web`, đồng thời đang phát triển local runtime cho `Photobooth` tại `apps/booth-host` và `apps/booth-bridge`.

## BMAD Entry Point

Nếu cần nắm dự án nhanh theo workflow BMAD, đọc theo thứ tự:

1. [docs/index.md](./docs/index.md)
2. [codex.md](./codex.md)
3. [design_tokens.md](./design_tokens.md)
4. [project_report.md](./project_report.md)
5. [docs/repository_structure.md](./docs/repository_structure.md)

## Repository Role

- `apps/web`: runtime Next.js 16 App Router đang được phát triển thật.
- `apps/booth-host`: Rust local runtime cho Photobooth, target chính là Windows booth machine.
- `apps/booth-bridge`: C/C++ shim cho Sony Camera Remote SDK.
- `docs`: lớp `project_knowledge` của repo, dùng để giữ current state, structure notes và rollout checklists.
- `_bmad`: BMAD framework, skills, workflows và templates.
- `_bmad-output`: planning artifacts và implementation artifacts sinh ra trong quá trình làm việc theo BMAD.
- `../sony-wiki-ref/sony-wiki-dev`: legacy reference để đọc flow cũ, không phải nơi phát triển mới.

## Kiến trúc hiện tại

Repo hiện là một monorepo đơn giản:

- root orchestration bằng `turbo`
- một app chính là `apps/web`
- runtime local cho Photobooth tại `apps/booth-host` và `apps/booth-bridge`
- chưa có package workspace runtime nào trong `packages/*`

`apps/web` hiện được tổ chức theo bốn lát cắt chính:

- app shell: `ClientLayout`, `TopNavigation`, `GlobalSearch`, `ThemeToggle`, `AuthSlot`
- vertical `Wiki`: listing, detail, compare, admin CRUD
- vertical `Color Lab`: recipe library, preview gallery, admin CRUD
- vertical `Photobooth`: landing/download, capture UI, gallery, review, public share

## Runtime capabilities hiện có

### Shared shell

- route `/` đã là landing page có nội dung, không còn là placeholder trắng
- top navigation cố định với điều hướng sang `Wiki`, `Color Lab`, `Livestream` và `Photobooth`
- global search gợi ý `product` và `category` qua `/api/search`
- dark/light theme đồng bộ qua `localStorage("color-scheme")`, thuộc tính `html[color-scheme]` và class `.dark`
- auth hiện mới là shell UI; chưa có flow đăng nhập thật

### Wiki

- route `/wiki`
- route `/wiki/[slug]`
- query state typed qua `q`, `category`, `sort`, `compare`
- compare queue giữ tối đa 4 sản phẩm
- đọc dữ liệu từ Supabase qua typed query layer
- detail page có grouped specs, hero media, gallery và metadata
- admin workspace trong chính route `/wiki`
- admin routes:
  - `/api/wiki/admin/verify`
  - `/api/wiki/admin/catalog`
  - `/api/wiki/categories`
  - `/api/wiki/categories/[id]`
  - `/api/wiki/products`
  - `/api/wiki/products/[id]`

### Color Lab

- route `/color-lab`
- public runtime đọc typed recipes/photos từ Supabase, parse `q`, `cameraLine`, `profile` từ URL và gắn gallery đúng recipe đang chọn
- load state được phân biệt rõ giữa `live`, `seeded-fallback` và `degraded`
- preview photos dùng public URL từ Supabase Storage bucket `color-lab-preview`
- runtime giữ lại lightbox và `Transfer to Camera` guide card từ ref cũ nhưng tách thành component độc lập
- admin workspace chỉ tải catalog sau khi unlock bằng shared-password session cookie
- recipe editor đã có `cameraLines`, `compatibilityNotes` và preset swatch palette
- photo manager dùng upload flow thật: file + recipe assignment + sort order + delete kèm storage cleanup
- admin routes:
  - `/api/color-lab/admin/catalog`
  - `/api/color-lab/recipes`
  - `/api/color-lab/recipes/[id]`
  - `/api/color-lab/photos`
  - `/api/color-lab/photos/[id]`

### Photobooth

- route `/photobooth`
- route `/photobooth/capture`
- route `/photobooth/gallery`
- route `/photobooth/review/[sessionId]`
- route `/photobooth/share/[sessionId]`
- landing page có Windows download CTA và setup checklist
- capture UI có kiosk flow, operator gate và QR preview
- web runtime đã chuyển sang host-first semantics, không còn silent fallback sang mock data mặc định
- gallery, review và share pages phân biệt rõ `host unavailable` với `session not found`
- photobooth smoke script đã có trong CI Node workflow
- public routes:
  - `/api/photobooth/releases/latest`
  - `/api/photobooth/gallery`
  - `/api/photobooth/public/session/[sessionId]`
  - `/api/photobooth/share/[sessionId]`
- local runtime companion:
  - `apps/booth-host` đã có session lifecycle, asset serving, event websocket và live-view binary path ở mức code
  - `apps/booth-bridge` vẫn là SDK boundary riêng cho Sony Camera Remote SDK

## Tech stack thực tế

- Framework: Next.js 16 App Router
- Language: TypeScript strict
- UI: React 19 + HeroUI v3
- Styling: Tailwind CSS v4 + shadcn theme bridge trong `globals.css`
- Data: Supabase
- Forms/validation: React Hook Form + Zod
- Motion: Lenis + GSAP
- Client state phụ trợ: Zustand
- Workspace orchestration: Turborepo
- Node baseline trong repo: `22.22.0`

## Cấu trúc thư mục chính

```text
sony-wiki/
├── apps/
│   ├── web/                    # Next.js runtime chính
│   ├── booth-host/             # Rust local runtime scaffold cho Photobooth
│   └── booth-bridge/           # C/C++ Sony SDK bridge scaffold
├── docs/                       # BMAD project knowledge cho repo này
├── _bmad/                      # BMAD framework
├── _bmad-output/               # Planning + implementation artifacts
├── scripts/                    # Setup và utility scripts
├── README.md                   # Repo overview
├── codex.md                    # Runtime rules + coding protocol
├── design_tokens.md            # Token và theme rules
└── project_report.md           # Current-state roadmap theo phase
```

## Getting Started

### Prerequisites

- Node `22.22.0` theo `.nvmrc`
- npm `10.9.4`
- Supabase project với public URL, anon key và service role key

### Setup

```bash
nvm use
npm run setup
```

Script setup sẽ:

- kiểm tra phiên bản Node
- chạy `npm install`
- tạo `apps/web/.env.local` từ file mẫu nếu chưa có

### Environment variables

Sao chép:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Điền các biến:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WIKI_ADMIN_PASSWORD`
- `WIKI_ADMIN_SESSION_SECRET` khuyến nghị bật riêng để ký admin session cookie

### Local development

```bash
npm run dev
```

Các lệnh hữu ích:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Verification model

Verification gate tại repo hiện được hiểu như sau:

- local quality gates: `test`, `typecheck`, `lint`, `build`
- CI hiện có tại `.github/workflows/node.js.yml`
- CI đang chạy `npm ci`, `npm run build --if-present`, `npm test` và photobooth smoke trên Node `18.x`, `20.x`, `22.x`
- Rust host có workflow riêng tại `.github/workflows/rust-booth-host.yml`

Điều này có nghĩa là `lint` và `typecheck` hiện vẫn là gate nên chạy thủ công trước khi chốt thay đổi quan trọng.

### Last verified

Đã xác nhận cục bộ ngày `2026-04-10`:

- `npm run test`: pass
- `npm run typecheck`: pass
- `npm run lint`: pass
- `npm run build`: pass
- `npm run smoke:photobooth`: pass

Riêng `apps/booth-host`:

- local Fedora hiện đã có `cargo` và `rustc`
- `cargo build/test` vẫn bị chặn do máy thiếu linker host `cc`
- lượt test tiếp theo nên chạy trên Windows booth machine; xem handover tại `docs/photobooth_windows_handover.md`

`next build` cũng xác nhận lại route surface:

- `/`
- `/_not-found`
- `/api/search`
- `/api/wiki/admin/catalog`
- `/api/wiki/admin/verify`
- `/api/wiki/categories`
- `/api/wiki/categories/[id]`
- `/api/wiki/products`
- `/api/wiki/products/[id]`
- `/api/color-lab/admin/catalog`
- `/api/color-lab/photos`
- `/api/color-lab/photos/[id]`
- `/api/color-lab/recipes`
- `/api/color-lab/recipes/[id]`
- `/api/photobooth/gallery`
- `/api/photobooth/public/session/[sessionId]`
- `/api/photobooth/releases/latest`
- `/api/photobooth/share/[sessionId]`
- `/color-lab`
- `/photobooth`
- `/photobooth/capture`
- `/photobooth/gallery`
- `/photobooth/review/[sessionId]`
- `/photobooth/share/[sessionId]`
- `/wiki`
- `/wiki/[slug]`

## Source of truth và legacy boundary

- `apps/web` là source of truth cho runtime mới.
- `docs` và các file markdown ở root là source of truth cho current-state documentation.
- `../sony-wiki-ref/sony-wiki-dev` chỉ dùng để đọc business rules, data shape và flow cũ khi migrate.
- Không phát triển feature mới trong repo legacy.
- Không copy nguyên module cũ sang `apps/web`; phải bóc tách rule rồi tái cấu trúc theo runtime mới.

## BMAD working rules

Khi làm việc trong repo này theo BMAD:

1. Bắt đầu bằng đọc hiện trạng thật trong code và docs.
2. Xác định source of truth, phase và vertical đang bị tác động.
3. Triển khai theo các bước nhỏ có thể verify được.
4. Khi runtime, schema, API surface hoặc phase thay đổi, cập nhật docs cùng lượt.
5. Không chỉnh `_bmad` chỉ để phản ánh trạng thái website; cập nhật docs dự án và `_bmad-output` trước.
