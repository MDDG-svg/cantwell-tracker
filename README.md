# Cantwell Tracker

Hosted, auto-updating dashboard tracking Sen. Maria Cantwell's (D-WA) legislative
activity, related news, and Washington state disaster status.

## How it works

- A GitHub Actions workflow (`.github/workflows/update-data.yml`) runs every 6
  hours, plus on-demand via the Actions tab ("Run workflow").
- It runs `scripts/build-feed.mjs`, which pulls:
  - Bill status/cosponsor counts from the [Congress.gov API](https://api.congress.gov) for the bills listed in `scripts/bills-config.mjs`
  - News headlines from Google News RSS search for "Maria Cantwell"
  - Washington state active weather/fire alerts from the [NWS API](https://api.weather.gov), plus a Google News RSS search for WA wildfire/disaster coverage
- Results are written to `data/feed.json` and committed back to the repo.
- `index.html` is a static page that fetches `data/feed.json` client-side and
  renders the dashboard. It's served by GitHub Pages — no backend at request time.
- If any single source fails on a given run, the previous value for that
  section is kept (see the `errors` array in `feed.json`) rather than blanking
  the dashboard.

## Local development

```bash
npm install
CONGRESS_API_KEY=your_key_here npm run build
```

This regenerates `data/feed.json`. Open `index.html` via any static file
server (e.g. `npx serve .`) to preview — `fetch()` of `data/feed.json` will
fail under a plain `file://` URL.

## Setup notes

- `CONGRESS_API_KEY` is stored as a GitHub Actions repository secret, not in
  any committed file.
- To change refresh frequency, edit the `cron` schedule in
  `.github/workflows/update-data.yml`.
- To add/remove tracked bills, edit `scripts/bills-config.mjs` (server-side
  fetch metadata) and the matching `bills` object in `index.html` (frontend
  display metadata — title, committee, badge/progress stage, ticker label).
- Pins, per-bill notes, and search are client-side only (localStorage) and
  are unaffected by the backend refresh.
