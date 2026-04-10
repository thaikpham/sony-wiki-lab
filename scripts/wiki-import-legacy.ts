import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../apps/web/types/supabase";
import {
  buildLegacyWikiImportCategories,
  buildLegacyWikiImportProducts,
  type LegacyWikiSnapshot,
} from "../apps/web/lib/wiki/legacy-import.ts";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SNAPSHOT_PATH = path.resolve(process.cwd(), "REF/wiki/legacy-catalog.json");

async function loadSnapshot() {
  const raw = await readFile(SNAPSHOT_PATH, "utf8");
  return JSON.parse(raw) as LegacyWikiSnapshot;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for legacy wiki import."
    );
  }

  const snapshot = await loadSnapshot();
  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const categories = buildLegacyWikiImportCategories(snapshot);
  const products = buildLegacyWikiImportProducts(snapshot);

  const categoryUpsert = await supabase
    .from("wiki_categories")
    .upsert(categories, {
      onConflict: "slug",
    })
    .select("id,slug");

  if (categoryUpsert.error) {
    throw new Error(categoryUpsert.error.message);
  }

  const categoryIdBySlug = new Map(
    (categoryUpsert.data ?? []).map((category) => [category.slug, category.id])
  );

  const productUpsert = await supabase.from("wiki_products").upsert(
    products.map((product) => ({
      name: product.name,
      slug: product.slug,
      category_id: product.categorySlug ? categoryIdBySlug.get(product.categorySlug) ?? null : null,
      description: product.description || null,
      short_description: product.shortDescription || null,
      main_image: product.mainImage || null,
      subcategory: product.subcategory || null,
      price_vnd: product.priceVnd,
      buy_link: product.buyLink || null,
      gallery: product.gallery,
      specs: product.specGroups,
      is_published: product.isPublished,
      created_at: product.createdAt,
      updated_at: new Date().toISOString(),
    })),
    {
      onConflict: "slug",
    }
  );

  if (productUpsert.error) {
    throw new Error(productUpsert.error.message);
  }

  console.log(
    `Imported ${categories.length} categories and ${products.length} legacy wiki products from ${SNAPSHOT_PATH}.`
  );
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
