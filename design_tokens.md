# Sony Wiki — Design Tokens Specification

Tài liệu này định nghĩa bộ nguyên tắc thiết kế và các biến số (tokens) chính thức cho dự án Sony Wiki. **Tất cả các AI Agent khi tham gia phát triển dự án PHẢI tuân thủ tuyệt đối các giá trị này.**

---

## 🎨 1. Palette Màu

Tất cả màu sắc được cấu hình trong `apps/web/app/globals.css` và có thể sử dụng qua các utility classes của Tailwind CSS v4.

### Primary & Brand
- **Primary:** `#1a73e8` (Google/Sony Blue) — `bg-primary`, `text-primary`
- **Primary Hover:** `#1557b0`
- **Primary Light:** `#e8f0fe` (Thường dùng cho background active items)
- **Accent:** `#ff6d00` (Sony Orange/Gold accent) — `bg-accent`

### Status
- **Success:** `#0f9d58`
- **Warning:** `#f4b400`
- **Error:** `#db4437`

### Surface (Nền) — Adaptive (Light/Dark)
AI phải sử dụng các token semantic để tự động tương thích với Dark Mode:
- **Surface:** `var(--color-surface)` (Nền chính) — `bg-surface`
- **Surface Alt:** `var(--color-surface-alt)` (Nền phụ/sidebar) — `bg-surface-alt`
- **Surface Hover:** `var(--color-surface-hover)` — `hover:bg-surface-hover`

### Text — Adaptive (Light/Dark)
- **Text Primary:** `var(--color-text)` (#202124 / #e8eaed) — `text-text`
- **Text Secondary:** `var(--color-text-secondary)` (#5f6368 / #9aa0a6) — `text-text-secondary`
- **Text Muted:** `var(--color-text-muted)` — `text-text-muted`

---

## 📐 2. Spacing & Layout

Hệ thống spacing tuân thủ các biến số:
- **Sidebar Width:** `260px` (`w-sidebar`)
- **Header Height:** `56px` (`h-header`)
- **Container Gutters:** `1rem` (mobile) to `2rem` (desktop).

---

## 🔡 3. Typography

Dự án sử dụng bộ font Noto Sans được tối ưu cho tiếng Việt.
- **Sans Serif (Chính):** `Noto Sans`, `Noto Sans Vietnamese`
- **Base Line-height:** `1.6`
- **Font Weight:** 
    - Regular: `400`
    - Medium: `500` (Dùng cho sidebar nav, card titles)
    - Bold: `700` (Dùng cho H1, H2)

---

## 🔘 4. UI Components Rules

AI nên áp dụng các radius và shadow sau để đảm bảo tính "Premium":
- **Border Radius:**
    - `sm`: 4px (Buttons nhỏ)
    - `md`: 8px (Cards, Inputs - Tiêu chuẩn)
    - `lg`: 12px (Modal, Dialog)
- **Shadow:**
    - Sử dụng `shadow-sm` cho các card trạng thái tĩnh.
    - Sử dụng `shadow-md` cho các phần tử nổi (popover, dropdown).

---

## 🛠 5. Quy định Code cho AI Agent

1. **Tailwind v4 Directive:** Luôn sử dụng `@theme` trong CSS và không sử dụng các file config cũ (`tailwind.config.js`).
2. **Dark Mode Toggle:** Sử dụng thuộc tính `[color-scheme="dark"]` trên thẻ `html`. AI phải kiểm tra biến này khi debug giao diện.
3. **No Hardcoded Values:** Không bao giờ hardcode màu HEX vào component. Luôn sử dụng Tailwind classes (ví dụ: `text-primary` thay vì `text-[#1a73e8]`).
4. **Shadcn/ui:** Luôn ưu tiên components từ `shadcn/ui` và customize chúng dựa trên bộ Design Tokens này.

---

*Phiên bản: 1.0*
*Cập nhật cuối: 08/04/2026*
