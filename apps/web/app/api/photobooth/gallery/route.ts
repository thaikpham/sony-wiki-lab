import { NextResponse } from "next/server";
import { getPhotoboothGalleryResult } from "@/lib/photobooth/host-client";

export async function GET() {
  const result = await getPhotoboothGalleryResult();

  if (result.state === "unavailable") {
    return NextResponse.json({ message: "Booth host unavailable" }, { status: 503 });
  }

  if (result.state === "not-found" || !result.data) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(result.data);
}
