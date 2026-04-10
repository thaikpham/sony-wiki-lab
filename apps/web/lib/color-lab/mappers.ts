import type { Json, TableRow } from "../../types/supabase";
import type {
  ColorLabPhoto,
  ColorLabRecipe,
  ColorLabRecipeColor,
  ColorLabRecipeSettings,
} from "../../types/color-lab";
import { DEFAULT_COLOR_LAB_SETTINGS } from "./data.ts";
import { getColorLabPhotoPublicUrl } from "./storage.ts";

type ColorLabRecipeRow = TableRow<"color_lab_recipes">;
type ColorLabPhotoRow = TableRow<"color_lab_photos">;

export interface ColorLabRecipeQueryRow
  extends Pick<
    ColorLabRecipeRow,
    | "id"
    | "name"
    | "base_profile"
    | "author"
    | "tags"
    | "camera_lines"
    | "compatibility_notes"
    | "color"
    | "settings"
    | "created_at"
  > {}

export interface ColorLabPhotoQueryRow
  extends Pick<
    ColorLabPhotoRow,
    "id" | "src" | "recipe_id" | "storage_path" | "sort_order" | "caption"
  > {}

function isRecord(value: Json | null | undefined): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringRecord(
  value: Json | null | undefined,
  keys: readonly string[]
): value is Record<string, string> {
  return isRecord(value) && keys.every((key) => typeof value[key] === "string");
}

const COLOR_DEPTH_KEYS = ["R", "G", "B", "C", "M", "Y"] as const;
const DETAIL_KEYS = [
  "level",
  "mode",
  "vhBalance",
  "bwBalance",
  "limit",
  "crispening",
  "hlLightDetail",
] as const;

export function mapColorLabRecipeColor(color: Json | null): ColorLabRecipeColor {
  if (!isRecord(color)) {
    return {
      name: "Custom",
      border: "",
      bg: "",
      text: "",
      hex: "#d09c30",
    };
  }

  return {
    name: typeof color.name === "string" ? color.name : "Custom",
    border: typeof color.border === "string" ? color.border : "",
    bg: typeof color.bg === "string" ? color.bg : "",
    text: typeof color.text === "string" ? color.text : "",
    hex: typeof color.hex === "string" ? color.hex : "#d09c30",
  };
}

export function mapColorLabRecipeSettings(
  settings: Json | null
): ColorLabRecipeSettings {
  if (!isRecord(settings)) {
    return structuredClone(DEFAULT_COLOR_LAB_SETTINGS);
  }

  const colorDepth = isStringRecord(settings.colorDepth, COLOR_DEPTH_KEYS)
    ? {
        R: settings.colorDepth.R,
        G: settings.colorDepth.G,
        B: settings.colorDepth.B,
        C: settings.colorDepth.C,
        M: settings.colorDepth.M,
        Y: settings.colorDepth.Y,
      }
    : { ...DEFAULT_COLOR_LAB_SETTINGS.colorDepth };

  const detail = isStringRecord(settings.detail, DETAIL_KEYS)
    ? {
        level: settings.detail.level,
        mode: settings.detail.mode,
        vhBalance: settings.detail.vhBalance,
        bwBalance: settings.detail.bwBalance,
        limit: settings.detail.limit,
        crispening: settings.detail.crispening,
        hlLightDetail: settings.detail.hlLightDetail,
      }
    : { ...DEFAULT_COLOR_LAB_SETTINGS.detail };

  return {
    whiteBalance:
      typeof settings.whiteBalance === "string"
        ? settings.whiteBalance
        : DEFAULT_COLOR_LAB_SETTINGS.whiteBalance,
    blackLevel:
      typeof settings.blackLevel === "string"
        ? settings.blackLevel
        : DEFAULT_COLOR_LAB_SETTINGS.blackLevel,
    gamma:
      typeof settings.gamma === "string"
        ? settings.gamma
        : DEFAULT_COLOR_LAB_SETTINGS.gamma,
    blackGamma:
      typeof settings.blackGamma === "string"
        ? settings.blackGamma
        : DEFAULT_COLOR_LAB_SETTINGS.blackGamma,
    knee:
      typeof settings.knee === "string"
        ? settings.knee
        : DEFAULT_COLOR_LAB_SETTINGS.knee,
    colorMode:
      typeof settings.colorMode === "string"
        ? settings.colorMode
        : DEFAULT_COLOR_LAB_SETTINGS.colorMode,
    saturation:
      typeof settings.saturation === "string"
        ? settings.saturation
        : DEFAULT_COLOR_LAB_SETTINGS.saturation,
    colorPhase:
      typeof settings.colorPhase === "string"
        ? settings.colorPhase
        : DEFAULT_COLOR_LAB_SETTINGS.colorPhase,
    colorDepth,
    detail,
  };
}

export function mapColorLabRecipe(row: ColorLabRecipeQueryRow): ColorLabRecipe {
  return {
    id: row.id,
    name: row.name,
    baseProfile: row.base_profile,
    author: row.author,
    tags: row.tags ?? [],
    cameraLines: (row.camera_lines ?? []).filter((value): value is string => {
      return typeof value === "string" && value.trim().length > 0;
    }),
    compatibilityNotes:
      typeof row.compatibility_notes === "string" ? row.compatibility_notes : "",
    color: mapColorLabRecipeColor(row.color),
    settings: mapColorLabRecipeSettings(row.settings),
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function mapColorLabPhoto(row: ColorLabPhotoQueryRow): ColorLabPhoto {
  const storagePath = typeof row.storage_path === "string" ? row.storage_path : "";
  const legacyUrl = typeof row.src === "string" ? row.src : "";

  return {
    id: row.id,
    recipeId: typeof row.recipe_id === "string" ? row.recipe_id : "",
    storagePath,
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    url: storagePath ? getColorLabPhotoPublicUrl(storagePath) : legacyUrl,
    caption: row.caption,
  };
}
