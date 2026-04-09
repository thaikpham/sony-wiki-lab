import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SearchResponse, SearchResultItem } from "@/types/navigation";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 20;

function toSafeQuery(rawQuery: string) {
  return rawQuery.trim().replace(/,/g, " ").slice(0, 120);
}

function toSafeLimit(rawLimit: string | null) {
  const parsed = Number.parseInt(rawLimit ?? `${DEFAULT_LIMIT}`, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_LIMIT;
  return Math.max(1, Math.min(parsed, MAX_LIMIT));
}

function toIlikePattern(query: string) {
  return `%${query.replace(/[%_]/g, (char) => `\\${char}`)}%`;
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const query = toSafeQuery(url.searchParams.get("q") ?? "");
  const limit = toSafeLimit(url.searchParams.get("limit"));

  if (!query) {
    const emptyPayload: SearchResponse = {
      query: "",
      results: [],
      total: 0,
      tookMs: Date.now() - startedAt,
    };
    return NextResponse.json(emptyPayload);
  }

  const ilikePattern = toIlikePattern(query);
  const supabase = await createClient();

  const [productsResponse, categoriesResponse] = await Promise.all([
    supabase
      .from("wiki_products")
      .select("id,name,slug,short_description,is_published")
      .eq("is_published", true)
      .or(
        `name.ilike.${ilikePattern},slug.ilike.${ilikePattern},short_description.ilike.${ilikePattern},description.ilike.${ilikePattern}`
      )
      .order("updated_at", { ascending: false })
      .limit(limit),
    supabase
      .from("wiki_categories")
      .select("id,name,slug,description")
      .or(`name.ilike.${ilikePattern},slug.ilike.${ilikePattern},description.ilike.${ilikePattern}`)
      .order("name", { ascending: true })
      .limit(limit),
  ]);

  if (productsResponse.error || categoriesResponse.error) {
    return NextResponse.json(
      {
        message: "Search query failed",
        productsError: productsResponse.error?.message,
        categoriesError: categoriesResponse.error?.message,
      },
      { status: 500 }
    );
  }

  const productResults: SearchResultItem[] = (productsResponse.data ?? []).map((product) => ({
    id: product.id,
    type: "product",
    title: product.name,
    subtitle: product.short_description ?? "Sản phẩm Sony",
    href: `/wiki/${product.slug}`,
  }));

  const categoryResults: SearchResultItem[] = (categoriesResponse.data ?? []).map((category) => ({
    id: category.id,
    type: "category",
    title: category.name,
    subtitle: category.description ?? "Danh mục sản phẩm",
    href: `/wiki?category=${encodeURIComponent(category.slug)}`,
  }));

  const merged = [...productResults, ...categoryResults].slice(0, limit);

  const payload: SearchResponse = {
    query,
    results: merged,
    total: merged.length,
    tookMs: Date.now() - startedAt,
  };

  return NextResponse.json(payload);
}
