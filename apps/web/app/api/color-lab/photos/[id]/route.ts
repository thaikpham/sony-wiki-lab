import { NextRequest, NextResponse } from "next/server";
import { buildColorLabApiErrorResponse } from "@/lib/color-lab/api";
import { revalidateColorLabPageData } from "@/lib/color-lab/cache";
import { colorLabPhotoUpdateSchema } from "@/lib/color-lab/admin-schemas";
import { COLOR_LAB_PREVIEW_BUCKET } from "@/lib/color-lab/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";

interface ColorLabPhotoRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: ColorLabPhotoRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const input = colorLabPhotoUpdateSchema.parse(await request.json());
    const supabase = createAdminClient();

    const response = await supabase
      .from("color_lab_photos")
      .update({
        recipe_id: input.recipeId,
        sort_order: input.sortOrder,
        caption: input.caption,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id")
      .single();

    if (response.error) {
      throw new Error(response.error.message);
    }

    revalidateColorLabPageData();

    return NextResponse.json({ id: response.data.id });
  } catch (error) {
    return buildColorLabApiErrorResponse(
      error,
      "Không thể cập nhật color lab photo."
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: ColorLabPhotoRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const supabase = createAdminClient();
    const response = await supabase
      .from("color_lab_photos")
      .delete()
      .eq("id", id)
      .select("id,storage_path")
      .single();

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (response.data.storage_path) {
      const removal = await supabase.storage
        .from(COLOR_LAB_PREVIEW_BUCKET)
        .remove([response.data.storage_path]);

      if (removal.error) {
        throw new Error(removal.error.message);
      }
    }

    revalidateColorLabPageData();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return buildColorLabApiErrorResponse(error, "Không thể xóa color lab photo.");
  }
}
