export const COLOR_LAB_PREVIEW_BUCKET = "color-lab-preview";
export const COLOR_LAB_MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const FALLBACK_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

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

export function buildColorLabPhotoStoragePath(
  recipeId: string,
  fileName: string,
  mimeType?: string
) {
  const recipeSegment = sanitizePathSegment(recipeId) || "recipe";
  const baseName = sanitizePathSegment(fileName.replace(/\.[^.]+$/, "")) || "photo";
  const extension = resolveFileExtension(fileName, mimeType);
  const timestamp = buildTimestampSegment();

  return `${recipeSegment}/${timestamp}-${baseName}.${extension}`;
}

export function getColorLabPhotoPublicUrl(storagePath: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl || !storagePath) {
    return "";
  }

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${supabaseUrl}/storage/v1/object/public/${COLOR_LAB_PREVIEW_BUCKET}/${encodedPath}`;
}

export function assertValidColorLabImageFile(file: File) {
  if (!file.name.trim()) {
    throw new Error("Thiếu tên file ảnh.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ chấp nhận file ảnh cho Color Lab.");
  }

  if (file.size <= 0) {
    throw new Error("File ảnh trống.");
  }

  if (file.size > COLOR_LAB_MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("Ảnh vượt quá giới hạn 10MB.");
  }
}
