// A Bela, desenhada em SVG. Estados visuais por classes CSS (ver css/bela.css).
// Origem nos pés; olhando para a direita. Cores vêm de config.BELA.
import { s } from '../engine/svg.js';
import { BELA, BANDANAS } from '../config.js';
import { bandanaFill } from './items.js';

const OUT = '#6B4A3A';
export const BELA_STATES = ['wait', 'excited', 'run', 'fetch', 'curious', 'pet', 'shake', 'rest', 'sniff', 'hide'];

let uid = 0;

export function createBela({ bandana = 'coral' } = {}) {
  const c = BELA;
  const id = `bela${++uid}`;
  const st = { stroke: OUT, 'stroke-width': 3, 'stroke-linejoin': 'round' };

  const leg = (x, cls) => s('g', { class: `b-leg ${cls}` },
    s('rect', { x, y: -42, width: 15, height: 42, rx: 7.5, fill: c.fur, ...st }),
    s('ellipse', { cx: x + 8.5, cy: -4, rx: 9.5, ry: 5.5, fill: c.furLight, ...st }));

  const mud = s('g', { class: 'b-mud' });
  const wet = s('g', { class: 'b-wet' });
  const foam = s('g', { class: 'b-foam' });
  const mouth = s('g', { class: 'b-carry', transform: 'translate(86 -66)' });
  const bandanaG = s('g', { class: 'b-bandana' });
  const hat = s('g', { class: 'b-hat', style: 'display:none' },
    s('path', { d: 'M16 -104 Q44 -134 74 -108 L80 -96 Q46 -112 12 -94 Z', fill: '#FFF6E6', ...st }),
    s('path', { d: 'M22 -108 L70 -110', stroke: '#FF7F6B', 'stroke-width': 3, 'stroke-dasharray': '5 5' }));

  const pupils = s('g', { class: 'b-pupils' },
    s('ellipse', { cx: 56, cy: -92, rx: 5.2, ry: 6.4, fill: c.eye }),
    s('circle', { cx: 57.8, cy: -94.5, r: 2, fill: '#fff' }));

  const head = s('g', { class: 'b-head' },
    s('ellipse', { class: 'b-ear-back', cx: 30, cy: -96, rx: 10, ry: 20, transform: 'rotate(-18 30 -96)', fill: c.ear, ...st }),
    s('circle', { cx: 44, cy: -86, r: 30, fill: c.fur, ...st }),
    s('ellipse', { cx: 68, cy: -75, rx: 18, ry: 13.5, fill: c.furLight, ...st }),
    s('ellipse', { cx: 58, cy: -73, rx: 6, ry: 3.6, fill: '#FF9F8E', opacity: 0.55 }),
    s('path', { class: 'b-smile', d: 'M70 -68 Q76 -62 82 -68', fill: 'none', stroke: OUT, 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
    s('path', { class: 'b-tongue', d: 'M73 -66 Q74 -54 79 -55 Q83 -57 81 -66 Z', fill: '#FF8FA3', stroke: OUT, 'stroke-width': 2 }),
    s('ellipse', { cx: 85, cy: -80, rx: 6.5, ry: 5.2, fill: c.nose }),
    s('circle', { cx: 86.5, cy: -81.6, r: 1.6, fill: '#fff', opacity: 0.8 }),
    s('g', { class: 'b-eye-open' }, pupils),
    s('path', { class: 'b-eye-closed', d: 'M50 -92 Q56 -86 62 -92', fill: 'none', stroke: c.eye, 'stroke-width': 3, 'stroke-linecap': 'round' }),
    s('path', { class: 'b-brow', d: 'M50 -104 Q56 -108 62 -104', fill: 'none', stroke: OUT, 'stroke-width': 2.2, 'stroke-linecap': 'round', opacity: 0.6 }),
    hat,
    s('g', { class: 'b-ear' },
      s('path', { d: 'M22 -112 Q8 -96 14 -74 Q22 -66 30 -76 Q38 -98 22 -112 Z', fill: c.ear, ...st })),
    mouth);

  const tail = s('g', { class: 'b-tail' },
    s('path', { d: 'M-44 -58 Q-64 -72 -58 -98', fill: 'none', stroke: OUT, 'stroke-width': 15, 'stroke-linecap': 'round' }),
    s('path', { d: 'M-44 -58 Q-64 -72 -58 -98', fill: 'none', stroke: c.fur, 'stroke-width': 9, 'stroke-linecap': 'round' }),
    s('circle', { cx: -58, cy: -98, r: 4.5, fill: c.furLight }));

  const stand = s('g', { class: 'b-stand' },
    tail,
    leg(-40, 'b-leg-b1'), leg(-22, 'b-leg-b2'),
    s('ellipse', { cx: 0, cy: -48, rx: 50, ry: 30, fill: c.fur, ...st }),
    s('ellipse', { cx: 16, cy: -40, rx: 26, ry: 17, fill: c.furLight }),
    s('ellipse', { cx: -24, cy: -62, rx: 14, ry: 9, fill: c.ear, opacity: 0.35 }),
    leg(14, 'b-leg-f1'), leg(30, 'b-leg-f2'),
    mud, foam, wet, bandanaG, head);

  // Pose de barriga para cima (carinho)
  const upLeg = (x, r) => s('g', { class: 'b-kick', style: `--r:${r}deg` },
    s('rect', { x: x - 7, y: -78, width: 14, height: 34, rx: 7, fill: c.fur, ...st, transform: `rotate(${r} ${x} -50)` }));
  const belly = s('g', { class: 'b-belly' },
    s('g', { class: 'b-tail2' }, s('path', { d: 'M-50 -26 Q-74 -22 -82 -40', fill: 'none', stroke: OUT, 'stroke-width': 14, 'stroke-linecap': 'round' }),
      s('path', { d: 'M-50 -26 Q-74 -22 -82 -40', fill: 'none', stroke: c.fur, 'stroke-width': 8, 'stroke-linecap': 'round' })),
    upLeg(-30, -16), upLeg(-14, -6),
    s('ellipse', { cx: 0, cy: -28, rx: 54, ry: 26, fill: c.fur, ...st }),
    s('ellipse', { cx: -2, cy: -38, rx: 36, ry: 13, fill: c.furLight }),
    upLeg(14, 6), upLeg(30, 16),
    s('g', { transform: 'translate(58 -26) rotate(28)' },
      s('ellipse', { cx: -6, cy: 18, rx: 10, ry: 20, fill: c.ear, ...st, transform: 'rotate(40 -6 18)' }),
      s('circle', { cx: 0, cy: 0, r: 27, fill: c.fur, ...st }),
      s('ellipse', { cx: 22, cy: 8, rx: 16, ry: 12, fill: c.furLight, ...st }),
      s('ellipse', { cx: 36, cy: 4, rx: 6, ry: 5, fill: c.nose }),
      s('path', { d: 'M4 -10 Q10 -4 16 -10', fill: 'none', stroke: c.eye, 'stroke-width': 3, 'stroke-linecap': 'round' }),
      s('path', { d: 'M24 18 Q26 30 32 28 Q34 24 32 16 Z', fill: '#FF8FA3', stroke: OUT, 'stroke-width': 2 }),
      s('ellipse', { cx: 6, cy: 8, rx: 5, ry: 3, fill: '#FF9F8E', opacity: 0.55 })));

  const hearts = s('g', { class: 'b-fx' });
  const shadow = s('ellipse', { class: 'b-shadow', cx: 0, cy: 0, rx: 58, ry: 9, fill: '#5B7A3A', opacity: 0.18 });
  const body = s('g', { class: 'b-body' }, stand, belly);
  const root = s('g', { class: 'bela state-wait pose-stand', 'data-testid': 'bela', id }, shadow, body, hearts);

  const api = {
    el: root,
    mouth,
    mud,
    wet,
    foam,
    fx: hearts,
    state: 'wait',
    setState(name) {
      if (api.state === name) return api;
      root.classList.remove(`state-${api.state}`);
      api.state = name;
      root.classList.add(`state-${name}`);
      return api;
    },
    setPose(p) {
      root.classList.toggle('pose-belly', p === 'belly');
      root.classList.toggle('pose-stand', p !== 'belly');
      return api;
    },
    setBandana(bid) {
      bandanaG.replaceChildren();
      const b = BANDANAS.find((x) => x.id === bid);
      if (!b) return api;
      const fill = bandanaFill(b, root);
      bandanaG.append(
        s('path', { d: 'M14 -70 Q34 -58 52 -64 L40 -40 Q28 -46 14 -70 Z', fill, stroke: OUT, 'stroke-width': 3, 'stroke-linejoin': 'round' }),
        s('path', { d: 'M12 -72 Q34 -56 56 -66', fill: 'none', stroke: OUT, 'stroke-width': 3, 'stroke-linecap': 'round' }));
      return api;
    },
    setHat(on) { hat.style.display = on ? '' : 'none'; return api; },
    look(dx, dy) {
      const k = Math.hypot(dx, dy) || 1;
      pupils.setAttribute('transform', `translate(${(dx / k * 2.6).toFixed(2)} ${(dy / k * 2.2).toFixed(2)})`);
      return api;
    },
    carry(node) { mouth.replaceChildren(); if (node) mouth.append(node); return api; },
  };
  api.setBandana(bandana);
  return api;
}
