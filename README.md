# Sony Wiki — Core Project

Đây là dự án "Sony Wiki & Color Lab", được xây dựng trên nền tảng **Next.js 16 (App Router)**, **Tailwind CSS v4**, và **Supabase**.

## 🤖 AI Agent Onboarding Checklist

> **QUAN TRỌNG CHO AI AGENT:**
> Bất kỳ AI Agent nào khi bắt đầu một phiên làm việc (conversation) mới với dự án này **phải đọc** các file sau theo thứ tự:

1. **[codex.md](./codex.md)**: Đọc file này đầu tiên. Nó chứa mọi quy chuẩn cốt lõi về cấu trúc code, UI/UX guidelines, và nguyên tắc sử dụng thư viện (shadcn/ui, GSAP, v.v).
2. **[design_tokens.md](./design_tokens.md)**: Đọc để lấy mã màu HEX chính xác, hệ thống lưới, biến spacing, và cách áp dụng Tailwind CSS v4 directives (ví dụ: `@theme`).
3. **[project_report.md](./project_report.md)**: Đọc để hiểu Phase hiện tại của dự án, những gì đã hoàn thành (Phase 1), và Roadmap chi tiết cho Phase tiếp theo (Phase 2, Phase 3).

## 🚀 Getting Started (Dành cho Developer/User)

Dự án được quản lý theo kiến trúc **Turborepo Monorepo**. Toàn bộ mã nguồn ứng dụng web được đặt tại `apps/web`.

Để chạy dự án ở môi trường local:

1. Copy `apps/web/.env.local.example` thành `apps/web/.env.local` và điền Supabase URL / Anon Key.
2. Cài đặt các dependencies ở **thư mục gốc (root)**:
```bash
npm install
```
3. Khởi động Development Server (Turborepo sẽ tự động map xuống package web):
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả. Mọi thay đổi mã nguồn trong `apps/web` sẽ auto-update.

## ⚙️ Công nghệ cốt lõi

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 (native `@theme`)
- **Components:** React 19, `HeroUI v3` (thay thế shadcn/ui)
- **Database & Auth:** Supabase (Client & Server SSR)
- **Animations:** GSAP, Lenis (Smooth Scroll)
- **Typography:** Noto Sans (Vietnamese Optimized)
- **Forms & Validation:** `react-hook-form` + `zod`
- **Global State:** `zustand`
