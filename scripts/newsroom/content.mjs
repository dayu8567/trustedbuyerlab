import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { PROMPT_VERSION } from "./ai.mjs";
import { seasonalEditorialFor } from "./editorial.mjs";

const root = resolve(import.meta.dirname, "../..");

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);

const yamlString = (value) => JSON.stringify(String(value));

const formatCheckedAt = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));

export function articleSlugForOffer(offer, now = new Date()) {
  const date = now.toISOString().slice(0, 10);
  return `price-watch-${slugify(offer.id)}-${date}`;
}

export function buildArticleMarkdown({
  offer,
  draft,
  now = new Date(),
  imagePath,
  selectionBasis = "discount",
  seasonalTopic = "",
  seasonalContext = "",
  trendSignal = null,
}) {
  const date = now.toISOString().slice(0, 10);
  const checkedAt = formatCheckedAt(offer.updatedAt);
  const listPriceLine = offer.listPrice
    ? `A listed price of ${offer.currency} ${offer.listPrice.toFixed(2)} was supplied with the same offer snapshot.`
    : "The feed did not supply a separate listed price.";

  const considerations = draft.keyConsiderations
    .map((item) => `- ${item}`)
    .join("\n");
  const trendSources = (trendSignal?.sources ?? []).map((source) => ({
    label: source.title,
    url: source.url,
    publisher: source.publisher,
  }));
  const sourceEntries = [
    {
      label: `${offer.retailer} product listing`,
      url: offer.sourceUrl,
      publisher: offer.retailer,
    },
    ...trendSources,
  ].filter(
    (source, index, sources) =>
      sources.findIndex((candidate) => candidate.url === source.url) === index,
  );
  const sourceLines = sourceEntries
    .map(
      (source) => `  - label: ${yamlString(source.label)}
    url: ${yamlString(source.url)}
    publisher: ${yamlString(source.publisher)}`,
    )
    .join("\n");
  const trendProviders = Object.entries(trendSignal?.providers ?? {})
    .filter(([, count]) => Number(count) > 0)
    .map(([provider]) => provider)
    .join(", ");
  const trendMatchedTerms = trendSignal?.matchedTerms ?? [];
  const trendMatchedTermsYaml = trendMatchedTerms.length
    ? `  trendMatchedTerms:\n${trendMatchedTerms
        .map((term) => `    - ${yamlString(term)}`)
        .join("\n")}\n`
    : "";
  const trendSection = trendSignal?.itemCount
    ? `## What is driving interest now

Our newsroom scan on ${date} found ${trendSignal.itemCount} recent item${trendSignal.itemCount === 1 ? "" : "s"} matching ${trendMatchedTerms.join(", ")} across ${trendProviders || "recent news feeds"}. The offer was prioritized because its appliance category overlaps with current coverage.

${trendSources
  .map(
    (source) =>
      `- [${source.label.replaceAll("[", "\\[").replaceAll("]", "\\]")}](${source.url}) - ${source.publisher}`,
  )
  .join("\n")}

Headlines are used only as topic-selection signals and do not replace the retailer listing, official guidance, or a hands-on test.

`
    : "";
  const selectionNote =
    selectionBasis === "daily-snapshot"
      ? `## Daily price check

No verified 30-day median discount threshold or source list-price discount threshold was met for this update. This article records a current price snapshot rather than labeling the offer as a deal.

`
      : "";
  const seasonalNote = seasonalContext
    ? `## Why it matters now

${seasonalContext}

`
    : "";

  return `---
title: ${yamlString(draft.title)}
description: ${yamlString(draft.description)}
date: ${yamlString(date)}
updatedAt: ${yamlString(date)}
category: ${yamlString(offer.category)}
subcategory: ${yamlString(offer.subcategory)}
format: "deals"
readingTime: "4 min read"
image: ${yamlString(imagePath)}
imageAlt: ${yamlString(`Product image for ${offer.title}`)}
imageCredit: "Product image supplied by the affiliate feed"
featured: false
editorialStatus: "automated"
author: "newsroom"
sources:
${sourceLines}
products:
  - name: ${yamlString(offer.title)}
    brand: ${yamlString(offer.brand)}
${offer.model ? `    model: ${yamlString(offer.model)}\n` : ""}    retailer: ${yamlString(offer.retailer)}
    affiliateUrl: ${yamlString(offer.affiliateUrl)}
    price: ${offer.price}
    currency: ${yamlString(offer.currency)}
${offer.listPrice ? `    listPrice: ${offer.listPrice}\n` : ""}    availability: ${yamlString(offer.availability)}
    checkedAt: ${yamlString(offer.updatedAt)}
automation:
  model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  promptVersion: ${yamlString(PROMPT_VERSION)}
  contentMode: "price-brief"
  selectionBasis: ${yamlString(selectionBasis)}
${seasonalTopic ? `  seasonalTopic: ${yamlString(seasonalTopic)}\n` : ""}  editorialContext: ${yamlString(seasonalContext)}
${trendSignal ? `  trendScannedAt: ${yamlString(trendSignal.scannedAt)}\n  trendScore: ${trendSignal.score}\n  trendItemCount: ${trendSignal.itemCount}\n  trendProviders: ${yamlString(trendProviders)}\n${trendMatchedTermsYaml}` : ""}
  generatedAt: ${yamlString(new Date(now).toISOString())}
---

${draft.bodyMarkdown.trim()}

${trendSection}${seasonalNote}${selectionNote}## Price snapshot

The offer price was ${offer.currency} ${offer.price.toFixed(2)} when the feed data was checked on ${checkedAt}. ${listPriceLine}

Price and availability can change after publication. Confirm the current amount, seller, shipping terms, return window, and warranty on the retailer page before ordering.

## Before you buy

${considerations}

## Editorial note

This automated brief uses structured affiliate-feed facts and Workers AI-assisted drafting. Product identity, prices, availability, the affiliate link, and the timestamp are validated by code. It is not a hands-on product test.
`;
}

export function buildSeasonalEditorialMarkdown({
  topic,
  now = new Date(),
}) {
  const date = new Date(now).toISOString().slice(0, 10);
  const trendSources = (topic.trendSignal?.sources ?? []).map((source) => ({
    label: source.title,
    url: source.url,
    publisher: source.publisher,
  }));
  const allSources = [...topic.sources, ...trendSources].filter(
    (source, index, sources) =>
      sources.findIndex((candidate) => candidate.url === source.url) === index,
  );
  const sourceLines = allSources
    .map(
      (source) => `  - label: ${yamlString(source.label)}
    url: ${yamlString(source.url)}
    publisher: ${yamlString(source.publisher)}`,
    )
    .join("\n");
  const trendProviders = Object.entries(topic.trendSignal?.providers ?? {})
    .filter(([, count]) => Number(count) > 0)
    .map(([provider]) => provider)
    .join(", ");
  const matchedTerms = topic.trendSignal?.matchedTerms ?? [];
  const matchedTermsYaml = matchedTerms.length
    ? `  trendMatchedTerms:\n${matchedTerms
        .map((term) => `    - ${yamlString(term)}`)
        .join("\n")}\n`
    : "";
  const trendSection = topic.trendSignal?.itemCount
    ? `## What is driving interest now

Our newsroom scan on ${date} found ${topic.trendSignal.itemCount} recent item${topic.trendSignal.itemCount === 1 ? "" : "s"} matching ${matchedTerms.join(", ")} across ${trendProviders || "recent news feeds"}. The topic was selected because it is both seasonally relevant and present in recent coverage.

${topic.trendSignal.sources
  .map(
    (source) =>
      `- [${source.title.replaceAll("[", "\\[").replaceAll("]", "\\]")}](${source.url}) - ${source.publisher}`,
  )
  .join("\n")}

These headlines inform topic selection and do not replace the official guidance linked below or constitute an endorsement of a product or claim.

`
    : "";

  return `---
title: ${yamlString(topic.title)}
description: ${yamlString(topic.description)}
date: ${yamlString(date)}
updatedAt: ${yamlString(date)}
category: ${yamlString(topic.category)}
subcategory: ${yamlString(topic.subcategory)}
format: ${yamlString(topic.format)}
readingTime: ${yamlString(topic.readingTime)}
image: ${yamlString(topic.image)}
imageAlt: ${yamlString(topic.imageAlt)}
imageCredit: ${yamlString(topic.imageCredit ?? "Trusted Buyer Lab editorial image")}
featured: false
editorialStatus: "automated"
author: "newsroom"
sources:
${sourceLines || "  []"}
automation:
  model: "deterministic-seasonal-editorial"
  promptVersion: "seasonal-editorial-v1"
  contentMode: "seasonal-editorial"
  seasonalTopic: ${yamlString(topic.subcategory)}
  editorialContext: ${yamlString(topic.context)}
${topic.trendSignal ? `  trendScannedAt: ${yamlString(topic.trendSignal.scannedAt)}\n  trendScore: ${topic.trendSignal.score}\n  trendItemCount: ${topic.trendSignal.itemCount}\n  trendProviders: ${yamlString(trendProviders)}\n${matchedTermsYaml}` : ""}
  generatedAt: ${yamlString(new Date(now).toISOString())}
---

## Why this matters now

${topic.context}

${trendSection}${topic.bodyMarkdown.trim()}
`;
}

async function writeProductImage({ imageUrl, outputRoot, slug }) {
  const outputDir = resolve(outputRoot, "public/images/articles");
  await mkdir(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, `${slug}.webp`);
  let input;

  if (imageUrl.startsWith("local:")) {
    const localName = imageUrl.slice("local:".length);
    input = resolve(root, "public/images/articles", localName);
  } else {
    const response = await fetch(imageUrl, {
      headers: { Accept: "image/avif,image/webp,image/jpeg,image/png" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
    const type = response.headers.get("content-type") ?? "";
    if (!/^image\/(?:avif|webp|jpeg|png)/i.test(type)) {
      throw new Error(`Unsupported image content type: ${type}`);
    }
    const length = Number(response.headers.get("content-length") ?? 0);
    if (length > 8_000_000) throw new Error("Product image exceeds 8 MB.");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 8_000_000) throw new Error("Product image exceeds 8 MB.");
    input = bytes;
  }

  const metadata = await sharp(input).metadata();
  if ((metadata.width ?? 0) < 500 || (metadata.height ?? 0) < 300) {
    throw new Error("Product image is too small for an article cover.");
  }

  await sharp(input)
    .rotate()
    .resize(1600, 1000, { fit: "cover", position: "centre" })
    .webp({ quality: 76, effort: 5 })
    .toFile(outputPath);
  return `/images/articles/${slug}.webp`;
}

export async function writeGeneratedArticle({
  offer,
  draft,
  now = new Date(),
  outputRoot = root,
  selectionBasis = "discount",
  seasonalTopic = "",
  seasonalContext = "",
  trendSignal = null,
}) {
  const slug = articleSlugForOffer(offer, now);
  const imagePath = await writeProductImage({
    imageUrl: offer.imageUrl,
    outputRoot,
    slug,
  });
  const articleDir = resolve(outputRoot, "src/content/articles");
  await mkdir(articleDir, { recursive: true });
  const filePath = resolve(articleDir, `${slug}.md`);
  const markdown = buildArticleMarkdown({
    offer,
    draft,
    now,
    imagePath,
    selectionBasis,
    seasonalTopic,
    seasonalContext,
    trendSignal,
  });
  await writeFile(filePath, markdown, "utf8");
  return {
    slug,
    filePath,
    imagePath,
    publishedAt: now.toISOString().slice(0, 10),
  };
}

export async function writeSeasonalEditorialArticle({
  now = new Date(),
  outputRoot = root,
  publishedPosts = [],
  trendSnapshot = null,
}) {
  const topic = seasonalEditorialFor(now, publishedPosts, trendSnapshot);
  const date = new Date(now).toISOString().slice(0, 10);
  const slug = `seasonal-${topic.slug}-${date}`;
  const articleDir = resolve(outputRoot, "src/content/articles");
  await mkdir(articleDir, { recursive: true });
  const filePath = resolve(articleDir, `${slug}.md`);
  const markdown = buildSeasonalEditorialMarkdown({ topic, now });
  await writeFile(filePath, markdown, "utf8");
  return {
    slug,
    filePath,
    publishedAt: date,
    seasonalTopic: topic.subcategory,
    contentMode: "seasonal-editorial",
  };
}
