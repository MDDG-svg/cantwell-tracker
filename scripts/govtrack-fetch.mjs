const UA = { "User-Agent": "cantwell-tracker (personal dashboard, github.com)" };

// Centralizes retry-with-backoff for GovTrack calls. As the pipeline adds
// more calls per senator (bills, cosponsors, votes, and soon per-bill
// cosponsorship lookups for the network feature), transient 429s become
// routine rather than exceptional — retry here once, instead of every
// call site re-implementing its own backoff.
export async function govtrackFetch(url, { retries = 3, baseDelayMs = 400 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: UA });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      lastErr = new Error(`govtrack API error ${res.status}`);
      if (attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt + Math.random() * 150;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
    } else {
      throw new Error(`govtrack API error ${res.status}`);
    }
  }
  throw lastErr;
}
