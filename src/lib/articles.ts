import { getCollection } from "astro:content";
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
  return sortArticles(entries.map(articleFromEntry));
}

export async function getArticlesByCategory(
  category: CategoryKey,
): Promise<ArticleSummary[]> {
  return (await getAllArticles()).filter(
    (article) => article.category === category,
  );
}

export async function getArticlesBySubcategory(
  subcategory: SubcategoryKey,
): Promise<ArticleSummary[]> {
  return (await getAllArticles()).filter(
    (article) => article.subcategory === subcategory,
  );
}

export async function getArticlesByFormat(
  format: FormatKey,
): Promise<ArticleSummary[]> {
  return (await getAllArticles()).filter(
    (article) => article.format === format,
  );
}

export async function getCategoryCounts(): Promise<Record<CategoryKey, number>> {
  const articles = await getAllArticles();
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
  const articles = await getAllArticles();
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
