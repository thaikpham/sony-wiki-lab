import { z } from "zod";

const wikiSpecEntrySchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(5000),
});

const wikiSpecGroupSchema = z.object({
  group: z.string().trim().min(1).max(120),
  specs: z.array(wikiSpecEntrySchema).max(60),
});

export const wikiCategoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional().default(""),
});

export const wikiProductInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180),
  categoryId: z.string().uuid().nullable().optional().default(null),
  subcategory: z.string().trim().max(120).optional().default(""),
  shortDescription: z.string().trim().max(280).optional().default(""),
  description: z.string().trim().max(20000).optional().default(""),
  mainImage: z.string().trim().max(2000).optional().default(""),
  priceVnd: z.number().int().min(0).nullable().optional().default(null),
  buyLink: z.string().trim().max(2000).optional().default(""),
  gallery: z.array(z.string().trim().min(1).max(2000)).max(30).optional().default([]),
  specGroups: z.array(wikiSpecGroupSchema).max(30).optional().default([]),
  isPublished: z.boolean().optional().default(true),
});

export type WikiCategoryInput = z.infer<typeof wikiCategoryInputSchema>;
export type WikiProductInput = z.infer<typeof wikiProductInputSchema>;
