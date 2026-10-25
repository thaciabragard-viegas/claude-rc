// Service worker: guarda os arquivos do jogo para funcionar sem internet depois do primeiro acesso.
// Estratégia: rede primeiro (sempre a versão mais nova quando online); sem rede, usa a cópia guardada.
// Ao adicionar arquivos ao jogo, inclua-os em ASSETS (um teste automático confere a lista).
const CACHE = 'melbela-v2';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/styles.css',
  'css/bela.css',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'js/main.js',
  'js/config.js',
  'js/engine/clock.js',
  'js/engine/svg.js',
  'js/engine/audio.js',
  'js/engine/voice.js',
  'js/logic/state.js',
  'js/logic/rng.js',
  'js/logic/hunt.js',
  'js/logic/fetch.js',
  'js/logic/coverage.js',
  'js/art/bela.js',
  'js/art/items.js',
  'js/art/people.js',
  'js/art/icons.js',
  'js/art/scenery.js',
  'js/art/memory.js',
  'js/scenes/index.js',
  'js/scenes/common.js',
  'js/scenes/title.js',
  'js/scenes/intro.js',
  'js/scenes/map.js',
  'js/scenes/fetch.js',
  'js/scenes/bath.js',
  'js/scenes/hunt.js',
  'js/scenes/corner.js',
  'js/scenes/picnic.js',
  'js/scenes/album.js',
  'js/scenes/done.js',
  'js/scenes/bye.js',
  'js/scenes/adult.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))),
  );
});
