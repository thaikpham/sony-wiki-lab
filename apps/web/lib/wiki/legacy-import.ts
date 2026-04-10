import type { WikiSpecGroup } from "../../types/wiki";

export interface LegacyWikiSnapshotProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  price: number;
  buyLink: string;
  thumbnail: string;
  specs: WikiSpecGroup[];
  createdAt?: string;
}

export interface LegacyWikiSnapshot {
  exportedAt: string;
  products: LegacyWikiSnapshotProduct[];
  source: string;
}

export interface LegacyWikiImportCategory {
  description: string;
  name: string;
  slug: string;
}

export interface LegacyWikiImportProduct {
  buyLink: string;
  categorySlug: string | null;
  createdAt: string | null;
  description: string;
  gallery: string[];
  isPublished: boolean;
  mainImage: string;
  name: string;
  priceVnd: number;
  shortDescription: string;
  slug: string;
  specGroups: WikiSpecGroup[];
  subcategory: string;
}

function slugifyCategory(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildLegacyWikiImportCategories(snapshot: LegacyWikiSnapshot) {
  return Array.from(
    new Map(
      snapshot.products.map((product) => [
        product.category,
        {
          description: `Imported from legacy snapshot ${snapshot.source}.`,
          name: product.category,
          slug: slugifyCategory(product.category),
        } satisfies LegacyWikiImportCategory,
      ])
    ).values()
  ).sort((left, right) => left.name.localeCompare(right.name, "vi"));
}

export function mapLegacyProductToWikiImportProduct(
  product: LegacyWikiSnapshotProduct
): LegacyWikiImportProduct {
  return {
    buyLink: product.buyLink,
    categorySlug: product.category ? slugifyCategory(product.category) : null,
    createdAt: product.createdAt ?? null,
    description: "",
    gallery: [],
    isPublished: false,
    mainImage: product.thumbnail,
    name: product.name,
    priceVnd: product.price,
    shortDescription: "",
    slug: product.slug,
    specGroups: product.specs,
    subcategory: product.subcategory ?? "",
  };
}

export function buildLegacyWikiImportProducts(snapshot: LegacyWikiSnapshot) {
  return snapshot.products.map(mapLegacyProductToWikiImportProduct);
}
