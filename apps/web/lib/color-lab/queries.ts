import { unstable_cache } from "next/cache.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { COLOR_LAB_PAGE_CACHE_TAG } from "./cache.ts";
import { createPublicClient } from "../supabase/public.ts";
import type { createAdminClient as createSupabaseAdminClient } from "../supabase/admin.ts";
import type { Database } from "../../types/supabase";
import {
  MOCK_COLOR_LAB_RECIPES,
  SAMPLE_COLOR_LAB_PHOTOS,
} from "./data.ts";
import type {
  ColorLabAdminCatalog,
  ColorLabPageData,
} from "./contracts.ts";
import {
  mapColorLabPhoto,
  mapColorLabRecipe,
  type ColorLabPhotoQueryRow,
  type ColorLabRecipeQueryRow,
} from "./mappers.ts";

type ReadonlySupabaseClient = SupabaseClient<Database>;
type AdminSupabaseClient = ReturnType<typeof createSupabaseAdminClient>;
const IS_DEVELOPMENT = process.env.NODE_ENV !== "production";
export const PUBLIC_COLOR_LAB_DATA_TIMEOUT_MS = IS_DEVELOPMENT ? 700 : 1200;
const PUBLIC_COLOR_LAB_REVALIDATE_SECONDS = 60;

export function getFallbackColorLabPageData(): ColorLabPageData {
  return {
    recipes: MOCK_COLOR_LAB_RECIPES,
    photos: SAMPLE_COLOR_LAB_PHOTOS,
    source: "seed",
    loadState: "seeded-fallback",
  };
}

export function getDegradedColorLabPageData(): ColorLabPageData {
  return {
    recipes: MOCK_COLOR_LAB_RECIPES,
    photos: SAMPLE_COLOR_LAB_PHOTOS,
    source: "seed",
    loadState: "degraded",
  };
}

export async function listColorLabRecipes(supabase: ReadonlySupabaseClient) {
  const response = await supabase
    .from("color_lab_recipes")
    .select(
      "id,name,base_profile,author,tags,camera_lines,compatibility_notes,color,settings,created_at"
    )
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map((row) =>
    mapColorLabRecipe(row as ColorLabRecipeQueryRow)
  );
}

export async function listColorLabPhotos(supabase: ReadonlySupabaseClient) {
  const response = await supabase
    .from("color_lab_photos")
    .select("id,src,recipe_id,storage_path,sort_order,caption")
    .order("recipe_id", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map((row) =>
    mapColorLabPhoto(row as ColorLabPhotoQueryRow)
  );
}

async function listColorLabRecipesAdmin(supabase: AdminSupabaseClient) {
  const response = await supabase
    .from("color_lab_recipes")
    .select(
      "id,name,base_profile,author,tags,camera_lines,compatibility_notes,color,settings,created_at"
    )
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map((row) =>
    mapColorLabRecipe(row as ColorLabRecipeQueryRow)
  );
}

async function listColorLabPhotosAdmin(supabase: AdminSupabaseClient) {
  const response = await supabase
    .from("color_lab_photos")
    .select("id,src,recipe_id,storage_path,sort_order,caption")
    .order("recipe_id", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return (response.data ?? []).map((row) =>
    mapColorLabPhoto(row as ColorLabPhotoQueryRow)
  );
}

export async function getColorLabPageData(
  supabase: ReadonlySupabaseClient
): Promise<ColorLabPageData> {
  const [recipes, photos] = await Promise.all([
    listColorLabRecipes(supabase),
    listColorLabPhotos(supabase),
  ]);
  const recipeIds = new Set(recipes.map((recipe) => recipe.id));
  const recipePhotos = photos.filter((photo) => recipeIds.has(photo.recipeId));

  if (recipes.length === 0) {
    return getFallbackColorLabPageData();
  }

  return {
    recipes,
    photos: recipePhotos,
    source: "supabase",
    loadState: "live",
  };
}

export const getCachedColorLabPageData = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    return getColorLabPageData(supabase);
  },
  ["color-lab-page-data"],
  {
    revalidate: PUBLIC_COLOR_LAB_REVALIDATE_SECONDS,
    tags: [COLOR_LAB_PAGE_CACHE_TAG],
  }
);

export async function getColorLabAdminCatalog(
  supabase: AdminSupabaseClient
): Promise<ColorLabAdminCatalog> {
  const [recipes, photos] = await Promise.all([
    listColorLabRecipesAdmin(supabase),
    listColorLabPhotosAdmin(supabase),
  ]);

  return {
    recipes,
    photos,
  };
}
