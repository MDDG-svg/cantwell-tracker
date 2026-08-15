import Parser from "rss-parser";

const parser = new Parser({
  customFields: { item: ["source"] },
  timeout: 15000
});

function mapItems(feed, limit) {
  return (feed.items || []).slice(0, limit).map(item => ({
    title: (item.title || "").trim(),
    link: item.link || "",
    pubDate: item.pubDate || item.isoDate || null,
    source: (typeof item.source === "object" ? item.source?._ : item.source) || (item.title || "").split(" - ").pop() || null
  }));
}

export async function fetchNews({ query, limit = 8 }) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const feed = await parser.parseURL(url);
    return { items: mapItems(feed, limit), fetched_ok: true };
  } catch (err) {
    console.warn(`[fetch-news] failed for query "${query}": ${err.message}`);
    return { items: [], fetched_ok: false, error: err.message };
  }
}
