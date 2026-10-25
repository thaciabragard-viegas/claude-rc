// Cantinho da Bela: espaço livre de carinho, sem missão. Brinquedos ganhos e troca de bandana.
import { s, Actor } from '../engine/svg.js';
import { ease, gameNow } from '../engine/clock.js';
import { setBandana } from '../logic/state.js';
import { makeBag } from '../logic/rng.js';
import { BANDANAS } from '../config.js';
import { cushion, blanket, ball, duckToy, doghouse, bandanaSwatch, flower, PAL } from '../art/items.js';
import { makeBela } from './common.js';

export default {
  name: 'corner',
  bg: '#F9E6CF',
  enter(ctx) {
    const { scope, layer: L } = ctx;
    const dbg = { pets: 0, pose: 'stand' };
    window.__game.corner = dbg;

    // parede e piso
    L.append(s('rect', { x: -700, y: -900, width: 1790, height: 1400, fill: '#FFE9CC' }));
    for (let x = -700; x < 1100; x += 46) L.append(s('rect', { x, y: -900, width: 20, height: 1400, fill: '#FFF1DC' }));
    L.append(s('rect', { x: -700, y: 470, width: 1790, height: 1000, fill: '#E8C095' }));
    for (let y = 500; y < 1470; y += 40) L.append(s('path', { d: `M-700 ${y} L1090 ${y}`, stroke: '#D9A877', 'stroke-width': 3 }));
    L.append(s('rect', { x: -700, y: 462, width: 1790, height: 14, fill: '#FFF6E6', stroke: '#E0C7A8', 'stroke-width': 2 }));
    // quadrinhos na parede
    const frame = (x, y, c, art) => s('g', { transform: `translate(${x} ${y})` }, s('rect', { x: -32, y: -26, width: 64, height: 52, rx: 6, fill: '#FFF6E6', stroke: PAL.brown, 'stroke-width': 3 }), s('rect', { x: -24, y: -18, width: 48, height: 36, rx: 3, fill: c }), art);
    L.append(frame(80, 170, '#BFE6FF', s('g', { transform: 'translate(0 8) scale(0.8)' }, flower(PAL.coral))));
    // cabide na parede com a bandana atual: tocar abre a escolha de bandanas
    const current = BANDANAS.find((b) => b.id === ctx.state.bandana) || BANDANAS[0];
    const hookSwatch = s('g', { transform: 'translate(0 30)' }, bandanaSwatch(current));
    const hook = s('g', { class: 'hotspot', transform: 'translate(318 160)', 'data-testid': 'wardrobe', role: 'button', 'aria-label': 'Trocar bandana' },
      s('circle', { class: 'halo', cy: 22, r: 50, fill: '#FFF6E6', opacity: 0.5, stroke: '#fff', 'stroke-width': 4 }),
      s('rect', { x: -30, y: -10, width: 60, height: 12, rx: 6, fill: PAL.wood, stroke: PAL.brown, 'stroke-width': 3 }),
      s('path', { d: 'M0 2 L0 14', stroke: PAL.brown, 'stroke-width': 4, 'stroke-linecap': 'round' }),
      hookSwatch,
      s('circle', { cy: 22, r: 56, fill: 'transparent' }));
    L.append(hook);
    // janela
    L.append(s('g', { transform: 'translate(195 250)' },
      s('rect', { x: -70, y: -60, width: 140, height: 110, rx: 12, fill: '#BFE6FF', stroke: PAL.brown, 'stroke-width': 4 }),
      s('path', { d: 'M0 -60 L0 50 M-70 -5 L70 -5', stroke: PAL.brown, 'stroke-width': 4 }),
      s('path', { d: 'M-70 -60 Q-50 -10 -74 50 M70 -60 Q50 -10 74 50', fill: '#FFD3B0', stroke: PAL.brown, 'stroke-width': 3 })));
    L.append(s('g', { transform: 'translate(54 520) scale(0.8)' }, doghouse()));

    // almofada (recompensa) ou mantinha simples
    L.append(s('g', { transform: 'translate(195 640)' }, ctx.state.unlocked.cushion ? cushion() : s('g', { transform: 'translate(0 22)' }, blanket(240, 50))));

    const bela = makeBela(ctx, { x: 185, y: 640, scale: 1.75 });
    const B = bela.bela;
    const fx = s('g', {});
    L.append(fx);

    // brinquedos
    const toys = s('g', {});
    L.append(toys);
    const toyBall = new Actor(ball(undefined, 18), { x: 340, y: 700 });
    toyBall.inner.classList.add('hotspot');
    toyBall.inner.setAttribute('data-testid', 'toy-ball');
    toys.append(toyBall.el);
    let duck = null;
    if (ctx.state.unlocked.toys.includes('patinho')) {
      duck = new Actor(duckToy(), { x: 46, y: 712, scale: 1.2 });
      duck.inner.classList.add('hotspot');
      duck.inner.setAttribute('data-testid', 'toy-duck');
      toys.append(duck.el);
    }

    // ---------- carinho ----------
    let petting = null;
    let lastPet = 0;
    let amount = 0;
    let heartsAcc = 0;
    let belly = false;
    let toyBusy = false;
    const overBela = (p) => p.x > 60 && p.x < 360 && p.y > 400 && p.y < 660;

    scope.on(ctx.svg, 'pointerdown', (e) => {
      const p = ctx.toSvg(e);
      if (!overBela(p) || toyBusy) return;
      petting = { id: e.pointerId, last: p, moved: 0, t: gameNow() };
      try { ctx.svg.setPointerCapture(e.pointerId); } catch { /* ok */ }
    });
    scope.on(ctx.svg, 'pointermove', (e) => {
      if (!petting || e.pointerId !== petting.id) return;
      const p = ctx.toSvg(e);
      const d = Math.hypot(p.x - petting.last.x, p.y - petting.last.y);
      petting.last = p;
      petting.moved += d;
      if (!overBela(p)) return;
      amount += d;
      heartsAcc += d;
      lastPet = gameNow();
      dbg.pets = Math.round(amount);
      if (!belly) B.setState('pet');
      if (heartsAcc > 70) { heartsAcc = 0; ctx.floatHeart(p.x, p.y - 20, fx); ctx.sfx('kiss'); }
      if (!belly && amount > 420) {
        belly = true;
        dbg.pose = 'belly';
        B.setPose('belly');
        ctx.sfx('giggle');
        ctx.burst(bela.x, bela.y - 60, { kind: 'heart', parent: fx, n: 5 });
      }
    });
    const endPet = (e) => {
      if (!petting || e.pointerId !== petting.id) return;
      const tap = petting.moved < 12;
      petting = null;
      if (tap) tapReaction();
    };
    scope.on(ctx.svg, 'pointerup', endPet);
    scope.on(ctx.svg, 'pointercancel', endPet);

    // sem carinho por um tempinho: volta suave para a pose normal (nunca fica triste)
    scope.loop((t) => {
      if (petting || toyBusy) return;
      if (belly && t - lastPet > 2600) {
        belly = false;
        amount = 0;
        dbg.pose = 'stand';
        B.setPose('stand');
        B.setState('rest');
        ctx.sfx('yawn');
      } else if (!belly && B.state === 'pet' && t - lastPet > 900) {
        B.setState('wait');
      }
      if (!belly && B.state === 'rest' && t - lastPet > 7000) B.setState('wait');
    });

    const taps = makeBag(['bark', 'tilt', 'lick', 'sneeze'], ctx.rng);
    let tapBusy = false;
    async function tapReaction() {
      if (tapBusy || belly) return;
      tapBusy = true;
      const r = taps();
      if (r === 'bark') { B.setState('excited'); ctx.sfx('bark'); }
      if (r === 'tilt') { B.setState('curious'); ctx.sfx('squeak'); }
      if (r === 'lick') { B.setState('pet'); ctx.sfx('kiss'); ctx.floatHeart(bela.x + 120, bela.y - 150, fx); }
      if (r === 'sneeze') { B.setState('sniff'); ctx.sfx('sniff'); await scope.wait(600); B.setState('excited'); ctx.sfx('sneeze'); }
      await scope.wait(1000);
      if (!belly) B.setState('wait');
      tapBusy = false;
    }

    // brinquedos: Bela brinca e volta
    scope.on(toyBall.el, 'pointerup', async (e) => {
      e.stopPropagation();
      if (toyBusy) return;
      toyBusy = true;
      if (belly) { belly = false; B.setPose('stand'); amount = 0; }
      ctx.sfx('bounce');
      B.setState('excited');
      B.look(1, 0);
      await scope.tween(900, (k) => toyBall.set({ y: 700 - Math.abs(Math.sin(k * Math.PI * 3)) * 70 * (1 - k), rot: k * 360 }), ease.linear);
      ctx.sfx('bark');
      await scope.wait(500);
      B.setState('wait');
      toyBusy = false;
    });
    if (duck) {
      scope.on(duck.el, 'pointerup', async (e) => {
        e.stopPropagation();
        if (toyBusy) return;
        toyBusy = true;
        if (belly) { belly = false; B.setPose('stand'); amount = 0; }
        ctx.sfx('squeak');
        B.setState('curious');
        bela.flip = -1;
        bela.apply();
        await scope.tween(500, (k) => duck.set({ scale: 1.2 + 0.25 * Math.sin(k * Math.PI) }));
        await scope.wait(600);
        bela.flip = 1;
        bela.apply();
        B.setState('excited');
        await scope.wait(500);
        B.setState('wait');
        toyBusy = false;
      });
    }

    // ---------- bandanas ----------
    let tray = null;
    scope.on(hook, 'pointerup', (e) => { e.stopPropagation(); ctx.sfx('pop'); toggleTray(); });
    function toggleTray() {
      if (tray) { tray.remove(); tray = null; return; }
      ctx.say('corner.wardrobe');
      const unlocked = BANDANAS.filter((b) => ctx.state.unlocked.bandanas.includes(b.id));
      tray = s('g', {});
      const w = Math.min(360, unlocked.length * 72 + 16);
      tray.append(s('rect', { x: 195 - w / 2, y: 262, width: w, height: 96, rx: 24, fill: '#FFF6E6', stroke: PAL.brown, 'stroke-width': 3 }));
      unlocked.forEach((b, i) => {
        const x = 195 - w / 2 + 44 + i * 72;
        const g = s('g', { class: 'hotspot', transform: `translate(${x} 302)`, 'data-testid': `wear-${b.id}` },
          bandanaSwatch(b),
          ctx.state.bandana === b.id ? s('circle', { r: 36, fill: 'none', stroke: PAL.coral, 'stroke-width': 4 }) : null,
          s('circle', { r: 36, fill: 'transparent' }));
        scope.on(g, 'pointerup', (e) => {
          e.stopPropagation();
          ctx.setState(setBandana(ctx.state, b.id));
          B.setBandana(b.id);
          hookSwatch.replaceChildren(bandanaSwatch(b));
          B.setState('excited');
          ctx.sfx('sparkle');
          ctx.burst(bela.x + 50, bela.y - 100, { parent: fx, n: 6 });
          setTimeout(() => { if (scope.alive && B.state === 'excited') B.setState('wait'); }, 1200);
          tray.remove();
          tray = null;
        });
        tray.append(g);
      });
      L.append(tray);
    }

    ctx.setHint(() => ctx.showHand({ x: 140, y: 520 }, { x: 250, y: 500 }, { times: 2 }));
    (async () => {
      B.setState('excited');
      ctx.sfx('barks');
      await scope.wait(700);
      B.setState('wait');
      ctx.instruct('corner.intro');
      await scope.wait(1500);
      if (amount === 0) ctx.showHand({ x: 140, y: 520 }, { x: 250, y: 500 }, { times: 1 });
    })();
  },
};
