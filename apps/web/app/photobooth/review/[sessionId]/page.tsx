import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PhotoboothHostUnavailableState from "@/components/photobooth/PhotoboothHostUnavailableState";
import PhotoboothReviewExperience from "@/components/photobooth/PhotoboothReviewExperience";
import { getPhotoboothSessionByIdResult } from "@/lib/photobooth/host-client";

export async function generateMetadata({
  params,
}: PageProps<"/photobooth/review/[sessionId]">): Promise<Metadata> {
  const { sessionId } = await params;

  return {
    title: `Photobooth Review ${sessionId} — Sony Wiki`,
    description: "Operator review surface cho session Photobooth",
  };
}

export default async function PhotoboothReviewPage({
  params,
}: PageProps<"/photobooth/review/[sessionId]">) {
  const { sessionId } = await params;
  const sessionResult = await getPhotoboothSessionByIdResult(sessionId);

  if (sessionResult.state === "unavailable") {
    return (
      <PhotoboothHostUnavailableState
        activePath="/photobooth/gallery"
        title="Review surface needs the local booth host"
        description="Session review không còn đọc fixture ngầm. Nếu booth host chưa online, route này sẽ báo unavailable thay vì giả lập session."
      />
    );
  }

  if (sessionResult.state === "not-found" || !sessionResult.data) {
    notFound();
  }

  return <PhotoboothReviewExperience session={sessionResult.data} />;
}
