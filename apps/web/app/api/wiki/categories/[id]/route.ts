import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import { revalidateWikiPageData } from "@/lib/wiki/cache";
import { wikiCategoryInputSchema } from "@/lib/wiki/admin-schemas";

interface CategoryRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: CategoryRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const input = wikiCategoryInputSchema.parse(await request.json());
    const supabase = createAdminClient();

    const response = await supabase
      .from("wiki_categories")
      .update({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
      })
      .eq("id", id)
      .select("id")
      .single();

    if (response.error) {
      throw new Error(response.error.message);
    }

    revalidateWikiPageData();

    return NextResponse.json({ id: response.data.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật danh mục.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: CategoryRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const supabase = createAdminClient();

    const response = await supabase
      .from("wiki_categories")
      .delete()
      .eq("id", id);

    if (response.error) {
      throw new Error(response.error.message);
    }

    revalidateWikiPageData();

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể xóa danh mục.",
      },
      { status: 400 }
    );
  }
}
