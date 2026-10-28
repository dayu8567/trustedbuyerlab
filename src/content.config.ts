import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const categories = [
  "kitchen-appliances",
  "laundry",
  "cleaning",
  "air-climate",
  "smart-home",
  "pool-robots",
  "pool-care",
  "buying-guides",
] as const;

const formats = [
  "deals",
  "reviews",
  "buying-guides",
  "how-to",
  "comparisons",
] as const;

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    updatedAt: z.string().optional(),
    category: z.enum(categories),
    subcategory: z.string().default("legacy"),
    format: z.enum(formats).default("buying-guides"),
    readingTime: z.string(),
    imageKey: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string(),
    imageCredit: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    legacy: z.boolean().default(false),
    editorialStatus: z
      .enum(["human-reviewed", "automated"])
      .default("human-reviewed"),
    author: z.enum(["editorial", "newsroom"]).default("editorial"),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.url(),
          publisher: z.string().optional(),
        }),
      )
      .default([]),
    products: z
      .array(
        z.object({
          name: z.string(),
          brand: z.string(),
          model: z.string().optional(),
          retailer: z.string(),
          affiliateUrl: z.url(),
          price: z.number().positive(),
          currency: z.string().length(3),
          listPrice: z.number().positive().optional(),
          availability: z.string(),
          checkedAt: z.string(),
        }),
      )
      .default([]),
    automation: z
      .object({
        model: z.string(),
        promptVersion: z.string(),
        selectionBasis: z.enum(["discount", "daily-snapshot"]).optional(),
        generatedAt: z.string(),
      })
      .optional(),
  }),
});

export const collections = { articles };
