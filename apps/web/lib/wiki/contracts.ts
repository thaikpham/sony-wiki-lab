import type { SearchResponse } from "@/types/search";
import type {
  WikiAdminProduct,
  WikiCategory,
  WikiProductDetail,
  WikiProductListItem,
  WikiSearchParams,
  WikiSortOption,
} from "@/types/wiki";

export interface ListWikiProductsInput {
  query?: string;
  categorySlug?: string;
  sort?: WikiSortOption;
}

export interface WikiPageData {
  categories: WikiCategory[];
  products: WikiProductListItem[];
  activeCategory: WikiCategory | null;
  compareProducts: WikiProductListItem[];
}

export interface WikiAdminCatalog {
  categories: WikiCategory[];
  products: WikiAdminProduct[];
}

export interface WikiProductDetailPageData {
  product: WikiProductDetail;
  relatedProducts: WikiProductListItem[];
}

export interface SearchWikiContentInput {
  query: string;
  limit: number;
}

export type SearchWikiContentOutput = SearchResponse;

export type {
  WikiAdminProduct,
  WikiCategory,
  WikiProductDetail,
  WikiProductListItem,
  WikiSearchParams,
  WikiSortOption,
};
