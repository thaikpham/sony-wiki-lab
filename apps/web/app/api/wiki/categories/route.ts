import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import { revalidateWikiPageData } from "@/lib/wiki/cache";
import { wikiCategoryInputSchema } from "@/lib/wiki/admin-schemas";

export async function POST(request: NextRequest) {
  try {
    assertWikiAdminRequest(request);
    const input = wikiCategoryInputSchema.parse(await request.json());
    const supabase = createAdminClient();

    const response = await supabase
      .from("wiki_categories")
      .insert({
        name: input.name,
        slug: input.slug,
        description: input.description || null,
      })
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
            : "Không thể tạo danh mục.",
      },
      { status: 400 }
    );
  }
}
