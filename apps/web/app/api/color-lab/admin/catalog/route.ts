import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertWikiAdminRequest } from "@/lib/wiki/admin-auth";
import { getColorLabAdminCatalog } from "@/lib/color-lab/queries";

export async function GET(request: NextRequest) {
  try {
    assertWikiAdminRequest(request);
    const supabase = createAdminClient();
    const catalog = await getColorLabAdminCatalog(supabase);

    return NextResponse.json(catalog);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể tải color lab admin catalog.",
      },
      { status: 401 }
    );
  }
}
