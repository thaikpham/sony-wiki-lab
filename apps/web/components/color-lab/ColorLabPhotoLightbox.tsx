"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { ColorLabPhoto, ColorLabRecipe } from "@/types/color-lab";

interface ColorLabPhotoLightboxProps {
  activeIndex: number | null;
  onClose: () => void;
  onSelect: (index: number | null) => void;
  photos: ColorLabPhoto[];
  recipe: ColorLabRecipe;
}

export default function ColorLabPhotoLightbox({
  activeIndex,
  onClose,
  onSelect,
  photos,
  recipe,
}: ColorLabPhotoLightboxProps) {
  const activePhoto =
    activeIndex !== null && activeIndex >= 0 ? photos[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const currentIndex = activeIndex;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft" && photos.length > 1) {
        onSelect((currentIndex - 1 + photos.length) % photos.length);
      }

      if (event.key === "ArrowRight" && photos.length > 1) {
        onSelect((currentIndex + 1) % photos.length);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose, onSelect, photos.length]);

  if (!activePhoto) {
    return null;
  }

  const activePhotoIndex = activeIndex ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6">
      <div className="relative w-full max-w-6xl rounded-[2rem] border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-sm text-white"
        >
          Đóng
        </button>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative min-h-[60vh] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
            <Image
              src={activePhoto.url}
              alt={`${activePhoto.caption} với profile ${recipe.baseProfile}`}
              fill
              unoptimized
              sizes="(max-width: 1280px) 100vw, 960px"
              className="object-contain"
            />
          </div>

          <aside className="flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-white">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                Lightbox
              </p>
              <h3 className="mt-2 text-xl font-semibold">{recipe.name}</h3>
              <p className="mt-2 text-sm leading-7 text-white/70">{activePhoto.caption}</p>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-black/30 p-4 text-sm text-white/80">
              <p>Base profile: {recipe.baseProfile}</p>
              <p className="mt-2">Author: {recipe.author}</p>
              <p className="mt-2">
                Frame: {activePhotoIndex + 1} / {photos.length}
              </p>
            </div>

            {photos.length > 1 ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onSelect((activePhotoIndex - 1 + photos.length) % photos.length)
                  }
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white"
                >
                  Ảnh trước
                </button>
                <button
                  type="button"
                  onClick={() => onSelect((activePhotoIndex + 1) % photos.length)}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white"
                >
                  Ảnh sau
                </button>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
