import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const articleDir = resolve(import.meta.dirname, "../src/content/articles");

const frontmatterValue = (source, key) => {
  const match = source.match(
    new RegExp(`^${key}:\\s*"?(.*?)"?$`, "m"),
  );
  return match?.[1]?.trim() ?? "";
};

const titleKey = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

test("published articles have unique normalized titles", async () => {
  const files = (await readdir(articleDir)).filter((name) =>
    name.endsWith(".md"),
  );
  const published = [];
  for (const file of files) {
    const source = await readFile(resolve(articleDir, file), "utf8");
    if (/^draft:\s*true$/m.test(source)) continue;
    if (/^legacy:\s*true$/m.test(source)) continue;
    published.push({
      file,
      title: frontmatterValue(source, "title"),
    });
  }

  const byTitle = new Map();
  for (const article of published) {
    const key = titleKey(article.title);
    const existing = byTitle.get(key) ?? [];
    existing.push(article);
    byTitle.set(key, existing);
  }
  const duplicates = [...byTitle.values()].filter(
    (articles) => articles.length > 1,
  );
  assert.deepEqual(
    duplicates,
    [],
    `Duplicate published titles: ${JSON.stringify(duplicates, null, 2)}`,
  );
});

test("duplicate seasonal archives are drafts with redirects", async () => {
  const redirects = await readFile(
    resolve(import.meta.dirname, "../public/_redirects"),
    "utf8",
  );
  for (const slug of [
    "seasonal-humidifier-heating-season-check-2026-10-29",
    "seasonal-coffee-maker-holiday-hosting-prep-2026-11-01",
    "seasonal-winter-dryer-laundry-check-2026-11-10",
  ]) {
    assert.match(redirects, new RegExp(`/articles/${slug}/\\s+\\S+\\s+301`));
  }
});

test("published articles in each category use distinct image bytes", async () => {
  const files = (await readdir(articleDir)).filter((name) =>
    name.endsWith(".md"),
  );
  const seen = new Map();
  for (const file of files) {
    const source = await readFile(resolve(articleDir, file), "utf8");
    if (/^draft:\s*true$/m.test(source)) continue;
    if (/^legacy:\s*true$/m.test(source)) continue;
    const category = frontmatterValue(source, "category");
    const image = frontmatterValue(source, "image");
    if (!image.startsWith("/images/")) continue;
    const hash = createHash("sha256")
      .update(await readFile(resolve(import.meta.dirname, "../public", image.slice(1))))
      .digest("hex");
    const key = `${category}:${hash}`;
    const duplicate = seen.get(key);
    assert.equal(
      duplicate,
      undefined,
      `Duplicate image in ${category}: ${duplicate ?? "unknown"} and ${file}`,
    );
    seen.set(key, file);
  }
});
