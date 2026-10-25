import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import aboveGroundImage from "../assets/images/scene-above-ground.jpg";
import debrisImage from "../assets/images/scene-debris.jpg";
import heroImage from "../assets/images/scene-hero-beatbot.jpg";
import ingroundImage from "../assets/images/scene-large-inground.jpg";
import wallImage from "../assets/images/scene-wall-waterline.jpg";
import wybotImage from "../assets/images/scene-wybot-c1.jpg";
import soraImage from "../assets/images/beatbot-sora-30.jpg";
import cordlessImage from "../assets/images/wybot-c2.jpg";

export const SECTIONS = {
  "pool-robots": {
    label: "Pool Robots",
    eyebrow: "Robots and gear",
    href: "/pool-robots/",
    description:
      "Model comparisons, feature explainers, and practical guidance for choosing a robotic pool cleaner.",
  },
  "pool-care": {
    label: "Pool Care",
    eyebrow: "Maintenance",
    href: "/pool-care/",
    description:
      "Simple routines and buying advice for cleaner water, easier maintenance, and fewer surprises.",
  },
  "buying-guides": {
    label: "Buying Guides",
    eyebrow: "Shop smarter",
    href: "/buying-guides/",
    description:
      "Decision frameworks that turn long specification lists into the few details that matter.",
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;

export interface ArticleSummary {
  id: string;
  title: string;
  description: string;
  href: string;
  category: SectionKey;
  date: string;
  dateLabel: string;
  readingTime: string;
  kicker: string;
  image: ImageMetadata;
  imageAlt: string;
  featured?: boolean;
}

const imageMap = {
  aboveGround: aboveGroundImage,
  cordless: cordlessImage,
  debris: debrisImage,
  hero: heroImage,
  inground: ingroundImage,
  sora: soraImage,
  wall: wallImage,
  wybot: wybotImage,
} satisfies Record<string, ImageMetadata>;

export type ArticleImageKey = keyof typeof imageMap;

export function articleImage(key: string): ImageMetadata {
  return imageMap[key as ArticleImageKey] ?? heroImage;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export const legacyArticles: ArticleSummary[] = [
  {
    id: "beatbot-sora-comparison",
    title: "Beatbot Sora 70 vs 30 vs 10: Which Model Fits Your Pool?",
    description:
      "A full-pool comparison of the Sora 70, Sora 30, and Sora 10, from floating debris and wall coverage to runtime and value.",
    href: "/guides/beatbot-sora-robotic-pool-cleaner/",
    category: "pool-robots",
    date: "2026-10-25",
    dateLabel: "Oct 25, 2026",
    readingTime: "9 min read",
    kicker: "Model comparison",
    image: heroImage,
    imageAlt: "Beatbot Sora robotic pool cleaner at the water surface",
    featured: true,
  },
  {
    id: "cordless-comparison",
    title: "Best Cordless Robotic Pool Cleaners 2026: Beatbot vs WYBOT",
    description:
      "Compare three cordless pool cleaners by coverage, runtime, filtration, scheduling, and the pool types they suit.",
    href: "/best-cordless-robotic-pool-cleaners/",
    category: "buying-guides",
    date: "2026-10-25",
    dateLabel: "Oct 25, 2026",
    readingTime: "8 min read",
    kicker: "2026 comparison",
    image: wybotImage,
    imageAlt: "WYBOT cordless robotic pool cleaner in a pool",
    featured: true,
  },
];

export function articleFromEntry(
  entry: CollectionEntry<"articles">,
): ArticleSummary {
  return {
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    href: `/guides/${entry.id}/`,
    category: entry.data.category,
    date: entry.data.date,
    dateLabel: formatDate(entry.data.date),
    readingTime: entry.data.readingTime,
    kicker: SECTIONS[entry.data.category].eyebrow,
    image: articleImage(entry.data.imageKey),
    imageAlt: entry.data.imageAlt,
    featured: entry.data.featured,
  };
}

export function sortArticles(articles: ArticleSummary[]): ArticleSummary[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}
