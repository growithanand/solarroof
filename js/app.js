/* =============================================================================
   SolarRoof · app.js  —  shared foundation (the "plumbing")

   This file is the only one that's mostly finished, because it's the glue the
   other files depend on. It gives you:
     • AppState — one object holding all the app's data
     • Bus      — a tiny event system so modules don't call each other directly
     • App      — the controller wired to the Calculate button

   Each module reads/writes AppState and talks via Bus. So you can build your
   module without ever reading anyone else's file.
   ========================================================================== */

const AppState = {
  location: { lat: null, lon: null },
  roof:     { area: null, pitch: null, azimuth: 0, efficiency: 0.20 },
  country:  { code: 'DE', price: 0.32, co2: 0.35 },
  result:   { annualKwh: null, monthlyKwh: [], savings: null, payback: null, co2: null }
};

const Bus = {
  _h: {},
  on(evt, fn)  { (this._h[evt] ||= []).push(fn); },
  emit(evt, d) { console.log('[bus]', evt, d); (this._h[evt] || []).forEach(fn => fn(d)); }
};

const App = {
  init() {
    Map.init();
    Inputs.init();
    document.getElementById('calculate-btn')
      .addEventListener('click', () => this.calculate());
    console.log('[App] ready — modules loaded');
  },

  // The pipeline is wired; the steps it calls are still being built.
  calculate() {
    const energy = Engine.estimate();        // ← Engine module (to build)
    if (!energy) { alert('Engine not implemented yet.'); return; }
    Object.assign(AppState.result, energy);

    const money = Finance.compute(energy);   // ← Finance module (to build)
    Object.assign(AppState.result, money);

    Results.render();                        // ← Finance module (to build)
    Charts.monthly(energy.monthlyKwh);       // ← Charts module (to build)
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
