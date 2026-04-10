import { NextRequest, NextResponse } from "next/server";
import { buildColorLabApiErrorResponse } from "@/lib/color-lab/api";
import { buildColorLabRecipeColor } from "@/lib/color-lab/admin-helpers";
import { revalidateColorLabPageData } from "@/lib/color-lab/cache";
import { colorLabRecipeInputSchema } from "@/lib/color-lab/admin-schemas";
import { COLOR_LAB_PREVIEW_BUCKET } from "@/lib/color-lab/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import type { Json } from "@/types/supabase";

interface ColorLabRecipeRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: ColorLabRecipeRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const input = colorLabRecipeInputSchema.parse(await request.json());
    const supabase = createAdminClient();
    const recipeColor = buildColorLabRecipeColor(input.color.name, input.color.hex);
    const colorPayload: Json = {
      name: recipeColor.name,
      hex: recipeColor.hex,
      border: recipeColor.border,
      bg: recipeColor.bg,
      text: recipeColor.text,
    };

    const response = await supabase
      .from("color_lab_recipes")
      .update({
        name: input.name,
        base_profile: input.baseProfile,
        author: input.author,
        tags: input.tags,
        camera_lines: input.cameraLines,
        compatibility_notes: input.compatibilityNotes,
        color: colorPayload,
        settings: input.settings as Json,
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
      "Không thể cập nhật color lab recipe."
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: ColorLabRecipeRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const supabase = createAdminClient();
    const relatedPhotosResponse = await supabase
      .from("color_lab_photos")
      .select("storage_path")
      .eq("recipe_id", id);

    if (relatedPhotosResponse.error) {
      throw new Error(relatedPhotosResponse.error.message);
    }

    const storagePaths = (relatedPhotosResponse.data ?? [])
      .map((photo) => photo.storage_path)
      .filter((value): value is string => {
        return typeof value === "string" && value.length > 0;
      });
    const response = await supabase
      .from("color_lab_recipes")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (storagePaths.length > 0) {
      const removal = await supabase.storage
        .from(COLOR_LAB_PREVIEW_BUCKET)
        .remove(storagePaths);

      if (removal.error) {
        throw new Error(removal.error.message);
      }
    }

    revalidateColorLabPageData();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return buildColorLabApiErrorResponse(error, "Không thể xóa color lab recipe.");
  }
}
