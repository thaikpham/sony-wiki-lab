/* eslint-disable @next/next/no-img-element */

import type { PhotoboothSession } from "@/lib/photobooth/contracts";
import { getSelectedAsset } from "@/lib/photobooth/helpers";
import PhotoboothQrCode from "./PhotoboothQrCode";

interface PhotoboothShareExperienceProps {
  session: PhotoboothSession;
}

export default function PhotoboothShareExperience({
  session,
}: PhotoboothShareExperienceProps) {
  const selectedAsset = getSelectedAsset(session);

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 text-[#1a1c1c]">
      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#f9f9f9,#efefef)] p-6 lg:p-8">
        <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/48">
          Public Share Route
        </p>
        <h1 className="mt-4 font-[var(--font-photobooth-headline)] text-4xl font-bold tracking-[-0.04em] lg:text-6xl">
          {session.title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/58">
          Đây là public share surface cho khách tại sự kiện. Trang này chỉ đọc metadata đã
          publish, tập trung vào preview ảnh chính, nút tải về và QR/access link ngắn gọn.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-[2rem] bg-white p-4 shadow-[0_32px_90px_rgba(0,0,0,0.08)] lg:p-5">
          {selectedAsset ? (
            <img
              src={selectedAsset.imageUrl}
              alt={selectedAsset.fileName}
              className="aspect-[3/4] w-full rounded-[1.6rem] object-cover"
            />
          ) : null}
        </article>

        <aside className="space-y-4">
          <div className="rounded-[1.8rem] bg-white p-5">
            <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/48">
              Download
            </p>
            <h2 className="mt-3 font-[var(--font-photobooth-headline)] text-2xl font-semibold tracking-[-0.03em]">
              Tải ảnh ngay về điện thoại
            </h2>
            <p className="mt-3 text-sm leading-7 text-black/58">
              Mỗi session chỉ phát một key frame chính ở v1. Link và QR đều trỏ tới route share này.
            </p>
            {selectedAsset ? (
              <a
                href={selectedAsset.imageUrl}
                download={selectedAsset.fileName}
                className="mt-5 inline-flex rounded-full bg-black px-5 py-3 font-[var(--font-photobooth-headline)] text-sm font-semibold uppercase tracking-[0.18em] text-white"
              >
                Download JPG
              </a>
            ) : null}
          </div>

          <div className="rounded-[1.8rem] bg-[#111111] p-5 text-white">
            <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-white/54">
              QR Access
            </p>
            <div className="mt-4 rounded-[1.4rem] bg-white p-4 text-black">
              <PhotoboothQrCode value={session.share.qrValue} />
            </div>
            <p className="mt-4 break-all font-[var(--font-photobooth-mono)] text-[11px] leading-6 text-white/66">
              {session.share.shareUrl}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
