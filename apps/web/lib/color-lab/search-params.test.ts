import test from "node:test";
import assert from "node:assert/strict";
import {
  buildColorLabHref,
  parseColorLabSearchParams,
} from "./search-params.ts";

test("parseColorLabSearchParams normalizes the public filters", () => {
  assert.deepEqual(
    parseColorLabSearchParams({
      q: "  portra  ",
      cameraLine: [" Alpha "],
      profile: " PP8 (S-Log3) ",
    }),
    {
      q: "portra",
      cameraLine: "Alpha",
      profile: "PP8 (S-Log3)",
    }
  );
});

test("buildColorLabHref only includes active filters", () => {
  assert.equal(
    buildColorLabHref({
      q: "portra",
      cameraLine: "Alpha",
      profile: "PP8 (S-Log3)",
    }),
    "/color-lab?q=portra&cameraLine=Alpha&profile=PP8+%28S-Log3%29"
  );

  assert.equal(buildColorLabHref({}), "/color-lab");
});
