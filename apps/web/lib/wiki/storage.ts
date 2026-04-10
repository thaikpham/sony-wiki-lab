export const WIKI_MEDIA_BUCKET = "wiki-media";
export const WIKI_MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const FALLBACK_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type WikiMediaVariant = "gallery" | "main-image";

function sanitizePathSegment(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildTimestampSegment() {
  return new Date()
    .toISOString()
    .replace(/[^0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveFileExtension(fileName: string, mimeType?: string) {
  const normalizedFileName = fileName.trim().toLowerCase();
  const lastDotIndex = normalizedFileName.lastIndexOf(".");

  if (lastDotIndex > -1 && lastDotIndex < normalizedFileName.length - 1) {
    return normalizedFileName.slice(lastDotIndex + 1);
  }

  return FALLBACK_EXTENSION_BY_MIME_TYPE[mimeType ?? ""] ?? "jpg";
}

export function buildWikiMediaStoragePath(input: {
  fileName: string;
  mimeType?: string;
  productSlug?: string | null;
  variant?: WikiMediaVariant;
}) {
  const productSegment = sanitizePathSegment(input.productSlug ?? "") || "draft-product";
  const variantSegment = input.variant ?? "gallery";
  const baseName =
    sanitizePathSegment(input.fileName.replace(/\.[^.]+$/, "")) || "image";
  const extension = resolveFileExtension(input.fileName, input.mimeType);
  const timestamp = buildTimestampSegment();

  return `${productSegment}/${variantSegment}/${timestamp}-${baseName}.${extension}`;
}

export function getWikiMediaPublicUrl(storagePath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl || !storagePath) {
    return "";
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${supabaseUrl}/storage/v1/object/public/${WIKI_MEDIA_BUCKET}/${encodedPath}`;
}

export function assertValidWikiImageFile(file: File) {
  if (!file.name.trim()) {
    throw new Error("Thiếu tên file ảnh.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ chấp nhận file ảnh cho Wiki.");
  }

  if (file.size <= 0) {
    throw new Error("File ảnh trống.");
  }

  if (file.size > WIKI_MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Ảnh vượt quá giới hạn 10MB.");
  }
}
