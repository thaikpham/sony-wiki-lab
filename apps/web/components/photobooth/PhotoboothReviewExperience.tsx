/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { PhotoboothSession } from "@/lib/photobooth/contracts";
import { getSelectedAsset } from "@/lib/photobooth/helpers";
import PhotoboothStudioShell from "./PhotoboothStudioShell";

interface PhotoboothReviewExperienceProps {
  session: PhotoboothSession;
}

export default function PhotoboothReviewExperience({
  session,
}: PhotoboothReviewExperienceProps) {
  const selectedAsset = getSelectedAsset(session);

  return (
    <PhotoboothStudioShell activePath="/photobooth/gallery">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] bg-white p-5">
          {selectedAsset ? (
            <img
              src={selectedAsset.imageUrl}
              alt={selectedAsset.fileName}
              className="aspect-[3/2] w-full rounded-[1.6rem] object-cover"
            />
          ) : null}
        </article>

        <aside className="space-y-4">
          <div className="rounded-[1.8rem] bg-white p-5">
            <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/48">
              Session Metadata
            </p>
            <div className="mt-4 space-y-3">
              {[
                ["State", session.state],
                ["Mode", session.boothMode],
                ["Event", session.eventName],
                ["Storage", session.storagePath],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.2rem] bg-[#f3f3f3] px-4 py-3">
                  <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] text-black/42">
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-black/72">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] bg-[#111111] p-5 text-white">
            <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-white/54">
              Publish Decision
            </p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Nếu session đã ổn, operator chỉ cần mở share route và hiển thị QR cho khách.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/photobooth/share/${session.id}`}
                className="rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black"
              >
                Open Share
              </Link>
              <Link
                href="/photobooth/gallery"
                className="rounded-full bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
              >
                Back to Gallery
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </PhotoboothStudioShell>
  );
}
