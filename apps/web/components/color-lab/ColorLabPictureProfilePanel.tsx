"use client";

import {
  buildColorLabBadgeStyle,
  formatColorLabCreatedAt,
} from "@/components/color-lab/presentation";
import type { ColorLabRecipe } from "@/types/color-lab";

const MAIN_SETTING_ROWS = [
  ["White Balance", "whiteBalance"],
  ["Black Level", "blackLevel"],
  ["Gamma", "gamma"],
  ["Black Gamma", "blackGamma"],
  ["Knee", "knee"],
  ["Color Mode", "colorMode"],
  ["Saturation", "saturation"],
  ["Color Phase", "colorPhase"],
] as const;

const COLOR_DEPTH_KEYS = ["R", "G", "B", "C", "M", "Y"] as const;

const DETAIL_KEYS = [
  ["Level", "level"],
  ["Mode", "mode"],
  ["VH Balance", "vhBalance"],
  ["B/W Balance", "bwBalance"],
  ["Limit", "limit"],
  ["Crispening", "crispening"],
  ["Hilight Detail", "hlLightDetail"],
] as const;

interface ColorLabPictureProfilePanelProps {
  recipe: ColorLabRecipe;
}

export default function ColorLabPictureProfilePanel({
  recipe,
}: ColorLabPictureProfilePanelProps) {
  return (
    <aside className="self-start rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm xl:sticky xl:top-[calc(var(--layout-header-height)+1.25rem)]">
      <div className="rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface-alt),var(--surface))] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
          Picture Profile Settings
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
          {recipe.baseProfile}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Bản compact để xem trọn bộ thông số nhanh hơn, không cần cuộn thêm bên trong
          panel.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium"
            style={buildColorLabBadgeStyle(recipe)}
          >
            {recipe.color.name}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] text-[var(--muted-foreground)]">
            {recipe.author}
          </span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] text-[var(--muted-foreground)]">
            {formatColorLabCreatedAt(recipe.createdAt)}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Main Settings
            </p>
            <h3 className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
              Core picture profile
            </h3>
          </div>

          <dl className="mt-3 space-y-1.5">
            {MAIN_SETTING_ROWS.map(([label, key]) => (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-[var(--border)]/70 py-2 last:border-b-0 last:pb-0 first:pt-0"
              >
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  {label}
                </dt>
                <dd className="text-right text-sm font-medium text-[var(--foreground)]">
                  {recipe.settings[key]}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Color Depth
            </p>
            <h3 className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
              RGB + CMY balance
            </h3>
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2">
            {COLOR_DEPTH_KEYS.map((key) => (
              <div key={key} className="min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  {key}
                </dt>
                <dd className="mt-1 text-base font-semibold tabular-nums text-[var(--foreground)]">
                  {recipe.settings.colorDepth[key]}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Detail Controls
            </p>
            <h3 className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
              Sharpening và micro-contrast
            </h3>
          </div>

          <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2 xl:grid-cols-2">
            {DETAIL_KEYS.map(([label, key]) => (
              <div
                key={key}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-[var(--border)]/70 pb-2"
              >
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  {label}
                </dt>
                <dd className="text-right text-sm font-semibold text-[var(--foreground)]">
                  {recipe.settings.detail[key]}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Compatibility
            </p>
            <h3 className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
              Camera line và vận hành thực tế
            </h3>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {recipe.cameraLines.length > 0 ? (
              recipe.cameraLines.map((cameraLine) => (
                <span
                  key={`${recipe.id}-${cameraLine}`}
                  className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] text-[var(--foreground)]"
                >
                  {cameraLine}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[11px] text-[var(--muted-foreground)]">
                Chưa khai báo camera line
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            {recipe.compatibilityNotes || "Chưa có compatibility notes cho recipe này."}
          </p>
        </section>
      </div>
    </aside>
  );
}
