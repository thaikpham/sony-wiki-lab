import test from "node:test";
import assert from "node:assert/strict";
import { wikiProductInputSchema } from "./admin-schemas.ts";

test("wikiProductInputSchema accepts new runtime product fields", () => {
  const result = wikiProductInputSchema.parse({
    name: "Sony FX3",
    slug: "sony-fx3",
    categoryId: null,
    subcategory: "Cinema Line",
    shortDescription: "Compact cinema camera",
    description: "Full-frame cinema camera.",
    mainImage: "https://example.com/fx3.jpg",
    priceVnd: 94990000,
    buyLink: "https://sony.com/fx3",
    gallery: ["https://example.com/fx3-1.jpg"],
    specGroups: [
      {
        group: "Body",
        specs: [{ label: "Weight", value: "715g" }],
      },
    ],
    isPublished: true,
  });

  assert.equal(result.subcategory, "Cinema Line");
  assert.equal(result.priceVnd, 94990000);
  assert.equal(result.buyLink, "https://sony.com/fx3");
});

test("wikiProductInputSchema defaults new runtime fields safely", () => {
  const result = wikiProductInputSchema.parse({
    name: "Sony ZV-E1",
    slug: "sony-zv-e1",
  });

  assert.equal(result.subcategory, "");
  assert.equal(result.priceVnd, null);
  assert.equal(result.buyLink, "");
});
