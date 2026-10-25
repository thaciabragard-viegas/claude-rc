// Mapa: a casa e o jardim. Cinco lugares ativos + a toalha do piquenique, que conduz a história.
import { s, h } from '../engine/svg.js';
import { adventureReady, nextStep } from '../logic/state.js';
import { makeBag } from '../logic/rng.js';
import { backdrop, flowerPatch, sunAt, grassTufts, bushAt } from '../art/scenery.js';
import { ball, tub, bubble, doghouse, cushion, bookIcon, blanket, basket, pawprint, house, gate, tree, bush, droplet, napkin, heart, PAL } from '../art/items.js';
import { makeBela, runTo, hotspot } from './common.js';
import { openAdult } from './adult.js';

const SPOTS = {
  fetch: { x: 100, y: 372, label: 'Gramado: brincar de bola' },
  bath: { x: 296, y: 372, label: 'Cantinho do banho' },
  hunt: { x: 84, y: 585, label: 'Jardim de pistas: procurar objetos' },
  corner: { x: 308, y: 588, label: 'Cantinho da Bela: carinho e bandanas' },
  album: { x: 195, y: 712, label: 'Álbum de lembranças' },
};
const PICNIC = { x: 195, y: 488 };

function badgeIcon(kind) {
  const g = s('g', { class: 'badge-bob' }, s('circle', { r: 24, fill: '#FFF6E6', stroke: PAL.brown, 'stroke-width': 3 }));
  if (kind === 'fetch') g.append(ball(undefined, 13));
  if (kind === 'bath') g.append(s('g', { transform: 'translate(0 6) scale(1.6)' }, droplet(6)));
  if (kind === 'hunt') g.append(s('g', { transform: 'scale(1.1)' }, pawprint(1)));
  if (kind === 'corner') g.append(s('g', { transform: 'translate(0 2) scale(1.3)' }, heart(1)));
  if (kind === 'album') g.append(s('g', { transform: 'scale(0.38)' }, bookIcon()));
  return g;
}

function spotArt(kind) {
  if (kind === 'fetch') {
    return s('g', {},
      s('ellipse', { cx: 0, cy: 6, rx: 70, ry: 26, fill: '#C3E8A8' }),
      s('g', { transform: 'translate(-20 0)' }, ball(undefined, 14)),
      s('g', { transform: 'translate(24 -4)' }, ball({ color: '#6FBCEB', mark: '#fff', pattern: 'dots' }, 11)),
      s('path', { d: 'M40 6 L40 -44 L64 -36 L40 -28', fill: PAL.coral, stroke: PAL.brown, 'stroke-width': 3, 'stroke-linejoin': 'round' }));
  }
  if (kind === 'bath') {
    return s('g', {},
      s('g', { transform: 'translate(0 18) scale(0.42)' }, tub(260)),
      s('g', { transform: 'translate(-24 -26)' }, bubble(10)), s('g', { transform: 'translate(4 -34)' }, bubble(7)), s('g', { transform: 'translate(26 -24)' }, bubble(9)));
  }
  if (kind === 'hunt') {
    return s('g', {},
      s('g', { transform: 'translate(-10 10)' }, bush(110)),
      s('g', { transform: 'translate(40 18) rotate(-20)' }, pawprint(0.8)),
      s('g', { transform: 'translate(54 0) rotate(-30)' }, pawprint(0.7)),
      s('g', { transform: 'translate(-12 -40)' },
        s('circle', { r: 16, fill: '#E6F6FF', stroke: PAL.brown, 'stroke-width': 4 }),
        s('path', { d: 'M11 11 L26 26', stroke: PAL.brown, 'stroke-width': 7, 'stroke-linecap': 'round' })));
  }
  if (kind === 'corner') {
    return s('g', {},
      s('g', { transform: 'translate(-14 14) scale(0.8)' }, doghouse()),
      s('g', { transform: 'translate(38 18) scale(0.3)' }, cushion()));
  }
  return s('g', {}, s('rect', { x: -48, y: -10, width: 96, height: 26, rx: 8, fill: PAL.wood, stroke: PAL.brown, 'stroke-width': 3 }),
    s('g', { transform: 'translate(0 -26) scale(0.85)' }, bookIcon()));
}

export default {
  name: 'map',
  enter(ctx, params = {}) {
    const { scope, layer: L, state } = ctx;
    const ready = adventureReady(state);
    const next = nextStep(state);

    // cenário
    L.append(backdrop({ horizon: 230 }), sunAt(204, 162));
    L.append(s('g', { transform: 'translate(104 252) scale(0.82)', 'aria-hidden': 'true' }, house())); // cozinha: cenário de expansão
    L.append(s('g', { transform: 'translate(300 214) scale(0.7)' }, tree()), s('g', { transform: 'translate(360 222) scale(0.55)' }, tree()));
    L.append(s('g', { transform: 'translate(326 262) scale(0.72)', 'aria-hidden': 'true' }, gate())); // portão do parque: cenário de expansão
    L.append(s('path', {
      d: 'M195 488 Q150 440 100 400 M195 488 Q250 440 296 400 M195 488 Q140 540 84 600 M195 488 Q250 540 308 600 M195 488 Q190 620 195 700',
      fill: 'none', stroke: '#F3DDB6', 'stroke-width': 26, 'stroke-linecap': 'round', opacity: 0.85,
    }));
    L.append(grassTufts([[30, 300], [370, 310], [20, 480], [370, 480], [40, 700], [350, 720], [180, 300]]),
      flowerPatch(28, 420), flowerPatch(366, 440, ['#B79CE8', '#FFD45C', '#FF9FB0']), bushAt(18, 680, 70), bushAt(380, 668, 70));

    // toalha do piquenique: mostra o progresso da história
    const pic = s('g', {},
      s('ellipse', { class: 'halo', cx: 0, cy: -22, rx: 96, ry: 42, fill: '#FFF6E6', opacity: ready ? 0.7 : 0, stroke: '#fff', 'stroke-width': 4 }),
      blanket(150, 42),
      s('g', { transform: 'translate(0 -14)' }, basket({ w: 54 })));
    const marks = [
      ['fetch', s('g', {}, ball(undefined, 9))],
      ['bath', s('g', {}, bubble(9))],
      ['hunt', s('g', { transform: 'scale(0.55)' }, napkin())],
    ];
    marks.forEach(([id, el], i) => {
      const done = state.adventure.done.includes(id);
      const g = s('g', { transform: `translate(${-46 + i * 46} -2)`, opacity: done ? 1 : 0.28 }, el);
      if (done) g.append(s('circle', { r: 13, fill: 'none', stroke: '#fff', 'stroke-width': 2.5 }));
      pic.append(g);
    });
    const picHot = hotspot({
      ctx, x: PICNIC.x, y: PICNIC.y, r: 64, label: 'Toalha do piquenique', testid: 'spot-picnic', children: [pic],
      onTap: () => {
        if (busy) return;
        if (adventureReady(ctx.state)) travel('picnic', PICNIC);
        else { ctx.sfx('tap'); suggest(true); }
      },
    });
    if (ready) picHot.classList.add('suggest', 'glow-soft');

    // lugares ativos
    const spotEls = {};
    for (const [id, sp] of Object.entries(SPOTS)) {
      const isNext = !ready && id === next;
      const g = hotspot({
        ctx, x: sp.x, y: sp.y, r: 66, label: sp.label, testid: `spot-${id}`,
        children: [
          s('ellipse', { class: 'halo', cx: 0, cy: 6, rx: 72, ry: 34, fill: '#FFF6E6', opacity: 0.5, stroke: '#fff', 'stroke-width': 4 }),
          spotArt(id),
          s('g', { transform: 'translate(0 -74)' }, badgeIcon(id)),
        ],
        onTap: () => travel(id === 'corner' ? 'corner' : id, sp),
      });
      if (isNext) g.classList.add('suggest');
      spotEls[id] = g;
    }

    // Bela acompanha a navegação: aparece no lugar de onde veio e volta para perto da toalha
    const fromSpot = SPOTS[params.from] || (params.from === 'picnic' ? PICNIC : null);
    const home = { x: 192, y: 612 };
    const bela = makeBela(ctx, { x: fromSpot ? fromSpot.x : home.x, y: fromSpot ? fromSpot.y + 40 : home.y, scale: 0.55 });
    let busy = false;

    (async () => {
      bela.bela.setState('excited');
      ctx.sfx('bark');
      await scope.wait(400);
      if (fromSpot) await runTo(ctx, bela, home.x, home.y, { speed: 300, after: 'wait' });
      else { await scope.wait(500); bela.bela.setState('wait'); }
      if (params.first && !ready && next === 'fetch') await ctx.sayWait('map.welcome');
      suggest(false);
    })();

    function suggest(withHand) {
      const id = adventureReady(ctx.state) ? 'picnic' : nextStep(ctx.state);
      ctx.instruct(`map.suggest.${id}`);
      if (withHand) {
        const p = id === 'picnic' ? PICNIC : SPOTS[id];
        ctx.showHand({ x: p.x + 10, y: p.y + 10 }, null, { times: 2 });
      }
    }

    async function travel(scene, sp) {
      if (busy) return;
      busy = true;
      ctx.sfx('pop');
      await runTo(ctx, bela, sp.x - 40, sp.y + 44, { speed: 520, after: 'excited' });
      ctx.go(scene, {});
    }

    // Reações da Bela ao toque, variadas e sem repetição mecânica
    const reactions = makeBag(['wag', 'tilt', 'sneeze', 'spin', 'belly'], ctx.rng);
    let reacting = false;
    ctx.scope.on(bela.el, 'pointerup', async (e) => {
      e.stopPropagation();
      if (busy || reacting) return;
      reacting = true;
      const r = reactions();
      if (r === 'wag') { bela.bela.setState('excited'); ctx.sfx('bark'); ctx.floatHeart(bela.x, bela.y - 80); await scope.wait(1100); }
      if (r === 'tilt') { bela.bela.setState('curious'); ctx.sfx('squeak'); await scope.wait(1200); }
      if (r === 'sneeze') {
        bela.bela.setState('sniff'); ctx.sfx('sniff'); await scope.wait(800);
        bela.bela.setState('excited'); ctx.sfx('sneeze'); ctx.say('map.sneeze');
        ctx.burst(bela.x + 50 * bela.flip * bela.scale, bela.y - 60, { n: 5, spread: 30 });
        await scope.wait(900);
      }
      if (r === 'spin') {
        bela.bela.setState('run'); ctx.sfx('whee');
        await scope.tween(700, (k) => { bela.flip = Math.sin(k * Math.PI * 4) >= 0 ? 1 : -1; bela.y = home.y - Math.sin(k * Math.PI) * 18; bela.apply(); });
      }
      if (r === 'belly') { bela.bela.setPose('belly'); ctx.sfx('giggle'); ctx.floatHeart(bela.x, bela.y - 50); await scope.wait(1400); bela.bela.setPose('stand'); }
      bela.bela.setState('wait');
      reacting = false;
    });
    bela.el.setAttribute('class', 'hotspot');

    ctx.idle(15000, () => suggest(true));
    ctx.setHint(() => suggest(true));

    // Área adulta: botão discreto, protegido por uma etapa de verificação
    const gearWrap = h('div', { class: 'gear' });
    ctx.ui.append(gearWrap);
    ctx.button({ icon: 'gear', label: 'Área dos adultos', parent: gearWrap, onTap: () => { openAdult(ctx); return 'keep'; } });

    window.__game.map = { spots: SPOTS, picnic: PICNIC, get busy() { return busy; } };
  },
};
