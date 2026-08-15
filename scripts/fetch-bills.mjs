import { BILLS, CONGRESS_NUM } from "./bills-config.mjs";

export async function fetchBills(apiKey) {
  const out = {};
  for (const id of Object.keys(BILLS)) {
    const b = BILLS[id];
    const url = `https://api.congress.gov/v3/bill/${CONGRESS_NUM}/${b.billType}/${b.billNumber}?api_key=${apiKey}&format=json`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const bill = data.bill;
      if (!bill) throw new Error("No bill in response");
      out[id] = {
        latest_action_text: bill.latestAction?.text ?? null,
        latest_action_date: bill.latestAction?.actionDate ?? null,
        cosponsors_count: bill.cosponsors?.count ?? null,
        introduced_date: bill.introducedDate ?? null,
        updated_date: bill.updateDate ?? null,
        fetched_ok: true
      };
    } catch (err) {
      console.warn(`[fetch-bills] failed for ${id}: ${err.message}`);
      out[id] = { fetched_ok: false, error: err.message };
    }
  }
  return out;
}
