const UA = { "User-Agent": "cantwell-tracker (personal dashboard, github.com)" };
const CONGRESS_NUM = 119;

// Top N most-recently-active bills sponsored by this senator this Congress.
// Restricted to bill_type=senate_bill (excludes S.Res./S.Con.Res./S.J.Res.)
// because simple/ceremonial resolutions (park weeks, commemorative days) churn
// far more often than substantive legislation and would otherwise dominate a
// "most recent" sort — this keeps the list meaningful, not just recent.
export async function fetchSenatorBills(govtrackId, limit = 5) {
  const url = `https://www.govtrack.us/api/v2/bill?sponsor=${govtrackId}&congress=${CONGRESS_NUM}&bill_type=senate_bill&order_by=-current_status_date&limit=${limit}`;
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`govtrack bill API error ${res.status}`);
  const data = await res.json();
  return {
    total_sponsored: data.meta?.total_count ?? data.objects.length,
    bills: data.objects.map(b => ({
      displayNumber: b.display_number,
      title: b.title_without_number || b.title,
      statusCode: b.current_status ?? null,
      statusLabel: b.current_status_label ?? null,
      statusDescription: b.current_status_description ?? null,
      currentStatusDate: b.current_status_date ?? null,
      introducedDate: b.introduced_date ?? null,
      link: b.link ?? `https://www.congress.gov/bill/119th-congress/${b.bill_type === "senate_bill" ? "senate-bill" : "house-bill"}/${b.number}`
    })),
    fetched_ok: true
  };
}
