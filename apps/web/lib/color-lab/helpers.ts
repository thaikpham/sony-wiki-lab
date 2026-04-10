import type {
  ColorLabPhoto,
  ColorLabRecipe,
  ColorLabSearchParams,
} from "@/types/color-lab";

function normalizeColorLabQuery(value: string) {
  return value.trim().toLowerCase();
}

export function matchesColorLabRecipeSearch(
  recipe: ColorLabRecipe,
  query: string
) {
  const normalizedQuery = normalizeColorLabQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  return [recipe.name, recipe.baseProfile, recipe.author, ...recipe.tags].some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  );
}

export function matchesColorLabRecipeCameraLine(
  recipe: ColorLabRecipe,
  cameraLine?: string
) {
  const normalizedCameraLine = normalizeColorLabQuery(cameraLine ?? "");

  if (!normalizedCameraLine) {
    return true;
  }

  return recipe.cameraLines.some((value) => {
    return normalizeColorLabQuery(value) === normalizedCameraLine;
  });
}

export function matchesColorLabRecipeProfile(
  recipe: ColorLabRecipe,
  profile?: string
) {
  const normalizedProfile = normalizeColorLabQuery(profile ?? "");

  if (!normalizedProfile) {
    return true;
  }

  return normalizeColorLabQuery(recipe.baseProfile) === normalizedProfile;
}

export function filterColorLabRecipes(
  recipes: ColorLabRecipe[],
  filters: ColorLabSearchParams
) {
  return recipes.filter((recipe) => {
    return (
      matchesColorLabRecipeSearch(recipe, filters.q ?? "") &&
      matchesColorLabRecipeCameraLine(recipe, filters.cameraLine) &&
      matchesColorLabRecipeProfile(recipe, filters.profile)
    );
  });
}

export function getColorLabCameraLineOptions(recipes: ColorLabRecipe[]) {
  return Array.from(
    new Set(recipes.flatMap((recipe) => recipe.cameraLines.filter(Boolean)))
  ).sort((left, right) => left.localeCompare(right, "vi"));
}

export function getColorLabProfileOptions(recipes: ColorLabRecipe[]) {
  return Array.from(
    new Set(recipes.map((recipe) => recipe.baseProfile).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right, "vi"));
}

export function getColorLabRecipePhotos(
  photos: ColorLabPhoto[],
  recipe: ColorLabRecipe,
  maxCount?: number
) {
  const selectedPhotos = photos
    .filter((photo) => photo.recipeId === recipe.id)
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.id.localeCompare(right.id, "vi");
    });

  if (typeof maxCount !== "number" || maxCount <= 0) {
    return selectedPhotos;
  }

  return selectedPhotos.slice(0, maxCount);
}
