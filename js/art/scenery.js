// Cenários de fundo. Desenhados além do viewBox para preencher telas de qualquer proporção.
import { s } from '../engine/svg.js';
import { cloud, sun, tree, bush, flower, PAL } from './items.js';

export function backdrop({ horizon = 250, sky = '#BFE6FF', skyLow = '#E3F4FF', ground = '#A8D88C', groundFar = '#B9E09C', clouds = true, hills = true } = {}) {
  const g = s('g', { class: 'backdrop' },
    s('rect', { x: -700, y: -900, width: 1790, height: horizon + 900, fill: sky }),
    s('rect', { x: -700, y: horizon - 90, width: 1790, height: 90, fill: skyLow, opacity: 0.8 }));
  if (clouds) {
    g.append(s('g', { class: 'drift', transform: 'translate(70 70)' }, cloud(0.8)),
      s('g', { class: 'drift slow', transform: 'translate(300 110)' }, cloud(0.6)));
  }
  if (hills) {
    g.append(s('ellipse', { cx: 40, cy: horizon + 20, rx: 220, ry: 70, fill: '#C9E7AE' }),
      s('ellipse', { cx: 360, cy: horizon + 26, rx: 240, ry: 64, fill: '#BEE2A0' }));
  }
  g.append(s('rect', { x: -700, y: horizon, width: 1790, height: 1700, fill: ground }),
    s('path', { d: `M-700 ${horizon} L1090 ${horizon} L1090 ${horizon + 40} Q195 ${horizon + 70} -700 ${horizon + 40} Z`, fill: groundFar }));
  return g;
}

export function grassTufts(points) {
  return s('g', { class: 'tufts' }, ...points.map(([x, y, k = 1]) => s('path', {
    d: `M${x - 8 * k} ${y} Q${x - 6 * k} ${y - 10 * k} ${x - 2 * k} ${y - 14 * k} M${x} ${y} Q${x + 1 * k} ${y - 12 * k} ${x + 3 * k} ${y - 18 * k} M${x + 8 * k} ${y} Q${x + 6 * k} ${y - 9 * k} ${x + 9 * k} ${y - 13 * k}`,
    fill: 'none', stroke: '#7FBF6A', 'stroke-width': 2.5, 'stroke-linecap': 'round',
  })));
}

export function flowerPatch(x, y, colors = [PAL.coral, '#FFD45C', '#FF9FB0']) {
  return s('g', { transform: `translate(${x} ${y})` },
    ...colors.map((c, i) => s('g', { transform: `translate(${(i - 1) * 16} ${i % 2 ? -6 : 0})` }, flower(c, 0.9))));
}

export const sunAt = (x, y) => s('g', { transform: `translate(${x} ${y})` }, sun());
export const treeAt = (x, y, k = 1) => s('g', { transform: `translate(${x} ${y})` }, tree(k));
export const bushAt = (x, y, w = 100) => s('g', { transform: `translate(${x} ${y})` }, bush(w));
