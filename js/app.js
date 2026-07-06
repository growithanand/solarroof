/* =============================================================================
   SolarRoof · app.js  —  full wizard implementation
   Location → Roof → Orientation → Results, all in one file since index.html
   only loads js/app.js and every step calls plain global functions.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   1. STATE
   ------------------------------------------------------------------------- */
const AppState = {
  lang:     'en',
  location: { lat: null, lon: null, label: null },
  roof:     { type: 'satteldach', area: 80, pitch: 32, azimuth: 180, efficiency: 0.20 },
  country:  { code: 'DE', name: 'Germany', price: 0.32, co2: 0.38, lat: 51.16, lon: 10.45 },
  result:   { annualKwh: null, monthlyKwh: [], hourlyKwh: [], savings: null, payback: null, co2: null }
};

/* ---------------------------------------------------------------------------
   1b. TRANSLATIONS
   ------------------------------------------------------------------------- */
const I18N = {
  en: {
    headerBadge: '🇪🇺 European Solar Calculator',
    heroTitle: 'Will solar panels <span>benefit your home?</span>',
    heroSub: 'Enter your location, roof details, and orientation. We calculate your annual solar energy production using real European satellite data (PVGIS).',
    stepLocation: 'Location', stepRoof: 'Roof', stepDirection: 'Direction', stepResults: 'Results',
    locTitle: 'Your location',
    locSub: 'Select your country, then click "Locate Me" or pick a city. Drag the pin to your exact roof position.',
    selectCountry: '🌍 Select country',
    addrPlaceholder: 'Address (optional — or click map)',
    locateMe: 'Locate Me', street: 'Street', satellite: 'Satellite',
    nextRoof: 'Next: Roof Details →',
    roofTitle: 'Roof configuration',
    roofSub: 'Select your roof type (German names shown) and enter the measurements.',
    selectRoofType: 'Select roof type',
    roofGable: 'Gable', roofHip: 'Hip', roofMono: 'Mono-pitch', roofFlat: 'Flat', roofMansard: 'Mansard',
    roofGambrelHip: 'Gambrel-Hip', roofPyramid: 'Pyramid', roofSawtooth: 'Sawtooth', roofLShape: 'L-Shape',
    roofBarrel: 'Barrel', roofCrossGable: 'Cross-Gable', roofOther: 'Other',
    roofArea: 'Roof area (m²)', roofAreaHint: 'Usable surface of the solar-facing roof face',
    areaErr: 'Enter a value between 10 and 500 m²',
    pitchAngle: 'Pitch angle (°)', pitchHint: '0° = flat, 30–40° = typical home', pitchErr: 'Enter 0–70°',
    panelEfficiency: 'Panel efficiency:', efficiencyHint: 'Standard panels 18–20% · Premium 21–23%',
    back: '← Back', nextOrientation: 'Next: Orientation →',
    orientTitle: 'Roof orientation',
    orientSub: 'Which direction does the main sloping face of your roof point toward?',
    liveCompass: 'Use Live Phone Compass', compassPlaceholder: 'Point phone towards your roof...',
    dirS: 'South', dirSW: 'South-West', dirSE: 'South-East', dirE: 'East', dirW: 'West',
    dirN: 'North', dirNE: 'North-East', dirNW: 'North-West',
    orientTipDefault: 'Pick the direction above to see its impact.',
    calcButton: 'Calculate with PVGIS →',
    resultsHeading: 'Your PVGIS Solar Potential',
    energyOverview: 'Energy overview', howCalculated: 'How was this calculated?',
    annualEnergy: 'Annual energy', perYear: 'kWh per year',
    annualSavings: 'Annual savings', eurPerYear: 'EUR per year',
    co2Avoided: 'CO₂ avoided', kgPerYear: 'kg per year',
    panelsNeeded: 'Panels needed', wattModules: '× 400W modules',
    dailyAverage: 'Daily Average', kwhDay: 'kWh / day',
    paybackPeriod: 'Payback period', yearsEstimated: 'years (estimated)',
    hourlyLabel: 'Hourly output — typical summer day (kWh)',
    monthlyLabel: 'Monthly production — full year (kWh)',
    financialBreakdown: 'Financial breakdown',
    finNoteDefault: 'Based on local electricity price and ~€1,200/kWp installed system cost.',
    period: 'Period', energyKwh: 'Energy (kWh)', savingsEur: 'Savings (€)', co2SavedKg: 'CO₂ saved (kg)',
    disclaimer: 'Estimates based on PVGIS historical satellite data. Actual output depends on shading, panel brand, inverter efficiency, and local weather.',
    adjustInputs: '← Adjust inputs', printSave: 'Print / Save PDF',
    footerText: 'SolarRoof Calculator &nbsp;•&nbsp; Solar model based on PVGIS &nbsp;•&nbsp; Maps © OpenStreetMap &nbsp;•&nbsp; Satellite imagery © Esri',
    help: 'Help',
    locating: 'Locating…', calculating: 'Calculating…',
    geoNotSupported: 'Geolocation is not supported by your browser.',
    geoFailed: 'Could not get your location — please click the map instead.',
    addrNotFound: 'Address not found — try clicking the map instead.',
    addrLookupFailed: 'Address lookup failed. Try clicking the map instead.',
    calcFailed: 'Something went wrong calculating your results. Please try again.',
    countryMismatch: c => `⚠️ This pin looks far from ${c}. Double-check your country selection for accurate pricing.`,
    orientTips: {
      S: 'South-facing roofs get the most sun in the Northern Hemisphere — ideal for solar.',
      SW: 'South-west catches strong afternoon sun — great, slightly less than due south.',
      SE: 'South-east catches strong morning sun — great, slightly less than due south.',
      E: 'East-facing roofs peak in the morning — solid production, about 15-20% less than south.',
      W: 'West-facing roofs peak in the afternoon — solid production, about 15-20% less than south.',
      N: 'North-facing roofs receive the least direct sun — production will be significantly lower.',
      NE: 'North-east roofs get limited morning sun — production will be noticeably lower than south.',
      NW: 'North-west roofs get limited afternoon sun — production will be noticeably lower than south.'
    },
    compassReading: 'Reading compass — point your phone toward the roof slope.',
    compassHeading: h => `Heading: ${h}°`,
    compassDenied: 'Permission denied.',
    compassUnavailable: 'Compass not available on this device.',
    compassUnsupported: 'Compass not supported on this device.',
    resultSummary: (area, country, kwp, src) => `${area} m² roof in ${country} · ${kwp} kWp system · ${src === 'pvgis' ? 'PVGIS satellite data' : 'estimated (offline formula)'}`,
    badgeExcellent: '✅ Excellent', badgeGood: '👍 Good', badgeMarginal: '⚠️ Marginal',
    finNote: (country, price) => `Based on ${country}'s electricity price (~€${price}/kWh) and ~€1,200/kWp installed system cost.`,
    orientAdviceTip: (kg, country) => `<strong>Tip:</strong> Every 100 kWh/year roughly avoids ${kg} kg of CO₂ in ${country}'s grid mix.`,
    years: y => y > 1 ? `${y} years` : `${y} year`,
    explain: {
      area: { title: 'Roof area', body: `<p>Enter only the usable, sun-facing part of your roof — skip chimneys, vents, and shaded corners.</p><p>As a rule of thumb, 1 kWp of solar panels needs about 5-7 m² of roof space.</p>` },
      pitch: { title: 'Pitch angle', body: `<p>The tilt of your roof surface from horizontal. 0° is flat, 30-40° is typical for a European house roof.</p><p>The ideal tilt is usually close to your location's latitude, but PVGIS accounts for any angle.</p>` },
      efficiency: { title: 'Panel efficiency', body: `<p>How much of the sunlight hitting a panel is converted to electricity. Standard panels: 18-20%. Premium (mono PERC/N-type): 21-23%.</p>` },
      orientation: { title: 'Roof orientation', body: `<p>In the Northern Hemisphere, south-facing roofs get the most annual sun. East/west lose about 15-20%, and north-facing roofs lose significantly more.</p>` },
      formula: { title: 'How this is calculated', body: `<div class="explain-section"><p>We send your location, roof tilt, and orientation to the EU's PVGIS satellite database, which returns real historical solar irradiance for that exact spot.</p><div class="formula-box">peakKwp = roofArea × <span>efficiency</span>
annualKwh = PVGIS(lat, lon, peakKwp, angle, aspect)
systemCost = peakKwp × <span>€1,200</span>
savings = annualKwh × <span>local price</span>
payback = systemCost ÷ savings</div><p>If PVGIS is unavailable, we fall back to a latitude-based estimate so the app still works offline.</p></div>` }
    }
  },
  de: {
    headerBadge: '🇪🇺 Europäischer Solarrechner',
    heroTitle: 'Lohnt sich Solar <span>für Ihr Dach?</span>',
    heroSub: 'Geben Sie Standort, Dachdetails und Ausrichtung ein. Wir berechnen Ihren jährlichen Solarertrag mit echten europäischen Satellitendaten (PVGIS).',
    stepLocation: 'Standort', stepRoof: 'Dach', stepDirection: 'Richtung', stepResults: 'Ergebnis',
    locTitle: 'Ihr Standort',
    locSub: 'Wählen Sie Ihr Land, klicken Sie dann auf „Standort finden" oder wählen Sie eine Stadt. Ziehen Sie den Pin auf Ihre genaue Dachposition.',
    selectCountry: '🌍 Land wählen',
    addrPlaceholder: 'Adresse (optional — oder Karte anklicken)',
    locateMe: 'Standort finden', street: 'Straße', satellite: 'Satellit',
    nextRoof: 'Weiter: Dachdetails →',
    roofTitle: 'Dachkonfiguration',
    roofSub: 'Wählen Sie Ihren Dachtyp und geben Sie die Maße ein.',
    selectRoofType: 'Dachtyp wählen',
    roofGable: 'Satteldach', roofHip: 'Walmdach', roofMono: 'Pultdach', roofFlat: 'Flachdach', roofMansard: 'Mansarddach',
    roofGambrelHip: 'Krüppelwalm', roofPyramid: 'Zeltdach', roofSawtooth: 'Sheddach', roofLShape: 'L-Form',
    roofBarrel: 'Tonnendach', roofCrossGable: 'Zwerchdach', roofOther: 'Sonstiges',
    roofArea: 'Dachfläche (m²)', roofAreaHint: 'Nutzbare Fläche der sonnenzugewandten Dachseite',
    areaErr: 'Geben Sie einen Wert zwischen 10 und 500 m² ein',
    pitchAngle: 'Neigungswinkel (°)', pitchHint: '0° = flach, 30–40° = typisches Haus', pitchErr: 'Geben Sie 0–70° ein',
    panelEfficiency: 'Modulwirkungsgrad:', efficiencyHint: 'Standardmodule 18–20% · Premium 21–23%',
    back: '← Zurück', nextOrientation: 'Weiter: Ausrichtung →',
    orientTitle: 'Dachausrichtung',
    orientSub: 'In welche Richtung zeigt die Hauptdachfläche?',
    liveCompass: 'Live-Kompass verwenden', compassPlaceholder: 'Richten Sie Ihr Telefon zum Dach aus...',
    dirS: 'Süden', dirSW: 'Südwesten', dirSE: 'Südosten', dirE: 'Osten', dirW: 'Westen',
    dirN: 'Norden', dirNE: 'Nordosten', dirNW: 'Nordwesten',
    orientTipDefault: 'Wählen Sie oben eine Richtung, um die Auswirkung zu sehen.',
    calcButton: 'Mit PVGIS berechnen →',
    resultsHeading: 'Ihr PVGIS-Solarpotenzial',
    energyOverview: 'Energieübersicht', howCalculated: 'Wie wurde das berechnet?',
    annualEnergy: 'Jahresertrag', perYear: 'kWh pro Jahr',
    annualSavings: 'Jährliche Ersparnis', eurPerYear: 'EUR pro Jahr',
    co2Avoided: 'CO₂ vermieden', kgPerYear: 'kg pro Jahr',
    panelsNeeded: 'Benötigte Module', wattModules: '× 400W Module',
    dailyAverage: 'Tagesdurchschnitt', kwhDay: 'kWh / Tag',
    paybackPeriod: 'Amortisationszeit', yearsEstimated: 'Jahre (geschätzt)',
    hourlyLabel: 'Stündlicher Ertrag — typischer Sommertag (kWh)',
    monthlyLabel: 'Monatlicher Ertrag — gesamtes Jahr (kWh)',
    financialBreakdown: 'Finanzielle Aufschlüsselung',
    finNoteDefault: 'Basierend auf lokalem Strompreis und ~1.200 €/kWp Systemkosten.',
    period: 'Zeitraum', energyKwh: 'Energie (kWh)', savingsEur: 'Ersparnis (€)', co2SavedKg: 'CO₂ gespart (kg)',
    disclaimer: 'Schätzungen basieren auf historischen PVGIS-Satellitendaten. Der tatsächliche Ertrag hängt von Verschattung, Modulmarke, Wechselrichter-Effizienz und lokalem Wetter ab.',
    adjustInputs: '← Eingaben anpassen', printSave: 'Drucken / Als PDF speichern',
    footerText: 'SolarRoof Rechner &nbsp;•&nbsp; Solarmodell basiert auf PVGIS &nbsp;•&nbsp; Karten © OpenStreetMap &nbsp;•&nbsp; Satellitenbilder © Esri',
    help: 'Hilfe',
    locating: 'Suche Standort…', calculating: 'Berechne…',
    geoNotSupported: 'Standortbestimmung wird von Ihrem Browser nicht unterstützt.',
    geoFailed: 'Standort konnte nicht ermittelt werden — bitte auf der Karte klicken.',
    addrNotFound: 'Adresse nicht gefunden — bitte auf der Karte klicken.',
    addrLookupFailed: 'Adresssuche fehlgeschlagen. Bitte auf der Karte klicken.',
    calcFailed: 'Bei der Berechnung ist ein Fehler aufgetreten. Bitte erneut versuchen.',
    countryMismatch: c => `⚠️ Dieser Pin scheint weit von ${c} entfernt zu sein. Bitte Länderauswahl für genaue Preise prüfen.`,
    orientTips: {
      S: 'Südausgerichtete Dächer erhalten in der Nordhalbkugel die meiste Sonne — ideal für Solar.',
      SW: 'Südwesten fängt starke Nachmittagssonne ein — sehr gut, etwas weniger als Süden.',
      SE: 'Südosten fängt starke Morgensonne ein — sehr gut, etwas weniger als Süden.',
      E: 'Ostdächer haben ihr Maximum am Morgen — guter Ertrag, etwa 15-20 % weniger als Süden.',
      W: 'Westdächer haben ihr Maximum am Nachmittag — guter Ertrag, etwa 15-20 % weniger als Süden.',
      N: 'Nordausgerichtete Dächer erhalten am wenigsten direkte Sonne — deutlich geringerer Ertrag.',
      NE: 'Nordost-Dächer erhalten begrenzte Morgensonne — merklich geringerer Ertrag als Süden.',
      NW: 'Nordwest-Dächer erhalten begrenzte Nachmittagssonne — merklich geringerer Ertrag als Süden.'
    },
    compassReading: 'Kompass wird gelesen — Telefon zur Dachneigung ausrichten.',
    compassHeading: h => `Richtung: ${h}°`,
    compassDenied: 'Berechtigung verweigert.',
    compassUnavailable: 'Kompass auf diesem Gerät nicht verfügbar.',
    compassUnsupported: 'Kompass wird auf diesem Gerät nicht unterstützt.',
    resultSummary: (area, country, kwp, src) => `${area} m² Dach in ${country} · ${kwp} kWp Anlage · ${src === 'pvgis' ? 'PVGIS-Satellitendaten' : 'geschätzt (Offline-Formel)'}`,
    badgeExcellent: '✅ Ausgezeichnet', badgeGood: '👍 Gut', badgeMarginal: '⚠️ Grenzwertig',
    finNote: (country, price) => `Basierend auf dem Strompreis in ${country} (~€${price}/kWh) und ~1.200 €/kWp Systemkosten.`,
    orientAdviceTip: (kg, country) => `<strong>Tipp:</strong> Je 100 kWh/Jahr werden etwa ${kg} kg CO₂ im Strommix von ${country} vermieden.`,
    years: y => y > 1 ? `${y} Jahre` : `${y} Jahr`,
    explain: {
      area: { title: 'Dachfläche', body: `<p>Geben Sie nur die nutzbare, sonnenzugewandte Fläche Ihres Dachs ein — Schornsteine, Lüftungen und verschattete Ecken auslassen.</p><p>Als Faustregel benötigt 1 kWp Solarmodule etwa 5-7 m² Dachfläche.</p>` },
      pitch: { title: 'Neigungswinkel', body: `<p>Die Neigung Ihrer Dachfläche zur Horizontalen. 0° ist flach, 30-40° ist typisch für ein europäisches Hausdach.</p><p>Der ideale Winkel liegt meist nahe am Breitengrad Ihres Standorts, aber PVGIS berücksichtigt jeden Winkel.</p>` },
      efficiency: { title: 'Modulwirkungsgrad', body: `<p>Wie viel des Sonnenlichts, das auf ein Modul trifft, in Strom umgewandelt wird. Standardmodule: 18-20 %. Premium (Mono-PERC/N-Typ): 21-23 %.</p>` },
      orientation: { title: 'Dachausrichtung', body: `<p>Auf der Nordhalbkugel erhalten südausgerichtete Dächer die meiste Jahressonne. Ost/West verlieren etwa 15-20 %, nordausgerichtete Dächer deutlich mehr.</p>` },
      formula: { title: 'So wird gerechnet', body: `<div class="explain-section"><p>Wir senden Standort, Dachneigung und Ausrichtung an die PVGIS-Satellitendatenbank der EU, die reale historische Sonneneinstrahlung für genau diesen Ort liefert.</p><div class="formula-box">peakKwp = Dachfläche × <span>Wirkungsgrad</span>
annualKwh = PVGIS(lat, lon, peakKwp, Winkel, Ausrichtung)
Systemkosten = peakKwp × <span>1.200 €</span>
Ersparnis = annualKwh × <span>lokaler Preis</span>
Amortisation = Systemkosten ÷ Ersparnis</div><p>Ist PVGIS nicht erreichbar, verwenden wir eine breitengradbasierte Schätzung, damit die App auch offline funktioniert.</p></div>` }
    }
  }
};

function t(key) { return I18N[AppState.lang][key]; }

function applyLanguage() {
  const dict = I18N[AppState.lang];
  document.documentElement.lang = AppState.lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] != null && typeof dict[key] === 'string') el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] != null) el.innerHTML = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] != null) el.placeholder = dict[key];
  });

  document.getElementById('langBtnEN').classList.toggle('active', AppState.lang === 'en');
  document.getElementById('langBtnDE').classList.toggle('active', AppState.lang === 'de');

  // Re-render dynamic content that isn't tied to a data-i18n element.
  if (AppState.result.annualKwh != null) {
    renderResults(peakKwp(), AppState.result._source || 'pvgis');
  }
}

function setLang(lang) {
  if (!I18N[lang]) return;
  AppState.lang = lang;
  applyLanguage();
}

// Country reference data: approx household electricity price (€/kWh),
// grid CO2 factor (kg/kWh), and a map center + a few sample cities.
const COUNTRIES = {
  DE: { name: 'Germany',        price: 0.40, co2: 0.38, lat: 51.16, lon: 10.45, cities: [['Berlin',52.52,13.40],['Munich',48.14,11.58],['Weimar',50.98,11.33]] },
  AT: { name: 'Austria',        price: 0.28, co2: 0.16, lat: 47.52, lon: 14.55, cities: [['Vienna',48.21,16.37],['Salzburg',47.80,13.05]] },
  CH: { name: 'Switzerland',    price: 0.22, co2: 0.03, lat: 46.82, lon: 8.23,  cities: [['Zurich',47.37,8.54],['Geneva',46.20,6.14]] },
  FR: { name: 'France',         price: 0.25, co2: 0.06, lat: 46.60, lon: 2.35,  cities: [['Paris',48.86,2.35],['Lyon',45.76,4.83]] },
  BE: { name: 'Belgium',        price: 0.35, co2: 0.17, lat: 50.85, lon: 4.35,  cities: [['Brussels',50.85,4.35]] },
  NL: { name: 'Netherlands',    price: 0.35, co2: 0.31, lat: 52.13, lon: 5.29,  cities: [['Amsterdam',52.37,4.90]] },
  LU: { name: 'Luxembourg',     price: 0.24, co2: 0.10, lat: 49.82, lon: 6.13,  cities: [['Luxembourg City',49.61,6.13]] },
  PL: { name: 'Poland',         price: 0.18, co2: 0.65, lat: 51.92, lon: 19.15, cities: [['Warsaw',52.23,21.01]] },
  CZ: { name: 'Czech Republic', price: 0.22, co2: 0.44, lat: 49.82, lon: 15.47, cities: [['Prague',50.08,14.44]] },
  SK: { name: 'Slovakia',       price: 0.20, co2: 0.15, lat: 48.67, lon: 19.70, cities: [['Bratislava',48.15,17.11]] },
  HU: { name: 'Hungary',        price: 0.11, co2: 0.24, lat: 47.16, lon: 19.50, cities: [['Budapest',47.50,19.04]] },
  SI: { name: 'Slovenia',       price: 0.19, co2: 0.24, lat: 46.15, lon: 14.99, cities: [['Ljubljana',46.06,14.51]] },
  HR: { name: 'Croatia',        price: 0.15, co2: 0.20, lat: 45.10, lon: 15.20, cities: [['Zagreb',45.81,15.98]] },
  IT: { name: 'Italy',          price: 0.30, co2: 0.26, lat: 41.87, lon: 12.57, cities: [['Rome',41.90,12.50],['Milan',45.46,9.19]] },
  ES: { name: 'Spain',          price: 0.24, co2: 0.15, lat: 40.46, lon: -3.75, cities: [['Madrid',40.42,-3.70],['Barcelona',41.39,2.17]] },
  PT: { name: 'Portugal',       price: 0.22, co2: 0.11, lat: 39.40, lon: -8.22, cities: [['Lisbon',38.72,-9.14]] },
  SE: { name: 'Sweden',         price: 0.18, co2: 0.02, lat: 60.13, lon: 18.64, cities: [['Stockholm',59.33,18.07]] },
  NO: { name: 'Norway',         price: 0.14, co2: 0.01, lat: 60.47, lon: 8.47,  cities: [['Oslo',59.91,10.75]] },
  DK: { name: 'Denmark',        price: 0.38, co2: 0.11, lat: 56.26, lon: 9.50,  cities: [['Copenhagen',55.68,12.57]] },
  FI: { name: 'Finland',        price: 0.17, co2: 0.08, lat: 61.92, lon: 25.75, cities: [['Helsinki',60.17,24.94]] },
  EE: { name: 'Estonia',        price: 0.16, co2: 0.60, lat: 58.60, lon: 25.01, cities: [['Tallinn',59.44,24.75]] },
  LV: { name: 'Latvia',         price: 0.19, co2: 0.20, lat: 56.88, lon: 24.60, cities: [['Riga',56.95,24.11]] },
  LT: { name: 'Lithuania',      price: 0.20, co2: 0.14, lat: 55.17, lon: 23.88, cities: [['Vilnius',54.69,25.28]] },
  GB: { name: 'United Kingdom', price: 0.28, co2: 0.21, lat: 55.38, lon: -3.44, cities: [['London',51.51,-0.13]] },
  IE: { name: 'Ireland',        price: 0.32, co2: 0.30, lat: 53.14, lon: -7.69, cities: [['Dublin',53.35,-6.26]] },
  GR: { name: 'Greece',         price: 0.20, co2: 0.45, lat: 39.07, lon: 21.82, cities: [['Athens',37.98,23.73]] },
  BG: { name: 'Bulgaria',       price: 0.11, co2: 0.42, lat: 42.73, lon: 25.49, cities: [['Sofia',42.70,23.32]] },
  RO: { name: 'Romania',        price: 0.15, co2: 0.28, lat: 45.94, lon: 24.97, cities: [['Bucharest',44.43,26.10]] },
  RS: { name: 'Serbia',         price: 0.09, co2: 0.65, lat: 44.02, lon: 21.00, cities: [['Belgrade',44.79,20.45]] },
  UA: { name: 'Ukraine',        price: 0.05, co2: 0.32, lat: 48.38, lon: 31.17, cities: [['Kyiv',50.45,30.52]] }
};

/* ---------------------------------------------------------------------------
   2. MAP
   ------------------------------------------------------------------------- */
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

/* ---------------------------------------------------------------------------
   3. LOCATION STEP — country, address, GPS, city pills
   ------------------------------------------------------------------------- */
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

/* ---------------------------------------------------------------------------
   4. STEP NAVIGATION
   ------------------------------------------------------------------------- */
function goStep(n) {
  // Layout is now a single continuous scroll (no hide/show between steps),
  // so this just drives the progress-dot state and scrolls the right-hand
  // rail to the relevant card.
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
   5. ROOF STEP — type, area, pitch, efficiency
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
   6. ORIENTATION STEP — compass buttons + optional live device compass
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

/* ---------------------------------------------------------------------------
   7. CALCULATION — PVGIS with formula fallback
   ------------------------------------------------------------------------- */
function peakKwp() {
  const { area, efficiency } = AppState.roof;
  return +(area * (efficiency || 0.20)).toFixed(2);
}

async function estimateByPVGIS(lat, lon, kwp, angle, aspect) {
  // Call PVGIS through our own /api/pvgis proxy (see server.js) instead of
  // hitting re.jrc.ec.europa.eu directly — the browser blocks that with a
  // CORS error since PVGIS doesn't send Access-Control-Allow-Origin.
  const url = `/api/pvgis` +
    `?lat=${lat}&lon=${lon}&peakpower=${kwp}&loss=22&angle=${angle}&aspect=${aspect}&outputformat=json`;
  console.log('[Engine] PVGIS request:', url);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  const res = await fetch(url, { signal: controller.signal });
  clearTimeout(t);
  if (!res.ok) throw new Error('PVGIS HTTP ' + res.status);
  const data = await res.json();
  console.log('[Engine] PVGIS response:', data);
  const annualKwh = Math.round(data.outputs.totals.fixed.E_y);
  const monthlyKwh = data.outputs.monthly.fixed.map(m => Math.round(m.E_m));
  return { annualKwh, monthlyKwh, source: 'pvgis' };
}

function estimateByFormula(kwp, lat) {
  const latitude = lat ?? 50;
  const specificYield = Math.max(700, 1100 - (latitude - 40) * 8);
  const annualKwh = Math.round(kwp * specificYield);
  const weights = [0.03,0.05,0.07,0.09,0.11,0.12,0.12,0.11,0.09,0.07,0.04,0.03];
  const monthlyKwh = weights.map(w => Math.round(annualKwh * w));
  return { annualKwh, monthlyKwh, source: 'formula' };
}

// Rough hourly shape for a typical summer day, scaled to the peak month.
function hourlyShape(peakMonthKwh) {
  const dailyAvg = peakMonthKwh / 30;
  const weights = [0,0,0,0,0,0.02,0.06,0.12,0.18,0.22,0.24,0.24,0.22,0.20,0.16,0.11,0.06,0.02,0,0,0,0,0,0];
  const scale = dailyAvg / weights.reduce((a, b) => a + b, 0);
  return weights.map(w => +(w * scale).toFixed(2));
}

async function runCalculation() {
  const btn = document.querySelector('#step3 .btn-primary');
  const originalText = btn ? btn.innerHTML : null;
  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="loader"></span> ${t('calculating')}`; }

  try {
    const { lat, lon } = AppState.location;
    const { pitch, azimuth } = AppState.roof;
    const kwp = peakKwp();

    let energy;
    try {
      energy = await estimateByPVGIS(lat, lon, kwp, pitch, azimuth);
    } catch (err) {
      console.warn('[Engine] PVGIS unavailable, using formula fallback:', err);
      energy = estimateByFormula(kwp, lat);
    }

    AppState.result.annualKwh = energy.annualKwh;
    AppState.result.monthlyKwh = energy.monthlyKwh;
    AppState.result.hourlyKwh = hourlyShape(Math.max(...energy.monthlyKwh));

    AppState.result._source = energy.source;
    computeFinance(kwp, energy.annualKwh);
    renderResults(kwp, energy.source);
    goStep(4);
  } catch (err) {
    console.error('[Engine] calculation failed', err);
    showToast(t('calcFailed'));
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = originalText; }
  }
}

function computeFinance(kwp, annualKwh) {
  const { price, co2 } = AppState.country;
  const COST_PER_KWP = 1200;

  const systemCost = Math.round(kwp * COST_PER_KWP);
  const savings = Math.round(annualKwh * price);
  const payback = savings > 0 ? +(systemCost / savings).toFixed(1) : null;
  const co2Avoided = Math.round(annualKwh * co2);

  Object.assign(AppState.result, { systemCost, savings, payback, co2: co2Avoided });
}

/* ---------------------------------------------------------------------------
   8. RESULTS — metrics, charts, savings table, badge
   ------------------------------------------------------------------------- */
let hourlyChart = null, monthlyChart = null;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function renderResults(kwp, source) {
  const r = AppState.result;
  const { name } = AppState.country;

  document.getElementById('r-annual').textContent = r.annualKwh.toLocaleString();
  document.getElementById('r-savings').textContent = r.savings.toLocaleString();
  document.getElementById('r-co2').textContent = r.co2.toLocaleString();
  document.getElementById('r-panels').textContent = Math.ceil(kwp * 1000 / 400);
  document.getElementById('r-psh').textContent = (r.annualKwh / 365).toFixed(1);
  document.getElementById('r-payback').textContent = r.payback != null ? r.payback : '—';

  document.getElementById('resultSummaryLine').textContent =
    t('resultSummary')(AppState.roof.area, name, kwp, source);

  const badge = document.getElementById('viabilityBadge');
  if (r.payback != null && r.payback <= 8) {
    badge.textContent = t('badgeExcellent'); badge.className = 'badge badge-green';
  } else if (r.payback != null && r.payback <= 15) {
    badge.textContent = t('badgeGood'); badge.className = 'badge badge-amber';
  } else {
    badge.textContent = t('badgeMarginal'); badge.className = 'badge badge-red';
  }

  document.getElementById('finNote').textContent =
    t('finNote')(name, AppState.country.price.toFixed(2));

  renderSavingsTable();
  renderCharts();

  const advice = document.getElementById('orientAdvice');
  advice.innerHTML = t('orientAdviceTip')((AppState.country.co2 * 100).toFixed(0), name);
}

function renderSavingsTable() {
  const r = AppState.result;
  const periods = [1, 5, 10, 20];
  const body = document.getElementById('savingsBody');
  body.innerHTML = '';
  periods.forEach(y => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t('years')(y)}</td>
      <td>${Math.round(r.annualKwh * y).toLocaleString()}</td>
      <td>€${Math.round(r.savings * y).toLocaleString()}</td>
      <td>${Math.round(r.co2 * y).toLocaleString()}</td>
    `;
    body.appendChild(tr);
  });
}

function renderCharts() {
  const r = AppState.result;

  if (hourlyChart) hourlyChart.destroy();
  hourlyChart = new Chart(document.getElementById('hourlyChart'), {
    type: 'line',
    data: {
      labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
      datasets: [{
        label: 'kWh', data: r.hourlyKwh, borderColor: '#f59e0b',
        backgroundColor: 'rgba(245,158,11,0.15)', fill: true, tension: 0.35, pointRadius: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: { ticks: { maxTicksLimit: 8 } } }
    }
  });

  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [{ label: 'kWh', data: r.monthlyKwh, backgroundColor: '#f59e0b', borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

/* ---------------------------------------------------------------------------
   9. MODAL / HELP TEXT
   ------------------------------------------------------------------------- */
function showExplain(topic) {
  const entry = I18N[AppState.lang].explain[topic];
  if (!entry) return;
  document.getElementById('modalTitle').textContent = entry.title;
  document.getElementById('modalBody').innerHTML = entry.body;
  document.getElementById('explainModal').classList.add('open');
}

function closeModal() {
  document.getElementById('explainModal').classList.remove('open');
}

/* ---------------------------------------------------------------------------
   10. TOAST
   ------------------------------------------------------------------------- */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
}

/* ---------------------------------------------------------------------------
   11. INIT
   ------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  initMap();
  renderCityPills(COUNTRIES[AppState.country.code].cities);
  applyLanguage();
  console.log('[SolarRoof] ready');
});

/* ---------------------------------------------------------------------------
   12. GLOBAL EXPOSURE — every function referenced from an inline onclick="…"
   in index.html is bound onto window explicitly. Belt-and-braces: if this
   script ever gets loaded as a module, wrapped in an IIFE, or bundled, the
   inline handlers (which always run in global scope) still resolve.
   ------------------------------------------------------------------------- */
Object.assign(window, {
  setLang, onCountryChange, locateMe, setMapView, goStep, selectRoof,
  validateAndGoStep3, selectOrient, enableLiveCompass, runCalculation,
  showExplain, closeModal
});