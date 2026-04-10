# Phase 3 Color Lab Migration Plan

**Status:** Internal production ready  
**Last Updated:** 2026-04-10

## Goal

Đưa `apps/web/app/color-lab` từ vertical slice sang internal-production runtime bằng cách giữ business rule hữu ích từ ref cũ nhưng không kéo lại legacy architecture.

## Implemented Scope

### Data model và contracts

- `ColorLabRecipe` mở rộng với `cameraLines` và `compatibilityNotes`.
- `ColorLabPhoto` chuyển sang recipe-bound model với `recipeId`, `storagePath`, `sortOrder`, `url`.
- `ColorLabPageData` có `loadState: "live" | "seeded-fallback" | "degraded"`.
- Public query layer chỉ trả về typed domain objects sau mapper normalization.

### Public runtime

- `/color-lab` parse `q`, `cameraLine`, `profile` từ URL.
- Filter state đồng bộ với URL để refresh/share link không mất context.
- Preview gallery đọc đúng ảnh của recipe đang chọn.
- Lightbox quay lại cho review ảnh lớn.
- `Transfer to Camera` guide card giữ 2 video hướng dẫn từ ref cũ.
- Public page phân biệt rõ:
  - `live`: dữ liệu thật từ Supabase
  - `seeded-fallback`: Supabase chưa có recipe nào
  - `degraded`: source lỗi/timeout, runtime hiển thị banner rõ ràng

### Admin workflow

- Admin vẫn dùng shared-password pattern, nhưng session chạy qua signed cookie thay vì gửi password trên mỗi request.
- Admin catalog chỉ load sau khi unlock.
- Recipe editor hỗ trợ:
  - `cameraLines`
  - `compatibilityNotes`
  - preset swatch palette + override hex thủ công
- Photo manager hỗ trợ:
  - upload file thật bằng `multipart/form-data`
  - recipe assignment
  - sort order
  - caption
  - thumbnail preview
  - metadata update
  - delete record + delete storage object

### Storage và cache

- Preview photos dùng bucket Supabase public `color-lab-preview`.
- Mapper build public URL từ `storagePath`.
- Mọi mutation Color Lab đều invalidate cache bằng tag + `revalidatePath("/color-lab")`.
- Xóa recipe sẽ dọn photo rows theo cascade và xóa luôn preview objects liên quan trong Storage.

## Legacy Behaviors Kept

- Lightbox cho preview photo
- `Transfer to Camera` guide card
- Preset swatch palette trong editor

## Explicitly Not Carried Over

- Monolithic page state
- Legacy contextual rail shell
- Legacy fetch/cache helpers

## Verification Expectations

Các gate local cần sạch trước khi chốt thay đổi:

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Remaining Follow-up

- Bổ sung browser smoke coverage cho public runtime và admin happy path.
- Thiết kế auth/role model an toàn hơn shared-password session.
- Hoàn thiện ops notes cho bucket moderation và content lifecycle.
