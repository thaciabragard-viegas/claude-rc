// Celebração: Mel chama cada pessoa da família (que está espiando) para a toalha e guarda a lembrança.
import { s, h } from '../engine/svg.js';
import { ease } from '../engine/clock.js';
import { adventureReady, completePicnic } from '../logic/state.js';
import { COUSINS } from '../config.js';
import { backdrop, grassTufts, flowerPatch, treeAt, bushAt } from '../art/scenery.js';
import { blanket, basket, cake, fruitBowl, dogBowl, house, napkin, ribbon, plate } from '../art/items.js';
import { makeBela, makePerson, runTo } from './common.js';

const FAMILY = [
  { key: 'mamae', hide: { x: 112, y: 330 }, seat: { x: 84, y: 540 }, line: 'picnic.mamae' },
  { key: 'papai', hide: { x: 330, y: 352 }, seat: { x: 306, y: 540 }, line: 'picnic.papai' },
  { key: 'teteu', hide: { x: 44, y: 468 }, seat: { x: 44, y: 660 }, line: 'picnic.teteu' },
  { key: 'laura', hide: { x: 352, y: 478 }, seat: { x: 346, y: 664 }, line: 'picnic.laura' },
];

export default {
  name: 'picnic',
  enter(ctx) {
    const { scope, layer: L } = ctx;
    if (!adventureReady(ctx.state)) { ctx.go('map'); return; }
    const dbg = { called: [], phase: 'call', hidden: FAMILY.map((f) => ({ key: f.key, x: f.hide.x, y: f.hide.y - 60 })) };
    window.__game.picnic = dbg;

    L.append(backdrop({ horizon: 250 }));
    const back = s('g', {});
    const occl = s('g', {});
    L.append(back);
    L.append(occl);
    // esconderijos: casa (mamãe), árvore (papai), arbustos (Teteu e Tia Laura)
    occl.append(s('g', { transform: 'translate(150 344) scale(0.62)' }, house()));
    occl.append(treeAt(330, 372, 1.0), bushAt(44, 478, 110), bushAt(352, 488, 110));
    L.append(grassTufts([[150, 420], [250, 430], [195, 760]]), flowerPatch(195, 440));

    const front = s('g', {});
    L.append(front);
    front.append(s('g', { transform: 'translate(195 650)' }, blanket(320, 110)));
    front.append(s('g', { transform: 'translate(195 600)' }, basket({ w: 76 })));
    const items = s('g', {});
    front.append(items);
    items.append(s('g', { transform: 'translate(250 612) scale(0.7)' }, napkin()), s('g', { transform: 'translate(130 618) scale(0.8)' }, plate()), s('g', { transform: 'translate(195 546) scale(0.5)' }, ribbon()));
    items.append(s('g', { transform: 'translate(262 632) scale(0.8)' }, fruitBowl()));
    const people = s('g', {});
    L.append(people);

    const mel = makePerson(ctx, 'mel', { x: 160, y: 712, scale: 1, parent: people });
    const bela = makeBela(ctx, { x: 240, y: 718, scale: 0.75, parent: people });
    L.append(s('g', { transform: 'translate(318 730) scale(0.8)' }, dogBowl()));

    // pessoas espiando (meio escondidas atrás dos objetos)
    const actors = {};
    FAMILY.forEach((f) => {
      const a = makePerson(ctx, f.key, { x: f.hide.x, y: f.hide.y, scale: 0.8, parent: back });
      a.f = f;
      actors[f.key] = a;
      const hot = s('g', { class: 'hotspot', transform: `translate(${f.hide.x} ${f.hide.y - 60})`, 'data-testid': `call-${f.key}`, role: 'button', 'aria-label': `Chamar ${f.key}` },
        s('circle', { class: 'halo', r: 50, fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-dasharray': '10 8' }),
        s('circle', { r: 58, fill: 'transparent' }));
      a.hot = hot;
      L.append(hot);
      // espiadinha
      scope.loop((t) => {
        if (dbg.called.includes(f.key)) return;
        a.set({ x: f.hide.x + Math.sin(t / 500 + f.hide.x) * 6 });
        a.person.wave(Math.sin(t / 900 + f.hide.y) > 0.6);
      });
      scope.on(hot, 'pointerup', (e) => { e.stopPropagation(); call(a); });
    });

    let calling = false;
    async function call(a) {
      if (calling || dbg.called.includes(a.f.key)) return;
      calling = true;
      dbg.called.push(a.f.key);
      a.hot.remove();
      ctx.sfx('pop');
      // sai do esconderijo e vem para a toalha
      back.removeChild(a.el);
      people.append(a.el);
      a.person.wave(true);
      const from = { x: a.x, y: a.y };
      await scope.tween(900, (k) => {
        a.x = from.x + (a.f.seat.x - from.x) * k;
        a.y = from.y + (a.f.seat.y - from.y) * k - Math.sin(k * Math.PI) * 30;
        a.scale = 0.8 + 0.2 * k;
        a.apply();
      }, ease.inOut);
      ctx.sfx('found');
      a.person.wave(false);
      a.person.cheer(true);
      bela.bela.setState('excited');
      if (a.f.key === 'mamae') front.append(s('g', { transform: 'translate(140 584) scale(0.9)' }, cake()));
      await ctx.sayWait(a.f.line);
      a.person.cheer(false);
      bela.bela.setState('wait');
      calling = false;
      if (dbg.called.length === FAMILY.length) celebrate();
    }

    async function celebrate() {
      dbg.phase = 'celebrate';
      // primos chegam
      for (let i = 0; i < COUSINS.length; i++) {
        const fromX = i % 2 ? 450 : -60;
        const c = makePerson(ctx, null, { cfg: COUSINS[i], x: fromX, y: 560, scale: 0.85, parent: people });
        const toX = i % 2 ? 250 : 140;
        scope.tween(900, (k) => { c.x = fromX + (toX - fromX) * k; c.apply(); }, ease.out).then(() => c.person.cheer(true));
      }
      mel.person.cheer(true);
      await runTo(ctx, bela, 230, 712, { speed: 200, after: 'excited' });
      ctx.sfx('barks');
      for (let i = 0; i < 3; i++) { ctx.burst(80 + i * 115, 400, { n: 8, spread: 80 }); ctx.sfx('sparkle'); await scope.wait(350); }
      dbg.phase = 'photo';
      await ctx.sayWait('picnic.photo', null, { asInstruction: true });
      const row = h('div', { class: 'row', style: 'top: calc(84px + var(--safe-t))' });
      ctx.ui.append(row);
      ctx.button({ icon: 'frame', label: 'Guardar a lembrança', cls: 'big pulse', parent: row, onTap: takePhoto });
      ctx.setHint(() => ctx.say('picnic.photo'));
    }

    async function takePhoto() {
      const flash = h('div', { style: { position: 'absolute', inset: 0, background: '#fff', opacity: 1, transition: 'opacity 0.6s', pointerEvents: 'none' } });
      ctx.ui.append(flash);
      ctx.sfx('shutter');
      requestAnimationFrame(() => requestAnimationFrame(() => { flash.style.opacity = 0; }));
      const { state, rewards, memory } = completePicnic(ctx.state, { date: new Date().toISOString(), members: FAMILY.map((f) => f.key) });
      ctx.setState(state);
      dbg.phase = 'saved';
      await scope.wait(700);
      await ctx.sayWait('picnic.saved');
      ctx.go('done', { activity: 'picnic', rewards, memory });
    }

    ctx.setHint(() => {
      const next = FAMILY.find((f) => !dbg.called.includes(f.key));
      if (next) ctx.showHand({ x: next.hide.x + 10, y: next.hide.y - 50 });
      ctx.say('picnic.call');
    });
    ctx.idle(12000, () => {
      const next = FAMILY.find((f) => !dbg.called.includes(f.key));
      if (next && dbg.phase === 'call') ctx.showHand({ x: next.hide.x + 10, y: next.hide.y - 50 });
    });

    (async () => {
      bela.bela.setState('excited');
      ctx.sfx('bark');
      await scope.wait(500);
      bela.bela.setState('wait');
      ctx.instruct('picnic.call');
    })();
  },
};
