import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolve } from "node:path";
import { buildMessages } from "../scripts/newsroom/ai.mjs";
import { buildArticleMarkdown } from "../scripts/newsroom/content.mjs";
import {
  applyDailyPriceCheckTitle,
  applyDraftFallbacks,
} from "../scripts/newsroom/draft.mjs";
import {
  normalizeOffers,
  opportunitiesFromPayload,
} from "../scripts/newsroom/offers.mjs";
import {
  appendHistory,
  selectCandidates,
} from "../scripts/newsroom/selection.mjs";
import { seasonalProfile } from "../scripts/newsroom/seasonal.mjs";
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

test("reads products from PartnerBoost's nested envelope", () => {
  const products = opportunitiesFromPayload({
    status: { code: 0, msg: "success" },
    data: { list: feed.products, page: 1 },
  });
  assert.equal(products.length, 2);
});

test("maps documented PartnerBoost fields and Unix-second timestamps", () => {
  const offers = normalizeOffers(
    {
      data: {
        list: [
          {
            name: "Documented Field Humidifier",
            sku: "PB-DOC-001",
            merchant_name: "PartnerBoost Merchant",
            url: "https://example.com/product",
            image: "https://example.com/image.jpg",
            category: "Home > Humidifiers",
            price: "89.99",
            old_price: "119.99",
            currency: "usd",
            brand: "Example",
            mpn: "HUM-1",
            availability: "in stock",
            tracking_url: "https://example.com/tracking",
            updated_at: 1_792_990_800,
          },
        ],
      },
    },
    new Date("2026-10-26T06:00:00Z"),
  );
  assert.equal(offers.length, 1);
  assert.equal(offers[0].retailer, "PartnerBoost Merchant");
  assert.equal(offers[0].listPrice, 119.99);
  assert.equal(offers[0].sourceUrl, "https://example.com/product");
  assert.equal(offers[0].model, "HUM-1");
});

test("rejects automotive parts that contain heater or fan words", () => {
  const automotive = {
    ...feed.products[0],
    name: "DPF EGR Delete Combo Kit with Grid Heater Delete Plate for Dodge Ram",
    sku: "AUTO-PART-001",
    category: "Automotive > Engine Parts",
  };
  const offers = normalizeOffers({ data: { list: [automotive] } }, now);
  assert.equal(offers.length, 0);
});

test("rejects furniture that uses espresso as a color name", () => {
  const diningSet = {
    ...feed.products[0],
    name: "Worland 43 Inch Espresso 5-Piece Rectangle Dining Table with 4 Side Chairs",
    sku: "FURNITURE-001",
    category: "Home > Dining Room Furniture",
  };
  const offers = normalizeOffers({ data: { list: [diningSet] } }, now);
  assert.equal(offers.length, 0);
});

test("accepts espresso accessories in the coffee category", () => {
  const espressoAccessory = {
    ...feed.products[0],
    name: "IKAPE Espresso V1 Knock Box",
    sku: "ESPRESSO-ACCESSORY-001",
    category: "Home > Kitchen > Coffee",
  };
  const offers = normalizeOffers({ data: { list: [espressoAccessory] } }, now);
  assert.equal(offers.length, 1);
  assert.equal(offers[0].subcategory, "coffee-makers");
});

test("excludes fans in autumn while keeping seasonal appliance topics", () => {
  const autumn = new Date("2026-10-29T12:00:00Z");
  const base = normalizeOffers(feed, now)[0];
  const fan = {
    ...base,
    title: "52 Inch Smart Fan Offer",
    category: "air-climate",
    subcategory: "fans-heaters",
  };
  const coffee = {
    ...base,
    title: "Espresso Machine with Milk Frother",
    category: "kitchen-appliances",
    subcategory: "coffee-makers",
  };

  assert.equal(seasonalProfile(fan, autumn).inSeason, false);
  const coffeeProfile = seasonalProfile(coffee, autumn);
  assert.equal(coffeeProfile.inSeason, true);
  assert.match(coffeeProfile.context, /autumn in the US/);
  assert.match(coffeeProfile.context, /holiday hosting/);

  const fanCandidates = selectCandidates({
    offers: [fan],
    history: { [fan.id]: [{ date: "2026-10-20", price: fan.price * 2 }] },
    published: { posts: [] },
    blocklist: { productIds: [], brands: [] },
    now: autumn,
  });
  assert.deepEqual(fanCandidates, []);
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

test("publishes one daily price check when no discount clears the thresholds", () => {
  const offers = normalizeOffers(feed, now).map((offer) => ({
    ...offer,
    listPrice: undefined,
  }));
  const history = Object.fromEntries(
    offers.map((offer) => [
      offer.id,
      [{ date: "2026-10-20", price: offer.price }],
    ]),
  );
  const published = { posts: [] };
  const candidates = selectCandidates({
    offers,
    history,
    published,
    blocklist: { productIds: [], brands: [] },
    now,
  });

  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].selectionBasis, "daily-snapshot");

  const capped = selectCandidates({
    offers,
    history,
    published: {
      posts: [
        {
          productId: candidates[0].offer.id,
          publishedAt: "2026-10-26",
          price: candidates[0].offer.price,
        },
      ],
    },
    blocklist: { productIds: [], brands: [] },
    now,
  });
  assert.deepEqual(capped, []);
});

test("keeps discount posts deduplicated while allowing a dated daily check", () => {
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
  assert.equal(unchanged.length, 1);
  assert.equal(unchanged[0].selectionBasis, "daily-snapshot");

  const improvedOffer = { ...offers[0], price: 70 };
  const improved = selectCandidates({
    offers: [improvedOffer],
    history,
    published,
    blocklist: { productIds: [], brands: [] },
    now,
  });
  assert.equal(improved.length, 1);
  assert.equal(improved[0].selectionBasis, "discount");
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

test("repairs an oversized AI description with a bounded fallback", () => {
  const offer = {
    ...normalizeOffers(feed, now)[0],
    title: "An unusually long product name ".repeat(20),
  };
  const oversized = {
    ...draft,
    title: "short",
    description: "An excessively long summary sentence. ".repeat(10),
  };

  const repaired = applyDraftFallbacks(oversized, offer);
  assert.ok(repaired.description.length >= 100);
  assert.ok(repaired.description.length <= 240);
  assert.equal(validateAiDraft(repaired, offer).valid, true);
});

test("forces a transparent daily price-check title for snapshot coverage", () => {
  const offer = normalizeOffers(feed, now)[0];
  const titled = applyDailyPriceCheckTitle(draft, offer, now);
  assert.match(titled.title, /^Daily price check 2026-10-26:/);
  assert.equal(validateAiDraft(titled, offer).valid, true);

  const messages = buildMessages(offer, "daily-snapshot");
  assert.match(messages[1].content, /did not meet a verified discount threshold/);
  assert.match(messages[1].content, /Do not call it a deal/);
});

test("runs the newsroom twice daily at 13:10 and 21:10 UTC", async () => {
  const workflow = await readFile(
    resolve(import.meta.dirname, "../.github/workflows/newsroom.yml"),
    "utf8",
  );
  assert.match(workflow, /cron: "10 13,21 \* \* \*"/);
  assert.doesNotMatch(workflow, /cron: "10 5,13,21 \* \* \*"/);
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

test("marks non-discount daily articles as price checks in the article body", () => {
  const offer = normalizeOffers(feed, now)[0];
  const markdown = buildArticleMarkdown({
    offer,
    draft: applyDailyPriceCheckTitle(draft, offer, now),
    now,
    imagePath: "/images/articles/example.webp",
    selectionBasis: "daily-snapshot",
  });
  assert.match(markdown, /selectionBasis: "daily-snapshot"/);
  assert.match(markdown, /No verified 30-day median discount threshold/);
  assert.match(markdown, /## Daily price check/);
});

test("adds the seasonal editorial angle to automated articles", () => {
  const offer = normalizeOffers(feed, now)[0];
  const seasonalContext =
    "It is autumn in the US, when more indoor time changes appliance use.";
  const markdown = buildArticleMarkdown({
    offer,
    draft,
    now,
    imagePath: "/images/articles/example.webp",
    seasonalTopic: "air-fryers",
    seasonalContext,
  });
  assert.match(markdown, /seasonalTopic: "air-fryers"/);
  assert.match(markdown, /## Why it matters now/);
  assert.match(markdown, /more indoor time changes appliance use/);
});
