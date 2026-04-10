import { NextRequest, NextResponse } from "next/server";
import {
  applyWikiAdminSession,
  createWikiAdminSessionToken,
  verifyWikiAdminPassword,
} from "@/lib/wiki/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { password?: string };

    if (!body.password || !verifyWikiAdminPassword(body.password)) {
      return NextResponse.json(
        { error: "Mật khẩu admin không đúng." },
        { status: 401 }
      );
    }

    const { session, token } = createWikiAdminSessionToken();
    const response = NextResponse.json({ ok: true, session });

    return applyWikiAdminSession(response, token);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Không thể xác thực admin.",
      },
      { status: 500 }
    );
  }
}
