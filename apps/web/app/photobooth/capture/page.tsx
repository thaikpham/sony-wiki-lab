import type { Metadata } from "next";
import PhotoboothHostUnavailableState from "@/components/photobooth/PhotoboothHostUnavailableState";
import { PhotoboothCaptureExperienceContainer } from "@/components/photobooth/PhotoboothCaptureExperience";
import {
  getPhotoboothSessionByIdResult,
  getPhotoboothStatusResult,
} from "@/lib/photobooth/host-client";

export const metadata: Metadata = {
  title: "Photobooth Capture — Sony Wiki",
  description: "Capture workspace cho kiosk flow và operator settings của Photobooth",
};

export default async function PhotoboothCapturePage() {
  const statusResult = await getPhotoboothStatusResult();

  if (statusResult.state !== "ok" || !statusResult.data) {
    return (
      <PhotoboothHostUnavailableState
        activePath="/photobooth/capture"
        title="Capture workspace needs a live booth host"
        description="Capture, live view, file watcher, và session runtime chỉ hoạt động khi booth host local đang online. Trang này không còn fallback sang mock session mặc định nữa."
      />
    );
  }

  const currentSessionId = statusResult.data.currentSessionId;
  const sessionResult = currentSessionId
    ? await getPhotoboothSessionByIdResult(currentSessionId)
    : null;

  if (sessionResult?.state === "unavailable") {
    return (
      <PhotoboothHostUnavailableState
        activePath="/photobooth/capture"
        title="Current session could not be loaded from booth host"
        description="Host status đã phản hồi, nhưng session hiện tại chưa đọc được. Hãy kiểm tra booth host runtime rồi tải lại capture workspace."
      />
    );
  }

  return (
    <PhotoboothCaptureExperienceContainer
      initialStatus={statusResult.data}
      initialSession={sessionResult?.data ?? null}
    />
  );
}
