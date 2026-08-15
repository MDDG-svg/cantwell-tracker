import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fetchBills } from "./fetch-bills.mjs";
import { fetchNews } from "./fetch-news.mjs";
import { fetchWaAlerts } from "./fetch-wa-alerts.mjs";

const DATA_PATH = path.resolve("data/feed.json");
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;

async function loadPrevious() {
  try {
    const raw = await readFile(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  const previous = await loadPrevious();
  const errors = [];

  if (!CONGRESS_API_KEY) {
    console.warn("CONGRESS_API_KEY not set — bill status will not refresh this run.");
  }

  const [bills, generalNews, waNews, waAlerts] = await Promise.all([
    CONGRESS_API_KEY ? fetchBills(CONGRESS_API_KEY) : Promise.resolve(previous?.bills ?? {}),
    fetchNews({ query: '"Maria Cantwell"', limit: 8 }),
    fetchNews({ query: "Washington wildfire OR Spokane fire OR FEMA Washington disaster", limit: 6 }),
    fetchWaAlerts()
  ]);

  // Fall back to previous values for anything that failed this run, so a
  // transient upstream outage doesn't blank out the dashboard.
  const finalBills = { ...(previous?.bills ?? {}) };
  for (const [id, val] of Object.entries(bills)) {
    if (val.fetched_ok === false && previous?.bills?.[id]?.fetched_ok) {
      errors.push(`bills.${id}: ${val.error} (kept previous)`);
      continue;
    }
    finalBills[id] = val;
  }

  const finalNews = generalNews.fetched_ok ? generalNews.items : (previous?.news ?? []);
  if (!generalNews.fetched_ok) errors.push(`news: ${generalNews.error} (kept previous)`);

  const finalWaNews = waNews.fetched_ok ? waNews.items : (previous?.wa?.disaster_news ?? []);
  if (!waNews.fetched_ok) errors.push(`wa_news: ${waNews.error} (kept previous)`);

  const finalWaAlerts = waAlerts.fetched_ok
    ? { active_alerts_count: waAlerts.active_alerts_count, top_alerts: waAlerts.top_alerts }
    : (previous?.wa ? { active_alerts_count: previous.wa.active_alerts_count, top_alerts: previous.wa.top_alerts } : { active_alerts_count: 0, top_alerts: [] });
  if (!waAlerts.fetched_ok) errors.push(`wa_alerts: ${waAlerts.error} (kept previous)`);

  const feed = {
    generated_at: new Date().toISOString(),
    bills: finalBills,
    news: finalNews,
    wa: {
      active_alerts_count: finalWaAlerts.active_alerts_count,
      top_alerts: finalWaAlerts.top_alerts,
      disaster_news: finalWaNews
    },
    errors
  };

  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(feed, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${DATA_PATH}${errors.length ? ` with ${errors.length} warning(s)` : ""}`);
  if (errors.length) errors.forEach(e => console.log(" -", e));
}

main().catch(err => {
  console.error("build-feed failed:", err);
  process.exit(1);
});
