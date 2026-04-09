# Sony Wiki

Đây là repo làm việc chính của dự án Sony Wiki. `sony-wiki/` là source of truth hiện tại cho code, tài liệu triển khai và planning artifacts gắn với runtime mới.

## Repository Role

- `sony-wiki/apps/web`: ứng dụng Next.js đang chạy và được mở rộng tiếp.
- `sony-wiki/_bmad`: bộ khung BMAD để phân tích, lập kế hoạch, review và triển khai.
- `sony-wiki/docs`: tài liệu vận hành, roadmap và rollout notes của dự án.
- `sony-wiki-ref/sony-wiki-dev`: codebase cũ, chỉ giữ để tham chiếu khi migrate.

## Hiện trạng web

Runtime hiện tại đã có các phần sau:

- app shell theo `TopNavigation` + `GlobalSearch` + `ThemeToggle` + `AuthSlot`
- đã khởi tạo `shadcn` trong `apps/web` và áp theme registry từ TweakCN:
  - `https://tweakcn.com/r/themes/cmnr4nnqp000304kv7jxh4ag3`
- dark/light mode đã được ổn định với:
  - sync `localStorage("color-scheme")`
  - sync `html[color-scheme]`
  - sync class `.dark`
  - `ThemeToggle` render an toàn cho hydration
- top navigation hiện có contrast override ở mức component để đảm bảo chữ và nền luôn đọc được ở cả light/dark
- các route:
  - `/`
  - `/wiki`
  - `/wiki/[slug]`
  - `/color-lab`
  - `/api/search`
- Supabase schema migration cho `wiki_categories` và `wiki_products`
- search index migration cho global search
- dark/light mode qua semantic tokens trong `apps/web/app/globals.css`

Những gì vẫn đang ở trạng thái placeholder hoặc chưa hoàn tất:

- trang `/` hiện chưa có nội dung thực
- `/wiki` mới dừng ở query state + placeholder, chưa có listing/grid thật
- `/color-lab` vẫn là placeholder Phase 3
- auth mới là UI shell, chưa nối flow đăng nhập thực
- admin CRUD chưa được triển khai

## AI Agent Onboarding

Bất kỳ AI agent nào bắt đầu làm việc với repo này nên đọc theo thứ tự:

1. [codex.md](./codex.md)
2. [design_tokens.md](./design_tokens.md)
3. [project_report.md](./project_report.md)
4. [docs/repository_structure.md](./docs/repository_structure.md)

Thứ tự này giúp nắm đúng:

- quy chuẩn làm việc và coding protocol
- design tokens đang dùng thật
- phase hiện tại của sản phẩm
- ranh giới giữa source of truth mới và legacy reference

## Cấu trúc thư mục chính

```text
sony-wiki/
├── apps/
│   └── web/                    # Next.js 16 App Router runtime
├── docs/                       # Project docs, rollout notes, migration plans
├── _bmad/                      # BMAD framework, workflows, skills, templates
├── scripts/                    # Setup và utility scripts
├── codex.md                    # Runtime rules + BMAD working protocol
├── design_tokens.md            # Semantic design tokens chính thức
└── project_report.md           # Trạng thái dự án và roadmap theo phase
```

## Getting Started

Repo dùng Turborepo workspace. Ứng dụng hiện tại nằm tại `apps/web`.

```bash
nvm use
npm run setup
npm install
npm run dev
```

Nếu cần tạo file môi trường thủ công:

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Sau đó điền:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Các lệnh hữu ích:

```bash
npm run lint
npm run build
```

## Trạng thái xác nhận gần nhất

Đã xác nhận trong repo hiện tại ngày `2026-04-09`:

- `npm run lint`: pass
- `npm run build`: pass
- build tạo đúng các routes:
  - `/`
  - `/_not-found`
  - `/api/search`
  - `/color-lab`
  - `/wiki`
  - `/wiki/[slug]`

## Tech Stack thực tế

- Framework: Next.js 16 App Router
- UI: React 19 + HeroUI v3
- Styling: Tailwind CSS v4
- Backend/Auth/Data: Supabase
- Motion: Lenis + GSAP
- Design system/theme tooling: HeroUI v3 + shadcn registry theme
- Forms: React Hook Form + Zod
- State: Zustand
- Animation runtime phụ trợ hiện có: Framer Motion

## Nguyên tắc làm việc với `sony-wiki-ref`

- Không phát triển feature mới trong `sony-wiki-ref`.
- Không xem `sony-wiki-ref` là source of truth cho kiến trúc mới.
- Chỉ lấy business rules, content model, flow màn hình hoặc dữ liệu tham chiếu khi chuẩn bị migrate.
- Khi migrate, ưu tiên tái thiết kế theo cấu trúc `apps/web` thay vì copy nguyên file từ repo cũ.

## BMAD note

Khi làm việc theo BMAD trong repo này:

1. Bắt đầu bằng đọc hiện trạng trước khi viết code.
2. Xác định phase, phạm vi và source of truth.
3. Implement thay đổi nhỏ, kiểm chứng được.
4. Cập nhật docs cùng lúc với code nếu hành vi, cấu trúc hoặc phase thay đổi.
