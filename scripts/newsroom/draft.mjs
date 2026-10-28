const MIN_DESCRIPTION_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 220;
const MAX_TITLE_LENGTH = 100;

const collapseWhitespace = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const clipAtWord = (value, maxLength) => {
  const text = collapseWhitespace(value);
  if (text.length <= maxLength) return text;
  if (maxLength <= 3) return text.slice(0, maxLength);

  const available = maxLength - 3;
  const shortened = text.slice(0, available).trimEnd();
  const boundary = shortened.lastIndexOf(" ");
  const clipped =
    boundary >= Math.floor(available * 0.6)
      ? shortened.slice(0, boundary)
      : shortened;
  return `${clipped.replace(/[.,;:!?-]+$/, "")}...`;
};

const labelFromSlug = (value) =>
  (value || "home appliance")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export function buildFallbackTitle(offer) {
  const brand = offer.brand || "Home appliance";
  const retailer = offer.retailer || "a retailer";
  const base = `Price snapshot: ${brand} ${labelFromSlug(offer.subcategory)} at ${retailer}`;
  const title = clipAtWord(base, MAX_TITLE_LENGTH);
  return title.length >= 15
    ? title
    : clipAtWord(`${title} price brief`, MAX_TITLE_LENGTH);
}

export function buildFallbackDescription(offer) {
  const subject = clipAtWord(
    `${offer.brand || ""} ${labelFromSlug(offer.subcategory)}`,
    64,
  );
  const retailer = clipAtWord(offer.retailer || "a retailer", 48);
  const prefix = "Price snapshot for a ";
  const connector = " at ";
  const detail =
    "Verify availability, the listed price, seller terms, and current offer details before ordering.";
  const subjectBudget = Math.max(
    20,
    MAX_DESCRIPTION_LENGTH -
      prefix.length -
      connector.length -
      retailer.length -
      2 -
      detail.length,
  );
  const boundedSubject = clipAtWord(subject, subjectBudget);
  const description = `${prefix}${boundedSubject}${connector}${retailer}. ${detail}`;

  if (description.length < MIN_DESCRIPTION_LENGTH) {
    return clipAtWord(
      `${description} Confirm the current terms on the retailer page before purchase.`,
      MAX_DESCRIPTION_LENGTH,
    );
  }
  return clipAtWord(description, MAX_DESCRIPTION_LENGTH);
}

export function applyDailyPriceCheckTitle(draft, offer) {
  const product =
    offer.title ||
    `${offer.brand || "Home appliance"} ${labelFromSlug(offer.subcategory)}`;
  return {
    ...draft,
    title: clipAtWord(`Daily price check: ${product}`, MAX_TITLE_LENGTH),
  };
}

export function applyDraftFallbacks(draft, offer) {
  const title = collapseWhitespace(draft?.title);
  const description = collapseWhitespace(draft?.description);
  return {
    ...draft,
    title:
      title.length >= 15 && title.length <= MAX_TITLE_LENGTH
        ? title
        : buildFallbackTitle(offer),
    description:
      description.length >= MIN_DESCRIPTION_LENGTH &&
      description.length <= MAX_DESCRIPTION_LENGTH
        ? description
        : buildFallbackDescription(offer),
  };
}
