import type { WikiSortOption } from "@/types/wiki";

export const MAX_COMPARE_ITEMS = 4;

export function getNextCompareIds(current: string[], id: string) {
  if (current.includes(id)) {
    return current.filter((item) => item !== id);
  }

  if (current.length >= MAX_COMPARE_ITEMS) {
    return [...current.slice(1), id];
  }

  return [...current, id];
}

export interface BuildWikiHrefInput {
  q?: string;
  category?: string;
  sort?: WikiSortOption;
  compare?: string[];
}

export function buildWikiHref({
  q,
  category,
  sort,
  compare,
}: BuildWikiHrefInput) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (category) {
    params.set("category", category);
  }

  if (sort && sort !== "updated-desc") {
    params.set("sort", sort);
  }

  if (compare && compare.length > 0) {
    params.set("compare", compare.join(","));
  }

  const query = params.toString();
  return query ? `/wiki?${query}` : "/wiki";
}
