import { Metadata } from "next";
import WikiCompareExperience from "@/components/wiki/WikiCompareExperience";
import { withTimeout } from "@/lib/utils/with-timeout";
import type { WikiPageData } from "@/lib/wiki/contracts";
import {
  getCachedWikiPageData,
  getFallbackWikiPageData,
  listPublishedWikiProductsByIdsPublic,
  PUBLIC_WIKI_DATA_TIMEOUT_MS,
} from "@/lib/wiki/queries";
import { parseWikiSearchParams } from "@/lib/wiki/search-params";

export const metadata: Metadata = {
  title: "Wiki sản phẩm — Sony Wiki",
  description: "Quản lý thông tin, so sánh và tìm kiếm các sản phẩm Sony",
};

export default async function WikiPage({
  searchParams,
}: PageProps<"/wiki">) {
  const parsedSearchParams = parseWikiSearchParams(await searchParams);
  let loadError: string | null = null;
  let wikiData: WikiPageData = getFallbackWikiPageData();

  try {
    wikiData = await withTimeout(
      getCachedWikiPageData({
        query: parsedSearchParams.q,
        categorySlug: parsedSearchParams.category,
        sort: parsedSearchParams.sort,
      }),
      PUBLIC_WIKI_DATA_TIMEOUT_MS,
      "Wiki public data timed out."
    );

    if (parsedSearchParams.compare.length > 0) {
      wikiData.compareProducts = await withTimeout(
        listPublishedWikiProductsByIdsPublic(parsedSearchParams.compare),
        PUBLIC_WIKI_DATA_TIMEOUT_MS,
        "Wiki compare data timed out."
      );
    }
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Không thể tải dữ liệu wiki vào lúc này.";
  }

  return (
    <div className="space-y-6 py-8">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
              Sony Wiki Runtime
            </div>
            <h1 className="mt-4 text-3xl font-bold text-[var(--foreground)] lg:text-4xl">
              Wiki sản phẩm Sony
            </h1>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              Listing runtime đã được chuyển sang typed data layer, dùng Supabase làm source
              of truth cho detail, search, category filter và các contract mở rộng sau này.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Results
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {wikiData.products.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Categories
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {wikiData.categories.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Compare Queue
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {wikiData.compareProducts.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {loadError ? (
        <section className="rounded-2xl border border-[var(--danger)] bg-[var(--surface)] px-6 py-4">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Public wiki data đang chậm hoặc tạm thời unavailable.
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Runtime sẽ hiển thị fallback shell để admin vẫn có thể truy cập workspace nội bộ.
          </p>
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">{loadError}</p>
        </section>
      ) : null}

      <WikiCompareExperience
        categories={wikiData.categories}
        products={wikiData.products}
        compareProducts={wikiData.compareProducts}
        compareIds={parsedSearchParams.compare}
        query={parsedSearchParams.q}
        category={parsedSearchParams.category}
        sort={parsedSearchParams.sort}
      />
    </div>
  );
}
