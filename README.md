# Senate Tracker

Hosted, auto-updating dashboard tracking any U.S. senator's legislative
activity, related news, and their state's active weather/disaster alerts.
Started as a single-senator (Cantwell, D-WA) tool and was generalized to
cover all 100 senators.

## How it works

- A GitHub Actions workflow (`.github/workflows/update-data.yml`) runs every 6
  hours, plus on-demand via the Actions tab ("Run workflow").
- It runs `scripts/build-senate-feed.mjs`, which pulls:
  - The full 100-senator roster (name, party, state, bioguide/GovTrack IDs)
    from GovTrack's `/api/v2/role` endpoint.
  - Each senator's 5 most-recently-active sponsored bills (excluding simple
    resolutions) from GovTrack's `/api/v2/bill` endpoint.
  - News headlines per senator via a Google News RSS search, disambiguated
    with a `"<name>" senator` query (handles common names like Rick Scott,
    Mark Kelly).
  - Active NWS weather/disaster alerts for all 50 states + DC.
- Requests run with bounded concurrency (8 senators / 10 states at a time) —
  a full run takes well under a minute.
- Results are written to `data/senate-feed.json` and committed back to the repo.
- `index.html` is a static page that fetches `data/senate-feed.json`
  client-side and renders the dashboard for whichever senator is selected.
  Served by GitHub Pages — no backend at request time. Deep link to a specific
  senator with `?senator=<govtrackId>`.
- If any single source fails for a given senator/state on a given run, the
  previous value is kept (see the `errors` array in the feed) rather than
  blanking that part of the dashboard.

### Why GovTrack instead of the Congress.gov API

Phase 1 used the Congress.gov API directly. Its WAF blocks GitHub-hosted
Actions runner IPs with a 403 regardless of API key (a
[known, documented issue](https://github.com/LibraryOfCongress/api.congress.gov/issues/441)),
so Phase 2's 100-senator fetch is built entirely on GovTrack's public API,
which mirrors the same underlying legislative data and works reliably from
CI. No API key is required for this pipeline.

## Local development

```bash
npm install
npm run build
```

This regenerates `data/senate-feed.json` (~8s for all 100 senators). To test
against a smaller batch during development: `TEST_LIMIT=15 npm run build`.

Open `index.html` via any static file server (e.g. `node dev-server.cjs`, or
`npx serve .`) — `fetch()` of the JSON feed will fail under a plain `file://` URL.

## Setup notes

- No secrets are required — GovTrack, the NWS API, and Google News RSS are
  all unauthenticated public endpoints.
- To change refresh frequency, edit the `cron` schedule in
  `.github/workflows/update-data.yml`.
- To change how many bills/news items are pulled per senator, adjust the
  `limit` arguments in `scripts/build-senate-feed.mjs`.
- The home-state quick-pick (`HOME_STATE` in `index.html`) defaults to `WA`.
- Pins, per-bill notes, and the senator search box are client-side only
  (localStorage) and are unaffected by the backend refresh.

## Known gaps (not yet built)

- Floor vote history (only sponsored bills are tracked, not votes cast)
- Cross-session cosponsor network analysis
- Committee attendance logging
- Same-state delegation comparison (placeholder only)
