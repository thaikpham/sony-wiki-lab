import assert from "node:assert/strict";
import test from "node:test";
import { selectRelatedWikiProducts } from "./related.ts";
import type { WikiProductListItem } from "@/types/wiki";

function buildProduct(
  overrides: Partial<WikiProductListItem> & Pick<WikiProductListItem, "id" | "name" | "slug">
): WikiProductListItem {
  const { id, name, slug, ...rest } = overrides;

  return {
    shortDescription: null,
    mainImage: null,
    subcategory: null,
    priceVnd: null,
    buyLink: null,
    updatedAt: null,
    category: null,
    specGroups: [],
    specCount: 0,
    ...rest,
    id,
    name,
    slug,
  };
}

test("selectRelatedWikiProducts prioritizes same subcategory over same category", () => {
  const category = {
    id: "camera",
    name: "Camera",
    slug: "camera",
    description: null,
  };
  const current = buildProduct({
    id: "a",
    name: "FX3",
    slug: "fx3",
    category,
    subcategory: "Cinema Line",
  });
  const related = selectRelatedWikiProducts(
    [
      buildProduct({
        id: "b",
        name: "FX6",
        slug: "fx6",
        category,
        subcategory: "Cinema Line",
        updatedAt: "2026-04-10T10:00:00.000Z",
      }),
      buildProduct({
        id: "c",
        name: "A7S III",
        slug: "a7s-iii",
        category,
        subcategory: "Alpha",
        updatedAt: "2026-04-10T12:00:00.000Z",
      }),
      buildProduct({
        id: "d",
        name: "24-70 GM II",
        slug: "24-70-gm-ii",
        category: {
          id: "lens",
          name: "Lens",
          slug: "lens",
          description: null,
        },
        updatedAt: "2026-04-10T13:00:00.000Z",
      }),
    ],
    current
  );

  assert.deepEqual(
    related.map((item) => item.id),
    ["b", "c"]
  );
});

test("selectRelatedWikiProducts respects limit and recency within same score", () => {
  const category = {
    id: "accessories",
    name: "Phụ kiện",
    slug: "phu-kien",
    description: null,
  };
  const current = buildProduct({
    id: "battery-1",
    name: "NP-FZ100",
    slug: "np-fz100",
    category,
    subcategory: "Pin",
  });
  const related = selectRelatedWikiProducts(
    [
      buildProduct({
        id: "battery-2",
        name: "Battery B",
        slug: "battery-b",
        category,
        subcategory: "Pin",
        updatedAt: "2026-04-10T13:00:00.000Z",
      }),
      buildProduct({
        id: "battery-3",
        name: "Battery C",
        slug: "battery-c",
        category,
        subcategory: "Pin",
        updatedAt: "2026-04-10T11:00:00.000Z",
      }),
      buildProduct({
        id: "battery-4",
        name: "Battery D",
        slug: "battery-d",
        category,
        subcategory: "Pin",
        updatedAt: "2026-04-10T09:00:00.000Z",
      }),
    ],
    current,
    2
  );

  assert.deepEqual(
    related.map((item) => item.id),
    ["battery-2", "battery-3"]
  );
});
