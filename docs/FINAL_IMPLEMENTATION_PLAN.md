# Trusted Buyer Lab Final Implementation Plan

## 1. Objective

Rebuild Trusted Buyer Lab as a static-first Astro site for Cloudflare Pages while
preserving the existing affiliate content, URLs, disclosures, and analytics
contract. The release gate is a Cloudflare Observatory score of 100 for both
desktop and mobile before production DNS is changed.

## 2. Delivery Guards

- Work only on `refactor/astro-observatory-100`.
- Deploy the branch as a Cloudflare Pages Preview deployment.
- Do not attach `trustedbuyerlab.com` or change production DNS in this phase.
- Keep `main` as the live branch until the preview passes all release gates.
- Preserve all affiliate destinations and their `nofollow sponsored` attributes.

## 3. Route Map

| Route | Purpose | Source |
| --- | --- | --- |
| `/` | Editorial blog home, lead story, latest articles, and section navigation | New |
| `/guides/` | Complete article library organized by section | New |
| `/pool-robots/` | Pool robot section index | New |
| `/pool-care/` | Pool care section index | New |
| `/buying-guides/` | Buying guide section index | New |
| `/guides/<slug>/` | Markdown article detail route | New content collection |
| `/guides/beatbot-sora-robotic-pool-cleaner/` | Beatbot Sora 70 / 30 / 10 comparison | Previous home page |
| `/best-cordless-robotic-pool-cleaners/` | Three-model cordless pool robot comparison | Existing `best-robotic-pool-cleaners-2026.html` |
| `/about/` | Editorial method and disclosure | New |
| `/privacy-policy/` | Privacy policy | Existing legal page |
| `/terms/` | Terms of use | Existing legal page |
| `/affiliate-disclosure/` | Affiliate disclosure | Existing legal page |
| `/thank-you/` | Affiliate redirect completion page | Existing page |
| `/404.html` | Branded not-found page | New |

Legacy `.html` URLs and `/best-cordless-robotic-pool-cleaners.html` receive 301
redirects to the canonical slash-terminated routes. Keep the Google verification
file and merchant verification meta tag.

## 4. Architecture

- Astro static output with no SSR adapter and no Pages Functions.
- Shared layouts and components for metadata, navigation, footer, product cards,
  comparison tables, disclosures, and structured data.
- Markdown articles in Astro Content Collections for the blog library and article
  routes.
- Typed TypeScript modules for section definitions, image mapping, product copy,
  links, specs, and rankings.
- Small reusable CSS layer with design tokens and responsive layout primitives.
- Native `<details>` elements for FAQ behavior. No Alpine, no client framework,
  and no CDN-hosted CSS.
- One tiny local module may collect affiliate-click data. Google Tag Manager is
  loaded only after user interaction and only when a public container ID is set.

## 5. Performance Budget

| Metric | Budget |
| --- | --- |
| First-party CSS | <= 24 KB gzip |
| First-party JS | <= 2 KB gzip |
| Hero image | <= 120 KB at the delivered breakpoint |
| Total initial transfer | <= 450 KB |
| Render-blocking third-party requests | 0 |
| Layout shift | 0 |
| LCP target | <= 1.2 s on Observatory mobile profile |
| TBT target | < 50 ms |

- Use locally hosted AVIF or WebP images with `srcset`, `sizes`, explicit
  dimensions, and `loading="lazy"` below the fold.
- Preload the selected hero image and use `fetchpriority="high"`.
- Inline the production stylesheet during the build.
- Use only system fonts.
- Keep all decorative effects within CSS and honor reduced-motion.
- Avoid fixed overlays that obscure content on small screens.

## 6. Accessibility And UX

- Semantic header, nav, main, section, article, and footer landmarks.
- A visible-on-focus skip link and visible focus states.
- One H1 per page with a logical heading order.
- WCAG AA color contrast for body text, buttons, labels, and disclosures.
- Descriptive link text; icon-only controls are avoided.
- Tables include captions and scoped headers.
- Touches at least 44 by 44 CSS pixels on mobile.
- Text and controls must not overlap at 320 px, 375 px, 768 px, or 1440 px.
- Responsive tables may scroll horizontally, but page-level horizontal overflow
  is forbidden.

## 7. SEO And Metadata

- Canonical URL on every indexable page.
- Unique title, description, Open Graph, and Twitter metadata.
- `Organization`, `WebPage`, `ItemList`, and `FAQPage` JSON-LD where applicable.
- XML sitemap generated at build time.
- `robots.txt` references the production sitemap.
- Stable 301 redirects for legacy routes.
- Keep the existing Google site verification token.

## 8. Security And Cloudflare Pages

- `_headers` provides CSP, HSTS, frame protection, MIME sniffing protection,
  referrer policy, permissions policy, and immutable asset caching.
- CSP blocks unknown scripts and third-party images; navigation to affiliate
  domains remains allowed.
- `_redirects` handles legacy paths.
- Cloudflare Pages project uses `npm run build` and output directory `dist`.
- Preview deployment is created from `refactor/astro-observatory-100`.
- Custom domain attachment is intentionally out of scope for this phase.

## 9. Content And Conversion

- Organize content into Pool Robots, Pool Care, and Buying Guides sections.
- Keep the home page focused on the publication and its newest useful guides,
  not on one product model.
- Preserve product order, affiliate links, current disclosures, and research-only
  disclaimers on commercial comparison pages.
- Use consistent CTA language and track outbound affiliate clicks with product,
  rank, category, network, page type, and destination data.
- Keep the buyer guidance specific: pool size, wall and waterline needs, runtime,
  filtration, retrieval, and scheduling.

## 10. Implementation Sequence

1. Create and push `refactor/astro-observatory-100`.
2. Add Astro project configuration, article collection, section data, layouts,
   and shared blog components.
3. Localize and optimize all visual assets used above the fold.
4. Build the home, article library, section indexes, article detail template,
   legal pages, thank-you, 404, sitemap, robots, and redirects.
5. Add security headers and deferred analytics behavior.
6. Run Astro checks, production build, local route checks, and Playwright visual
   checks at desktop and mobile widths.
7. Create a Cloudflare Pages project and deploy the branch to a Preview URL.
8. Run Cloudflare Observatory on the Preview URL for desktop and mobile.
9. Tune until both runs report 100 in every category.
10. Stop before custom-domain or production DNS changes and report the preview
    URL plus evidence for the release gate.

## 11. Acceptance Criteria

- `npm run check` and `npm run build` pass.
- No broken internal links or missing assets on the preview.
- No console errors and no hydration or framework JavaScript.
- Observatory desktop score: 100.
- Observatory mobile score: 100.
- Production DNS remains unchanged.
- Preview is accessible from a `*.pages.dev` deployment URL.
