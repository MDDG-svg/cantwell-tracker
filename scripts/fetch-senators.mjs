// Full 100-senator roster from GovTrack — one call, CI-safe (GovTrack is not
// blocked by the WAF that blocks congress.gov from GitHub Actions runners).
import { govtrackFetch } from "./govtrack-fetch.mjs";

function govtrackIdFromLink(link) {
  // link looks like https://www.govtrack.us/congress/members/maria_cantwell/300018
  const m = /\/(\d+)\/?$/.exec(link || "");
  return m ? m[1] : null;
}

export async function fetchSenators() {
  const url = "https://www.govtrack.us/api/v2/role?current=true&role_type=senator&limit=110";
  const data = await govtrackFetch(url);
  return data.objects.map(o => ({
    govtrackId: govtrackIdFromLink(o.person.link),
    bioguideId: o.person.bioguideid,
    firstName: o.person.firstname,
    lastName: o.person.lastname,
    fullName: `${o.person.firstname} ${o.person.lastname}`,
    party: o.party,
    state: o.state,
    rssUrl: o.extra?.rss_url ?? null,
    govtrackLink: o.person.link
  })).sort((a, b) => a.state.localeCompare(b.state) || (a.senator_rank || 0));
}
