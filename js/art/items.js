// Objetos e elementos de cenário, todos vetoriais e originais. Contorno marrom suave em tudo
// para dar o aspecto de livro ilustrado.
import { s } from '../engine/svg.js';

export const OUT = '#6B4A3A';
export const PAL = {
  cream: '#FFF6E6', peach: '#FFD3B0', yellow: '#FFE58F', sky: '#BFE6FF', green: '#A8D88C',
  greenDark: '#7FBF6A', coral: '#FF7F6B', brown: '#6B4A3A', wood: '#D9A06B', woodDark: '#B87A4B',
};
const st = (w = 3) => ({ stroke: OUT, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });

// ---------- padrões (bandanas) ----------
function defs(near) {
  const svg = near?.ownerSVGElement || document.getElementById('stage');
  let d = svg && svg.querySelector('defs#game-defs');
  if (!d && svg) { d = s('defs', { id: 'game-defs' }); svg.prepend(d); }
  return d || document.getElementById('game-defs');
}

export function bandanaFill(b, near) {
  const id = `pat-${b.id}`;
  const d = defs(near) || document.getElementById('game-defs');
  if (!d) return b.color;
  if (!d.querySelector(`#${id}`)) {
    const p = s('pattern', { id, width: 12, height: 12, patternUnits: 'userSpaceOnUse' }, s('rect', { width: 12, height: 12, fill: b.color }));
    if (b.pattern === 'dots') p.append(s('circle', { cx: 6, cy: 6, r: 2.2, fill: b.dots }));
    if (b.pattern === 'stripes') p.append(s('rect', { x: 0, y: 0, width: 12, height: 4, fill: b.dots }));
    if (b.pattern === 'flowers') p.append(s('circle', { cx: 6, cy: 6, r: 2.6, fill: b.dots }), s('circle', { cx: 6, cy: 6, r: 1, fill: '#fff' }));
    if (b.pattern === 'stars') p.append(s('path', { d: 'M6 2 L7.2 5 L10 5.2 L7.8 7 L8.6 10 L6 8.3 L3.4 10 L4.2 7 L2 5.2 L4.8 5 Z', fill: b.dots }));
    if (b.pattern === 'rainbow') {
      p.setAttribute('height', 16);
      p.replaceChildren(...['#FF9FB0', '#FFD45C', '#A8D88C', '#7CC6F2'].map((c, i) => s('rect', { x: 0, y: i * 4, width: 12, height: 4, fill: c })));
    }
    d.append(p);
  }
  return `url(#${id})`;
}

export function bandanaSwatch(b) {
  const g = s('g', { class: 'swatch' },
    s('path', { d: 'M-34 -16 Q0 -6 34 -16 L0 28 Z', fill: b.color, ...st() }));
  queueMicrotask(() => g.firstChild.setAttribute('fill', bandanaFill(b, g)));
  return g;
}

// ---------- bolinhas ----------
export function ball(variant = { color: PAL.coral, mark: '#fff', pattern: 'stripes' }, r = 15) {
  const kids = [s('circle', { cx: 0, cy: 0, r, fill: variant.color, ...st(2.6) })];
  if (variant.pattern === 'stripes') kids.push(s('path', { d: `M${-r * 0.9} ${-r * 0.3} Q0 ${r * 0.25} ${r * 0.9} ${-r * 0.3}`, fill: 'none', stroke: variant.mark, 'stroke-width': r * 0.28 }),
    s('path', { d: `M${-r * 0.8} ${r * 0.45} Q0 ${r * 0.9} ${r * 0.8} ${r * 0.45}`, fill: 'none', stroke: variant.mark, 'stroke-width': r * 0.22 }));
  if (variant.pattern === 'dots') kids.push(...[[-0.4, -0.35], [0.4, -0.1], [-0.1, 0.45]].map(([x, y]) => s('circle', { cx: x * r, cy: y * r, r: r * 0.22, fill: variant.mark })));
  if (variant.pattern === 'star') kids.push(s('path', { d: starPath(0, 0, r * 0.62, r * 0.27), fill: variant.mark }));
  kids.push(s('circle', { cx: -r * 0.4, cy: -r * 0.45, r: r * 0.2, fill: '#fff', opacity: 0.6 }));
  return s('g', { class: 'ball' }, ...kids);
}

export function starPath(cx, cy, R, r, n = 5) {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 ? r : R;
    const a = (Math.PI / n) * i - Math.PI / 2;
    d += `${i ? 'L' : 'M'}${(cx + rad * Math.cos(a)).toFixed(1)} ${(cy + rad * Math.sin(a)).toFixed(1)} `;
  }
  return `${d}Z`;
}

export function sock() {
  return s('g', { class: 'sock' },
    s('path', { d: 'M-8 -22 L8 -22 L8 6 Q8 14 18 14 Q26 16 24 22 Q22 28 8 26 Q-8 24 -8 10 Z', fill: '#FFF6E6', ...st(2.6) }),
    s('path', { d: 'M-8 -14 L8 -14 M-8 -6 L8 -6', stroke: '#5FA8DC', 'stroke-width': 4 }),
    s('path', { d: 'M12 18 Q18 16 20 22', fill: 'none', stroke: PAL.coral, 'stroke-width': 4 }));
}

export function napkin(sz = 1) {
  return s('g', { class: 'napkin', transform: `scale(${sz})` },
    s('path', { d: 'M-24 -16 L24 -20 L20 18 L-20 20 Z', fill: '#FFF6E6', ...st() }),
    s('path', { d: 'M-12 -18 L-10 19 M2 -19 L4 19 M14 -19.5 L13 18.5 M-23 -4 L23 -6 M-21 8 L21 6', stroke: PAL.coral, 'stroke-width': 4, opacity: 0.75 }),
    s('path', { d: 'M-24 -16 L24 -20 L20 18 L-20 20 Z', fill: 'none', ...st() }));
}

export function ribbon(sz = 1) {
  return s('g', { class: 'ribbon', transform: `scale(${sz})` },
    s('path', { d: 'M-4 2 L-12 26 L-4 22 L0 28 L2 4 Z', fill: '#E85B7A', ...st(2.4) }),
    s('path', { d: 'M4 2 L14 24 L6 21 L2 28 L0 4 Z', fill: '#E85B7A', ...st(2.4) }),
    s('path', { d: 'M0 0 Q-26 -24 -28 -4 Q-26 12 0 0 Z', fill: '#FF8FA3', ...st(2.6) }),
    s('path', { d: 'M0 0 Q26 -24 28 -4 Q26 12 0 0 Z', fill: '#FF8FA3', ...st(2.6) }),
    s('ellipse', { cx: 0, cy: 0, rx: 7, ry: 8, fill: '#E85B7A', ...st(2.6) }));
}

export function plate(sz = 1) {
  return s('g', { class: 'plate', transform: `scale(${sz})` },
    s('ellipse', { cx: 0, cy: 0, rx: 26, ry: 14, fill: '#FFFFFF', ...st() }),
    s('ellipse', { cx: 0, cy: -1, rx: 16, ry: 8, fill: '#BFE6FF', ...st(2) }),
    s('path', { d: 'M-20 -4 Q-14 -10 -6 -11', fill: 'none', stroke: '#FF9FB0', 'stroke-width': 3 }));
}

export function huntItem(id, sz = 1) {
  if (id === 'guardanapo') return napkin(sz);
  if (id === 'laco') return ribbon(sz);
  if (id === 'pratinho') return plate(sz);
  return s('g', { transform: `scale(${sz})` }, ball({ color: '#FFD45C', mark: '#FF9F6B', pattern: 'star' }, 16));
}

// ---------- cesta ----------
export function basket({ w = 90, open = true, withLid = false } = {}) {
  const h = w * 0.55;
  const kids = [
    s('path', { d: `M${-w * 0.42} ${-h} Q0 ${-h - w * 0.75} ${w * 0.42} ${-h}`, fill: 'none', stroke: OUT, 'stroke-width': 9, 'stroke-linecap': 'round' }),
    s('path', { d: `M${-w * 0.42} ${-h} Q0 ${-h - w * 0.75} ${w * 0.42} ${-h}`, fill: 'none', stroke: PAL.wood, 'stroke-width': 5, 'stroke-linecap': 'round' }),
    s('g', { class: 'basket-inside' }),
    s('path', { d: `M${-w / 2} ${-h} L${w / 2} ${-h} L${w * 0.4} 0 L${-w * 0.4} 0 Z`, fill: PAL.wood, ...st() }),
  ];
  for (let i = 1; i < 4; i++) kids.push(s('path', { d: `M${-w / 2 + i * 2} ${-h + (i * h) / 4} L${w / 2 - i * 2} ${-h + (i * h) / 4}`, stroke: PAL.woodDark, 'stroke-width': 2.5 }));
  for (let i = -2; i <= 2; i++) kids.push(s('path', { d: `M${i * w * 0.17} ${-h} L${i * w * 0.14} 0`, stroke: PAL.woodDark, 'stroke-width': 2 }));
  kids.push(s('path', { d: `M${-w / 2 - 3} ${-h} L${w / 2 + 3} ${-h}`, stroke: OUT, 'stroke-width': 8, 'stroke-linecap': 'round' }),
    s('path', { d: `M${-w / 2 - 3} ${-h} L${w / 2 + 3} ${-h}`, stroke: PAL.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  if (withLid) kids.push(s('path', { d: `M${-w / 2} ${-h - 2} Q0 ${-h - 20} ${w / 2} ${-h - 2} Z`, fill: '#F2C48D', ...st() }));
  if (!open) kids.push(s('path', { d: `M${-w * 0.35} ${-h - 4} L${w * 0.35} ${-h - 4}`, stroke: PAL.coral, 'stroke-width': 6, 'stroke-linecap': 'round' }));
  return s('g', { class: 'basket' }, ...kids);
}

// ---------- banho ----------
export function sponge() {
  return s('g', { class: 'tool sponge' },
    s('rect', { x: -30, y: -20, width: 60, height: 40, rx: 14, fill: '#FFE16B', ...st() }),
    s('rect', { x: -30, y: 6, width: 60, height: 14, rx: 7, fill: '#8CCB7E', ...st() }),
    ...[[-14, -8], [6, -12], [16, 0], [-4, 0]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 3, fill: '#E8B740' })));
}

export function shower() {
  return s('g', { class: 'tool shower' },
    s('path', { d: 'M30 34 Q40 10 10 -4', fill: 'none', stroke: OUT, 'stroke-width': 13, 'stroke-linecap': 'round' }),
    s('path', { d: 'M30 34 Q40 10 10 -4', fill: 'none', stroke: '#BFE6FF', 'stroke-width': 8, 'stroke-linecap': 'round' }),
    s('ellipse', { cx: -2, cy: -10, rx: 24, ry: 16, fill: '#7CC6F2', ...st(), transform: 'rotate(20 -2 -10)' }),
    s('ellipse', { cx: -8, cy: -2, rx: 18, ry: 8, fill: '#E6F6FF', ...st(2), transform: 'rotate(20 -8 -2)' }),
    ...[[-14, -2], [-6, 2], [2, 4]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 1.8, fill: '#5FA8DC' })));
}

export function towel(color = '#FF9FB0') {
  return s('g', { class: 'tool towel' },
    s('path', { d: 'M-34 -22 Q0 -30 34 -22 L30 24 Q0 30 -30 24 Z', fill: color, ...st() }),
    s('path', { d: 'M-31 12 Q0 18 31 12', fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.8 }),
    s('path', { d: 'M-32 0 Q0 6 32 0', fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0.6 }));
}

export function tub(w = 300) {
  return s('g', { class: 'tub' },
    s('ellipse', { cx: 0, cy: 6, rx: w / 2 + 10, ry: 22, fill: '#5B7A3A', opacity: 0.15 }),
    s('path', { d: `M${-w / 2} -70 L${w / 2} -70 Q${w / 2 - 6} 0 ${w / 2 - 40} 0 L${-w / 2 + 40} 0 Q${-w / 2 + 6} 0 ${-w / 2} -70 Z`, fill: '#7CC6F2', ...st() }),
    s('path', { d: `M${-w / 2 + 14} -48 L${w / 2 - 14} -48`, stroke: '#fff', 'stroke-width': 5, opacity: 0.5, 'stroke-linecap': 'round' }),
    s('rect', { x: -w / 2 - 8, y: -82, width: w + 16, height: 18, rx: 9, fill: '#A9DCF7', ...st() }),
    ...[-0.32, 0, 0.32].map((k) => s('circle', { cx: k * w, cy: -28, r: 7, fill: '#FFE58F', ...st(2) })));
}

export function bubble(r = 8) {
  return s('g', { class: 'bubble' },
    s('circle', { cx: 0, cy: 0, r, fill: '#FFFFFF', 'fill-opacity': 0.85, stroke: '#BFE6FF', 'stroke-width': 2 }),
    s('circle', { cx: -r * 0.35, cy: -r * 0.35, r: r * 0.25, fill: '#fff' }));
}

export function droplet(r = 6) {
  return s('path', { class: 'drop', d: `M0 ${-r * 1.6} Q${r} ${-r * 0.2} ${r} ${r * 0.3} A${r} ${r} 0 0 1 ${-r} ${r * 0.3} Q${-r} ${-r * 0.2} 0 ${-r * 1.6} Z`, fill: '#7CC6F2', stroke: '#4A9BD1', 'stroke-width': 1.5 });
}

export function mudBlob(r = 12) {
  return s('g', { class: 'mud-blob' },
    s('circle', { cx: 0, cy: 0, r, fill: '#9A6B43' }),
    s('circle', { cx: r * 0.8, cy: -r * 0.4, r: r * 0.45, fill: '#9A6B43' }),
    s('circle', { cx: -r * 0.7, cy: r * 0.5, r: r * 0.4, fill: '#9A6B43' }),
    s('circle', { cx: -r * 0.2, cy: -r * 0.3, r: r * 0.25, fill: '#B88358' }));
}

// ---------- jardim ----------
export function flower(color = PAL.coral, sz = 1) {
  const petals = [0, 72, 144, 216, 288].map((a) => s('ellipse', { cx: 0, cy: -7, rx: 5, ry: 7, fill: color, stroke: OUT, 'stroke-width': 1.6, transform: `rotate(${a})` }));
  return s('g', { class: 'flower', transform: `scale(${sz})` },
    s('path', { d: 'M0 0 L0 22', stroke: '#6BAF5A', 'stroke-width': 3 }),
    s('g', {}, ...petals, s('circle', { r: 4, fill: '#FFE58F', stroke: OUT, 'stroke-width': 1.6 })));
}

export function bush(w = 120, color = PAL.greenDark) {
  const h = w * 0.6;
  return s('g', { class: 'bush' },
    s('path', { d: `M${-w / 2} 0 Q${-w / 2 - 6} ${-h * 0.6} ${-w * 0.25} ${-h * 0.75} Q${-w * 0.15} ${-h * 1.15} ${w * 0.12} ${-h * 0.95} Q${w * 0.42} ${-h * 1.05} ${w * 0.4} ${-h * 0.6} Q${w / 2 + 8} ${-h * 0.4} ${w / 2} 0 Z`, fill: color, ...st() }),
    s('path', { d: `M${-w * 0.2} ${-h * 0.55} Q${-w * 0.1} ${-h * 0.7} 0 ${-h * 0.55}`, fill: 'none', stroke: '#5E9E4C', 'stroke-width': 2.5 }),
    s('path', { d: `M${w * 0.1} ${-h * 0.3} Q${w * 0.2} ${-h * 0.45} ${w * 0.3} ${-h * 0.3}`, fill: 'none', stroke: '#5E9E4C', 'stroke-width': 2.5 }));
}

export function tree(sz = 1) {
  return s('g', { class: 'tree', transform: `scale(${sz})` },
    s('path', { d: 'M-10 0 L-8 -60 Q0 -66 8 -60 L10 0 Z', fill: PAL.woodDark, ...st() }),
    s('circle', { cx: -26, cy: -78, r: 30, fill: '#8CCB7E', ...st() }),
    s('circle', { cx: 24, cy: -80, r: 30, fill: '#8CCB7E', ...st() }),
    s('circle', { cx: 0, cy: -106, r: 34, fill: '#9AD48A', ...st() }),
    s('circle', { cx: -10, cy: -112, r: 6, fill: '#FF9FB0', opacity: 0.9 }),
    s('circle', { cx: 16, cy: -90, r: 5, fill: '#FF9FB0', opacity: 0.9 }));
}

export function cloud(sz = 1) {
  return s('g', { class: 'cloud', transform: `scale(${sz})` },
    s('path', { d: 'M-40 10 Q-48 -10 -26 -12 Q-20 -32 2 -26 Q16 -40 30 -22 Q50 -22 44 10 Z', fill: '#FFFFFF', stroke: '#DDEFF9', 'stroke-width': 3 }));
}

export function sun() {
  return s('g', { class: 'sun' },
    s('circle', { r: 30, fill: '#FFE58F', opacity: 0.45 }),
    s('circle', { r: 22, fill: '#FFE16B', stroke: '#F5C842', 'stroke-width': 3 }));
}

export function pawprint(sz = 1, color = '#9A6B43') {
  return s('g', { class: 'paw', transform: `scale(${sz})` },
    s('ellipse', { cx: 0, cy: 4, rx: 7, ry: 6, fill: color }),
    s('circle', { cx: -7, cy: -5, r: 3, fill: color }),
    s('circle', { cx: -2, cy: -9, r: 3, fill: color }),
    s('circle', { cx: 4, cy: -9, r: 3, fill: color }),
    s('circle', { cx: 8.5, cy: -4, r: 3, fill: color }));
}

export function heart(sz = 1, color = '#FF7F8F') {
  return s('path', { class: 'heart', d: 'M0 6 C-14 -4 -10 -16 0 -9 C10 -16 14 -4 0 6 Z', fill: color, stroke: OUT, 'stroke-width': 1.8, transform: `scale(${sz})` });
}

export function sparkle(sz = 1, color = '#FFE16B') {
  return s('path', { class: 'sparkle', d: 'M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12 Z', fill: color, stroke: '#F5B842', 'stroke-width': 1.2, transform: `scale(${sz})` });
}

export function house() {
  return s('g', { class: 'house' },
    s('rect', { x: -78, y: -110, width: 156, height: 110, rx: 8, fill: '#FFE9CC', ...st() }),
    s('path', { d: 'M-92 -104 L0 -170 L92 -104 Z', fill: '#FF9F8E', ...st() }),
    s('rect', { x: -18, y: -64, width: 36, height: 64, rx: 14, fill: PAL.wood, ...st() }),
    s('circle', { cx: 10, cy: -32, r: 3, fill: OUT }),
    // janela da cozinha (cenário)
    s('rect', { x: -66, y: -86, width: 38, height: 34, rx: 6, fill: '#BFE6FF', ...st() }),
    s('path', { d: 'M-66 -86 Q-56 -68 -66 -52 M-28 -86 Q-38 -68 -28 -52', fill: '#FFF6E6', stroke: OUT, 'stroke-width': 2 }),
    s('path', { d: 'M-54 -60 Q-47 -70 -40 -60 Z', fill: '#FFD45C', stroke: OUT, 'stroke-width': 1.5 }),
    s('rect', { x: 30, y: -86, width: 38, height: 34, rx: 6, fill: '#BFE6FF', ...st() }),
    s('path', { d: 'M49 -86 L49 -52 M30 -69 L68 -69', stroke: OUT, 'stroke-width': 2.5 }),
    s('rect', { x: 40, y: -160, width: 18, height: 34, fill: '#E58B7B', ...st() }));
}

export function gate() {
  const bars = [];
  for (let i = 0; i < 6; i++) bars.push(s('rect', { x: -48 + i * 17, y: -64, width: 9, height: 64, rx: 4, fill: '#FFF6E6', ...st(2.4) }));
  return s('g', { class: 'gate' },
    s('rect', { x: -60, y: -86, width: 14, height: 86, rx: 5, fill: PAL.wood, ...st() }),
    s('rect', { x: 46, y: -86, width: 14, height: 86, rx: 5, fill: PAL.wood, ...st() }),
    s('path', { d: 'M-52 -70 Q0 -96 52 -70', fill: 'none', stroke: OUT, 'stroke-width': 9 }),
    s('path', { d: 'M-52 -70 Q0 -96 52 -70', fill: 'none', stroke: PAL.wood, 'stroke-width': 5 }),
    ...bars,
    s('path', { d: 'M-46 -30 L46 -30', stroke: OUT, 'stroke-width': 3 }));
}

export function fence(w = 120) {
  const kids = [];
  for (let x = -w / 2; x <= w / 2; x += 22) kids.push(s('path', { d: `M${x - 7} 0 L${x - 7} -40 L${x} -48 L${x + 7} -40 L${x + 7} 0 Z`, fill: '#FFF6E6', ...st(2.4) }));
  return s('g', { class: 'fence' },
    s('rect', { x: -w / 2 - 8, y: -32, width: w + 16, height: 9, rx: 4, fill: PAL.wood, ...st(2) }),
    ...kids,
    s('rect', { x: -w / 2 - 8, y: -16, width: w + 16, height: 9, rx: 4, fill: PAL.wood, ...st(2) }));
}

export function box({ open = false } = {}) {
  return s('g', { class: `cbox ${open ? 'open' : ''}` },
    s('path', { d: 'M-46 -70 L46 -70 L46 0 L-46 0 Z', fill: '#E0A866', ...st() }),
    s('path', { d: 'M-46 -70 L46 -70 L36 -84 L-36 -84 Z', fill: '#C98F4E', ...st() }),
    s('g', { class: 'flap-l' }, s('path', { d: 'M-46 -70 L-30 -96 L6 -88 L0 -70 Z', fill: '#EDB777', ...st() })),
    s('g', { class: 'flap-r' }, s('path', { d: 'M46 -70 L30 -96 L-6 -88 L0 -70 Z', fill: '#EDB777', ...st() })),
    s('path', { d: 'M-16 -40 L16 -40', stroke: '#B87A4B', 'stroke-width': 4, 'stroke-linecap': 'round' }));
}

export function bench() {
  return s('g', { class: 'bench' },
    s('rect', { x: -60, y: -62, width: 120, height: 14, rx: 6, fill: PAL.wood, ...st() }),
    s('rect', { x: -60, y: -44, width: 120, height: 14, rx: 6, fill: PAL.wood, ...st() }),
    s('rect', { x: -48, y: -30, width: 10, height: 30, rx: 4, fill: PAL.woodDark, ...st(2.5) }),
    s('rect', { x: 38, y: -30, width: 10, height: 30, rx: 4, fill: PAL.woodDark, ...st(2.5) }),
    s('rect', { x: -48, y: -92, width: 8, height: 32, rx: 4, fill: PAL.woodDark, ...st(2.5) }),
    s('rect', { x: 40, y: -92, width: 8, height: 32, rx: 4, fill: PAL.woodDark, ...st(2.5) }),
    s('rect', { x: -56, y: -96, width: 112, height: 14, rx: 6, fill: PAL.wood, ...st() }));
}

export function wickerBin() {
  return s('g', { class: 'cesto' }, basket({ w: 100 }));
}

export function doghouse() {
  return s('g', { class: 'doghouse' },
    s('rect', { x: -48, y: -66, width: 96, height: 66, rx: 6, fill: '#FFD3B0', ...st() }),
    s('path', { d: 'M-58 -60 L0 -110 L58 -60 Z', fill: PAL.coral, ...st() }),
    s('path', { d: 'M-22 0 L-22 -30 Q0 -56 22 -30 L22 0 Z', fill: '#7A5236', ...st() }),
    s('ellipse', { cx: 0, cy: -76, rx: 16, ry: 9, fill: '#FFF6E6', ...st(2) }),
    s('path', { d: 'M-6 -78 Q0 -72 6 -78', fill: 'none', stroke: PAL.coral, 'stroke-width': 2.5 }));
}

export function wateringCan() {
  return s('g', { class: 'regador' },
    s('path', { d: 'M28 -40 L62 -70 L68 -64 L36 -30 Z', fill: '#7CC6F2', ...st() }),
    s('rect', { x: -36, y: -56, width: 70, height: 56, rx: 14, fill: '#7CC6F2', ...st() }),
    s('path', { d: 'M-26 -56 Q0 -90 26 -56', fill: 'none', stroke: OUT, 'stroke-width': 9 }),
    s('path', { d: 'M-26 -56 Q0 -90 26 -56', fill: 'none', stroke: '#5FA8DC', 'stroke-width': 5 }),
    s('path', { d: 'M-14 -30 Q0 -20 14 -30', fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.6 }));
}

export function hidingSpot(type) {
  if (type === 'caixa') return box();
  if (type === 'banco') return bench();
  if (type === 'cesto') return wickerBin();
  if (type === 'casinha') return doghouse();
  if (type === 'arbusto') return bush(130);
  return wateringCan();
}

// ---------- bichinhos (surpresas simpáticas) ----------
export function butterfly() {
  return s('g', { class: 'butterfly' },
    s('g', { class: 'wing' }, s('ellipse', { cx: -10, cy: -6, rx: 11, ry: 9, fill: '#FF9FB0', ...st(2) }), s('ellipse', { cx: -8, cy: 8, rx: 8, ry: 6, fill: '#FFD45C', ...st(2) })),
    s('g', { class: 'wing wing-r' }, s('ellipse', { cx: 10, cy: -6, rx: 11, ry: 9, fill: '#FF9FB0', ...st(2) }), s('ellipse', { cx: 8, cy: 8, rx: 8, ry: 6, fill: '#FFD45C', ...st(2) })),
    s('ellipse', { cx: 0, cy: 0, rx: 3, ry: 12, fill: OUT }));
}

export function ladybug() {
  return s('g', { class: 'ladybug' },
    s('circle', { cx: 0, cy: -12, r: 6, fill: OUT }),
    s('ellipse', { cx: 0, cy: 0, rx: 13, ry: 12, fill: '#FF5E5E', ...st(2) }),
    s('path', { d: 'M0 -12 L0 12', stroke: OUT, 'stroke-width': 2 }),
    ...[[-6, -2], [6, -3], [-5, 6], [5, 6]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 2.5, fill: OUT })));
}

export function bird() {
  return s('g', { class: 'bird' },
    s('ellipse', { cx: 0, cy: 0, rx: 16, ry: 13, fill: '#7CC6F2', ...st(2.4) }),
    s('path', { d: 'M-4 -2 Q-14 -14 -18 2 Z', fill: '#5FA8DC', ...st(2) }),
    s('circle', { cx: 8, cy: -4, r: 2.4, fill: OUT }),
    s('path', { d: 'M14 -2 L22 0 L14 3 Z', fill: '#FFC94D', ...st(1.6) }));
}

export function leaves() {
  return s('g', { class: 'leaves' },
    ...[[-10, 0, -30], [8, -6, 20], [0, 8, 70]].map(([x, y, r]) => s('ellipse', { cx: x, cy: y, rx: 10, ry: 5, fill: '#8CCB7E', ...st(1.8), transform: `rotate(${r} ${x} ${y})` })));
}

export function snail() {
  return s('g', { class: 'snail' },
    s('path', { d: 'M-18 6 L18 6 Q24 6 22 -2 L20 -10', fill: '#FFD3B0', ...st(2.2) }),
    s('circle', { cx: -2, cy: -6, r: 12, fill: '#E0A866', ...st(2.2) }),
    s('path', { d: 'M-2 -6 m-6 0 a6 6 0 1 1 6 6', fill: 'none', stroke: OUT, 'stroke-width': 2 }),
    s('circle', { cx: 20, cy: -12, r: 2, fill: OUT }));
}

export function critter(type) {
  return { butterfly, ladybug, bird, leaves, snail }[type]?.() || butterfly();
}

// ---------- cantinho ----------
export function cushion(color = '#FF9FB0') {
  return s('g', { class: 'cushion' },
    s('ellipse', { cx: 0, cy: 0, rx: 120, ry: 34, fill: color, ...st() }),
    s('ellipse', { cx: 0, cy: -8, rx: 96, ry: 20, fill: '#FFC2CC', opacity: 0.8 }),
    ...[-60, 0, 60].map((x) => s('circle', { cx: x, cy: -6, r: 3, fill: OUT, opacity: 0.4 })));
}

export function blanket(w = 220, h = 60) {
  const kids = [s('path', { d: `M${-w / 2} 0 L${-w / 2 + 30} ${-h} L${w / 2 - 30} ${-h} L${w / 2} 0 Z`, fill: '#FFF6E6', ...st() })];
  for (let i = 1; i < 6; i++) {
    const x0 = -w / 2 + (w * i) / 6;
    const x1 = -w / 2 + 30 + ((w - 60) * i) / 6;
    kids.push(s('path', { d: `M${x0} 0 L${x1} ${-h}`, stroke: PAL.coral, 'stroke-width': 7, opacity: 0.55 }));
  }
  for (let j = 1; j < 3; j++) {
    const y = (-h * j) / 3;
    const inset = (30 * j) / 3;
    kids.push(s('path', { d: `M${-w / 2 + inset} ${y} L${w / 2 - inset} ${y}`, stroke: PAL.coral, 'stroke-width': 7, opacity: 0.55 }));
  }
  kids.push(s('path', { d: `M${-w / 2} 0 L${-w / 2 + 30} ${-h} L${w / 2 - 30} ${-h} L${w / 2} 0 Z`, fill: 'none', ...st() }));
  return s('g', { class: 'blanket' }, ...kids);
}

export function duckToy() {
  return s('g', { class: 'duck' },
    s('path', { d: 'M-22 0 Q-28 -22 -6 -20 Q-4 -40 12 -38 Q26 -36 22 -20 Q30 -6 18 2 Z', fill: '#FFE16B', ...st() }),
    s('path', { d: 'M22 -30 L34 -27 L22 -24 Z', fill: '#FF9F6B', ...st(2) }),
    s('circle', { cx: 14, cy: -30, r: 2.6, fill: OUT }),
    s('path', { d: 'M-12 -10 Q0 -2 8 -12', fill: 'none', stroke: '#E8B740', 'stroke-width': 3 }));
}

export function hoop(r = 60) {
  const kids = [s('ellipse', { cx: 0, cy: 0, rx: r, ry: r * 0.45, fill: '#FFF6E6', 'fill-opacity': 0.35, stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-dasharray': '8 8' })];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 * i) / 10;
    const colors = [PAL.coral, '#FFD45C', '#FF9FB0', '#B79CE8'];
    kids.push(s('g', { transform: `translate(${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r * 0.45).toFixed(1)}) scale(0.9)` },
      ...[0, 72, 144, 216, 288].map((d) => s('ellipse', { cx: 0, cy: -5, rx: 4, ry: 5, fill: colors[i % 4], transform: `rotate(${d})` })),
      s('circle', { r: 3, fill: '#FFE58F' })));
  }
  return s('g', { class: 'hoop' }, ...kids);
}

export function ramp() {
  return s('g', { class: 'ramp' },
    s('ellipse', { cx: 0, cy: 4, rx: 70, ry: 10, fill: '#5B7A3A', opacity: 0.15 }),
    s('path', { d: 'M-64 0 L56 0 L56 -44 Z', fill: '#FFD3B0', ...st() }),
    s('path', { d: 'M-40 -6 L44 -6 M-12 -14 L44 -14 M14 -24 L44 -24 M36 -34 L48 -34', stroke: PAL.coral, 'stroke-width': 4, opacity: 0.6 }),
    s('path', { d: 'M-64 0 L56 -44', stroke: OUT, 'stroke-width': 3 }));
}

export function hand() {
  return s('g', { class: 'hint-hand' },
    s('circle', { class: 'hand-ring', cx: 0, cy: 0, r: 18, fill: 'none', stroke: '#fff', 'stroke-width': 4 }),
    s('path', { d: 'M-6 2 L-6 -28 Q-6 -36 1 -36 Q8 -36 8 -28 L8 -8 Q16 -12 22 -6 Q30 -8 34 0 Q42 0 42 10 L40 32 Q36 44 22 44 L4 44 Q-6 44 -12 34 L-24 14 Q-28 6 -20 2 Q-14 0 -6 10 Z', fill: '#FFF6E6', ...st(3), transform: 'translate(-2 6)' }));
}

export function bookIcon() {
  return s('g', { class: 'book' },
    s('path', { d: 'M-50 -30 Q-25 -40 0 -30 Q25 -40 50 -30 L50 20 Q25 10 0 20 Q-25 10 -50 20 Z', fill: '#FFF6E6', ...st() }),
    s('path', { d: 'M0 -30 L0 20', stroke: OUT, 'stroke-width': 3 }),
    s('rect', { x: -40, y: -24, width: 30, height: 26, rx: 4, fill: '#BFE6FF', ...st(2) }),
    s('path', { d: 'M12 -18 L40 -20 M12 -8 L40 -10 M12 2 L32 1', stroke: '#E0C7A8', 'stroke-width': 3 }),
    s('g', { transform: 'translate(-25 -10) scale(0.5)' }, heart(1.6)));
}

export function cake() {
  return s('g', { class: 'cake' },
    s('ellipse', { cx: 0, cy: 0, rx: 34, ry: 9, fill: '#fff', ...st(2.4) }),
    s('path', { d: 'M-26 -2 L-26 -30 Q0 -38 26 -30 L26 -2 Q0 6 -26 -2 Z', fill: '#FFD3B0', ...st(2.6) }),
    s('path', { d: 'M-26 -26 Q-18 -16 -10 -26 Q-2 -16 6 -26 Q14 -16 26 -26', fill: 'none', stroke: '#fff', 'stroke-width': 5 }),
    s('ellipse', { cx: 0, cy: -31, rx: 26, ry: 6, fill: '#FF9FB0', ...st(2.4) }),
    ...[[-12, -36], [2, -38], [14, -35]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 4, fill: '#E85B7A', ...st(1.6) })));
}

export function fruitBowl() {
  return s('g', { class: 'fruit' },
    s('circle', { cx: -10, cy: -14, r: 9, fill: '#FF7F6B', ...st(2) }),
    s('circle', { cx: 8, cy: -16, r: 9, fill: '#FFD45C', ...st(2) }),
    s('circle', { cx: 0, cy: -24, r: 8, fill: '#A8D88C', ...st(2) }),
    s('path', { d: 'M-24 -10 Q0 14 24 -10 Z', fill: '#BFE6FF', ...st(2.4) }));
}

export function dogBowl() {
  return s('g', { class: 'dogbowl' },
    s('path', { d: 'M-24 -14 L24 -14 L18 0 L-18 0 Z', fill: PAL.coral, ...st(2.4) }),
    s('ellipse', { cx: 0, cy: -14, rx: 24, ry: 6, fill: '#B87A4B', ...st(2) }),
    ...[-10, 0, 10].map((x) => s('circle', { cx: x, cy: -16, r: 3, fill: '#8A5A33' })));
}
