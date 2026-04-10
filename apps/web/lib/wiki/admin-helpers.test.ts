import test from "node:test";
import assert from "node:assert/strict";
import {
  getEmptyWikiProductEditorValue,
  parseGalleryInput,
  slugifyWikiValue,
  stringifyGalleryInput,
} from "./admin-helpers.ts";

test("slugifyWikiValue normalizes Vietnamese labels into URL-safe slugs", () => {
  assert.equal(slugifyWikiValue("  Máy ảnh Sony A7 IV  "), "may-anh-sony-a7-iv");
});

test("gallery helpers round-trip newline separated values", () => {
  const gallery = parseGalleryInput("https://a.example/x.jpg\n\n https://a.example/y.jpg ");

  assert.deepEqual(gallery, [
    "https://a.example/x.jpg",
    "https://a.example/y.jpg",
  ]);
  assert.equal(
    stringifyGalleryInput(gallery),
    "https://a.example/x.jpg\nhttps://a.example/y.jpg"
  );
});

test("getEmptyWikiProductEditorValue includes new runtime fields", () => {
  assert.deepEqual(getEmptyWikiProductEditorValue(), {
    name: "",
    slug: "",
    categoryId: null,
    subcategory: "",
    shortDescription: "",
    description: "",
    mainImage: "",
    priceVnd: null,
    buyLink: "",
    gallery: [],
    specGroups: [],
    isPublished: true,
  });
});
