/* =============================================================================
   SolarRoof · inputs.js  —  the roof form            [ STARTED — continue here ]

   Done:    reads roof area (worked example to copy).
   To do:   read pitch + efficiency the same way, and wire the 8 orientation
            buttons so a click sets AppState.roof.azimuth.

   Pattern for every field:  read value → save to AppState.roof → that's it.
   ========================================================================== */

const Inputs = {
  // PVGIS azimuth convention: 0 = South, -90 = East, 90 = West, 180 = North.
  ORIENT: { S:0, SE:-45, E:-90, NE:-135, N:180, NW:135, W:90, SW:45 },

  init() {
    // Worked example — copy this for pitch and efficiency:
    document.getElementById('roof-area')
      .addEventListener('input', e => { AppState.roof.area = parseFloat(e.target.value) || null; });

    // TODO: same for #roof-pitch  → AppState.roof.pitch
    // TODO: same for #panel-efficiency → AppState.roof.efficiency (parseFloat)

    // TODO: orientation buttons
    // document.querySelectorAll('.orient').forEach(btn =>
    //   btn.addEventListener('click', () => {
    //     document.querySelectorAll('.orient').forEach(b => b.classList.remove('selected'));
    //     btn.classList.add('selected');
    //     AppState.roof.azimuth = this.ORIENT[btn.dataset.dir];
    //   }));
  }
};
