import type { CollectionEntry } from "astro:content";
import type { AuthorId } from "./authors";
import {
  CATEGORIES,
  FORMATS,
  type CategoryKey,
  type FormatKey,
  type SubcategoryKey,
} from "./taxonomy";

export interface ArticleSource {
  label: string;
  url: string;
  publisher?: string;
}

export interface ProductSnapshot {
  name: string;
  brand: string;
  model?: string;
  retailer: string;
  affiliateUrl: string;
  price: number;
  currency: string;
  listPrice?: number;
  availability: string;
  checkedAt: string;
}

export interface AutomationMeta {
  model: string;
  promptVersion: string;
  generatedAt: string;
}

export interface ArticleSummary {
  id: string;
  title: string;
  description: string;
  href: string;
  category: CategoryKey;
  subcategory: SubcategoryKey;
  format: FormatKey;
  date: string;
  dateLabel: string;
  updatedLabel?: string;
  readingTime: string;
  kicker: string;
  image: string;
  imageAlt: string;
  imageCredit?: string;
  featured?: boolean;
  editorialStatus: "human-reviewed" | "automated";
  author: AuthorId;
  sources: ArticleSource[];
  products: ProductSnapshot[];
  automation?: AutomationMeta;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function articleFromEntry(
  entry: CollectionEntry<"articles">,
): ArticleSummary {
  const category = entry.data.category as CategoryKey;
  const format = entry.data.format as FormatKey;
  const subcategory = entry.data.subcategory as SubcategoryKey;

  return {
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    href: `/articles/${entry.id}/`,
    category,
    subcategory,
    format,
    date: entry.data.date,
    dateLabel: formatDate(entry.data.date),
    updatedLabel: entry.data.updatedAt
      ? formatDate(entry.data.updatedAt)
      : undefined,
    readingTime: entry.data.readingTime,
    kicker: FORMATS[format].eyebrow,
    image: entry.data.image ?? "/images/articles/placeholder-home-appliance.webp",
    imageAlt: entry.data.imageAlt,
    imageCredit: entry.data.imageCredit,
    featured: entry.data.featured,
    editorialStatus: entry.data.editorialStatus,
    author: entry.data.author as AuthorId,
    sources: entry.data.sources,
    products: entry.data.products,
    automation: entry.data.automation,
  };
}

export function sortArticles(articles: ArticleSummary[]): ArticleSummary[] {
  return [...articles].sort((a, b) => {
    const dateOrder = b.date.localeCompare(a.date);
    return dateOrder || a.title.localeCompare(b.title);
  });
}

export function categoryLabel(category: CategoryKey): string {
  return CATEGORIES[category].label;
}
