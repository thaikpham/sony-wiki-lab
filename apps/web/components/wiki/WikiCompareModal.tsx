"use client";

import { Fragment } from "react";
import Link from "next/link";
import WikiProductImage from "@/components/wiki/WikiProductImage";
import { formatWikiPrice } from "@/lib/wiki/presentation";
import type { WikiProductListItem } from "@/types/wiki";

interface WikiCompareModalProps {
  products: WikiProductListItem[];
  onClose: () => void;
}

function getSpecValue(
  product: WikiProductListItem,
  groupName: string,
  specLabel: string
) {
  return (
    product.specGroups
      .find((group) => group.group === groupName)
      ?.specs.find((spec) => spec.label === specLabel)?.value ?? "—"
  );
}

export default function WikiCompareModal({
  products,
  onClose,
}: WikiCompareModalProps) {
  const rows: Array<{ group: string; label: string }> = [];
  const seen = new Set<string>();

  for (const product of products) {
    for (const group of product.specGroups) {
      for (const spec of group.specs) {
        const key = `${group.group}||${spec.label}`;

        if (!seen.has(key)) {
          seen.add(key);
          rows.push({
            group: group.group,
            label: spec.label,
          });
        }
      }
    }
  }

  const groups = rows.reduce<Array<{ group: string; rows: string[] }>>(
    (accumulator, row) => {
      const currentGroup = accumulator[accumulator.length - 1];

      if (currentGroup && currentGroup.group === row.group) {
        currentGroup.rows.push(row.label);
        return accumulator;
      }

      accumulator.push({
        group: row.group,
        rows: [row.label],
      });
      return accumulator;
    },
    []
  );

  const isDifferent = (groupName: string, label: string) => {
    const values = products.map((product) =>
      getSpecValue(product, groupName, label)
    );

    return values.some((value) => value !== values[0]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[min(1320px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiki-compare-title"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              Compare Runtime
            </p>
            <h2
              id="wiki-compare-title"
              className="mt-1 text-xl font-semibold text-[var(--foreground)]"
            >
              So sánh sản phẩm
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
          >
            Đóng
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-[var(--surface)]">
              <tr>
                <th className="w-44 border-b border-r border-[var(--border)] px-4 py-3 text-left text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Trường
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="border-b border-r border-[var(--border)] px-4 py-4 text-left align-top last:border-r-0"
                  >
                    <div className="flex items-start gap-3">
                      {product.mainImage ? (
                        <WikiProductImage
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-2xl border border-[var(--border)]"
                          sizes="56px"
                          src={product.mainImage}
                        />
                      ) : null}
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-[var(--foreground)]">
                          {product.name}
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                        <div className="text-xs font-medium text-[var(--primary)]">
                          {formatWikiPrice(product.priceVnd)}
                        </div>
                        <Link
                          href={`/wiki/${product.slug}`}
                          className="inline-flex text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-[var(--surface-alt)]">
                <td className="border-b border-r border-[var(--border)] px-4 py-3 font-medium text-[var(--foreground)]">
                  Mô tả ngắn
                </td>
                {products.map((product) => (
                  <td
                    key={`${product.id}-description`}
                    className="border-b border-r border-[var(--border)] px-4 py-3 align-top text-[var(--text-secondary)] last:border-r-0"
                  >
                    {product.shortDescription ?? "—"}
                  </td>
                ))}
              </tr>

              {groups.map((group) => (
                <Fragment key={group.group}>
                  <tr className="bg-[var(--surface-alt)]">
                    <td
                      colSpan={products.length + 1}
                      className="border-b border-t border-[var(--border)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]"
                    >
                      {group.group}
                    </td>
                  </tr>
                  {group.rows.map((label) => {
                    const different = isDifferent(group.group, label);

                    return (
                      <tr key={`${group.group}-${label}`}>
                        <td className="border-b border-r border-[var(--border)] px-4 py-3 font-medium text-[var(--foreground)]">
                          {label}
                        </td>
                        {products.map((product) => {
                          const value = getSpecValue(product, group.group, label);
                          return (
                            <td
                              key={`${product.id}-${group.group}-${label}`}
                              className={`border-b border-r border-[var(--border)] px-4 py-3 align-top last:border-r-0 ${
                                value === "—"
                                  ? "text-[var(--muted-foreground)]"
                                  : different
                                    ? "font-medium text-[var(--primary)]"
                                    : "text-[var(--text-secondary)]"
                              }`}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </Fragment>
              ))}

              <tr className="sticky bottom-0 bg-[var(--surface)]">
                <td className="border-r border-t border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                  Giá tham khảo
                </td>
                {products.map((product) => (
                  <td
                    key={`${product.id}-price`}
                    className="border-r border-t border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--primary)] last:border-r-0"
                  >
                    {formatWikiPrice(product.priceVnd)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
