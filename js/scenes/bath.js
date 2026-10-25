// "Operação Patinha Limpinha": esponja → chuveirinho → sacudida (limpar a tela) → toalha
// (com esconde-esconde) → bandana. Gestos amplos; o progresso segue as regiões realmente limpas.
import { s, h, Actor } from '../engine/svg.js';
import { ease, gameNow } from '../engine/clock.js';
import { completeActivity, setBandana } from '../logic/state.js';
import { makeRegions, scrub, isDone, progress, remaining } from '../logic/coverage.js';
import { BANDANAS } from '../config.js';
import { backdrop, grassTufts, flowerPatch, bushAt } from '../art/scenery.js';
import { tub, sponge, shower, towel, mudBlob, bubble, droplet, bandanaSwatch, PAL } from '../art/items.js';
import { makeBela, makePerson } from './common.js';

const BX = 176;
const BY = 604;
const S = 1.9;
const toStage = (lx, ly) => ({ x: BX + lx * S, y: BY + ly * S });

const MUD = [[-24, -60, 13], [12, -64, 11], [-38, -40, 11], [32, -42, 10], [46, -104, 9], [-4, -36, 10]];
const WET = [[44, -86, 26], [-18, -58, 26], [24, -48, 22], [-48, -82, 16], [62, -70, 16]];

export default {
  name: 'bath',
  enter(ctx) {
    const { scope, layer: L, rng } = ctx;
    const dbg = { step: 'intro', history: [] };
    const setStep = (st) => { dbg.step = st; dbg.history.push(st); };
    window.__game.bath = dbg;

    // ---------- cenário: cantinho do banho no quintal ----------
    L.append(backdrop({ horizon: 260 }));
    L.append(s('rect', { x: -700, y: 470, width: 1790, height: 1000, fill: '#F7E3C6' }));
    for (let x = -700; x < 1100; x += 60) L.append(s('path', { d: `M${x} 470 L${x} 1470`, stroke: '#EBCFA8', 'stroke-width': 3 }));
    for (let y = 530; y < 1470; y += 60) L.append(s('path', { d: `M-700 ${y} L1090 ${y}`, stroke: '#EBCFA8', 'stroke-width': 3 }));
    L.append(s('rect', { x: -700, y: 462, width: 1790, height: 14, fill: '#E8C9A0' }));
    L.append(bushAt(30, 290, 110), bushAt(360, 296, 120), flowerPatch(90, 300), grassTufts([[200, 290], [260, 300]]));
    // varal (usado na escolha da bandana)
    const line = s('g', { opacity: 0 },
      s('rect', { x: 18, y: 150, width: 8, height: 120, rx: 4, fill: PAL.wood, stroke: PAL.brown, 'stroke-width': 2.5 }),
      s('rect', { x: 364, y: 150, width: 8, height: 120, rx: 4, fill: PAL.wood, stroke: PAL.brown, 'stroke-width': 2.5 }),
      s('path', { d: 'M22 160 Q195 190 368 160', fill: 'none', stroke: PAL.brown, 'stroke-width': 3 }));
    L.append(line);

    // ---------- Bela na banheira ----------
    const bela = makeBela(ctx, { x: BX, y: BY, scale: S });
    const B = bela.bela;
    L.append(s('g', { transform: 'translate(195 662)' }, tub(330)));
    const fxTop = s('g', {});
    const toolLayer = s('g', {});
    L.append(fxTop, toolLayer);

    // barro
    const mud = makeRegions(MUD.map(([x, y, r], i) => ({ id: i, ...toStage(x, y), r: r * S, need: 60 })));
    const mudEls = MUD.map(([x, y, r]) => { const g = s('g', { transform: `translate(${x} ${y})` }, mudBlob(r)); B.mud.append(g); return g; });
    // espuma (aparece onde o barro sai)
    const foam = makeRegions(MUD.map(([x, y, r], i) => ({ id: i, ...toStage(x, y), r: (r + 6) * S, need: 45, amount: 0 })));
    const foamEls = MUD.map(([x, y]) => { const g = s('g', { transform: `translate(${x} ${y})`, opacity: 0 }); B.foam.append(g); return g; });
    // pelo molhado
    const wet = makeRegions(WET.map(([x, y, r], i) => ({ id: i, ...toStage(x, y), r: r * S, need: 55, amount: 0 })));
    const wetEls = WET.map(([x, y]) => {
      const g = s('g', { transform: `translate(${x} ${y})`, opacity: 0 },
        s('g', { transform: 'translate(-6 4) scale(0.7)' }, droplet(5)), s('g', { transform: 'translate(8 -4) scale(0.6)' }, droplet(5)), s('g', { transform: 'translate(2 12) scale(0.5)' }, droplet(5)));
      B.wet.append(g);
      return g;
    });

    // ---------- ferramenta ----------
    const HOME = { x: 330, y: 726 };
    const tray = s('g', { transform: `translate(${HOME.x} ${HOME.y + 34})` }, s('ellipse', { rx: 50, ry: 12, fill: '#FFF6E6', stroke: PAL.brown, 'stroke-width': 3 }));
    toolLayer.append(tray);
    const tool = new Actor(s('g', {}), { x: HOME.x, y: HOME.y, scale: 1.25 });
    toolLayer.append(tool.el);
    const setTool = (art) => { tool.inner.replaceChildren(art); tool.set({ x: HOME.x, y: HOME.y, opacity: 1 }); };

    let mode = null; // 'mud' | 'rinse' | 'dry' | 'wipe' | null
    let drag = null;
    let stepStart = 0;

    const toolHome = () => scope.tween(250, (k) => tool.set({ x: tool.x + (HOME.x - tool.x) * k, y: tool.y + (HOME.y - tool.y) * k }));

    function scrubAt(p, len) {
      if (mode === 'mud') {
        const changed = scrub(mud, p.x, p.y, len, 34);
        if (changed.length) {
          ctx.sfx('rub');
          B.setState('pet');
        }
        changed.forEach((r) => {
          mudEls[r.id].setAttribute('opacity', r.amount.toFixed(2));
          const f = foam[r.id];
          f.amount = Math.max(f.amount, 1 - r.amount);
          if (foamEls[r.id].childElementCount < 4 && rng.next() < 0.25) {
            foamEls[r.id].append(s('g', { transform: `translate(${(rng.next() - 0.5) * 30} ${(rng.next() - 0.5) * 24})` }, bubble(5 + rng.next() * 6)));
            ctx.sfx('bubble');
          }
          foamEls[r.id].setAttribute('opacity', '1');
          if (r.amount === 0 && !r.sparkled) { r.sparkled = true; ctx.sfx('sparkle'); ctx.burst(r.x, r.y, { parent: fxTop, n: 5, spread: 40 }); }
        });
      } else if (mode === 'rinse') {
        ctx.sfx('water');
        if (rng.next() < 0.5) dropFromTool();
        scrub(foam, p.x, p.y, len, 40).forEach((r) => {
          foamEls[r.id].setAttribute('opacity', r.amount.toFixed(2));
          if (r.amount === 0) ctx.sfx('bubble');
        });
      } else if (mode === 'dry') {
        const ch = scrub(wet, p.x, p.y, len, 40);
        if (ch.length) { ctx.sfx('rub'); B.setState('pet'); }
        ch.forEach((r) => wetEls[r.id].setAttribute('opacity', r.amount.toFixed(2)));
      }
    }

    function dropFromTool() {
      const d = s('g', {}, droplet(4));
      fxTop.append(d);
      const x0 = tool.x - 14 + rng.next() * 16;
      const y0 = tool.y + 4;
      scope.tween(380, (k) => { d.setAttribute('transform', `translate(${x0 - 10 * k} ${y0 + 70 * k})`); d.style.opacity = 1 - k; }, ease.in).then(() => d.remove());
    }

    scope.on(ctx.svg, 'pointerdown', (e) => {
      if (mode === 'wipe') { wipeAt(e.clientX, e.clientY); return; }
      if (!['mud', 'rinse', 'dry'].includes(mode) || drag) return;
      const p = ctx.toSvg(e);
      drag = { id: e.pointerId, last: p };
      try { ctx.svg.setPointerCapture(e.pointerId); } catch { /* ok */ }
      tool.set({ x: p.x, y: p.y });
    });
    scope.on(ctx.svg, 'pointermove', (e) => {
      if (mode === 'wipe') { if (e.buttons || e.pointerType !== 'mouse') wipeAt(e.clientX, e.clientY); return; }
      if (!drag || e.pointerId !== drag.id || !['mud', 'rinse', 'dry'].includes(mode)) return;
      const p = ctx.toSvg(e);
      const len = Math.hypot(p.x - drag.last.x, p.y - drag.last.y);
      // subdivide movimentos rápidos para não "pular" regiões
      const steps = Math.max(1, Math.ceil(len / 14));
      for (let i = 1; i <= steps; i++) {
        scrubAt({ x: drag.last.x + ((p.x - drag.last.x) * i) / steps, y: drag.last.y + ((p.y - drag.last.y) * i) / steps }, len / steps);
      }
      drag.last = p;
      tool.set({ x: p.x, y: p.y, rot: Math.sin(gameNow() / 80) * 8 });
    });
    const endDrag = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      if (B.state === 'pet') B.setState('wait');
      toolHome();
    };
    scope.on(ctx.svg, 'pointerup', endDrag);
    scope.on(ctx.svg, 'pointercancel', endDrag);

    // ---------- espera de etapa com ajuda automática ----------
    async function untilDone(regions, { helpLine = 'bath.help' } = {}) {
      stepStart = gameNow();
      let helped = false;
      while (!isDone(regions)) {
        await scope.wait(200);
        const el = gameNow() - stepStart;
        if (!helped && ((el > 40000 && progress(regions) >= 0.4) || el > 65000)) {
          helped = true;
          await lauraHelps(regions, helpLine);
        }
      }
    }

    async function lauraHelps(regions, line) {
      const laura = makePerson(ctx, 'laura', { x: -60, y: 760, scale: 0.9, parent: fxTop });
      await scope.tween(600, (k) => laura.set({ x: -60 + 110 * k }), ease.out);
      laura.person.wave(true);
      ctx.say(line);
      for (const r of remaining(regions)) {
        await scope.tween(350, (k) => { r.amount = Math.max(0, r.amount * (1 - k)); refreshAll(); });
        r.amount = 0;
        ctx.burst(r.x, r.y, { parent: fxTop, n: 4, spread: 30 });
        ctx.sfx('sparkle');
      }
      refreshAll();
      await scope.wait(600);
      await scope.tween(500, (k) => laura.set({ x: 50 - 120 * k }), ease.in);
      laura.el.remove();
    }

    function refreshAll() {
      mud.forEach((r) => mudEls[r.id].setAttribute('opacity', r.amount.toFixed(2)));
      if (mode !== 'mud') foam.forEach((r) => foamEls[r.id].setAttribute('opacity', r.amount.toFixed(2)));
      wet.forEach((r) => wetEls[r.id].setAttribute('opacity', r.amount.toFixed(2)));
    }

    // dica: a mão "esfrega" na região que falta, que também pulsa
    const regionHint = (regions) => {
      const r = remaining(regions)[0];
      if (!r) return null;
      return ctx.showHand({ x: r.x - 40, y: r.y + 10 }, { x: r.x + 40, y: r.y - 6 }, { times: 1 });
    };
    let hintFn = () => null;
    ctx.setHint(() => { if (dbg.instruction) ctx.instruct(dbg.instruction); hintFn(); });
    ctx.idle(10000, () => hintFn());

    // ---------- respingos na tela ----------
    let drops = [];
    function spawnDrops() {
      const w = window.innerWidth;
      const hgt = window.innerHeight;
      const n = 7;
      for (let i = 0; i < n; i++) {
        const x = 50 + rng.next() * (w - 100);
        const y = 110 + rng.next() * (hgt - 220);
        const el = h('div', { class: 'splash-drop', style: { left: `${x}px`, top: `${y}px` } });
        ctx.fx.append(el);
        drops.push({ x, y, el });
      }
    }
    function wipeAt(cx, cy) {
      drops = drops.filter((d) => {
        if (Math.hypot(d.x - cx, d.y - cy) < 60) {
          d.el.classList.add('gone');
          setTimeout(() => d.el.remove(), 300);
          ctx.sfx('wipe');
          return false;
        }
        return true;
      });
    }
    dbg.drops = () => drops.map((d) => ({ x: d.x, y: d.y }));
    dbg.regions = () => {
      const map = { mud, rinse: foam, dry: wet };
      return remaining(map[mode] || []).map((r) => ({ x: r.x, y: r.y }));
    };

    // ---------- toalha de esconde-esconde ----------
    async function hideAndSeek() {
      mode = null;
      drag = null;
      toolHome();
      tool.set({ opacity: 0 });
      const drape = new Actor(s('g', { class: 'hotspot', 'data-testid': 'drape' },
        s('path', { d: 'M-130 -150 Q0 -190 130 -150 L150 30 Q0 50 -110 30 Z', fill: '#FF9FB0', stroke: PAL.brown, 'stroke-width': 4, 'stroke-linejoin': 'round' }),
        s('path', { d: 'M-118 0 Q0 18 140 0', fill: 'none', stroke: '#fff', 'stroke-width': 7, opacity: 0.8 }),
        s('path', { d: 'M-122 -20 Q0 -4 142 -20', fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: 0.6 })), { x: 236, y: 140 });
      fxTop.append(drape.el);
      ctx.sfx('whoosh');
      await scope.tween(500, (k) => drape.set({ y: 140 + (520 - 140) * k }), ease.out);
      B.setState('wait');
      dbg.drape = { x: 236, y: 440 };
      setStep('hide');
      dbg.instruction = 'bath.hide';
      ctx.instruct('bath.hide');
      hintFn = () => ctx.showHand({ x: 236, y: 450 });
      await new Promise((resolve) => {
        let tapped = false;
        const shownAt = gameNow();
        scope.on(drape.el, 'pointerup', (e) => {
          e.stopPropagation();
          if (tapped || gameNow() - shownAt < 700) return; // deixa a surpresa aparecer antes
          tapped = true;
          resolve();
        });
      });
      ctx.sfx('giggle');
      await scope.tween(350, (k) => drape.set({ x: 236 - 90 * k, rot: -8 * k }), ease.out);
      B.setState('excited');
      ctx.say('bath.peek');
      ctx.burst(BX + 86 * S, BY - 80 * S, { parent: fxTop, n: 6, spread: 40 });
      await scope.wait(1100);
      await scope.tween(500, (k) => drape.set({ x: 146 - 300 * k, y: 520 + 100 * k, rot: -8 - 20 * k }), ease.in);
      drape.el.remove();
      wet.forEach((r) => { r.amount *= 0.5; if (r.amount < 0.18) r.amount = 0; });
      refreshAll();
      tool.set({ opacity: 1 });
    }

    // ---------- bandana ----------
    async function chooseBandana() {
      mode = null;
      tool.set({ opacity: 0 });
      tray.style.opacity = 0;
      await scope.tween(400, (k) => line.setAttribute('opacity', k));
      const unlocked = BANDANAS.filter((b) => ctx.state.unlocked.bandanas.includes(b.id));
      const xs = unlocked.length <= 3 ? [110, 195, 280] : [62, 129, 195, 261, 328].slice(0, unlocked.length);
      dbg.bandanas = [];
      let chosen = null;
      let doneBtn = null;
      const row = h('div', { class: 'row', style: 'bottom: calc(26px + var(--safe-b))' });
      ctx.ui.append(row);
      unlocked.forEach((b, i) => {
        const x = xs[i];
        const y = 186 + Math.sin((x / 390) * Math.PI) * 12;
        const g = s('g', { class: 'hotspot', transform: `translate(${x} ${y})`, 'data-testid': `bandana-${b.id}` },
          s('circle', { cx: 0, cy: -6, r: 4, fill: PAL.wood, stroke: PAL.brown, 'stroke-width': 2 }),
          s('g', { transform: 'translate(0 14) scale(0.95)' }, bandanaSwatch(b)),
          s('circle', { r: 38, cy: 14, fill: 'transparent' }));
        line.append(g);
        dbg.bandanas.push({ id: b.id, x, y: y + 14 });
        scope.on(g, 'pointerup', (e) => {
          e.stopPropagation();
          chosen = b.id;
          B.setBandana(b.id);
          B.setState('excited');
          ctx.sfx('sparkle');
          ctx.burst(BX + 30 * S, BY - 56 * S, { parent: fxTop, n: 6, spread: 50 });
          if (!doneBtn) {
            doneBtn = ctx.button({ icon: 'check', label: 'Pronto', cls: 'mid green pulse', parent: row, onTap: () => finish() });
          }
        });
      });
      hintFn = () => ctx.showHand({ x: xs[0] + 6, y: 210 });
      setStep('bandana');
      dbg.instruction = 'bath.bandana';
      ctx.instruct('bath.bandana');
      let finishing = false;
      async function finish() {
        if (finishing || !chosen) return;
        finishing = true;
        ctx.setState(setBandana(ctx.state, chosen));
        await ctx.sayWait('bath.done');
        const { state, rewards } = completeActivity(ctx.state, 'bath');
        ctx.setState(state);
        ctx.go('done', { activity: 'bath', rewards });
      }
      dbg.finish = finish;
    }

    // ---------- roteiro ----------
    (async () => {
      B.setState('excited');
      ctx.sfx('bark');
      await scope.wait(500);
      B.setState('wait');
      // 1. esponja
      setTool(sponge());
      mode = 'mud';
      setStep('mud');
      dbg.instruction = 'bath.intro';
      hintFn = () => regionHint(mud);
      ctx.instruct('bath.intro');
      if (ctx.state.plays.bath === 0) regionHint(mud);
      await untilDone(mud);
      ctx.sfx('found');
      B.setState('excited');
      await scope.wait(700);
      // 2. enxágue
      foam.forEach((r) => { r.amount = Math.max(r.amount, 1); });
      foamEls.forEach((g) => {
        if (g.childElementCount < 2) g.append(s('g', {}, bubble(9)), s('g', { transform: 'translate(12 -6)' }, bubble(6)));
        g.setAttribute('opacity', 1);
      });
      setTool(shower());
      mode = 'rinse';
      setStep('rinse');
      dbg.instruction = 'bath.rinse';
      hintFn = () => regionHint(foam);
      B.setState('wait');
      ctx.instruct('bath.rinse');
      await untilDone(foam);
      // 3. a Bela se sacode e molha a tela
      mode = null;
      drag = null;
      toolHome();
      wet.forEach((r) => { r.amount = 1; });
      refreshAll();
      await scope.wait(300);
      B.setState('shake');
      ctx.sfx('splash');
      await scope.wait(900);
      spawnDrops();
      B.setState('excited');
      mode = 'wipe';
      setStep('wipe');
      dbg.instruction = 'bath.shake';
      ctx.instruct('bath.shake');
      hintFn = () => {
        const d = drops[0];
        if (!d) return null;
        const p1 = ctx.toSvg({ clientX: d.x - 50, clientY: d.y });
        const p2 = ctx.toSvg({ clientX: d.x + 50, clientY: d.y });
        return ctx.showHand(p1, p2, { times: 1 });
      };
      const wipeStart = gameNow();
      while (drops.length) {
        await scope.wait(200);
        if (gameNow() - wipeStart > 25000) {
          drops.forEach((d) => d.el.classList.add('gone'));
          drops = [];
        }
      }
      await scope.wait(300);
      ctx.fx.replaceChildren();
      // 4. toalha
      B.setState('wait');
      setTool(towel());
      mode = 'dry';
      setStep('dry');
      dbg.instruction = 'bath.dry';
      hintFn = () => regionHint(wet);
      ctx.instruct('bath.dry');
      stepStart = gameNow();
      while (progress(wet) < 0.45) await scope.wait(150);
      await hideAndSeek();
      mode = 'dry';
      setStep('dry');
      dbg.instruction = 'bath.dry';
      hintFn = () => regionHint(wet);
      await untilDone(wet);
      B.setState('excited');
      ctx.sfx('found');
      await scope.wait(500);
      // 5. bandana
      await chooseBandana();
    })();
  },
};
