# ☀️ SolarRoof

An open, client-side solar-potential calculator for European homeowners.
Pin your roof on a map, describe it, and get your annual production, savings,
CO₂ avoided, and **payback period** — using EU PVGIS satellite data. No backend,
no signup.

> **Status: initial scaffold.** The structure, layout and shared foundation are
> in place. The feature modules are *started but not finished* — see
> [CONTRIBUTING.md](CONTRIBUTING.md) for where to pick up.

## Tech
Vanilla HTML/CSS/JS · [Leaflet](https://leafletjs.com) · [Chart.js](https://www.chartjs.org)
· [PVGIS API](https://re.jrc.ec.europa.eu/pvg_tools/). No build step.

## Run
```bash
# just open it
open index.html
# or serve it (recommended)
python3 -m http.server 8000   # → http://localhost:8000
```

## Structure
```
solarroof/
├── index.html        # app shell (layout done, scripts linked)
├── css/styles.css    # base styles (started)
└── js/
    ├── app.js        # shared state + event bus + controller  ✅ foundation done
    ├── map.js        # location & map        🔨 started
    ├── inputs.js     # roof form             🔨 started
    ├── engine.js     # energy estimate / PVGIS   ⬜ stub (core task)
    ├── finance.js    # savings & payback         ⬜ stub
    └── charts.js     # Chart.js visuals          ⬜ stub
```

## License
MIT — see [LICENSE](LICENSE).
