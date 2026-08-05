/* =============================================================================
   SolarRoof · js/charts.js  —  Chart.js visuals
   Draws the hourly (typical summer day) and monthly production charts on
   the results screen. Called from js/finance.js's renderResults().
   ========================================================================== */

let hourlyChart = null, monthlyChart = null;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderCharts() {
  const r = AppState.result;

  if (hourlyChart) hourlyChart.destroy();
  hourlyChart = new Chart(document.getElementById('hourlyChart'), {
    type: 'line',
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'kWh', data: r.hourlyKwh, borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.15)', fill: true, tension: 0.35, pointRadius: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: { ticks: { maxTicksLimit: 8 } } }
    }
  });

  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [{ label: 'kWh', data: r.monthlyKwh, backgroundColor: '#f59e0b', borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}
