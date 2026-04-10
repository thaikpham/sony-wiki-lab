"use client";

import { useState } from "react";
import {
  getEmptyColorLabRecipeEditorValue,
  parseColorLabTags,
  stringifyColorLabTags,
} from "@/lib/color-lab/admin-helpers";
import { COLOR_LAB_PRESETS } from "@/lib/color-lab/data";
import type { ColorLabRecipeEditorValue } from "@/types/color-lab";

interface ColorLabRecipeEditorModalProps {
  errorMessage?: string | null;
  initialValue: ColorLabRecipeEditorValue;
  isOpen: boolean;
  isSaving: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: (value: ColorLabRecipeEditorValue) => void | Promise<void>;
}

const MAIN_SETTING_FIELDS = [
  ["White Balance", "whiteBalance"],
  ["Black Level", "blackLevel"],
  ["Gamma", "gamma"],
  ["Black Gamma", "blackGamma"],
  ["Knee", "knee"],
  ["Color Mode", "colorMode"],
  ["Saturation", "saturation"],
  ["Color Phase", "colorPhase"],
] as const;

const COLOR_DEPTH_FIELDS = ["R", "G", "B", "C", "M", "Y"] as const;
const DETAIL_FIELDS = [
  ["Level", "level"],
  ["Mode", "mode"],
  ["VH Balance", "vhBalance"],
  ["B/W Balance", "bwBalance"],
  ["Limit", "limit"],
  ["Crispening", "crispening"],
  ["Hilight Detail", "hlLightDetail"],
] as const;

export default function ColorLabRecipeEditorModal({
  errorMessage,
  initialValue,
  isOpen,
  isSaving,
  mode,
  onClose,
  onSubmit,
}: ColorLabRecipeEditorModalProps) {
  const [draft, setDraft] = useState(initialValue);

  if (!isOpen) {
    return null;
  }

  const updateDraft = <Key extends keyof ColorLabRecipeEditorValue>(
    key: Key,
    value: ColorLabRecipeEditorValue[Key]
  ) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetDraft = () => {
    setDraft(getEmptyColorLabRecipeEditorValue());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-8">
      <div className="w-full max-w-6xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit(draft);
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Color Lab Admin
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {mode === "create" ? "Tạo recipe mới" : "Chỉnh sửa recipe"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Editor này giữ nguyên contract `ColorLabRecipeSettings` và bổ sung thêm
                compatibility metadata cho workflow nội bộ.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {mode === "create" ? (
                <button
                  type="button"
                  onClick={resetDraft}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                >
                  Reset
                </button>
              ) : null}
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
                {isSaving ? "Đang lưu..." : mode === "create" ? "Tạo recipe" : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            {errorMessage ? (
              <div className="rounded-2xl border border-[var(--danger)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
                {errorMessage}
              </div>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Recipe name</span>
                <input
                  required
                  value={draft.name}
                  onChange={(event) => updateDraft("name", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="Kodak Portra 400"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Base profile</span>
                <input
                  required
                  value={draft.baseProfile}
                  onChange={(event) => updateDraft("baseProfile", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="PP8 (S-Log3)"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Author</span>
                <input
                  required
                  value={draft.author}
                  onChange={(event) => updateDraft("author", event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="@creator"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">Tags</span>
                <textarea
                  value={stringifyColorLabTags(draft.tags)}
                  onChange={(event) =>
                    updateDraft("tags", parseColorLabTags(event.target.value))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="Film, Warm, Portrait"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Camera lines
                </span>
                <textarea
                  value={stringifyColorLabTags(draft.cameraLines)}
                  onChange={(event) =>
                    updateDraft("cameraLines", parseColorLabTags(event.target.value))
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="Alpha, FX, Cinema Line"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Compatibility notes
                </span>
                <textarea
                  value={draft.compatibilityNotes}
                  onChange={(event) =>
                    updateDraft("compatibilityNotes", event.target.value)
                  }
                  rows={3}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="Body nào chạy ổn, điểm cần chú ý khi dùng recipe này..."
                />
              </label>
            </section>

            <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Preset palette
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Swatch palette được giữ lại từ ref cũ để operator chọn nhanh tone nền.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {COLOR_LAB_PRESETS.map((preset) => {
                  const isSelected =
                    preset.hex.toLowerCase() === draft.colorHex.trim().toLowerCase();

                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        updateDraft("colorName", preset.name);
                        updateDraft("colorHex", preset.hex);
                      }}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                        isSelected
                          ? "border-[var(--foreground)] bg-[var(--surface)] text-[var(--foreground)]"
                          : "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border"
                        style={{
                          backgroundColor: preset.hex,
                          borderColor: `${preset.hex}88`,
                        }}
                      />
                      {preset.name}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1fr]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Color name</span>
                  <input
                    required
                    value={draft.colorName}
                    onChange={(event) => updateDraft("colorName", event.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                    placeholder="Amber"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--foreground)]">Hex</span>
                  <div className="flex items-center gap-3">
                    <input
                      required
                      value={draft.colorHex}
                      onChange={(event) => updateDraft("colorHex", event.target.value)}
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      placeholder="#d09c30"
                    />
                    <span
                      className="h-12 w-12 rounded-2xl border border-[var(--border)]"
                      style={{ backgroundColor: draft.colorHex || "#d09c30" }}
                    />
                  </div>
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Main settings
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Các trường này map 1:1 với public settings panel.
                </p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {MAIN_SETTING_FIELDS.map(([label, key]) => (
                  <label key={key} className="space-y-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {label}
                    </span>
                    <input
                      value={draft.settings[key]}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          settings: {
                            ...current.settings,
                            [key]: event.target.value,
                          },
                        }))
                      }
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Color depth
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {COLOR_DEPTH_FIELDS.map((key) => (
                    <label key={key} className="space-y-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {key}
                      </span>
                      <input
                        value={draft.settings.colorDepth[key]}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            settings: {
                              ...current.settings,
                              colorDepth: {
                                ...current.settings.colorDepth,
                                [key]: event.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
                <h3 className="text-lg font-semibold text-[var(--foreground)]">
                  Detail controls
                </h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {DETAIL_FIELDS.map(([label, key]) => (
                    <label key={key} className="space-y-2">
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {label}
                      </span>
                      <input
                        value={draft.settings.detail[key]}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            settings: {
                              ...current.settings,
                              detail: {
                                ...current.settings.detail,
                                [key]: event.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
