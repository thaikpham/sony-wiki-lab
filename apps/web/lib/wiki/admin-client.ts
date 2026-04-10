export interface WikiAdminSessionState {
  expiresAt: string;
  issuedAt: string;
}

export interface WikiMediaUploadResult {
  contentType: string;
  path: string;
  size: number;
  url: string;
}

const ADMIN_REQUEST_TIMEOUT_MS = 4_000;

interface WikiAdminJsonError {
  error?: string;
}

interface WikiAdminSessionPayload {
  session: WikiAdminSessionState;
}

async function parseJsonError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | WikiAdminJsonError
    | null;

  return payload?.error ?? "Yêu cầu admin thất bại.";
}

function withAdminRequestTimeout(init?: RequestInit): RequestInit {
  return {
    ...init,
    signal: AbortSignal.timeout(ADMIN_REQUEST_TIMEOUT_MS),
  };
}

export function buildJsonHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

export async function loginWikiAdmin(password: string) {
  const response = await fetch("/api/wiki/admin/verify", {
    ...withAdminRequestTimeout(),
    body: JSON.stringify({ password }),
    headers: buildJsonHeaders(),
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseJsonError(response));
  }

  const payload = (await response.json()) as WikiAdminSessionPayload;
  return payload.session;
}

export async function getWikiAdminSession() {
  const response = await fetch(
    "/api/wiki/admin/session",
    withAdminRequestTimeout({
      cache: "no-store",
    })
  );

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseJsonError(response));
  }

  const payload = (await response.json()) as WikiAdminSessionPayload;
  return payload.session;
}

export async function logoutWikiAdmin() {
  const response = await fetch(
    "/api/wiki/admin/logout",
    withAdminRequestTimeout({
      method: "POST",
    })
  );

  if (!response.ok) {
    throw new Error(await parseJsonError(response));
  }
}

export async function uploadWikiMediaFile(
  file: File,
  options?: {
    productSlug?: string;
    variant?: "gallery" | "main-image";
  }
) {
  const formData = new FormData();

  formData.set("file", file);

  if (options?.productSlug) {
    formData.set("productSlug", options.productSlug);
  }

  if (options?.variant) {
    formData.set("variant", options.variant);
  }

  const response = await fetch("/api/wiki/media/upload", {
    ...withAdminRequestTimeout(),
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await parseJsonError(response));
  }

  return (await response.json()) as WikiMediaUploadResult;
}
