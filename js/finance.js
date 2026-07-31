/* =============================================================================
   SolarRoof · finance.js  —  money + CO₂            [ IMPLEMENTED ]

   compute(energy) returns: { systemCost, savings, payback, co2 }

   Formulas:
     systemCost = peakKwp × ~€1500
     savings    = annualKwh × country price (€/kWh)
     payback    = systemCost ÷ savings              ← the headline ROI number
     co2        = annualKwh × country CO₂ factor (kg/kWh)
   ========================================================================== */

const Finance = {
  COST_PER_KWP: 1500, // €/kWp installed, all-in (rough EU average)

  compute(energy) {
    const { peakKwp, annualKwh } = energy;
    const { price, co2 } = AppState.country;

    const systemCost = Math.round(peakKwp * this.COST_PER_KWP);
    const savings = Math.round(annualKwh * price);
    const payback = savings > 0 ? +(systemCost / savings).toFixed(1) : null;
    const co2Avoided = Math.round(annualKwh * co2);

    return { systemCost, savings, payback, co2: co2Avoided };
  }
};

const Results = {
  render() {
    const r = AppState.result;

    const set = (id, v) => { document.getElementById(id).textContent = v; };

    set('r-annual', r.annualKwh != null ? `${r.annualKwh.toLocaleString()} kWh/yr` : '—');
    set('r-cost', r.systemCost != null ? `€${r.systemCost.toLocaleString()}` : '—');
    set('r-savings', r.savings != null ? `€${r.savings.toLocaleString()}/yr` : '—');
    set('r-payback', r.payback != null ? `${r.payback} yrs` : '—');
    set('r-co2', r.co2 != null ? `${r.co2.toLocaleString()} kg/yr` : '—');

    document.getElementById('results').classList.remove('hidden');
  }
};