import type { Json, TableRow } from "@/types/supabase";
import type {
  WikiAdminProduct,
  WikiCategory,
  WikiProductDetail,
  WikiProductListItem,
  WikiSpecEntry,
  WikiSpecGroup,
} from "@/types/wiki";

type WikiCategoryRow = TableRow<"wiki_categories">;
type WikiProductRow = TableRow<"wiki_products">;
type WikiCategoryInput = Pick<
  WikiCategoryRow,
  "id" | "name" | "slug" | "description"
>;

type WikiCategoryRelation = WikiCategoryInput | WikiCategoryInput[] | null;

export interface WikiProductListQueryRow
  extends Pick<
    WikiProductRow,
    | "id"
    | "name"
    | "slug"
    | "short_description"
    | "main_image"
    | "subcategory"
    | "price_vnd"
    | "buy_link"
    | "updated_at"
    | "specs"
  > {
  category: WikiCategoryRelation;
}

export interface WikiProductDetailQueryRow
  extends Pick<
    WikiProductRow,
    | "id"
    | "name"
    | "slug"
    | "short_description"
    | "main_image"
    | "subcategory"
    | "price_vnd"
    | "buy_link"
    | "updated_at"
    | "description"
    | "gallery"
    | "specs"
    | "is_published"
    | "created_at"
  > {
  category: WikiCategoryRelation;
}

export interface WikiAdminProductQueryRow
  extends Pick<
    WikiProductRow,
    | "id"
    | "name"
    | "slug"
    | "category_id"
    | "short_description"
    | "description"
    | "main_image"
    | "subcategory"
    | "price_vnd"
    | "buy_link"
    | "gallery"
    | "specs"
    | "is_published"
    | "created_at"
    | "updated_at"
  > {
  category: WikiCategoryRelation;
}

interface LegacySpecEntryInput {
  label: string;
  value: string;
}

interface LegacySpecGroupInput {
  group: string;
  specs: LegacySpecEntryInput[];
}

function isJsonRecord(value: Json | null | undefined): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLegacySpecEntry(value: unknown): value is LegacySpecEntryInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "label" in value &&
    typeof value.label === "string" &&
    "value" in value &&
    typeof value.value === "string"
  );
}

function isLegacySpecGroup(value: unknown): value is LegacySpecGroupInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "group" in value &&
    typeof value.group === "string" &&
    "specs" in value &&
    Array.isArray(value.specs) &&
    value.specs.every(isLegacySpecEntry)
  );
}

function formatSpecValue(value: Json): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => formatSpecValue(item)).join(", ");
  }

  if (value === null) {
    return "N/A";
  }

  return JSON.stringify(value);
}

function toSpecEntries(record: Record<string, Json>): WikiSpecEntry[] {
  return Object.entries(record)
    .filter(([, value]) => value !== null)
    .map(([label, value]) => ({
      label,
      value: formatSpecValue(value),
    }));
}

function normalizeCategory(category: WikiCategoryRelation): WikiCategory | null {
  if (Array.isArray(category)) {
    return category.length > 0 ? mapWikiCategory(category[0]) : null;
  }

  if (!category) {
    return null;
  }

  return mapWikiCategory(category);
}

export function mapWikiCategory(row: WikiCategoryInput): WikiCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
  };
}

export function mapWikiSpecs(specs: Json | null): WikiSpecGroup[] {
  if (!specs) {
    return [];
  }

  if (Array.isArray(specs) && specs.every(isLegacySpecGroup)) {
    return (specs as unknown as LegacySpecGroupInput[]).map((group) => ({
      group: group.group,
      specs: group.specs,
    }));
  }

  if (!isJsonRecord(specs)) {
    return [];
  }

  const summarySpecs: WikiSpecEntry[] = [];
  const groupedSpecs: WikiSpecGroup[] = [];

  for (const [label, value] of Object.entries(specs)) {
    if (isJsonRecord(value)) {
      const nestedSpecs = toSpecEntries(value);

      if (nestedSpecs.length > 0) {
        groupedSpecs.push({
          group: label,
          specs: nestedSpecs,
        });
      }
      continue;
    }

    if (value !== null) {
      summarySpecs.push({
        label,
        value: formatSpecValue(value),
      });
    }
  }

  if (summarySpecs.length > 0) {
    groupedSpecs.unshift({
      group: "Tổng quan",
      specs: summarySpecs,
    });
  }

  return groupedSpecs;
}

function countSpecs(groups: WikiSpecGroup[]) {
  return groups.reduce((total, group) => total + group.specs.length, 0);
}

export function mapWikiProductListItem(
  row: WikiProductListQueryRow
): WikiProductListItem {
  const specGroups = mapWikiSpecs(row.specs);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shortDescription: row.short_description,
    mainImage: row.main_image,
    subcategory: row.subcategory,
    priceVnd: row.price_vnd,
    buyLink: row.buy_link,
    updatedAt: row.updated_at,
    category: normalizeCategory(row.category),
    specGroups,
    specCount: countSpecs(specGroups),
  };
}

export function mapWikiProductDetail(
  row: WikiProductDetailQueryRow
): WikiProductDetail {
  const listItem = mapWikiProductListItem(row);

  return {
    ...listItem,
    description: row.description,
    gallery: row.gallery ?? [],
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at,
    rawSpecs: row.specs,
  };
}

export function mapWikiAdminProduct(
  row: WikiAdminProductQueryRow
): WikiAdminProduct {
  const detail = mapWikiProductDetail(row);

  return {
    ...detail,
    categoryId: row.category_id,
  };
}
