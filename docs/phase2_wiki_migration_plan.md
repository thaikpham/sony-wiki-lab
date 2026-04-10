# Kế Hoạch Phase 2: Wiki Migration

Phase 2 của `wiki` hiện đã đi qua mốc migrate nền tảng và bước vào trạng thái release-hardening. Tài liệu này giữ vai trò ngắn gọn; trạng thái production-ready chi tiết đã được khóa ở [wiki_production_ready.md](/home/thaikpham/Documents/Sony-wiki/sony-wiki/docs/wiki_production_ready.md).

## 1. Những gì đã hoàn tất trong Phase 2

- `/wiki` và `/wiki/[slug]` chạy trên typed Supabase contracts
- compare queue + quick view + category/subcategory filtering
- inline admin runtime trong chính `/wiki`
- session-cookie auth cho admin thay cho shared header/password flow
- upload ảnh thật qua Supabase Storage bucket `wiki-media`
- legacy import pipeline qua `REF/wiki/legacy-catalog.json` + `scripts/wiki-import-legacy.ts`
- cache revalidation cho listing/detail sau mutation
- related products rail trên detail page
- Playwright smoke suite cho flow production chính

## 2. Boundary đã khóa

- source of truth runtime: `apps/web`
- nguồn tham chiếu migration: `../sony-wiki-ref/sony-wiki-dev`
- `sony-wiki-ref` không được dùng làm runtime dependency

## 3. Release gates hiện tại

- `npm run test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run test:e2e`

## 4. Tài liệu nên đọc tiếp

- [wiki_production_ready.md](/home/thaikpham/Documents/Sony-wiki/sony-wiki/docs/wiki_production_ready.md)
- [implementation_status.md](/home/thaikpham/Documents/Sony-wiki/sony-wiki/docs/implementation_status.md)

*Cập nhật: 10/04/2026*
