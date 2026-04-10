import { createHmac, timingSafeEqual } from "node:crypto";

export const WIKI_ADMIN_SESSION_COOKIE = "sony-wiki-admin-session";
export const WIKI_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

interface WikiAdminSessionPayload {
  exp: number;
  iat: number;
  scope: "wiki-admin";
}

export interface WikiAdminSession {
  expiresAt: string;
  issuedAt: string;
}

interface CookieReader {
  cookies: {
    get(name: string): { value?: string } | undefined;
  };
}

interface CookieWriter {
  cookies: {
    set(
      ...args:
        | [cookie: ReturnType<typeof buildWikiAdminSessionCookie>]
        | [
            key: string,
            value: string,
            cookie?: Partial<ReturnType<typeof buildWikiAdminSessionCookie>>,
          ]
    ): unknown;
  };
}

function getConfiguredAdminPassword() {
  const password = process.env.WIKI_ADMIN_PASSWORD;

  if (!password) {
    throw new Error("Missing WIKI_ADMIN_PASSWORD configuration.");
  }

  return password;
}

function getConfiguredSessionSecret() {
  return process.env.WIKI_ADMIN_SESSION_SECRET ?? getConfiguredAdminPassword();
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function signWikiAdminSessionPayload(encodedPayload: string) {
  return createHmac("sha256", getConfiguredSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
}

function encodeWikiAdminSessionPayload(payload: WikiAdminSessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeWikiAdminSessionPayload(
  encodedPayload: string
): WikiAdminSessionPayload | null {
  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<WikiAdminSessionPayload>;

    if (
      typeof decoded.iat !== "number" ||
      typeof decoded.exp !== "number" ||
      decoded.scope !== "wiki-admin"
    ) {
      return null;
    }

    return {
      exp: decoded.exp,
      iat: decoded.iat,
      scope: decoded.scope,
    };
  } catch {
    return null;
  }
}

function payloadToSession(payload: WikiAdminSessionPayload): WikiAdminSession {
  return {
    expiresAt: new Date(payload.exp).toISOString(),
    issuedAt: new Date(payload.iat).toISOString(),
  };
}

export function verifyWikiAdminPassword(password: string) {
  return safeCompare(password, getConfiguredAdminPassword());
}

export function createWikiAdminSessionToken(now = Date.now()) {
  const payload: WikiAdminSessionPayload = {
    exp: now + WIKI_ADMIN_SESSION_TTL_SECONDS * 1000,
    iat: now,
    scope: "wiki-admin",
  };
  const encodedPayload = encodeWikiAdminSessionPayload(payload);
  const signature = signWikiAdminSessionPayload(encodedPayload);

  return {
    session: payloadToSession(payload),
    token: `${encodedPayload}.${signature}`,
  };
}

export function getWikiAdminSessionFromToken(
  token: string | null | undefined,
  now = Date.now()
) {
  if (!token) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");

  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = signWikiAdminSessionPayload(encodedPayload);

  if (!safeCompare(providedSignature, expectedSignature)) {
    return null;
  }

  const payload = decodeWikiAdminSessionPayload(encodedPayload);

  if (!payload || payload.exp <= now) {
    return null;
  }

  return payloadToSession(payload);
}

export function getWikiAdminSession(request: CookieReader) {
  return getWikiAdminSessionFromToken(
    request.cookies.get(WIKI_ADMIN_SESSION_COOKIE)?.value
  );
}

export function assertWikiAdminRequest(request: CookieReader) {
  if (!getWikiAdminSession(request)) {
    throw new Error("Unauthorized wiki admin request.");
  }
}

function buildWikiAdminSessionCookie(value: string) {
  return {
    expires: undefined as Date | undefined,
    httpOnly: true,
    maxAge: WIKI_ADMIN_SESSION_TTL_SECONDS,
    name: WIKI_ADMIN_SESSION_COOKIE,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    value,
  };
}

export function applyWikiAdminSession<T extends CookieWriter>(
  response: T,
  token: string
) {
  response.cookies.set(buildWikiAdminSessionCookie(token));
  return response;
}

export function clearWikiAdminSession<T extends CookieWriter>(response: T) {
  response.cookies.set({
    ...buildWikiAdminSessionCookie(""),
    expires: new Date(0),
    maxAge: 0,
  });
  return response;
}
