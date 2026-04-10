import test from "node:test";
import assert from "node:assert/strict";
import { buildWikiHref, getNextCompareIds } from "./compare.ts";

test("getNextCompareIds appends and removes selections", () => {
  assert.deepEqual(getNextCompareIds([], "a"), ["a"]);
  assert.deepEqual(getNextCompareIds(["a", "b"], "b"), ["a"]);
});

test("getNextCompareIds keeps a maximum of four ids", () => {
  assert.deepEqual(
    getNextCompareIds(["a", "b", "c", "d"], "e"),
    ["b", "c", "d", "e"]
  );
});

test("buildWikiHref preserves wiki query state", () => {
  assert.equal(
    buildWikiHref({
      q: "alpha",
      category: "camera",
      sort: "updated-desc",
      compare: ["a7iv", "fx3"],
    }),
    "/wiki?q=alpha&category=camera&compare=a7iv%2Cfx3"
  );

  assert.equal(buildWikiHref({ compare: [] }), "/wiki");
});
