import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";
import { buildArticleMarkdown } from "../scripts/newsroom/content.mjs";
import { normalizeOffers } from "../scripts/newsroom/offers.mjs";
import {
  appendHistory,
  selectCandidates,
} from "../scripts/newsroom/selection.mjs";
import { validateAiDraft } from "../scripts/newsroom/validation.mjs";

const fixtureDir = resolve(
  import.meta.dirname,
  "../scripts/newsroom/fixtures",
);
const feed = JSON.parse(
  await readFile(resolve(fixtureDir, "partnerboost.json"), "utf8"),
);
const draft = JSON.parse(
  await readFile(resolve(fixtureDir, "ai-response.json"), "utf8"),
);
const now = new Date("2026-10-26T06:00:00Z");

test("normalizes PartnerBoost aliases into the internal offer contract", () => {
  const offers = normalizeOffers(feed, now);
  assert.equal(offers.length, 2);
  assert.equal(offers[0].category, "kitchen-appliances");
  assert.equal(offers[0].subcategory, "air-fryers");
  assert.equal(offers[0].price, 79.99);
  assert.equal(offers[1].subcategory, "robot-vacuums");
});

test("selects only verified discounts and caps the daily volume", () => {
  const offers = normalizeOffers(feed, now);
  const history = {
    "fixture-air-fryer-001": [{ date: "2026-10-20", price: 100 }],
    "fixture-robot-vacuum-002": [{ date: "2026-10-20", price: 300 }],
  };
  const candidates = selectCandidates({
    offers,
    history,
    published: { posts: [] },
    blocklist: { productIds: [], brands: [] },
    now,
    dailyCap: 2,
  });
  assert.equal(candidates.length, 2);

  const capped = selectCandidates({
    offers,
    history,
    published: {
      posts: [
        { productId: "other-a", publishedAt: "2026-10-26", price: 20 },
        { productId: "other-b", publishedAt: "2026-10-26", price: 30 },
      ],
    },
    blocklist: { productIds: [], brands: [] },
    now,
  });
  assert.deepEqual(capped, []);
});

test("suppresses repeat posts unless the price improves by five percent", () => {
  const offers = normalizeOffers(feed, now);
  const history = {
    "fixture-air-fryer-001": [{ date: "2026-10-20", price: 100 }],
  };
  const published = {
    posts: [
      {
        productId: "fixture-air-fryer-001",
        publishedAt: "2026-10-20",
        price: 80,
      },
    ],
  };
  const unchanged = selectCandidates({
    offers: offers.slice(0, 1),
    history,
    published,
    blocklist: { productIds: [], brands: [] },
    now,
  });
  assert.equal(unchanged.length, 0);

  const improvedOffer = { ...offers[0], price: 70 };
  const improved = selectCandidates({
    offers: [improvedOffer],
    history,
    published,
    blocklist: { productIds: [], brands: [] },
    now,
  });
  assert.equal(improved.length, 1);
});

test("appends one price snapshot per product and day", () => {
  const offers = normalizeOffers(feed, now);
  const first = appendHistory({}, offers, now);
  const second = appendHistory(
    first,
    [{ ...offers[0], price: 72 }],
    new Date("2026-10-26T14:00:00Z"),
  );
  assert.equal(second[offers[0].id].length, 1);
  assert.equal(second[offers[0].id][0].price, 72);
});

test("accepts the fixed AI fixture and rejects unsupported test claims", () => {
  const offer = normalizeOffers(feed, now)[0];
  assert.deepEqual(validateAiDraft(draft, offer), {
    valid: true,
    errors: [],
  });
  const unsafe = {
    ...draft,
    bodyMarkdown: `${draft.bodyMarkdown}\n\nWe tested this product for a week.`,
  };
  const validation = validateAiDraft(unsafe, offer);
  assert.equal(validation.valid, false);
  assert.match(validation.errors.join(" "), /hands-on|tested/i);
});

test("writes deterministic product facts into the article frontmatter", () => {
  const offer = normalizeOffers(feed, now)[0];
  const markdown = buildArticleMarkdown({
    offer,
    draft,
    now,
    imagePath: "/images/articles/example.webp",
  });
  assert.match(markdown, /category: "kitchen-appliances"/);
  assert.match(markdown, /format: "deals"/);
  assert.match(markdown, /price: 79.99/);
  assert.match(markdown, /editorialStatus: "automated"/);
});
