"use client";

import Link from "next/link";
import WikiProductImage from "@/components/wiki/WikiProductImage";
import WikiSpecGroups from "@/components/wiki/WikiSpecGroups";
import { formatWikiPrice, formatWikiUpdatedAt } from "@/lib/wiki/presentation";
import type { WikiProductListItem } from "@/types/wiki";

interface WikiProductQuickViewModalProps {
  product: WikiProductListItem;
  onClose: () => void;
}

export default function WikiProductQuickViewModal({
  product,
  onClose,
}: WikiProductQuickViewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[min(980px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiki-product-quick-view-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {product.category ? (
                <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
                  {product.category.name}
                </span>
              ) : null}
              {product.subcategory ? (
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
                  {product.subcategory}
                </span>
              ) : null}
            </div>
            <h2
              id="wiki-product-quick-view-title"
              className="text-2xl font-semibold text-[var(--foreground)]"
            >
              {product.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {product.shortDescription ?? "Mở nhanh thông số kỹ thuật của sản phẩm này."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          >
            Đóng
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(300px,1.08fr)]">
            <div className="space-y-4">
              {product.mainImage ? (
                <WikiProductImage
                  alt={`Hình minh họa cho ${product.name}`}
                  className="aspect-[4/3] rounded-[1.5rem] border border-[var(--border)]"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  src={product.mainImage}
                />
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Giá tham khảo
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--primary)]">
                    {formatWikiPrice(product.priceVnd)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Cập nhật
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                    {formatWikiUpdatedAt(product.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/wiki/${product.slug}`}
                  className="rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90"
                >
                  Mở trang chi tiết
                </Link>
                {product.buyLink ? (
                  <a
                    href={product.buyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                  >
                    Buy Link
                  </a>
                ) : null}
              </div>
            </div>

            <section className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Quick View
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                    Technical Specifications
                  </h3>
                </div>
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
                  {product.specCount} specs
                </span>
              </div>
              <WikiSpecGroups groups={product.specGroups} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
