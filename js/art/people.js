// Personagens da família como figuras ilustradas provisórias.
// Cores, cabelo e foto vêm de config.CHARACTERS / COUSINS (fáceis de trocar).
import { s } from '../engine/svg.js';
import { OUT, heart, starPath } from './items.js';

const st = (w = 3) => ({ stroke: OUT, 'stroke-width': w, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
let uid = 0;

function badge(type) {
  const g = s('g', { class: 'p-badge', transform: 'translate(0 -66)' }, s('circle', { r: 10, fill: '#FFF6E6', ...st(2) }));
  if (type === 'heart') g.append(s('g', { transform: 'translate(0 1) scale(0.55)' }, heart(1)));
  if (type === 'ball') g.append(s('circle', { r: 6, fill: '#FF7F6B', ...st(1.5) }), s('path', { d: 'M-6 0 Q0 4 6 0', stroke: '#fff', 'stroke-width': 2, fill: 'none' }));
  if (type === 'cone') g.append(s('path', { d: 'M0 -7 L6 6 L-6 6 Z', fill: '#FF9F6B', ...st(1.5) }));
  if (type === 'flower') g.append(...[0, 72, 144, 216, 288].map((a) => s('ellipse', { cx: 0, cy: -4, rx: 2.6, ry: 4, fill: '#FF9FB0', transform: `rotate(${a})` })), s('circle', { r: 2.4, fill: '#FFD45C' }));
  if (type === 'star') g.append(s('path', { d: starPath(0, 0, 7, 3), fill: '#FFD45C', ...st(1.2) }));
  if (type === 'leaf') g.append(s('ellipse', { rx: 4, ry: 7, fill: '#8CCB7E', ...st(1.5), transform: 'rotate(30)' }));
  return g;
}

function hairBack(style, color) {
  if (style === 'long') return s('path', { d: 'M-30 -126 Q-34 -86 -24 -80 L24 -80 Q34 -86 30 -126 Z', fill: color, ...st() });
  if (style === 'pigtails') return s('g', {}, s('circle', { cx: -32, cy: -116, r: 11, fill: color, ...st() }), s('circle', { cx: 32, cy: -116, r: 11, fill: color, ...st() }));
  if (style === 'bun') return s('circle', { cx: 0, cy: -150, r: 12, fill: color, ...st() });
  return null;
}

function hairFront(style, color) {
  if (style === 'none') return null;
  if (style === 'curly') {
    return s('g', {}, ...[[-20, -134], [-8, -142], [6, -143], [19, -135], [-25, -122], [25, -122]].map(([x, y]) => s('circle', { cx: x, cy: y, r: 10, fill: color, ...st(2.4) })));
  }
  const d = style === 'short'
    ? 'M-27 -118 Q-30 -146 0 -146 Q30 -146 27 -118 Q16 -132 0 -128 Q-14 -132 -27 -118 Z'
    : 'M-28 -114 Q-30 -148 0 -147 Q30 -148 28 -114 Q12 -136 -4 -126 Q-16 -134 -28 -114 Z';
  return s('path', { d, fill: color, ...st() });
}

export function createPerson(cfg) {
  const id = `p${++uid}`;
  const armL = s('g', { class: 'p-arm p-arm-l' }, s('rect', { x: -38, y: -90, width: 14, height: 44, rx: 7, fill: cfg.outfit, ...st() }), s('circle', { cx: -31, cy: -46, r: 7, fill: cfg.skin, ...st(2.4) }));
  const armR = s('g', { class: 'p-arm p-arm-r' }, s('rect', { x: 24, y: -90, width: 14, height: 44, rx: 7, fill: cfg.outfit, ...st() }), s('circle', { cx: 31, cy: -46, r: 7, fill: cfg.skin, ...st(2.4) }));
  let face;
  if (cfg.photo) {
    face = s('g', {},
      s('clipPath', { id: `${id}-clip` }, s('circle', { cx: 0, cy: -118, r: 26 })),
      s('image', { href: cfg.photo, x: -26, y: -144, width: 52, height: 52, 'clip-path': `url(#${id}-clip)`, preserveAspectRatio: 'xMidYMid slice' }),
      s('circle', { cx: 0, cy: -118, r: 26, fill: 'none', ...st() }));
  } else {
    face = s('g', {},
      hairBack(cfg.hairStyle, cfg.hair),
      s('circle', { cx: 0, cy: -118, r: 26, fill: cfg.skin, ...st() }),
      s('g', { class: 'p-eyes' },
        s('ellipse', { cx: -9, cy: -118, rx: 3.2, ry: 4, fill: OUT }),
        s('ellipse', { cx: 9, cy: -118, rx: 3.2, ry: 4, fill: OUT })),
      s('ellipse', { cx: -15, cy: -108, rx: 5, ry: 3, fill: '#FF9F8E', opacity: 0.5 }),
      s('ellipse', { cx: 15, cy: -108, rx: 5, ry: 3, fill: '#FF9F8E', opacity: 0.5 }),
      s('path', { class: 'p-mouth', d: 'M-7 -106 Q0 -99 7 -106', fill: 'none', ...st(2.6) }),
      hairFront(cfg.hairStyle, cfg.hair));
  }
  const body = s('g', { class: 'p-body' },
    s('rect', { x: -15, y: -46, width: 12, height: 46, rx: 6, fill: cfg.pants, ...st() }),
    s('rect', { x: 3, y: -46, width: 12, height: 46, rx: 6, fill: cfg.pants, ...st() }),
    s('ellipse', { cx: -9, cy: -2, rx: 10, ry: 5, fill: OUT }),
    s('ellipse', { cx: 9, cy: -2, rx: 10, ry: 5, fill: OUT }),
    armL,
    s('path', { d: 'M-26 -86 Q-26 -96 -14 -96 L14 -96 Q26 -96 26 -86 L30 -40 Q0 -32 -30 -40 Z', fill: cfg.outfit, ...st() }),
    badge(cfg.badge),
    armR,
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
