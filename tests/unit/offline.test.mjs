import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const walk = (d) => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

test('service worker guarda todos os arquivos do jogo', () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const listed = new Set([...sw.matchAll(/'([^']+\.(?:js|css|svg|png|html|webmanifest))'/g)].map((m) => m[1]));
  const files = [...walk('js'), ...walk('css'), ...walk('icons')].map((f) => f.split(path.sep).join('/'));
  for (const f of files) assert.ok(listed.has(f), `faltou no sw.js: ${f}`);
  for (const f of listed) assert.ok(fs.existsSync(path.join(root, f)), `não existe: ${f}`);
});
