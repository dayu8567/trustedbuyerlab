import type { APIRoute } from "astro";
import { SITE } from "../data/site";

const pages = [
  { path: "/", priority: "1.0" },
  { path: "/best-cordless-robotic-pool-cleaners/", priority: "0.9" },
  { path: "/privacy-policy/", priority: "0.3" },
  { path: "/terms/", priority: "0.3" },
  { path: "/affiliate-disclosure/", priority: "0.3" },
];

export const GET: APIRoute = () => {
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${new URL(page.path, SITE.url).href}</loc>
    <lastmod>2026-10-25</lastmod>
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
