"use client";

import Image from "next/image";
import { useState } from "react";
import ColorLabPhotoLightbox from "@/components/color-lab/ColorLabPhotoLightbox";
import {
  buildColorLabBadgeStyle,
  formatColorLabCreatedAt,
} from "@/components/color-lab/presentation";
import type { ColorLabPhoto, ColorLabRecipe } from "@/types/color-lab";

const PHOTO_HEIGHT_CLASSES = [
  "h-72",
  "h-[26rem]",
  "h-80",
  "h-[22rem]",
  "h-[28rem]",
  "h-96",
] as const;

interface ColorLabPhotoMasonryGalleryProps {
  photos: ColorLabPhoto[];
  recipe: ColorLabRecipe;
  source: "supabase" | "seed";
}

export default function ColorLabPhotoMasonryGallery({
  photos,
  recipe,
  source,
}: ColorLabPhotoMasonryGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-alt),var(--surface))] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Demo Photos
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {recipe.name}
              </h2>
            </div>
            <div
              className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
              style={buildColorLabBadgeStyle(recipe)}
            >
              {recipe.color.name} tone
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            Base profile {recipe.baseProfile} của {recipe.author} đang được preview theo
            gallery thật của recipe này. Click vào ảnh để mở lightbox và kiểm tra frame ở
            kích thước lớn hơn.
          </p>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Created
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {formatColorLabCreatedAt(recipe.createdAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Data Source
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {source === "supabase" ? "Supabase" : "Seed"}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Frames
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                {photos.length} ảnh
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={`${recipe.id}-${tag}`}
                className="rounded-full border px-2.5 py-1 text-[11px]"
                style={buildColorLabBadgeStyle(recipe)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {photos.length > 0 ? (
          <div className="mt-5 columns-1 [column-gap:1rem] md:columns-2 2xl:columns-3">
            {photos.map((photo, index) => (
              <article
                key={`${recipe.id}-${photo.id}`}
                className="mb-4 break-inside-avoid overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-alt)]"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="block w-full text-left"
                >
                  <div
                    className={`relative overflow-hidden ${PHOTO_HEIGHT_CLASSES[index % PHOTO_HEIGHT_CLASSES.length]}`}
                  >
                    <Image
                      src={photo.url}
                      alt={`${photo.caption} với profile ${recipe.baseProfile}`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent px-4 pb-4 pt-10 text-white">
                      <p className="text-sm font-medium">{photo.caption}</p>
                      <p className="mt-1 text-xs text-white/80">
                        Sony Color Lab • {recipe.baseProfile}
                      </p>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-12 text-center text-sm text-[var(--muted-foreground)]">
            Chưa có ảnh demo cho recipe đang chọn.
          </div>
        )}
      </section>

      <ColorLabPhotoLightbox
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onSelect={setLightboxIndex}
        photos={photos}
        recipe={recipe}
      />
    </>
  );
}
