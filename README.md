# ☀️ SolarRoof

An open, client-side solar-potential calculator for European homeowners.
Pin your roof on a map, describe it, and get your annual production, savings,
CO₂ avoided, and **payback period** — using EU PVGIS satellite data.

Location → roof details → orientation → results, all bilingual (EN/DE).

## Tech
Vanilla HTML/CSS/JS · [Leaflet](https://leafletjs.com) · [Chart.js](https://www.chartjs.org)
· [PVGIS API](https://re.jrc.ec.europa.eu/pvg_tools/) · OpenStreetMap Nominatim for geocoding

## Run
PVGIS doesn't allow direct browser calls (no CORS headers), so the app needs
to go through the included zero-dependency proxy server instead of a plain
static file server:

```bash
node server.js
# → http://localhost:8000
```

`server.js` serves the static site **and** proxies `/api/pvgis` to PVGIS on
the server side, where CORS doesn't apply. If it ever falls back to the
offline formula estimate, check the terminal running `server.js` for a
`[proxy] PVGIS request failed: …` line — that tells you why (usually a
network/firewall block, or PVGIS being temporarily down).

Requires only Node.js (no npm install, no dependencies).

## Structure
```
solarroof/
├── server.js          # static file server + PVGIS proxy (run this)
├── index.html         # app shell — loads js/app.js only
├── css/styles.css     # theme
└── js/
    ├── app.js         # state, i18n, map, form, PVGIS/formula engine, charts — everything runs from here
    ├── map.js         # earlier standalone map module — not loaded by index.html, kept for reference
    ├── engine.js      # earlier standalone PVGIS/formula module — not loaded, calls PVGIS directly (no proxy, will CORS-fail if used as-is)
    ├── finance.js     # earlier standalone payback/CO₂ module — not loaded, uses a different €/kWp cost than app.js
    └── charts.js      # earlier standalone chart module — not loaded, superseded by the hourly + monthly charts in app.js
```

`CONTRIBUTING.md` describes an original plan to split the app across four
independent modules talking through a shared `AppState`/`Bus`. That's how
`map.js`, `engine.js`, `finance.js`, and `charts.js` came about, but the app
was ultimately built as a single `app.js`. The four module files are still
in the tree but aren't wired into `index.html` — treat them as reference,
not as running code. If you're picking this back up, either delete them or
fold `app.js` back down into that module split; right now they disagree
with `app.js` in a couple of places (e.g. installed cost per kWp).

## License
MIT — see [LICENSE](LICENSE).