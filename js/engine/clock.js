// Relógio do jogo sobre requestAnimationFrame: pausa sozinho quando o navegador é minimizado
// e retoma de onde parou. `?speed=N` acelera tudo (usado nos testes automáticos).
const params = new URLSearchParams(location.search);
export const timeScale = Math.max(0.1, Number(params.get('speed')) || 1);

let now = 0;
let last = null;
const tasks = new Set();

function frame(ts) {
  if (last === null) last = ts;
  const dt = Math.min(ts - last, 50) * timeScale;
  last = ts;
  now += dt;
  for (const t of [...tasks]) {
    if (!tasks.has(t)) continue;
    try {
      if (t.fn(now, dt) === true) tasks.delete(t);
    } catch (e) {
      tasks.delete(t);
      console.error(e);
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
document.addEventListener('visibilitychange', () => { last = null; });

export const gameNow = () => now;

export const ease = {
  linear: (p) => p,
  inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2),
  out: (p) => 1 - (1 - p) ** 3,
  in: (p) => p * p * p,
  back: (p) => { const c = 1.6; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2; },
};

// Escopo de uma cena: tudo que ela agenda é cancelado quando a cena sai.
export class Scope {
  constructor() { this.alive = true; this.cleanups = []; this.own = new Set(); }
  _add(fn) {
    if (!this.alive) return () => {};
    const t = { fn };
    tasks.add(t);
    this.own.add(t);
    return () => { tasks.delete(t); this.own.delete(t); };
  }
  wait(ms) {
    return new Promise((res) => {
      const end = now + ms;
      this._add((t) => { if (t >= end) { res(); return true; } });
    });
  }
  tween(ms, fn, e = ease.inOut) {
    return new Promise((res) => {
      const start = now;
      fn(0);
      this._add((t) => {
        const p = Math.min(1, (t - start) / Math.max(1, ms));
        fn(e(p));
        if (p >= 1) { res(); return true; }
      });
    });
  }
  loop(fn) { return this._add((t, dt) => { fn(t, dt); }); }
  on(el, type, h, opts) {
    el.addEventListener(type, h, opts);
    this.cleanups.push(() => el.removeEventListener(type, h, opts));
  }
  defer(fn) { this.cleanups.push(fn); }
  dispose() {
    this.alive = false;
    for (const t of this.own) tasks.delete(t);
    this.own.clear();
    this.cleanups.splice(0).forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  }
}
