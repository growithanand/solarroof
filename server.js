/* =============================================================================
   SolarRoof · server.js — static file server + PVGIS CORS proxy
   Zero dependencies (uses only Node's built-in http/https/fs).

   Why this exists:
   PVGIS (re.jrc.ec.europa.eu) does not send an Access-Control-Allow-Origin
   header, so browsers refuse the request when the app calls it directly
   from client-side JS (CORS). Server-to-server requests aren't subject to
   CORS at all, so this tiny server fetches PVGIS on the app's behalf and
   returns the JSON to the browser from the same origin.

   Run:
     node server.js
   Then open:
     http://localhost:8000
   ========================================================================== */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const PVGIS_HOST = 're.jrc.ec.europa.eu';
const PVGIS_PATH = '/api/v5_2/PVcalc';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/pvgis') {
    return proxyPvgis(url.searchParams, res);
  }

  return serveStatic(url.pathname, res);
});

function proxyPvgis(params, res) {
  // Allow only the parameters PVcalc expects — don't blindly forward
  // arbitrary query strings to the upstream API.
  const allowed = ['lat', 'lon', 'peakpower', 'loss', 'angle', 'aspect', 'outputformat'];
  const qs = allowed
    .filter(k => params.has(k))
    .map(k => `${k}=${encodeURIComponent(params.get(k))}`)
    .join('&');

  const upstreamReq = https.get(
    { host: PVGIS_HOST, path: `${PVGIS_PATH}?${qs}`, timeout: 10000 },
    upstreamRes => {
      let body = '';
      upstreamRes.on('data', chunk => (body += chunk));
      upstreamRes.on('end', () => {
        res.writeHead(upstreamRes.statusCode, {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600', // same site+params rarely changes
        });
        res.end(body);
      });
    }
  );

  upstreamReq.on('timeout', () => upstreamReq.destroy(new Error('PVGIS timeout')));
  upstreamReq.on('error', err => {
    console.warn('[proxy] PVGIS request failed:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'PVGIS upstream request failed', detail: err.message }));
  });
}

function serveStatic(pathname, res) {
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(ROOT, decodeURIComponent(pathname));

  // Basic path-traversal guard.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`SolarRoof running at http://localhost:${PORT}`);
  console.log(`PVGIS proxy live at http://localhost:${PORT}/api/pvgis`);
});