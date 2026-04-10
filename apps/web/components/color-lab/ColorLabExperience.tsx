"use client";

import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import ColorLabPhotoMasonryGallery from "@/components/color-lab/ColorLabPhotoMasonryGallery";
import ColorLabPictureProfilePanel from "@/components/color-lab/ColorLabPictureProfilePanel";
import ColorLabRecipeLibraryRail from "@/components/color-lab/ColorLabRecipeLibraryRail";
import TransferToCameraCard from "@/components/color-lab/TransferToCameraCard";
import {
  filterColorLabRecipes,
  getColorLabCameraLineOptions,
  getColorLabProfileOptions,
  getColorLabRecipePhotos,
} from "@/lib/color-lab/helpers";
import { buildColorLabHref } from "@/lib/color-lab/search-params";
import type {
  ColorLabLoadState,
  ColorLabPhoto,
  ColorLabRecipe,
} from "@/types/color-lab";

interface ColorLabExperienceProps {
  initialCameraLine?: string;
  initialProfile?: string;
  initialQuery?: string;
  loadState: ColorLabLoadState;
  photos: ColorLabPhoto[];
  recipes: ColorLabRecipe[];
  source: "supabase" | "seed";
}

export default function ColorLabExperience({
  initialCameraLine,
  initialProfile,
  initialQuery,
  loadState,
  photos,
  recipes,
  source,
}: ColorLabExperienceProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [cameraLine, setCameraLine] = useState(initialCameraLine ?? "");
  const [profile, setProfile] = useState(initialProfile ?? "");
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? "");
  const deferredQuery = useDeferredValue(query);
  const cameraLineOptions = useMemo(() => {
    return getColorLabCameraLineOptions(recipes);
  }, [recipes]);
  const profileOptions = useMemo(() => {
    return getColorLabProfileOptions(recipes);
  }, [recipes]);
  const filteredRecipes = useMemo(() => {
    return filterColorLabRecipes(recipes, {
      cameraLine: cameraLine || undefined,
      profile: profile || undefined,
      q: deferredQuery,
    });
  }, [cameraLine, deferredQuery, profile, recipes]);

  useEffect(() => {
    const normalizedQuery = deferredQuery.trim();
    const currentQuery = initialQuery ?? "";
    const currentCameraLine = initialCameraLine ?? "";
    const currentProfile = initialProfile ?? "";

    if (
      normalizedQuery === currentQuery &&
      cameraLine === currentCameraLine &&
      profile === currentProfile
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextHref = buildColorLabHref({
        cameraLine: cameraLine || undefined,
        profile: profile || undefined,
        q: normalizedQuery || undefined,
      });

      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [
    cameraLine,
    deferredQuery,
    initialCameraLine,
    initialProfile,
    initialQuery,
    profile,
    router,
  ]);
  const activeSelectedRecipeId = filteredRecipes.some((recipe) => {
    return recipe.id === selectedRecipeId;
  })
    ? selectedRecipeId
    : (filteredRecipes[0]?.id ?? recipes[0]?.id ?? "");
  const selectedRecipe =
    filteredRecipes.find((recipe) => recipe.id === activeSelectedRecipeId) ??
    filteredRecipes[0] ??
    recipes[0];
  const previewPhotos = selectedRecipe
    ? getColorLabRecipePhotos(photos, selectedRecipe)
    : [];
  const loadStateLabel =
    loadState === "live"
      ? "Live"
      : loadState === "seeded-fallback"
        ? "Seed Fallback"
        : "Degraded";

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[radial-gradient(circle_at_top_left,_rgba(208,156,48,0.18),_transparent_34%),linear-gradient(135deg,var(--surface),var(--surface-alt))] p-6 shadow-sm">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_420px] 2xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Color Lab Runtime
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] lg:text-5xl">
              Recipe library cho color science của Sony
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Runtime mới đọc typed contracts thật, gắn gallery đúng recipe, đồng bộ
              filter với URL và tách riêng các behavior legacy còn hữu ích thành component
              độc lập.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/85 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Recipes
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {recipes.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/85 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Preview Photos
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {photos.length}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/85 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Runtime State
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {loadStateLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Runtime Filters
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
              Tìm đúng recipe theo query, camera line và profile
            </h2>
          </div>
          <div className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
            URL synced
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Camera line
            </span>
            <select
              value={cameraLine}
              onChange={(event) => setCameraLine(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
            >
              <option value="">Tất cả camera lines</option>
              {cameraLineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Base profile
            </span>
            <select
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
            >
              <option value="">Tất cả profiles</option>
              {profileOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              Visible Recipes
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {filteredRecipes.length}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Filter thay đổi sẽ được phản ánh ngay vào URL của `/color-lab`.
            </p>
          </div>
        </div>
      </section>

      {loadState === "seeded-fallback" ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          Color Lab đang dùng seed fallback vì source thật chưa có recipe nào. Sau khi thêm
          dữ liệu vào Supabase, runtime này sẽ tự chuyển sang live content.
        </section>
      ) : null}

      {loadState === "degraded" ? (
        <section className="rounded-2xl border border-[var(--danger)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]">
          Public source của Color Lab đang lỗi hoặc timeout, nên runtime đang hiển thị
          seed fallback để không chặn review nội bộ. Hãy kiểm tra lại Supabase hoặc cache
          invalidation nếu trạng thái này kéo dài.
        </section>
      ) : null}

      {selectedRecipe ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px] 2xl:grid-cols-[340px_minmax(0,1fr)_380px]">
            <ColorLabRecipeLibraryRail
              query={query}
              recipes={filteredRecipes}
              selectedRecipeId={activeSelectedRecipeId}
              onQueryChange={setQuery}
              onSelectRecipe={setSelectedRecipeId}
            />
            <ColorLabPhotoMasonryGallery
              photos={previewPhotos}
              recipe={selectedRecipe}
              source={source}
            />
            <div className="space-y-6">
              <ColorLabPictureProfilePanel recipe={selectedRecipe} />
              <TransferToCameraCard />
            </div>
          </div>

          <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                  Workflow Note
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                  Runtime mới giữ lại những behavior hữu ích của ref cũ
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                  Gallery giờ bám đúng recipe, filter state đi theo URL, lightbox quay lại
                  cho review ảnh lớn và transfer guide được giữ riêng thành một card độc lập
                  để không kéo theo kiến trúc legacy.
                </p>
              </div>
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] px-5 py-4 text-sm text-[var(--foreground)]">
                Internal production focus: live data, storage-backed photos, compatibility
                notes và operator-friendly admin workflow.
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-semibold text-[var(--foreground)]">
            Không có recipe nào khớp bộ lọc hiện tại.
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Hãy nới filter hoặc bổ sung dữ liệu vào source `Color Lab`.
          </p>
        </section>
      )}
    </div>
  );
}
