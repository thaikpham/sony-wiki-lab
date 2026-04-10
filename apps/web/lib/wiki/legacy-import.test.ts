import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLegacyWikiImportCategories,
  buildLegacyWikiImportProducts,
  mapLegacyProductToWikiImportProduct,
  type LegacyWikiSnapshot,
} from "./legacy-import.ts";

const legacySnapshot: LegacyWikiSnapshot = {
  exportedAt: "2026-04-10T00:00:00.000Z",
  products: [
    {
      id: "1",
      name: "Alpha 7R V",
      slug: "alpha-7r-v",
      category: "Camera",
      price: 98000000,
      buyLink: "https://www.sony.com/en/articles/alpha-7r-v",
      thumbnail: "https://images.unsplash.com/photo-1",
      specs: [
        {
          group: "Imaging",
          specs: [{ label: "Lens Mount", value: "Sony E" }],
        },
      ],
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "NP-FZ100 Battery",
      slug: "np-fz100-battery",
      category: "Phụ kiện",
      subcategory: "Pin",
      price: 2490000,
      buyLink: "https://www.sony.com/en/articles/np-fz100",
      thumbnail: "https://images.unsplash.com/photo-2",
      specs: [],
      createdAt: "2024-01-05T00:00:00Z",
    },
  ],
  source: "sony-wiki-ref",
};

test("buildLegacyWikiImportCategories creates deterministic unique category rows", () => {
  assert.deepEqual(buildLegacyWikiImportCategories(legacySnapshot), [
    {
      description: "Imported from legacy snapshot sony-wiki-ref.",
      name: "Camera",
      slug: "camera",
    },
    {
      description: "Imported from legacy snapshot sony-wiki-ref.",
      name: "Phụ kiện",
      slug: "phu-kien",
    },
  ]);
});

test("mapLegacyProductToWikiImportProduct keeps thumbnail/specs and defaults to draft", () => {
  assert.deepEqual(
    mapLegacyProductToWikiImportProduct(legacySnapshot.products[1]),
    {
      buyLink: "https://www.sony.com/en/articles/np-fz100",
      categorySlug: "phu-kien",
      createdAt: "2024-01-05T00:00:00Z",
      description: "",
      gallery: [],
      isPublished: false,
      mainImage: "https://images.unsplash.com/photo-2",
      name: "NP-FZ100 Battery",
      priceVnd: 2490000,
      shortDescription: "",
      slug: "np-fz100-battery",
      specGroups: [],
      subcategory: "Pin",
    }
  );
});

test("buildLegacyWikiImportProducts maps the entire snapshot", () => {
  const products = buildLegacyWikiImportProducts(legacySnapshot);

  assert.equal(products.length, 2);
  assert.equal(products[0].mainImage, legacySnapshot.products[0].thumbnail);
  assert.equal(products[0].specGroups[0]?.group, "Imaging");
});
