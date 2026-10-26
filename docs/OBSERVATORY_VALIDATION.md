# Observatory And Preview Validation

## Current Candidate

- Date: 2026-10-26
- Branch: `refactor/home-appliance-blog`
- Local production build: 65 pages
- Indexable sitemap URLs: 55
- RSS items: 17
- Cloudflare Pages project: `trustedbuyerlab`
- Target preview branch: `refactor/home-appliance-blog`
- Preview URL: <https://refactor-home-appliance-blog.trustedbuyerlab.pages.dev/>

## Local Release Checks

- `npm test`: 8 tests passed.
- `npm run check`: 57 files, 0 errors, 0 warnings, 0 hints.
- `npm run build`: 65 static pages generated.
- Playwright: 50 route/resource targets at 1440, 768, 390, and 320 px, 200 checks total.
- No broken images, page-level horizontal overflow, unexpected console errors,
  failed requests, canonical mismatches, robots mismatches, or missing H1 tags.
- Mobile navigation opened successfully in every tested HTML page and viewport.
- Legacy pool articles retain their URLs and return `noindex`.
- `/pool-robots/` and `/pool-care/` redirect to `/`.
- `npm run newsroom:dry` generated a fixture price brief without modifying
  production content or deployment state.

## Preview Deployment Status

The GitHub Actions `Cloudflare Pages preview` workflow completed and published
the preview branch successfully after these repository secrets were configured:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Validated on the public preview:

- `/`, `/articles/`, `/categories/`, a subcategory listing, and an article page
  all return HTTP 200 with one H1.
- `/pool-robots/` returns HTTP 301 to `/`.
- Legacy pool articles remain available with `noindex, nofollow`.
- CSP, HSTS, frame protection, MIME sniffing protection, referrer policy, and
  permissions policy are present.
- Cloudflare adds `X-Robots-Tag: noindex` to this branch preview, which is
  appropriate for a non-production deployment.

No production DNS or custom-domain attachment was changed during this preview
stage. The later production release is recorded below.

## Observatory Status

Observatory was run on an isolated Pages project serving the exact build from
commit `8bd3184`:

- GitHub Actions run: <https://github.com/dayu8567/trustedbuyerlab/actions/runs/40324088730>
- Test region: `us-central1`
- Temporary host: `observatory-40324088730.trustedbuyerlab.com`
- Desktop performance score: **100**
- Mobile performance score: **100**
- Result artifact: `observatory-result`

The validation script only exits successfully after both device reports reach
100 and cleanup reports no errors.

After the test, the temporary DNS record, Pages custom domain, and isolated Pages
project were removed. A public DNS lookup for the temporary hostname no longer
returns an address. The apex `trustedbuyerlab.com` and `www` records remain in
place, and no production DNS change was made.

## Automated Newsroom

- PartnerBoost read-only probe: 163 normalized appliance offers
  - Run: <https://github.com/dayu8567/trustedbuyerlab/actions/runs/40338344879>
- Successful live run:
  <https://github.com/dayu8567/trustedbuyerlab/actions/runs/40339496924>
- Automated content commit: `ecc291d`
- Cloudflare preview deployment:
  <https://github.com/dayu8567/trustedbuyerlab/actions/runs/40339962030>
- Published articles: 2, matching the configured daily cap
- Generated pages return HTTP 200 and appear in `/deals/`, RSS, and sitemap

Generated articles:

- `/articles/price-watch-vza01a124-8531642515653-45490383585477-2026-10-26/`
- `/articles/price-watch-vza01b103agd-ble-8502103474373-45329773854917-2026-10-26/`

The final URL for the second generated article is recorded in
`data/newsroom/published.json`.

The three workflow files were added to the default branch in commit `576e4a4`
without merging the Astro site into `main`. This enables GitHub's manual
`Run workflow` controls and the recurring Newsroom schedule. The workflows still
check out `refactor/home-appliance-blog` for the actual content and deployment.

The branch workflow also supports explicit live push runs with
`[newsroom-live]`; ordinary newsroom code pushes run the fixture and read-only
PartnerBoost probe without publishing.

## Production Release

- Release workflow:
  <https://github.com/dayu8567/trustedbuyerlab/actions/runs/40342991327>
- Release commit: `b197ce2`
- Production branch in Cloudflare Pages: `main`
- `trustedbuyerlab.com`: HTTP 200, new Trusted Buyer Lab home-appliance site
- `www.trustedbuyerlab.com`: HTTP 200, new Trusted Buyer Lab home-appliance site
- Both hostnames are served by the `trustedbuyerlab` Cloudflare Pages project.
- CSP, HSTS, frame protection, permissions policy, and other security headers
  are active.
- Production responses use `index, follow`; Cloudflare preview `noindex` does not
  apply to the custom domains.
- Production sitemap: 55 URLs, all using `https://trustedbuyerlab.com`
- Production RSS: 17 articles, including both automated price briefs

The release workflow saved the original apex and `www` routing records in the
`production-release` artifact before replacing them. The original GitHub Pages
A records and `www` CNAME are no longer active.
