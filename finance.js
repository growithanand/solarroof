/* =============================================================================
   SolarRoof · finance.js  —  money + CO₂            [ STUB — continue here ]

   compute(energy) must return: { systemCost, savings, payback, co2 }

   Formulas (from the proposal):
     systemCost = peakKwp × ~€1500
     savings    = annualKwh × country price (€/kWh)
     payback    = systemCost ÷ savings              ← the headline ROI number
     co2        = annualKwh × country CO₂ factor (kg/kWh)

   Later: price-sensitivity slider, self-consumption split, 20-year degradation.
   ========================================================================== */

const Finance = {
  compute(energy) {
    // TODO: implement using the formulas above.
    return { systemCost: null, savings: null, payback: null, co2: null };
  }
};

const Results = {
  render() {
    // TODO: write each result into the #r-* spans and reveal #results.
    // const set = (id, v) => document.getElementById(id).textContent = v;
    // set('r-annual', AppState.result.annualKwh + ' kWh/yr'); ...
    document.getElementById('results').classList.remove('hidden');
  }
};
