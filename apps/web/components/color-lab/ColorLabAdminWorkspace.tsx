"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ColorLabPhotoManagerModal from "@/components/color-lab/ColorLabPhotoManagerModal";
import ColorLabRecipeEditorModal from "@/components/color-lab/ColorLabRecipeEditorModal";
import {
  buildColorLabRecipeColor,
  getColorLabRecipeEditorValue,
  getEmptyColorLabRecipeEditorValue,
} from "@/lib/color-lab/admin-helpers";
import type { ColorLabAdminCatalog } from "@/lib/color-lab/contracts";
import {
  buildJsonHeaders,
  getWikiAdminSession,
  loginWikiAdmin,
  logoutWikiAdmin,
  type WikiAdminSessionState,
} from "@/lib/wiki/admin-client";
import type {
  ColorLabRecipe,
  ColorLabRecipeEditorValue,
} from "@/types/color-lab";

interface AdminJsonError {
  error?: string;
}

interface RecipeEditorState {
  initialValue: ColorLabRecipeEditorValue;
  isOpen: boolean;
  mode: "create" | "edit";
}

async function parseJsonError(response: Response) {
  const payload = (await response.json().catch(() => null)) as AdminJsonError | null;
  return payload?.error ?? "Yêu cầu admin thất bại.";
}

export default function ColorLabAdminWorkspace() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<WikiAdminSessionState | null>(null);
  const [password, setPassword] = useState("");
  const [catalog, setCatalog] = useState<ColorLabAdminCatalog | null>(null);
  const [recipeQuery, setRecipeQuery] = useState("");
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recipeEditorState, setRecipeEditorState] = useState<RecipeEditorState>({
    initialValue: getEmptyColorLabRecipeEditorValue(),
    isOpen: false,
    mode: "create",
  });
  const [isPhotoManagerOpen, setIsPhotoManagerOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    void getWikiAdminSession()
      .then((session) => {
        if (!isCancelled) {
          setAdminSession(session);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setAdminSession(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCheckingAdminSession(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  const loadCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/color-lab/admin/catalog", {
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await parseJsonError(response);

        if (response.status === 401) {
          setAdminSession(null);
          setCatalog(null);
        }

        throw new Error(message);
      }

      const payload = (await response.json()) as ColorLabAdminCatalog;
      setCatalog(payload);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể tải color lab admin catalog."
      );
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    if (!adminSession) {
      setCatalog(null);
      return;
    }

    void loadCatalog();
  }, [adminSession, loadCatalog]);

  async function runAdminMutation(
    path: string,
    options: {
      method: "POST" | "PATCH" | "DELETE";
      body?: FormData | object;
      successMessage: string;
    }
  ) {
    if (!adminSession) {
      setErrorMessage("Phiên admin đã hết hạn. Hãy đăng nhập lại.");
      return false;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const isFormData = options.body instanceof FormData;
      const response = await fetch(path, {
        method: options.method,
        headers:
          options.body && !isFormData ? buildJsonHeaders() : undefined,
        body:
          options.body instanceof FormData
            ? options.body
            : options.body
              ? JSON.stringify(options.body)
              : undefined,
      });

      if (!response.ok) {
        const message = await parseJsonError(response);

        if (response.status === 401) {
          setAdminSession(null);
          setCatalog(null);
        }

        throw new Error(message);
      }

      setStatusMessage(options.successMessage);
      await loadCatalog();
      startTransition(() => {
        router.refresh();
      });
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể thực hiện thao tác color lab admin."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  const filteredRecipes = (catalog?.recipes ?? []).filter((recipe) => {
    const query = recipeQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [
      recipe.name,
      recipe.baseProfile,
      recipe.author,
      recipe.compatibilityNotes,
      ...recipe.tags,
      ...recipe.cameraLines,
    ].some((value) => value.toLowerCase().includes(query));
  });

  const openCreateRecipe = () => {
    setRecipeEditorState({
      initialValue: getEmptyColorLabRecipeEditorValue(),
      isOpen: true,
      mode: "create",
    });
    setErrorMessage(null);
  };

  const openEditRecipe = (recipe: ColorLabRecipe) => {
    setRecipeEditorState({
      initialValue: getColorLabRecipeEditorValue(recipe),
      isOpen: true,
      mode: "edit",
    });
    setErrorMessage(null);
  };

  const closeRecipeEditor = () => {
    setRecipeEditorState((current) => ({
      ...current,
      isOpen: false,
    }));
  };

  return (
    <>
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--foreground)]">
              Color Lab CRUD
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
              Admin workspace cho recipes và preview photos
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              Vertical slice này nối read runtime với write flow thật, dùng cùng session
              admin nội bộ đang có ở `wiki`.
            </p>
          </div>

          {adminSession && catalog ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Recipes
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {catalog.recipes.length}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  Photos
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                  {catalog.photos.length}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 space-y-4">
          {statusMessage ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
              {statusMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="rounded-2xl border border-[var(--danger)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
              {errorMessage}
            </div>
          ) : null}

          {isCheckingAdminSession ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-xs text-[var(--muted-foreground)]">
              Đang kiểm tra phiên admin đã lưu. Bạn vẫn có thể đăng nhập lại thủ công nếu cần.
            </div>
          ) : null}

          {!adminSession ? (
            <form
              className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5 lg:grid-cols-[1fr_auto]"
              onSubmit={async (event) => {
                event.preventDefault();
                const candidate = password.trim();

                if (!candidate) {
                  setErrorMessage("Nhập mật khẩu admin để mở Color Lab CRUD.");
                  return;
                }

                setIsAuthenticating(true);
                setErrorMessage(null);
                setStatusMessage(null);

                try {
                  const session = await loginWikiAdmin(candidate);
                  setAdminSession(session);
                  await loadCatalog();
                  setPassword("");
                  setStatusMessage("Color Lab admin workspace đã sẵn sàng.");
                } catch (error) {
                  setErrorMessage(
                    error instanceof Error ? error.message : "Không thể xác thực admin."
                  );
                } finally {
                  setIsAuthenticating(false);
                }
              }}
            >
              <label className="space-y-2">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  Mật khẩu admin
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                  placeholder="Nhập WIKI_ADMIN_PASSWORD"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
                >
                  {isAuthenticating ? "Đang xác thực..." : "Mở Color Lab CRUD"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (adminSession) {
                        void loadCatalog();
                      }
                    }}
                    disabled={isLoadingCatalog}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isLoadingCatalog ? "Đang tải..." : "Refresh catalog"}
                  </button>
                  <button
                    type="button"
                    onClick={openCreateRecipe}
                    className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90"
                  >
                    Tạo recipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPhotoManagerOpen(true)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  >
                    Quản lý photos
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    void logoutWikiAdmin().catch(() => null);
                    setAdminSession(null);
                    setCatalog(null);
                    setPassword("");
                    setStatusMessage("Đã đóng phiên Color Lab admin.");
                    setErrorMessage(null);
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                >
                  Đăng xuất admin
                </button>
              </div>

              <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      Recipe inventory
                    </h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Chỉnh sửa recipe, camera line, compatibility notes và look preset ở một
                      chỗ.
                    </p>
                  </div>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      Tìm recipe
                    </span>
                    <input
                      value={recipeQuery}
                      onChange={(event) => setRecipeQuery(event.target.value)}
                      className="w-full min-w-[260px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--ring)]"
                      placeholder="Tên, base profile, author, tag, camera line..."
                    />
                  </label>
                </div>

                <div className="mt-4 space-y-3">
                  {filteredRecipes.map((recipe) => (
                    <article
                      key={recipe.id}
                      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="h-4 w-4 rounded-full border"
                              style={{
                                backgroundColor: recipe.color.hex,
                                borderColor: `${recipe.color.hex}88`,
                              }}
                            />
                            <p className="text-base font-semibold text-[var(--foreground)]">
                              {recipe.name}
                            </p>
                            <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
                              {recipe.baseProfile}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            {recipe.author}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {recipe.tags.map((tag) => (
                              <span
                                key={`${recipe.id}-${tag}`}
                                className="rounded-full border px-2.5 py-1 text-[11px]"
                                style={{
                                  borderColor: `${recipe.color.hex}55`,
                                  backgroundColor: `${recipe.color.hex}14`,
                                  color: recipe.color.hex,
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                            {recipe.cameraLines.map((cameraLine) => (
                              <span
                                key={`${recipe.id}-${cameraLine}`}
                                className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]"
                              >
                                {cameraLine}
                              </span>
                            ))}
                          </div>
                          {recipe.compatibilityNotes ? (
                            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                              {recipe.compatibilityNotes}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditRecipe(recipe)}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => {
                              if (window.confirm(`Xóa recipe "${recipe.name}"?`)) {
                                void runAdminMutation(`/api/color-lab/recipes/${recipe.id}`, {
                                  method: "DELETE",
                                  successMessage: `Đã xóa recipe "${recipe.name}".`,
                                });
                              }
                            }}
                            className="rounded-xl border border-[var(--danger)] px-3 py-2 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}

                  {filteredRecipes.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--muted-foreground)]">
                      Không có recipe nào khớp bộ lọc hiện tại.
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>

      <ColorLabRecipeEditorModal
        key={`${recipeEditorState.mode}-${recipeEditorState.initialValue.id ?? "new"}-${recipeEditorState.isOpen ? "open" : "closed"}`}
        errorMessage={errorMessage}
        initialValue={recipeEditorState.initialValue}
        isOpen={recipeEditorState.isOpen}
        isSaving={isSaving}
        mode={recipeEditorState.mode}
        onClose={closeRecipeEditor}
        onSubmit={async (value) => {
          const success = await runAdminMutation(
            value.id ? `/api/color-lab/recipes/${value.id}` : "/api/color-lab/recipes",
            {
              method: value.id ? "PATCH" : "POST",
              body: {
                author: value.author,
                baseProfile: value.baseProfile,
                cameraLines: value.cameraLines,
                color: buildColorLabRecipeColor(value.colorName, value.colorHex),
                compatibilityNotes: value.compatibilityNotes,
                name: value.name,
                settings: value.settings,
                tags: value.tags,
              },
              successMessage: value.id
                ? `Đã cập nhật recipe "${value.name}".`
                : `Đã tạo recipe "${value.name}".`,
            }
          );

          if (success) {
            closeRecipeEditor();
          }
        }}
      />

      <ColorLabPhotoManagerModal
        key={[
          isPhotoManagerOpen ? "open" : "closed",
          (catalog?.recipes ?? []).map((recipe) => recipe.id).join("|"),
          (catalog?.photos ?? [])
            .map((photo) => `${photo.id}:${photo.storagePath}:${photo.sortOrder}`)
            .join("|"),
        ].join("::")}
        errorMessage={errorMessage}
        isOpen={isPhotoManagerOpen}
        isSaving={isSaving}
        onClose={() => setIsPhotoManagerOpen(false)}
        onCreate={async (value) => {
          await runAdminMutation("/api/color-lab/photos", {
            method: "POST",
            body: value,
            successMessage: "Đã upload preview photo mới.",
          });
        }}
        onUpdate={async (value) => {
          if (!value.id) {
            setErrorMessage("Thiếu id photo để cập nhật.");
            return;
          }

          await runAdminMutation(`/api/color-lab/photos/${value.id}`, {
            method: "PATCH",
            body: value,
            successMessage: "Đã cập nhật metadata preview photo.",
          });
        }}
        onDelete={async (id) => {
          await runAdminMutation(`/api/color-lab/photos/${id}`, {
            method: "DELETE",
            successMessage: "Đã xóa preview photo.",
          });
        }}
        photos={catalog?.photos ?? []}
        recipes={catalog?.recipes ?? []}
      />
    </>
  );
}
