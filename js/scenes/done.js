// Tela de conclusão: recompensa previsível + três escolhas com o mesmo destaque.
import { s, h, Actor } from '../engine/svg.js';
import { ease } from '../engine/clock.js';
import { BANDANAS } from '../config.js';
import { backdrop, flowerPatch, grassTufts } from '../art/scenery.js';
import { duckToy, cushion, bandanaSwatch, sparkle } from '../art/items.js';
import { memoryArt } from '../art/memory.js';
import { makeBela } from './common.js';

function rewardArt(r) {
  if (r.kind === 'toy') return duckToy();
  if (r.kind === 'cushion') return s('g', { transform: 'scale(0.55)' }, cushion());
  const b = BANDANAS.find((x) => x.id === r.id);
  return s('g', { transform: 'scale(1.3)' }, bandanaSwatch(b));
}

export default {
  name: 'done',
  enter(ctx, params = {}) {
    const { scope, layer: L } = ctx;
    const { activity = 'fetch', rewards = [], memory = null } = params;
    window.__game.done = { activity, rewards: rewards.map((r) => r.id) };
    L.append(backdrop({ horizon: 330 }), flowerPatch(60, 600), flowerPatch(330, 560, ['#B79CE8', '#FFD45C', '#FF9FB0']), grassTufts([[120, 680], [280, 700]]));

    const bela = makeBela(ctx, { x: memory ? 160 : 190, y: 600, scale: memory ? 1.25 : 1.4 });
    bela.bela.setState('excited');
    ctx.sfx('barks');
    for (let i = 0; i < 5; i++) ctx.burst(60 + i * 70, 200 + (i % 2) * 60, { n: 6, spread: 50, kind: i % 2 ? 'heart' : 'sparkle' });

    const showcase = s('g', {});
    L.append(showcase);

    (async () => {
      await scope.wait(600);
      if (memory) {
        const m = new Actor(memoryArt(memory), { x: 195, y: 222, scale: 0.1 });
        showcase.append(m.el);
        await scope.tween(500, (k) => m.set({ scale: 0.1 + 0.6 * k }), ease.back);
      }
      for (const r of rewards) {
        const a = new Actor(s('g', {}, s('circle', { r: 56, fill: '#FFF6E6', stroke: '#6B4A3A', 'stroke-width': 3 }), rewardArt(r)), { x: memory ? 300 : 195, y: memory ? 392 : 260, scale: 0.1 });
        showcase.append(a.el);
        ctx.sfx('found');
        const final = memory ? 0.7 : 1;
        await scope.tween(500, (k) => a.set({ scale: 0.1 + (final - 0.1) * k }), ease.back);
        for (let i = 0; i < 4; i++) {
          const sp = s('g', { transform: `translate(${a.x + Math.cos(i * 1.6) * 64 * final} ${a.y + Math.sin(i * 1.6) * 64 * final})` }, sparkle(1));
          showcase.append(sp);
        }
        await ctx.sayWait(r.line);
      }
      bela.bela.setState('wait');
      // três escolhas com o mesmo destaque
      const row = h('div', { class: 'row end-row' });
      ctx.ui.append(row);
      const again = activity === 'picnic' ? 'fetch' : activity;
      ctx.button({ icon: 'again', label: 'Brincar de novo', cls: 'yellow', parent: row, onTap: () => ctx.go(again) });
      ctx.button({ icon: 'map', label: 'Escolher outra brincadeira', cls: 'green', parent: row, onTap: () => ctx.go('map', { from: activity === 'picnic' ? 'picnic' : activity === 'corner' ? 'corner' : activity }) });
      ctx.button({ icon: 'moon', label: 'Encerrar por agora', cls: 'sky', parent: row, onTap: () => ctx.go('bye') });
      window.__game.done.ready = true;
      ctx.setHint(() => ctx.say('end.choose'));
    })();
  },
};
