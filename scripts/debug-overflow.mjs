import { chromium } from "playwright";

const url = process.argv[2] ?? "http://127.0.0.1:4321/";
const width = Number(process.argv[3] ?? 320);
const chromePath =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(300);
const report = await page.evaluate(() => {
  const viewport = document.documentElement.clientWidth;
  return {
    viewport,
    scrollWidth: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll("body *")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          className: element.className?.toString().slice(0, 120),
          text: element.textContent?.replace(/\s+/g, " ").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter((item) => item.left < -1 || item.right > viewport + 1)
      .slice(0, 40),
  };
});
console.log(JSON.stringify(report, null, 2));
await browser.close();
