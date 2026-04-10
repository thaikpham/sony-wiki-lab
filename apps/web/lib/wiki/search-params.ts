import type { WikiSearchParams, WikiSortOption } from "@/types/wiki";

type SearchParamValue = string | string[] | undefined;

const DEFAULT_WIKI_SORT: WikiSortOption = "updated-desc";

function toSingleValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function sanitizeText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 120) : undefined;
}

function parseCompare(value: SearchParamValue) {
  const singleValue = toSingleValue(value);

  if (!singleValue) {
    return [];
  }

  return singleValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function parseSort(value: SearchParamValue): WikiSortOption {
  const singleValue = toSingleValue(value);

  if (singleValue === "updated-desc") {
    return singleValue;
  }

  return DEFAULT_WIKI_SORT;
}

export function parseWikiSearchParams(
  searchParams: Record<string, SearchParamValue>
): WikiSearchParams {
  return {
    q: sanitizeText(toSingleValue(searchParams.q)),
    category: sanitizeText(toSingleValue(searchParams.category)),
    sort: parseSort(searchParams.sort),
    compare: parseCompare(searchParams.compare),
  };
}
