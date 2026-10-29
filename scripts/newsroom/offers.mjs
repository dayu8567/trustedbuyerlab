const unsupportedProductPattern =
  /\b(?:automotive|vehicle|truck|car|cummins|dodge|ford|chevrolet|chevy|toyota|dpf|egr|exhaust\s+system|engine\s+(?:part|kit|cover|mount)|turbocharger|brake\s+(?:pad|rotor|kit)|suspension|pressure\s+washer|pool\s+(?:cleaner|pump|heater|vacuum)|dining\s+(?:table|chair|set)|side\s+chair|sofa|mattress|furniture)\b/i;

const categoryRules = [
  {
    category: "kitchen-appliances",
    subcategory: "air-fryers",
    pattern: /air\s*fry|airfry/i,
  },
  {
    category: "kitchen-appliances",
    subcategory: "coffee-makers",
    pattern: /coffee\s+(?:maker|machine|grinder|press|brewer|filter|pod|tamper|knock\s*box|puck\s*screen|accessor)|espresso\b.*\b(?:machine|maker|grinder|press|filter|pod|tamper|knock\s*box|puck\s*screen|accessor)\b/i,
  },
  {
    category: "kitchen-appliances",
    subcategory: "dishwashers",
    pattern: /dishwash/i,
  },
  {
    category: "kitchen-appliances",
    subcategory: "microwaves",
    pattern: /microwave/i,
  },
  {
    category: "kitchen-appliances",
    subcategory: "refrigerators",
    pattern: /refrigerator|fridge/i,
  },
  {
    category: "laundry",
    subcategory: "washing-machines",
    pattern: /washing\s*machine|clothes\s*washer|front[- ]load\s*washer|top[- ]load\s*washer|portable\s*washer/i,
  },
  {
    category: "laundry",
    subcategory: "dryers",
    pattern: /dryer|tumble\s*dry/i,
  },
  {
    category: "laundry",
    subcategory: "garment-care",
    pattern: /(?:garment|clothes)\s+(?:steamer|dryer)|steam\s+iron|handheld\s+iron|ironing\s+(?:station|system)/i,
  },
  {
    category: "cleaning",
    subcategory: "robot-vacuums",
    pattern: /robot\s*vac|robotic\s*vac/i,
  },
  {
    category: "cleaning",
    subcategory: "cordless-vacuums",
    pattern: /cordless\s*vac|stick\s*vac/i,
  },
  {
    category: "cleaning",
    subcategory: "carpet-cleaners",
    pattern: /carpet\s+(?:cleaner|cleaning|extractor)|upholstery\s+cleaner/i,
  },
  {
    category: "cleaning",
    subcategory: "steam-mops",
    pattern: /steam\s*mop/i,
  },
  {
    category: "air-climate",
    subcategory: "humidifiers",
    pattern: /humidifier/i,
  },
  {
    category: "air-climate",
    subcategory: "dehumidifiers",
    pattern: /dehumidifier/i,
  },
  {
    category: "air-climate",
    subcategory: "air-purifiers",
    pattern: /air\s*purifier/i,
  },
  {
    category: "air-climate",
    subcategory: "fans-heaters",
    pattern: /(?:ceiling|floor|tower|pedestal|box|desk|oscillating|misting|window|exhaust)\s+fan|fandelier|(?:space|ceramic|oil[- ]filled|radiant|electric|portable|garage)\s+heater|fan\s+heater/i,
  },
  {
    category: "smart-home",
    subcategory: "security-cameras",
    pattern: /security\s*camera|indoor\s*camera|outdoor\s*camera/i,
  },
  {
    category: "smart-home",
    subcategory: "video-doorbells",
    pattern: /doorbell/i,
  },
  {
    category: "smart-home",
    subcategory: "smart-locks",
    pattern: /smart\s*lock|door\s*lock/i,
  },
  {
    category: "smart-home",
    subcategory: "smart-home-hubs",
    pattern: /smart\s*home\s*hub|home\s+hub|smart\s+hub|home\s+bridge/i,
  },
];

const pick = (object, keys) => {
  for (const key of keys) {
    const value = object[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const parsePrice = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const match = value.replaceAll(",", "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const price = Number(match[0]);
  return Number.isFinite(price) && price > 0 ? price : null;
};

const parseAvailability = (value, stockValue) => {
  if (stockValue === false || stockValue === 0) return "Out of stock";
  if (stockValue === true) return "In stock";
  if (typeof value !== "string" || !value.trim()) return "Availability not stated";
  return value.trim().slice(0, 80);
};

const parseDate = (value) => {
  if (typeof value === "number") {
    const milliseconds = value < 1_000_000_000_000 ? value * 1000 : value;
    return new Date(milliseconds);
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    const numeric = Number(value);
    const milliseconds = numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
    return new Date(milliseconds);
  }
  return value ? new Date(value) : new Date(Number.NaN);
};

const isHttpUrl = (value, protocols = ["http:", "https:"]) => {
  try {
    return protocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const isValidImage = (value) =>
  typeof value === "string" &&
  (value.startsWith("local:") || isHttpUrl(value));

export function opportunitiesFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["products", "items", "offers", "data", "results", "list"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  for (const container of ["data", "result", "results"]) {
    const nested = payload?.[container];
    if (!nested || Array.isArray(nested)) continue;
    for (const key of ["list", "products", "items", "offers", "data", "results"]) {
      if (Array.isArray(nested[key])) return nested[key];
    }
  }
  throw new Error("PartnerBoost response did not contain a product array.");
}

export function normalizeOffer(raw, now = new Date()) {
  if (!raw || typeof raw !== "object") return null;
  const id = String(
    pick(raw, ["id", "product_id", "productId", "sku", "asin"]) ?? "",
  ).trim();
  const title = String(
    pick(raw, ["name", "title", "product_name", "productName"]) ?? "",
  ).trim();
  const price = parsePrice(
    pick(raw, ["price", "sale_price", "salePrice", "current_price"]),
  );
  const listPrice = parsePrice(
    pick(raw, [
      "list_price",
      "listPrice",
      "old_price",
      "oldPrice",
      "original_price",
      "originalPrice",
      "compare_at_price",
    ]),
  );
  const affiliateUrl = pick(raw, [
    "affiliate_url",
    "affiliateUrl",
    "tracking_url",
    "trackingUrl",
    "click_url",
  ]);
  const imageUrl = pick(raw, [
    "image_url",
    "imageUrl",
    "image",
    "image_link",
    "thumbnail",
  ]);
  const sourceUrl = pick(raw, [
    "url",
    "product_url",
    "productUrl",
    "landing_url",
    "canonical_url",
  ]);
  const updatedAtRaw = pick(raw, [
    "updated_at",
    "updatedAt",
    "last_updated",
    "lastUpdated",
    "modified_at",
  ]);
  const updatedAt = parseDate(updatedAtRaw);

  if (
    !id ||
    !title ||
    !price ||
    !isHttpUrl(affiliateUrl) ||
    !isValidImage(imageUrl) ||
    Number.isNaN(updatedAt.getTime())
  ) {
    return null;
  }

  const categoryText = `${title} ${pick(raw, ["category", "category_name", "categories"]) ?? ""}`;
  if (unsupportedProductPattern.test(categoryText)) return null;
  const rule = categoryRules.find((candidate) => candidate.pattern.test(categoryText));
  if (!rule) return null;

  const ageHours = (now.getTime() - updatedAt.getTime()) / 3_600_000;
  if (ageHours < -2 || ageHours > 48) return null;

  return {
    id,
    title,
    brand: String(pick(raw, ["brand", "manufacturer", "vendor"]) ?? "Unknown").trim(),
    model: String(
      pick(raw, ["model", "model_number", "modelNumber", "mpn"]) ?? "",
    ).trim(),
    category: rule.category,
    subcategory: rule.subcategory,
    retailer: String(
      pick(raw, [
        "retailer",
        "merchant_name",
        "merchant",
        "store",
        "network",
      ]) ?? "Affiliate retailer",
    ).trim(),
    affiliateUrl: String(affiliateUrl),
    sourceUrl: isHttpUrl(sourceUrl) ? String(sourceUrl) : String(affiliateUrl),
    imageUrl: String(imageUrl),
    price,
    listPrice: listPrice && listPrice > price ? listPrice : undefined,
    currency: String(pick(raw, ["currency", "currency_code"]) ?? "USD")
      .trim()
      .toUpperCase()
      .slice(0, 3),
    availability: parseAvailability(
      pick(raw, ["availability", "stock_status", "stockStatus"]),
      pick(raw, ["in_stock", "inStock"]),
    ),
    updatedAt: updatedAt.toISOString(),
  };
}

export function normalizeOffers(payload, now = new Date()) {
  return opportunitiesFromPayload(payload)
    .map((raw) => normalizeOffer(raw, now))
    .filter(Boolean);
}
