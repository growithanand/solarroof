/* =============================================================================
   SolarRoof · engine.js  —  energy estimate         [ IMPLEMENTED ]

   estimate() returns a Promise resolving to:
     { annualKwh, monthlyKwh: [12 values], peakKwp, source: 'pvgis' | 'formula' }

   Plan:
     1. peakKwp = roof area × efficiency factor  (≈0.15 kWp per m² at 20%)
     2. Call the EU PVGIS API for real satellite yield (±5%)
     3. If the API fails/times out, fall back to a simple formula so the app
        still works offline.
   ========================================================================== */

const Engine = {
  // Roughly: 1 m² of panel at X% efficiency ≈ X kWp per m² (1000 W/m² STC).
  peakKwp() {
    const { area, efficiency } = AppState.roof;
    if (!area) return null;
    return +(area * (efficiency || 0.20)).toFixed(2);
  },

  async estimate() {
    const { lat, lon } = AppState.location;
    const { pitch, azimuth } = AppState.roof;
    const peakKwp = this.peakKwp();

    if (!peakKwp) return null; // no roof area entered yet
    if (lat == null || lon == null) return null; // no location pinned yet

    try {
      const result = await this.estimateByPVGIS(lat, lon, peakKwp, pitch ?? 30, azimuth ?? 0);
      return { ...result, peakKwp, source: 'pvgis' };
    } catch (err) {
      console.warn('[Engine] PVGIS unavailable, falling back to formula:', err);
      const result = this.estimateByFormula(peakKwp, lat);
      return { ...result, peakKwp, source: 'formula' };
    }
  },

  async estimateByPVGIS(lat, lon, peakKwp, angle, aspect) {
    const url = `https://re.jrc.ec.europa.eu/api/v5_2/PVcalc` +
      `?lat=${lat}&lon=${lon}&peakpower=${peakKwp}&loss=22` +
      `&angle=${angle}&aspect=${aspect}&outputformat=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`PVGIS HTTP ${res.status}`);
    const data = await res.json();

    const annualKwh = Math.round(data.outputs.totals.fixed.E_y);
    const monthlyKwh = data.outputs.monthly.fixed.map(m => Math.round(m.E_m));

    return { annualKwh, monthlyKwh };
  },

  // Offline fallback: rough monthly irradiance shape for temperate Europe,
  // scaled by latitude (lower sun angle further north = less annual yield).
  estimateByFormula(peakKwp, lat) {
    // Baseline specific yield (kWh per kWp per year) tapering with latitude.
    const latitude = lat ?? 50;
    const specificYield = Math.max(700, 1100 - (latitude - 40) * 8); // ~kWh/kWp/yr
    const annualKwh = Math.round(peakKwp * specificYield);

    // Relative monthly weights for a northern-hemisphere temperate climate.
    const weights = [0.03, 0.05, 0.07, 0.09, 0.11, 0.12, 0.12, 0.11, 0.09, 0.07, 0.04, 0.03];
    const monthlyKwh = weights.map(w => Math.round(annualKwh * w));

    return { annualKwh, monthlyKwh };
  }
};