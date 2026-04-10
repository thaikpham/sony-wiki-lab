export interface GlobalSearchParams {
  q: string;
  limit?: number;
}

export type SearchResultType = "product" | "category";

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResultItem[];
  total: number;
  tookMs: number;
}
