/* =============================================================================
   SolarRoof · js/inputs.js  —  roof + orientation steps, step navigation
   Everything that turns raw user input (roof shape, area, pitch, panel
   efficiency, compass direction) into AppState.roof. Reads/writes AppState
   (js/state.js) and hands off to js/engine.js's runCalculation().
   ========================================================================== */

/* ---------------------------------------------------------------------------
   STEP NAVIGATION
   ------------------------------------------------------------------------- */
function goStep(n) {
  // Layout is a single continuous scroll (no hide/show between steps), so
  // this just drives the progress-dot state and scrolls to the right card.
  for (let i = 1; i <= 4; i++) {
    const panel = document.getElementById('step' + i);
    if (panel) panel.classList.add('active');
    const prog = document.getElementById('prog' + i);
    if (prog) {
      prog.classList.toggle('active', i === n);
      prog.classList.toggle('done', i < n);
    }
  }
  for (let i = 1; i <= 3; i++) {
    const line = document.getElementById('pline' + i);
    if (line) line.classList.toggle('done', i < n);
  }
  const target = document.getElementById('step' + n);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------------------------------------------------------------------
   ROOF STEP — type, area, pitch, efficiency
   ------------------------------------------------------------------------- */
function selectRoof(el, type) {
  document.querySelectorAll('.roof-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  AppState.roof.type = type;
}

function validateAndGoStep3() {
  const areaInput = document.getElementById('roofArea');
  const pitchInput = document.getElementById('pitchAngle');
  const area = parseFloat(areaInput.value);
  const pitch = parseFloat(pitchInput.value);
  const effSlider = document.getElementById('effSlider');

  let ok = true;
  if (isNaN(area) || area < 10 || area > 500) {
    areaInput.classList.add('error');
    document.getElementById('areaErr').classList.add('show');
    ok = false;
  } else {
    areaInput.classList.remove('error');
    document.getElementById('areaErr').classList.remove('show');
  }

  if (isNaN(pitch) || pitch < 0 || pitch > 70) {
    pitchInput.classList.add('error');
    document.getElementById('pitchErr').classList.add('show');
    ok = false;
  } else {
    pitchInput.classList.remove('error');
    document.getElementById('pitchErr').classList.remove('show');
  }

  if (!ok) return;

  AppState.roof.area = area;
  AppState.roof.pitch = pitch;
  AppState.roof.efficiency = parseFloat(effSlider.value) / 100;

  document.getElementById('next3').style.display = 'inline-flex';
  goStep(3);
}

/* ---------------------------------------------------------------------------
   ORIENTATION STEP — compass buttons + optional live device compass
   ------------------------------------------------------------------------- */
// Compass heading (0=N,90=E,180=S,270=W) → PVGIS aspect (0=S,-90=E,90=W,180=N)
function headingToAspect(deg) {
  let a = deg - 180;
  if (a <= -180) a += 360;
  if (a > 180) a -= 360;
  return a;
}

function selectOrient(el, dirKey, headingDeg) {
  document.querySelectorAll('.orient-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');

  AppState.roof.azimuth = headingToAspect(headingDeg);

  const needle = document.getElementById('needle');
  if (needle) needle.setAttribute('transform', `rotate(${headingDeg}, 85, 85)`);

  document.getElementById('orientTip').textContent = t('orientTips')[dirKey] || '';

  const next3 = document.getElementById('next3');
  if (next3) next3.style.display = 'inline-flex';
}

function enableLiveCompass() {
  const status = document.getElementById('compassStatus');

  const start = () => {
    window.addEventListener('deviceorientationabsolute', onOrient, true);
    window.addEventListener('deviceorientation', onOrient, true);
    status.textContent = t('compassReading');
  };

  function onOrient(e) {
    let heading = e.webkitCompassHeading != null ? e.webkitCompassHeading : (360 - e.alpha);
    if (isNaN(heading)) return;
    heading = (heading + 360) % 360;

    const needle = document.getElementById('needle');
    if (needle) needle.setAttribute('transform', `rotate(${heading}, 85, 85)`);
    AppState.roof.azimuth = headingToAspect(heading);
    status.textContent = t('compassHeading')(Math.round(heading));
  }

  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(res => { if (res === 'granted') start(); else status.textContent = t('compassDenied'); })
      .catch(() => { status.textContent = t('compassUnavailable'); });
  } else if (window.DeviceOrientationEvent) {
    start();
  } else {
    status.textContent = t('compassUnsupported');
  }
}
