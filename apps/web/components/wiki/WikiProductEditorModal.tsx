"use client";

import { useState } from "react";
import { uploadWikiMediaFile } from "@/lib/wiki/admin-client";
import WikiProductImage from "@/components/wiki/WikiProductImage";
import {
  createEmptySpecGroup,
  parseGalleryInput,
  slugifyWikiValue,
  stringifyGalleryInput,
} from "@/lib/wiki/admin-helpers";
import type {
  WikiCategory,
  WikiProductEditorValue,
  WikiSpecEntry,
} from "@/types/wiki";

interface WikiProductEditorModalProps {
  categories: WikiCategory[];
  initialValue: WikiProductEditorValue;
  isOpen: boolean;
  isSaving: boolean;
  mode: "create" | "edit";
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (value: WikiProductEditorValue) => void | Promise<void>;
}

function buildEmptySpecEntry(): WikiSpecEntry {
  return {
    label: "",
    value: "",
  };
}

export default function WikiProductEditorModal({
  categories,
  initialValue,
  isOpen,
  isSaving,
  mode,
  errorMessage,
  onClose,
  onSubmit,
}: WikiProductEditorModalProps) {
  const [draft, setDraft] = useState(initialValue);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const updateDraft = <Key extends keyof WikiProductEditorValue>(
    key: Key,
    value: WikiProductEditorValue[Key]
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const uploadProductSlug = draft.slug.trim() || draft.name.trim();

  const removeGalleryImage = (index: number) => {
    setDraft((current) => ({
      ...current,
      gallery: current.gallery.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  async function handleMainImageUpload(fileList: FileList | null) {
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    setIsUploadingMainImage(true);
    setLocalErrorMessage(null);

    try {
      const upload = await uploadWikiMediaFile(file, {
        productSlug: uploadProductSlug,
        variant: "main-image",
      });

      updateDraft("mainImage", upload.url);
    } catch (error) {
      setLocalErrorMessage(
        error instanceof Error ? error.message : "Không thể upload ảnh chính."
      );
    } finally {
      setIsUploadingMainImage(false);
    }
  }

  async function handleGalleryUpload(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);

    if (files.length === 0) {
      return;
    }

    setIsUploadingGallery(true);
    setLocalErrorMessage(null);

    try {
      const uploads = await Promise.all(
        files.map((file) =>
          uploadWikiMediaFile(file, {
            productSlug: uploadProductSlug,
            variant: "gallery",
          })
        )
      );

      setDraft((current) => ({
        ...current,
        gallery: [...current.gallery, ...uploads.map((upload) => upload.url)],
      }));
    } catch (error) {
      setLocalErrorMessage(
        error instanceof Error ? error.message : "Không thể upload gallery images."
      );
    } finally {
      setIsUploadingGallery(false);
    }
  }

  const updateSpecGroupName = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      specGroups: current.specGroups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, group: value } : group
      ),
    }));
  };

  const addSpecGroup = () => {
    setDraft((current) => ({
      ...current,
      specGroups: [
        ...current.specGroups,
        createEmptySpecGroup(`Nhóm ${current.specGroups.length + 1}`),
      ],
    }));
  };

  const removeSpecGroup = (index: number) => {
    setDraft((current) => ({
      ...current,
      specGroups: current.specGroups.filter((_, groupIndex) => groupIndex !== index),
    }));
  };

  const addSpecEntry = (groupIndex: number) => {
    setDraft((current) => ({
      ...current,
      specGroups: current.specGroups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? { ...group, specs: [...group.specs, buildEmptySpecEntry()] }
          : group
      ),
    }));
  };

  const updateSpecEntry = (
    groupIndex: number,
    specIndex: number,
    key: keyof WikiSpecEntry,
    value: string
  ) => {
    setDraft((current) => ({
      ...current,
      specGroups: current.specGroups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              specs: group.specs.map((spec, currentSpecIndex) =>
                currentSpecIndex === specIndex ? { ...spec, [key]: value } : spec
              ),
            }
          : group
      ),
    }));
  };

  const removeSpecEntry = (groupIndex: number, specIndex: number) => {
    setDraft((current) => ({
      ...current,
      specGroups: current.specGroups.map((group, currentGroupIndex) =>
        currentGroupIndex === groupIndex
          ? {
              ...group,
              specs: group.specs.filter((_, currentSpecIndex) => currentSpecIndex !== specIndex),
            }
          : group
      ),
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-5xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiki-product-editor-title"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(draft);
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Wiki Admin
              </p>
              <h2
                id="wiki-product-editor-title"
                className="mt-2 text-2xl font-semibold text-[var(--foreground)]"
              >
                {mode === "create" ? "Tạo sản phẩm mới" : "Chỉnh sửa sản phẩm"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Mọi thay đổi sẽ ghi trực tiếp vào Supabase bằng typed admin route.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSaving ? "Đang lưu..." : mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            {errorMessage ? (
              <div className="rounded-2xl border border-[var(--danger)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
                {errorMessage}
              </div>
            ) : null}

            {localErrorMessage ? (
              <div className="rounded-2xl border border-[var(--danger)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
                {localErrorMessage}
              </div>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Tên sản phẩm</span>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="Sony Alpha 7 IV"
                />
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--foreground)]">Slug</span>
                  <button
                    type="button"
                    onClick={() => updateDraft("slug", slugifyWikiValue(draft.name))}
                    className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                  >
                    Tạo từ tên
                  </button>
                </div>
                <input
                  value={draft.slug}
                  onChange={(event) => updateDraft("slug", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="sony-alpha-7-iv"
                />
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Danh mục</span>
                <select
                  value={draft.categoryId ?? ""}
                  onChange={(event) =>
                    updateDraft("categoryId", event.target.value || null)
                  }
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                >
                  <option value="">Chưa gán danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Subcategory</span>
                <input
                  value={draft.subcategory}
                  onChange={(event) => updateDraft("subcategory", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="Cinema Line, G Master, Microphone..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Ảnh chính</span>
                <input
                  value={draft.mainImage}
                  onChange={(event) => updateDraft("mainImage", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="https://..."
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const { files } = event.currentTarget;
                        void handleMainImageUpload(files);
                        event.currentTarget.value = "";
                      }}
                    />
                    {isUploadingMainImage ? "Đang upload..." : "Upload ảnh chính"}
                  </label>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Có thể upload vào storage hoặc dán URL thủ công.
                  </span>
                </div>
                {draft.mainImage ? (
                  <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                    <WikiProductImage
                      alt="Wiki main preview"
                      className="h-40 w-full"
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      src={draft.mainImage}
                    />
                  </div>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Price (VND)</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={draft.priceVnd ?? ""}
                  onChange={(event) =>
                    updateDraft(
                      "priceVnd",
                      event.target.value ? Number(event.target.value) : null
                    )
                  }
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="59990000"
                />
              </label>

              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Buy link</span>
                <input
                  value={draft.buyLink}
                  onChange={(event) => updateDraft("buyLink", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="https://www.sony.com/..."
                />
              </label>

              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Mô tả ngắn</span>
                <textarea
                  value={draft.shortDescription}
                  onChange={(event) => updateDraft("shortDescription", event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="Mô tả ngắn xuất hiện ở card listing và search."
                />
              </label>

              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Mô tả chi tiết</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => updateDraft("description", event.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder="Mô tả dài cho trang chi tiết."
                />
              </label>

              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Gallery images
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        const { files } = event.currentTarget;
                        void handleGalleryUpload(files);
                        event.currentTarget.value = "";
                      }}
                    />
                    {isUploadingGallery ? "Đang upload..." : "Upload gallery"}
                  </label>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    Upload nhiều ảnh hoặc nhập URL mỗi dòng như trước.
                  </span>
                </div>
                <textarea
                  value={stringifyGalleryInput(draft.gallery)}
                  onChange={(event) =>
                    updateDraft("gallery", parseGalleryInput(event.target.value))
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-0 placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                  placeholder={"Mỗi dòng là một URL ảnh\nhttps://...\nhttps://..."}
                />
                {draft.gallery.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {draft.gallery.map((imageUrl, index) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
                      >
                        <WikiProductImage
                          alt={`Gallery preview ${index + 1}`}
                          className="h-32 w-full"
                          sizes="(min-width: 1280px) 20vw, (min-width: 640px) 45vw, 100vw"
                          src={imageUrl}
                        />
                        <div className="flex items-center justify-between gap-3 px-3 py-2">
                          <p className="truncate text-xs text-[var(--muted-foreground)]">
                            Image {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </label>

              <label className="inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={draft.isPublished}
                  onChange={(event) => updateDraft("isPublished", event.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)]"
                />
                Publish sản phẩm ngay sau khi lưu
              </label>
            </section>

            <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Spec groups
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Chuẩn hóa theo contract `WikiSpecGroup[]`, tránh lưu JSON động không kiểm soát.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSpecGroup}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                >
                  Thêm nhóm spec
                </button>
              </div>

              {draft.specGroups.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  Chưa có spec group. Hãy thêm ít nhất một nhóm để nội dung detail dễ so sánh.
                </div>
              ) : null}

              <div className="space-y-4">
                {draft.specGroups.map((group, groupIndex) => (
                  <div
                    key={`${group.group}-${groupIndex}`}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        value={group.group}
                        onChange={(event) =>
                          updateSpecGroupName(groupIndex, event.target.value)
                        }
                        className="min-w-[240px] flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                        placeholder="Tên nhóm"
                      />
                      <button
                        type="button"
                        onClick={() => addSpecEntry(groupIndex)}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                      >
                        Thêm spec
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSpecGroup(groupIndex)}
                        className="rounded-xl border border-[var(--danger)] px-3 py-2 text-xs font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10"
                      >
                        Xóa nhóm
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {group.specs.map((spec, specIndex) => (
                        <div
                          key={`${group.group}-${specIndex}`}
                          className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr_auto]"
                        >
                          <input
                            value={spec.label}
                            onChange={(event) =>
                              updateSpecEntry(
                                groupIndex,
                                specIndex,
                                "label",
                                event.target.value
                              )
                            }
                            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                            placeholder="Label"
                          />
                          <input
                            value={spec.value}
                            onChange={(event) =>
                              updateSpecEntry(
                                groupIndex,
                                specIndex,
                                "value",
                                event.target.value
                              )
                            }
                            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                            placeholder="Value"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpecEntry(groupIndex, specIndex)}
                            className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
