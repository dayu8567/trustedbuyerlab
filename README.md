# Trusted Buyer Lab

Static Astro home-appliance publication deployed to Cloudflare Pages.

## Site Structure

- `/` - editorial home with trending stories, category directory, latest content, and price watch
- `/articles/` - complete article library
- `/categories/` - five appliance categories and twenty product subcategories
- `/deals/`, `/reviews/`, `/buying-guides/`, `/how-to/`, `/comparisons/` - editorial format hubs
- `/articles/<slug>/` - research-led Markdown article
- `/feed.xml` - RSS feed
- `/sitemap.xml` - generated XML sitemap
- `/about/` - editorial method, AI disclosure, and affiliate policy
- `/image-credits/` - licensed image attribution

The five top-level categories are Kitchen Appliances, Laundry, Cleaning,
Air & Climate, and Smart Home.

Legacy pool articles remain available at their existing `/guides/...` URLs but
are `noindex`, excluded from navigation, RSS, and sitemap. `/pool-robots/` and
`/pool-care/` redirect to the home page.

## Add An Editorial Article

Create a Markdown file in `src/content/articles/`. New articles publish at
`/articles/<filename>/`.

```yaml
---
title: "Article title"
description: "Search and card summary"
date: "2026-10-26"
category: "kitchen-appliances"
subcategory: "air-fryers"
format: "buying-guides"
readingTime: "7 min read"
image: "/images/articles/article-slug.webp"
imageAlt: "Accessible image description"
imageCredit: "Photo attribution"
featured: false
editorialStatus: "human-reviewed"
author: "editorial"
sources:
  - label: "Source title"
    url: "https://example.com/source"
    publisher: "Publisher"
products: []
---
```

Allowed categories, subcategories, and formats live in
`src/data/taxonomy.ts`.

## Automated Price Briefs

`scripts/newsroom/run.mjs` fetches the PartnerBoost product feed, normalizes
offers, stores daily price history, selects at most two verified price drops,
and asks Workers AI for a constrained JSON draft. Code controls product names,
prices, links, timestamps, affiliate disclosure, and publication metadata.

`PARTNERBOOST_FEED_URL` should be:

```text
https://app.partnerboost.com/api.php?mod=datafeed&op=list
```

`PARTNERBOOST_API_KEY` is the Partner-channel token from Token Manage. The
workflow sends it in the documented POST body and can read up to five 100-item
pages per run.

Required GitHub Actions secrets:

- `PARTNERBOOST_FEED_URL`
- `PARTNERBOOST_API_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The Workers AI model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.

```powershell
npm run newsroom:dry
npm run newsroom
```

The dry run writes to `.newsroom-dry-run/` and never commits or deploys.
Push-triggered workflow smoke tests are dry runs by default. Add
`[newsroom-live]` to the commit message when a push should execute the live
newsroom. Successful live runs deploy both the preview branch and the
`main` production environment used by `trustedbuyerlab.com`.

Automated publishing rules:

- Runs daily at `13:10` and `21:10` UTC.
- Publishes at least one article each UTC day. If no offer meets the discount thresholds, the first run publishes a clearly labeled daily price check instead.
- Uses a North American seasonal calendar: fans are excluded in autumn and winter, while heating, humidification, indoor-air, cold-weather cleaning, coffee, and holiday kitchen topics are prioritized.
- Falls back to a maintained seasonal editorial guide when no product offer is both in season and suitable for publication, so the daily update does not force an off-season deal.
- Offer updated within 48 hours and currently available.
- At least 10% below the trailing 30-day median or 15% below the supplied list price.
- No repeat for 14 days unless the price improves another 5%.
- Maximum two briefs per UTC day.
- Draft must pass prohibited-claim, price, source, schema, duplicate, and build checks.

Product-feed images are validated, resized, metadata-stripped, and stored
locally as WebP. Invalid or undersized images cause the offer to fail rather
than hotlink a remote resource.

## Commands

```powershell
npm test
npm run check
npm run build
npm run preview
npm run newsroom:dry
node scripts/qa.mjs
```

Playwright QA covers 1440, 768, 390, and 320 px. It checks pages, subcategories,
format hubs, all published articles, legacy noindex behavior, RSS, sitemap,
canonical URLs, H1 counts, image loading, console errors, failed requests,
horizontal overflow, and mobile navigation.

## Deployment Guard

Work on `refactor/home-appliance-blog` and deploy only to the Cloudflare Pages
preview branch until Observatory desktop and mobile both reach 100. The
production domain and DNS must stay unchanged during preview validation.

## Observatory Validation

`.github/workflows/observatory-validation.yml` deploys the exact build to a
unique temporary Pages project, attaches a unique proxied subdomain under
`trustedbuyerlab.com`, runs the Speed API in `us-central1`, stores the JSON
result, and removes the temporary DNS record, custom domain, and Pages project.

The Cloudflare API token needs these additional permissions on the
`trustedbuyerlab.com` zone:

- `DNS` → `Edit`
- `Zone Settings` → `Edit`

The workflow snapshots apex and `www` DNS records before the run and verifies
they are unchanged during cleanup.
