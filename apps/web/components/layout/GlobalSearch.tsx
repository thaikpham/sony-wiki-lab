"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, SearchField, Spinner } from "@heroui/react";
import type { SearchResponse, SearchResultItem } from "@/types/navigation";

type SearchStatus = "idle" | "loading" | "results" | "empty" | "error";

const DEFAULT_LIMIT = 8;

function useDebouncedValue(value: string, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debouncedValue;
}

interface GlobalSearchProps {
  className?: string;
}

export default function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 250);
  const trimmedDebouncedQuery = debouncedQuery.trim();

  useEffect(() => {
    if (!trimmedDebouncedQuery) {
      setStatus("idle");
      setResults([]);
      setHighlightedIndex(-1);
      setErrorText(null);
      return;
    }

    const controller = new AbortController();
    let ignore = false;

    async function runSearch() {
      setStatus("loading");
      setErrorText(null);

      try {
        const params = new URLSearchParams({
          q: trimmedDebouncedQuery,
          limit: String(DEFAULT_LIMIT),
        });
        const response = await fetch(`/api/search?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Search request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as SearchResponse;
        if (ignore) return;

        setResults(payload.results);
        setStatus(payload.results.length > 0 ? "results" : "empty");
        setHighlightedIndex(payload.results.length > 0 ? 0 : -1);
      } catch (error) {
        if (ignore || controller.signal.aborted) return;
        setStatus("error");
        setResults([]);
        setHighlightedIndex(-1);
        setErrorText(error instanceof Error ? error.message : "Không thể tìm kiếm lúc này.");
      }
    }

    runSearch();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [trimmedDebouncedQuery]);

  const shouldShowPopover = useMemo(() => {
    if (!isOpen) return false;
    return status !== "idle" || query.trim().length > 0;
  }, [isOpen, query, status]);

  const navigateTo = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) {
      if (event.key === "Enter" && query.trim()) {
        event.preventDefault();
        navigateTo(`/wiki?q=${encodeURIComponent(query.trim())}`);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => {
        const next = current + 1;
        return next >= results.length ? 0 : next;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((current) => {
        const next = current - 1;
        return next < 0 ? results.length - 1 : next;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        navigateTo(results[highlightedIndex].href);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <Popover isOpen={shouldShowPopover} onOpenChange={setIsOpen}>
      <Popover.Trigger className={className}>
        <SearchField
          aria-label="Tìm kiếm toàn bộ dữ liệu wiki"
          className="w-full"
          name="global-search"
          value={query}
          onChange={setQuery}
          onFocus={() => setIsOpen(true)}
          variant="secondary"
        >
          <SearchField.Group className="h-11 border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--foreground)] shadow-none">
            <SearchField.SearchIcon className="text-[var(--muted-foreground)]" />
            <SearchField.Input
              className="text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
              placeholder="Tìm kiếm tất cả thông tin..."
              onKeyDown={handleInputKeyDown}
            />
            <SearchField.ClearButton className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
          </SearchField.Group>
        </SearchField>
      </Popover.Trigger>

      <Popover.Content className="w-[min(92vw,38rem)]" placement="bottom" offset={10}>
        <Popover.Dialog className="space-y-2 p-2">
          {status === "loading" ? (
            <div className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-[var(--muted-foreground)]">
              <Spinner size="sm" />
              <span>Đang tìm kiếm...</span>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-md px-3 py-3 text-sm text-[var(--danger)]">
              {errorText ?? "Có lỗi xảy ra khi tìm kiếm."}
            </div>
          ) : null}

          {status === "empty" ? (
            <div className="rounded-md px-3 py-3 text-sm text-[var(--muted-foreground)]">
              Không có kết quả phù hợp với từ khóa này.
            </div>
          ) : null}

          {status === "results" ? (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((item, index) => {
                const isActive = index === highlightedIndex;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                        isActive
                          ? "bg-[var(--surface-hover)] text-[var(--foreground)]"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => navigateTo(item.href)}
                    >
                      <div className="text-sm font-medium">{item.title}</div>
                      {item.subtitle ? (
                        <div className="text-xs text-[var(--muted-foreground)]">{item.subtitle}</div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
