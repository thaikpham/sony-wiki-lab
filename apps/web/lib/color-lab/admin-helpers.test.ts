import test from "node:test";
import assert from "node:assert/strict";
import {
  buildColorLabRecipeColor,
  getEmptyColorLabRecipeEditorValue,
  parseColorLabTags,
  stringifyColorLabTags,
} from "./admin-helpers.ts";

test("parseColorLabTags handles comma and newline separated values", () => {
  assert.deepEqual(parseColorLabTags("Film, Warm\nPortrait"), [
    "Film",
    "Warm",
    "Portrait",
  ]);
});

test("stringifyColorLabTags serializes the tag list for editing", () => {
  assert.equal(stringifyColorLabTags(["Film", "Warm"]), "Film, Warm");
});

test("buildColorLabRecipeColor keeps a stable typed color payload", () => {
  assert.deepEqual(buildColorLabRecipeColor("Amber", "#f59e0b"), {
    name: "Amber",
    hex: "#f59e0b",
    border: "border-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
  });
});

test("getEmptyColorLabRecipeEditorValue seeds compatibility fields", () => {
  assert.deepEqual(getEmptyColorLabRecipeEditorValue().cameraLines, []);
  assert.equal(getEmptyColorLabRecipeEditorValue().compatibilityNotes, "");
});
