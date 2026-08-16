import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fetchSenators } from "./fetch-senators.mjs";
import { fetchSenatorBills } from "./fetch-senator-bills.mjs";
import { fetchSenatorNews } from "./fetch-senator-news.mjs";
import { fetchSenatorVotes } from "./fetch-senator-votes.mjs";
import { fetchStateAlerts } from "./fetch-state-alerts.mjs";
import { US_STATES } from "./us-states.mjs";
import { runPool } from "./pool.mjs";

const DATA_PATH = path.resolve("data/senate-feed.json");
const SENATOR_CONCURRENCY = 8;
const STATE_CONCURRENCY = 10;

async function loadPrevious() {
  try {
    return JSON.parse(await readFile(DATA_PATH, "utf-8"));
  } catch {
    return null;
  }
}

// Falls back to the previous run's value for this source on failure, so a
// transient upstream outage doesn't blank out that section of the dashboard.
function resolveWithFallback(result, prevValue, errors, label, emptyShape) {
  if (result.fetched_ok) return result;
  if (prevValue?.fetched_ok) errors.push(`${label}: ${result.error} (kept previous)`);
  else errors.push(`${label}: ${result.error}`);
  return prevValue ?? { fetched_ok: false, error: result.error, ...emptyShape };
}

async function main() {
  const previous = await loadPrevious();
  const errors = [];

  console.log("Fetching senator roster...");
  let roster = await fetchSenators();
  console.log(`Roster loaded: ${roster.length} senators.`);

  const testLimit = Number(process.env.TEST_LIMIT || 0);
  if (testLimit > 0) {
    // Spread the sample across parties/states rather than taking the first N
    // alphabetically, so a small test batch still exercises real variety.
    const step = Math.max(1, Math.floor(roster.length / testLimit));
    roster = roster.filter((_, i) => i % step === 0).slice(0, testLimit);
    console.log(`TEST_LIMIT set — using ${roster.length} senators: ${roster.map(s => s.fullName).join(", ")}`);
  }

  console.log(`Fetching bills + news + votes for ${roster.length} senators (concurrency ${SENATOR_CONCURRENCY})...`);
  const senatorData = {};
  await runPool(roster, SENATOR_CONCURRENCY, async (s) => {
    const prev = previous?.senator_data?.[s.govtrackId];

    const [billsResult, newsResult, votesResult] = await Promise.all([
      fetchSenatorBills(s.govtrackId).catch(err => ({ fetched_ok: false, error: err.message })),
      fetchSenatorNews(s.fullName, 4).catch(err => ({ fetched_ok: false, error: err.message })),
      fetchSenatorVotes(s.govtrackId, 20).catch(err => ({ fetched_ok: false, error: err.message }))
    ]);

    senatorData[s.govtrackId] = {
      bills: resolveWithFallback(billsResult, prev?.bills, errors, `senator.${s.govtrackId}.bills (${s.fullName})`, { bills: [], total_sponsored: 0 }),
      news: resolveWithFallback(newsResult, prev?.news, errors, `senator.${s.govtrackId}.news (${s.fullName})`, { items: [] }),
      votes: resolveWithFallback(votesResult, prev?.votes, errors, `senator.${s.govtrackId}.votes (${s.fullName})`, { votes: [] })
    };
  });

  console.log(`Fetching state alerts for ${US_STATES.length} states (concurrency ${STATE_CONCURRENCY})...`);
  const stateAlerts = {};
  await runPool(US_STATES, STATE_CONCURRENCY, async (state) => {
    const result = await fetchStateAlerts(state);
    if (result.fetched_ok) {
      stateAlerts[state] = { active_alerts_count: result.active_alerts_count, top_alerts: result.top_alerts };
    } else {
      const prev = previous?.state_alerts?.[state];
      errors.push(`state_alerts.${state}: ${result.error}${prev ? " (kept previous)" : ""}`);
      stateAlerts[state] = prev ?? { active_alerts_count: 0, top_alerts: [] };
    }
  });

  const feed = {
    generated_at: new Date().toISOString(),
    senators: roster,
    senator_data: senatorData,
    state_alerts: stateAlerts,
    errors
  };

  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await writeFile(DATA_PATH, JSON.stringify(feed), "utf-8");
  console.log(`Wrote ${DATA_PATH}${errors.length ? ` with ${errors.length} warning(s)` : ""}`);
  if (errors.length) errors.slice(0, 20).forEach(e => console.log(" -", e));
}

main().catch(err => {
  console.error("build-senate-feed failed:", err);
  process.exit(1);
});
