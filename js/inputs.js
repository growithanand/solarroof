/* =============================================================================
   SolarRoof · inputs.js  —  the roof form

   Reads all roof input values and stores them in AppState.roof.
   ========================================================================== */

const Inputs = {
  // PVGIS azimuth convention: 0 = South, -90 = East, 90 = West, 180 = North.
  ORIENT: { S:0, SE:-45, E:-90, NE:-135, N:180, NW:135, W:90, SW:45 },

  init() {
    // Roof area
    document.getElementById('roof-area')
      .addEventListener('input', e => {
        AppState.roof.area = parseFloat(e.target.value) || null;
      });

    // Roof pitch
    document.getElementById('roof-pitch')
      .addEventListener('input', e => {
        AppState.roof.pitch = parseFloat(e.target.value) || null;
      });

    // Panel efficiency
    document.getElementById('panel-efficiency')
      .addEventListener('change', e => {
        AppState.roof.efficiency = parseFloat(e.target.value);
      });

    // Orientation buttons
    document.querySelectorAll('.orient').forEach(btn =>
      btn.addEventListener('click', () => {
        document.querySelectorAll('.orient').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        AppState.roof.azimuth = this.ORIENT[btn.dataset.dir];
      })
    );
  }
};