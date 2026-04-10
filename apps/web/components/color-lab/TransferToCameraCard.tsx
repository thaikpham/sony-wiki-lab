"use client";

import { useState } from "react";

const TRANSFER_VIDEOS = {
  "new-menu": {
    helper: "Workflow mới",
    label: "Menu mới",
    src: "https://www.youtube.com/embed/nAWs5Mus90s?rel=0",
  },
  "legacy-menu": {
    helper: "Legacy menu",
    label: "Menu cũ",
    src: "https://www.youtube.com/embed/SI0bdb_oP9A?rel=0",
  },
} as const;

export default function TransferToCameraCard() {
  const [selectedVideo, setSelectedVideo] =
    useState<keyof typeof TRANSFER_VIDEOS>("new-menu");
  const activeVideo = TRANSFER_VIDEOS[selectedVideo];

  return (
    <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-alt),var(--surface))] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          Transfer To Camera
        </p>
        <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
          Giữ lại guide card từ ref cũ
        </h3>
        <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
          Card này tách riêng khỏi gallery để tránh kéo lại monolithic page state, nhưng vẫn
          giữ đúng workflow video hướng dẫn chuyển profile vào máy.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(TRANSFER_VIDEOS).map(([key, video]) => {
            const isActive = key === selectedVideo;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedVideo(key as keyof typeof TRANSFER_VIDEOS)}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-[var(--foreground)] bg-[var(--surface)] text-[var(--foreground)]"
                    : "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {video.label} • {video.helper}
              </button>
            );
          })}
        </div>

        <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-black">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <span>{activeVideo.label}</span>
            <span>YouTube Guide</span>
          </div>
          <div className="aspect-video">
            <iframe
              title={`Transfer to Camera - ${activeVideo.label}`}
              src={activeVideo.src}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
