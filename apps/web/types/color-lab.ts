export interface ColorLabRecipeColor {
  name: string;
  border: string;
  bg: string;
  text: string;
  hex: string;
}

export type ColorLabLoadState = "live" | "seeded-fallback" | "degraded";

export interface ColorLabRecipeSettings {
  whiteBalance: string;
  blackLevel: string;
  gamma: string;
  blackGamma: string;
  knee: string;
  colorMode: string;
  saturation: string;
  colorPhase: string;
  colorDepth: {
    R: string;
    G: string;
    B: string;
    C: string;
    M: string;
    Y: string;
  };
  detail: {
    level: string;
    mode: string;
    vhBalance: string;
    bwBalance: string;
    limit: string;
    crispening: string;
    hlLightDetail: string;
  };
}

export interface ColorLabRecipe {
  id: string;
  name: string;
  baseProfile: string;
  author: string;
  tags: string[];
  cameraLines: string[];
  compatibilityNotes: string;
  color: ColorLabRecipeColor;
  settings: ColorLabRecipeSettings;
  createdAt: string;
}

export interface ColorLabPhoto {
  id: string;
  recipeId: string;
  storagePath: string;
  sortOrder: number;
  url: string;
  caption: string;
}

export interface ColorLabRecipeEditorValue {
  id?: string;
  name: string;
  baseProfile: string;
  author: string;
  tags: string[];
  cameraLines: string[];
  compatibilityNotes: string;
  colorName: string;
  colorHex: string;
  settings: ColorLabRecipeSettings;
}

export interface ColorLabPhotoEditorValue {
  id?: string;
  recipeId: string;
  caption: string;
  sortOrder: number;
}

export interface ColorLabSearchParams {
  q?: string;
  cameraLine?: string;
  profile?: string;
}
