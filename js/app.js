/* =============================================================================
   SolarRoof · js/app.js  —  entry point / glue
   Everything with real logic now lives in its own module (state, map, inputs,
   engine, finance, charts — see index.html for load order). This file is
   just what's left over: the help modal, toast notifications, startup, and
   binding functions onto window for the inline onclick="…" handlers in
   index.html.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   MODAL / HELP TEXT
   ------------------------------------------------------------------------- */
function showExplain(topic) {
  const entry = I18N[AppState.lang].explain[topic];
  if (!entry) return;
  document.getElementById('modalTitle').textContent = entry.title;
  document.getElementById('modalBody').innerHTML = entry.body;
  document.getElementById('explainModal').classList.add('open');
}

function closeModal() {
  document.getElementById('explainModal').classList.remove('open');
}

/* ---------------------------------------------------------------------------
   TOAST
   ------------------------------------------------------------------------- */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
}

/* ---------------------------------------------------------------------------
   INIT
   ------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderCityPills(COUNTRIES[AppState.country.code].cities);
  applyLanguage();
  console.log('[SolarRoof] ready');
});

/* ---------------------------------------------------------------------------
   GLOBAL EXPOSURE — every function referenced from an inline onclick="…"
   in index.html is bound onto window explicitly. Belt-and-braces: if these
   scripts ever get loaded as modules, wrapped in an IIFE, or bundled, the
   inline handlers (which always run in global scope) still resolve.
   ------------------------------------------------------------------------- */
Object.assign(window, {
  setLang, onCountryChange, locateMe, setMapView, goStep, selectRoof,
  validateAndGoStep3, selectOrient, enableLiveCompass, runCalculation,
  showExplain, closeModal
});
