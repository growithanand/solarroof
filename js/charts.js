/* =============================================================================
   SolarRoof · charts.js  —  Chart.js visuals        [ IMPLEMENTED ]

   monthly(data) draws a 12-bar chart of monthly kWh on <canvas id="chart-monthly">.
   Docs: https://www.chartjs.org/docs/latest/
   ========================================================================== */

const Charts = {
  _monthly: null,
  MONTHS: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],

  monthly(data) {
    if (!data || !data.length) return;

    if (this._monthly) this._monthly.destroy();

    const ctx = document.getElementById('chart-monthly');
    this._monthly = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.MONTHS,
        datasets: [{
          label: 'Estimated production (kWh)',
          data: data,
          backgroundColor: '#F5A623',
          borderRadius: 6,
          maxBarThickness: 34
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y.toLocaleString()} kWh`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: v => `${v} kWh` },
            grid: { color: '#eef1f4' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }
};