import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SearchResponse, SearchResultItem } from "@/types/search";
import {
  WIKI_PAGE_DATA_CACHE_TAG,
  WIKI_PRODUCT_DETAIL_CACHE_TAG,
} from "@/lib/wiki/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { createAdminClient as createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/supabase";
import {
  mapWikiAdminProduct,
  mapWikiCategory,
  mapWikiProductDetail,
  mapWikiProductListItem,
  type WikiAdminProductQueryRow,
  type WikiProductDetailQueryRow,
  type WikiProductListQueryRow,
} from "@/lib/wiki/mappers";
import { selectRelatedWikiProducts } from "@/lib/wiki/related";
import type {
  WikiAdminCatalog,
  ListWikiProductsInput,
  SearchWikiContentInput,
  SearchWikiContentOutput,
  WikiProductDetailPageData,
  WikiPageData,
} from "@/lib/wiki/contracts";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
export const PUBLIC_WIKI_DATA_TIMEOUT_MS = IS_DEVELOPMENT ? 1500 : 2500;
export const PUBLIC_WIKI_SEARCH_TIMEOUT_MS = IS_DEVELOPMENT ? 900 : 1500;
const PUBLIC_WIKI_REVALIDATE_SECONDS = 60;
type ReadonlySupabaseClient = SupabaseClient<Database>;
type AdminSupabaseClient = ReturnType<typeof createSupabaseAdminClient>;
interface SearchProductRow {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
}

interface SearchCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

function toIlikePattern(query: string) {
  return `%${query.replace(/[%_]/g, (char) => `\\${char}`)}%`;
}

export function normalizeSearchQuery(rawQuery: string) {
  return rawQuery.trim().replace(/,/g, " ").slice(0, 120);
}

export function normalizeSearchLimit(rawLimit: string | null) {
  const parsed = Number.parseInt(rawLimit ?? `${DEFAULT_LIMIT}`, 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(parsed, MAX_LIMIT));
}

async function getCategoryBySlug(
  supabase: ReadonlySupabaseClient,
  slug: string
) {
  const response = await supabase
    .from("wiki_categories")
    .select("id,name,slug,description")
    .eq("slug", slug)
    .maybeSingle();

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data ? mapWikiCategory(response.data) : null;
}

export async function listWikiCategories(supabase: ReadonlySupabaseClient) {
  const response = await supabase
    .from("wiki_categories")
    .select("id,name,slug,description")
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map(mapWikiCategory);
}

export async function listPublishedWikiProducts(
  supabase: ReadonlySupabaseClient,
  input: ListWikiProductsInput = {}
) {
  const queryText = input.query?.trim();
  const pattern = queryText ? toIlikePattern(queryText) : null;
  const activeCategory = input.categorySlug
    ? await getCategoryBySlug(supabase, input.categorySlug)
    : null;

  if (input.categorySlug && !activeCategory) {
    return [];
  }

  let query = supabase
    .from("wiki_products")
    .select(
      "id,name,slug,short_description,main_image,subcategory,price_vnd,buy_link,updated_at,specs,category:wiki_categories(id,name,slug,description)"
    )
    .eq("is_published", true);

  if (activeCategory) {
    query = query.eq("category_id", activeCategory.id);
  }

  if (pattern) {
    query = query.or(
      `name.ilike.${pattern},slug.ilike.${pattern},short_description.ilike.${pattern},description.ilike.${pattern}`
    );
  }

  const response = await query.order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map((row) =>
    mapWikiProductListItem(row as WikiProductListQueryRow)
  );
}

export async function getPublishedWikiProductDetail(
  supabase: ReadonlySupabaseClient,
  slug: string
) {
  const response = await supabase
    .from("wiki_products")
    .select(
      "id,name,slug,short_description,main_image,subcategory,price_vnd,buy_link,updated_at,description,gallery,specs,is_published,created_at,category:wiki_categories(id,name,slug,description)"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    return null;
  }

  const product = mapWikiProductDetail(response.data as WikiProductDetailQueryRow);

  return product.isPublished ? product : null;
}

export async function getWikiPageData(
  supabase: ReadonlySupabaseClient,
  input: ListWikiProductsInput = {}
): Promise<WikiPageData> {
  const [categories, products] = await Promise.all([
    listWikiCategories(supabase),
    listPublishedWikiProducts(supabase, input),
  ]);

  return {
    categories,
    products,
    activeCategory: input.categorySlug
      ? categories.find((category) => category.slug === input.categorySlug) ?? null
      : null,
    compareProducts: [],
  };
}

export function getFallbackWikiPageData(): WikiPageData {
  return {
    categories: [],
    products: [],
    activeCategory: null,
    compareProducts: [],
  };
}

export async function listPublishedWikiProductsByIds(
  supabase: ReadonlySupabaseClient,
  ids: string[]
) {
  if (ids.length === 0) {
    return [];
  }

  const response = await supabase
    .from("wiki_products")
    .select(
      "id,name,slug,short_description,main_image,subcategory,price_vnd,buy_link,updated_at,specs,category:wiki_categories(id,name,slug,description)"
    )
    .eq("is_published", true)
    .in("id", ids);

  if (response.error) {
    throw new Error(response.error.message);
  }

  const mapped = (response.data ?? []).map((row) =>
    mapWikiProductListItem(row as WikiProductListQueryRow)
  );

  const orderLookup = new Map(ids.map((id, index) => [id, index]));

  return mapped.sort(
    (left, right) =>
      (orderLookup.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (orderLookup.get(right.id) ?? Number.MAX_SAFE_INTEGER)
  );
}

export async function listRelatedPublishedWikiProducts(
  supabase: ReadonlySupabaseClient,
  product: Awaited<ReturnType<typeof getPublishedWikiProductDetail>>,
  limit = 4
) {
  if (!product || (!product.category?.id && !product.subcategory)) {
    return [];
  }

  let query = supabase
    .from("wiki_products")
    .select(
      "id,name,slug,short_description,main_image,subcategory,price_vnd,buy_link,updated_at,specs,category:wiki_categories(id,name,slug,description)"
    )
    .eq("is_published", true)
    .neq("id", product.id);

  if (product.category?.id) {
    query = query.eq("category_id", product.category.id);
  } else if (product.subcategory) {
    query = query.eq("subcategory", product.subcategory);
  }

  const response = await query.order("updated_at", { ascending: false }).limit(limit * 3);

  if (response.error) {
    throw new Error(response.error.message);
  }

  const candidates = (response.data ?? []).map((row) =>
    mapWikiProductListItem(row as WikiProductListQueryRow)
  );

  return selectRelatedWikiProducts(candidates, product, limit);
}

export async function getPublishedWikiProductDetailPageData(
  supabase: ReadonlySupabaseClient,
  slug: string
): Promise<WikiProductDetailPageData | null> {
  const product = await getPublishedWikiProductDetail(supabase, slug);

  if (!product) {
    return null;
  }

  const relatedProducts = await listRelatedPublishedWikiProducts(supabase, product);

  return {
    product,
    relatedProducts,
  };
}

export const getCachedWikiPageData = unstable_cache(
  async (input: ListWikiProductsInput = {}) => {
    const supabase = createPublicClient();
    return getWikiPageData(supabase, input);
  },
  [WIKI_PAGE_DATA_CACHE_TAG],
  {
    revalidate: PUBLIC_WIKI_REVALIDATE_SECONDS,
    tags: [WIKI_PAGE_DATA_CACHE_TAG],
  }
);

export const getCachedPublishedWikiProductDetail = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicClient();
    return getPublishedWikiProductDetail(supabase, slug);
  },
  [WIKI_PRODUCT_DETAIL_CACHE_TAG],
  {
    revalidate: PUBLIC_WIKI_REVALIDATE_SECONDS,
    tags: [WIKI_PRODUCT_DETAIL_CACHE_TAG],
  }
);

export const getCachedPublishedWikiProductDetailPageData = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicClient();
    return getPublishedWikiProductDetailPageData(supabase, slug);
  },
  ["wiki-product-detail-page-data"],
  {
    revalidate: PUBLIC_WIKI_REVALIDATE_SECONDS,
    tags: [WIKI_PRODUCT_DETAIL_CACHE_TAG],
  }
);

export async function listPublishedWikiProductsByIdsPublic(ids: string[]) {
  const supabase = createPublicClient();
  return listPublishedWikiProductsByIds(supabase, ids);
}

async function listWikiCategoriesAdmin(supabase: AdminSupabaseClient) {
  const response = await supabase
    .from("wiki_categories")
    .select("id,name,slug,description")
    .order("name", { ascending: true });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map(mapWikiCategory);
}

export async function listAllWikiProductsAdmin(
  supabase: AdminSupabaseClient
) {
  const response = await supabase
    .from("wiki_products")
    .select(
      "id,name,slug,category_id,short_description,description,main_image,subcategory,price_vnd,buy_link,gallery,specs,is_published,created_at,updated_at,category:wiki_categories(id,name,slug,description)"
    )
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map((row) =>
    mapWikiAdminProduct(row as WikiAdminProductQueryRow)
  );
}

export async function getWikiAdminCatalog(
  supabase: AdminSupabaseClient
): Promise<WikiAdminCatalog> {
  const [categories, products] = await Promise.all([
    listWikiCategoriesAdmin(supabase),
    listAllWikiProductsAdmin(supabase),
  ]);

  return {
    categories,
    products,
  };
}

export async function searchWikiContent(
  supabase: ReadonlySupabaseClient,
  input: SearchWikiContentInput
): Promise<SearchWikiContentOutput> {
  const startedAt = Date.now();
  const ilikePattern = toIlikePattern(input.query);

  const [productsResponse, categoriesResponse] = await Promise.all([
    supabase
      .from("wiki_products")
      .select("id,name,slug,short_description")
      .eq("is_published", true)
      .or(
        `name.ilike.${ilikePattern},slug.ilike.${ilikePattern},short_description.ilike.${ilikePattern},description.ilike.${ilikePattern}`
      )
      .order("updated_at", { ascending: false })
      .limit(input.limit),
    supabase
      .from("wiki_categories")
      .select("id,name,slug,description")
      .or(
        `name.ilike.${ilikePattern},slug.ilike.${ilikePattern},description.ilike.${ilikePattern}`
      )
      .order("name", { ascending: true })
      .limit(input.limit),
  ]);

  if (productsResponse.error || categoriesResponse.error) {
    throw new Error(
      productsResponse.error?.message ??
        categoriesResponse.error?.message ??
        "Search query failed"
    );
  }

  const productResults: SearchResultItem[] = (
    (productsResponse.data ?? []) as SearchProductRow[]
  ).map(
    (product) => ({
      id: product.id,
      type: "product",
      title: product.name,
      subtitle: product.short_description ?? "Sản phẩm Sony",
      href: `/wiki/${product.slug}`,
    })
  );

  const categoryResults: SearchResultItem[] = (
    (categoriesResponse.data ?? []) as SearchCategoryRow[]
  ).map(
    (category) => ({
      id: category.id,
      type: "category",
      title: category.name,
      subtitle: category.description ?? "Danh mục sản phẩm",
      href: `/wiki?category=${encodeURIComponent(category.slug)}`,
    })
  );

  const results = [...productResults, ...categoryResults].slice(0, input.limit);

  const payload: SearchResponse = {
    query: input.query,
    results,
    total: results.length,
    tookMs: Date.now() - startedAt,
  };

  return payload;
}

export async function searchWikiContentPublic(input: SearchWikiContentInput) {
  const supabase = createPublicClient();
  return searchWikiContent(supabase, input);
}
