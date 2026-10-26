const prohibitedClaims = [
  /\bwe\s+(?:have\s+)?(?:hands-on\s+)?tested\b/i,
  /\bour\s+(?:lab\s+)?test(?:ing|s)?\b/i,
  /\blab[- ]tested\b/i,
  /\bguaranteed\b/i,
  /\bbest\s+(?:overall|ever)\b/i,
  /\bclinically\s+proven\b/i,
  /\bcures?\b/i,
  /\b100\s*%\s+(?:safe|effective|clean)\b/i,
];

const moneyPattern = /(?:USD|US\$|\$|£|€)\s?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)/gi;

const plainTextLength = (value) =>
  value
    .replace(/[#*_>`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

export function validateAiDraft(draft, offer) {
  const errors = [];
  if (!draft || typeof draft !== "object") errors.push("Draft must be an object.");
  if (typeof draft?.title !== "string" || draft.title.length < 15 || draft.title.length > 100) {
    errors.push("Title must be between 15 and 100 characters.");
  }
  if (
    typeof draft?.description !== "string" ||
    draft.description.length < 100 ||
    draft.description.length > 240
  ) {
    errors.push(
      `Description must be between 100 and 240 characters; received ${draft?.description?.length ?? 0}.`,
    );
  }
  if (
    typeof draft?.bodyMarkdown !== "string" ||
    plainTextLength(draft.bodyMarkdown) < 300
  ) {
    errors.push(
      `Body analysis must contain at least 300 characters of plain text; received ${typeof draft?.bodyMarkdown === "string" ? plainTextLength(draft.bodyMarkdown) : 0}.`,
    );
  }
  if (
    !Array.isArray(draft?.keyConsiderations) ||
    draft.keyConsiderations.length < 3 ||
    draft.keyConsiderations.length > 5 ||
    draft.keyConsiderations.some(
      (item) => typeof item !== "string" || item.length < 20 || item.length > 160,
    )
  ) {
    errors.push("Key considerations must contain 3 to 5 useful sentences.");
  }

  const allText = [
    draft?.title,
    draft?.description,
    draft?.bodyMarkdown,
    ...(draft?.keyConsiderations ?? []),
  ]
    .filter(Boolean)
    .join("\n");
  for (const pattern of prohibitedClaims) {
    if (pattern.test(allText)) errors.push(`Prohibited claim matched: ${pattern}`);
  }
  if (/<script\b|<iframe\b|javascript:/i.test(allText)) {
    errors.push("Generated content contains unsafe HTML.");
  }
  const allowedPrices = new Set(
    [offer.price, offer.listPrice]
      .filter(Boolean)
      .map((value) => Number(value).toFixed(2)),
  );
  for (const match of allText.matchAll(moneyPattern)) {
    const normalized = Number(match[1].replaceAll(",", "")).toFixed(2);
    if (!allowedPrices.has(normalized)) {
      errors.push(`Unexpected price amount in generated copy: ${match[0]}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
