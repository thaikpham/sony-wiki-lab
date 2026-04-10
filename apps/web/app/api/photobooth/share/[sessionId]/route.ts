import { NextResponse } from "next/server";
import { getPhotoboothSessionByIdResult } from "@/lib/photobooth/host-client";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/photobooth/share/[sessionId]">
) {
  const { sessionId } = await params;
  const result = await getPhotoboothSessionByIdResult(sessionId);

  if (result.state === "unavailable") {
    return NextResponse.json({ message: "Booth host unavailable" }, { status: 503 });
  }

  if (result.state === "not-found" || !result.data) {
    return NextResponse.json({ message: "Share payload not found" }, { status: 404 });
  }

  return NextResponse.json(result.data.share);
}
