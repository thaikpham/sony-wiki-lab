import test from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_COLOR_LAB_RECIPES,
  SAMPLE_COLOR_LAB_PHOTOS,
} from "./data.ts";
import {
  filterColorLabRecipes,
  getColorLabRecipePhotos,
  matchesColorLabRecipeSearch,
} from "./helpers.ts";
import type { ColorLabPhoto } from "@/types/color-lab";

test("matchesColorLabRecipeSearch matches name, author, and tags", () => {
  const recipe = MOCK_COLOR_LAB_RECIPES[0]!;

  assert.equal(matchesColorLabRecipeSearch(recipe, "portra"), true);
  assert.equal(matchesColorLabRecipeSearch(recipe, "@sonycreator"), true);
  assert.equal(matchesColorLabRecipeSearch(recipe, "portrait"), true);
  assert.equal(matchesColorLabRecipeSearch(recipe, "documentary"), false);
});

test("filterColorLabRecipes combines query, camera line, and profile filters", () => {
  const filteredRecipes = filterColorLabRecipes(MOCK_COLOR_LAB_RECIPES, {
    cameraLine: "FX",
    profile: "PP10 (HLG2)",
    q: "cinema",
  });

  assert.equal(filteredRecipes.length, 1);
  assert.equal(filteredRecipes[0]?.id, "2");
});

test("getColorLabRecipePhotos returns the photo list for the selected recipe", () => {
  const recipe = MOCK_COLOR_LAB_RECIPES[1]!;
  const photos = getColorLabRecipePhotos(SAMPLE_COLOR_LAB_PHOTOS, recipe, 2);

  assert.equal(photos.length, 2);
  assert.deepEqual(
    photos.map((photo) => photo.id),
    ["4", "5"]
  );
});

test("getColorLabRecipePhotos groups by recipe and sorts by sort order", () => {
  const recipe = MOCK_COLOR_LAB_RECIPES[0]!;
  const photos: ColorLabPhoto[] = [
    {
      id: "z-photo",
      recipeId: recipe.id,
      storagePath: "1/z-photo.jpg",
      sortOrder: 20,
      url: "https://example.com/z-photo.jpg",
      caption: "Later frame",
    },
    {
      id: "a-photo",
      recipeId: recipe.id,
      storagePath: "1/a-photo.jpg",
      sortOrder: 10,
      url: "https://example.com/a-photo.jpg",
      caption: "Earlier frame",
    },
    {
      id: "other-recipe",
      recipeId: MOCK_COLOR_LAB_RECIPES[1]!.id,
      storagePath: "2/other-recipe.jpg",
      sortOrder: 0,
      url: "https://example.com/other-recipe.jpg",
      caption: "Different recipe",
    },
    {
      id: "b-photo",
      recipeId: recipe.id,
      storagePath: "1/b-photo.jpg",
      sortOrder: 20,
      url: "https://example.com/b-photo.jpg",
      caption: "Same sort order, later id",
    },
  ];

  assert.deepEqual(
    getColorLabRecipePhotos(photos, recipe).map((photo) => photo.id),
    ["a-photo", "b-photo", "z-photo"]
  );
});
