import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { generateDraft } from "./ai.mjs";
import { writeGeneratedArticle } from "./content.mjs";
import {
  applyDailyPriceCheckTitle,
  applyDraftFallbacks,
} from "./draft.mjs";
import { normalizeOffers, opportunitiesFromPayload } from "./offers.mjs";
import { appendHistory, selectCandidates } from "./selection.mjs";
import { validateAiDraft } from "./validation.mjs";

const root = resolve(import.meta.dirname, "../..");
const dryRun = process.argv.includes("--dry-run");
// Probe mode validates the live Partner feed without generating or publishing.
const probeOnly = process.argv.includes("--probe");
const outputRoot = dryRun ? resolve(root, ".newsroom-dry-run") : root;

const readJson = async (path, fallback) => {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};

const writeJson = (path, value) =>
  writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");

const fetchFeed = async () => {
  if (dryRun) {
    return readJson(resolve(import.meta.dirname, "fixtures/partnerboost.json"));
  }
  const feedUrl = process.env.PARTNERBOOST_FEED_URL;
  const apiKey = process.env.PARTNERBOOST_API_KEY;
  if (!feedUrl || !apiKey) {
    throw new Error(
      "Daily publishing requirement not met: PartnerBoost credentials are not configured.",
    );
  }

  const endpoint = new URL(feedUrl);
  if (!endpoint.searchParams.has("mod")) endpoint.searchParams.set("mod", "datafeed");
  if (!endpoint.searchParams.has("op")) endpoint.searchParams.set("op", "list");
  const maxPages = Math.max(
    1,
    Math.min(10, Number(process.env.PARTNERBOOST_MAX_PAGES ?? 5)),
  );
  const products = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: apiKey, type: "json", page, limit: 100 }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      throw new Error(
        `PartnerBoost feed failed: ${response.status} ${await response.text()}`,
      );
    }
    const payload = await response.json();
    if (payload?.status?.code !== undefined && payload.status.code !== 0) {
      throw new Error(
        `PartnerBoost API ${payload.status.code}: ${payload.status.msg ?? "unknown error"}`,
      );
    }
    const pageProducts = opportunitiesFromPayload(payload);
    products.push(...pageProducts);
    if (pageProducts.length < 100) break;
  }
  return { data: products };
};

const main = async () => {
  const payload = await fetchFeed();

  const now = dryRun
    ? new Date("2026-10-27T00:00:00Z")
    : new Date();
  const rawOffers = opportunitiesFromPayload(payload);
  const offers = normalizeOffers(payload, now);
  if (offers.length === 0) {
    if (probeOnly) {
      console.log(
        `::notice title=PartnerBoost probe::Feed returned ${rawOffers.length} raw products but zero normalized appliance offers.`,
      );
      return;
    }
    throw new Error(
      "Daily publishing requirement not met: the feed returned no usable appliance offers.",
    );
  }

  if (probeOnly) {
    console.log(
      `::notice title=PartnerBoost probe::Feed request succeeded with ${offers.length} normalized appliance offers.`,
    );
    console.log(
      JSON.stringify(
        {
          probeOnly: true,
          rawProducts: rawOffers.length,
          normalizedOffers: offers.length,
          sampleCategories: [
            ...new Set(offers.map((offer) => offer.subcategory)),
          ].slice(0, 10),
        },
        null,
        2,
      ),
    );
    return;
  }

  const historyPath = resolve(root, "data/newsroom/price-history.json");
  const publishedPath = resolve(root, "data/newsroom/published.json");
  const blocklistPath = resolve(root, "data/newsroom/blocklist.json");
  const history = await readJson(historyPath, {});
  const published = await readJson(publishedPath, { posts: [] });
  const blocklist = await readJson(blocklistPath, {
    productIds: [],
    brands: [],
  });

  const candidates = selectCandidates({
    offers,
    history,
    published,
    blocklist,
    now,
    dailyCap: 2,
  });
  const today = now.toISOString().slice(0, 10);
  const hasDailyArticle = published.posts.some(
    (post) => post.publishedAt === today,
  );
  if (!dryRun && candidates.length === 0 && !hasDailyArticle) {
    throw new Error(
      "Daily publishing requirement not met: no eligible offer is available for today's article.",
    );
  }
  const nextHistory = appendHistory(history, offers, now);
  const generated = [];
  const publishCandidates = dryRun ? candidates.slice(0, 1) : candidates;

  for (const candidate of publishCandidates) {
    let draft;
    let validation;
    let feedback = "";
    const prepareDraft = (value) =>
      candidate.selectionBasis === "daily-snapshot"
        ? applyDailyPriceCheckTitle(value, candidate.offer, now)
        : value;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      draft = prepareDraft(
        await generateDraft({
          offer: candidate.offer,
          dryRun,
          feedback,
          selectionBasis: candidate.selectionBasis,
          seasonalContext: candidate.seasonalContext,
        }),
      );
      validation = validateAiDraft(draft, candidate.offer);
      if (validation.valid) break;
      feedback = validation.errors.join(" ");
      console.log(
        `Draft attempt ${attempt} failed validation for ${candidate.offer.id}: ${feedback}`,
      );
    }
    if (!validation.valid) {
      const repairedDraft = prepareDraft(
        applyDraftFallbacks(draft, candidate.offer),
      );
      const repairedValidation = validateAiDraft(repairedDraft, candidate.offer);
      if (repairedValidation.valid) {
        draft = repairedDraft;
        validation = repairedValidation;
        console.log(
          `Applied deterministic title and description fallbacks for ${candidate.offer.id}.`,
        );
      } else {
        validation = repairedValidation;
      }
    }
    if (!validation.valid) {
      throw new Error(
        `Generated draft failed validation for ${candidate.offer.id}: ${validation.errors.join("; ")}`,
      );
    }

    const result = await writeGeneratedArticle({
      offer: candidate.offer,
      draft,
      now,
      outputRoot,
      selectionBasis: candidate.selectionBasis,
      seasonalTopic: candidate.seasonalTopic,
      seasonalContext: candidate.seasonalContext,
    });
    generated.push(result);
    published.posts.push({
      productId: candidate.offer.id,
      slug: result.slug,
      price: candidate.offer.price,
      currency: candidate.offer.currency,
      publishedAt: result.publishedAt,
      selectionBasis: candidate.selectionBasis,
      seasonalTopic: candidate.seasonalTopic,
    });
  }

  if (!dryRun) {
    await writeJson(historyPath, nextHistory);
    await writeJson(publishedPath, published);
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        normalizedOffers: offers.length,
        candidates: candidates.length,
        hasDailyArticle,
        generated: generated.map((item) => item.slug),
        outputRoot,
      },
      null,
      2,
    ),
  );
};

main().catch((error) => {
  console.error(error);
  const message = error instanceof Error ? error.message : String(error);
  console.log(`::error title=Newsroom validation::${message.replaceAll("\n", " ")}`);
  process.exitCode = 1;
});
