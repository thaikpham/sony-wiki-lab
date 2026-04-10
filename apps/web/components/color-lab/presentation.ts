import type { CSSProperties } from "react";
import type { ColorLabRecipe } from "@/types/color-lab";

export function formatColorLabCreatedAt(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function buildColorLabBadgeStyle(
  recipe: ColorLabRecipe
): CSSProperties {
  return {
    backgroundColor: `${recipe.color.hex}14`,
    borderColor: `${recipe.color.hex}55`,
    color: recipe.color.hex,
  };
}
