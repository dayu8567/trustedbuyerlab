const DAY_MS = 86_400_000;

const median = (values) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const dateKey = (value) => new Date(value).toISOString().slice(0, 10);

export function trailingMedian(history, productId, now, days = 30) {
  const cutoff = new Date(now).getTime() - days * DAY_MS;
  const prices = (history[productId] ?? [])
    .filter((entry) => {
      const time = new Date(`${entry.date}T00:00:00Z`).getTime();
      return Number.isFinite(time) && time >= cutoff;
    })
    .map((entry) => Number(entry.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  return median(prices);
}

export function discountFacts(offer, history, now) {
  const historicalMedian = trailingMedian(history, offer.id, now);
  const medianDrop = historicalMedian
    ? (historicalMedian - offer.price) / historicalMedian
    : null;
  const listDrop = offer.listPrice
    ? (offer.listPrice - offer.price) / offer.listPrice
    : null;
  return { historicalMedian, medianDrop, listDrop };
}

export function isAvailable(offer) {
  return !/out of stock|unavailable|sold out/i.test(offer.availability);
}

export function selectCandidates({
  offers,
  history,
  published,
  blocklist,
  now = new Date(),
  dailyCap = 2,
  minimumMedianDrop = 0.1,
  minimumListDrop = 0.15,
  duplicateDays = 14,
  improvementMargin = 0.05,
}) {
  const today = dateKey(now);
  const posts = published.posts ?? [];
  const todaysCount = posts.filter((post) => post.publishedAt === today).length;
  if (todaysCount >= dailyCap) return [];

  const blockedIds = new Set(blocklist.productIds ?? []);
  const blockedBrands = new Set(
    (blocklist.brands ?? []).map((brand) => brand.toLowerCase()),
  );
  const eligible = [];
  const dailySnapshots = [];

  for (const offer of offers) {
    if (blockedIds.has(offer.id)) continue;
    if (blockedBrands.has(offer.brand.toLowerCase())) continue;
    if (!isAvailable(offer)) continue;

    const previous = posts
      .filter((post) => post.productId === offer.id)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
    let ageDays = null;
    let recentRepeat = false;
    if (previous) {
      ageDays =
        (new Date(`${today}T00:00:00Z`).getTime() -
          new Date(`${previous.publishedAt}T00:00:00Z`).getTime()) /
        DAY_MS;
      recentRepeat =
        ageDays < duplicateDays &&
        offer.price > previous.price * (1 - improvementMargin);
    }

    const facts = discountFacts(offer, history, now);
    const passesMedian =
      facts.medianDrop !== null && facts.medianDrop >= minimumMedianDrop;
    const passesList =
      facts.listDrop !== null && facts.listDrop >= minimumListDrop;

    const freshnessHours =
      (now.getTime() - new Date(offer.updatedAt).getTime()) / 3_600_000;
    const freshnessScore = Math.max(0, 48 - Math.max(0, freshnessHours));
    const noveltyScore = previous
      ? Math.min(Math.max(ageDays ?? 0, 0), duplicateDays) * 2
      : 30;
    const snapshotScore =
      Math.max(0, facts.listDrop ?? 0) * 40 +
      freshnessScore +
      noveltyScore +
      (offer.listPrice ? 3 : 0) +
      (offer.model ? 1 : 0);

    dailySnapshots.push({
      offer,
      facts,
      score: snapshotScore,
      selectionBasis: "daily-snapshot",
    });

    if (recentRepeat) continue;
    if (!passesMedian && !passesList) continue;

    const discountStrength = Math.max(facts.medianDrop ?? 0, facts.listDrop ?? 0);
    const score =
      discountStrength * 100 +
      freshnessScore / 4 +
      (offer.listPrice ? 3 : 0) +
      (offer.model ? 1 : 0);

    eligible.push({ offer, facts, score, selectionBasis: "discount" });
  }

  const byScore = (a, b) =>
    b.score - a.score ||
    b.offer.updatedAt.localeCompare(a.offer.updatedAt) ||
    a.offer.id.localeCompare(b.offer.id);

  if (eligible.length > 0) {
    return eligible.sort(byScore).slice(0, dailyCap - todaysCount);
  }

  // The first run of a UTC day always publishes one verified price snapshot.
  // It is explicitly labeled as a price check, never as a discount or deal.
  if (todaysCount === 0 && dailySnapshots.length > 0) {
    return dailySnapshots.sort(byScore).slice(0, 1);
  }

  return [];
}

export function appendHistory(history, offers, now = new Date()) {
  const today = dateKey(now);
  const next = structuredClone(history);
  for (const offer of offers) {
    const entries = next[offer.id] ?? [];
    const withoutToday = entries.filter((entry) => entry.date !== today);
    next[offer.id] = [
      ...withoutToday,
      {
        date: today,
        price: offer.price,
        listPrice: offer.listPrice ?? null,
      },
    ].slice(-90);
  }
  return next;
}
