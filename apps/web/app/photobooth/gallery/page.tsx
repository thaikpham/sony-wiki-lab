import type { Metadata } from "next";
import PhotoboothHostUnavailableState from "@/components/photobooth/PhotoboothHostUnavailableState";
import PhotoboothGalleryExperience from "@/components/photobooth/PhotoboothGalleryExperience";
import { getPhotoboothGalleryResult } from "@/lib/photobooth/host-client";

export const metadata: Metadata = {
  title: "Photobooth Gallery — Sony Wiki",
  description: "Gallery và share hub cho session Photobooth",
};

export default async function PhotoboothGalleryPage() {
  const sessionsResult = await getPhotoboothGalleryResult();

  if (sessionsResult.state !== "ok" || !sessionsResult.data) {
    return (
      <PhotoboothHostUnavailableState
        activePath="/photobooth/gallery"
        title="Gallery needs the local booth host"
        description="Gallery bây giờ chỉ đọc session thật từ booth host. Khi host chưa phản hồi, route này sẽ dừng ở trạng thái unavailable thay vì publish fixture mặc định."
      />
    );
  }

  return <PhotoboothGalleryExperience sessions={sessionsResult.data} />;
}
