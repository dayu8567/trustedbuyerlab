# Observatory Validation

## Release Candidate

- Date: 2026-10-25
- Git branch: `refactor/astro-observatory-100`
- Site commit: `198c75162c4c1bb641a4fd8075325e73cf7af543`
- Cloudflare Pages project: `trustedbuyerlab`
- Deployment environment: `preview`
- Deployment ID: `89075943-ad0a-4a68-9250-9f3e32ee5998`
- Preview URL: <https://89075943.trustedbuyerlab.pages.dev>
- Branch alias: <https://refactor-astro-observatory-1.trustedbuyerlab.pages.dev>

## Observatory Result

Cloudflare Observatory was run from `us-central1`. Because the Zone Speed API
only accepts hostnames in the active zone, the exact preview build was served on
a temporary zone subdomain for the test. The preview URL and tested build were
identical.

- Test ID: `ad2bce95-93e4-4fe3-b465-3a221d2b5ef9`
- Tested host: `observatory-preview.trustedbuyerlab.com`
- Mobile performance score: **100**
- Desktop performance score: **100**

| Metric | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | 100 | 100 |
| First Contentful Paint | 1066 ms | 293 ms |
| Largest Contentful Paint | 1162 ms | 315 ms |
| Total Blocking Time | 75 ms | 0 ms |
| Speed Index | 1066 ms | 350 ms |
| Time to Interactive | 1194 ms | 315 ms |
| Cumulative Layout Shift | 0 | 0 |
| Time to First Byte | 76 ms | 59 ms |

## Supporting Checks

- `npm run check`: 27 files, 0 errors, 0 warnings, 0 hints.
- `npm run build`: 7 static pages generated successfully.
- Playwright: 21 page/viewport combinations passed at 1440, 390, and 320 px.
- No broken images, console errors, failed requests, or page-level horizontal
  overflow.
- Cloudflare Pages preview returned the expected CSP, HSTS, frame, MIME, referrer,
  and permissions headers.
- Legacy URL redirects returned 301 responses; unknown routes returned the
  branded 404 page with status 404.

## DNS Guard

The temporary Observatory subdomain, its CNAME, and the isolated Pages project
were removed after the test. The apex `trustedbuyerlab.com` and
`www.trustedbuyerlab.com` DNS records remain unchanged. No production domain was
attached to the Pages project.
