import assert from "node:assert/strict";
import test from "node:test";
import {
  assertValidColorLabImageFile,
  buildColorLabPhotoStoragePath,
  getColorLabPhotoPublicUrl,
} from "./storage.ts";

test("buildColorLabPhotoStoragePath sanitizes recipe id and file name", () => {
  const path = buildColorLabPhotoStoragePath(
    "PP8 (S-Log3)",
    "Kodak Portra 400!.PNG",
    "image/png"
  );

  assert.match(path, /^pp8-s-log3\/[\d-]+-kodak-portra-400\.png$/);
});

test("getColorLabPhotoPublicUrl builds a public storage url", () => {
  const previousSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://sony.example.supabase.co";

  try {
    assert.equal(
      getColorLabPhotoPublicUrl("pp8-s-log3/2026-04-10-kodak-portra-400.png"),
      "https://sony.example.supabase.co/storage/v1/object/public/color-lab-preview/pp8-s-log3/2026-04-10-kodak-portra-400.png"
    );
  } finally {
    if (previousSupabaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = previousSupabaseUrl;
    }
  }
});

test("assertValidColorLabImageFile rejects empty or non-image uploads", () => {
  assert.throws(
    () =>
      assertValidColorLabImageFile(
        new File(["not-an-image"], "notes.txt", { type: "text/plain" })
      ),
    /Chỉ chấp nhận file ảnh/
  );
  assert.throws(
    () =>
      assertValidColorLabImageFile(new File([], "empty.jpg", { type: "image/jpeg" })),
    /File ảnh trống/
  );
});
