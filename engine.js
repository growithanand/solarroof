/* =============================================================================
   SolarRoof · engine.js  —  energy estimate         [ STUB — the core task ]

   estimate() must return: { annualKwh, monthlyKwh: [12 values], peakKwp }
   App.calculate() already calls it — just fill it in.

   Plan:
     1. peakKwp = roof area × efficiency factor  (≈0.15 kWp per m² at 20%)
     2. Call the EU PVGIS API for real satellite yield (±5%):
          https://re.jrc.ec.europa.eu/api/v5_2/PVcalc
          ?lat=&lon=&peakpower=&loss=22&angle=<pitch>&aspect=<azimuth>&outputformat=json
        Read outputs.totals.fixed.E_y and outputs.monthly.fixed[].E_m
     3. If the API fails/times out, fall back to a simple formula so the app
        still works offline. Show which source was used.
   ========================================================================== */

const Engine = {
  estimate() {
    // TODO: implement. Return null for now so the app reports "not implemented".
    return null;
  },

  // Suggested offline fallback to write once the API path works:
  // estimateByFormula(peakKwp) { ... }
};
