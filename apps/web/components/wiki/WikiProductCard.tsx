"use client";

import Link from "next/link";
import WikiProductImage from "@/components/wiki/WikiProductImage";
import type { WikiProductListItem } from "@/types/wiki";

interface WikiProductCardProps {
  product: WikiProductListItem;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
  compareDisabled?: boolean;
}

function formatUpdatedAt(updatedAt: string | null) {
  if (!updatedAt) {
    return "Chưa có ngày cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(updatedAt));
}

export default function WikiProductCard({
  product,
  isCompared = false,
  onToggleCompare,
  compareDisabled = false,
}: WikiProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-[var(--ring)]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {product.category ? (
              <span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--foreground)]">
                {product.category.name}
              </span>
            ) : null}
            <span className="rounded-full bg-[var(--surface-alt)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]">
              {product.specCount} specs
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              <Link href={`/wiki/${product.slug}`} className="hover:text-[var(--primary)]">
                {product.name}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {product.shortDescription ?? "Chưa có mô tả ngắn cho sản phẩm này."}
            </p>
          </div>
        </div>

        {product.mainImage ? (
          <WikiProductImage
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl border border-[var(--border-subtle)]"
            sizes="64px"
            src={product.mainImage}
          />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {product.specGroups.slice(0, 2).map((group) => (
          <span
            key={`${product.id}-${group.group}`}
            className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] text-[var(--muted-foreground)]"
          >
            {group.group}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            Cập nhật {formatUpdatedAt(product.updatedAt)}
          </p>
          <div className="flex items-center gap-2">
            {onToggleCompare ? (
              <button
                type="button"
                onClick={() => onToggleCompare(product.id)}
                disabled={compareDisabled}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                  isCompared
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                    : "border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {isCompared ? "Đã chọn" : "So sánh"}
              </button>
            ) : null}
            <Link
              href={`/wiki/${product.slug}`}
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
