# Sony Wiki — Project Report & Roadmap

Tài liệu này tổng hợp các kết quả đã đạt được trong **Phase 1** và lộ trình chi tiết cho các giai đoạn tiếp theo của dự án Sony Wiki.

---

## 🟢 Phase 1: Template Cleanup & Foundation (Completed)

Mục tiêu chính là chuyển đổi từ template Rayo (cũ) sang một nền tảng sạch, hiện đại, và đúng tiêu chuẩn thiết kế Sony.

### Kết quả đạt được:
- **Cleanup toàn diện:** Xoá bỏ hơn 50+ component demo, 24 file JSON dữ liệu mẫu và hơn 1.4MB mã nguồn CSS không cần thiết.
- **Stack hiện đại:**
    - Framework: **Next.js 16 (App Router)**.
    - Styling: **Tailwind CSS v4** (sử dụng `@theme` directive).
    - Database & Auth: **Supabase** client (Server & Browser).
    - Typography: **Noto Sans Vietnamese** (tối ưu hiển thị TV).
- **Layout Shell:**
    - Sidebar navigation cố định trên desktop, drawer trên mobile.
    - Header tích hợp Breadcrumb và **Dark/Light Mode** toggle.
    - Tích hợp **Lenis Smooth Scroll** và GSAP ScrollTrigger.
- **Thiết kế & Tiêu chuẩn:**
    - Hoàn tất [codex.md](file:///c:/Users/5015324321/Downloads/color-white-repo-master/color-white-repo-master/codex.md) — "Sách quy tắc" cho toàn bộ UI/UX.
    - Tạo các route stubs cho `/wiki` và `/color-lab`.

---

## 🟡 Phase 2: Wiki Migration (Roadmap)

Xây dựng kho dữ liệu sản phẩm Sony với khả năng quản lý chuyên sâu.

### Các hạng mục chính:
1. **Dữ liệu & Schema:**
    - Thiết kế bảng `wiki_products` trên Supabase (Title, Slug, Spec, Category, Image...).
    - Khởi tạo RLS (Row Level Security) cho phép Public Read và Admin CRUD.
2. **Wiki Listing:**
    - Giao diện lưới (grid) sản phẩm theo [codex.md](file:///c:/Users/5015324321/Downloads/color-white-repo-master/color-white-repo-master/codex.md).
    - Hệ thống Filter theo Category (Camera, Lens, Accessories).
    - Tính năng Search nhanh (client-side hoặc Supabase search).
3. **Product Detail:**
    - Trang chi tiết hiển thị thông số kỹ thuật dạng bảng.
    - Gallery ảnh sản phẩm.
    - Tính năng so sánh sản phẩm (Compare Mode).
4. **Admin Management:**
    - Dashboard quản lý (Auth via Supabase).
    - Form CRUD sản phẩm (sử dụng shadcn/ui components).

---

## 🔵 Phase 3: Color Lab Migration (Roadmap)

Xây dựng hệ thống quản lý recipe màu và ảnh mẫu cho máy ảnh Sony.

### Các hạng mục chính:
1. **Recipe Management:**
    - Schema cho bảng `color_recipes` (Simulation, WB, Noise Reduc, Clarity, etc.).
    - Giao diện hiển thị danh sách recipe chuyên nghiệp.
2. **Sample Photos:**
    - Hệ thống Storage trên Supabase để lưu trữ ảnh mẫu.
    - Chế độ xem Before/After (Slider) cho ảnh đã áp dụng recipe.
3. **Color Lab Integration:**
    - Liên kết Recipe với các dòng máy tương thích (compatibility mapping).
    - Tính năng Export recipe (nếu cần).

---

## 🛠 Hướng dẫn cho AI Partner (System Protocol)

Khi tiếp tục thực hiện các Phase tiếp theo, bất kỳ AI Agent nào cũng phải tuân thủ nghiêm ngặt protocol sau:

1. **Protocol Khởi Động:** Luôn đọc **[codex.md](./codex.md)** và **[design_tokens.md](./design_tokens.md)** TRƯỚC KHI đề xuất code hoặc tạo component mới.
2. **Monorepo Rule:** Toàn bộ Next.js App giờ nằm trong `apps/web/`. Cấm khởi tạo file source ở thư mục gốc (root).
3. **Design Tokens First:** Mọi màu sắc, spacing, typography phải được lấy từ `design_tokens.md` và class của `Tailwind v4`. KHÔNG hardcode.
4. **Atomic Design:** Sử dụng `HeroUI` (`@heroui/react`) cho các thành phần cơ bản (buttons, inputs, tables).
5. **Supabase Integration:**
    - Dùng `apply_sql` hoặc Supabase Dashboard để cập nhật Schema khi được yêu cầu.
    - Ưu tiên Server Components trong Next.js 16 để fetch dữ liệu từ Supabase.
6. **Giữ Vững Shell:** Layout shell gồm Header, Sidebar, Scroll đã hoàn thiện. Các chức năng mới chỉ triển khai bên trong vùng `<main>` của `apps/web`.
7. **Agile AI-Driven Development:** Áp dụng hệ thống **BMAD-METHOD** (`_bmad`). Output planning/implementation artifacts sẽ được generate và quản lý thông qua framework này.

---

*Ngày báo cáo: 08/04/2026*
*Trạng thái Project: **Phase 1.5 (Turborepo) Completed - Ready for Phase 2***
