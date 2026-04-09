# Kế Hoạch Phase 2: Wiki Migration

Phase 2 tập trung migrate module `wiki` từ `sony-wiki-ref/sony-wiki-dev` sang runtime mới trong `sony-wiki/apps/web`.

## 1. Trạng thái hiện tại

Phase 2 đã được khởi động một phần, không còn ở mức planning thuần.

### Đã có trong runtime

- route `/wiki`
- route `/wiki/[slug]`
- route `GET /api/search`
- Supabase schema cho `wiki_categories` và `wiki_products`
- search indexes phục vụ `ilike` query
- detail page đọc dữ liệu published từ Supabase

### Chưa hoàn tất

- listing UI thật cho `/wiki`
- category filter flow hoàn chỉnh
- compare flow
- gallery/media presentation
- admin CRUD
- service layer tách riêng cho wiki domain

## 2. Mục tiêu

- Hoàn thiện `wiki` theo kiến trúc App Router hiện tại.
- Chuẩn hóa data access và UI structure để không trộn placeholder với logic thật.
- Chuyển phần `wiki` từ trạng thái nền móng sang trạng thái sử dụng được.

## 3. Nguồn đầu vào

### Source of truth để implement

- `sony-wiki/apps/web`
- `sony-wiki/codex.md`
- `sony-wiki/design_tokens.md`
- `sony-wiki/docs/repository_structure.md`

### Nguồn tham chiếu để migrate

- `sony-wiki-ref/sony-wiki-dev`
- các flow, model và màn hình cũ thuộc phần `wiki`

## 4. Phạm vi triển khai còn lại

1. Listing page
   - thay placeholder ở `/wiki`
   - hiển thị danh sách product thật
   - xử lý empty state, loading state, no-result state
2. Filter & query state
   - đồng bộ `q`
   - đồng bộ `category`
   - chuẩn bị chỗ cho sort/compare nếu cần
3. Detail hardening
   - chuẩn hóa metadata
   - xem xét related content, gallery, specs grouping
4. Data access
   - tạo layer helper/service để giảm query logic nằm trực tiếp trong page/API
5. Admin flow
   - create/update/delete sản phẩm
   - validation
   - publish/unpublish flow

## 5. Deliverables kỳ vọng

- listing `/wiki` dùng được với dữ liệu thật
- detail `/wiki/[slug]` được giữ ổn định và có thể mở rộng
- data access/domain layer rõ ràng cho `wiki`
- admin flow cơ bản cho products/categories
- tài liệu mapping đủ rõ giữa logic cũ và logic mới nếu có khác biệt đáng kể

## 6. Nguyên tắc thực thi

- Không copy nguyên file từ repo cũ sang repo mới.
- Chỉ giữ lại business flow, fields và rules thật sự cần.
- Mọi UI mới phải dùng HeroUI v3 và semantic token hiện tại.
- Nếu phát hiện rule cũ vẫn cần giữ, ghi lại vào docs thay vì chỉ giữ trong đầu.
- Mỗi bước nên đủ nhỏ để verify bằng `lint` và khi cần thì `build`.

## 7. Definition of Done

Phase 2 được xem là hoàn thành khi:

- `/wiki` có listing thật
- `/wiki/[slug]` ổn định với dữ liệu published
- search và filter dẫn tới trải nghiệm điều hướng dùng được
- dữ liệu có schema rõ ràng trên Supabase
- admin flow cơ bản hoạt động
- tài liệu không còn mơ hồ về việc lấy gì từ `sony-wiki-ref`

## 8. BMAD checkpoint

Trước mỗi lần tiếp tục Phase 2:

1. Xác nhận phần nào đã có thật trong runtime.
2. Ghi rõ phần nào vẫn là placeholder.
3. Chốt scope nhỏ cho lượt implement tiếp theo.
4. Sau khi code xong, đồng bộ lại docs nếu trạng thái Phase 2 đã thay đổi.

*Cập nhật: 09/04/2026*
