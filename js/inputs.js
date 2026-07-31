<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SolarRoof — European Solar Potential Calculator</title>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
        rel="stylesheet" />

    <link rel="stylesheet" href="css/styles.css" />
</head>

<body>

    <div class="toast" id="toast"></div>

    <div class="modal-overlay" id="explainModal">
        <div class="modal-box">
            <div class="modal-header">
                <span id="modalTitle" data-i18n="help">Help</span>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body" id="modalBody"></div>
        </div>
    </div>

    <header>
        <div class="header-inner">
            <div class="logo">
                <div class="logo-icon">☀️</div>
                SolarRoof
            </div>
            <div style="display:flex; align-items:center; gap:14px;">
                <div class="lang-toggle">
                    <button class="lang-btn active" id="langBtnEN" onclick="setLang('en')">EN</button>
                    <button class="lang-btn" id="langBtnDE" onclick="setLang('de')">DE</button>
                </div>
                <span class="header-badge" data-i18n="headerBadge">🇪🇺 European Solar Calculator</span>
            </div>
        </div>
    </header>

    <div class="page-wrap">

        <!-- ============ LEFT RAIL: intro, progress, map ============ -->
        <aside class="rail">
            <div class="rail-hero">
                <h1 data-i18n-html="heroTitle">Will solar panels <span>benefit your home?</span></h1>
                <p data-i18n="heroSub">Pin your roof, describe it, and we calculate annual production using real
                    European satellite data (PVGIS).</p>
            </div>

            <div class="progress-wrap">
                <div class="prog-step active" id="prog1" onclick="goStep(1)">
                    <div class="prog-num">1</div><span class="prog-label" data-i18n="stepLocation">Location</span>
                </div>
                <div class="prog-line" id="pline1"></div>
                <div class="prog-step" id="prog2" onclick="goStep(2)">
                    <div class="prog-num">2</div><span class="prog-label" data-i18n="stepRoof">Roof</span>
                </div>
                <div class="prog-line" id="pline2"></div>
                <div class="prog-step" id="prog3" onclick="goStep(3)">
                    <div class="prog-num">3</div><span class="prog-label" data-i18n="stepDirection">Direction</span>
                </div>
                <div class="prog-line" id="pline3"></div>
                <div class="prog-step" id="prog4" onclick="goStep(4)">
                    <div class="prog-num">4</div><span class="prog-label" data-i18n="stepResults">Results</span>
                </div>
            </div>

        </aside>

        <!-- ============ RIGHT COLUMN: everything scrolls here ============ -->
        <div class="content">

            <div class="step-panel active" id="step1">
                <div class="card">
                    <div class="card-title">📍 <span data-i18n="locTitle">Your location</span></div>
                    <div class="card-sub" data-i18n="locSub">Select your country, then click "Locate Me" or pick a
                        city. Drag the pin on the map to your exact roof position.</div>

                    <div class="loc-row">
                        <div class="country-select-wrap">
                            <select class="country-select" id="countrySelect" onchange="onCountryChange()">
                                <option value="" data-i18n="selectCountry">🌍 Select country</option>
                                <option value="DE" selected>🇩🇪 Germany</option>
                                <option value="AT">🇦🇹 Austria</option>
                                <option value="CH">🇨🇭 Switzerland</option>
                                <option value="FR">🇫🇷 France</option>
                                <option value="BE">🇧🇪 Belgium</option>
                                <option value="NL">🇳🇱 Netherlands</option>
                                <option value="LU">🇱🇺 Luxembourg</option>
                                <option value="PL">🇵🇱 Poland</option>
                                <option value="CZ">🇨🇿 Czech Republic</option>
                                <option value="SK">🇸🇰 Slovakia</option>
                                <option value="HU">🇭🇺 Hungary</option>
                                <option value="SI">🇸🇮 Slovenia</option>
                                <option value="HR">🇭🇷 Croatia</option>
                                <option value="IT">🇮🇹 Italy</option>
                                <option value="ES">🇪🇸 Spain</option>
                                <option value="PT">🇵🇹 Portugal</option>
                                <option value="SE">🇸🇪 Sweden</option>
                                <option value="NO">🇳🇴 Norway</option>
                                <option value="DK">🇩🇰 Denmark</option>
                                <option value="FI">🇫🇮 Finland</option>
                                <option value="EE">🇪🇪 Estonia</option>
                                <option value="LV">🇱🇻 Latvia</option>
                                <option value="LT">🇱🇹 Lithuania</option>
                                <option value="GB">🇬🇧 United Kingdom</option>
                                <option value="IE">🇮🇪 Ireland</option>
                                <option value="GR">🇬🇷 Greece</option>
                                <option value="BG">🇧🇬 Bulgaria</option>
                                <option value="RO">🇷🇴 Romania</option>
                                <option value="RS">🇷🇸 Serbia</option>
                                <option value="UA">🇺🇦 Ukraine</option>
                            </select>
                        </div>
                        <input class="addr-input" type="text" id="addrInput" data-i18n-placeholder="addrPlaceholder"
                            placeholder="Address (optional — or click map)" />
                        <button class="btn btn-primary" id="locateBtn" onclick="locateMe()">🎯 <span
                                data-i18n="locateMe">Locate Me</span></button>
                    </div>

                    <div class="info-box-red" id="countryMismatchBox"></div>
                    <div class="city-pills" id="cityPills"></div>

                    <div class="map-container">
                        <div id="map"></div>
                        <div class="map-controls">
                            <button class="map-toggle-btn street active-btn" id="btnStreet"
                                onclick="setMapView('street')">🗺 <span data-i18n="street">Street</span></button>
                            <button class="map-toggle-btn satellite" id="btnSat" onclick="setMapView('satellite')">🛰
                                <span data-i18n="satellite">Satellite</span></button>
                        </div>
                    </div>

                    <div class="loc-card" id="locCard" style="display:none">
                        <div class="loc-pin">📍</div>
                        <div>
                            <div class="loc-name" id="locName">—</div>
                            <div class="loc-coords" id="locCoords">—</div>
                        </div>
                    </div>

                    <div class="step-nav">
                        <div></div>
                        <button class="btn btn-primary" id="next1" onclick="goStep(2)" style="display:none"><span
                                data-i18n="nextRoof">Next: Roof Details →</span></button>
                    </div>
                </div>
            </div>

            <div class="step-panel" id="step2">
                <div class="card">
                    <div class="card-title">🏠 <span data-i18n="roofTitle">Roof configuration</span></div>
                    <div class="card-sub" data-i18n="roofSub">Select your roof type (German names shown) and enter
                        the measurements.</div>

                    <div style="font-size:13px; font-weight:600; margin-bottom:10px; color:var(--ink);"
                        data-i18n="selectRoofType">Select roof type</div>
                    <div class="roof-grid">
                        <div class="roof-card selected" onclick="selectRoof(this,'satteldach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <polygon points="2,36 32,6 62,36" fill="#cfd8dc" stroke="#78909c" stroke-width="1.3" />
                                <line x1="32" y1="6" x2="32" y2="36" stroke="#90a4ae" stroke-width="0.8"
                                    stroke-dasharray="2,2" />
                            </svg>
                            <div class="r-name" data-i18n="roofGable">Gable</div>
                            <div class="r-german">Satteldach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'walmdach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <polygon points="12,10 52,10 62,36 2,36" fill="#b0bec5" stroke="#78909c"
                                    stroke-width="1.2" />
                                <polygon points="12,10 52,10 32,4" fill="#cfd8dc" stroke="#78909c" stroke-width="1.2" />
                                <line x1="12" y1="10" x2="2" y2="36" stroke="#78909c" stroke-width="0.8" />
                                <line x1="52" y1="10" x2="62" y2="36" stroke="#78909c" stroke-width="0.8" />
                            </svg>
                            <div class="r-name" data-i18n="roofHip">Hip</div>
                            <div class="r-german">Walmdach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'pultdach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <polygon points="2,8 62,22 62,36 2,36" fill="#cfd8dc" stroke="#78909c"
                                    stroke-width="1.3" />
                                <line x1="2" y1="8" x2="62" y2="8" stroke="none" />
                            </svg>
                            <div class="r-name" data-i18n="roofMono">Mono-pitch</div>
                            <div class="r-german">Pultdach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'flachdach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="18" width="60" height="22" fill="#cfd8dc" stroke="#78909c"
                                    stroke-width="1.3" rx="1" />
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                            </svg>
                            <div class="r-name" data-i18n="roofFlat">Flat</div>
                            <div class="r-german">Flachdach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'mansarddach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <polygon points="2,36 16,24 48,24 62,36" fill="#b0bec5" stroke="#78909c"
                                    stroke-width="1.1" />
                                <rect x="16" y="10" width="32" height="14" fill="#cfd8dc" stroke="#78909c"
                                    stroke-width="1.2" rx="1" />
                                <line x1="16" y1="24" x2="16" y2="10" stroke="#78909c" stroke-width="0.8" />
                                <line x1="48" y1="24" x2="48" y2="10" stroke="#78909c" stroke-width="0.8" />
                            </svg>
                            <div class="r-name" data-i18n="roofMansard">Mansard</div>
                            <div class="r-german">Mansarddach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'krueppelwalm')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <polygon points="10,20 54,20 62,36 2,36" fill="#b0bec5" stroke="#78909c"
                                    stroke-width="1" />
                                <polygon points="10,20 54,20 32,6" fill="#cfd8dc" stroke="#78909c" stroke-width="1.2" />
                                <line x1="10" y1="20" x2="32" y2="6" stroke="#78909c" stroke-width="0.8" />
                                <line x1="54" y1="20" x2="32" y2="6" stroke="#78909c" stroke-width="0.8" />
                            </svg>
                            <div class="r-name" data-i18n="roofGambrelHip">Gambrel-Hip</div>
                            <div class="r-german">Krüppelwalm</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'zeltdach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <polygon points="32,4 62,36 2,36" fill="#cfd8dc" stroke="#78909c" stroke-width="1.2" />
                                <line x1="32" y1="4" x2="2" y2="36" stroke="#78909c" stroke-width="0.8" />
                                <line x1="32" y1="4" x2="62" y2="36" stroke="#78909c" stroke-width="0.8" />
                                <line x1="32" y1="4" x2="32" y2="36" stroke="#78909c" stroke-width="0.7"
                                    stroke-dasharray="2,2" />
                            </svg>
                            <div class="r-name" data-i18n="roofPyramid">Pyramid</div>
                            <div class="r-german">Zeltdach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'sheddach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="58" height="4" fill="#b0bec5" rx="1" />
                                <polyline points="2,36 2,16 20,28 20,16 38,28 38,16 56,28 56,36" fill="#cfd8dc"
                                    stroke="#78909c" stroke-width="1.2" stroke-linejoin="round" />
                                <line x1="2" y1="36" x2="56" y2="36" stroke="#78909c" stroke-width="1" />
                            </svg>
                            <div class="r-name" data-i18n="roofSawtooth">Sawtooth</div>
                            <div class="r-german">Sheddach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'lform')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <polygon points="2,38 2,28 18,12 34,28 34,38" fill="#cfd8dc" stroke="#78909c"
                                    stroke-width="1.1" />
                                <polygon points="30,28 30,20 44,8 60,20 60,28" fill="#b8c9d0" stroke="#78909c"
                                    stroke-width="1.1" />
                                <rect x="2" y="36" width="32" height="4" fill="#b0bec5" rx="1" />
                                <rect x="30" y="26" width="30" height="4" fill="#a8bac0" rx="1" />
                            </svg>
                            <div class="r-name" data-i18n="roofLShape">L-Shape</div>
                            <div class="r-german">L-Form Dach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'tonnendach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <path d="M 2,36 Q 16,6 32,4 Q 48,6 62,36" fill="#cfd8dc" stroke="#78909c"
                                    stroke-width="1.3" />
                                <line x1="32" y1="4" x2="32" y2="36" stroke="#90a4ae" stroke-width="0.7"
                                    stroke-dasharray="2,2" />
                            </svg>
                            <div class="r-name" data-i18n="roofBarrel">Barrel</div>
                            <div class="r-german">Tonnendach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'zwerchdach')">
                            <svg width="64" height="44" viewBox="0 0 64 44">
                                <polygon points="2,38 2,28 32,10 62,28 62,38" fill="#cfd8dc" stroke="#78909c"
                                    stroke-width="1.2" />
                                <rect x="2" y="36" width="60" height="4" fill="#b0bec5" rx="1" />
                                <polygon points="22,28 32,14 42,28" fill="#b8c9d0" stroke="#78909c" stroke-width="1" />
                                <rect x="22" y="26" width="20" height="10" fill="#a8c0c8" stroke="#78909c"
                                    stroke-width="0.8" />
                            </svg>
                            <div class="r-name" data-i18n="roofCrossGable">Cross-Gable</div>
                            <div class="r-german">Zwerchdach</div>
                        </div>
                        <div class="roof-card" onclick="selectRoof(this,'other')">
                            <svg width="64" height="44" viewBox="0 0 64 44"><text x="32" y="26" text-anchor="middle"
                                    font-size="10" fill="#90a4ae" font-family="sans-serif"
                                    font-weight="600">OTHER</text></svg>
                            <div class="r-name" data-i18n="roofOther">Other</div>
                            <div class="r-german">Sonstiges</div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label"><span data-i18n="roofArea">Roof area (m²)</span> <button
                                    class="help-btn" onclick="showExplain('area')">?</button></label>
                            <div class="form-hint" data-i18n="roofAreaHint">Usable surface of the solar-facing roof
                                face</div>
                            <input class="form-input" type="number" id="roofArea" min="10" max="500" value="80" />
                            <span class="form-error" id="areaErr" data-i18n="areaErr">Enter a value between 10 and
                                500 m²</span>
                        </div>
                        <div class="form-group">
                            <label class="form-label"><span data-i18n="pitchAngle">Pitch angle (°)</span> <button
                                    class="help-btn" onclick="showExplain('pitch')">?</button></label>
                            <div class="form-hint" data-i18n="pitchHint">0° = flat, 30–40° = typical home</div>
                            <input class="form-input" type="number" id="pitchAngle" min="0" max="70" value="32" />
                            <span class="form-error" id="pitchErr" data-i18n="pitchErr">Enter 0–70°</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom:18px;">
                        <label class="form-label"><span data-i18n="panelEfficiency">Panel efficiency:</span> <span
                                id="effVal" style="color:var(--cyan); font-weight:700">20%</span> <button
                                class="help-btn" onclick="showExplain('efficiency')">?</button></label>
                        <div class="form-hint" data-i18n="efficiencyHint">Standard panels 18–20% · Premium 21–23%
                        </div>
                        <input type="range" id="effSlider" min="15" max="24" value="20" step="1"
                            style="width:100%; margin-top:8px; accent-color:var(--cyan);"
                            oninput="document.getElementById('effVal').textContent=this.value+'%'" />
                    </div>

                    <div class="step-nav">
                        <button class="btn btn-secondary" onclick="goStep(1)"><span data-i18n="back">← Back</span></button>
                        <button class="btn btn-primary" onclick="validateAndGoStep3()"><span
                                data-i18n="nextOrientation">Next: Orientation →</span></button>
                    </div>
                </div>
            </div>

            <div class="step-panel" id="step3">
                <div class="card">
                    <div class="card-title">🧭 <span data-i18n="orientTitle">Roof orientation</span> <button
                            class="help-btn" onclick="showExplain('orientation')">?</button></div>
                    <div class="card-sub" data-i18n="orientSub">Which direction does the main sloping face of your
                        roof point toward?</div>

                    <div class="compass-wrap">
                        <div style="flex-shrink:0;">
                            <svg width="170" height="170" viewBox="0 0 170 170">
                                <circle cx="85" cy="85" r="78" fill="none" stroke="rgba(255,255,255,.12)"
                                    stroke-width="1.5" />
                                <circle cx="85" cy="85" r="58" fill="none" stroke="rgba(255,255,255,.06)"
                                    stroke-width="1" />
                                <text x="85" y="16" text-anchor="middle" font-size="14" font-weight="700" fill="#fb7185"
                                    font-family="DM Sans,sans-serif">N</text>
                                <text x="85" y="166" text-anchor="middle" font-size="14" font-weight="700" fill="#22d3ee"
                                    font-family="DM Sans,sans-serif">S★</text>
                                <text x="12" y="89" text-anchor="middle" font-size="13" fill="#8b93a7"
                                    font-family="DM Sans,sans-serif">W</text>
                                <text x="158" y="89" text-anchor="middle" font-size="13" fill="#8b93a7"
                                    font-family="DM Sans,sans-serif">E</text>
                                <g id="needle" transform="rotate(0, 85, 85)" style="transition: transform 0.4s ease;">
                                    <polygon points="85,22 81,85 89,85" fill="#8b5cf6" />
                                    <polygon points="85,148 81,85 89,85" fill="rgba(255,255,255,.25)" />
                                </g>
                                <circle cx="85" cy="85" r="5" fill="#eef1f7" />
                            </svg>
                        </div>

                        <div style="flex:1; min-width:200px;">
                            <div class="compass-controls" style="margin-bottom: 15px;">
                                <button class="btn btn-secondary" onclick="enableLiveCompass()"
                                    style="width: 100%; justify-content: center; margin-bottom: 4px;">🧭 <span
                                        data-i18n="liveCompass">Use Live Phone Compass</span></button>
                                <div id="compassStatus"
                                    style="font-size: 12px; color: var(--muted); text-align: center;"
                                    data-i18n="compassPlaceholder">Point phone towards your roof...</div>
                            </div>

                            <div class="orient-grid">
                                <button class="orient-btn" onclick="selectOrient(this,'S',180)">☀️ <span
                                        data-i18n="dirS">South</span></button>
                                <button class="orient-btn" onclick="selectOrient(this,'SW',225)">↙ <span
                                        data-i18n="dirSW">South-West</span></button>
                                <button class="orient-btn" onclick="selectOrient(this,'SE',135)">↘ <span
                                        data-i18n="dirSE">South-East</span></button>
                                <button class="orient-btn" onclick="selectOrient(this,'E',90)">→ <span
                                        data-i18n="dirE">East</span></button>
                                <button class="orient-btn" onclick="selectOrient(this,'W',270)">← <span
                                        data-i18n="dirW">West</span></button>
                                <button class="orient-btn" onclick="selectOrient(this,'N',0)">↑ <span
                                        data-i18n="dirN">North</span></button>
                                <button class="orient-btn" onclick="selectOrient(this,'NE',45)">↗ <span
                                        data-i18n="dirNE">North-East</span></button>
                                <button class="orient-btn" onclick="selectOrient(this,'NW',315)">↖ <span
                                        data-i18n="dirNW">North-West</span></button>
                            </div>
                            <div class="orient-tip" id="orientTip" data-i18n="orientTipDefault">Pick the direction
                                above to see its impact.</div>
                        </div>
                    </div>

                    <div class="step-nav">
                        <button class="btn btn-secondary" onclick="goStep(2)"><span data-i18n="back">← Back</span></button>
                        <button class="btn btn-primary" id="next3" onclick="runCalculation()" style="display:none">☀️
                            <span data-i18n="calcButton">Calculate with PVGIS →</span></button>
                    </div>
                </div>
            </div>

            <div class="step-panel" id="step4">
                <div class="card"
                    style="background:linear-gradient(135deg, rgba(139,92,246,.14), rgba(34,211,238,.10)); border-color:rgba(139,92,246,.3);">
                    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                        <div>
                            <div style="font-family:var(--font-display); font-size:20px; font-weight:700; margin-bottom:4px;">
                                ☀️ <span data-i18n="resultsHeading">Your PVGIS Solar Potential</span></div>
                            <div style="font-size:13px; color:var(--muted);" id="resultSummaryLine">—</div>
                        </div>
                        <div id="viabilityBadge" class="badge" style="font-size:13px; padding:8px 18px;">—</div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title" style="justify-content:space-between;">
                        <span>📊 <span data-i18n="energyOverview">Energy overview</span></span>
                        <button class="btn btn-ghost" style="font-size:12px;" onclick="showExplain('formula')">🔢
                            <span data-i18n="howCalculated">How was this calculated?</span></button>
                    </div>
                    <div class="results-grid">
                        <div class="metric">
                            <div class="metric-val green" id="r-annual">—</div>
                            <div class="metric-lbl" data-i18n="annualEnergy">Annual energy</div>
                            <div class="metric-unit" data-i18n="perYear">kWh per year</div>
                        </div>
                        <div class="metric">
                            <div class="metric-val green" id="r-savings">—</div>
                            <div class="metric-lbl" data-i18n="annualSavings">Annual savings</div>
                            <div class="metric-unit" data-i18n="eurPerYear">EUR per year</div>
                        </div>
                        <div class="metric">
                            <div class="metric-val amber" id="r-co2">—</div>
                            <div class="metric-lbl" data-i18n="co2Avoided">CO₂ avoided</div>
                            <div class="metric-unit" data-i18n="kgPerYear">kg per year</div>
                        </div>
                        <div class="metric">
                            <div class="metric-val" id="r-panels">—</div>
                            <div class="metric-lbl" data-i18n="panelsNeeded">Panels needed</div>
                            <div class="metric-unit" data-i18n="wattModules">× 400W modules</div>
                        </div>
                        <div class="metric">
                            <div class="metric-val" id="r-psh">—</div>
                            <div class="metric-lbl" data-i18n="dailyAverage">Daily Average</div>
                            <div class="metric-unit" data-i18n="kwhDay">kWh / day</div>
                        </div>
                        <div class="metric">
                            <div class="metric-val" id="r-payback">—</div>
                            <div class="metric-lbl" data-i18n="paybackPeriod">Payback period</div>
                            <div class="metric-unit" data-i18n="yearsEstimated">years (estimated)</div>
                        </div>
                    </div>

                    <div class="chart-section">
                        <div class="chart-label" data-i18n="hourlyLabel">Hourly output — typical summer day (kWh)
                        </div>
                        <div class="chart-box"><canvas id="hourlyChart"></canvas></div>
                    </div>

                    <div class="chart-section">
                        <div class="chart-label" data-i18n="monthlyLabel">Monthly production — full year (kWh)</div>
                        <div class="chart-box"><canvas id="monthlyChart"></canvas></div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-title">💰 <span data-i18n="financialBreakdown">Financial breakdown</span></div>
                    <div class="card-sub" id="finNote" data-i18n="finNoteDefault">Based on local electricity price
                        and ~€1,200/kWp installed system cost.</div>
                    <table class="savings-table">
                        <thead>
                            <tr>
                                <th data-i18n="period">Period</th>
                                <th data-i18n="energyKwh">Energy (kWh)</th>
                                <th data-i18n="savingsEur">Savings (€)</th>
                                <th data-i18n="co2SavedKg">CO₂ saved (kg)</th>
                            </tr>
                        </thead>
                        <tbody id="savingsBody"></tbody>
                    </table>
                </div>

                <div class="info-box" id="orientAdvice"></div>
                <div style="font-size:11px; color:var(--faint); text-align:center; padding:0 20px; margin-top:8px;"
                    data-i18n="disclaimer">
                    Estimates based on PVGIS historical satellite data. Actual output depends on shading, panel
                    brand, inverter efficiency, and local weather.
                </div>

                <div class="step-nav">
                    <button class="btn btn-secondary" onclick="goStep(3)"><span data-i18n="adjustInputs">← Adjust
                            inputs</span></button>
                    <button class="btn btn-primary" onclick="window.print()">🖨️ <span data-i18n="printSave">Print /
                            Save PDF</span></button>
                </div>
            </div>

        </div>

        <footer data-i18n="footerText">SolarRoof Calculator &nbsp;•&nbsp; Solar model based on PVGIS &nbsp;•&nbsp;
            Maps © OpenStreetMap &nbsp;•&nbsp; Satellite imagery © Esri</footer>
    </div>

    <script src="js/app.js"></script>
</body>

</html>