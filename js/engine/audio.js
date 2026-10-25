// Áudio 100% gerado no próprio jogo (Web Audio): trilha e efeitos sintetizados aqui mesmo,
// sem arquivos de terceiros. Só começa depois do primeiro toque, como exigem os navegadores.
let ctx = null;
let master, musicBus, sfxBus;
let settings = { music: 0.45, sfx: 0.8, voice: 1, muted: false };
let ducked = false;
let musicOn = false;
let musicTimer = null;
let nextNoteTime = 0;
let step = 0;
let noiseBuf = null;

export function isReady() { return !!ctx && ctx.state === 'running'; }

export function unlock() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.connect(ctx.destination);
      musicBus = ctx.createGain();
      sfxBus = ctx.createGain();
      musicBus.connect(master);
      sfxBus.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      applySettings(settings);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) {
    console.warn('áudio indisponível', e);
  }
}

export function applySettings(next) {
  settings = { ...settings, ...next };
  if (!ctx) return;
  const t = ctx.currentTime;
  master.gain.setTargetAtTime(settings.muted ? 0 : 1, t, 0.05);
  sfxBus.gain.setTargetAtTime(settings.sfx, t, 0.05);
  musicBus.gain.setTargetAtTime(settings.music * 0.5 * (ducked ? 0.3 : 1), t, 0.15);
}

export function duck(on) {
  ducked = on;
  applySettings({});
}

// Pausa quando o navegador vai para segundo plano e retoma ao voltar.
document.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend();
  else ctx.resume();
});

// ---------- blocos básicos ----------
function env(g, t, a, peak, d) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}

function tone({ f = 440, to = null, dur = 0.15, type = 'sine', vol = 0.3, at = 0, attack = 0.01, bus = sfxBus, filter = null }) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  let node = o;
  if (filter) {
    const fl = ctx.createBiquadFilter();
    fl.type = filter.type || 'lowpass';
    fl.frequency.value = filter.f;
    fl.Q.value = filter.q || 1;
    o.connect(fl);
    node = fl;
  }
  node.connect(g);
  g.connect(bus);
  env(g, t, attack, vol, dur);
  o.start(t);
  o.stop(t + attack + dur + 0.05);
}

function noise({ dur = 0.2, f = 1000, to = null, q = 1, type = 'bandpass', vol = 0.2, at = 0, attack = 0.01 }) {
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const fl = ctx.createBiquadFilter();
  fl.type = type;
  fl.frequency.setValueAtTime(f, t);
  if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  fl.Q.value = q;
  const g = ctx.createGain();
  src.connect(fl);
  fl.connect(g);
  g.connect(sfxBus);
  env(g, t, attack, vol, dur);
  src.start(t, Math.random() * 0.5);
  src.stop(t + attack + dur + 0.05);
}

// ---------- efeitos ----------
const SFX = {
  tap: () => tone({ f: 520, to: 700, dur: 0.07, vol: 0.12 }),
  pop: () => tone({ f: 500, to: 950, dur: 0.09, vol: 0.22 }),
  whoosh: () => noise({ dur: 0.32, f: 500, to: 2400, q: 0.8, vol: 0.18 }),
  bounce: () => tone({ f: 320, to: 140, dur: 0.14, vol: 0.28, type: 'sine' }),
  step: () => noise({ dur: 0.05, f: 400, type: 'lowpass', vol: 0.12 }),
  bark: () => {
    // latido curtinho e suave
    tone({ f: 560, to: 300, dur: 0.11, type: 'sawtooth', vol: 0.12, filter: { f: 1100, q: 2 } });
    noise({ dur: 0.08, f: 900, q: 2, vol: 0.06 });
  },
  barks: () => { SFX.bark(); setTimeout(SFX.bark, 190); },
  sniff: () => { for (let i = 0; i < 3; i++) noise({ dur: 0.05, f: 2600, type: 'highpass', vol: 0.09, at: i * 0.11 }); },
  sneeze: () => {
    tone({ f: 620, to: 900, dur: 0.18, type: 'triangle', vol: 0.12, attack: 0.06 });
    noise({ dur: 0.16, f: 3000, type: 'highpass', vol: 0.22, at: 0.24 });
  },
  sparkle: () => [1046, 1318, 1568, 2093].forEach((f, i) => tone({ f, dur: 0.18, vol: 0.09, at: i * 0.06, type: 'sine' })),
  found: () => [523, 659, 784, 1046].forEach((f, i) => tone({ f, dur: 0.22, vol: 0.13, at: i * 0.09, type: 'triangle' })),
  rub: () => noise({ dur: 0.07, f: 1400, q: 1.5, vol: 0.06 }),
  bubble: () => tone({ f: 400 + Math.random() * 500, to: 900 + Math.random() * 400, dur: 0.05, vol: 0.08 }),
  water: () => noise({ dur: 0.12, f: 2200, q: 0.7, vol: 0.06 }),
  splash: () => { noise({ dur: 0.5, f: 1800, to: 600, q: 0.6, vol: 0.25 }); for (let i = 0; i < 5; i++) tone({ f: 600 + i * 120, to: 1200, dur: 0.05, vol: 0.06, at: 0.05 + i * 0.07 }); },
  wipe: () => tone({ f: 900, to: 1300, dur: 0.06, vol: 0.08 }),
  rustle: () => noise({ dur: 0.28, f: 3200, q: 0.7, vol: 0.12 }),
  creak: () => tone({ f: 190, to: 260, dur: 0.22, type: 'sawtooth', vol: 0.06, filter: { f: 700 } }),
  squeak: () => { tone({ f: 900, to: 1500, dur: 0.1, vol: 0.14 }); tone({ f: 1500, to: 900, dur: 0.1, vol: 0.12, at: 0.1 }); },
  shutter: () => { noise({ dur: 0.06, f: 3000, type: 'highpass', vol: 0.25 }); SFX.sparkle(); },
  flutter: () => { for (let i = 0; i < 4; i++) tone({ f: 1800 + i * 200, dur: 0.03, vol: 0.05, at: i * 0.07 }); },
  chirp: () => { tone({ f: 2400, to: 3200, dur: 0.06, vol: 0.06 }); tone({ f: 2600, to: 3400, dur: 0.06, vol: 0.06, at: 0.1 }); },
  boing: () => tone({ f: 200, to: 600, dur: 0.25, type: 'triangle', vol: 0.16 }),
  whee: () => tone({ f: 400, to: 1200, dur: 0.35, type: 'triangle', vol: 0.1 }),
  kiss: () => tone({ f: 1200, to: 600, dur: 0.06, vol: 0.08 }),
  giggle: () => [880, 990, 880, 1100].forEach((f, i) => tone({ f, dur: 0.06, vol: 0.06, at: i * 0.08, type: 'triangle' })),
  yawn: () => tone({ f: 420, to: 220, dur: 0.6, type: 'triangle', vol: 0.06, attack: 0.15 }),
};

let lastSfx = {};
export function sfx(name) {
  if (!ctx || settings.muted || !SFX[name]) return;
  const t = performance.now();
  if (lastSfx[name] && t - lastSfx[name] < 45) return; // evita empilhar o mesmo som
  lastSfx[name] = t;
  try { SFX[name](); } catch (e) { console.warn(e); }
}

// ---------- trilha: caixinha de música suave, gerada em tempo real ----------
const BPM = 84;
const CHORDS = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]; // C, Am, F, G
const MELODY = [
  72, null, 76, 74, 72, null, 67, null, 69, null, 72, null, 74, null, null, null,
  76, null, 79, 76, 74, null, 72, null, 74, 72, 69, null, 67, null, null, null,
  72, null, 74, 76, 79, null, 76, null, 77, null, 76, 74, 72, null, null, null,
  74, null, 72, 69, 67, null, 69, null, 72, null, 71, null, 72, null, null, null,
];
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

function scheduleMusic() {
  const spb = 60 / BPM / 2; // colcheias
  while (nextNoteTime < ctx.currentTime + 0.3) {
    const t = nextNoteTime - ctx.currentTime;
    const bar = Math.floor(step / 16) % 4;
    const n = MELODY[step % MELODY.length];
    if (n) {
      tone({ f: midi(n), dur: 0.5, vol: 0.09, at: t, type: 'sine', bus: musicBus });
      tone({ f: midi(n + 12), dur: 0.25, vol: 0.02, at: t, type: 'sine', bus: musicBus });
    }
    if (step % 16 === 0) CHORDS[bar].forEach((c) => tone({ f: midi(c - 12), dur: 1.8, vol: 0.035, at: t, type: 'triangle', attack: 0.2, bus: musicBus }));
    if (step % 4 === 2) tone({ f: midi(CHORDS[bar][(step / 4) % 3 | 0]), dur: 0.3, vol: 0.025, at: t, type: 'triangle', bus: musicBus });
    nextNoteTime += spb;
    step++;
  }
}

export function startMusic() {
  if (!ctx || musicOn) return;
  musicOn = true;
  nextNoteTime = ctx.currentTime + 0.1;
  musicTimer = setInterval(() => { if (ctx.state === 'running') scheduleMusic(); }, 100);
}

export function stopMusic() {
  musicOn = false;
  clearInterval(musicTimer);
}

export function getSettings() { return { ...settings }; }
