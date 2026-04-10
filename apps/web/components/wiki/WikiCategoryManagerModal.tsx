"use client";

import { useState } from "react";
import {
  getEmptyWikiCategoryEditorValue,
  slugifyWikiValue,
} from "@/lib/wiki/admin-helpers";
import type { WikiCategory, WikiCategoryEditorValue } from "@/types/wiki";

interface WikiCategoryManagerModalProps {
  categories: WikiCategory[];
  isOpen: boolean;
  isSaving: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onCreate: (value: WikiCategoryEditorValue) => void | Promise<void>;
  onUpdate: (value: WikiCategoryEditorValue) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
}

interface EditableCategoryDraft extends WikiCategoryEditorValue {
  id: string;
}

export default function WikiCategoryManagerModal({
  categories,
  isOpen,
  isSaving,
  errorMessage,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: WikiCategoryManagerModalProps) {
  const [newDraft, setNewDraft] = useState(getEmptyWikiCategoryEditorValue());
  const [drafts, setDrafts] = useState<EditableCategoryDraft[]>(
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
    }))
  );

  if (!isOpen) {
    return null;
  }

  const updateNewDraft = <Key extends keyof WikiCategoryEditorValue>(
    key: Key,
    value: WikiCategoryEditorValue[Key]
  ) => {
    setNewDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateDraft = (
    id: string,
    key: keyof WikiCategoryEditorValue,
    value: string
  ) => {
    setDrafts((current) =>
      current.map((draft) => (draft.id === id ? { ...draft, [key]: value } : draft))
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiki-category-manager-title"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Wiki Admin
            </p>
            <h2
              id="wiki-category-manager-title"
              className="mt-2 text-2xl font-semibold text-[var(--foreground)]"
            >
              Quản lý danh mục
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Danh mục được quản lý riêng để product editor luôn dùng được select typed và đồng bộ.
            </p>
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Tạo danh mục mới
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Dùng slug ngắn gọn để filter và search link ổn định.
                </p>
              </div>
            </div>

            <form
              className="mt-4 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void onCreate(newDraft);
              }}
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Tên</span>
                  <input
                    value={newDraft.name}
                    onChange={(event) => updateNewDraft("name", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                    placeholder="Mirrorless Cameras"
                  />
                </label>
                <label className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--foreground)]">Slug</span>
                    <button
                      type="button"
                      onClick={() => updateNewDraft("slug", slugifyWikiValue(newDraft.name))}
                      className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                    >
                      Tạo từ tên
                    </button>
                  </div>
                  <input
                    value={newDraft.slug}
                    onChange={(event) => updateNewDraft("slug", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                    placeholder="mirrorless-cameras"
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSaving ? "Đang lưu..." : "Tạo danh mục"}
                  </button>
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Mô tả</span>
                <textarea
                  value={newDraft.description}
                  onChange={(event) => updateNewDraft("description", event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="Mô tả ngắn cho search và category filter."
                />
              </label>
            </form>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                Danh mục hiện có
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Khi xóa danh mục đang được product tham chiếu, Supabase sẽ trả lỗi để tránh mất liên kết.
              </p>
            </div>

            <div className="space-y-4">
              {drafts.map((draft) => (
                <form
                  key={draft.id}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onUpdate(draft);
                  }}
                >
                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">Tên</span>
                      <input
                        value={draft.name}
                        onChange={(event) => updateDraft(draft.id, "name", event.target.value)}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      />
                    </label>
                    <label className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[var(--foreground)]">Slug</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft(draft.id, "slug", slugifyWikiValue(draft.name))
                          }
                          className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
                        >
                          Tạo từ tên
                        </button>
                      </div>
                      <input
                        value={draft.slug}
                        onChange={(event) => updateDraft(draft.id, "slug", event.target.value)}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      />
                    </label>

                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Xóa danh mục "${draft.name}"? Hành động này có thể thất bại nếu còn sản phẩm tham chiếu.`
                            )
                          ) {
                            void onDelete(draft.id);
                          }
                        }}
                        disabled={isSaving}
                        className="rounded-2xl border border-[var(--danger)] px-4 py-3 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">Mô tả</span>
                    <textarea
                      value={draft.description}
                      onChange={(event) =>
                        updateDraft(draft.id, "description", event.target.value)
                      }
                      rows={3}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                    />
                  </label>
                </form>
              ))}

              {drafts.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  Chưa có category nào trong catalog.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
