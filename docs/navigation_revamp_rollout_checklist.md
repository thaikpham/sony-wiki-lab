# Navigation Revamp Rollout Checklist

Checklist này được cập nhật theo hiện trạng navigation đang có trong `apps/web`.

## 1. Hiện trạng rollout

Navigation revamp về cơ bản đã được áp dụng trong runtime hiện tại:

- `ClientLayout` đã dùng top-navigation-only
- `TopNavigation`, `GlobalSearch`, `ThemeToggle`, `AuthSlot` đã tồn tại
- route `GET /api/search` đã hoạt động trong build

Checklist dưới đây được chuyển sang dạng hardening/maintenance thay vì rollout mới hoàn toàn.

## 2. Verification

### Foundation

- [x] Semantic tokens đã có trong `apps/web/app/globals.css`
- [x] Alias `--color-*` còn hoạt động cho phần UI đang migrate
- [x] Focus ring dùng `--ring`

### Shell

- [x] `ClientLayout` dùng kiến trúc top-navigation-only
- [x] Không còn phụ thuộc `AppHeader` hoặc `Sidebar` legacy trong runtime mới
- [x] `AuthSlot` hỗ trợ đủ state `guest/loading/authenticated`

### Search

- [x] Route `GET /api/search?q=&limit=` đã tồn tại
- [x] Keyboard support: `ArrowUp`, `ArrowDown`, `Enter`, `Escape`
- [x] Result item điều hướng về `/wiki` hoặc `/wiki/[slug]`
- [x] Search có state `loading`, `results`, `empty`, `error`

### Theme

- [x] Dark/light mode giữ theo semantic tokens
- [x] Theme persistence sau reload được xử lý qua `localStorage`

### Build confidence

- [x] `npm run lint` pass
- [x] `npm run build` pass

## 3. Open items còn lại

- [ ] `/wiki` vẫn đang là placeholder cho listing thực
- [ ] mobile search interaction chưa được mô tả bằng e2e test
- [ ] auth shell chưa nối với flow đăng nhập thật
- [ ] chưa có smoke test tự động cho điều hướng và search

## 4. Lưu ý cập nhật

Checklist cũ có mục về mobile drawer. Mục đó không còn phù hợp vì app shell hiện tại là top-navigation-only, không dùng drawer làm navigation chuẩn.

## 5. Revert plan

Nếu navigation hiện tại gây sự cố nghiêm trọng:

1. Revert nhóm thay đổi gần nhất trong shell/navigation.
2. Tạm vô hiệu hóa trigger điều hướng từ search nếu API/search payload lỗi.
3. Giữ lại migration SQL vì chúng không làm hỏng runtime navigation.

## 6. Smoke test sau mỗi thay đổi navigation

- [ ] `/wiki` vào được từ top nav
- [ ] `/color-lab` vào được từ top nav
- [ ] search trả điều hướng đúng theo loại kết quả
- [ ] theme toggle vẫn giữ trạng thái sau reload
- [ ] layout không vỡ trên mobile và desktop

*Cập nhật: 09/04/2026*
