# Kế hoạch triển khai Phase 2: Sony Wiki Migration

Dưới đây là kế hoạch chi tiết để triển khai hệ thống Wiki sản phẩm vào sáng mai.

## 1. Mục tiêu
- Thiết lập Database cho Wiki trên Supabase.
- Xây dựng giao diện Listing (Grid) và Detail (Specs) cho sản phẩm.
- Xây dựng hệ thống Admin CRUD để quản lý dữ liệu.

## 2. Công nghệ sử dụng
- **UI:** HeroUI v3 + Tailwind CSS v4.
- **Form:** React Hook Form + Zod.
- **State:** Zustand.
- **Database:** Supabase (PostgreSQL + RLS).

## 3. Cấu trúc Database (Dự kiến)
File SQL đã được chuẩn bị tại: `apps/web/lib/supabase/migrations/20260408_wiki_schema.sql`

```sql
-- Bảng Categories: Máy ảnh, Ống kính...
-- Bảng Products: Name, Slug, Description, Specs (JSONB), Gallery...
```

## 4. Các bước thực hiện sáng mai:
1. **Apply SQL:** Chạy mã SQL trong Dashboard Supabase.
2. **Fetch Data:** Tạo Service layer trong `apps/web/lib/supabase/`.
3. **UI Listing:** Tạo trang `/wiki` hiển thị danh sách sản phẩm.
4. **UI Detail:** Tạo trang `/wiki/[slug]` hiển thị thông số chi tiết.
5. **Admin Form:** Tạo form quản lý sản phẩm.

---
*Ghi chú: Đã cài đặt đầy đủ các thư viện cần thiết (`zod`, `rhf`, `zustand`). Hệ thống đã sẵn sàng thực thi.*
