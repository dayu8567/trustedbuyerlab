# Trusted Buyer Lab Home Appliance Blog

## Objective

Transform Trusted Buyer Lab from a pool-product publication into an English
home-appliance blog with five categories, orthogonal editorial formats, original
seed content, and an automated price-brief newsroom. Astro remains a static
Cloudflare Pages site with no runtime SSR or client framework.

## Delivery Guard

- Branch: `refactor/home-appliance-blog`
- Preview deployments only until final approval
- Never change apex or `www` DNS during preview
- Preserve existing affiliate destinations and legal pages
- Legacy pool URLs remain available with `noindex`

## Route Map

| Route | Purpose |
| --- | --- |
| `/` | Trending, lead article, category directory, latest content, price rail |
| `/articles/` | Complete article library |
| `/categories/` | Five-category directory |
| `/kitchen-appliances/` | Kitchen appliance category |
| `/laundry/` | Laundry category |
| `/cleaning/` | Cleaning category |
| `/air-climate/` | Air and climate category |
| `/smart-home/` | Smart-home category |
| `/category/subcategory/` | Product-family listing |
| `/deals/` | Automated price briefs |
| `/reviews/` | Research reviews |
| `/buying-guides/` | Buying guides |
| `/how-to/` | Maintenance and setup guides |
| `/comparisons/` | Adjacent product comparisons |
| `/articles/<slug>/` | New article detail |
| `/feed.xml` | RSS |
| `/sitemap.xml` | Static sitemap |
| `/about/` | Method, AI, and affiliate disclosure |

## Content Model

The Astro Content Collection tracks category, subcategory, format, publication
dates, editorial status, author, sources, product snapshots, image path, and
automation metadata. Human-reviewed and automated content use the same schema
but have distinct layouts and labels.

The first release includes fifteen human-reviewed seed articles, three per
category, covering buying guides, reviews, comparisons, and maintenance.

## Newsroom

1. A scheduled GitHub Actions workflow fetches the PartnerBoost JSON feed.
2. Offers are normalized into a provider-independent contract.
3. Daily price snapshots accumulate in `data/newsroom/price-history.json`.
4. Deterministic code applies freshness, discount, availability, blocklist,
   duplicate, and daily-cap rules.
5. Workers AI returns constrained JSON with an English draft.
6. Validation rejects invented prices, unsupported testing claims, unsafe HTML,
   duplicate titles, or malformed metadata.
7. The workflow runs tests, Astro checks, and the production build.
8. Successful content is committed to the preview branch and deployed with
   Wrangler Direct Upload.

Schedule: `13:10` and `21:10` UTC. Maximum two published briefs per UTC day.
Failed generation remains in the workflow log and is never published.

## Performance And Accessibility

- Local system fonts
- No hydration framework or global client JavaScript
- Pre-optimized local WebP images with explicit dimensions
- One eager above-the-fold image per page
- Responsive CSS with 320, 390, 768, and 1440 px coverage
- Semantic landmarks, one H1 per HTML page, skip link, and visible focus
- Reduced-motion support
- Horizontal overflow forbidden at page level

## SEO And Trust

- Unique title and description per route
- Canonical URLs
- Article and CollectionPage JSON-LD
- RSS and sitemap
- Visible sources and price verification timestamps on automated briefs
- `nofollow sponsored noopener` affiliate links
- No "hands-on tested" claim without testing
- Image attribution page

## Release Gates

- `npm test`, `npm run check`, and `npm run build` pass.
- Playwright full-site matrix passes.
- Cloudflare preview matches the tested commit.
- Legacy URLs return their expected content and noindex directive.
- Observatory desktop and mobile score 100 before production DNS changes.
