# Sony Wiki — Codex

Tài liệu này là bộ quy chuẩn cho runtime hiện tại trong `sony-wiki/apps/web`. Mọi thay đổi code, page, component và migration mới nên bám tài liệu này trước khi mở rộng `wiki` hoặc `color-lab`.

## 1. Runtime hiện tại

### Stack đang dùng thật

| Layer | Tool |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 |
| UI Library | HeroUI v3 |
| Theme Registry | shadcn + TweakCN theme `cmnr4nnqp000304kv7jxh4ag3` |
| Backend | Supabase |
| Motion | Lenis + GSAP |
| Font | Noto Sans |

### Boundary

- `sony-wiki/apps/web`: runtime chính
- `sony-wiki/docs`: docs dự án và rollout notes
- `sony-wiki/_bmad`: workflow/planning framework
- `sony-wiki-ref/sony-wiki-dev`: legacy reference, không phải nơi phát triển mới

## 2. Những gì đã có trong web

### App shell

- `ClientLayout`
- `TopNavigation`
- `GlobalSearch`
- `ThemeToggle`
- `AuthSlot`
- `ScrollTop`
- `LenisSmoothScroll`

### Routes

- `/`: placeholder homepage
- `/wiki`: route động theo `searchParams`, hiện mới hiển thị query state + placeholder
- `/wiki/[slug]`: detail page đọc dữ liệu từ Supabase
- `/color-lab`: placeholder Phase 3
- `/api/search`: global search cho products và categories

### Data layer

- `apps/web/lib/supabase/client.ts`
- `apps/web/lib/supabase/server.ts`
- `apps/web/lib/supabase/migrations/20260408_wiki_schema.sql`
- `apps/web/lib/supabase/migrations/20260409_wiki_search_indexes.sql`

### Theme layer

- `apps/web/components.json`
- `apps/web/app/globals.css`
- theme registry đang dùng:
  - `https://tweakcn.com/r/themes/cmnr4nnqp000304kv7jxh4ag3`
- shadcn đã được init ở `apps/web`
- dark mode phải đồng bộ cả:
  - `html[color-scheme="light|dark"]`
  - class `.dark` trên `document.documentElement`
- `ThemeToggle` phải render hydration-safe
- navigation hiện tại dùng thêm component-level contrast overrides trên:
  - `TopNavigation`
  - `GlobalSearch`
  - `AuthSlot`
  - `ThemeToggle`

## 3. Cấu trúc thư mục khuyến nghị

```text
apps/web/
├── app/                # routes, layout, globals, api
├── components/
│   ├── layout/         # app shell, navigation, search, auth shell
│   ├── scroll/         # smooth scroll + scroll top helpers
│   ├── wiki/           # tạo khi listing/detail/admin bắt đầu tách component thật
│   ├── color-lab/      # tạo khi Phase 3 bắt đầu
│   └── shared/         # shared presentational primitives nếu cần
├── lib/
│   └── supabase/       # client, server, migrations, service helpers
└── types/              # shared typings
```

Nếu `components/wiki`, `components/color-lab` hoặc `components/shared` chưa tồn tại thì chỉ tạo khi có feature thực, không tạo trước để giữ repo gọn.

## 4. Thiết kế hệ thống

### Colors

- Luôn ưu tiên semantic tokens trong [design_tokens.md](./design_tokens.md).
- Không thêm raw color vào component nếu chưa được chuẩn hóa.
- Alias `--color-*` chỉ là lớp tương thích cho phần đang migrate.
- Theme nền hiện tại là monochrome theme từ TweakCN; khi đổi theme phải cập nhật cả docs và `globals.css`.
- Nếu HeroUI variant không cho đủ tương phản với theme hiện tại, được phép override màu ở mức component cho các vùng critical như navigation/search.

### Typography

- Font chính là `Noto Sans`.
- Heading cần rõ ràng, đậm và gọn.
- Body text ưu tiên `sm` đến `base`.
- Nội dung tiếng Việt cần line-height thoáng, tránh block chữ dày.

### Layout

- Mobile-first.
- App shell hiện tại là top-navigation-only, không còn sidebar/drawer là chuẩn chính.
- Feature mới chỉ nên mở rộng trong vùng `<main>` của `ClientLayout`.

## 5. Component Rules

### Naming

- File: `PascalCase.tsx`
- Component: `PascalCase`
- Variables: `camelCase`
- Types: `PascalCase`

### UI Strategy

- Ưu tiên HeroUI trước khi tự viết primitive mới.
- Chỉ thêm wrapper khi có lý do rõ ràng về domain hoặc consistency.
- Repo hiện hỗ trợ cả shadcn, nhưng HeroUI vẫn là UI layer mặc định cho app shell hiện có.
- shadcn chủ yếu được dùng để quản lý theme registry và sẵn sàng cho `components/ui/*` khi cần.
- HeroUI v3-only:
  - dùng `@heroui/react` + `@heroui/styles`
  - không dùng pattern v2 như `HeroUIProvider` từ `@heroui/system`
  - ưu tiên `onPress` trên HeroUI components
- App shell chuẩn hiện tại:
  - `TopNavigation`
  - `GlobalSearch`
  - `AuthSlot`
  - `ThemeToggle`
- Với app shell hiện tại, khả năng đọc được luôn ưu tiên hơn việc bám tuyệt đối vào variant mặc định của HeroUI.

### Motion

- Chỉ dùng animation để cải thiện cảm nhận điều hướng hoặc trạng thái.
- Motion hiện có trong repo là Lenis + GSAP; Framer Motion có dependency nhưng chưa là shell mặc định.
- Không thêm animation dày đặc vào CRUD, bảng dữ liệu hoặc form quản trị.

## 6. Data & Feature Strategy

### Supabase

- Detail page `/wiki/[slug]` đang đọc trực tiếp từ bảng `wiki_products`.
- Search API đang đọc từ:
  - `wiki_products`
  - `wiki_categories`
- Public read hiện dựa trên `is_published = true` cho products.

### Fetching

- Ưu tiên Server Components cho dữ liệu đọc.
- Dùng Client Components cho search, theme toggle, local state và tương tác UI.
- Loading, empty state và error state phải được định nghĩa rõ.

## 7. Migration Rules

Khi migrate từ `sony-wiki-ref/sony-wiki-dev`:

1. Đọc flow cũ để hiểu feature và business rule.
2. Tách business logic, data fields và hành vi cần giữ lại.
3. Ánh xạ sang kiến trúc `apps/web`.
4. Chuẩn hóa lại UI theo token mới.
5. Không copy nguyên module cũ nếu nó kéo theo cấu trúc legacy.

## 8. BMAD Working Memory

Đây là phần cần được xem như mặc định cho mỗi lần coding trong repo này:

1. Bắt đầu bằng `observe`:
   - đọc route, component, migration và docs liên quan trước khi sửa
2. Xác định `phase`:
   - Foundation đã xong
   - Wiki đang ở Phase 2, đã có schema + search + detail
   - Color Lab vẫn ở Phase 3 placeholder
3. Xác định `delta`:
   - ghi rõ phần nào đang có thật
   - ghi rõ phần nào còn placeholder hoặc chưa nối backend
4. Implement theo `small verified increments`:
   - sửa ít nhưng đúng
   - chạy `lint` và `build` khi thay đổi có ảnh hưởng runtime
5. Đồng bộ `code + docs`:
   - nếu route, shell, phase, schema hoặc token thay đổi thì cập nhật docs cùng lượt
   - nếu theme registry đổi, cập nhật cả `README.md`, `design_tokens.md` và tài liệu này
6. Tôn trọng `source of truth`:
   - `apps/web` và tài liệu trong repo mới luôn ưu tiên hơn legacy reference

## 9. AI Agent Protocol

1. Đọc `README.md`, `design_tokens.md`, `project_report.md` và `docs/repository_structure.md` trước khi mở rộng feature.
2. Xem `sony-wiki/apps/web` là runtime chính.
3. Chỉ dùng `sony-wiki-ref` như tài liệu đầu vào cho migration.
4. Mọi planning artifact nên bám luồng BMAD trong `_bmad`.
5. Khi có thay đổi về cấu trúc, phase hoặc hành vi runtime, cập nhật docs song song với code.
