/* =============================================================================
   SolarRoof · charts.js  —  Chart.js visuals        [ STUB — continue here ]

   monthly(data) draws a 12-bar chart of monthly kWh on <canvas id="chart-monthly">.
   Later: a cumulative-savings line whose crossing point = the payback year.
   Docs: https://www.chartjs.org/docs/latest/
   ========================================================================== */

const Charts = {
  _monthly: null,
  MONTHS: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],

  monthly(data) {
    // TODO: build a Chart.js bar chart. Remember to destroy the old one first:
    // if (this._monthly) this._monthly.destroy();
    // this._monthly = new Chart(document.getElementById('chart-monthly'), { ... });
  }
};
