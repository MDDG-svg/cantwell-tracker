import { govtrackFetch } from "./govtrack-fetch.mjs";

const CONGRESS_NUM = 119;

// Cosponsored bills where the senator hasn't taken any real legislative
// action beyond signing on are excluded — mass reflexive cosponsorship of
// freshly-introduced bills would otherwise dominate a "most recent" sort.
// Sponsored bills keep "introduced" as valid signal (it's the senator's own
// initiative, not a low-effort sign-on).
const NO_SIGNAL_COSPONSOR_STATUSES = new Set(["introduced", "referred"]);

function mapBill(b) {
  return {
    displayNumber: b.display_number,
    title: b.title_without_number || b.title,
    statusCode: b.current_status ?? null,
    statusLabel: b.current_status_label ?? null,
    statusDescription: b.current_status_description ?? null,
    currentStatusDate: b.current_status_date ?? null,
    introducedDate: b.introduced_date ?? null,
    link: b.link ?? `https://www.congress.gov/bill/119th-congress/${b.bill_type === "senate_bill" ? "senate-bill" : "house-bill"}/${b.number}`
  };
}

async function fetchBillList(url) {
  const data = await govtrackFetch(url);
  return { total: data.meta?.total_count ?? data.objects.length, objects: data.objects };
}

// Combines sponsored bills (primary signal — always meaningful, even at
// "introduced" stage) with cosponsored bills that have real momentum
// (bill_type=senate_bill excludes ceremonial resolutions; status filter
// excludes reflexive day-one sign-ons). Each bill is tagged with the
// senator's role so the frontend can show it distinctly.
export async function fetchSenatorBills(govtrackId, { sponsoredLimit = 5, cosponsoredLimit = 3, cosponsoredWindow = 40 } = {}) {
  const sponsoredUrl = `https://www.govtrack.us/api/v2/bill?sponsor=${govtrackId}&congress=${CONGRESS_NUM}&bill_type=senate_bill&order_by=-current_status_date&limit=${sponsoredLimit}`;
  const cosponsoredUrl = `https://www.govtrack.us/api/v2/bill?cosponsors=${govtrackId}&congress=${CONGRESS_NUM}&bill_type=senate_bill&order_by=-current_status_date&limit=${cosponsoredWindow}`;

  const [sponsored, cosponsoredRaw] = await Promise.all([
    fetchBillList(sponsoredUrl),
    fetchBillList(cosponsoredUrl)
  ]);

  const cosponsored = cosponsoredRaw.objects
    .filter(b => !NO_SIGNAL_COSPONSOR_STATUSES.has(b.current_status))
    .slice(0, cosponsoredLimit);

  const bills = [
    ...sponsored.objects.map(b => ({ ...mapBill(b), role: "sponsor" })),
    ...cosponsored.map(b => ({ ...mapBill(b), role: "cosponsor" }))
  ].sort((a, b) => (b.currentStatusDate || "").localeCompare(a.currentStatusDate || ""));

  return {
    total_sponsored: sponsored.total,
    total_cosponsored: cosponsoredRaw.total,
    bills,
    fetched_ok: true
  };
}
