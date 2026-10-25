import { getCollection } from "astro:content";
import {
  articleFromEntry,
  legacyArticles,
  sortArticles,
  type ArticleSummary,
  type SectionKey,
} from "../data/blog";

export function articleSlug(id: string): string {
  return id.replace(/\.md$/, "");
}

export async function getPublishedEntries() {
  return getCollection("articles", ({ data }) => !data.draft);
}

export async function getAllArticles(): Promise<ArticleSummary[]> {
  const entries = await getPublishedEntries();
  return sortArticles([...legacyArticles, ...entries.map(articleFromEntry)]);
}

export async function getArticlesBySection(
  section: SectionKey,
): Promise<ArticleSummary[]> {
  const articles = await getAllArticles();
  return articles.filter((article) => article.category === section);
}

export async function getArticleCounts(): Promise<Record<SectionKey, number>> {
  const articles = await getAllArticles();
  return {
    "pool-robots": articles.filter(
      (article) => article.category === "pool-robots",
    ).length,
    "pool-care": articles.filter(
      (article) => article.category === "pool-care",
    ).length,
    "buying-guides": articles.filter(
      (article) => article.category === "buying-guides",
    ).length,
  };
}
