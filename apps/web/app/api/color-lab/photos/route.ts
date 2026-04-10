import { NextRequest, NextResponse } from "next/server";
import { buildColorLabApiErrorResponse } from "@/lib/color-lab/api";
import { revalidateColorLabPageData } from "@/lib/color-lab/cache";
import { colorLabPhotoUploadSchema } from "@/lib/color-lab/admin-schemas";
import {
  assertValidColorLabImageFile,
  buildColorLabPhotoStoragePath,
  COLOR_LAB_PREVIEW_BUCKET,
  getColorLabPhotoPublicUrl,
} from "@/lib/color-lab/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";

export async function POST(request: NextRequest) {
  try {
    assertWikiAdminRequest(request);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new Error("Thiếu file ảnh cho Color Lab.");
    }

    const input = colorLabPhotoUploadSchema.parse({
      recipeId: formData.get("recipeId"),
      caption: formData.get("caption"),
      sortOrder: formData.get("sortOrder"),
    });
    assertValidColorLabImageFile(file);
    const supabase = createAdminClient();
    const storagePath = buildColorLabPhotoStoragePath(
      input.recipeId,
      file.name,
      file.type
    );
    const upload = await supabase.storage
      .from(COLOR_LAB_PREVIEW_BUCKET)
      .upload(storagePath, new Uint8Array(await file.arrayBuffer()), {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (upload.error) {
      throw new Error(upload.error.message);
    }

    const publicUrl = getColorLabPhotoPublicUrl(storagePath);

    const response = await supabase
      .from("color_lab_photos")
      .insert({
        src: publicUrl,
        recipe_id: input.recipeId,
        storage_path: storagePath,
        sort_order: input.sortOrder,
        caption: input.caption,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (response.error) {
      await supabase.storage.from(COLOR_LAB_PREVIEW_BUCKET).remove([storagePath]);
      throw new Error(response.error.message);
    }

    revalidateColorLabPageData();

    return NextResponse.json({ id: response.data.id });
  } catch (error) {
    return buildColorLabApiErrorResponse(error, "Không thể upload color lab photo.");
  }
}
