import { BILLS, CONGRESS_NUM } from "./bills-config.mjs";

// Map our bill-type letter to GovTrack's verbose enum.
const GOVTRACK_TYPE = { s: "senate_bill", hr: "house_bill" };

async function fetchFromCongress(b, apiKey) {
  const url = `https://api.congress.gov/v3/bill/${CONGRESS_NUM}/${b.billType}/${b.billNumber}?api_key=${apiKey}&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`congress.gov API error ${res.status}`);
  const data = await res.json();
  const bill = data.bill;
  if (!bill) throw new Error("congress.gov: no bill in response");
  return {
    latest_action_text: bill.latestAction?.text ?? null,
    latest_action_date: bill.latestAction?.actionDate ?? null,
    cosponsors_count: bill.cosponsors?.count ?? null,
    introduced_date: bill.introducedDate ?? null,
    updated_date: bill.updateDate ?? null,
    source: "congress.gov"
  };
}

// Fallback used when congress.gov's WAF blocks the requesting IP (a known,
// documented issue for GitHub-hosted Actions runners and most cloud egress
// ranges — see LibraryOfCongress/api.congress.gov#441). GovTrack mirrors the
// same underlying THOMAS/congress.gov action data but has no cosponsor-count
// field, so that one field is left for build-feed.mjs to backfill from cache.
async function fetchFromGovtrack(b) {
  const type = GOVTRACK_TYPE[b.billType];
  const url = `https://www.govtrack.us/api/v2/bill?congress=${CONGRESS_NUM}&bill_type=${type}&number=${b.billNumber}`;
  const res = await fetch(url, { headers: { "User-Agent": "cantwell-tracker (personal dashboard)" } });
  if (!res.ok) throw new Error(`govtrack API error ${res.status}`);
  const data = await res.json();
  const bill = data.objects?.[0];
  if (!bill) throw new Error("govtrack: no bill in response");
  const lastAction = bill.major_actions?.at(-1);
  return {
    latest_action_text: lastAction?.[2] ?? bill.current_status_description ?? null,
    latest_action_date: bill.current_status_date ?? null,
    cosponsors_count: null,
    introduced_date: bill.introduced_date ?? null,
    updated_date: null,
    source: "govtrack"
  };
}

export async function fetchBills(apiKey) {
  const out = {};
  for (const id of Object.keys(BILLS)) {
    const b = BILLS[id];
    try {
      out[id] = { ...(await fetchFromCongress(b, apiKey)), fetched_ok: true };
      continue;
    } catch (congressErr) {
      console.warn(`[fetch-bills] congress.gov failed for ${id}: ${congressErr.message} — trying govtrack fallback`);
      try {
        out[id] = { ...(await fetchFromGovtrack(b)), fetched_ok: true };
      } catch (govtrackErr) {
        console.warn(`[fetch-bills] govtrack fallback also failed for ${id}: ${govtrackErr.message}`);
        out[id] = { fetched_ok: false, error: `${congressErr.message}; govtrack: ${govtrackErr.message}` };
      }
    }
  }
  return out;
}
