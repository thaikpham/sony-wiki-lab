"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getColorLabPhotoEditorValue } from "@/lib/color-lab/admin-helpers";
import type {
  ColorLabPhoto,
  ColorLabPhotoEditorValue,
  ColorLabRecipe,
} from "@/types/color-lab";

interface EditablePhotoDraft extends ColorLabPhotoEditorValue {
  id: string;
  storagePath: string;
  url: string;
}

interface UploadDraft {
  file: File | null;
  previewUrl: string | null;
  recipeId: string;
  caption: string;
  sortOrder: number;
}

interface ColorLabPhotoManagerModalProps {
  errorMessage?: string | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onCreate: (value: FormData) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onUpdate: (value: ColorLabPhotoEditorValue) => void | Promise<void>;
  photos: ColorLabPhoto[];
  recipes: ColorLabRecipe[];
}

function buildNextSortOrder(photos: ColorLabPhoto[]) {
  const highestSortOrder = photos.reduce((highest, photo) => {
    return photo.sortOrder > highest ? photo.sortOrder : highest;
  }, 0);

  return highestSortOrder + 10;
}

function buildEditablePhotoDrafts(photos: ColorLabPhoto[]): EditablePhotoDraft[] {
  return photos.map((photo) => ({
    ...getColorLabPhotoEditorValue(photo),
    id: photo.id,
    storagePath: photo.storagePath,
    url: photo.url,
  }));
}

function buildUploadDraft(
  recipeId: string,
  sortOrder: number
): UploadDraft {
  return {
    caption: "",
    file: null,
    previewUrl: null,
    recipeId,
    sortOrder,
  };
}

export default function ColorLabPhotoManagerModal({
  errorMessage,
  isOpen,
  isSaving,
  onClose,
  onCreate,
  onDelete,
  onUpdate,
  photos,
  recipes,
}: ColorLabPhotoManagerModalProps) {
  const defaultRecipeId = recipes[0]?.id ?? "";
  const defaultSortOrder = useMemo(() => buildNextSortOrder(photos), [photos]);
  const initialDrafts = useMemo(() => buildEditablePhotoDrafts(photos), [photos]);
  const initialUploadDraft = useMemo(() => {
    return buildUploadDraft(defaultRecipeId, defaultSortOrder);
  }, [defaultRecipeId, defaultSortOrder]);
  const [newDraft, setNewDraft] = useState<UploadDraft>(() => initialUploadDraft);
  const [drafts, setDrafts] = useState<EditablePhotoDraft[]>(() => initialDrafts);

  useEffect(() => {
    return () => {
      if (newDraft.previewUrl) {
        URL.revokeObjectURL(newDraft.previewUrl);
      }
    };
  }, [newDraft.previewUrl]);

  if (!isOpen) {
    return null;
  }

  const updateDraft = (
    id: string,
    key: keyof ColorLabPhotoEditorValue,
    value: string | number
  ) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, [key]: value } : draft))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-8">
      <div className="w-full max-w-6xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Color Lab Admin
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              Quản lý preview photos
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          >
            Đóng
          </button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {errorMessage ? (
            <div className="rounded-2xl border border-[var(--danger)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
              {errorMessage}
            </div>
          ) : null}

          <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Upload photo mới
            </h3>
            <form
              className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.7fr]"
              onSubmit={(event) => {
                event.preventDefault();

                if (!newDraft.file) {
                  return;
                }

                const formData = new FormData();
                formData.set("file", newDraft.file);
                formData.set("recipeId", newDraft.recipeId);
                formData.set("caption", newDraft.caption);
                formData.set("sortOrder", String(newDraft.sortOrder));
                void onCreate(formData);
              }}
            >
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Image file</span>
                <input
                  required
                  accept="image/*"
                  type="file"
                  onChange={(event) =>
                    setNewDraft((current) => {
                      const nextFile = event.target.files?.[0] ?? null;

                      if (current.previewUrl) {
                        URL.revokeObjectURL(current.previewUrl);
                      }

                      return {
                        ...current,
                        file: nextFile,
                        previewUrl: nextFile ? URL.createObjectURL(nextFile) : null,
                      };
                    })
                  }
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                />
                {newDraft.previewUrl ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-[var(--border)]">
                    <Image
                      src={newDraft.previewUrl}
                      alt="Preview file upload"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </label>

              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Recipe</span>
                  <select
                    required
                    value={newDraft.recipeId}
                    onChange={(event) =>
                      setNewDraft((current) => ({
                        ...current,
                        recipeId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  >
                    <option value="" disabled>
                      Chọn recipe
                    </option>
                    {recipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Sort order</span>
                  <input
                    min={0}
                    required
                    type="number"
                    value={newDraft.sortOrder}
                    onChange={(event) =>
                      setNewDraft((current) => ({
                        ...current,
                        sortOrder: Number(event.target.value || 0),
                      }))
                    }
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  />
                </label>
              </div>

              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Caption</span>
                  <input
                    required
                    value={newDraft.caption}
                    onChange={(event) =>
                      setNewDraft((current) => ({
                        ...current,
                        caption: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                    placeholder="Portrait — f/2.0 1/125s ISO 400"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSaving || !newDraft.file || !newDraft.recipeId}
                    className="w-full rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSaving ? "Đang upload..." : "Upload photo"}
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="space-y-4">
            {drafts.map((draft) => (
              <form
                key={draft.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onUpdate(draft);
                }}
              >
                <div className="grid gap-4 xl:grid-cols-[220px_1fr_auto]">
                  <div className="space-y-3">
                    <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-[var(--border)]">
                      <Image
                        src={draft.url}
                        alt={draft.caption}
                        fill
                        unoptimized
                        sizes="220px"
                        className="object-cover"
                      />
                    </div>
                    <p className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                      {draft.storagePath || "Legacy URL"}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">Recipe</span>
                      <select
                        value={draft.recipeId}
                        onChange={(event) =>
                          updateDraft(draft.id, "recipeId", event.target.value)
                        }
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      >
                        {recipes.map((recipe) => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">Sort order</span>
                      <input
                        min={0}
                        type="number"
                        value={draft.sortOrder}
                        onChange={(event) =>
                          updateDraft(draft.id, "sortOrder", Number(event.target.value || 0))
                        }
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">Caption</span>
                      <input
                        value={draft.caption}
                        onChange={(event) =>
                          updateDraft(draft.id, "caption", event.target.value)
                        }
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      />
                    </label>
                  </div>

                  <div className="flex items-end gap-2 xl:flex-col xl:justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40 xl:w-full"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        if (window.confirm("Xóa preview photo này?")) {
                          void onDelete(draft.id);
                        }
                      }}
                      className="rounded-2xl border border-[var(--danger)] px-4 py-3 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 disabled:cursor-not-allowed disabled:opacity-40 xl:w-full"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </form>
            ))}

            {drafts.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                Chưa có preview photo nào.
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
