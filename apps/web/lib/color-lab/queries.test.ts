import test from "node:test";
import assert from "node:assert/strict";
import {
  getDegradedColorLabPageData,
  getFallbackColorLabPageData,
} from "./queries.ts";

test("getFallbackColorLabPageData exposes the seeded fallback state", () => {
  const pageData = getFallbackColorLabPageData();

  assert.equal(pageData.loadState, "seeded-fallback");
  assert.equal(pageData.source, "seed");
  assert.ok(pageData.recipes.length > 0);
});

test("getDegradedColorLabPageData keeps seed content but marks degraded mode", () => {
  const pageData = getDegradedColorLabPageData();

  assert.equal(pageData.loadState, "degraded");
  assert.equal(pageData.source, "seed");
  assert.ok(pageData.photos.length > 0);
});
