import { NextResponse } from "next/server";
import { getPhotoboothRelease } from "@/lib/photobooth/host-client";

export async function GET() {
  const release = await getPhotoboothRelease();
  return NextResponse.json(release);
}
