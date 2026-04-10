"use client";

import {
  useCallback,
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import WikiAdminPromptModal from "@/components/wiki/WikiAdminPromptModal";
import WikiCategoryManagerModal from "@/components/wiki/WikiCategoryManagerModal";
import WikiCompareModal from "@/components/wiki/WikiCompareModal";
import WikiProductEditorModal from "@/components/wiki/WikiProductEditorModal";
import WikiProductImage from "@/components/wiki/WikiProductImage";
import WikiProductQuickViewModal from "@/components/wiki/WikiProductQuickViewModal";
import {
  buildJsonHeaders,
  getWikiAdminSession,
  loginWikiAdmin,
  logoutWikiAdmin,
  type WikiAdminSessionState,
} from "@/lib/wiki/admin-client";
import {
  getEmptyWikiProductEditorValue,
  getWikiProductEditorValue,
} from "@/lib/wiki/admin-helpers";
import { buildWikiHref, getNextCompareIds } from "@/lib/wiki/compare";
import { formatWikiPrice } from "@/lib/wiki/presentation";
import type { WikiAdminCatalog } from "@/lib/wiki/contracts";
import type {
  WikiCategory,
  WikiCategoryEditorValue,
  WikiProductEditorValue,
  WikiProductListItem,
  WikiSortOption,
} from "@/types/wiki";

interface WikiCompareExperienceProps {
  categories: WikiCategory[];
  compareIds: string[];
  compareProducts: WikiProductListItem[];
  products: WikiProductListItem[];
  query?: string;
  category?: string;
  sort: WikiSortOption;
}

interface AdminJsonError {
  error?: string;
}

interface ProductEditorState {
  initialValue: WikiProductEditorValue;
  isOpen: boolean;
  mode: "create" | "edit";
}

function buildSubcategoryStyle(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("camera") || normalized.includes("cinema")) {
    return "border-amber-300/35 bg-amber-400/10 text-amber-700";
  }

  if (normalized.includes("lens") || normalized.includes("master")) {
    return "border-sky-300/35 bg-sky-400/10 text-sky-700";
  }

  if (normalized.includes("micro") || normalized.includes("audio")) {
    return "border-rose-300/35 bg-rose-400/10 text-rose-700";
  }

  return "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--muted-foreground)]";
}

async function parseJsonError(response: Response) {
  const payload = (await response.json().catch(() => null)) as AdminJsonError | null;
  return payload?.error ?? "Yêu cầu admin thất bại.";
}

export default function WikiCompareExperience({
  categories,
  compareIds,
  compareProducts,
  products,
  query,
  category,
  sort,
}: WikiCompareExperienceProps) {
  const router = useRouter();
  const [quickViewProduct, setQuickViewProduct] = useState<WikiProductListItem | null>(
    null
  );
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(query ?? "");
  const deferredSearchInput = useDeferredValue(searchInput);
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [adminSession, setAdminSession] = useState<WikiAdminSessionState | null>(null);
  const [password, setPassword] = useState("");
  const [isAdminPromptOpen, setIsAdminPromptOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingAdminSession, setIsCheckingAdminSession] = useState(true);
  const [catalog, setCatalog] = useState<WikiAdminCatalog | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [productEditorState, setProductEditorState] = useState<ProductEditorState>({
    initialValue: getEmptyWikiProductEditorValue(),
    isOpen: false,
    mode: "create",
  });
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const isAdmin = Boolean(adminSession);
  const compareLookup = useMemo(() => new Set(compareIds), [compareIds]);
  const activeCategory = useMemo(
    () => categories.find((item) => item.slug === category) ?? null,
    [categories, category]
  );
  const subcategoryOptions = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.subcategory)
          .filter((value): value is string => Boolean(value))
      )
    ).sort((left, right) => left.localeCompare(right, "vi"));
  }, [products]);
  const showSubcategoryFilter =
    Boolean(activeCategory) && subcategoryOptions.length > 0;
  const visibleProducts = useMemo(() => {
    if (!showSubcategoryFilter || activeSubcategory === "all") {
      return products;
    }

    return products.filter((product) => product.subcategory === activeSubcategory);
  }, [activeSubcategory, products, showSubcategoryFilter]);
  const loadCatalog = useCallback(async () => {
    setIsLoadingCatalog(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/wiki/admin/catalog", {
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

      const payload = (await response.json()) as WikiAdminCatalog;
      setCatalog(payload);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể tải admin catalog."
      );
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    setSearchInput(query ?? "");
  }, [query]);

  useEffect(() => {
    setActiveSubcategory("all");
  }, [category, products, query]);

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
    if (!adminSession) {
      setCatalog(null);
      return;
    }

    void loadCatalog();
  }, [adminSession, loadCatalog]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [statusMessage]);

  useEffect(() => {
    const normalizedInput = deferredSearchInput.trim();
    const currentQuery = query ?? "";

    if (normalizedInput === currentQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextHref = buildWikiHref({
        q: normalizedInput || undefined,
        category,
        sort,
        compare: compareIds,
      });

      startTransition(() => {
        router.replace(nextHref, { scroll: false });
      });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [category, compareIds, deferredSearchInput, query, router, sort]);

  function replaceRoute(input: {
    q?: string;
    category?: string;
    sort: WikiSortOption;
    compare: string[];
  }) {
    const nextHref = buildWikiHref(input);

    startTransition(() => {
      router.replace(nextHref, { scroll: false });
    });
  }

  async function runAdminMutation(
    path: string,
    options: {
      body?: unknown;
      method: "POST" | "PATCH" | "DELETE";
      successMessage: string;
    }
  ) {
    if (!adminSession) {
      setErrorMessage("Phiên admin đã hết hạn. Hãy đăng nhập lại.");
      return false;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(path, {
        method: options.method,
        headers: options.body ? buildJsonHeaders() : undefined,
        body: options.body ? JSON.stringify(options.body) : undefined,
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
        error instanceof Error ? error.message : "Không thể thực hiện thao tác admin."
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAdminLogin() {
    setIsAuthenticating(true);
    setErrorMessage(null);

    try {
      const session = await loginWikiAdmin(password);
      setAdminSession(session);
      setPassword("");
      setIsAdminPromptOpen(false);
      setStatusMessage("Đã bật admin mode cho wiki.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể xác thực admin."
      );
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleLogoutAdmin() {
    void logoutWikiAdmin().catch(() => null);
    setAdminSession(null);
    setCatalog(null);
    setPassword("");
    setIsAdminPromptOpen(false);
    setProductEditorState({
      initialValue: getEmptyWikiProductEditorValue(),
      isOpen: false,
      mode: "create",
    });
    setIsCategoryManagerOpen(false);
    setStatusMessage("Đã đóng phiên quản trị wiki.");
    setErrorMessage(null);
  }

  function handleToggleCompare(id: string) {
    const isSelected = compareLookup.has(id);

    if (!isSelected && compareIds.length >= 4) {
      return;
    }

    replaceRoute({
      q: query,
      category,
      sort,
      compare: getNextCompareIds(compareIds, id),
    });
  }

  function handleRemoveCompare(id: string) {
    replaceRoute({
      q: query,
      category,
      sort,
      compare: compareIds.filter((item) => item !== id),
    });

    if (compareIds.length <= 2) {
      setIsCompareOpen(false);
    }
  }

  function handleClearCompare() {
    replaceRoute({
      q: query,
      category,
      sort,
      compare: [],
    });
    setIsCompareOpen(false);
  }

  function handleCategoryChange(nextCategory?: string) {
    setActiveSubcategory("all");
    replaceRoute({
      q: query,
      category: nextCategory,
      sort,
      compare: compareIds,
    });
  }

  function handleResetFilters() {
    setSearchInput("");
    setActiveSubcategory("all");
    replaceRoute({
      q: undefined,
      category: undefined,
      sort,
      compare: compareIds,
    });
  }

  function openCreateProduct() {
    setErrorMessage(null);
    setProductEditorState({
      initialValue: getEmptyWikiProductEditorValue(),
      isOpen: true,
      mode: "create",
    });
  }

  function openEditProduct(productId: string) {
    const adminProduct = catalog?.products.find((product) => product.id === productId);

    if (!adminProduct) {
      setErrorMessage("Chưa tải được dữ liệu admin cho sản phẩm này.");
      return;
    }

    setErrorMessage(null);
    setProductEditorState({
      initialValue: getWikiProductEditorValue(adminProduct),
      isOpen: true,
      mode: "edit",
    });
  }

  async function handleSubmitProduct(value: WikiProductEditorValue) {
    const path =
      productEditorState.mode === "create"
        ? "/api/wiki/products"
        : `/api/wiki/products/${value.id}`;
    const method = productEditorState.mode === "create" ? "POST" : "PATCH";
    const didSave = await runAdminMutation(path, {
      method,
      body: value,
      successMessage:
        productEditorState.mode === "create"
          ? "Đã tạo sản phẩm mới."
          : "Đã cập nhật sản phẩm.",
    });

    if (didSave) {
      setProductEditorState((current) => ({
        ...current,
        isOpen: false,
      }));
    }
  }

  async function handleCreateCategory(value: WikiCategoryEditorValue) {
    const didCreate = await runAdminMutation("/api/wiki/categories", {
      method: "POST",
      body: value,
      successMessage: "Đã tạo danh mục mới.",
    });

    if (didCreate) {
      setIsCategoryManagerOpen(false);
    }
  }

  async function handleUpdateCategory(value: WikiCategoryEditorValue) {
    if (!value.id) {
      setErrorMessage("Thiếu id danh mục để cập nhật.");
      return;
    }

    await runAdminMutation(`/api/wiki/categories/${value.id}`, {
      method: "PATCH",
      body: value,
      successMessage: "Đã cập nhật danh mục.",
    });
  }

  async function handleDeleteCategory(id: string) {
    const didDelete = await runAdminMutation(`/api/wiki/categories/${id}`, {
      method: "DELETE",
      successMessage: "Đã xóa danh mục.",
    });

    if (didDelete) {
      setIsCategoryManagerOpen(false);
    }
  }

  const productCountLabel = `${visibleProducts.length}`;
  const categoryCountLabel = `${categories.length}`;
  const adminProductCountLabel = `${catalog?.products.length ?? 0}`;
  const adminDraftCountLabel = `${
    catalog?.products.filter((product) => !product.isPublished).length ?? 0
  }`;

  return (
    <>
      <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Wiki Runtime
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              Table-first catalog cho product knowledge base
            </h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
              Listing mới dùng category tabs, compare queue, quick-view modal và admin
              action ngay trong một workspace duy nhất.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={openCreateProduct}
                  className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                >
                  Manage Categories
                </button>
                <button
                  type="button"
                  onClick={handleLogoutAdmin}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                >
                  Logout Admin
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setIsAdminPromptOpen(true);
                }}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              >
                Admin Login
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Visible Rows
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {productCountLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Categories
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {categoryCountLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Compare Queue
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {compareProducts.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-alt)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Admin Catalog
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
              {isAdmin ? adminProductCountLabel : "—"}
            </p>
            {isAdmin ? (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Drafts: {adminDraftCountLabel}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 space-y-4 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.2fr)_auto] xl:items-center">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--foreground)]">Search</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
                placeholder="Tìm theo tên, slug, mô tả..."
              />
            </label>

            <div className="flex flex-wrap items-end gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange(undefined)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                !category
                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleCategoryChange(item.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  item.slug === category
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {showSubcategoryFilter ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                Subcategory
              </span>
              <button
                type="button"
                onClick={() => setActiveSubcategory("all")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeSubcategory === "all"
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                All
              </button>
              {subcategoryOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveSubcategory(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeSubcategory === value
                      ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          ) : null}

          {(query || activeCategory || activeSubcategory !== "all") && (
            <div className="flex flex-wrap items-center gap-2">
              {query ? (
                <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--foreground)]">
                  Query: {query}
                </span>
              ) : null}
              {activeCategory ? (
                <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--foreground)]">
                  Category: {activeCategory.name}
                </span>
              ) : null}
              {activeSubcategory !== "all" ? (
                <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs text-[var(--foreground)]">
                  Subcategory: {activeSubcategory}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {statusMessage ? (
          <div className="mt-4 rounded-2xl border border-emerald-300/35 bg-emerald-400/10 px-4 py-3 text-sm text-[var(--foreground)]">
            {statusMessage}
          </div>
        ) : null}

        {isCheckingAdminSession ? (
          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-xs text-[var(--muted-foreground)]">
            Đang kiểm tra phiên admin đã lưu. Bạn vẫn có thể đăng nhập thủ công ngay bây giờ.
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-[var(--danger)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--foreground)]">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] border-collapse text-sm">
              <thead className="bg-[var(--surface-alt)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-4 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Product
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Category
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Price
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Specs
                  </th>
                  <th className="px-5 py-4 text-right text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--surface)]">
                {visibleProducts.map((product) => {
                  const isCompared = compareLookup.has(product.id);

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[var(--border)]/75 transition-colors hover:bg-[var(--surface-alt)]"
                    >
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-start gap-3">
                          {product.mainImage ? (
                            <WikiProductImage
                              alt=""
                              className="h-14 w-14 shrink-0 rounded-2xl border border-[var(--border)]"
                              sizes="56px"
                              src={product.mainImage}
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-[var(--foreground)]">
                              {product.name}
                            </p>
                            <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                              {product.slug}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">
                              {product.shortDescription ?? "Chưa có mô tả ngắn cho sản phẩm này."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {product.category ? (
                            <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
                              Chưa gán category
                            </span>
                          )}
                          {product.subcategory ? (
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${buildSubcategoryStyle(
                                product.subcategory
                              )}`}
                            >
                              {product.subcategory}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm font-semibold text-[var(--primary)]">
                        {formatWikiPrice(product.priceVnd)}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {product.specCount} specs
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {product.specGroups.slice(0, 3).map((group) => (
                              <span
                                key={`${product.id}-${group.group}`}
                                className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]"
                              >
                                {group.group}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleCompare(product.id)}
                            disabled={!isCompared && compareIds.length >= 4}
                            className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                              isCompared
                                ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                                : "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {isCompared ? "Đã chọn" : "So sánh"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuickViewProduct(product)}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                          >
                            Quick View
                          </button>
                          <Link
                            href={`/wiki/${product.slug}`}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                          >
                            Detail
                          </Link>
                          {product.buyLink ? (
                            <a
                              href={product.buyLink}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                            >
                              Buy
                            </a>
                          ) : null}
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => openEditProduct(product.id)}
                              disabled={isLoadingCatalog}
                              className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Edit
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <section className="mt-5 rounded-[1.75rem] border-2 border-dashed border-[var(--border)] bg-[var(--surface-alt)] px-6 py-14 text-center">
            <p className="text-lg font-semibold text-[var(--foreground)]">
              Không tìm thấy sản phẩm phù hợp.
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Hãy đổi từ khóa, category hoặc subcategory để xem lại catalog.
            </p>
          </section>
        ) : null}
      </section>

      {compareProducts.length > 0 ? (
        <div className="sticky bottom-4 z-40 mt-6">
          <section className="flex flex-col gap-4 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap gap-2">
              {compareProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2"
                >
                {product.mainImage ? (
                    <WikiProductImage
                      alt=""
                      className="h-10 w-10 rounded-full border border-[var(--border)]"
                      imageClassName="object-cover"
                      sizes="40px"
                      src={product.mainImage}
                    />
                ) : null}
                  <div className="min-w-0">
                    <p className="max-w-[150px] truncate text-sm font-medium text-[var(--foreground)]">
                      {product.name}
                    </p>
                    <p className="max-w-[150px] truncate text-xs text-[var(--muted-foreground)]">
                      {formatWikiPrice(product.priceVnd)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCompare(product.id)}
                    className="rounded-full px-2 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                    aria-label={`Bỏ ${product.name} khỏi compare queue`}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearCompare}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              >
                Xóa tất cả
              </button>
              <button
                type="button"
                onClick={() => setIsCompareOpen(true)}
                disabled={compareProducts.length < 2}
                className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                So sánh ({compareProducts.length})
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <WikiAdminPromptModal
        errorMessage={errorMessage}
        isOpen={isAdminPromptOpen}
        isSubmitting={isAuthenticating}
        password={password}
        onClose={() => {
          setIsAdminPromptOpen(false);
          setPassword("");
        }}
        onPasswordChange={setPassword}
        onSubmit={() => {
          void handleAdminLogin();
        }}
      />

      {isCategoryManagerOpen ? (
        <WikiCategoryManagerModal
          categories={catalog?.categories ?? categories}
          errorMessage={errorMessage}
          isOpen={isCategoryManagerOpen}
          isSaving={isSaving}
          onClose={() => setIsCategoryManagerOpen(false)}
          onCreate={(value) => {
            void handleCreateCategory(value);
          }}
          onUpdate={(value) => {
            void handleUpdateCategory(value);
          }}
          onDelete={(id) => {
            void handleDeleteCategory(id);
          }}
        />
      ) : null}

      {productEditorState.isOpen ? (
        <WikiProductEditorModal
          key={`${productEditorState.mode}-${productEditorState.initialValue.id ?? "new"}`}
          categories={catalog?.categories ?? categories}
          initialValue={productEditorState.initialValue}
          isOpen={productEditorState.isOpen}
          isSaving={isSaving}
          mode={productEditorState.mode}
          errorMessage={errorMessage}
          onClose={() =>
            setProductEditorState((current) => ({
              ...current,
              isOpen: false,
            }))
          }
          onSubmit={(value) => {
            void handleSubmitProduct(value);
          }}
        />
      ) : null}

      {quickViewProduct ? (
        <WikiProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      ) : null}

      {isCompareOpen && compareProducts.length >= 2 ? (
        <WikiCompareModal
          products={compareProducts}
          onClose={() => setIsCompareOpen(false)}
        />
      ) : null}
    </>
  );
}
