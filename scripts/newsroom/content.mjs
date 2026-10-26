import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

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

export function buildArticleMarkdown({ offer, draft, now = new Date(), imagePath }) {
  const date = now.toISOString().slice(0, 10);
  const checkedAt = formatCheckedAt(offer.updatedAt);
  const listPriceLine = offer.listPrice
    ? `A listed price of ${offer.currency} ${offer.listPrice.toFixed(2)} was supplied with the same offer snapshot.`
    : "The feed did not supply a separate listed price.";

  const considerations = draft.keyConsiderations
    .map((item) => `- ${item}`)
    .join("\n");

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
  - label: ${yamlString(`${offer.retailer} product listing`)}
    url: ${yamlString(offer.sourceUrl)}
    publisher: ${yamlString(offer.retailer)}
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
  promptVersion: "price-brief-v1"
  generatedAt: ${yamlString(new Date(now).toISOString())}
---

${draft.bodyMarkdown.trim()}

## Price snapshot

The offer price was ${offer.currency} ${offer.price.toFixed(2)} when the feed data was checked on ${checkedAt}. ${listPriceLine}

Price and availability can change after publication. Confirm the current amount, seller, shipping terms, return window, and warranty on the retailer page before ordering.

## Before you buy

${considerations}

## Editorial note

This automated brief uses structured affiliate-feed facts and Workers AI-assisted drafting. Product identity, prices, availability, the affiliate link, and the timestamp are validated by code. It is not a hands-on product test.
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
  const markdown = buildArticleMarkdown({ offer, draft, now, imagePath });
  await writeFile(filePath, markdown, "utf8");
  return {
    slug,
    filePath,
    imagePath,
    publishedAt: now.toISOString().slice(0, 10),
  };
}
