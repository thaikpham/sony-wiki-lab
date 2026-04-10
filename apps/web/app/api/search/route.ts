import { NextRequest, NextResponse } from "next/server";
import { isTimeoutError, withTimeout } from "@/lib/utils/with-timeout";
import type { SearchResponse } from "@/types/search";
import {
  normalizeSearchLimit,
  normalizeSearchQuery,
  PUBLIC_WIKI_SEARCH_TIMEOUT_MS,
  searchWikiContentPublic,
} from "@/lib/wiki/queries";

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const query = normalizeSearchQuery(url.searchParams.get("q") ?? "");
  const limit = normalizeSearchLimit(url.searchParams.get("limit"));

  if (!query) {
    const emptyPayload: SearchResponse = {
      query: "",
      results: [],
      total: 0,
      tookMs: Date.now() - startedAt,
    };
    return NextResponse.json(emptyPayload);
  }

  try {
    const payload = await withTimeout(
      searchWikiContentPublic({
        query,
        limit,
      }),
      PUBLIC_WIKI_SEARCH_TIMEOUT_MS,
      "Search request timed out."
    );
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Search query failed",
        error: error instanceof Error ? error.message : "Unknown search error",
        tookMs: Date.now() - startedAt,
      },
      { status: isTimeoutError(error) ? 504 : 500 }
    );
  }
}
