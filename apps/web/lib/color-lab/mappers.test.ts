import test from "node:test";
import assert from "node:assert/strict";
import { mapColorLabPhoto, mapColorLabRecipe } from "./mappers.ts";

test("mapColorLabRecipe keeps compatibility fields stable", () => {
  const recipe = mapColorLabRecipe({
    id: "recipe-1",
    name: "Portra",
    base_profile: "PP8 (S-Log3)",
    author: "@sonycreator",
    tags: ["Film"],
    camera_lines: ["Alpha", "FX"],
    compatibility_notes: "Ổn trên Alpha body.",
    color: {
      name: "Amber",
      hex: "#f59e0b",
      border: "border-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
    },
    settings: null,
    created_at: "2024-01-01T00:00:00Z",
  });

  assert.deepEqual(recipe.cameraLines, ["Alpha", "FX"]);
  assert.equal(recipe.compatibilityNotes, "Ổn trên Alpha body.");
});

test("mapColorLabPhoto builds a public url from storage metadata", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";

  const photo = mapColorLabPhoto({
    id: "photo-1",
    src: null,
    recipe_id: "recipe-1",
    storage_path: "recipe-1/demo-photo.jpg",
    sort_order: 20,
    caption: "Demo frame",
  });

  assert.equal(photo.recipeId, "recipe-1");
  assert.equal(photo.storagePath, "recipe-1/demo-photo.jpg");
  assert.equal(photo.sortOrder, 20);
  assert.equal(
    photo.url,
    "https://example.supabase.co/storage/v1/object/public/color-lab-preview/recipe-1/demo-photo.jpg"
  );
});
