import { XMLParser } from "fast-xml-parser";
import { EnvHttpProxyAgent, fetch as undiciFetch } from "undici";

const DAY_MS = 86_400_000;
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: false,
  trimValues: true,
});

const asArray = (value) => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};

const decodeText = (value) => {
  const text =
    typeof value === "string"
      ? value
      : typeof value?.["#text"] === "string"
        ? value["#text"]
        : "";
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
};

const parseDate = (value) => {
  const parsed = value ? new Date(value) : new Date(Number.NaN);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const normalizedTitle = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeUrl = (value) => {
  const url = decodeText(value);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};

async function fetchXml(url, fetchImpl) {
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/rss+xml, application/xml, text/xml",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent":
        "TrustedBuyerLabNewsroom/1.0 (+https://trustedbuyerlab.com/about/)",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`RSS request failed: ${response.status}`);
  const xml = await response.text();
  const payload = parser.parse(xml);
  const channel = payload?.rss?.channel;
  if (!channel) throw new Error("RSS response did not contain a channel.");
  return channel;
}

function newsItemsFromChannel(channel, provider, query, now) {
  return asArray(channel.item)
    .map((item) => {
      const title = decodeText(item.title);
      const url = normalizeUrl(item.link);
      const publishedAt = parseDate(decodeText(item.pubDate));
      const publisher =
        decodeText(item.source?.["#text"] ?? item.source) ||
        decodeText(channel.title);
      return {
        provider,
        query,
        title,
        url,
        publishedAt,
        publisher,
        approxTraffic: null,
      };
    })
    .filter(
      (item) =>
        item.title &&
        item.url &&
        item.publishedAt &&
        item.publishedAt <= new Date(now.getTime() + DAY_MS),
    );
}

function googleTrendsItemsFromChannel(channel, query, now) {
  const items = [];
  for (const trend of asArray(channel.item)) {
    const trendTitle = decodeText(trend.title);
    const publishedAt = parseDate(decodeText(trend.pubDate));
    const approxTraffic = decodeText(trend["ht:approx_traffic"]);
    for (const news of asArray(trend["ht:news_item"])) {
      const title = decodeText(news["ht:news_item_title"]) || trendTitle;
      const url = normalizeUrl(news["ht:news_item_url"]);
      const publisher =
        decodeText(news["ht:news_item_source"]) || "Google Trends";
      if (!title || !url || !publishedAt) continue;
      items.push({
        provider: "Google Trends",
        query,
        title,
        url,
        publishedAt,
        publisher,
        approxTraffic,
        trendTitle,
      });
    }
  }
  return items.filter(
    (item) => item.publishedAt <= new Date(now.getTime() + DAY_MS),
  );
}

const googleNewsUrl = () =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(
    '("home appliance" OR appliance safety OR appliance recall) when:7d',
  )}&hl=en-US&gl=US&ceid=US:en`;

const bingNewsUrl = (query) =>
  `https://www.bing.com/news/search?q=${encodeURIComponent(
    query,
  )}&format=RSS&setlang=en-us&mkt=en-US`;

const googleTrendsUrl = () =>
  "https://trends.google.com/trending/rss?geo=US";

const providerWeight = (provider) => {
  if (provider === "Google Trends") return 6;
  if (provider === "Google News") return 5;
  return 3;
};

const recencyWeight = (publishedAt, now) => {
  const ageDays = Math.max(
    0,
    (now.getTime() - publishedAt.getTime()) / DAY_MS,
  );
  return Math.max(1, 6 - Math.floor(ageDays));
};

function matchesTerm(text, term) {
  const escaped = term
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function scoreTrendTopics(topics, items, now = new Date()) {
  const scores = {};
  for (const topic of topics) {
    const matched = [];
    const matchedTerms = new Set();
    for (const item of items) {
      const text = `${item.trendTitle ?? ""} ${item.title}`;
      const terms = topic.trendTerms.filter((term) => matchesTerm(text, term));
      if (terms.length === 0) continue;
      terms.forEach((term) => matchedTerms.add(term));
      matched.push({
        ...item,
        score:
          providerWeight(item.provider) +
          recencyWeight(item.publishedAt, now) +
          terms.length * 2,
      });
    }

    matched.sort(
      (a, b) =>
        b.score - a.score ||
        b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
    scores[topic.slug] = {
      score: matched.reduce((total, item) => total + item.score, 0),
      itemCount: matched.length,
      matchedTerms: [...matchedTerms],
      sources: matched.slice(0, 4),
    };
  }
  return scores;
}

export function buildTrendSnapshot({
  topics,
  items,
  errors = [],
  now = new Date(),
  providers = {},
}) {
  const cutoff = new Date(now.getTime() - 10 * DAY_MS);
  const seen = new Set();
  const uniqueItems = [];
  for (const item of items) {
    const publishedAt =
      item.publishedAt instanceof Date
        ? item.publishedAt
        : parseDate(item.publishedAt);
    if (!publishedAt || publishedAt < cutoff) continue;
    const key = normalizedTitle(item.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    uniqueItems.push({ ...item, publishedAt });
  }
  uniqueItems.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  );
  const topicScores = scoreTrendTopics(topics, uniqueItems, now);
  return {
    scannedAt: now.toISOString(),
    lookbackDays: 10,
    providers,
    errors,
    items: uniqueItems.slice(0, 100),
    topicScores,
  };
}

export async function scanTrendSignals({
  topics,
  now = new Date(),
  fetchImpl = null,
  dryRun = false,
  fixture = null,
}) {
  if (dryRun) {
    return buildTrendSnapshot({
      topics,
      items: fixture?.items ?? [],
      errors: [],
      now,
      providers: { fixture: true },
    });
  }

  const requests = [
    {
      provider: "Google News",
      query: "home appliance safety",
      url: googleNewsUrl(),
      normalize: (channel) =>
        newsItemsFromChannel(
          channel,
          "Google News",
          "home appliance safety",
          now,
        ),
    },
    {
      provider: "Google Trends",
      query: "US daily search trends",
      url: googleTrendsUrl(),
      normalize: (channel) =>
        googleTrendsItemsFromChannel(
          channel,
          "US daily search trends",
          now,
        ),
    },
    ...topics.map((topic) => {
      const query = topic.trendTerms.slice(0, 3).join(" OR ");
      return {
        provider: "Bing News",
        query,
        url: bingNewsUrl(query),
        normalize: (channel) =>
          newsItemsFromChannel(channel, "Bing News", query, now),
      };
    }),
  ];

  const proxyUrl =
    process.env.HTTPS_PROXY ??
    process.env.https_proxy ??
    process.env.HTTP_PROXY ??
    process.env.http_proxy;
  const proxyDispatcher = proxyUrl ? new EnvHttpProxyAgent() : undefined;
  const effectiveFetch =
    fetchImpl ??
    (proxyDispatcher
      ? (url, options) =>
          undiciFetch(url, { ...options, dispatcher: proxyDispatcher })
      : fetch);

  const results = await Promise.allSettled(
    requests.map(async (request) => {
      const channel = await fetchXml(request.url, effectiveFetch);
      return request.normalize(channel);
    }),
  );
  const items = [];
  const errors = [];
  const providers = {};

  results.forEach((result, index) => {
    const request = requests[index];
    if (result.status === "fulfilled") {
      items.push(...result.value);
      providers[request.provider] = (providers[request.provider] ?? 0) + 1;
    } else {
      errors.push(
        `${request.provider}: ${result.reason?.message ?? String(result.reason)}`,
      );
    }
  });

  return buildTrendSnapshot({ topics, items, errors, now, providers });
}
