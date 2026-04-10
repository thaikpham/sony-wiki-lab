import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import { revalidateWikiPageData, revalidateWikiProductDetail } from "@/lib/wiki/cache";
import { wikiProductInputSchema } from "@/lib/wiki/admin-schemas";

interface ProductRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: ProductRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const input = wikiProductInputSchema.parse(await request.json());
    const supabase = createAdminClient();

    const response = await supabase
      .from("wiki_products")
      .update({
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
      .eq("id", id)
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
            : "Không thể cập nhật sản phẩm.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: ProductRouteContext
) {
  try {
    assertWikiAdminRequest(request);
    const { id } = await params;
    const supabase = createAdminClient();

    const response = await supabase
      .from("wiki_products")
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
            : "Không thể xóa sản phẩm.",
      },
      { status: 400 }
    );
  }
}
