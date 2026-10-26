import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const PROMPT_VERSION = "price-brief-v1";

const responseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    bodyMarkdown: { type: "string" },
    keyConsiderations: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
  },
  required: ["title", "description", "bodyMarkdown", "keyConsiderations"],
};

const systemPrompt = `You write restrained English price briefs for Trusted Buyer Lab.

Use only the structured offer facts supplied by the user. Never invent a specification, review score, test result, discount history, safety claim, or product feature. Do not claim hands-on testing. Do not use "best overall", "guaranteed", or medical language. Do not mention a price other than the offer price or listed price supplied. The retailer link and timestamp are inserted by code, not by you.

Return one JSON object with:
- title: 25-100 characters, specific and non-clickbait
- description: 80-240 characters
- bodyMarkdown: 900-1800 characters of plain Markdown with 3 or 4 level-two headings
- keyConsiderations: 3-5 sentences of practical pre-purchase checks

The article must explain that the price is a snapshot, distinguish the offer price from the listed price, and tell the reader to verify fit, seller, warranty, and current terms.`;

export function buildMessages(offer) {
  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: JSON.stringify(
        {
          productName: offer.title,
          brand: offer.brand,
          model: offer.model ?? null,
          category: offer.category,
          subcategory: offer.subcategory,
          retailer: offer.retailer,
          price: offer.price,
          listPrice: offer.listPrice ?? null,
          currency: offer.currency,
          availability: offer.availability,
          priceCheckedAt: offer.updatedAt,
        },
        null,
        2,
      ),
    },
  ];
}

export async function generateDraft({
  offer,
  dryRun = false,
  env = process.env,
  fetchImpl = fetch,
}) {
  if (dryRun) {
    const path = resolve(
      import.meta.dirname,
      "fixtures/ai-response.json",
    );
    return JSON.parse(await readFile(path, "utf8"));
  }

  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.");
  }

  const response = await fetchImpl(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: buildMessages(offer),
        response_format: {
          type: "json_schema",
          json_schema: responseSchema,
        },
        temperature: 0.2,
        max_tokens: 2200,
      }),
    },
  );

  const payload = await response.json();
  if (!response.ok || payload.success === false) {
    throw new Error(
      `Workers AI request failed: ${response.status} ${JSON.stringify(payload.errors ?? payload)}`,
    );
  }

  const raw = payload.result?.response ?? payload.result;
  const draft = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!draft || typeof draft !== "object") {
    throw new Error("Workers AI returned an empty JSON response.");
  }
  return draft;
}
