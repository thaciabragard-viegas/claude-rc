// Servidor estático mínimo, sem dependências.
//   node scripts/serve.mjs            → só neste computador (http://localhost:8080)
//   node scripts/serve.mjs --lan      → também no celular, na MESMA rede Wi-Fi de casa
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const lan = args.includes('--lan');
const port = Number(args.find((a) => /^\d+$/.test(a)) || process.env.PORT || 8080);
const host = lan ? '0.0.0.0' : '127.0.0.1';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.md': 'text/markdown; charset=utf-8',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.normalize(path.join(root, p));
  if (!file.startsWith(root) || p.split('/').some((seg) => seg.startsWith('.') && seg.length > 1)) {
    res.writeHead(403).end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end('não encontrado'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log(`Mel & Bela: http://localhost:${port}`);
  if (lan) {
    for (const nets of Object.values(os.networkInterfaces())) {
      for (const n of nets || []) if (n.family === 'IPv4' && !n.internal) console.log(`No celular (mesma rede Wi-Fi): http://${n.address}:${port}`);
    }
    console.log('Para encerrar: Ctrl+C');
  }
});
