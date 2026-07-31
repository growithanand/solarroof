/* =============================================================================
   SolarRoof · map.js  —  location picking          [ IMPLEMENTED ]

   Done:    1. click the map → drop/move a pin → save lat/lon to AppState
            2. "Use my location" GPS button (#gps-btn)
            3. reverse-geocode the pin to a street address (OpenStreetMap Nominatim)
   Docs: https://leafletjs.com/examples.html
   ========================================================================== */

const Map = {
  map: null, marker: null,

  init() {
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19
    });
    this.map = L.map('map', { layers: [street] }).setView([50.98, 11.32], 5);

    this.map.on('click', e => this.setPin(e.latlng.lat, e.latlng.lng));

    const gpsBtn = document.getElementById('gps-btn');
    gpsBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
      }
      gpsBtn.disabled = true;
      const originalText = gpsBtn.textContent;
      gpsBtn.textContent = '📍 Locating…';

      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          this.map.setView([latitude, longitude], 15);
          this.setPin(latitude, longitude);
          gpsBtn.disabled = false;
          gpsBtn.textContent = originalText;
        },
        err => {
          console.warn('[Map] geolocation error', err);
          alert('Could not get your location. Please click the map instead.');
          gpsBtn.disabled = false;
          gpsBtn.textContent = originalText;
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  },

  setPin(lat, lon) {
    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      this.marker = L.marker([lat, lon], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const { lat, lng } = this.marker.getLatLng();
        this.setPin(lat, lng);
      });
    }

    AppState.location.lat = lat;
    AppState.location.lon = lon;
    Bus.emit('location:set', AppState.location);

    const coordsEl = document.getElementById('coords');
    coordsEl.textContent = `📍 ${lat.toFixed(5)}, ${lon.toFixed(5)} — looking up address…`;

    this.reverseGeocode(lat, lon, coordsEl);
  },

  // Optional: turn coordinates into a human-readable address.
  async reverseGeocode(lat, lon, coordsEl) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) throw new Error('reverse geocode failed');
      const data = await res.json();
      const label = data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
      coordsEl.textContent = `📍 ${label}`;
    } catch (err) {
      console.warn('[Map] reverse geocode unavailable', err);
      coordsEl.textContent = `📍 ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
  }
};