/**
 * server.js — CivicGuide local dev server
 *
 * Serves static files and proxies POST /api/gemini/* to the
 * Gemini REST API, injecting the API key server-side so it is
 * never exposed in client JS.
 *
 * Usage:
 *   node server.js
 *
 * Requires GEMINI_API_KEY in .env (or the environment).
 */

import http  from 'node:http';
import https from 'node:https';
import fs    from 'node:fs';
import path  from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env ─────────────────────────────────────────────

function loadEnv() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([^#\s=][^=]*?)\s*=\s*(.*?)\s*$/);
      if (m) process.env[m[1]] ??= m[2];
    }
  } catch { /* .env optional if key is already in environment */ }
}

loadEnv();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY is not set. Add it to .env or the environment.');
  process.exit(1);
}

const PORT          = process.env.PORT ?? 3000;
const GEMINI_HOST   = 'generativelanguage.googleapis.com';
const GEMINI_MODEL  = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

// ── MIME types ────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// ── Server ────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ── Gemini proxy: POST /.netlify/functions/gemini ────
  if (req.method === 'POST' && url.pathname === '/.netlify/functions/gemini') {
    const action = url.searchParams.get('action');

    let body = Buffer.alloc(0);
    req.on('data', chunk => { body = Buffer.concat([body, Buffer.from(chunk)]); });
    req.on('end', () => {

      // ── File upload ──────────────────────────────────
      if (action === 'upload') {
        const { mimeType, data: base64Data } = JSON.parse(body.toString());
        const fileBytes = Buffer.from(base64Data, 'base64');
        const boundary  = 'gc_boundary';
        const metadata  = JSON.stringify({ file: { mimeType } });
        const multipart = Buffer.concat([
          Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
          fileBytes,
          Buffer.from(`\r\n--${boundary}--`),
        ]);
        const options = {
          hostname: GEMINI_HOST,
          path:     `/upload/v1beta/files?uploadType=multipart&key=${API_KEY}`,
          method:   'POST',
          headers:  {
            'Content-Type':   `multipart/related; boundary=${boundary}`,
            'Content-Length': multipart.length,
          },
        };
        const upstream = https.request(options, upRes => {
          let data = '';
          upRes.on('data', c => { data += c; });
          upRes.on('end', () => {
            const json = JSON.parse(data);
            res.writeHead(upRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ fileUri: json.file?.uri, mimeType: json.file?.mimeType }));
          });
        });
        upstream.on('error', err => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        });
        upstream.write(multipart);
        upstream.end();
        return;
      }

      // ── Generate content ─────────────────────────────
      const model      = url.searchParams.get('model') || GEMINI_MODEL;
      const geminiPath = `/v1beta/models/${model}:generateContent`;
      const options = {
        hostname: GEMINI_HOST,
        path:     `${geminiPath}?key=${API_KEY}`,
        method:   'POST',
        headers:  { 'Content-Type': 'application/json', 'Content-Length': body.length },
      };
      const upstream = https.request(options, upRes => {
        res.writeHead(upRes.statusCode, { 'Content-Type': 'application/json' });
        upRes.pipe(res);
      });
      upstream.on('error', err => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      upstream.write(body);
      upstream.end();
    });
    return;
  }

  // ── Static files ──────────────────────────────────────
  const pathname  = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath  = path.join(__dirname, pathname);

  // Prevent path traversal outside project root
  if (!filePath.startsWith(__dirname + path.sep) && filePath !== __dirname) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Block dotfiles (.env, .gitignore, etc.) and server source
  const segments = pathname.split('/').filter(Boolean);
  if (segments.some(s => s.startsWith('.')) || pathname === '/server.js') {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const mime = MIME[path.extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`CivicGuide → http://localhost:${PORT}`);
});
