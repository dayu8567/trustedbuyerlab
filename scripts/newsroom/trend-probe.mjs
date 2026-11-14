import { seasonalEditorialCandidates } from "./editorial.mjs";
import { scanTrendSignals } from "./trends.mjs";

const now = new Date();
const topics = seasonalEditorialCandidates(now);
const snapshot = await scanTrendSignals({ topics, now });
const topTopics = Object.entries(snapshot.topicScores)
  .sort((a, b) => b[1].score - a[1].score)
  .slice(0, 5)
  .map(([slug, value]) => ({
    slug,
    score: value.score,
    itemCount: value.itemCount,
    matchedTerms: value.matchedTerms,
  }));

console.log(
  JSON.stringify(
    {
      scannedAt: snapshot.scannedAt,
      providers: snapshot.providers,
      itemCount: snapshot.items.length,
      errors: snapshot.errors,
      topTopics,
    },
    null,
    2,
  ),
);

if (snapshot.items.length === 0) {
  console.log(
    "::warning title=Trend scan::No recent trend items were available; the seasonal fallback will run without claiming trend evidence.",
  );
}
