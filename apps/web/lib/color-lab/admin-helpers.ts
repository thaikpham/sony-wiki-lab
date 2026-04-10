import {
  COLOR_LAB_PRESETS,
  DEFAULT_COLOR_LAB_SETTINGS,
} from "./data.ts";
import type {
  ColorLabPhoto,
  ColorLabPhotoEditorValue,
  ColorLabRecipe,
  ColorLabRecipeColor,
  ColorLabRecipeEditorValue,
} from "@/types/color-lab";

export function buildColorLabRecipeColor(
  name: string,
  hex: string
): ColorLabRecipeColor {
  const normalizedName = name.trim();
  const normalizedHex = hex.trim().toLowerCase();
  const preset = COLOR_LAB_PRESETS.find((item) => {
    return (
      item.hex.toLowerCase() === normalizedHex ||
      item.name.toLowerCase() === normalizedName.toLowerCase()
    );
  });

  if (preset) {
    return { ...preset };
  }

  return {
    name: normalizedName || "Custom",
    hex,
    border: "",
    bg: "",
    text: "",
  };
}

export function getEmptyColorLabRecipeEditorValue(): ColorLabRecipeEditorValue {
  return {
    name: "",
    baseProfile: "",
    author: "",
    tags: [],
    cameraLines: [],
    compatibilityNotes: "",
    colorName: "Custom",
    colorHex: "#d09c30",
    settings: structuredClone(DEFAULT_COLOR_LAB_SETTINGS),
  };
}

export function getColorLabRecipeEditorValue(
  recipe: ColorLabRecipe
): ColorLabRecipeEditorValue {
  return {
    id: recipe.id,
    name: recipe.name,
    baseProfile: recipe.baseProfile,
    author: recipe.author,
    tags: recipe.tags,
    cameraLines: recipe.cameraLines,
    compatibilityNotes: recipe.compatibilityNotes,
    colorName: recipe.color.name,
    colorHex: recipe.color.hex,
    settings: structuredClone(recipe.settings),
  };
}

export function getEmptyColorLabPhotoEditorValue(): ColorLabPhotoEditorValue {
  return {
    recipeId: "",
    caption: "",
    sortOrder: 0,
  };
}

export function getColorLabPhotoEditorValue(
  photo: ColorLabPhoto
): ColorLabPhotoEditorValue {
  return {
    id: photo.id,
    recipeId: photo.recipeId,
    caption: photo.caption,
    sortOrder: photo.sortOrder,
  };
}

export function parseColorLabTags(value: string) {
  return value
    .split(/[\n,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function stringifyColorLabTags(tags: string[]) {
  return tags.join(", ");
}
