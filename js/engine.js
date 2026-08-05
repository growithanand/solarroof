/* =============================================================================
   SolarRoof · js/engine.js  —  energy estimate
   Calls PVGIS (through the /api/pvgis proxy in server.js) for real satellite
   yield, with an offline formula fallback if PVGIS is slow or unavailable.
   Reads AppState.location/roof (js/state.js), hands the result to
   js/finance.js's computeFinance() and renderResults().
   ========================================================================== */

function peakKwp() {
  const { area, efficiency } = AppState.roof;
  return +(area * (efficiency || 0.20)).toFixed(2);
}

async function estimateByPVGIS(lat, lon, kwp, angle, aspect) {
  // Call PVGIS through our own /api/pvgis proxy (see server.js) instead of
  // hitting re.jrc.ec.europa.eu directly — the browser blocks that with a
  // CORS error since PVGIS doesn't send Access-Control-Allow-Origin.
  const url = `/api/pvgis` +
    `?lat=${lat}&lon=${lon}&peakpower=${kwp}&loss=22&angle=${angle}&aspect=${aspect}&outputformat=json`;
  console.log('[Engine] PVGIS request:', url);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
  if (!res.ok) throw new Error('PVGIS HTTP ' + res.status);
  const data = await res.json();
  console.log('[Engine] PVGIS response:', data);
  const annualKwh = Math.round(data.outputs.totals.fixed.E_y);
  const monthlyKwh = data.outputs.monthly.fixed.map(m => Math.round(m.E_m));
  return { annualKwh, monthlyKwh, source: 'pvgis' };
}

function estimateByFormula(kwp, lat) {
  const latitude = lat ?? 50;
  const specificYield = Math.max(700, 1100 - (latitude - 40) * 8);
  const annualKwh = Math.round(kwp * specificYield);
  const weights = [0.03,0.05,0.07,0.09,0.11,0.12,0.12,0.11,0.09,0.07,0.04,0.03];
  const monthlyKwh = weights.map(w => Math.round(annualKwh * w));
  return { annualKwh, monthlyKwh, source: 'formula' };
}

// Rough hourly shape for a typical summer day, scaled to the peak month.
function hourlyShape(peakMonthKwh) {
  const dailyAvg = peakMonthKwh / 30;
  const weights = [0,0,0,0,0,0.02,0.06,0.12,0.18,0.22,0.24,0.24,0.22,0.20,0.16,0.11,0.06,0.02,0,0,0,0,0,0];
  const scale = dailyAvg / weights.reduce((a, b) => a + b, 0);
  return weights.map(w => +(w * scale).toFixed(2));
}

async function runCalculation() {
  const btn = document.querySelector('#step3 .btn-primary');
  const originalText = btn ? btn.innerHTML : null;
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="loader"></span> ${t('calculating')}`; }

  try {
    const { lat, lon } = AppState.location;
    const { pitch, azimuth } = AppState.roof;
    const kwp = peakKwp();

    let energy;
    try {
      energy = await estimateByPVGIS(lat, lon, kwp, pitch, azimuth);
    } catch (err) {
      console.warn('[Engine] PVGIS unavailable, using formula fallback:', err);
      energy = estimateByFormula(kwp, lat);
    }

    AppState.result.annualKwh = energy.annualKwh;
    AppState.result.monthlyKwh = energy.monthlyKwh;
    AppState.result.hourlyKwh = hourlyShape(Math.max(...energy.monthlyKwh));

    AppState.result._source = energy.source;
    computeFinance(kwp, energy.annualKwh);
    renderResults(kwp, energy.source);
    goStep(4);
  } catch (err) {
    console.error('[Engine] calculation failed', err);
    showToast(t('calcFailed'));
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
  }
}
