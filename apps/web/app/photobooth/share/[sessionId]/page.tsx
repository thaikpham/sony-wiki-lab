import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoboothHostUnavailableState from "@/components/photobooth/PhotoboothHostUnavailableState";
import PhotoboothShareExperience from "@/components/photobooth/PhotoboothShareExperience";
import { getPhotoboothSessionByIdResult } from "@/lib/photobooth/host-client";

export async function generateMetadata({
  params,
}: PageProps<"/photobooth/share/[sessionId]">): Promise<Metadata> {
  const { sessionId } = await params;

  return {
    title: `Photobooth Share ${sessionId} — Sony Wiki`,
    description: "Public share route cho khách tải ảnh Photobooth",
  };
}

export default async function PhotoboothSharePage({
  params,
}: PageProps<"/photobooth/share/[sessionId]">) {
  const { sessionId } = await params;
  const sessionResult = await getPhotoboothSessionByIdResult(sessionId);

  if (sessionResult.state === "unavailable") {
    return (
      <PhotoboothHostUnavailableState
        activePath="/photobooth/gallery"
        title="Public share route needs the local booth host"
        description="Share route hiện đọc session thật từ host local. Nếu host chưa sẵn sàng, khách sẽ thấy trạng thái unavailable thay vì share payload giả."
      />
    );
  }

  if (sessionResult.state === "not-found" || !sessionResult.data) {
    notFound();
  }

  return <PhotoboothShareExperience session={sessionResult.data} />;
}
