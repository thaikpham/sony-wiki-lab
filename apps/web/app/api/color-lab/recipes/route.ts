import { NextRequest, NextResponse } from "next/server";
import { buildColorLabApiErrorResponse } from "@/lib/color-lab/api";
import { buildColorLabRecipeColor } from "@/lib/color-lab/admin-helpers";
import { revalidateColorLabPageData } from "@/lib/color-lab/cache";
import { colorLabRecipeInputSchema } from "@/lib/color-lab/admin-schemas";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import type { Json } from "@/types/supabase";

export async function POST(request: NextRequest) {
  try {
    assertWikiAdminRequest(request);
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
      .insert({
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
      .select("id")
      .single();

    if (response.error) {
      throw new Error(response.error.message);
    }

    revalidateColorLabPageData();

    return NextResponse.json({ id: response.data.id });
  } catch (error) {
    return buildColorLabApiErrorResponse(error, "Không thể tạo color lab recipe.");
  }
}
