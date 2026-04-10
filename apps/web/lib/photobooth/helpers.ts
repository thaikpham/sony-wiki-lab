import type {
  PhotoboothAsset,
  PhotoboothSession,
  PhotoboothShareInfo,
} from "./contracts";

export function buildPhotoboothSharePath(sessionId: string) {
  return `/photobooth/share/${sessionId}`;
}

export function buildAbsoluteShareUrl(sessionId: string, origin?: string) {
  const baseOrigin =
    origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${baseOrigin.replace(/\/$/, "")}${buildPhotoboothSharePath(sessionId)}`;
}

export function getSelectedAsset(session: PhotoboothSession): PhotoboothAsset | null {
  return (
    session.assets.find((asset) => asset.id === session.selectedAssetId) ??
    session.assets[0] ??
    null
  );
}

export function buildPhotoboothShareInfo(
  sessionId: string,
  publishedAt: string | null,
  origin?: string
): PhotoboothShareInfo {
  const shareUrl = buildAbsoluteShareUrl(sessionId, origin);

  return {
    shareUrl,
    qrValue: shareUrl,
    publishedAt,
    status: publishedAt ? "published" : "draft",
  };
}
