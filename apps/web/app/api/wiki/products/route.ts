import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import { revalidateWikiProductDetail } from "@/lib/wiki/cache";
import { wikiProductInputSchema } from "@/lib/wiki/admin-schemas";

export async function POST(request: NextRequest) {
  try {
    assertWikiAdminRequest(request);
    const input = wikiProductInputSchema.parse(await request.json());
    const supabase = createAdminClient();

    const response = await supabase
      .from("wiki_products")
      .insert({
        name: input.name,
        slug: input.slug,
        category_id: input.categoryId,
        subcategory: input.subcategory || null,
        short_description: input.shortDescription || null,
        description: input.description || null,
        main_image: input.mainImage || null,
        price_vnd: input.priceVnd,
        buy_link: input.buyLink || null,
        gallery: input.gallery,
        specs: input.specGroups,
        is_published: input.isPublished,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (response.error) {
      throw new Error(response.error.message);
    }

    revalidateWikiProductDetail(input.slug);

    return NextResponse.json({ id: response.data.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tạo sản phẩm.",
      },
      { status: 400 }
    );
  }
}
