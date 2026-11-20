import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const read = (path) => readFile(resolve(root, path), "utf8");

test("defines the required Google Ads verification identity", async () => {
  const data = await read("src/data/adsVerification.ts");
  assert.match(data, /星拓广告数据/);
  assert.match(data, /广安市广安区星拓互联网信息服务部（个体工商户）/);
  assert.match(data, /elinbourgoyne192@gmail\.com/);
  assert.match(data, /https:\/\/www\.googleapis\.com\/auth\/adwords/);
  assert.match(data, /429532275527/);
});

test("all verification pages contain required legal and contact facts", async () => {
  const pages = [
    "src/pages/google-ads/index.astro",
    "src/pages/privacy/index.astro",
    "src/pages/terms/index.astro",
  ];
  for (const path of pages) {
    const source = await read(path);
    assert.match(source, /星拓广告数据/);
    assert.match(source, /AdsVerificationLayout/);
    assert.match(source, /Google Ads/);
    assert.doesNotMatch(source, /noindex/);
  }

  const homepage = await read("src/pages/google-ads/index.astro");
  assert.match(homepage, /不访问 Gmail、Google Drive/);
  assert.match(homepage, /不会出售或出租 Google/);

  const privacy = await read("src/pages/privacy/index.astro");
  assert.match(privacy, /默认保留不超过\s+180\s+天/);
  assert.match(privacy, /Limited Use/);

  const terms = await read("src/pages/terms/index.astro");
  assert.match(terms, /用户不得/);
  assert.match(terms, /免责声明和责任限制/);
});

test("brand verification pages are present in the sitemap", async () => {
  const sitemap = await read("src/pages/sitemap.xml.ts");
  for (const path of ["/google-ads/", "/privacy/", "/terms/"]) {
    assert.match(sitemap, new RegExp(path.replaceAll("/", "\\/")));
  }
});
