import { chromium } from "playwright";
import { mkdir, readdir, writeFile } from "node:fs/promises";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:4321";
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = ".qa";

const articleFiles = await readdir("src/content/articles");
const markdownArticles = articleFiles
  .filter((file) => file.endsWith(".md"))
  .map((file) => file.replace(/\.md$/, ""));
const legacyArticleSlugs = new Set([
  "above-ground-pool-robot-guide",
  "cordless-pool-robot-buying-checklist",
  "cordless-vs-corded-pool-cleaners",
  "pool-robot-maintenance-and-storage",
  "pool-robot-runtime-and-coverage",
  "wall-and-waterline-cleaning-guide",
]);

const pages = [
  { path: "/", name: "home" },
  { path: "/articles/", name: "all-articles" },
  { path: "/categories/", name: "categories" },
  { path: "/kitchen-appliances/", name: "kitchen-appliances" },
  { path: "/laundry/", name: "laundry" },
  { path: "/cleaning/", name: "cleaning" },
  { path: "/air-climate/", name: "air-climate" },
  { path: "/smart-home/", name: "smart-home" },
  { path: "/deals/", name: "deals" },
  { path: "/reviews/", name: "reviews" },
  { path: "/buying-guides/", name: "buying-guides" },
  { path: "/how-to/", name: "how-to" },
  { path: "/comparisons/", name: "comparisons" },
  { path: "/kitchen-appliances/air-fryers/", name: "air-fryers" },
  { path: "/laundry/washing-machines/", name: "washing-machines" },
  { path: "/cleaning/robot-vacuums/", name: "robot-vacuums" },
  { path: "/air-climate/humidifiers/", name: "humidifiers" },
  { path: "/smart-home/video-doorbells/", name: "video-doorbells" },
  { path: "/about/", name: "about" },
  { path: "/image-credits/", name: "image-credits" },
  {
    path: "/guides/beatbot-sora-robotic-pool-cleaner/",
    name: "sora-comparison",
    expectedRobots: "noindex",
  },
  {
    path: "/best-cordless-robotic-pool-cleaners/",
    name: "cordless-comparison",
    expectedRobots: "noindex",
  },
  ...markdownArticles.map((slug) => {
    const legacy = legacyArticleSlugs.has(slug);
    return {
      path: legacy ? `/guides/${slug}/` : `/articles/${slug}/`,
      name: slug,
      expectedRobots: legacy ? "noindex" : "index",
    };
  }),
  {
    path: "/feed.xml",
    name: "rss",
    expectedCanonical: null,
    expectedH1: null,
    expectedRobots: null,
  },
  {
    path: "/sitemap.xml",
    name: "sitemap",
    expectedCanonical: null,
    expectedH1: null,
    expectedRobots: null,
  },
  { path: "/privacy-policy/", name: "privacy" },
  { path: "/terms/", name: "terms" },
  { path: "/affiliate-disclosure/", name: "affiliate-disclosure" },
  { path: "/thank-you/", name: "thank-you", expectedRobots: "noindex" },
  {
    path: "/missing-page-for-qa/",
    name: "not-found",
    expectedStatus: 404,
    expectedCanonical: "/404.html",
    expectedRobots: "noindex",
  },
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "tablet", width: 768, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "small", width: 320, height: 700 },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});

const report = [];

for (const target of pages) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", (request) => {
      failedRequests.push({
        url: request.url(),
        error: request.failure()?.errorText ?? "unknown",
      });
    });

    await page.addInitScript(() => {
      window.__qaMetrics = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) window.__qaMetrics.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__qaMetrics.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });

    const response = await page.goto(`${baseUrl}${target.path}`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await page.evaluate(() => document.fonts.ready);

    // Walk the document so native lazy-loaded images and responsive sources are
    // requested before screenshots and broken-image checks run.
    const lastScrollPosition = await page.evaluate(async () => {
      const pause = (duration) =>
        new Promise((resolve) => window.setTimeout(resolve, duration));
      const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await pause(40);
      }
      const bottom = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      window.scrollTo(0, bottom);
      await pause(80);
      return window.scrollY;
    });
    await page.waitForFunction(
      () =>
        [...document.images].every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      null,
      { timeout: 10_000 },
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(60);

    let mobileMenuWorks = null;
    if (viewport.width <= 900 && target.expectedH1 !== null) {
      const menu = page.locator(".mobile-menu");
      const summary = menu.locator("summary");
      await summary.click();
      mobileMenuWorks = await menu.locator(".mobile-menu-panel").isVisible();
      await summary.click();
    }

    const result = await page.evaluate(() => {
      const images = [...document.images];
      const resources = performance.getEntriesByType("resource");
      const navigation = performance.getEntriesByType("navigation")[0];
      return {
        title: document.title,
        lang: document.documentElement.lang,
        h1Count: document.querySelectorAll("h1").length,
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyHeight: document.body.scrollHeight,
        imageCount: images.length,
        brokenImages: images
          .filter((image) => !image.complete || image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        lcp: window.__qaMetrics?.lcp ?? 0,
        cls: window.__qaMetrics?.cls ?? 0,
        transferBytes:
          resources.reduce(
            (sum, resource) => sum + (resource.transferSize || 0),
            0,
          ) + (navigation?.transferSize || 0),
        resourceCount: resources.length,
        scripts: [...document.scripts].map((script) => ({
          src: script.src,
          inline: !script.src,
          type: script.type,
        })),
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        robots: document
          .querySelector('meta[name="robots"]')
          ?.getAttribute("content"),
      };
    });

    const screenshot = `${outputDir}/${target.name}-${viewport.name}.png`;
    await page.screenshot({ path: screenshot, fullPage: true });

    report.push({
      page: target.path,
      viewport: viewport.name,
      status: response?.status() ?? null,
      expectedStatus: target.expectedStatus ?? 200,
      expectedCanonical:
        target.expectedCanonical === null
          ? null
          : `https://trustedbuyerlab.com${target.expectedCanonical ?? target.path}`,
      expectedRobots:
        target.expectedRobots === null ? null : (target.expectedRobots ?? "index"),
      expectedH1: target.expectedH1 === null ? null : (target.expectedH1 ?? 1),
      mobileMenuWorks,
      lastScrollPosition,
      screenshot,
      consoleErrors,
      failedRequests,
      ...result,
    });

    await context.close();
  }
}

await browser.close();
await writeFile(`${outputDir}/report.json`, JSON.stringify(report, null, 2));

for (const item of report) {
  const overflow = item.scrollWidth > item.viewportWidth;
  const canonicalMatches =
    item.expectedCanonical === null || item.canonical === item.expectedCanonical;
  const robotsMatches =
    item.expectedRobots === null || item.robots?.startsWith(item.expectedRobots);
  const h1Matches = item.expectedH1 === null || item.h1Count === item.expectedH1;
  console.log(
    `${item.page} ${item.viewport}: status=${item.status} ` +
      `expected=${item.expectedStatus} overflow=${overflow} ` +
      `h1=${item.h1Count} h1ok=${h1Matches} canonical=${canonicalMatches} robots=${robotsMatches} ` +
      `broken=${item.brokenImages.length} errors=${item.consoleErrors.length} ` +
      `transfer=${Math.round(item.transferBytes / 1024)}KB lcp=${Math.round(item.lcp)}ms ` +
      `cls=${item.cls.toFixed(3)}`,
  );
}

const failures = report.filter(
  (item) => {
    const h1Matches =
      item.expectedH1 === null || item.h1Count === item.expectedH1;
    const canonicalMatches =
      item.expectedCanonical === null ||
      item.canonical === item.expectedCanonical;
    const robotsMatches =
      item.expectedRobots === null ||
      item.robots?.startsWith(item.expectedRobots);
    return (
      item.status !== item.expectedStatus ||
      !h1Matches ||
      (item.expectedH1 !== null && !item.title) ||
      !canonicalMatches ||
      !robotsMatches ||
      item.mobileMenuWorks === false ||
      (item.expectedH1 !== null &&
        item.scrollWidth > item.viewportWidth) ||
      item.brokenImages.length > 0 ||
      (item.expectedStatus < 400 &&
        item.expectedH1 !== null &&
        item.consoleErrors.length > 0) ||
      item.failedRequests.length > 0
    );
  },
);

if (failures.length > 0) {
  console.error(`QA failed: ${failures.length} check(s) need attention.`);
  process.exitCode = 1;
}
