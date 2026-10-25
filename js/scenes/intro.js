// Abertura curta e pulável: bolinha, pegadas, latido e a Bela dentro da cesta com o guardanapo.
import { s, h, Actor } from '../engine/svg.js';
import { ease } from '../engine/clock.js';
import { markIntroSeen } from '../logic/state.js';
import { backdrop, flowerPatch, treeAt, grassTufts } from '../art/scenery.js';
import { ball, basket, pawprint, blanket } from '../art/items.js';
import { makeBela, makePerson } from './common.js';

export default {
  name: 'intro',
  enter(ctx) {
    const { scope, layer: L } = ctx;
    L.append(backdrop({ horizon: 300 }), treeAt(330, 360, 1), treeAt(40, 340, 0.8),
      grassTufts([[50, 640], [330, 700], [120, 480]]), flowerPatch(70, 720), flowerPatch(330, 470, ['#B79CE8', '#FFD45C', '#FF9FB0']));
    L.append(s('g', { transform: 'translate(195 600)' }, blanket(250, 70)));

    const mamae = makePerson(ctx, 'mamae', { x: 322, y: 640, scale: 0.95, flip: -1 });
    mamae.el.style.opacity = 0;

    // Bela fica escondida dentro da cesta
    const basketBack = s('g', {});
    L.append(basketBack);
    const bela = makeBela(ctx, { x: 195, y: 560, scale: 0.9, parent: basketBack });
    bela.bela.setHat(true);
    bela.el.style.opacity = 0;
    const bk = new Actor(basket({ w: 130 }), { x: 195, y: 590 });
    L.append(bk.el);

    const prints = s('g', {});
    L.append(prints);
    const b = new Actor(ball(), { x: -40, y: 470 });
    L.append(b.el);

    const finish = () => {
      ctx.setState(markIntroSeen(ctx.state));
      ctx.go('map', { first: true });
    };
    const skip = ctx.button({ icon: 'skip', label: 'Pular abertura', cls: 'skip yellow', onTap: finish });

    (async () => {
      await scope.wait(400);
      // 1. bolinha atravessa a tela
      ctx.sfx('whoosh');
      await scope.tween(1300, (k) => {
        b.x = -40 + 470 * k;
        b.y = 470 - Math.abs(Math.sin(k * Math.PI * 3)) * 60 * (1 - k);
        b.rot = k * 720;
        b.apply();
        if (Math.abs(Math.sin(k * Math.PI * 3)) < 0.05) ctx.sfx('bounce');
      }, ease.linear);
      // 2. pegadas até a cesta
      const pts = [[30, 520], [62, 540], [92, 548], [124, 566], [150, 572]];
      for (const [x, y] of pts) {
        const p = s('g', { transform: `translate(${x} ${y}) rotate(80)` }, pawprint(0.9));
        prints.append(p);
        ctx.sfx('step');
        await scope.wait(220);
      }
      // 3. ouvimos a Bela
      ctx.sfx('barks');
      bk.inner.classList.add('wiggle');
      await scope.wait(700);
      // 4. ela surge na cesta com o guardanapo na cabeça
      bela.bela.setState('excited');
      await scope.tween(450, (k) => {
        bela.el.style.opacity = 1;
        bela.y = 590 - 40 * k;
        bela.apply();
      }, ease.back);
      ctx.sfx('boing');
      ctx.burst(240, 470, { n: 6 });
      await scope.wait(500);
      // 5. convite
      await scope.tween(400, (k) => { mamae.el.style.opacity = k; });
      mamae.person.wave(true);
      await ctx.sayWait('intro.invite', null, { asInstruction: true });
      mamae.person.wave(false);
      skip.remove();
      const row = h('div', { class: 'row', style: 'bottom: calc(40px + var(--safe-b))' });
      ctx.ui.append(row);
      ctx.button({ icon: 'play', label: 'Brincar', cls: 'big pulse', parent: row, onTap: finish });
    })();

    ctx.setHint(() => ctx.say('intro.invite'));
  },
};
