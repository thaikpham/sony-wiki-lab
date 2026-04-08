import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sony Wiki — Trang chủ",
  description: "Quản lý Wiki sản phẩm và Color Lab cho Sony",
};

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 lg:py-12">
      {/* Welcome hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text)] mb-3">
          Sony Wiki
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-lg mx-auto">
          Quản lý thông tin sản phẩm và công thức màu cho hệ sinh thái Sony.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
        {/* Wiki card */}
        <Link
          href="/wiki"
          className="group relative flex flex-col gap-3 p-6 rounded-xl
                     bg-[var(--color-surface-alt)] border border-[var(--color-border-light)]
                     hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-md)]
                     transition-all duration-[var(--transition-base)] no-underline"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl
                          bg-[var(--color-primary-light)] text-[var(--color-primary)]
                          group-hover:scale-105 transition-transform duration-[var(--transition-base)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.466.89 6.064 2.352M12 6.042a8.967 8.967 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.352" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">Wiki sản phẩm</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Quản lý thông tin, so sánh và tìm kiếm các sản phẩm Sony.
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--color-primary)] mt-auto">
            Truy cập →
          </span>
        </Link>

        {/* Color Lab card */}
        <Link
          href="/color-lab"
          className="group relative flex flex-col gap-3 p-6 rounded-xl
                     bg-[var(--color-surface-alt)] border border-[var(--color-border-light)]
                     hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-md)]
                     transition-all duration-[var(--transition-base)] no-underline"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl
                          bg-orange-50 text-[var(--color-accent)]
                          group-hover:scale-105 transition-transform duration-[var(--transition-base)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-1">Color Lab</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Quản lý công thức màu, ảnh mẫu và recipe cho máy ảnh Sony.
            </p>
          </div>
          <span className="text-xs font-medium text-[var(--color-accent)] mt-auto">
            Truy cập →
          </span>
        </Link>
      </div>
    </div>
  );
}
