import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiki sản phẩm — Sony Wiki",
  description: "Quản lý thông tin, so sánh và tìm kiếm các sản phẩm Sony",
};

interface WikiPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function WikiPage({ searchParams }: WikiPageProps) {
  const params = await searchParams;
  const activeQuery = params.q?.trim();
  const activeCategory = params.category?.trim();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Wiki sản phẩm</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Quản lý thông tin chi tiết các sản phẩm Sony
          </p>
        </div>
      </div>

      {activeQuery || activeCategory ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          {activeQuery ? (
            <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--foreground)]">
              Từ khóa: {activeQuery}
            </span>
          ) : null}
          {activeCategory ? (
            <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--foreground)]">
              Danh mục: {activeCategory}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Placeholder content */}
      <div className="flex flex-col items-center justify-center py-20 rounded-xl
                      border-2 border-dashed border-[var(--color-border)]">
        <svg className="w-12 h-12 text-[var(--color-text-muted)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.331 0 4.466.89 6.064 2.352M12 6.042a8.967 8.967 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.352" />
        </svg>
        <p className="text-sm text-[var(--color-text-muted)] mb-1 font-medium">
          Wiki sản phẩm sẽ được triển khai ở Phase 2
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Bao gồm: listing, CRUD, search, filter, compare
        </p>
      </div>
    </div>
  );
}
