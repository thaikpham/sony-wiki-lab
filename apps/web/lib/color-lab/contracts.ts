import type {
  ColorLabLoadState,
  ColorLabPhoto,
  ColorLabRecipe,
} from "../../types/color-lab";

export interface ColorLabPageData {
  recipes: ColorLabRecipe[];
  photos: ColorLabPhoto[];
  source: "supabase" | "seed";
  loadState: ColorLabLoadState;
}

export interface ColorLabAdminCatalog {
  recipes: ColorLabRecipe[];
  photos: ColorLabPhoto[];
}
