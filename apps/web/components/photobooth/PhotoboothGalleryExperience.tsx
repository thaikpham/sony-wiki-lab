/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { PhotoboothSession } from "@/lib/photobooth/contracts";
import { getSelectedAsset } from "@/lib/photobooth/helpers";
import PhotoboothStudioShell from "./PhotoboothStudioShell";

interface PhotoboothGalleryExperienceProps {
  sessions: PhotoboothSession[];
}

export default function PhotoboothGalleryExperience({
  sessions,
}: PhotoboothGalleryExperienceProps) {
  const selectedSession = sessions[0] ?? null;
  const selectedAsset = selectedSession ? getSelectedAsset(selectedSession) : null;
  const totalAssets = sessions.reduce((total, session) => total + session.assets.length, 0);

  return (
    <PhotoboothStudioShell activePath="/photobooth/gallery">
      {sessions.length === 0 ? (
        <section className="rounded-[1.8rem] border border-black/8 bg-white p-8 shadow-sm">
          <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/48">
            No Sessions Yet
          </p>
          <h1 className="mt-4 font-[var(--font-photobooth-headline)] text-4xl font-semibold tracking-[-0.04em]">
            Gallery sẽ hiện khi booth host đã tạo session đầu tiên.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/58">
            Runtime đang online nhưng chưa có session nào được tạo hoặc host chưa đăng ký asset nào vào gallery.
          </p>
          <div className="mt-6">
            <Link
              href="/photobooth/capture"
              className="rounded-full bg-black px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
            >
              Open Capture Workspace
            </Link>
          </div>
        </section>
      ) : (
      <div className="grid gap-6 2xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="rounded-[1.8rem] bg-[#f3f3f3] p-4">
          <p className="px-2 font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/50">
            Session Index
          </p>
          <div className="mt-4 space-y-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/photobooth/review/${session.id}`}
                className="block rounded-[1.4rem] bg-white p-4 transition-transform hover:-translate-y-0.5"
              >
                <p className="font-[var(--font-photobooth-headline)] text-lg font-semibold tracking-[-0.03em]">
                  {session.title}
                </p>
                <p className="mt-1 font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] text-black/46">
                  {session.id} · {session.assets.length} asset
                </p>
                <p className="mt-3 text-sm leading-6 text-black/58">{session.eventName}</p>
              </Link>
            ))}
          </div>
        </aside>

        <section className="rounded-[1.8rem] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/5 pb-4">
            <div>
              <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/48">
                Assets
              </p>
              <h2 className="mt-2 font-[var(--font-photobooth-headline)] text-3xl font-semibold tracking-[-0.04em]">
                {totalAssets} captures ready for review
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
              <span className="rounded-full bg-[#f1f1f1] px-3 py-2">Grid</span>
              <span className="rounded-full bg-[#f1f1f1] px-3 py-2">Recent</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sessions.flatMap((session) =>
              session.assets.map((asset) => (
                <article
                  key={asset.id}
                  className="group overflow-hidden rounded-[1.5rem] bg-[#f3f3f3]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={asset.thumbnailUrl}
                      alt={asset.fileName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.72))] p-4 text-white">
                      <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em]">
                        {asset.fileName}
                      </p>
                      <p className="mt-1 text-xs text-white/64">{session.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-black/72">{session.title}</p>
                      <p className="mt-1 font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.16em] text-black/42">
                        {asset.deliveryStatus}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/photobooth/review/${session.id}`}
                        className="rounded-full bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black ring-1 ring-black/8"
                      >
                        Review
                      </Link>
                      <Link
                        href={`/photobooth/share/${session.id}`}
                        className="rounded-full bg-black px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
                      >
                        Share
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <aside className="rounded-[1.8rem] bg-[#f3f3f3] p-5">
          <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/48">
            Share & Export
          </p>
          {selectedAsset && selectedSession ? (
            <>
              <div className="mt-4 overflow-hidden rounded-[1.4rem] bg-white">
                <img
                  src={selectedAsset.imageUrl}
                  alt={selectedAsset.fileName}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="mt-4 rounded-[1.4rem] bg-white p-4">
                <p className="font-[var(--font-photobooth-headline)] text-lg font-semibold">
                  {selectedSession.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-black/58">
                  Session đang được ưu tiên cho quick share. Từ đây operator có thể mở review
                  page hoặc vào ngay public route để test QR/download flow.
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/photobooth/share/${selectedSession.id}`}
                    className="rounded-full bg-black px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                  >
                    Open Share
                  </Link>
                  <Link
                    href={`/photobooth/review/${selectedSession.id}`}
                    className="rounded-full bg-[#f1f1f1] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black"
                  >
                    Review
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </aside>
      </div>
      )}
    </PhotoboothStudioShell>
  );
}
