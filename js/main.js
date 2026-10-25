// Ponto de entrada: monta a interface fixa (HUD), o roteador de cenas e o estado salvo.
import { GAME, CHARACTERS, COUSINS, BELA } from './config.js';
import { Scope, gameNow, ease } from './engine/clock.js';
import { s, h, toSvgPoint, toScreenPoint } from './engine/svg.js';
import * as audio from './engine/audio.js';
import * as voice from './engine/voice.js';
import { load, save } from './logic/state.js';
import { makeRng } from './logic/rng.js';
import { ICONS } from './art/icons.js';
import { hand, sparkle, heart } from './art/items.js';
import { SCENES } from './scenes/index.js';
import { preloadSprites } from './engine/sprites.js';

const app = document.getElementById('app');
const svg = document.getElementById('stage');
const uiLayer = document.getElementById('ui');
const hud = document.getElementById('hud');
const fade = document.getElementById('fade');
const fxLayer = document.getElementById('fx');
voice.setCaptionElement(document.getElementById('caption'));

let state = load(localStorage, GAME.storageKey);
const rng = makeRng();
let current = null; // { name, scope, params }
let transitioning = false;
let pendingGo = null; // navegação pedida durante uma transição: executa logo depois (não se perde)
let hintFn = null;
let lastInteraction = 0;

function applyAudioSettings() {
  audio.applySettings(state.settings);
  voice.setCaptions(state.settings.captions !== false);
  updateSoundIcon();
}

export function getState() { return state; }
export function setState(next) {
  state = next;
  save(localStorage, GAME.storageKey, state);
  applyAudioSettings();
  return state;
}

// ---------- HUD ----------
function hudButton(cls, icon, label, onTap) {
  const b = h('button', { class: `btn ${cls}`, type: 'button', 'aria-label': label, title: label });
  b.innerHTML = ICONS[icon];
  b.addEventListener('click', (e) => { e.stopPropagation(); onTap(b); });
  return b;
}

const homeBtn = hudButton('home', 'home', 'Voltar ao jardim', () => {
  audio.sfx('tap');
  if (current?.name !== 'map') go('map', { from: current?.name });
});
const repeatBtn = hudButton('repeat', 'repeat', 'Repetir a instrução', () => { audio.sfx('tap'); voice.repeatInstruction(); });
const helpBtn = hudButton('help', 'help', 'Mostrar ajuda', () => {
  audio.sfx('tap');
  if (hintFn) hintFn(); else voice.repeatInstruction();
});
const soundBtn = hudButton('sound', 'soundOn', 'Ligar ou desligar o som', () => {
  setState({ ...state, settings: { ...state.settings, muted: !state.settings.muted } });
  if (state.settings.muted) voice.stopVoice();
  else audio.sfx('tap');
});
function updateSoundIcon() {
  soundBtn.innerHTML = ICONS[state.settings.muted ? 'soundOff' : 'soundOn'];
  soundBtn.setAttribute('aria-pressed', String(!!state.settings.muted));
}
hud.append(h('div', { class: 'hud-left' }, homeBtn), h('div', { class: 'hud-right' }, repeatBtn, helpBtn, soundBtn));

// Toques em qualquer lugar contam como interação (para as dicas por pausa).
app.addEventListener('pointerdown', () => { lastInteraction = gameNow(); }, true);

// Bloqueia gestos do navegador que atrapalham (duplo toque, menu de contexto) sem impedir o zoom da página.
svg.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('gesturestart', (e) => { if (e.target.closest?.('#stage')) e.preventDefault(); });

// ---------- contexto passado às cenas ----------
function makeCtx(scope, layer, ui, name) {
  const ctx = {
    scope,
    svg,
    layer,
    ui,
    fx: fxLayer,
    rng,
    name,
    unlockAudio,
    get state() { return state; },
    setState,
    go,
    sfx: audio.sfx,
    say: (id, vars, opts) => voice.say(id, vars, opts),
    instruct: (id, vars, opts) => voice.say(id, vars, { ...opts, asInstruction: true }),
    // espera a fala terminar, sem nunca travar (tempo máximo proporcional ao texto)
    async sayWait(id, vars, opts) {
      const p = voice.say(id, vars, opts);
      const est = voice.estimateMs(voice.lineText(id, vars));
      await Promise.race([p, scope.wait(est * 1.25)]);
      await scope.wait(150);
    },
    setHint(fn) { hintFn = fn; },
    toSvg: (evt) => toSvgPoint(svg, evt),
    toScreen: (x, y) => toScreenPoint(svg, x, y),
    // chama fn quando a criança fica um tempo sem tocar (sem tratar a pausa como erro)
    idle(ms, fn) {
      let armedAt = gameNow();
      scope.loop((t) => {
        const since = Math.max(lastInteraction, armedAt);
        if (t - since > ms) { armedAt = t + ms; fn(); }
      });
    },
    button({ icon, label, cls = '', onTap, parent = ui, style }) {
      const b = h('button', { class: `btn ${cls}`, type: 'button', 'aria-label': label, title: label, style });
      b.innerHTML = ICONS[icon];
      let used = false;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (used || !scope.alive) return;
        b.classList.add('pressed');
        audio.sfx('pop');
        used = onTap(b) === 'keep' ? false : true; // por padrão, um botão só age uma vez (evita duplicar)
        if (!used) b.classList.remove('pressed');
      });
      parent.append(b);
      return b;
    },
    // mão demonstrando um toque ou um arraste
    async showHand(from, to = null, { times = 2 } = {}) {
      const handEl = hand();
      const g = s('g', { style: 'opacity:0' }, handEl);
      layer.append(g);
      const place = (p) => g.setAttribute('transform', `translate(${p.x} ${p.y})`);
      for (let i = 0; i < times && scope.alive; i++) {
        place(from);
        await scope.tween(250, (k) => { g.style.opacity = k; });
        if (to) {
          await scope.wait(150);
          await scope.tween(900, (k) => place({ x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k }));
        } else {
          handEl.classList.add('tapping');
          await scope.tween(200, (k) => place({ x: from.x, y: from.y + 6 * k }));
          await scope.tween(200, (k) => place({ x: from.x, y: from.y + 6 - 6 * k }));
          await scope.wait(500);
        }
        await scope.tween(250, (k) => { g.style.opacity = 1 - k; });
      }
      g.remove();
    },
    burst(x, y, { kind = 'sparkle', n = 7, parent = layer, spread = 60 } = {}) {
      for (let i = 0; i < n; i++) {
        const el = kind === 'heart' ? heart(0.9 + rng.next() * 0.5) : sparkle(0.7 + rng.next() * 0.7, ['#FFE16B', '#FF9FB0', '#7CC6F2', '#A8D88C'][i % 4]);
        const g = s('g', {}, el);
        parent.append(g);
        const a = (Math.PI * 2 * i) / n + rng.next() * 0.5;
        const d = spread * (0.6 + rng.next() * 0.6);
        scope.tween(700 + rng.next() * 300, (k) => {
          g.setAttribute('transform', `translate(${x + Math.cos(a) * d * k} ${y + Math.sin(a) * d * k - 20 * k}) rotate(${k * 90})`);
          g.style.opacity = 1 - k * k;
        }, ease.out).then(() => g.remove());
      }
    },
    floatHeart(x, y, parent = layer) {
      const g = s('g', {}, heart(1 + rng.next() * 0.4));
      parent.append(g);
      const dx = (rng.next() - 0.5) * 40;
      scope.tween(1100, (k) => {
        g.setAttribute('transform', `translate(${x + dx * k} ${y - 70 * k}) scale(${0.6 + k * 0.6})`);
        g.style.opacity = 1 - k;
      }, ease.out).then(() => g.remove());
    },
  };
  return ctx;
}

// ---------- roteador ----------
export async function go(name, params = {}) {
  const scene = SCENES[name];
  if (!scene) return;
  if (transitioning) { pendingGo = [name, params]; return; }
  transitioning = true;
  voice.stopVoice();
  voice.clearInstruction();
  fade.classList.add('on');
  await new Promise((r) => setTimeout(r, current ? 280 : 0));
  if (current) current.scope.dispose();
  hintFn = null;
  svg.querySelectorAll(':scope > :not(defs)').forEach((n) => n.remove());
  uiLayer.replaceChildren();
  fxLayer.replaceChildren();
  const scope = new Scope();
  const layer = s('g', { class: `scene scene-${name}` });
  svg.append(layer);
  current = { name, scope, params };
  app.dataset.scene = name;
  hud.classList.toggle('hidden-home', name === 'map' || name === 'title' || name === 'bye');
  hud.classList.toggle('no-hud', !!scene.noHud);
  if (scene.bg) app.style.background = scene.bg;
  const ctx = makeCtx(scope, layer, uiLayer, name);
  try {
    scene.enter(ctx, params);
  } catch (e) {
    console.error(e);
  }
  lastInteraction = gameNow();
  requestAnimationFrame(() => fade.classList.remove('on'));
  setTimeout(() => {
    transitioning = false;
    if (pendingGo) { const [n, p] = pendingGo; pendingGo = null; go(n, p); }
  }, 300);
  debug.scene = name;
}

// ---------- ganchos para testes automáticos e depuração (sem efeito na partida) ----------
const debug = {
  scene: null,
  get state() { return state; },
  toScreen: (x, y) => toScreenPoint(svg, x, y),
  get transitioning() { return transitioning; },
};
window.__game = debug;

// Retomar depois de trocar de aplicativo: salva ao sair e redesenha ao voltar.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    save(localStorage, GAME.storageKey, state);
    voice.stopVoice();
  }
});
window.addEventListener('pagehide', () => save(localStorage, GAME.storageKey, state));

// Primeiro toque: libera o áudio no celular.
export function unlockAudio() {
  audio.unlock();
  voice.unlockVoice();
  applyAudioSettings();
  audio.startMusic();
}

applyAudioSettings();
const spriteUrls = [...Object.values(CHARACTERS), ...COUSINS].map((c) => c.sprite).concat(BELA.sprite ? [BELA.sprite.stand, BELA.sprite.belly] : []);
preloadSprites(spriteUrls).then(() => go('title'));

// PWA: registra o service worker para funcionar sem internet depois do primeiro acesso.
if ('serviceWorker' in navigator && location.protocol !== 'file:' && !new URLSearchParams(location.search).has('nosw')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
