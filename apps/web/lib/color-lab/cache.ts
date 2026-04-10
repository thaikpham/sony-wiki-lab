import { revalidatePath, revalidateTag } from "next/cache.js";

export const COLOR_LAB_PAGE_CACHE_TAG = "color-lab-page-data";

export function revalidateColorLabPageData() {
  revalidateTag(COLOR_LAB_PAGE_CACHE_TAG, "max");
  revalidatePath("/color-lab");
}
