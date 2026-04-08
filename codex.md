# Sony Wiki — Codex: Quy chuẩn Thiết kế Giao diện

> Tài liệu này thiết lập các quy tắc thiết kế cho toàn bộ dự án Sony Wiki.
> Mọi component, page, feature mới **phải** tuân thủ các quy chuẩn dưới đây.

---

## 1. Stack & Công cụ

| Layer        | Tool                         |
| ------------ | ---------------------------- |
| Framework    | Next.js 16 (App Router)      |
| Language     | TypeScript (strict)          |
| Styling      | Tailwind CSS v4              |
| UI Library   | HeroUI (v3)                    |
| Backend      | Supabase (Auth, DB, Storage) |
| Animation    | GSAP + Lenis smooth scroll   |
| Font         | Google Noto Sans (Vietnamese)|

---

## 2. Color Palette

### Light Mode
| Token                   | Value     | Mô tả                       |
| ----------------------- | --------- | ---------------------------- |
| `--color-primary`       | `#1a73e8` | Màu chủ đạo (Sony blue)     |
| `--color-primary-hover` | `#1557b0` | Hover cho primary            |
| `--color-primary-light` | `#e8f0fe` | Nền nhẹ cho active state     |
| `--color-accent`        | `#ff6d00` | Màu nhấn (Color Lab)        |
| `--color-accent-hover`  | `#e65100` | Hover cho accent             |
| `--color-success`       | `#0f9d58` | Trạng thái thành công        |
| `--color-warning`       | `#f4b400` | Trạng thái cảnh báo          |
| `--color-error`         | `#db4437` | Trạng thái lỗi               |
| `--color-surface`       | `#ffffff` | Nền chính                    |
| `--color-surface-alt`   | `#f8f9fa` | Nền phụ (cards, sidebar)     |
| `--color-border`        | `#dadce0` | Viền chính                   |
| `--color-text`          | `#202124` | Text chính                   |
| `--color-text-secondary`| `#5f6368` | Text phụ                     |
| `--color-text-muted`    | `#9aa0a6` | Text mờ / placeholder        |

### Dark Mode
Dark mode tự động override qua attribute `[color-scheme="dark"]` trên `<html>`.
Tất cả bề mặt chuyển sang tông xám tối (`#1e1e1e` → `#2d2d2d`), text sáng (`#e8eaed`).

**Quy tắc:** Luôn dùng CSS variable `var(--color-*)` thay vì hardcode giá trị màu.

---

## 3. Typography

| Element     | Size    | Weight  | Ghi chú                           |
| ----------- | ------- | ------- | ---------------------------------- |
| Page title  | `2xl`–`4xl` | Bold (700) | Dùng cho `<h1>`               |
| Section     | `xl`–`2xl`  | Semibold (600) | Dùng cho `<h2>`            |
| Subsection  | `lg`     | Semibold (600) | Dùng cho `<h3>`              |
| Body        | `sm`–`base` | Regular (400) | Text chính                  |
| Caption     | `xs`     | Regular/Medium | Labels, hints, timestamps    |

- **Font chính:** `Noto Sans` — tối ưu cho tiếng Việt
- **Font mono:** `Noto Sans Mono` — dùng cho code/data
- **Line height:** `1.6` (body), `1.3` (heading)
- **Anti-aliasing:** luôn bật `-webkit-font-smoothing: antialiased`

---

## 4. Spacing System

Sử dụng Tailwind spacing scale (`p-1` = 4px, `p-2` = 8px, ...).

| Context            | Spacing    |
| ------------------ | ---------- |
| Page padding       | `p-4 lg:p-6` |
| Card padding       | `p-4`–`p-6` |
| Section gap        | `gap-4 lg:gap-6` |
| Element gap (nhỏ)  | `gap-2`–`gap-3` |
| Sidebar width      | `260px` (`--spacing-sidebar`) |
| Header height      | `56px` (`--spacing-header`) |

---

## 5. Border Radius

| Token          | Value     | Dùng cho                    |
| -------------- | --------- | --------------------------- |
| `--radius-sm`  | `4px`     | Input, small buttons        |
| `--radius-md`  | `8px`     | Cards, dropdowns            |
| `--radius-lg`  | `12px`    | Modal, panels               |
| `--radius-xl`  | `16px`    | Large cards, hero sections  |
| `--radius-full`| `9999px`  | Avatar, badge, circular     |

---

## 6. Shadow System

| Token         | Dùng cho                              |
| ------------- | ------------------------------------- |
| `--shadow-sm` | Subtle elevation (inputs, small cards)|
| `--shadow-md` | Cards, dropdowns                      |
| `--shadow-lg` | Modal, floating panels                |

---

## 7. Component Guidelines

### 7.1 Cấu trúc file (Monorepo Workspace: `apps/web`)

```
apps/web/
├── app/             # App Router pages
├── components/
│   ├── layout/      # Shell components (Sidebar, Header, ClientLayout)
│   ├── ui/          # HeroUI wrappers and primitive components
│   ├── wiki/        # Wiki-specific components
│   ├── color-lab/   # Color Lab-specific components
│   └── shared/      # Shared/reusable across features
├── lib/supabase/    # Supabase clients
```

### 7.2 Naming Convention

- **File:** `PascalCase.tsx` (e.g. `WikiProductCard.tsx`)
- **Component:** `PascalCase` export default
- **CSS classes:** Tailwind utilities, **không viết custom CSS** trừ khi cần thiết
- **Variables:** `camelCase`
- **Types/Interfaces:** `PascalCase` với suffix rõ ràng (`WikiProduct`, `ColorRecipe`)

### 7.3 HeroUI Usage

- Ưu tiên dùng HeroUI components thay vì tự build: `Button`, `Input`, `Modal`, `Card`, `Dropdown`, `Table`
- Customize qua biến CSS và thư viện class của Tailwind, **không fork** component source.
- Tham chiếu tới cấu hình CSS trong **[design_tokens.md](./design_tokens.md)** để áp dụng màu và spacing chuẩn.
- Dark mode tự động qua CSS variables (HeroUI Native support).

### 7.4 Animation

- Transition mặc định: `transition-all duration-[var(--transition-base)]`
- Hover effects: scale nhẹ (`group-hover:scale-105`), color shift, shadow change
- Page transitions: optional GSAP cho complex animations
- **Không dùng** animation quá mức — ưu tiên UX mượt mà
- Lenis smooth scroll cho toàn trang

---

## 8. Responsive Breakpoints

| Breakpoint | Value    | Thiết bị           |
| ---------- | -------- | ------------------- |
| `xs`       | `480px`  | Mobile nhỏ          |
| `sm`       | `640px`  | Mobile              |
| `md`       | `768px`  | Tablet              |
| `lg`       | `1024px` | Desktop (sidebar visible) |
| `xl`       | `1280px` | Desktop rộng        |
| `2xl`      | `1536px` | Ultra-wide           |

**Mobile-first:** Viết styles cho mobile trước, dùng `lg:` prefix cho desktop.

---

## 9. Layout Rules

- **Sidebar:** Ẩn trên mobile (`< lg`), hiện dạng drawer khi toggle
- **Main content:** `max-w-5xl mx-auto` cho content pages
- **Cards grid:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- **Header:** Sticky top, backdrop-blur, z-30

---

## 10. Accessibility

- Mọi interactive element phải có `aria-label` nếu không có visible text
- Focus ring: `outline: 2px solid var(--color-primary)` (tự động qua globals.css)
- Contrast ratio: tối thiểu 4.5:1 cho text, 3:1 cho UI elements
- Keyboard navigable: tất cả actions phải accessible qua keyboard
- Semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`, `<button>` (không dùng `<div>` cho interactive)

---

## 11. Icons

- Sử dụng **Heroicons** (outline style, 24x24) hoặc inline SVG
- Stroke width: `1.5` cho nav/page icons, `2` cho action/button icons
- Size: `w-5 h-5` (default), `w-4 h-4` (small), `w-6 h-6` (large)
- Color: inherit from parent via `currentColor`

---

## 12. State Guidelines

| State     | Visual                                          |
| --------- | ----------------------------------------------- |
| Default   | Base colors                                     |
| Hover     | Lighten bg, deepen border/shadow                |
| Active    | Primary-light bg + primary text                 |
| Disabled  | `opacity-50 cursor-not-allowed`                 |
| Loading   | Skeleton pulse hoặc spinner                     |
| Empty     | Dashed border + icon + text mô tả              |
| Error     | Red border + error text                         |

---

## 13. Data Fetching Pattern

```
apps/web/lib/
├── supabase/
│   ├── client.ts     # Browser client (client components)
│   └── server.ts     # Server client (server components, API routes)
```

- **Server Components:** Fetch data trực tiếp trong component (default)
- **Client Components:** Dùng browser Supabase client khi cần realtime/mutations
- **Error handling:** Try-catch + error UI state
- **Loading:** Suspense boundary + skeleton components

---

## 14. Quy tắc Dành riêng cho AI Agent (System Prompt Override)

1. **Tuân thủ Tuyệt đối:** Tất cả UI components tạo mới phải ánh xạ 100% với `design_tokens.md`. Không tự ý sáng tạo mã HEX hoặc padding không có trong quy chuẩn.
2. **Định danh Monorepo:** Tất cả logic Next.js, UI, API nằm trong thư mục `apps/web/`. Tuyệt đối không tạo file mã nguồn ở thư mục gốc (root directory).
3. **Module Imports:**
   - Dùng import trực tiếp từ `@heroui/react` (ví dụ: `import { Button } from "@heroui/react"`).
   - Dùng `@/lib/supabase/client` hoặc `@/lib/supabase/server` cho kết nối DB bên trong workspace `web`.

---

## 15. State & Form Management

- **Forms:** Sử dụng `react-hook-form` kết hợp với `@hookform/resolvers/zod` để handle form.
- **Validation:** Define schema bằng `zod` và validate thẳng trên Form components, cấm validate array/object bằng tay.
- **Global State:** Chỉ tạo store `zustand` cho những state dùng ở nhiều chỗ (e.g. Compare Mode, Active Filter) trong mục `apps/web/lib/stores/`.
- Hạn chế sử dụng `useState` cho Form inputs để giảm re-render, ủy quyền cho `react-hook-form`.

> **Lưu ý:** Tài liệu này sẽ được cập nhật khi thêm features mới (Phase 2: Wiki, Phase 3: Color Lab). Tra cứu lại `project_report.md` để biết roadmap hiện tại.
