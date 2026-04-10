"use client";

import {
  buildColorLabBadgeStyle,
  formatColorLabCreatedAt,
} from "@/components/color-lab/presentation";
import type { ColorLabRecipe } from "@/types/color-lab";

interface ColorLabRecipeLibraryRailProps {
  query: string;
  recipes: ColorLabRecipe[];
  selectedRecipeId?: string;
  onQueryChange: (value: string) => void;
  onSelectRecipe: (id: string) => void;
}

export default function ColorLabRecipeLibraryRail({
  query,
  recipes,
  selectedRecipeId,
  onQueryChange,
  onSelectRecipe,
}: ColorLabRecipeLibraryRailProps) {
  return (
    <aside className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm xl:sticky xl:top-[calc(var(--layout-header-height)+1.25rem)] xl:max-h-[calc(100vh-6.5rem)] xl:overflow-y-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
            Recipe Library
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
            Chọn look
          </h2>
        </div>
        <div className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
          {recipes.length} recipes
        </div>
      </div>

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-[var(--foreground)]">
          Tìm recipe
        </span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
          placeholder="Portra, HLG2, @creator..."
        />
      </label>

      <div className="mt-5 space-y-3">
        {recipes.map((recipe) => {
          const selected = recipe.id === selectedRecipeId;

          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onSelectRecipe(recipe.id)}
              className={`w-full rounded-3xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-[var(--foreground)] bg-[var(--surface-alt)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {recipe.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {recipe.baseProfile}
                  </p>
                </div>
                <div
                  className="h-4 w-4 rounded-full border"
                  style={{
                    backgroundColor: recipe.color.hex,
                    borderColor: `${recipe.color.hex}88`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-[var(--text-secondary)]">
                {recipe.author} • {formatColorLabCreatedAt(recipe.createdAt)}
              </p>

              {recipe.cameraLines.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {recipe.cameraLines.map((cameraLine) => (
                    <span
                      key={`${recipe.id}-${cameraLine}`}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]"
                    >
                      {cameraLine}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
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
            </button>
          );
        })}

        {recipes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
            Không tìm thấy recipe phù hợp.
          </div>
        ) : null}
      </div>
    </aside>
  );
}
