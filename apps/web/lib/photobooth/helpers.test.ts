import test from "node:test";
import assert from "node:assert/strict";
import { buildAbsoluteShareUrl, buildPhotoboothShareInfo } from "./helpers.ts";

test("buildAbsoluteShareUrl normalizes origin and route", () => {
  assert.equal(
    buildAbsoluteShareUrl("session-0824", "http://localhost:3000/"),
    "http://localhost:3000/photobooth/share/session-0824"
  );
});

test("buildPhotoboothShareInfo returns draft when publish time is missing", () => {
  const share = buildPhotoboothShareInfo("session-0825", null, "http://localhost:3000");

  assert.equal(share.status, "draft");
  assert.equal(share.qrValue, "http://localhost:3000/photobooth/share/session-0825");
});
