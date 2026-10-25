// Despedida calma. Um toque na patinha volta para o jardim quando quiser brincar de novo.
import { s, h } from '../engine/svg.js';
import { backdrop } from '../art/scenery.js';
import { cushion, cloud } from '../art/items.js';
import { makeBela } from './common.js';

export default {
  name: 'bye',
  bg: '#FFD3B0',
  enter(ctx) {
    const { scope, layer: L } = ctx;
    L.append(backdrop({ horizon: 420, sky: '#FFD3B0', skyLow: '#FFE9CC', ground: '#B9D99A', groundFar: '#C6E1AB', clouds: false }));
    L.append(s('g', { transform: 'translate(300 150)' }, s('path', { d: 'M18 -34 A36 36 0 1 0 40 22 A28 28 0 1 1 18 -34 Z', fill: '#FFF1B8', stroke: '#E8C46A', 'stroke-width': 3 })),
      s('g', { transform: 'translate(90 200)', opacity: 0.8 }, cloud(0.7)));
    for (let i = 0; i < 8; i++) L.append(s('circle', { cx: 30 + i * 47, cy: 60 + (i % 3) * 40, r: 2.5, fill: '#FFF6E6', opacity: 0.8 }));
    L.append(s('g', { transform: 'translate(195 600)' }, cushion()));
    const bela = makeBela(ctx, { x: 185, y: 600, scale: 1.5 });
    bela.bela.setState('rest');
    (async () => {
      await scope.wait(400);
      ctx.sfx('yawn');
      await ctx.sayWait('bye');
      await scope.wait(1500);
      const row = h('div', { class: 'row', style: 'bottom: calc(50px + var(--safe-b))' });
      ctx.ui.append(row);
      ctx.button({ icon: 'paw', label: 'Voltar a brincar', cls: 'big', parent: row, onTap: () => ctx.go('map') });
    })();
    ctx.setHint(() => ctx.say('bye'));
  },
};
