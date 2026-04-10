import type { WikiProductListItem } from "@/types/wiki";

function toUpdatedAtScore(updatedAt: string | null) {
  if (!updatedAt) {
    return 0;
  }

  const parsed = Date.parse(updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getRelatedScore(
  candidate: WikiProductListItem,
  product: Pick<WikiProductListItem, "category" | "id" | "subcategory">
) {
  let score = 0;

  if (candidate.id === product.id) {
    return score;
  }

  if (candidate.category?.id && candidate.category.id === product.category?.id) {
    score += 2;
  }

  if (
    candidate.subcategory &&
    product.subcategory &&
    candidate.subcategory === product.subcategory
  ) {
    score += 3;
  }

  return score;
}

export function selectRelatedWikiProducts(
  candidates: WikiProductListItem[],
  product: Pick<WikiProductListItem, "category" | "id" | "subcategory">,
  limit = 4
) {
  return candidates
    .map((candidate) => ({
      candidate,
      score: getRelatedScore(candidate, product),
      updatedAtScore: toUpdatedAtScore(candidate.updatedAt),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.updatedAtScore !== left.updatedAtScore) {
        return right.updatedAtScore - left.updatedAtScore;
      }

      return left.candidate.name.localeCompare(right.candidate.name, "vi");
    })
    .slice(0, limit)
    .map((item) => item.candidate);
}
