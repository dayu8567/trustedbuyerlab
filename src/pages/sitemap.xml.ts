import type { APIRoute } from "astro";
import { SECTIONS, type SectionKey } from "../data/blog";
import { SITE } from "../data/site";
import { getAllArticles } from "../lib/articles";

const articles = await getAllArticles();
const sectionKeys = Object.keys(SECTIONS) as SectionKey[];

const pages = [
  { path: "/", priority: "1.0", lastmod: "2026-10-25" },
  { path: "/guides/", priority: "0.9", lastmod: "2026-10-25" },
  ...sectionKeys.map((key) => ({
    path: SECTIONS[key].href,
    priority: "0.8",
    lastmod: "2026-10-25",
  })),
  { path: "/about/", priority: "0.5", lastmod: "2026-10-25" },
  ...articles.map((article) => ({
    path: article.href,
    priority: "0.7",
    lastmod: article.date,
  })),
  { path: "/privacy-policy/", priority: "0.3", lastmod: "2026-10-25" },
  { path: "/terms/", priority: "0.3", lastmod: "2026-10-25" },
  {
    path: "/affiliate-disclosure/",
    priority: "0.3",
    lastmod: "2026-10-25",
  },
];

const uniquePages = [...new Map(pages.map((page) => [page.path, page])).values()];

export const GET: APIRoute = () => {
  const urls = uniquePages
    .map(
      (page) => `  <url>
    <loc>${new URL(page.path, SITE.url).href}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
