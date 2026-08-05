/* =============================================================================
   SolarRoof · js/finance.js  —  money + CO₂, results text
   Turns an annual kWh figure into system cost, savings, payback, and CO₂
   avoided, then writes the headline numbers, badge, and savings table into
   the results screen. Chart drawing itself lives in js/charts.js.
   ========================================================================== */

const COST_PER_KWP = 1200; // €/kWp installed (flat-rate assumption, see report §3.5)

function computeFinance(kwp, annualKwh) {
  const { price, co2 } = AppState.country;

  const systemCost = Math.round(kwp * COST_PER_KWP);
  const savings = Math.round(annualKwh * price);
  const payback = savings > 0 ? +(systemCost / savings).toFixed(1) : null;
  const co2Avoided = Math.round(annualKwh * co2);

  Object.assign(AppState.result, { systemCost, savings, payback, co2: co2Avoided });
}

function renderResults(kwp, source) {
  const r = AppState.result;
  const { name } = AppState.country;

  document.getElementById('r-annual').textContent = r.annualKwh.toLocaleString();
  document.getElementById('r-savings').textContent = r.savings.toLocaleString();
  document.getElementById('r-co2').textContent = r.co2.toLocaleString();
  document.getElementById('r-panels').textContent = Math.ceil(kwp * 1000 / 400);
  document.getElementById('r-psh').textContent = (r.annualKwh / 365).toFixed(1);
  document.getElementById('r-payback').textContent = r.payback != null ? r.payback : '—';

  document.getElementById('resultSummaryLine').textContent =
    t('resultSummary')(AppState.roof.area, name, kwp, source);

  const badge = document.getElementById('viabilityBadge');
  if (r.payback != null && r.payback <= 8) {
    badge.textContent = t('badgeExcellent'); badge.className = 'badge badge-green';
  } else if (r.payback != null && r.payback <= 15) {
    badge.textContent = t('badgeGood'); badge.className = 'badge badge-amber';
  } else {
    badge.textContent = t('badgeMarginal'); badge.className = 'badge badge-red';
  }

  document.getElementById('finNote').textContent =
    t('finNote')(name, AppState.country.price.toFixed(2));

  renderSavingsTable();
  renderCharts();

  const advice = document.getElementById('orientAdvice');
  advice.innerHTML = t('orientAdviceTip')((AppState.country.co2 * 100).toFixed(0), name);
}

function renderSavingsTable() {
  const r = AppState.result;
  const periods = [1, 5, 10, 20];
  const body = document.getElementById('savingsBody');
  body.innerHTML = '';
  periods.forEach(y => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t('years')(y)}</td>
      <td>${Math.round(r.annualKwh * y).toLocaleString()}</td>
      <td>€${Math.round(r.savings * y).toLocaleString()}</td>
      <td>${Math.round(r.co2 * y).toLocaleString()}</td>
    `;
    body.appendChild(tr);
  });
}
