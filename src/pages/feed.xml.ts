import type { APIRoute } from "astro";
import { SITE } from "../data/site";
import { getAllArticles } from "../lib/articles";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET: APIRoute = async () => {
  const articles = await getAllArticles();
  const items = articles
    .slice(0, 30)
    .map(
      (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${new URL(article.href, SITE.url).href}</link>
      <guid isPermaLink="true">${new URL(article.href, SITE.url).href}</guid>
      <description>${escapeXml(article.description)}</description>
      <pubDate>${new Date(`${article.date}T12:00:00Z`).toUTCString()}</pubDate>
      <category>${escapeXml(article.category)}</category>
    </item>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${SITE.url}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
