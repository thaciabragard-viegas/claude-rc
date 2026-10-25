// "Detetives das Patinhas": tocar em esconderijos grandes para achar as coisas do piquenique.
// Fase 1: 1 objeto/2 lugares. Fase 2: 2 objetos/3–4 lugares. Fase 3: seguir pegadas.
import { s, Actor } from '../engine/svg.js';
import { ease } from '../engine/clock.js';
import { completeActivity } from '../logic/state.js';
import { generateSession, nextTarget, isStageDone } from '../logic/hunt.js';
import { makeBag } from '../logic/rng.js';
import { ITEM_NAMES, SPOT_NAMES } from '../config.js';
import { backdrop, grassTufts, flowerPatch, treeAt } from '../art/scenery.js';
import { hidingSpot, huntItem, critter, basket, pawprint, fence, PAL } from '../art/items.js';
import { makeBela, makePerson, runTo } from './common.js';

const BASKET = { x: 322, y: 716 };
const BELA_HOME = { x: 78, y: 716 };
const HELPERS = ['laura', 'mamae', 'teteu'];

export default {
  name: 'hunt',
  enter(ctx) {
    const { scope, layer: L, rng } = ctx;
    const stages = generateSession(rng);
    const dbg = { stage: 0, spots: [], found: [], phase: 'intro' };
    window.__game.hunt = dbg;

    // ---------- cenário ----------
    L.append(backdrop({ horizon: 236 }));
    L.append(s('g', { transform: 'translate(70 252)' }, fence(200)), s('g', { transform: 'translate(320 252)' }, fence(200)));
    L.append(treeAt(195, 240, 0.7), grassTufts([[40, 640], [350, 610], [195, 640], [30, 300], [370, 420]]),
      flowerPatch(40, 470), flowerPatch(352, 450, ['#B79CE8', '#FFD45C', '#FF9FB0']), flowerPatch(195, 300, ['#FF9FB0', '#FFD45C', '#FF7F6B']));
    const groundFx = s('g', {});
    const spotsG = s('g', {});
    const top = s('g', {});
    L.append(groundFx, spotsG);

    // cesta onde os achados ficam
    const bk = new Actor(basket({ w: 96 }), { x: BASKET.x, y: BASKET.y });
    L.append(bk.el);
    const inBasket = s('g', {});
    L.append(inBasket);

    const bela = makeBela(ctx, { x: BELA_HOME.x, y: BELA_HOME.y, scale: 0.7 });
    bela.el.classList.add('hotspot');
    bela.el.setAttribute('aria-label', 'Bela: farejar');
    L.append(top);

    // lista visual dos objetos procurados
    const list = s('g', {});
    top.append(list);
    let cards = {};
    function drawList(items) {
      list.replaceChildren();
      cards = {};
      const gap = 78;
      const x0 = 195 - ((items.length - 1) * gap) / 2;
      items.forEach((it, i) => {
        const shape = huntItem(it, 0.9);
        const g = s('g', { transform: `translate(${x0 + i * gap} 132)` },
          s('circle', { r: 32, fill: '#FFF6E6', stroke: PAL.brown, 'stroke-width': 3 }),
          s('g', { class: 'card-shape', opacity: 0.35, style: 'filter: grayscale(1)' }, shape),
          s('g', { class: 'card-check', opacity: 0, transform: 'translate(22 22)' },
            s('circle', { r: 11, fill: '#8CCB7E', stroke: PAL.brown, 'stroke-width': 2.5 }),
            s('path', { d: 'M-5 0 L-1 4 L6 -4', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' })));
        list.append(g);
        cards[it] = g;
      });
    }
    function markCard(it) {
      const g = cards[it];
      if (!g) return;
      const shape = g.querySelector('.card-shape');
      shape.setAttribute('opacity', 1);
      shape.style.filter = '';
      g.querySelector('.card-check').setAttribute('opacity', 1);
      const [x, y] = g.getAttribute('transform').match(/[-\d.]+/g).map(Number);
      ctx.burst(x, y, { parent: top, n: 6, spread: 40 });
    }

    // ---------- estado da fase ----------
    let stage = null;
    let opened = [];
    let found = [];
    let emptyStreak = 0;
    let busy = false;
    let spotEls = {};
    const emptyLines = makeBag(['butterfly', 'ladybug', 'bird', 'leaves', 'snail'], rng);

    function buildStage(st) {
      spotsG.replaceChildren();
      groundFx.replaceChildren();
      spotEls = {};
      // de trás para frente, para a sobreposição ficar natural
      st.spots.slice().sort((a, b) => a.y - b.y).forEach((sp) => {
        const art = s('g', { class: 'spot-art' }, hidingSpot(sp.type));
        const halo = s('ellipse', { class: 'halo', cx: 0, cy: 4, rx: 74, ry: 22, fill: '#FFF6E6', opacity: 0.55, stroke: '#fff', 'stroke-width': 4 });
        const g = s('g', { class: 'hotspot', transform: `translate(${sp.x} ${sp.y})`, 'data-testid': `hide-${sp.type}`, role: 'button', 'aria-label': `Procurar perto ${SPOT_NAMES[sp.type]}` },
          halo, art, s('rect', { x: -72, y: -120, width: 144, height: 134, fill: 'transparent' }));
        spotsG.append(g);
        spotEls[sp.id] = { g, art, halo, sp };
        scope.on(g, 'pointerup', (e) => { e.stopPropagation(); openSpot(sp); });
      });
      dbg.spots = st.spots.map((sp) => ({ id: sp.id, type: sp.type, x: sp.x, y: sp.y - 40, item: sp.item }));
    }

    async function openSpot(sp) {
      if (busy || !stage) return;
      const el = spotEls[sp.id];
      if (opened.includes(sp.id)) {
        // já olhado: só um balancinho, sem repetir a fala
        el.art.classList.remove('wiggle');
        void el.art.getBBox();
        el.art.classList.add('wiggle');
        ctx.sfx('rustle');
        return;
      }
      busy = true;
      opened.push(sp.id);
      el.halo.style.display = 'none';
      el.g.classList.remove('glow-soft');
      el.art.classList.add('wiggle');
      if (sp.type === 'caixa') { el.art.querySelector('.cbox')?.classList.add('open'); ctx.sfx('creak'); } else ctx.sfx('rustle');
      await scope.wait(450);
      if (sp.item) {
        emptyStreak = 0;
        await revealItem(sp);
      } else {
        emptyStreak++;
        await revealCritter(sp);
        el.g.classList.add('spot-visited');
        if (emptyStreak >= 2 && !stage.trail) clue();
      }
      busy = false;
      if (isStageDone(stage, found)) stageDone();
    }

    async function revealItem(sp) {
      const it = sp.item;
      const a = new Actor(huntItem(it, 1.2), { x: sp.x, y: sp.y - 30, scale: 0.1 });
      top.append(a.el);
      ctx.sfx('pop');
      bela.bela.setState('excited');
      await scope.tween(450, (k) => a.set({ y: sp.y - 30 - 70 * k, scale: 0.1 + 1.1 * k }), ease.back);
      ctx.sfx('found');
      found.push(it);
      dbg.found = found.slice();
      markCard(it);
      ctx.say('hunt.found', { item: ITEM_NAMES[it] });
      await scope.wait(500);
      // voa para a cesta
      const from = { x: a.x, y: a.y };
      const slot = inBasket.childElementCount;
      const to = { x: BASKET.x - 22 + (slot % 3) * 22, y: BASKET.y - 58 - Math.floor(slot / 3) * 10 };
      await scope.tween(700, (k) => a.set({ x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k - 120 * k * (1 - k), scale: 1.2 - 0.6 * k }), ease.inOut);
      a.el.remove();
      inBasket.append(s('g', { transform: `translate(${to.x} ${to.y}) scale(0.6)` }, huntItem(it, 1)));
      bk.inner.classList.remove('wiggle');
      void bk.inner.getBBox();
      bk.inner.classList.add('wiggle');
      ctx.sfx('bounce');
      bela.bela.setState('wait');
    }

    async function revealCritter(sp) {
      const kind = sp.critter || emptyLines();
      const a = new Actor(critter(kind), { x: sp.x, y: sp.y - 40, scale: 0.2 });
      top.append(a.el);
      ctx.sfx(kind === 'bird' ? 'chirp' : kind === 'butterfly' ? 'flutter' : 'pop');
      ctx.say(`hunt.empty.${kind}`);
      bela.bela.setState('curious');
      bela.bela.look(sp.x - bela.x, sp.y - bela.y);
      await scope.tween(350, (k) => a.set({ scale: 0.2 + 1.2 * k, y: sp.y - 40 - 30 * k }), ease.back);
      if (kind === 'butterfly' || kind === 'bird') {
        const dir = sp.x < 195 ? -1 : 1;
        await scope.tween(1300, (k) => a.set({ x: sp.x + dir * 160 * k, y: sp.y - 70 - 160 * k + Math.sin(k * 12) * 12 }), ease.in);
        a.el.remove();
      } else {
        await scope.wait(900);
        await scope.tween(400, (k) => { a.opacity = 1 - k; a.apply(); });
        a.el.remove();
      }
      bela.bela.setState('wait');
    }

    // ---------- ajudas ----------
    async function sniff() {
      if (busy || !stage) return;
      const target = nextTarget(stage, opened);
      if (!target) return;
      busy = true;
      bela.bela.setState('sniff');
      ctx.sfx('sniff');
      await scope.wait(900);
      bela.flip = target.x < bela.x ? -1 : 1;
      bela.apply();
      bela.bela.setState('curious');
      ctx.say('hunt.sniff');
      // rastro de cheirinho apontando a direção
      const nose = { x: bela.x + 60 * bela.flip * bela.scale, y: bela.y - 60 };
      const mid = { x: (nose.x + target.x) / 2, y: (nose.y + target.y) / 2 - 40 };
      const trail = s('path', { d: `M${nose.x} ${nose.y} Q${mid.x} ${mid.y} ${target.x} ${target.y - 40}`, fill: 'none', stroke: '#FFF6E6', 'stroke-width': 7, 'stroke-dasharray': '3 16', 'stroke-linecap': 'round', opacity: 0 });
      top.append(trail);
      await scope.tween(400, (k) => trail.setAttribute('opacity', k * 0.95));
      spotEls[target.id].g.classList.add('glow-soft');
      await scope.wait(1500);
      await scope.tween(500, (k) => trail.setAttribute('opacity', 0.95 * (1 - k)));
      trail.remove();
      bela.bela.setState('wait');
      busy = false;
    }
    scope.on(bela.el, 'pointerup', (e) => { e.stopPropagation(); sniff(); });

    let helperBusy = false;
    async function clue() {
      if (helperBusy || !stage) return;
      const target = nextTarget(stage, opened);
      if (!target) return;
      helperBusy = true;
      emptyStreak = 0;
      const who = HELPERS[dbg.stage % HELPERS.length];
      const p = makePerson(ctx, who, { x: -60, y: 790, scale: 0.8, parent: top });
      await scope.tween(500, (k) => p.set({ x: -60 + 100 * k }), ease.out);
      p.person.wave(true);
      spotEls[target.id].g.classList.add('glow-soft');
      await ctx.sayWait('hunt.clue', { spot: SPOT_NAMES[target.type] }, { who });
      p.person.wave(false);
      await scope.tween(500, (k) => p.set({ x: 40 - 110 * k }), ease.in);
      p.el.remove();
      helperBusy = false;
    }

    function handOnTarget() {
      const t = stage && nextTarget(stage, opened);
      if (!t) return null;
      return ctx.showHand({ x: t.x + 10, y: t.y - 30 });
    }
    ctx.setHint(() => {
      if (!stage) return;
      if (dbg.instruction) ctx.instruct(dbg.instruction);
      if (stage.trail) handOnTarget(); else clue();
    });
    ctx.idle(13000, () => { if (stage) { if (stage.trail) handOnTarget(); else clue(); } });

    async function drawTrail(target) {
      const from = { x: BELA_HOME.x + 40, y: BELA_HOME.y - 10 };
      const to = { x: target.x, y: target.y + 16 };
      const n = 9;
      for (let i = 0; i < n; i++) {
        const k = (i + 1) / (n + 1);
        const x = from.x + (to.x - from.x) * k + Math.sin(k * Math.PI * 2) * 26;
        const y = from.y + (to.y - from.y) * k;
        const ang = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI + 90;
        groundFx.append(s('g', { transform: `translate(${x + (i % 2 ? 7 : -7)} ${y}) rotate(${ang})`, opacity: 0.85 }, pawprint(0.85, '#9A6B43')));
        ctx.sfx('step');
        await scope.wait(160);
      }
    }

    // ---------- fluxo ----------
    let stageResolve = null;
    function stageDone() {
      if (stageResolve) { const r = stageResolve; stageResolve = null; r(); }
    }

    (async () => {
      bela.bela.setState('excited');
      ctx.sfx('bark');
      await scope.wait(500);
      bela.bela.setState('wait');
      const intros = ['hunt.intro', 'hunt.two', 'hunt.trail'];
      for (let i = 0; i < stages.length; i++) {
        dbg.stage = i;
        stage = null;
        opened = [];
        found = [];
        emptyStreak = 0;
        const st = stages[i];
        drawList(st.items);
        buildStage(st);
        dbg.instruction = intros[i];
        if (st.trail) {
          ctx.instruct(intros[i]);
          await drawTrail(st.spots.find((sp) => sp.item));
        } else {
          ctx.instruct(intros[i]);
        }
        stage = st;
        dbg.phase = 'play';
        await new Promise((r) => { stageResolve = r; });
        stage = null;
        bela.bela.setState('excited');
        await scope.wait(900);
        bela.bela.setState('wait');
      }
      dbg.phase = 'done';
      await runTo(ctx, bela, BASKET.x - 80, BASKET.y, { speed: 300, after: 'excited' });
      await ctx.sayWait('hunt.done');
      const { state, rewards } = completeActivity(ctx.state, 'hunt');
      ctx.setState(state);
      ctx.go('done', { activity: 'hunt', rewards });
    })();
  },
};
