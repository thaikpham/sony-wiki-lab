import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import {
  assertValidWikiImageFile,
  buildWikiMediaStoragePath,
  getWikiMediaPublicUrl,
  WIKI_MEDIA_BUCKET,
} from "@/lib/wiki/storage";

function resolveUploadVariant(value: FormDataEntryValue | null) {
  return value === "main-image" ? "main-image" : "gallery";
}

function resolveProductSlug(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function POST(request: NextRequest) {
  try {
    assertWikiAdminRequest(request);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("Thiếu file ảnh để upload.");
    }

    assertValidWikiImageFile(file);

    const storagePath = buildWikiMediaStoragePath({
      fileName: file.name,
      mimeType: file.type,
      productSlug: resolveProductSlug(formData.get("productSlug")),
      variant: resolveUploadVariant(formData.get("variant")),
    });
    const supabase = createAdminClient();
    const upload = await supabase.storage
      .from(WIKI_MEDIA_BUCKET)
      .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      });

    if (upload.error) {
      throw new Error(upload.error.message);
    }

    return NextResponse.json({
      contentType: file.type || "application/octet-stream",
      path: upload.data.path,
      size: file.size,
      url: getWikiMediaPublicUrl(upload.data.path),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể upload ảnh wiki.";
    const status = message === "Unauthorized wiki admin request." ? 401 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
