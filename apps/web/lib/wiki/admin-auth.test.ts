import assert from "node:assert/strict";
import test from "node:test";
import {
  createWikiAdminSessionToken,
  getWikiAdminSessionFromToken,
  verifyWikiAdminPassword,
  WIKI_ADMIN_SESSION_TTL_SECONDS,
} from "./admin-auth.ts";

test("verifyWikiAdminPassword uses configured admin password", () => {
  const previousPassword = process.env.WIKI_ADMIN_PASSWORD;

  process.env.WIKI_ADMIN_PASSWORD = "top-secret";

  try {
    assert.equal(verifyWikiAdminPassword("top-secret"), true);
    assert.equal(verifyWikiAdminPassword("wrong"), false);
  } finally {
    if (previousPassword === undefined) {
      delete process.env.WIKI_ADMIN_PASSWORD;
    } else {
      process.env.WIKI_ADMIN_PASSWORD = previousPassword;
    }
  }
});

test("createWikiAdminSessionToken creates a verifiable signed session", () => {
  const previousPassword = process.env.WIKI_ADMIN_PASSWORD;
  const previousSecret = process.env.WIKI_ADMIN_SESSION_SECRET;
  const now = Date.UTC(2026, 3, 10, 12, 0, 0);

  process.env.WIKI_ADMIN_PASSWORD = "top-secret";
  process.env.WIKI_ADMIN_SESSION_SECRET = "session-secret";

  try {
    const result = createWikiAdminSessionToken(now);
    const session = getWikiAdminSessionFromToken(result.token, now + 1000);

    assert.deepEqual(session, {
      expiresAt: new Date(
        now + WIKI_ADMIN_SESSION_TTL_SECONDS * 1000
      ).toISOString(),
      issuedAt: new Date(now).toISOString(),
    });
    assert.deepEqual(session, result.session);
  } finally {
    if (previousPassword === undefined) {
      delete process.env.WIKI_ADMIN_PASSWORD;
    } else {
      process.env.WIKI_ADMIN_PASSWORD = previousPassword;
    }

    if (previousSecret === undefined) {
      delete process.env.WIKI_ADMIN_SESSION_SECRET;
    } else {
      process.env.WIKI_ADMIN_SESSION_SECRET = previousSecret;
    }
  }
});

test("getWikiAdminSessionFromToken rejects tampered or expired tokens", () => {
  const previousPassword = process.env.WIKI_ADMIN_PASSWORD;
  const previousSecret = process.env.WIKI_ADMIN_SESSION_SECRET;
  const now = Date.UTC(2026, 3, 10, 12, 0, 0);

  process.env.WIKI_ADMIN_PASSWORD = "top-secret";
  process.env.WIKI_ADMIN_SESSION_SECRET = "session-secret";

  try {
    const result = createWikiAdminSessionToken(now);
    const [payload, signature] = result.token.split(".");
    const tamperedToken = `${payload}.tampered${signature?.slice(8) ?? ""}`;

    assert.equal(getWikiAdminSessionFromToken(tamperedToken, now + 1000), null);
    assert.equal(
      getWikiAdminSessionFromToken(
        result.token,
        now + WIKI_ADMIN_SESSION_TTL_SECONDS * 1000 + 1
      ),
      null
    );
  } finally {
    if (previousPassword === undefined) {
      delete process.env.WIKI_ADMIN_PASSWORD;
    } else {
      process.env.WIKI_ADMIN_PASSWORD = previousPassword;
    }

    if (previousSecret === undefined) {
      delete process.env.WIKI_ADMIN_SESSION_SECRET;
    } else {
      process.env.WIKI_ADMIN_SESSION_SECRET = previousSecret;
    }
  }
});
