// A Bela, desenhada em SVG com aparência de pelúcia (contornos "fofinhos").
// Referência visual: pelo caramelo-alaranjado, focinho/peito/patas creme, orelhas caídas marrons,
// rabo enrolado e felpudo, olhos redondos pretos e coleira rosa com carinhas amarelas.
// Origem nos pés; olhando para a direita (3/4). Estados visuais por classes CSS (css/bela.css).
import { s } from '../engine/svg.js';
import { BELA, BANDANAS } from '../config.js';
import { bandanaFill } from './items.js';

const OUT = '#6B4A3A';
export const BELA_STATES = ['wait', 'excited', 'run', 'fetch', 'curious', 'pet', 'shake', 'rest', 'sniff', 'hide'];

let uid = 0;

// Elipse com borda ondulada (pelo felpudo).
export function fluffPath(cx, cy, rx, ry, n = 14, amp = 0.09, rot = 0) {
  const pt = (a, k) => [cx + Math.cos(a + rot) * rx * k, cy + Math.sin(a + rot) * ry * k];
  let [x0, y0] = pt(0, 1);
  let d = `M${x0.toFixed(1)} ${y0.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const a0 = (2 * Math.PI * i) / n;
    const a1 = (2 * Math.PI * (i + 1)) / n;
    const [qx, qy] = pt((a0 + a1) / 2, 1 + amp * 2);
    const [x1, y1] = pt(a1, 1);
    d += ` Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return `${d} Z`;
}

const fluff = (cx, cy, rx, ry, fill, opts = {}) => s('path', {
  d: fluffPath(cx, cy, rx, ry, opts.n, opts.amp, opts.rot),
  fill, stroke: opts.stroke === false ? 'none' : OUT, 'stroke-width': opts.w ?? 3, 'stroke-linejoin': 'round',
});

// Coleira com as carinhas amarelas (da referência).
function collar(c, d, dots) {
  return s('g', { class: 'b-collar' },
    s('path', { d, fill: 'none', stroke: OUT, 'stroke-width': 11, 'stroke-linecap': 'round' }),
    s('path', { d, fill: 'none', stroke: c.collar, 'stroke-width': 7, 'stroke-linecap': 'round' }),
    ...dots.map(([x, y]) => s('g', { transform: `translate(${x} ${y})` },
      s('circle', { r: 3.4, fill: c.collarDots, stroke: OUT, 'stroke-width': 1 }),
      s('path', { d: 'M-1.6 0.4 Q0 2 1.6 0.4', fill: 'none', stroke: OUT, 'stroke-width': 0.9 }))));
}

export function createBela({ bandana = 'coral' } = {}) {
  const c = BELA;
  const id = `bela${++uid}`;
  const st = { stroke: OUT, 'stroke-width': 3, 'stroke-linejoin': 'round' };

  const leg = (x, cls, back = false) => s('g', { class: `b-leg ${cls}` },
    s('rect', { x, y: -36, width: 18, height: 36, rx: 9, fill: back ? c.furDark : c.fur, ...st }),
    fluff(x + 9, -5, 11, 7, c.furLight, { n: 8, amp: 0.08, w: 2.6 }));

  const mud = s('g', { class: 'b-mud' });
  const wet = s('g', { class: 'b-wet' });
  const foam = s('g', { class: 'b-foam' });
  const mouth = s('g', { class: 'b-carry', transform: 'translate(80 -68)' });
  const bandanaG = s('g', { class: 'b-bandana' });
  const hat = s('g', { class: 'b-hat', style: 'display:none' },
    s('path', { d: 'M10 -112 Q42 -146 76 -116 L82 -104 Q44 -122 6 -100 Z', fill: '#FFF6E6', ...st }),
    s('path', { d: 'M18 -116 L70 -118', stroke: '#FF7F6B', 'stroke-width': 3, 'stroke-dasharray': '5 5' }));

  const eye = (x) => s('g', {},
    s('circle', { cx: x, cy: -96, r: 6.4, fill: c.eye }),
    s('circle', { cx: x + 2, cy: -98.5, r: 2.3, fill: '#fff' }),
    s('circle', { cx: x - 2, cy: -93.5, r: 1, fill: '#fff', opacity: 0.7 }));
  const pupils = s('g', { class: 'b-pupils' }, eye(44), eye(64));
  const closed = (x) => s('path', { d: `M${x - 6} -96 Q${x} -90 ${x + 6} -96`, fill: 'none', stroke: c.eye, 'stroke-width': 3, 'stroke-linecap': 'round' });

  const head = s('g', { class: 'b-head' },
    // orelha de trás (aparece atrás da cabeça)
    s('ellipse', { class: 'b-ear-back', cx: 72, cy: -104, rx: 11, ry: 17, transform: 'rotate(28 72 -104)', fill: c.ear, ...st }),
    fluff(44, -88, 35, 33, c.fur, { n: 16, amp: 0.06 }),
    // máscara creme: bochechas, focinho e queixo
    s('path', { d: 'M18 -80 Q22 -100 40 -92 Q54 -104 68 -94 Q80 -94 78 -78 Q76 -58 52 -56 Q22 -58 18 -80 Z', fill: c.furLight }),
    s('path', { d: 'M54 -104 Q50 -96 52 -86', fill: 'none', stroke: c.furLight, 'stroke-width': 6, 'stroke-linecap': 'round' }),
    s('path', { d: 'M50 -70 Q56 -64 62 -66 Q68 -64 74 -70', fill: 'none', stroke: OUT, 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.35 }),
    s('ellipse', { cx: 34, cy: -80, rx: 6, ry: 3.6, fill: '#FF9F8E', opacity: 0.5 }),
    s('ellipse', { cx: 76, cy: -82, rx: 4.5, ry: 3, fill: '#FF9F8E', opacity: 0.45 }),
    s('path', { class: 'b-smile', d: 'M56 -70 Q62 -64 68 -70', fill: 'none', stroke: OUT, 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
    s('path', { class: 'b-tongue', d: 'M58 -69 Q58 -57 63 -58 Q68 -59 67 -69 Z', fill: '#FF8FA3', stroke: OUT, 'stroke-width': 2 }),
    s('ellipse', { cx: 64, cy: -82, rx: 7, ry: 5.4, fill: c.nose }),
    s('ellipse', { cx: 62, cy: -84, rx: 2.4, ry: 1.4, fill: '#fff', opacity: 0.7 }),
    s('g', { class: 'b-eye-open' }, pupils),
    s('g', { class: 'b-eye-closed' }, closed(44), closed(64)),
    hat,
    s('g', { class: 'b-ear' },
      s('path', { d: 'M14 -114 Q-6 -100 2 -76 Q10 -66 22 -74 Q30 -92 26 -110 Q22 -118 14 -114 Z', fill: c.ear, ...st }),
      s('path', { d: 'M12 -104 Q6 -92 10 -80', fill: 'none', stroke: c.earLight, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 })),
    mouth);

  // rabo enrolado e felpudo sobre as costas
  const tail = s('g', { class: 'b-tail' },
    fluff(-48, -78, 15, 17, c.fur, { n: 10, amp: 0.1 }),
    fluff(-40, -92, 11, 10, c.fur, { n: 8, amp: 0.1 }),
    s('path', { d: 'M-50 -76 Q-46 -90 -38 -92', fill: 'none', stroke: c.furDark, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.6 }));

  const stand = s('g', { class: 'b-stand' },
    tail,
    leg(-38, 'b-leg-b1', true), leg(-20, 'b-leg-b2'),
    fluff(0, -46, 48, 31, c.fur, { n: 16, amp: 0.05 }),
    s('g', { opacity: 0.45 }, fluff(-24, -42, 17, 16, c.furDark, { stroke: false, n: 10, amp: 0.08 })),
    fluff(24, -44, 22, 22, c.furLight, { stroke: false, n: 10, amp: 0.1 }),
    leg(10, 'b-leg-f1'), leg(28, 'b-leg-f2'),
    mud, foam, wet, bandanaG,
    collar(c, 'M16 -64 Q36 -52 58 -62', [[24, -58], [37, -55], [50, -58]]),
    head);

  // Pose de barriga para cima (carinho), com as almofadinhas das patas à mostra
  const pawUp = (x, r) => s('g', { class: 'b-kick', style: `--r:${r}deg` },
    s('g', { transform: `rotate(${r} ${x} -48)` },
      s('rect', { x: x - 9, y: -80, width: 18, height: 36, rx: 9, fill: c.fur, ...st }),
      fluff(x, -80, 12, 10, c.furLight, { n: 8, amp: 0.08, w: 2.6 }),
      s('ellipse', { cx: x, cy: -79, rx: 4.5, ry: 3.6, fill: c.pads }),
      s('circle', { cx: x - 5, cy: -85, r: 1.8, fill: c.pads }),
      s('circle', { cx: x, cy: -87, r: 1.8, fill: c.pads }),
      s('circle', { cx: x + 5, cy: -85, r: 1.8, fill: c.pads })));
  const belly = s('g', { class: 'b-belly' },
    s('g', { class: 'b-tail2' }, fluff(-60, -26, 15, 13, c.fur, { n: 10, amp: 0.1 })),
    pawUp(-30, -14), pawUp(-12, -5),
    fluff(0, -28, 54, 27, c.fur, { n: 18, amp: 0.05 }),
    fluff(-2, -38, 38, 15, c.furLight, { stroke: false, n: 12, amp: 0.08 }),
    pawUp(14, 6), pawUp(32, 15),
    s('g', { transform: 'translate(60 -24) rotate(24)' },
      s('ellipse', { cx: -10, cy: 16, rx: 11, ry: 19, fill: c.ear, ...st, transform: 'rotate(40 -10 16)' }),
      fluff(0, 0, 30, 28, c.fur, { n: 14, amp: 0.06 }),
      s('path', { d: 'M-18 6 Q-10 -12 8 -6 Q22 -14 30 2 Q30 22 6 24 Q-16 24 -18 6 Z', fill: c.furLight }),
      s('ellipse', { cx: 16, cy: 10, rx: 6.5, ry: 5, fill: c.nose }),
      s('path', { d: 'M-8 -6 Q-3 0 2 -6 M12 -10 Q17 -4 22 -10', fill: 'none', stroke: c.eye, 'stroke-width': 3, 'stroke-linecap': 'round' }),
      s('path', { d: 'M8 18 Q8 30 14 29 Q19 27 17 17 Z', fill: '#FF8FA3', stroke: OUT, 'stroke-width': 2 }),
      s('ellipse', { cx: -10, cy: 4, rx: 5, ry: 3, fill: '#FF9F8E', opacity: 0.55 })),
    collar(c, 'M30 -40 Q40 -26 34 -12', [[34, -34], [36, -24]]));

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
    // a bandana fica no peito, logo abaixo da coleira
    setBandana(bid) {
      bandanaG.replaceChildren();
      const b = BANDANAS.find((x) => x.id === bid);
      if (!b) return api;
      const fill = bandanaFill(b, root);
      bandanaG.append(s('path', { d: 'M16 -60 Q36 -50 58 -58 L42 -34 Q30 -40 16 -60 Z', fill, stroke: OUT, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      return api;
    },
    setHat(on) { hat.style.display = on ? '' : 'none'; return api; },
    look(dx, dy) {
      const k = Math.hypot(dx, dy) || 1;
      pupils.setAttribute('transform', `translate(${(dx / k * 2.2).toFixed(2)} ${(dy / k * 2).toFixed(2)})`);
      return api;
    },
    carry(node) { mouth.replaceChildren(); if (node) mouth.append(node); return api; },
  };
  api.setBandana(bandana);
  return api;
}
