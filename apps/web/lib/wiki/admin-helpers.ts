import type {
  WikiAdminProduct,
  WikiCategoryEditorValue,
  WikiProductEditorValue,
  WikiSpecGroup,
} from "@/types/wiki";

export function getEmptyWikiProductEditorValue(): WikiProductEditorValue {
  return {
    name: "",
    slug: "",
    categoryId: null,
    subcategory: "",
    shortDescription: "",
    description: "",
    mainImage: "",
    priceVnd: null,
    buyLink: "",
    gallery: [],
    specGroups: [],
    isPublished: true,
  };
}

export function getWikiProductEditorValue(
  product: WikiAdminProduct
): WikiProductEditorValue {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    subcategory: product.subcategory ?? "",
    shortDescription: product.shortDescription ?? "",
    description: product.description ?? "",
    mainImage: product.mainImage ?? "",
    priceVnd: product.priceVnd,
    buyLink: product.buyLink ?? "",
    gallery: product.gallery,
    specGroups: product.specGroups,
    isPublished: product.isPublished,
  };
}

export function getEmptyWikiCategoryEditorValue(): WikiCategoryEditorValue {
  return {
    name: "",
    slug: "",
    description: "",
  };
}

export function slugifyWikiValue(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function parseGalleryInput(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function stringifyGalleryInput(gallery: string[]) {
  return gallery.join("\n");
}

export function createEmptySpecGroup(name = "Nhóm mới"): WikiSpecGroup {
  return {
    group: name,
    specs: [],
  };
}
