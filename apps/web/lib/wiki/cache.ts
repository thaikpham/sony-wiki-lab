import { revalidatePath, revalidateTag } from "next/cache.js";

export const WIKI_PAGE_DATA_CACHE_TAG = "wiki-page-data";
export const WIKI_PRODUCT_DETAIL_CACHE_TAG = "wiki-product-detail";

export function revalidateWikiPageData() {
  revalidateTag(WIKI_PAGE_DATA_CACHE_TAG, "max");
  revalidateTag(WIKI_PRODUCT_DETAIL_CACHE_TAG, "max");
  revalidatePath("/wiki");
}

export function revalidateWikiProductDetail(slug?: string | null) {
  revalidateWikiPageData();

  if (slug) {
    revalidatePath(`/wiki/${slug}`);
  }
}
