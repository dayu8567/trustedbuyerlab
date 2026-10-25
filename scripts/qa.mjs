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

const pages = [
  { path: "/", name: "home" },
  { path: "/guides/", name: "all-guides" },
  { path: "/pool-robots/", name: "pool-robots" },
  { path: "/pool-care/", name: "pool-care" },
  { path: "/buying-guides/", name: "buying-guides" },
  { path: "/about/", name: "about" },
  {
    path: "/guides/beatbot-sora-robotic-pool-cleaner/",
    name: "sora-comparison",
  },
  {
    path: "/best-cordless-robotic-pool-cleaners/",
    name: "cordless-comparison",
  },
  ...markdownArticles.map((slug) => ({
    path: `/guides/${slug}/`,
    name: slug,
  })),
  { path: "/privacy-policy/", name: "privacy" },
  { path: "/terms/", name: "terms" },
  { path: "/affiliate-disclosure/", name: "affiliate-disclosure" },
  { path: "/thank-you/", name: "thank-you" },
  {
    path: "/missing-page-for-qa/",
    name: "not-found",
    expectedStatus: 404,
    expectedCanonical: "/404.html",
  },
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
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
      waitUntil: "networkidle",
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
    if (viewport.width <= 900) {
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
      };
    });

    const screenshot = `${outputDir}/${target.name}-${viewport.name}.png`;
    await page.screenshot({ path: screenshot, fullPage: true });

    report.push({
      page: target.path,
      viewport: viewport.name,
      status: response?.status() ?? null,
      expectedStatus: target.expectedStatus ?? 200,
      expectedCanonical: `https://trustedbuyerlab.com${target.expectedCanonical ?? target.path}`,
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
  const canonicalMatches = item.canonical === item.expectedCanonical;
  console.log(
    `${item.page} ${item.viewport}: status=${item.status} ` +
      `expected=${item.expectedStatus} overflow=${overflow} ` +
      `h1=${item.h1Count} canonical=${canonicalMatches} ` +
      `broken=${item.brokenImages.length} errors=${item.consoleErrors.length} ` +
      `transfer=${Math.round(item.transferBytes / 1024)}KB lcp=${Math.round(item.lcp)}ms ` +
      `cls=${item.cls.toFixed(3)}`,
  );
}

const failures = report.filter(
  (item) =>
    item.status !== item.expectedStatus ||
    item.h1Count !== 1 ||
    !item.title ||
    item.canonical !== item.expectedCanonical ||
    item.mobileMenuWorks === false ||
    item.scrollWidth > item.viewportWidth ||
    item.brokenImages.length > 0 ||
    (item.expectedStatus < 400 && item.consoleErrors.length > 0) ||
    item.failedRequests.length > 0,
);

if (failures.length > 0) {
  console.error(`QA failed: ${failures.length} check(s) need attention.`);
  process.exitCode = 1;
}
