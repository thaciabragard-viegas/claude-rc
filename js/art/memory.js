// Lembrança ilustrada do álbum: composição da família no piquenique, com a bandana usada no dia.
import { s } from '../engine/svg.js';
import { createBela } from './bela.js';
import { createPerson } from './people.js';
import { CHARACTERS, COUSINS } from '../config.js';
import { blanket, basket, cake, fruitBowl, flower, PAL, cloud } from './items.js';

const place = (el, x, y, k) => s('g', { transform: `translate(${x} ${y}) scale(${k})` }, el);

// Desenha a lembrança em uma caixa de 300 x 220 centrada em (0, 0).
export function memoryArt(mem) {
  const g = s('g', { class: 'memory' });
  g.append(
    s('rect', { x: -160, y: -128, width: 320, height: 250, rx: 10, fill: '#FFFFFF', stroke: PAL.brown, 'stroke-width': 3 }),
    s('rect', { x: -148, y: -116, width: 296, height: 200, rx: 6, fill: '#BFE6FF' }),
    s('rect', { x: -148, y: -30, width: 296, height: 114, fill: '#A8D88C' }),
    place(cloud(0.6), -90, -86, 1), place(cloud(0.45), 80, -70, 1),
    s('circle', { cx: 110, cy: -90, r: 14, fill: '#FFE16B' }),
    place(blanket(220, 46), 0, 52, 1),
  );
  const fam = ['mamae', 'papai', 'teteu', 'laura'].filter((k) => !mem.members || mem.members.includes(k));
  const xs = [-112, 112, -64, 64];
  fam.forEach((k, i) => g.append(place(createPerson(CHARACTERS[k]).el, xs[i], i < 2 ? 24 : 18, 0.5)));
  COUSINS.slice(0, 2).forEach((c, i) => g.append(place(createPerson(c).el, i ? 140 : -140, 66, 0.4)));
  g.append(place(createPerson(CHARACTERS.mel).el, -24, 76, 0.55));
  const b = createBela({ bandana: mem.bandana });
  b.setState('excited');
  g.append(place(b.el, 36, 78, 0.48));
  g.append(place(basket({ w: 40 }), -6, 44, 1), place(cake(), 92, 50, 0.55), place(fruitBowl(), -94, 54, 0.7),
    place(flower(PAL.coral), -136, 78, 0.6), place(flower('#FFD45C'), 136, 80, 0.6));
  const d = new Date(mem.date);
  const label = Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  g.append(s('text', { x: 0, y: 108, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: PAL.brown, text: label }));
  return g;
}
