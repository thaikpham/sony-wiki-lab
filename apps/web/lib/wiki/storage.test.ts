import assert from "node:assert/strict";
import test from "node:test";
import {
  assertValidWikiImageFile,
  buildWikiMediaStoragePath,
} from "./storage.ts";

test("buildWikiMediaStoragePath sanitizes variant, slug, and file name", () => {
  const path = buildWikiMediaStoragePath({
    fileName: "Sony Alpha 7 IV!.PNG",
    mimeType: "image/png",
    productSlug: "Alpha 7 IV",
    variant: "main-image",
  });

  assert.match(
    path,
    /^alpha-7-iv\/main-image\/[\d-]+-sony-alpha-7-iv\.png$/
  );
});

test("assertValidWikiImageFile rejects empty or non-image uploads", () => {
  assert.throws(
    () =>
      assertValidWikiImageFile(
        new File(["not-an-image"], "specs.txt", { type: "text/plain" })
      ),
    /Chỉ chấp nhận file ảnh/
  );
  assert.throws(
    () => assertValidWikiImageFile(new File([], "empty.jpg", { type: "image/jpeg" })),
    /File ảnh trống/
  );
});
