import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sony Wiki — Trang chủ",
  description:
    "Sony Wiki workspace cho Wiki, Color Lab và Photobooth runtime",
};

const workspaceCards = [
  {
    href: "/wiki",
    eyebrow: "Knowledge Base",
    title: "Wiki sản phẩm Sony",
    description:
      "Duyệt catalog, lọc theo category, so sánh thông số và quản trị dữ liệu sản phẩm ngay trên runtime mới.",
    cta: "Mở Wiki",
  },
  {
    href: "/color-lab",
    eyebrow: "Creative Pipeline",
    title: "Color Lab",
    description:
      "Khám phá recipe library, preview ảnh mẫu và quản trị presets cho workflow màu sắc của Sony.",
    cta: "Mở Color Lab",
  },
  {
    href: "/photobooth",
    eyebrow: "Event Runtime",
    title: "Photobooth",
    description:
      "Giới thiệu booth app, preview flow capture kiosk, gallery nội bộ và public share cho sự kiện.",
    cta: "Mở Photobooth",
  },
];

const statusCards = [
  {
    label: "Phase 2",
    value: "Wiki",
    note: "Listing, detail, compare và admin CRUD đã hoạt động.",
  },
  {
    label: "Phase 3",
    value: "Color Lab",
    note: "Runtime và CRUD cơ bản đã sẵn sàng cho preview cục bộ.",
  },
  {
    label: "Quality Gates",
    value: "4/4 pass",
    note: "Test, typecheck, lint và build đều đã xanh.",
  },
  {
    label: "Phase 4",
    value: "Photobooth",
    note: "Landing, capture UI, gallery và public share đang được dựng theo ref studio.",
  },
];

const workflowSteps = [
  "Dùng `Wiki` để quản lý catalog sản phẩm và dữ liệu specs.",
  "Dùng `Color Lab` để kiểm tra recipe presets và preview workflow.",
  "Dùng `Photobooth` để thử booth workflow: tải app local, chụp, review gallery và phát link share.",
  "Dùng admin workspace trong từng module để tạo, sửa, xóa dữ liệu ngay trên runtime mới.",
];

export default function HomePage() {
  return (
    <div className="space-y-8 py-8">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[radial-gradient(circle_at_top_left,_rgba(208,156,48,0.16),_transparent_32%),linear-gradient(135deg,var(--surface),var(--surface-alt))] p-6 shadow-sm lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px] xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Sony Wiki Runtime
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)] lg:text-6xl">
              Workspace mới cho product knowledge và color recipes
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)] lg:text-base">
              Preview này không còn là trang trắng nữa. Bạn có thể đi thẳng vào
              `Wiki` để quản lý catalog sản phẩm hoặc mở `Color Lab` để duyệt recipe
              library, preview ảnh mẫu và kiểm tra CRUD flow.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/wiki"
                className="inline-flex items-center rounded-2xl bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
              >
                Vào Wiki
              </Link>
              <Link
                href="/color-lab"
                className="inline-flex items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                Mở Color Lab
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {statusCards.map((card) => (
              <article
                key={card.label}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/85 p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  {card.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                  {card.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {card.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {workspaceCards.map((card, index) => (
          <article
            key={card.href}
            className={`rounded-[2rem] border p-6 shadow-sm ${
              index === 0
                ? "border-[var(--border)] bg-[var(--surface)]"
                : index === 1
                  ? "border-[var(--border)] bg-[linear-gradient(180deg,var(--surface),var(--surface-alt))]"
                  : "border-[var(--border)] bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.08),transparent_32%),linear-gradient(180deg,var(--surface),var(--surface-alt))]"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              {card.eyebrow}
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
              {card.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {card.description}
            </p>
            <Link
              href={card.href}
              className="mt-6 inline-flex items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              {card.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm xl:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            Preview Checklist
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
            Những gì bạn có thể kiểm tra ngay bây giờ
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            Toàn bộ runtime mới đã được nối đủ để preview cục bộ. Nếu muốn nghiệm thu
            nhanh, chỉ cần đi theo ba bước dưới đây.
          </p>
        </div>

        <div className="space-y-3">
          {workflowSteps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-semibold text-[var(--background)]">
                {index + 1}
              </div>
              <p className="text-sm leading-7 text-[var(--foreground)]">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
