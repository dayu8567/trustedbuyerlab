import type { APIRoute } from "astro";
import { SITE } from "../data/site";
import {
  CATEGORIES,
  FORMATS,
  SUBCATEGORIES,
  type CategoryKey,
  type FormatKey,
  type SubcategoryKey,
} from "../data/taxonomy";
import { getAllArticles } from "../lib/articles";

const articles = await getAllArticles();
const lastmod = articles[0]?.date ?? "2026-10-26";
const pages = [
  { path: "/", priority: "1.0", lastmod },
  { path: "/articles/", priority: "0.9", lastmod },
  { path: "/categories/", priority: "0.8", lastmod },
  ...(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => ({
    path: CATEGORIES[key].href,
    priority: "0.8",
    lastmod,
  })),
  ...(Object.keys(SUBCATEGORIES) as SubcategoryKey[]).map((key) => ({
    path: SUBCATEGORIES[key].href,
    priority: "0.7",
    lastmod,
  })),
  ...(Object.keys(FORMATS) as FormatKey[]).map((key) => ({
    path: FORMATS[key].href,
    priority: "0.7",
    lastmod,
  })),
  ...articles.map((article) => ({
    path: article.href,
    priority: "0.7",
    lastmod: article.date,
  })),
  { path: "/about/", priority: "0.5", lastmod: "2026-10-26" },
  { path: "/image-credits/", priority: "0.2", lastmod: "2026-10-26" },
  { path: "/privacy-policy/", priority: "0.2", lastmod: "2026-10-26" },
  { path: "/terms/", priority: "0.2", lastmod: "2026-10-26" },
  { path: "/affiliate-disclosure/", priority: "0.2", lastmod: "2026-10-26" },
];

const uniquePages = [...new Map(pages.map((page) => [page.path, page])).values()];

export const GET: APIRoute = () => {
  const urls = uniquePages
    .map(
      (page) => `  <url>
    <loc>${new URL(page.path, SITE.url).href}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
};
