import { getCollection } from "astro:content";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  articleFromEntry,
  sortArticles,
  type ArticleSummary,
} from "../data/blog";
import {
  CATEGORIES,
  FORMATS,
  SUBCATEGORIES,
  type CategoryKey,
  type FormatKey,
  type SubcategoryKey,
} from "../data/taxonomy";

export function articleSlug(id: string): string {
  return id.replace(/\.md$/, "");
}

export async function getPublishedEntries() {
  return getCollection(
    "articles",
    ({ data }) => !data.draft && !data.legacy,
  );
}

export async function getLegacyEntries() {
  return getCollection("articles", ({ data }) => data.legacy);
}

export async function getAllArticles(): Promise<ArticleSummary[]> {
  const entries = await getPublishedEntries();
  return dedupeByTitle(sortArticles(entries.map(articleFromEntry)));
}

const normalizeTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function dedupeByTitle(articles: ArticleSummary[]): ArticleSummary[] {
  const seen = new Set<string>();
  return articles.filter((article) => {
    const key = normalizeTitle(article.title);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const imageHashCache = new Map<string, Promise<string>>();

function imageHash(image: string): Promise<string> {
  if (!image.startsWith("/images/")) return Promise.resolve(image);
  const cached = imageHashCache.get(image);
  if (cached) return cached;
  const pending = readFile(resolve(process.cwd(), "public", image.slice(1)))
    .then((bytes) => createHash("sha256").update(bytes).digest("hex"))
    .catch(() => image);
  imageHashCache.set(image, pending);
  return pending;
}

export async function getListingArticles(): Promise<ArticleSummary[]> {
  const articles = await getAllArticles();
  const seenImages = new Set<string>();
  const unique: ArticleSummary[] = [];
  for (const article of articles) {
    const hash = await imageHash(article.image);
    if (seenImages.has(hash)) continue;
    seenImages.add(hash);
    unique.push(article);
  }
  return unique;
}

export async function getArticlesByCategory(
  category: CategoryKey,
): Promise<ArticleSummary[]> {
  return (await getListingArticles()).filter(
    (article) => article.category === category,
  );
}

export async function getArticlesBySubcategory(
  subcategory: SubcategoryKey,
): Promise<ArticleSummary[]> {
  return (await getListingArticles()).filter(
    (article) => article.subcategory === subcategory,
  );
}

export async function getArticlesByFormat(
  format: FormatKey,
): Promise<ArticleSummary[]> {
  return (await getListingArticles()).filter(
    (article) => article.format === format,
  );
}

export async function getCategoryCounts(): Promise<Record<CategoryKey, number>> {
  const articles = await getListingArticles();
  return Object.fromEntries(
    Object.keys(CATEGORIES).map((category) => [
      category,
      articles.filter((article) => article.category === category).length,
    ]),
  ) as Record<CategoryKey, number>;
}

export async function getFormatCounts(): Promise<Record<FormatKey, number>> {
  const articles = await getAllArticles();
  return Object.fromEntries(
    Object.keys(FORMATS).map((format) => [
      format,
      articles.filter((article) => article.format === format).length,
    ]),
  ) as Record<FormatKey, number>;
}

export async function getSubcategoryCounts(): Promise<
  Record<SubcategoryKey, number>
> {
  const articles = await getAllArticles();
  return Object.fromEntries(
    Object.keys(SUBCATEGORIES).map((subcategory) => [
      subcategory,
      articles.filter((article) => article.subcategory === subcategory).length,
    ]),
  ) as Record<SubcategoryKey, number>;
}

export async function getRelatedArticles(
  article: ArticleSummary,
  limit = 3,
): Promise<ArticleSummary[]> {
  const articles = await getListingArticles();
  const candidates = articles.filter((candidate) => candidate.id !== article.id);
  const sameCategory = candidates.filter(
    (candidate) => candidate.category === article.category,
  );
  const sameFormat = candidates.filter(
    (candidate) =>
      candidate.category !== article.category &&
      candidate.format === article.format,
  );
  return [...sameCategory, ...sameFormat].slice(0, limit);
}
