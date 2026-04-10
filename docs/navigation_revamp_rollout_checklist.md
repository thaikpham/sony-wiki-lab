# Navigation Revamp Rollout Checklist

Checklist này phản ánh trạng thái navigation/shell thật trong `apps/web` sau khi runtime đã có `Wiki`, `Color Lab` và `Photobooth` hoạt động.

## 1. Current rollout status

Navigation revamp không còn là kế hoạch tương lai. Nó đã trở thành shell mặc định của ứng dụng:

- `ClientLayout` dùng top-navigation-only
- `TopNavigation` render điều hướng `Wiki`, `Color Lab`, `Livestream` và `Photobooth`
- `GlobalSearch` hoạt động với `/api/search`
- `ThemeToggle` đã hydration-safe
- `AuthSlot` đã có đủ state UI, nhưng auth integration thật chưa nối

## 2. Foundation checklist

- [x] `ClientLayout` là app shell mặc định
- [x] `TopNavigation` được sticky ở đầu trang
- [x] shell không còn phụ thuộc sidebar/drawer legacy
- [x] `globals.css` có semantic token layer dùng chung cho shell
- [x] `ThemeToggle` đồng bộ `localStorage`, `color-scheme` và `.dark`

## 3. Search checklist

- [x] route `GET /api/search?q=&limit=` đã tồn tại
- [x] kết quả search hỗ trợ `product` và `category`
- [x] keyboard support có `ArrowUp`, `ArrowDown`, `Enter`, `Escape`
- [x] kết quả điều hướng đúng về `/wiki` hoặc `/wiki/[slug]`
- [x] có state `loading`, `results`, `empty`, `error`

## 4. Navigation destinations

- [x] `/` có landing content
- [x] `/wiki` mở được từ top nav
- [x] `/color-lab` mở được từ top nav
- [x] `/photobooth` mở được từ top nav
- [x] search có thể đưa người dùng sang `Wiki`

## 5. Auth and state handling

- [x] `AuthSlot` hỗ trợ state `guest`
- [x] `AuthSlot` hỗ trợ state `loading`
- [x] `AuthSlot` hỗ trợ state `authenticated`
- [ ] auth shell chưa nối với flow đăng nhập thật

## 6. Quality and verification

- [ ] browser smoke test tự động cho shell/navigation chưa có
- [ ] mobile search interaction chưa có e2e coverage
- [ ] cần xác nhận định kỳ rằng `lint`, `typecheck`, `build`, `test` vẫn xanh sau các thay đổi shell lớn

## 7. Regression watch list

Những điểm nên kiểm tra lại sau mỗi thay đổi liên quan shell:

- [ ] top nav vẫn highlight đúng route active
- [ ] `GlobalSearch` không bị stuck popover khi đổi route
- [ ] `ThemeToggle` giữ trạng thái sau reload
- [ ] layout không vỡ ở mobile và desktop
- [ ] `AuthSlot` không gây layout shift ở breakpoint nhỏ

## 8. Revert plan

Nếu navigation/shell gây regression nghiêm trọng:

1. revert nhóm thay đổi gần nhất trong `components/layout/*`
2. nếu cần, vô hiệu hóa phần trigger search trước khi chạm vào route surface
3. không rollback schema/migrations vì chúng không phải nguyên nhân trực tiếp của navigation regression

*Cập nhật: 10/04/2026*
