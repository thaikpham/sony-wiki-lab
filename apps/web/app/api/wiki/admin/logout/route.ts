import { NextResponse } from "next/server";
import { clearWikiAdminSession } from "@/lib/wiki/admin-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearWikiAdminSession(response);
}
