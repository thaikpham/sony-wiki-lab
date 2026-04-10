import Link from "next/link";
import type { WikiCategory } from "@/types/wiki";

interface WikiFiltersProps {
  categories: WikiCategory[];
  activeCategorySlug?: string;
  activeQuery?: string;
}

function buildWikiHref(
  category: string | undefined,
  query: string | undefined
) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category) {
    params.set("category", category);
  }

  const suffix = params.toString();
  return suffix ? `/wiki?${suffix}` : "/wiki";
}

export default function WikiFilters({
  categories,
  activeCategorySlug,
  activeQuery,
}: WikiFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildWikiHref(undefined, activeQuery)}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
          !activeCategorySlug
            ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
            : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
        }`}
      >
        Tất cả danh mục
      </Link>

      {categories.map((category) => {
        const isActive = category.slug === activeCategorySlug;

        return (
          <Link
            key={category.id}
            href={buildWikiHref(category.slug, activeQuery)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
