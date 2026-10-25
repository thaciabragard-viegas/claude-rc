// Utilitários compartilhados pelas cenas.
import { s, Actor } from '../engine/svg.js';
import { ease } from '../engine/clock.js';
import { createBela } from '../art/bela.js';
import { createPerson } from '../art/people.js';
import { CHARACTERS } from '../config.js';

export function makeBela(ctx, { x, y, scale = 1, flip = 1, parent = ctx.layer } = {}) {
  const b = createBela({ bandana: ctx.state.bandana });
  const a = new Actor(b.el, { x, y, scale, flip });
  a.bela = b;
  parent.append(a.el);
  return a;
}

export function makePerson(ctx, key, { x, y, scale = 1, flip = 1, parent = ctx.layer, cfg = null } = {}) {
  const p = createPerson(cfg || CHARACTERS[key]);
  const a = new Actor(p.el, { x, y, scale, flip });
  a.person = p;
  parent.append(a.el);
  return a;
}

// Corre até (x, y) virando para o lado certo; opcionalmente ajusta a escala pela profundidade.
export async function runTo(ctx, a, x, y, { speed = 360, depth = null, state = 'run', after = 'wait', hop = 0 } = {}) {
  const sx = a.x;
  const sy = a.y;
  const d = Math.hypot(x - sx, y - sy);
  if (d < 2) { if (after) a.bela?.setState(after); return; }
  if (Math.abs(x - sx) > 4) a.flip = x < sx ? -1 : 1;
  a.bela?.setState(state);
  let lastStep = 0;
  await ctx.scope.tween((d / speed) * 1000, (k) => {
    a.x = sx + (x - sx) * k;
    a.y = sy + (y - sy) * k - (hop ? 4 * hop * k * (1 - k) : 0);
    if (depth) a.scale = depth(a.y);
    a.apply();
    if (k - lastStep > 0.12) { lastStep = k; ctx.sfx('step'); }
  }, ease.linear);
  if (after) a.bela?.setState(after);
}

// Pequena reação temporária e volta ao estado anterior.
export async function react(ctx, a, state, ms = 900, back = 'wait') {
  a.bela.setState(state);
  await ctx.scope.wait(ms);
  if (a.bela.state === state) a.bela.setState(back);
}

// Mantém a ordem de desenho pela profundidade (quem está mais embaixo fica na frente).
export function depthSort(group) {
  const kids = [...group.children];
  const sorted = kids.slice().sort((p, q) => (Number(p.dataset.y) || 0) - (Number(q.dataset.y) || 0));
  if (sorted.some((k, i) => k !== kids[i])) sorted.forEach((k) => group.append(k));
}

export function hotspot({ x, y, r = 60, label, onTap, ctx, parent = ctx.layer, children = [], testid }) {
  const g = s('g', { class: 'hotspot', role: 'button', 'aria-label': label, 'data-testid': testid, transform: `translate(${x} ${y})` },
    ...children,
    s('circle', { r, fill: 'transparent' }));
  ctx.scope.on(g, 'pointerup', (e) => { e.stopPropagation(); onTap(e); });
  parent.append(g);
  return g;
}

export const wait = (ctx, ms) => ctx.scope.wait(ms);
