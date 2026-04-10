# Sony Wiki — Design Tokens Specification

Tài liệu này mô tả token runtime thực tế đang được dùng trong `apps/web`. Source of truth là [apps/web/app/globals.css](/home/thaikpham/Documents/Sony-wiki/sony-wiki/apps/web/app/globals.css), không phải theme URL hay ảnh chụp giao diện cũ.

## 1. Token authority

Runtime hiện dùng ba lớp token chồng lên nhau trong `globals.css`:

1. semantic layer khai báo qua `@theme`
2. shadcn/HeroUI bridge qua `@theme inline`
3. giá trị hiệu lực tại `:root` và `.dark`

Quy tắc thực tế:

- component nên đọc semantic token như `--surface`, `--foreground`, `--border`, `--ring`
- palette hiệu lực cuối cùng được quyết định bởi `:root` và `.dark`
- URL theme từ TweakCN chỉ còn giá trị tham khảo lịch sử; không còn là source of truth

## 2. Hướng visual hiện tại

Theme runtime hiện tại không còn là palette xanh-vàng như lớp tài liệu cũ từng mô tả. Hướng visual hiệu lực đang là:

- nền trung tính, độ tương phản cao
- surface tách lớp bằng `card`, `secondary`, `surface-alt`
- primary và accent thiên về monochrome/high-contrast
- semantic feedback giữ riêng cho `success`, `warning`, `danger`

Nói ngắn gọn: repo đang dùng một token bridge trung tính để bảo đảm HeroUI, shadcn và custom components cùng đọc được một bộ biến thống nhất.

## 3. Semantic token groups

### Surface & text

- `--background`
- `--foreground`
- `--surface`
- `--surface-alt`
- `--surface-hover`
- `--surface-secondary`
- `--surface-tertiary`
- `--overlay`
- `--muted-foreground`
- `--text-secondary`
- `--text-inverse`

### Action & state

- `--primary`
- `--primary-hover`
- `--primary-foreground`
- `--primary-soft`
- `--accent`
- `--accent-hover`
- `--accent-foreground`
- `--ring`
- `--focus`

### Feedback

- `--success`
- `--success-foreground`
- `--warning`
- `--warning-foreground`
- `--danger`
- `--danger-foreground`

### Field/system

- `--field-background`
- `--field-foreground`
- `--field-placeholder`
- `--field-border`
- `--segment`
- `--separator`
- `--default`

## 4. Shadcn and HeroUI bridge

`globals.css` đang giữ cầu nối để cả hai lớp UI cùng dùng được:

- shadcn/UI variables: `--card`, `--popover`, `--secondary`, `--muted`, `--destructive`, `--sidebar-*`
- semantic aliases cho app runtime: `--surface`, `--surface-alt`, `--text-secondary`, `--border-subtle`
- backward-compatible aliases: `--color-*`

Điều này cho phép:

- HeroUI components đọc palette chung
- custom Tailwind classes trong app shell vẫn dùng token semantic
- phần UI cũ chưa migrate hết tiếp tục chạy qua alias layer

## 5. Typography, layout, radius, shadow

### Typography

- `--font-sans`: `Noto Sans`
- `--font-serif`: `Noto Serif`
- `--font-mono`: `Red Hat Mono`

### Layout

- `--layout-header-height`: `56px`

### Radius

- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`
- `--radius-full`
- shadcn bridge còn sinh thêm `--radius-2xl`, `--radius-3xl`, `--radius-4xl`

### Shadow

- `--shadow-sm`
- `--shadow-md`
- `--shadow-lg`
- `--shadow-xl`
- `--shadow-2xl`

### Motion

- `--transition-fast`
- `--transition-base`
- `--transition-slow`

### Breakpoints

- `--breakpoint-xs`
- `--breakpoint-sm`
- `--breakpoint-md`
- `--breakpoint-lg`
- `--breakpoint-xl`
- `--breakpoint-2xl`

## 6. Theme runtime behavior

Theme mode được điều khiển đồng thời bằng:

- `localStorage("color-scheme")`
- thuộc tính `html[color-scheme="light|dark"]`
- class `.dark` trên `document.documentElement`

`ThemeToggle` đang dùng cơ chế hydration-safe để tránh mismatch giữa SSR và client render.

## 7. Current usage map

Những vùng đang dựa trực tiếp vào token layer này:

- `TopNavigation`
- `GlobalSearch`
- `AuthSlot`
- `ThemeToggle`
- `ClientLayout`
- `/`
- `/wiki`
- `/wiki/[slug]`
- `/color-lab`
- toàn bộ modal/admin workspace của `Wiki` và `Color Lab`

## 8. Compatibility notes

Alias `--color-*` vẫn còn cần thiết vì repo chưa hoàn tất migrate toàn bộ UI sang semantic token trực tiếp.

Quy tắc:

- component mới: dùng semantic token trước
- component cũ đang được chạm tới: remap dần khỏi alias
- không thêm palette rời mới trong component nếu chưa chuẩn hóa vào token layer

## 9. UI library rules

1. HeroUI v3 là UI layer mặc định cho app shell và phần lớn controls.
2. shadcn trong repo chủ yếu đóng vai trò bridge theme và primitive support.
3. Với HeroUI, ưu tiên `onPress` thay vì `onClick` khi component hỗ trợ.
4. Khi HeroUI variant mặc định không đủ tương phản, được phép override bằng semantic token ở mức component.
5. Không dùng raw màu rải rác trong component khi một token tương đương đã tồn tại.

## 10. Maintenance rules

1. Mọi thay đổi token phải cập nhật [apps/web/app/globals.css](/home/thaikpham/Documents/Sony-wiki/sony-wiki/apps/web/app/globals.css) và file này cùng lúc.
2. Khi đổi visual direction, mô tả lại token authority và theme behavior thay vì chỉ thay ảnh chụp hoặc link theme.
3. Khi migrate từ legacy, remap style cũ về semantic token mới; không bê nguyên palette legacy sang runtime mới.
4. Nếu thêm token mới, đặt tên theo mục đích sử dụng chứ không đặt theo màu.

*Phiên bản: 3.0*
*Cập nhật cuối: 10/04/2026*
