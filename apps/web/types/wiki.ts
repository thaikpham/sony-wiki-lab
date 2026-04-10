import type { Json } from "@/types/supabase";

export interface WikiSpecEntry {
  label: string;
  value: string;
}

export interface WikiSpecGroup {
  group: string;
  specs: WikiSpecEntry[];
}

export interface WikiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export type WikiSortOption = "updated-desc";

export interface WikiSearchParams {
  q?: string;
  category?: string;
  sort: WikiSortOption;
  compare: string[];
}

export interface WikiProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  mainImage: string | null;
  subcategory: string | null;
  priceVnd: number | null;
  buyLink: string | null;
  updatedAt: string | null;
  category: WikiCategory | null;
  specGroups: WikiSpecGroup[];
  specCount: number;
}

export interface WikiProductDetail extends WikiProductListItem {
  description: string | null;
  gallery: string[];
  isPublished: boolean;
  createdAt: string | null;
  rawSpecs: Json | null;
}

export interface WikiAdminProduct extends WikiProductDetail {
  categoryId: string | null;
}

export interface WikiProductEditorValue {
  id?: string;
  name: string;
  slug: string;
  categoryId: string | null;
  subcategory: string;
  shortDescription: string;
  description: string;
  mainImage: string;
  priceVnd: number | null;
  buyLink: string;
  gallery: string[];
  specGroups: WikiSpecGroup[];
  isPublished: boolean;
}

export interface WikiCategoryEditorValue {
  id?: string;
  name: string;
  slug: string;
  description: string;
}
