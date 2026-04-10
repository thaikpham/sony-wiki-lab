import type { Metadata } from "next";
import PhotoboothLandingExperience from "@/components/photobooth/PhotoboothLandingExperience";
import { getPhotoboothRelease, getPhotoboothStatusResult } from "@/lib/photobooth/host-client";

export const metadata: Metadata = {
  title: "Photobooth — Sony Wiki",
  description: "Landing, download và runtime shell cho Sony Photobooth",
};

export default async function PhotoboothPage() {
  const [release, statusResult] = await Promise.all([
    getPhotoboothRelease(),
    getPhotoboothStatusResult(),
  ]);

  return (
    <PhotoboothLandingExperience
      release={release}
      status={statusResult.data}
      hostUnavailable={statusResult.state !== "ok"}
    />
  );
}
