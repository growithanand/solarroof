/* =============================================================================
   SolarRoof · map.js  —  location picking          [ STARTED — continue here ]

   Done:    the map loads and centres on Europe.
   To do:   1. click the map → drop/move a pin → save lat/lon to AppState
            2. "Use my location" GPS button (#gps-btn)
            3. (optional) reverse-geocode the pin to a street address

   When the pin is set, finish setPin() so it does:
       AppState.location.lat = ...; AppState.location.lon = ...;
       Bus.emit('location:set', AppState.location);
   Docs: https://leafletjs.com/examples.html
   ========================================================================== */

const Map = {
  map: null, marker: null,

  init() {
    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19
    });
    this.map = L.map('map', { layers: [street] }).setView([50.98, 11.32], 5);

    // TODO: this.map.on('click', e => this.setPin(e.latlng.lat, e.latlng.lng));
    // TODO: wire #gps-btn to navigator.geolocation.getCurrentPosition(...)
  },

  setPin(lat, lon) {
    // TODO: place/move this.marker, save to AppState.location, emit 'location:set',
    //       and show the coordinates in #coords.
  }
};
