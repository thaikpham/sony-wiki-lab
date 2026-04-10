import test from "node:test";
import assert from "node:assert/strict";
import { parseWikiSearchParams } from "./search-params.ts";

test("parseWikiSearchParams sanitizes supported query params", () => {
  const params = parseWikiSearchParams({
    q: "  sony alpha  ",
    category: "  camera ",
    compare: "a7iv, fx3 , , zv-e1",
    sort: "updated-desc",
  });

  assert.deepEqual(params, {
    q: "sony alpha",
    category: "camera",
    compare: ["a7iv", "fx3", "zv-e1"],
    sort: "updated-desc",
  });
});

test("parseWikiSearchParams applies defaults to unsupported values", () => {
  const params = parseWikiSearchParams({
    sort: "latest",
    compare: ["a7iv,a7c-ii"],
  });

  assert.deepEqual(params, {
    q: undefined,
    category: undefined,
    compare: ["a7iv", "a7c-ii"],
    sort: "updated-desc",
  });
});
