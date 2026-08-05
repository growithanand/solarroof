/* =============================================================================
   SolarRoof · js/map.js  —  location step
   Leaflet map, pin placement, reverse geocoding, country selection, GPS,
   city shortcuts, and address search. Reads/writes AppState (js/state.js)
   and calls into js/inputs.js's goStep() for navigation.
   ========================================================================== */

let leafletMap = null, marker = null, streetLayer = null, satLayer = null;

function initMap() {
  streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  });
  satLayer = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri', maxZoom: 19 }
  );

  leafletMap = L.map('map', { layers: [streetLayer] })
    .setView([AppState.country.lat, AppState.country.lon], 6);

  leafletMap.on('click', e => setPin(e.latlng.lat, e.latlng.lng));
}

function setMapView(mode) {
  if (!leafletMap) return;
  const streetBtn = document.getElementById('btnStreet');
  const satBtn = document.getElementById('btnSat');

  if (mode === 'satellite') {
    if (leafletMap.hasLayer(streetLayer)) leafletMap.removeLayer(streetLayer);
    satLayer.addTo(leafletMap);
    satBtn.classList.add('active-btn');
    streetBtn.classList.remove('active-btn');
  } else {
    if (leafletMap.hasLayer(satLayer)) leafletMap.removeLayer(satLayer);
    streetLayer.addTo(leafletMap);
    streetBtn.classList.add('active-btn');
    satBtn.classList.remove('active-btn');
  }
}

function setPin(lat, lon, label) {
  if (marker) {
    marker.setLatLng([lat, lon]);
  } else {
    marker = L.marker([lat, lon], { draggable: true }).addTo(leafletMap);
    marker.on('dragend', () => {
      const p = marker.getLatLng();
      setPin(p.lat, p.lng);
    });
  }

  AppState.location.lat = lat;
  AppState.location.lon = lon;

  const locCard = document.getElementById('locCard');
  const locName = document.getElementById('locName');
  const locCoords = document.getElementById('locCoords');
  locCard.style.display = 'flex';
  locCoords.textContent = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  locName.textContent = label || 'Locating address…';

  document.getElementById('next1').style.display = 'inline-flex';

  if (!label) reverseGeocode(lat, lon);
  checkCountryMismatch(lat, lon);
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const label = data.address
      ? [data.address.road, data.address.city || data.address.town || data.address.village].filter(Boolean).join(', ')
      : null;
    AppState.location.label = label || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    document.getElementById('locName').textContent = AppState.location.label;
  } catch {
    AppState.location.label = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    document.getElementById('locName').textContent = AppState.location.label;
  }
}

function checkCountryMismatch(lat, lon) {
  const box = document.getElementById('countryMismatchBox');
  const c = AppState.country;
  const distDeg = Math.hypot(lat - c.lat, lon - c.lon);
  if (distDeg > 12) {
    box.textContent = t('countryMismatch')(c.name);
    box.classList.add('show');
  } else {
    box.classList.remove('show');
  }
}

function onCountryChange() {
  const code = document.getElementById('countrySelect').value;
  if (!code || !COUNTRIES[code]) return;

  const c = COUNTRIES[code];
  AppState.country = { code, ...c };

  leafletMap.setView([c.lat, c.lon], 6);
  renderCityPills(c.cities);
  if (AppState.location.lat != null) checkCountryMismatch(AppState.location.lat, AppState.location.lon);
}

function renderCityPills(cities) {
  const wrap = document.getElementById('cityPills');
  wrap.innerHTML = '';
  cities.forEach(([name, lat, lon]) => {
    const pill = document.createElement('button');
    pill.className = 'city-pill';
    pill.textContent = name;
    pill.onclick = () => {
      leafletMap.setView([lat, lon], 12);
      setPin(lat, lon, name);
    };
    wrap.appendChild(pill);
  });
}

function locateMe() {
  const btn = document.getElementById('locateBtn');
  if (!navigator.geolocation) {
    showToast(t('geoNotSupported'));
    return;
  }
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="loader"></span> ${t('locating')}`;

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      leafletMap.setView([latitude, longitude], 15);
      setPin(latitude, longitude);
      btn.disabled = false;
      btn.innerHTML = original;
    },
    () => {
      showToast(t('geoFailed'));
      btn.disabled = false;
      btn.innerHTML = original;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// Address input: geocode on Enter.
document.addEventListener('DOMContentLoaded', () => {
  const addr = document.getElementById('addrInput');
  if (addr) {
    addr.addEventListener('keydown', async e => {
      if (e.key !== 'Enter') return;
      const q = addr.value.trim();
      if (!q) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat), lon = parseFloat(data[0].lon);
          leafletMap.setView([lat, lon], 15);
          setPin(lat, lon, data[0].display_name.split(',').slice(0, 2).join(','));
        } else {
          showToast(t('addrNotFound'));
        }
      } catch {
        showToast(t('addrLookupFailed'));
      }
    });
  }
});
