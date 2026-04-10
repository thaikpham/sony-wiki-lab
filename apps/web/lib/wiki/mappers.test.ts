import test from "node:test";
import assert from "node:assert/strict";
import { mapWikiProductListItem, mapWikiSpecs } from "./mappers.ts";

test("mapWikiSpecs keeps grouped legacy specs intact", () => {
  const result = mapWikiSpecs([
    {
      group: "Body",
      specs: [
        {
          label: "Weight",
          value: "737g",
        },
      ],
    },
  ]);

  assert.deepEqual(result, [
    {
      group: "Body",
      specs: [
        {
          label: "Weight",
          value: "737g",
        },
      ],
    },
  ]);
});

test("mapWikiSpecs converts flat objects into grouped specs", () => {
  const result = mapWikiSpecs({
    sensor: "33MP",
    stabilization: true,
    dimensions: {
      width: "131mm",
      height: "96mm",
    },
  });

  assert.equal(result.length, 2);
  assert.equal(result[0]?.group, "Tổng quan");
  assert.deepEqual(result[0]?.specs, [
    { label: "sensor", value: "33MP" },
    { label: "stabilization", value: "true" },
  ]);
  assert.deepEqual(result[1], {
    group: "dimensions",
    specs: [
      { label: "width", value: "131mm" },
      { label: "height", value: "96mm" },
    ],
  });
});

test("mapWikiSpecs returns an empty list for unsupported shapes", () => {
  assert.deepEqual(mapWikiSpecs(null), []);
  assert.deepEqual(mapWikiSpecs("raw text"), []);
});

test("mapWikiProductListItem maps runtime commerce fields", () => {
  const result = mapWikiProductListItem({
    id: "product-1",
    name: "Sony FX3",
    slug: "sony-fx3",
    short_description: "Compact cinema camera",
    main_image: "https://example.com/fx3.jpg",
    subcategory: "Cinema Line",
    price_vnd: 94990000,
    buy_link: "https://sony.com/fx3",
    updated_at: "2026-04-09T00:00:00Z",
    specs: [
      {
        group: "Body",
        specs: [
          {
            label: "Weight",
            value: "715g",
          },
        ],
      },
    ],
    category: {
      id: "cat-1",
      name: "Camera",
      slug: "camera",
      description: null,
    },
  });

  assert.equal(result.subcategory, "Cinema Line");
  assert.equal(result.priceVnd, 94990000);
  assert.equal(result.buyLink, "https://sony.com/fx3");
  assert.equal(result.specCount, 1);
});
