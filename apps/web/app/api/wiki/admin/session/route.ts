import { NextRequest, NextResponse } from "next/server";
import { getWikiAdminSession } from "@/lib/wiki/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const session = getWikiAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Phiên admin đã hết hạn hoặc chưa đăng nhập." },
        { status: 401 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể đọc trạng thái admin.",
      },
      { status: 500 }
    );
  }
}
