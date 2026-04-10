import type { WikiProductListItem } from "@/types/wiki";

export function formatWikiUpdatedAt(updatedAt: string | null) {
  if (!updatedAt) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(updatedAt));
}

export function formatWikiPrice(priceVnd: number | null) {
  if (priceVnd === null) {
    return "—";
  }

  return `${priceVnd.toLocaleString("vi-VN")} ₫`;
}

export function getWikiProductSummary(product: WikiProductListItem) {
  return (
    product.shortDescription ??
    product.subcategory ??
    product.category?.name ??
    "Sản phẩm Sony"
  );
}
