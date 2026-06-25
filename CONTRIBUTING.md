# Contributing — where to pick up

The foundation (`app.js`) is done. Everything else is started or stubbed.
Each module is independent: you only read/write **`AppState`** and talk through
the **`Bus`** event system — you never call another file's code directly. So all
four areas below can be built in parallel without anyone blocking anyone.

## How the pieces connect
```
map.js     → sets AppState.location  → Bus.emit('location:set')
inputs.js  → sets AppState.roof      → Bus.emit('roof:set')
[Calculate] → app.js calls Engine → Finance → Results → Charts
```

## Four things to build (pick one each)

1. **map.js** — finish click-to-pin, the GPS button, (optional) address lookup.
2. **inputs.js** — finish reading pitch + efficiency, wire the orientation buttons.
3. **engine.js** — the core: call the PVGIS API for real solar data, with a
   formula fallback. Must return `{ annualKwh, monthlyKwh[], peakKwp }`.
4. **finance.js + charts.js** — payback/savings/CO₂ maths, render the results,
   and draw the monthly Chart.js bar chart.

Each file has a header comment and `TODO`s marking exactly what's left.

## Workflow
- `main` stays working. Build on a branch (`feat/map`, `feat/engine`, …).
- Small commits, open a PR, one teammate reviews, merge.
- `git pull` from `main` often so you don't drift.
