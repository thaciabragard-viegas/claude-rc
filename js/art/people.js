// Personagens da família como figuras ilustradas.
// Cores, cabelo, roupa e foto vêm de config.CHARACTERS / COUSINS (fáceis de trocar).
import { s } from '../engine/svg.js';
import { OUT, heart, starPath } from './items.js';

const st = (w = 3) => ({ stroke: OUT, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
let uid = 0;

function badge(type) {
  if (!type) return null;
  if (type === 'necklace') {
    return s('g', { class: 'p-badge' },
      s('path', { d: 'M-9 -95 Q0 -84 9 -95', fill: 'none', stroke: '#D9A441', 'stroke-width': 1.6 }),
      s('circle', { cx: 0, cy: -86, r: 2.2, fill: '#F2C14E', stroke: '#B8862E', 'stroke-width': 0.8 }));
  }
  const g = s('g', { class: 'p-badge', transform: 'translate(0 -66)' }, s('circle', { r: 10, fill: '#FFF6E6', ...st(2) }));
  if (type === 'heart') g.append(s('g', { transform: 'translate(0 1) scale(0.55)' }, heart(1)));
  if (type === 'ball') g.append(s('circle', { r: 6, fill: '#FF7F6B', ...st(1.5) }), s('path', { d: 'M-6 0 Q0 4 6 0', stroke: '#fff', 'stroke-width': 2, fill: 'none' }));
  if (type === 'cone') g.append(s('path', { d: 'M0 -7 L6 6 L-6 6 Z', fill: '#FF9F6B', ...st(1.5) }));
  if (type === 'flower') g.append(...[0, 72, 144, 216, 288].map((a) => s('ellipse', { cx: 0, cy: -4, rx: 2.6, ry: 4, fill: '#FF9FB0', transform: `rotate(${a})` })), s('circle', { r: 2.4, fill: '#FFD45C' }));
  if (type === 'star') g.append(s('path', { d: starPath(0, 0, 7, 3), fill: '#FFD45C', ...st(1.2) }));
  if (type === 'leaf') g.append(s('ellipse', { rx: 4, ry: 7, fill: '#8CCB7E', ...st(1.5), transform: 'rotate(30)' }));
  return g;
}

// cachinhos: vários círculos com um brilho mais claro
const curls = (pts, color, light) => s('g', {},
  ...pts.map(([x, y, r]) => s('circle', { cx: x, cy: y, r, fill: color, ...st(2.2) })),
  ...pts.filter((_, i) => i % 2 === 0).map(([x, y, r]) => s('path', { d: `M${x - r * 0.5} ${y - r * 0.1} Q${x} ${y - r * 0.7} ${x + r * 0.5} ${y - r * 0.1}`, fill: 'none', stroke: light, 'stroke-width': 1.8, 'stroke-linecap': 'round' })));

function hairBack(style, color, light) {
  if (style === 'long') return s('path', { d: 'M-30 -126 Q-34 -86 -24 -80 L24 -80 Q34 -86 30 -126 Z', fill: color, ...st() });
  if (style === 'longWavy') {
    return s('g', {},
      s('path', { d: 'M-30 -132 Q-40 -110 -34 -92 Q-42 -78 -34 -64 Q-38 -54 -28 -48 L28 -48 Q38 -54 34 -64 Q42 -78 34 -92 Q40 -110 30 -132 Z', fill: color, ...st() }),
      s('path', { d: 'M-30 -96 Q-36 -82 -30 -70 M30 -96 Q36 -82 30 -70', fill: 'none', stroke: light, 'stroke-width': 2.2, 'stroke-linecap': 'round' }));
  }
  if (style === 'curlyLong') {
    return curls([[-30, -132, 11], [-36, -116, 11], [-36, -100, 10], [-32, -86, 10], [30, -132, 11], [36, -116, 11], [36, -100, 10], [32, -86, 10], [-20, -146, 11], [0, -151, 12], [20, -146, 11]], color, light);
  }
  if (style === 'pigtails') return s('g', {}, s('circle', { cx: -32, cy: -116, r: 11, fill: color, ...st() }), s('circle', { cx: 32, cy: -116, r: 11, fill: color, ...st() }));
  if (style === 'bun') return s('circle', { cx: 0, cy: -150, r: 12, fill: color, ...st() });
  return null;
}

function hairFront(style, color, light) {
  if (style === 'none') return null;
  if (style === 'curly') {
    return s('g', {}, ...[[-20, -134], [-8, -142], [6, -143], [19, -135], [-25, -122], [25, -122]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 10, fill: color, ...st(2.4) })));
  }
  if (style === 'curlyLong') {
    return curls([[-22, -134, 9], [-9, -140, 9], [5, -141, 9], [18, -136, 9], [-27, -121, 7], [27, -121, 7]], color, light);
  }
  if (style === 'longWavy') {
    // risca no meio, mechas emoldurando o rosto e caindo na frente dos ombros
    return s('g', {},
      s('path', { d: 'M-27 -114 Q-30 -146 0 -146 Q30 -146 27 -114 Q16 -138 0 -138 Q-16 -138 -27 -114 Z', fill: color, ...st() }),
      s('path', { d: 'M-24 -128 Q-35 -112 -29 -100 Q-24 -92 -31 -84 Q-35 -76 -27 -70 Q-22 -80 -23 -90 Q-19 -100 -22 -112 Q-21 -122 -24 -128 Z', fill: color, ...st(2.2) }),
      s('path', { d: 'M24 -128 Q35 -112 29 -100 Q24 -92 31 -84 Q35 -76 27 -70 Q22 -80 23 -90 Q19 -100 22 -112 Q21 -122 24 -128 Z', fill: color, ...st(2.2) }),
      s('path', { d: 'M0 -146 L0 -138', stroke: light, 'stroke-width': 2 }));
  }
  const d = style === 'short'
    ? 'M-27 -118 Q-30 -146 0 -146 Q30 -146 27 -118 Q16 -132 0 -128 Q-14 -132 -27 -118 Z'
    : 'M-28 -114 Q-30 -148 0 -147 Q30 -148 28 -114 Q12 -136 -4 -126 Q-16 -134 -28 -114 Z';
  return s('path', { d, fill: color, ...st() });
}

function arm(side, cfg) {
  const x = side < 0 ? -38 : 24;
  const cx = side < 0 ? -31 : 31;
  const short = cfg.outfitStyle === 'tee' || cfg.outfitStyle === 'overalls';
  const kids = short
    ? [s('rect', { x: x + 1, y: -84, width: 12, height: 36, rx: 6, fill: cfg.skin, ...st() }),
      s('rect', { x: x - 1, y: -92, width: 16, height: 18, rx: 7, fill: cfg.shirt, ...st() })]
    : [s('rect', { x, y: -90, width: 14, height: 44, rx: 7, fill: cfg.outfit, ...st() })];
  return s('g', { class: `p-arm ${side < 0 ? 'p-arm-l' : 'p-arm-r'}` }, ...kids, s('circle', { cx, cy: -46, r: 7, fill: cfg.skin, ...st(2.4) }));
}

function legs(cfg) {
  const shoe = cfg.shoes || OUT;
  if (cfg.outfitStyle === 'overalls') {
    return s('g', {},
      s('rect', { x: -13, y: -40, width: 10, height: 38, rx: 5, fill: cfg.skin, ...st() }),
      s('rect', { x: 3, y: -40, width: 10, height: 38, rx: 5, fill: cfg.skin, ...st() }),
      s('rect', { x: -13, y: -12, width: 10, height: 7, fill: '#FFFFFF', stroke: OUT, 'stroke-width': 1.5 }),
      s('rect', { x: 3, y: -12, width: 10, height: 7, fill: '#FFFFFF', stroke: OUT, 'stroke-width': 1.5 }),
      s('path', { d: 'M-20 -48 L20 -48 L18 -30 L2 -30 L0 -36 L-2 -30 L-18 -30 Z', fill: cfg.outfit, ...st() }),
      s('ellipse', { cx: -9, cy: -2, rx: 10, ry: 5.5, fill: shoe, ...st(2) }),
      s('ellipse', { cx: 9, cy: -2, rx: 10, ry: 5.5, fill: shoe, ...st(2) }));
  }
  return s('g', {},
    s('rect', { x: -15, y: -46, width: 12, height: 46, rx: 6, fill: cfg.pants, ...st() }),
    s('rect', { x: 3, y: -46, width: 12, height: 46, rx: 6, fill: cfg.pants, ...st() }),
    s('ellipse', { cx: -9, cy: -2, rx: 10, ry: 5, fill: shoe, ...st(cfg.shoes ? 2 : 0) }),
    s('ellipse', { cx: 9, cy: -2, rx: 10, ry: 5, fill: shoe, ...st(cfg.shoes ? 2 : 0) }));
}

function torso(cfg) {
  const top = cfg.outfitStyle === 'shirt' || !cfg.outfitStyle ? cfg.outfit : cfg.shirt;
  const g = s('g', {},
    s('path', { d: 'M-26 -86 Q-26 -96 -14 -96 L14 -96 Q26 -96 26 -86 L30 -40 Q0 -32 -30 -40 Z', fill: top, ...st() }),
    s('path', { d: 'M-7 -96 Q0 -90 7 -96', fill: cfg.skin, stroke: OUT, 'stroke-width': 2 }));
  if (cfg.outfitStyle === 'overalls') {
    g.append(
      s('path', { d: 'M-17 -76 L17 -76 L22 -42 Q0 -36 -22 -42 Z', fill: cfg.outfit, ...st() }),
      s('rect', { x: -8, y: -70, width: 16, height: 11, rx: 3, fill: 'none', stroke: OUT, 'stroke-width': 1.6, opacity: 0.6 }),
      s('path', { d: 'M-20 -95 L-14 -76 M20 -95 L14 -76', stroke: OUT, 'stroke-width': 8, 'stroke-linecap': 'round' }),
      s('path', { d: 'M-20 -95 L-14 -76 M20 -95 L14 -76', stroke: cfg.outfit, 'stroke-width': 4.5, 'stroke-linecap': 'round' }),
      s('circle', { cx: -14, cy: -77, r: 2.4, fill: '#E8B74A', stroke: OUT, 'stroke-width': 1 }),
      s('circle', { cx: 14, cy: -77, r: 2.4, fill: '#E8B74A', stroke: OUT, 'stroke-width': 1 }));
  }
  return g;
}

export function createPerson(cfg) {
  const id = `p${++uid}`;
  const light = cfg.hairLight || cfg.hair;
  let face;
  if (cfg.photo) {
    face = s('g', {},
      s('clipPath', { id: `${id}-clip` }, s('circle', { cx: 0, cy: -118, r: 26 })),
      s('image', { href: cfg.photo, x: -26, y: -144, width: 52, height: 52, 'clip-path': `url(#${id}-clip)`, preserveAspectRatio: 'xMidYMid slice' }),
      s('circle', { cx: 0, cy: -118, r: 26, fill: 'none', ...st() }));
  } else {
    const mouth = cfg.smile === 'open'
      ? s('path', { class: 'p-mouth', d: 'M-9 -108 Q0 -96 9 -108 Z', fill: '#FFFFFF', ...st(2.4) })
      : s('path', { class: 'p-mouth', d: 'M-7 -106 Q0 -99 7 -106', fill: 'none', ...st(2.6) });
    face = s('g', {},
      s('circle', { cx: 0, cy: -118, r: 26, fill: cfg.skin, ...st() }),
      s('g', { class: 'p-eyes' },
        s('ellipse', { cx: -9, cy: -119, rx: 3.6, ry: 4.6, fill: '#3A2418' }),
        s('ellipse', { cx: 9, cy: -119, rx: 3.6, ry: 4.6, fill: '#3A2418' }),
        s('circle', { cx: -8, cy: -121, r: 1.3, fill: '#fff' }),
        s('circle', { cx: 10, cy: -121, r: 1.3, fill: '#fff' })),
      s('ellipse', { cx: -16, cy: -108, rx: 5, ry: 3, fill: '#FF9F8E', opacity: 0.5 }),
      s('ellipse', { cx: 16, cy: -108, rx: 5, ry: 3, fill: '#FF9F8E', opacity: 0.5 }),
      mouth,
      hairFront(cfg.hairStyle, cfg.hair, light));
  }
  const body = s('g', { class: 'p-body' },
    cfg.photo ? null : hairBack(cfg.hairStyle, cfg.hair, light),
    legs(cfg),
    arm(-1, cfg),
    torso(cfg),
    badge(cfg.badge),
    arm(1, cfg),
    face);
  const root = s('g', { class: 'person', 'data-name': cfg.short || cfg.name },
    s('ellipse', { cx: 0, cy: 0, rx: 34, ry: 7, fill: '#5B7A3A', opacity: 0.18 }),
    s('g', { class: 'p-wrap', transform: `scale(${cfg.size || 1})` }, body));
  return {
    el: root,
    wave(on = true) { root.classList.toggle('waving', on); },
    cheer(on = true) { root.classList.toggle('cheering', on); },
  };
}
