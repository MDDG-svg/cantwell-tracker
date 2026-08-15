import { fetchNews } from "./fetch-news.mjs";

// "senator" (not name-quoted) disambiguates common names (Rick Scott, Mark
// Kelly, John Kennedy) from unrelated public figures sharing that name.
export async function fetchSenatorNews(fullName, limit = 4) {
  return fetchNews({ query: `"${fullName}" senator`, limit });
}
