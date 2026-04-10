import { z } from "zod";

const colorDepthSchema = z.object({
  R: z.string().trim().min(1).max(40),
  G: z.string().trim().min(1).max(40),
  B: z.string().trim().min(1).max(40),
  C: z.string().trim().min(1).max(40),
  M: z.string().trim().min(1).max(40),
  Y: z.string().trim().min(1).max(40),
});

const detailSchema = z.object({
  level: z.string().trim().min(1).max(40),
  mode: z.string().trim().min(1).max(40),
  vhBalance: z.string().trim().min(1).max(40),
  bwBalance: z.string().trim().min(1).max(40),
  limit: z.string().trim().min(1).max(40),
  crispening: z.string().trim().min(1).max(40),
  hlLightDetail: z.string().trim().min(1).max(40),
});

const recipeSettingsSchema = z.object({
  whiteBalance: z.string().trim().min(1).max(80),
  blackLevel: z.string().trim().min(1).max(40),
  gamma: z.string().trim().min(1).max(80),
  blackGamma: z.string().trim().min(1).max(80),
  knee: z.string().trim().min(1).max(80),
  colorMode: z.string().trim().min(1).max(80),
  saturation: z.string().trim().min(1).max(40),
  colorPhase: z.string().trim().min(1).max(40),
  colorDepth: colorDepthSchema,
  detail: detailSchema,
});

export const colorLabRecipeInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  baseProfile: z.string().trim().min(1).max(160),
  author: z.string().trim().min(1).max(120),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  cameraLines: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
  compatibilityNotes: z.string().trim().max(1200).default(""),
  color: z.object({
    name: z.string().trim().min(1).max(80),
    hex: z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  }),
  settings: recipeSettingsSchema,
});

const colorLabPhotoMetadataShape = {
  recipeId: z.string().trim().min(1).max(120),
  caption: z.string().trim().min(1).max(280),
  sortOrder: z.coerce.number().int().min(0).max(9999),
} satisfies z.ZodRawShape;

export const colorLabPhotoUploadSchema = z.object(colorLabPhotoMetadataShape);
export const colorLabPhotoUpdateSchema = z.object(colorLabPhotoMetadataShape);

export type ColorLabRecipeInput = z.infer<typeof colorLabRecipeInputSchema>;
export type ColorLabPhotoUploadInput = z.infer<typeof colorLabPhotoUploadSchema>;
export type ColorLabPhotoUpdateInput = z.infer<typeof colorLabPhotoUpdateSchema>;
