# Trusted Buyer Lab

Static Astro site for Trusted Buyer Lab, deployed to Cloudflare Pages.

## Site Structure

- `/` - editorial blog home with a lead story, latest articles, and section navigation
- `/guides/` - complete article library
- `/pool-robots/` - robotic cleaner and equipment coverage
- `/pool-care/` - maintenance and ownership guidance
- `/buying-guides/` - purchase frameworks and model comparisons
- `/guides/<slug>/` - Markdown article detail pages
- `/about/` - editorial approach and disclosure information

The two in-depth legacy comparison pages retain their established URLs:

- `/guides/beatbot-sora-robotic-pool-cleaner/`
- `/best-cordless-robotic-pool-cleaners/`

## Add An Article

Create a Markdown file in `src/content/articles/`. The filename becomes the URL
slug under `/guides/`.

```yaml
---
title: "Article title"
description: "Search and card summary"
date: "2026-10-25"
category: "pool-robots" # pool-robots | pool-care | buying-guides
readingTime: "6 min read"
imageKey: "hero" # see src/data/blog.ts
imageAlt: "Accessible image description"
featured: false
draft: false
---
```

The home page, library page, section pages, article route, related articles, and
sitemap all update automatically. Add new image keys in `src/data/blog.ts` when
an article needs another image.

## Commands

```powershell
npm run check
npm run build
npm run preview
node scripts/qa.mjs
```

Playwright QA runs at 1440, 390, and 320 px. It checks all published articles,
section pages, legal routes, the 404 page, canonical URLs, H1 counts, images,
console errors, failed requests, horizontal overflow, and the mobile menu.

## Deployment Guard

Work on `refactor/astro-observatory-100` and deploy only as a Cloudflare Pages
Preview until desktop and mobile Observatory scores are both 100. Do not attach
the production domain or change production DNS during the preview phase.
