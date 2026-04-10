import type { ColorLabSearchParams } from "@/types/color-lab";

type SearchParamValue = string | string[] | undefined;

function toSingleValue(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function sanitizeText(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 120) : undefined;
}

export function parseColorLabSearchParams(
  searchParams: Record<string, SearchParamValue>
): ColorLabSearchParams {
  return {
    q: sanitizeText(toSingleValue(searchParams.q)),
    cameraLine: sanitizeText(toSingleValue(searchParams.cameraLine)),
    profile: sanitizeText(toSingleValue(searchParams.profile)),
  };
}

export function buildColorLabHref(searchParams: ColorLabSearchParams) {
  const params = new URLSearchParams();

  if (searchParams.q) {
    params.set("q", searchParams.q);
  }

  if (searchParams.cameraLine) {
    params.set("cameraLine", searchParams.cameraLine);
  }

  if (searchParams.profile) {
    params.set("profile", searchParams.profile);
  }

  const queryString = params.toString();
  return queryString ? `/color-lab?${queryString}` : "/color-lab";
}
