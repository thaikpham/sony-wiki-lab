# Sony Wiki — Design Tokens Specification

Tài liệu này định nghĩa token runtime chính thức cho `sony-wiki/apps/web`. Source of truth hiện tại là [apps/web/app/globals.css](/home/thaikpham/Documents/Sony-wiki/sony-wiki/apps/web/app/globals.css).

Theme nền hiện tại đã được áp từ shadcn registry của TweakCN:

- `https://tweakcn.com/r/themes/cmnr4nnqp000304kv7jxh4ag3`

## 1. Nguyên tắc nền

- Component mới bắt buộc ưu tiên semantic tokens như `--background`, `--foreground`, `--surface`, `--primary`, `--border`, `--ring`.
- Không hardcode màu, radius hoặc shadow mới trong component nếu chưa được chuẩn hóa.
- Alias `--color-*` đang được giữ lại để tương thích với phần UI còn trong giai đoạn migrate.
- Dark mode được điều khiển ở mức root bằng cả `color-scheme` và class `.dark`, vì shadcn theme cần `.dark` còn app cũ đang dùng `color-scheme`.
- Theme toggle hiện dùng render hydration-safe để tránh mismatch giữa SSR và client.

## 2. Semantic Color Tokens

### Surface & Text

- `--background`
- `--foreground`
- `--surface`
- `--surface-alt`
- `--surface-hover`
- `--border`
- `--border-subtle`
- `--muted-foreground`
- `--text-secondary`
- `--text-inverse`

### Brand & Feedback

- `--primary`
- `--primary-hover`
- `--primary-foreground`
- `--primary-soft`
- `--accent`
- `--accent-hover`
- `--accent-foreground`
- `--success`
- `--warning`
- `--danger`
- `--ring`

Lưu ý hiện tại:

- `--background`, `--foreground`, `--primary`, `--accent`, `--border`, `--ring` đang lấy visual direction từ TweakCN theme.
- `--surface`, `--surface-alt`, `--surface-hover`, `--text-secondary`, `--border-subtle` là lớp semantic được map lại để phần app cũ dùng tiếp được.

### Dark mode aliases

Trong `globals.css` hiện có thêm lớp token dark:

- `--dark-background`
- `--dark-foreground`
- `--dark-surface`
- `--dark-surface-alt`
- `--dark-surface-hover`
- `--dark-border`
- `--dark-border-subtle`
- `--dark-muted-foreground`
- `--dark-text-secondary`
- `--dark-ring`

Khi `html[color-scheme="dark"]` được set, semantic token sẽ được remap trực tiếp sang các giá trị này.

## 3. Backward-Compatible Alias Layer

Hiện runtime vẫn duy trì alias để tránh gãy màn:

- `--color-primary -> --primary`
- `--color-primary-hover -> --primary-hover`
- `--color-primary-light -> --primary-soft`
- `--color-surface -> --surface`
- `--color-surface-alt -> --surface-alt`
- `--color-surface-hover -> --surface-hover`
- `--color-border -> --border`
- `--color-border-light -> --border-subtle`
- `--color-text -> --foreground`
- `--color-text-secondary -> --text-secondary`
- `--color-text-muted -> --muted-foreground`
- `--color-text-inverse -> --text-inverse`
- `--color-sidebar -> --surface`
- `--color-sidebar-active -> --primary-soft`
- `--spacing-header -> --layout-header-height`

Quy tắc:

- UI mới: dùng semantic token trực tiếp.
- UI cũ hoặc placeholder hiện tại: alias còn chấp nhận được, nhưng khi chạm vào nên remap dần.

## 4. Layout, Typography, Radius, Shadow, Motion

### Layout

- `--layout-header-height`: `56px`

### Typography

- `--font-sans`: `Noto Sans`, `ui-sans-serif`, `sans-serif`, `system-ui`
- `--font-mono`: `Red Hat Mono`, `ui-monospace`, `monospace`
- `--font-serif`: `Noto Serif`, `ui-serif`, `serif`

### Radius

- `--radius-sm`: `4px`
- `--radius-md`: `8px`
- `--radius-lg`: `12px`
- `--radius-xl`: `16px`
- `--radius-full`: `9999px`

### Shadow

- `--shadow-sm`
- `--shadow-md`
- `--shadow-lg`

### Transition

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

## 5. HeroUI v3 Usage Rules

1. Dùng `@heroui/react` + `@heroui/styles` làm UI layer mặc định.
2. Không dùng provider/pattern v2 như `@heroui/system`.
3. Ưu tiên `onPress` cho action trên HeroUI components.
4. Ưu tiên semantic variant thay vì style theo raw color.
5. Nếu thêm shadcn component mới, phải giữ nó dùng cùng token trong `globals.css` thay vì tự tạo palette khác.

## 6. Hiện trạng áp dụng trong web

- `TopNavigation`, `ThemeToggle`, `GlobalSearch`, `/wiki`, `/color-lab` và `/wiki/[slug]` đều đang dựa vào lớp token này.
- Theme persistence dùng `localStorage("color-scheme")`, set vào `document.documentElement`, đồng thời sync class `.dark`.
- Riêng vùng top navigation đang có thêm contrast override ở mức component để giữ độ đọc tốt khi HeroUI variant mặc định chưa khớp hoàn toàn với theme registry hiện tại.
- Placeholder pages vẫn còn dùng một phần alias `--color-*`, nên alias layer chưa thể bỏ ngay.
- Repo đã có:
  - `apps/web/components.json`
  - `apps/web/components/ui/button.tsx`
  - `apps/web/lib/utils.ts`

## 7. AI Agent Rules

1. Mọi thay đổi token phải cập nhật [apps/web/app/globals.css](/home/thaikpham/Documents/Sony-wiki/sony-wiki/apps/web/app/globals.css) và tài liệu này cùng lúc.
2. Khi migrate từ `sony-wiki-ref`, remap về semantic token mới, không bê nguyên style cũ.
3. Nếu feature cần token mới, thêm vào semantic layer trước rồi mới dùng ở component.
4. Nếu chỉ sửa component nhỏ, ưu tiên tái sử dụng token hiện có thay vì tạo token mới không cần thiết.
5. Không đổi sang theme khác nếu chưa cập nhật docs và xác nhận dark-mode sync vẫn hoạt động.
6. Nếu gặp xung đột giữa theme registry và HeroUI khiến chữ/nền không đủ tương phản, ưu tiên sửa để đọc được trước rồi mới tối ưu hóa lại token chung.

*Phiên bản: 2.3*
*Cập nhật cuối: 09/04/2026*
