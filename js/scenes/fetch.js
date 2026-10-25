// "Bela, pega!": arrastar a bolinha (ou tocar na grama) para lançar; Bela busca e devolve.
// Três rodadas curtas: livre → (roda de flores | bola igual) → (rampinha | caminho pela caixa).
import { s, Actor, lerp } from '../engine/svg.js';
import { ease } from '../engine/clock.js';
import { completeActivity } from '../logic/state.js';
import { FIELD, START, throwTarget, dragPointFor, clampToField, dist, resolveLanding, depthScale, planRounds, BALLS, HOOPS } from '../logic/fetch.js';
import { backdrop, grassTufts, flowerPatch, treeAt, bushAt } from '../art/scenery.js';
import { ball as ballArt, sock, hoop as hoopArt, ramp as rampArt, box as boxArt, bush, fence, pawprint, cloud, PAL } from '../art/items.js';
import { makeBela, makePerson, runTo, depthSort } from './common.js';

export default {
  name: 'fetch',
  enter(ctx) {
    const { scope, layer: L, rng } = ctx;
    // ?rounds=free,match,box força as variações (usado nos testes automáticos)
    const forced = new URLSearchParams(location.search).get('rounds');
    const forceSock = new URLSearchParams(location.search).has('sock');
    const rounds = forced ? forced.split(',').filter((r) => ['free', 'hoop', 'match', 'ramp', 'box'].includes(r)) : planRounds(rng);
    const dbg = { rounds, round: 0, kind: rounds[0], accepting: false, phase: 'intro', goal: null, correct: null, openSide: null, choices: [] };
    window.__game.fetch = dbg;

    // ---------- cenário ----------
    L.append(backdrop({ horizon: 200 }));
    for (let i = 0; i < 6; i++) {
      const y0 = 200 + i * 100;
      L.append(s('rect', { x: -700, y: y0, width: 1790, height: 50, fill: '#B4DE98', opacity: 0.5 }));
    }
    L.append(treeAt(40, 214, 0.8), treeAt(350, 210, 0.7), bushAt(130, 212, 80), bushAt(260, 214, 70), bushAt(-30, 220, 90), bushAt(420, 220, 90),
      grassTufts([[60, 300], [330, 330], [30, 520], [360, 560], [80, 740], [310, 740]]), flowerPatch(30, 640), flowerPatch(362, 450, ['#B79CE8', '#FFD45C', '#FF9FB0']));
    const ground = s('g', {}); // coisas deitadas na grama (roda de flores, prévia)
    const world = s('g', {}); // objetos ordenados por profundidade
    const top = s('g', {}); // balões e pistas
    L.append(ground, world, top);

    // progresso da missão: três patinhas
    const paws = [0, 1, 2].map((i) => {
      const g = s('g', { transform: `translate(${296 + i * 30} 756)`, opacity: 0.3 }, s('circle', { r: 13, fill: '#FFF6E6', stroke: PAL.brown, 'stroke-width': 2.5 }), s('g', { transform: 'scale(0.75)' }, pawprint(1, PAL.coral)));
      top.append(g);
      return g;
    });

    // ---------- bolinha ----------
    const mkBall = (variant) => {
      const shadow = s('ellipse', { rx: 13, ry: 4.5, fill: '#4F6B33', opacity: 0.25 });
      const body = s('g', {}, ballArt(variant));
      const g = s('g', {}, shadow, body);
      const o = { g, body, shadow, x: START.x, y: START.y, z: 0, rot: 0, variant };
      o.render = () => {
        const k = depthScale(o.y);
        g.setAttribute('transform', `translate(${o.x.toFixed(1)} ${o.y.toFixed(1)}) scale(${k.toFixed(3)})`);
        body.setAttribute('transform', `translate(0 ${(-15 - o.z).toFixed(1)}) rotate(${o.rot.toFixed(0)})`);
        shadow.setAttribute('rx', (13 * Math.max(0.5, 1 - o.z / 300)).toFixed(1));
        g.dataset.y = o.y;
      };
      o.render();
      world.append(g);
      return o;
    };
    let ballObj = mkBall(BALLS[0]);

    // ---------- Bela ----------
    const BELA_HOME = { x: 92, y: 662 };
    const bela = makeBela(ctx, { x: BELA_HOME.x, y: BELA_HOME.y, scale: depthScale(BELA_HOME.y) * 0.85, parent: world });
    const scaleAt = (y) => depthScale(y) * 0.85;
    const syncBela = () => { bela.el.dataset.y = bela.y; };
    scope.loop(() => { syncBela(); depthSort(world); });

    // ---------- prévia do lançamento ----------
    const preview = s('g', { style: 'display:none', 'pointer-events': 'none' });
    const prevPath = s('path', { fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-dasharray': '2 12', 'stroke-linecap': 'round' });
    const prevRing = s('ellipse', { rx: 26, ry: 11, fill: '#FFF6E6', 'fill-opacity': 0.4, stroke: PAL.coral, 'stroke-width': 4 });
    preview.append(prevPath, prevRing);
    ground.append(preview);
    const showPreview = (target) => {
      preview.style.display = '';
      const mx = (ballObj.x + target.x) / 2;
      const my = Math.min(ballObj.y, target.y) - 60 - dist(ballObj, target) * 0.15;
      prevPath.setAttribute('d', `M${ballObj.x} ${ballObj.y - 15} Q${mx} ${my} ${target.x} ${target.y}`);
      prevRing.setAttribute('cx', target.x);
      prevRing.setAttribute('cy', target.y);
      const k = depthScale(target.y);
      prevRing.setAttribute('rx', 26 * k);
      prevRing.setAttribute('ry', 11 * k);
    };
    const hidePreview = () => { preview.style.display = 'none'; };

    // ---------- entrada de lançamento (arrastar ou tocar) ----------
    let throwResolve = null;
    const waitThrow = () => new Promise((res) => { throwResolve = res; dbg.accepting = true; });
    let drag = null;
    let ballTaps = 0;

    scope.on(ctx.svg, 'pointerdown', (e) => {
      if (!dbg.accepting || drag) return;
      const p = ctx.toSvg(e);
      if (dist(p, { x: ballObj.x, y: ballObj.y - 15 }) < 75) {
        drag = { id: e.pointerId, start: p, moved: 0, last: p };
        try { ctx.svg.setPointerCapture(e.pointerId); } catch { /* ok */ }
        bela.bela.setState('excited');
        ctx.sfx('tap');
      } else if (p.y > FIELD.minY - 40 && p.y < START.y - 40) {
        drag = { id: e.pointerId, start: p, moved: 0, last: p, tapField: true };
      }
    });
    scope.on(ctx.svg, 'pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = ctx.toSvg(e);
      drag.moved += dist(p, drag.last);
      drag.last = p;
      if (drag.tapField) return;
      if (dist(p, ballObj) > 22) {
        const t = throwTarget(ballObj, p);
        showPreview(t);
        bela.bela.look(t.x - bela.x, t.y - bela.y);
      }
    });
    const endDrag = (e, cancelled) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      hidePreview();
      if (cancelled || !dbg.accepting) { bela.bela.setState('wait'); return; }
      const p = ctx.toSvg(e);
      if (d.tapField) {
        if (d.moved < 30) fire(clampToField(p));
        return;
      }
      if (dist(p, ballObj) < 22) {
        // só tocou na bolinha: mostra como arrastar (e, na segunda vez, lembra da alternativa de tocar na grama)
        bela.bela.setState('wait');
        ballHop();
        ballTaps++;
        ctx.instruct(ballTaps >= 2 ? 'fetch.free.alt' : 'fetch.tap.ball');
        hint();
        return;
      }
      fire(throwTarget(ballObj, p));
    };
    scope.on(ctx.svg, 'pointerup', (e) => endDrag(e, false));
    scope.on(ctx.svg, 'pointercancel', (e) => endDrag(e, true));
    scope.on(ctx.svg, 'lostpointercapture', (e) => { if (drag && !drag.tapField && e.pointerId === drag.id) endDrag(e, true); });

    function fire(target) {
      if (!throwResolve) return;
      dbg.accepting = false;
      const r = throwResolve;
      throwResolve = null;
      r(target);
    }

    async function ballHop() {
      await scope.tween(300, (k) => { ballObj.z = 30 * 4 * k * (1 - k); ballObj.render(); });
      ctx.sfx('bounce');
    }

    // ---------- voo da bolinha ----------
    async function flyBall(to, { peak = null } = {}) {
      const from = { x: ballObj.x, y: ballObj.y };
      const d = dist(from, to);
      const h = peak ?? 70 + d * 0.3;
      ctx.sfx('whoosh');
      bela.bela.setState('excited');
      await scope.tween(600 + d * 0.9, (k) => {
        ballObj.x = lerp(from.x, to.x, k);
        ballObj.y = lerp(from.y, to.y, k);
        ballObj.z = 4 * h * k * (1 - k);
        ballObj.rot += 9;
        ballObj.render();
        bela.bela.look(ballObj.x - bela.x, ballObj.y - ballObj.z - (bela.y - 90));
      }, ease.linear);
      ctx.sfx('bounce');
      await scope.tween(320, (k) => { ballObj.z = 4 * 18 * k * (1 - k); ballObj.render(); }, ease.linear);
      ctx.sfx('bounce');
    }

    // ---------- Bela busca e devolve ----------
    let sockShown = false;
    let saidBack = false;
    async function fetchBack({ path = [], viaHop = null } = {}) {
      const target = { x: ballObj.x, y: ballObj.y };
      const approachX = (bx) => bx + (bela.x < bx ? -48 : 48) * scaleAt(target.y);
      for (const wp of path) await runTo(ctx, bela, wp.x, wp.y, { speed: 380, depth: scaleAt, after: null });
      if (viaHop) {
        await runTo(ctx, bela, viaHop.x, viaHop.y + 20, { speed: 380, depth: scaleAt, after: null });
        ctx.sfx('boing');
        await runTo(ctx, bela, viaHop.x, viaHop.y - 50, { speed: 300, depth: scaleAt, after: null, hop: 50 });
      }
      await runTo(ctx, bela, approachX(target.x), target.y + 4, { speed: 400, depth: scaleAt, after: 'fetch' });
      await scope.wait(380);
      const funny = !sockShown && dbg.round === 0 && (forceSock || rng.next() < 0.5);
      if (funny) {
        sockShown = true;
        bela.bela.carry(s('g', { transform: 'rotate(20)' }, sock()));
      } else {
        ballObj.g.style.display = 'none';
        bela.bela.carry(ballArt(ballObj.variant, 14));
      }
      ctx.sfx('pop');
      for (const wp of path.slice().reverse()) await runTo(ctx, bela, wp.x, wp.y, { speed: 400, depth: scaleAt, after: null });
      await runTo(ctx, bela, BELA_HOME.x + 30, BELA_HOME.y - 10, { speed: 420, depth: scaleAt, after: 'excited' });
      bela.flip = 1;
      bela.apply();
      if (funny) {
        await sockScene();
        // a bolinha volta rolando devagarinho
        const from = { x: ballObj.x, y: ballObj.y };
        await scope.tween(1100, (k) => { ballObj.x = lerp(from.x, START.x, k); ballObj.y = lerp(from.y, START.y, k); ballObj.rot += 8; ballObj.render(); });
      } else {
        bela.bela.carry(null);
        ballObj.g.style.display = '';
        ballObj.x = bela.x + 50 * bela.scale;
        ballObj.y = bela.y;
        ballObj.z = 50;
        ballObj.render();
        ctx.sfx('bounce');
        await scope.tween(500, (k) => { ballObj.x = lerp(ballObj.x, START.x, k); ballObj.y = lerp(ballObj.y, START.y, k); ballObj.z = 50 * (1 - k); ballObj.rot += 10; ballObj.render(); });
      }
      ctx.floatHeart(bela.x, bela.y - 80);
      if (!funny && !saidBack) { saidBack = true; ctx.say('fetch.back'); }
      await scope.wait(500);
      bela.bela.setState('wait');
    }

    async function sockScene() {
      const bruno = makePerson(ctx, 'papai', { x: -70, y: 690, scale: 0.85, parent: top });
      ctx.sfx('step');
      await scope.tween(700, (k) => { bruno.x = -70 + 120 * k; bruno.apply(); }, ease.out);
      bruno.person.cheer(true);
      ctx.sfx('giggle');
      await ctx.sayWait('fetch.sock');
      bela.bela.carry(null);
      const sk = s('g', { transform: 'translate(70 600) rotate(-20)' }, sock());
      top.append(sk);
      ctx.sfx('pop');
      await scope.wait(500);
      bruno.person.cheer(false);
      bruno.person.wave(true);
      await scope.tween(700, (k) => { bruno.x = 50 - 140 * k; bruno.apply(); sk.setAttribute('transform', `translate(${70 - 140 * k} 600) rotate(-20)`); }, ease.in);
      bruno.el.remove();
      sk.remove();
    }

    // ---------- dicas ----------
    let hintBusy = false;
    async function hint() {
      if (hintBusy) return;
      hintBusy = true;
      const h = dbg.hint?.();
      if (h) await h;
      hintBusy = false;
    }
    ctx.setHint(() => { if (dbg.instruction) ctx.instruct(dbg.instruction); hint(); });
    ctx.idle(12000, () => hint());
    const handDrag = (goal) => ctx.showHand({ x: ballObj.x, y: ballObj.y - 10 }, dragPointFor(ballObj, goal), { times: 1 });

    async function markRound(i) {
      ctx.sfx('found');
      paws[i].setAttribute('opacity', 1);
      ctx.burst(326, 756, { parent: top, n: 6, spread: 40 });
      await scope.wait(700);
    }

    // ---------- rodadas ----------
    async function roundFree() {
      dbg.instruction = 'fetch.free';
      dbg.goal = { x: 195, y: 360 };
      dbg.hint = () => handDrag(dbg.goal);
      ctx.instruct('fetch.free');
      if (ctx.state.plays.fetch === 0) handDrag(dbg.goal);
      const t = await waitThrow();
      await flyBall(t);
      await fetchBack();
    }

    async function roundHoop() {
      const pos = rng.pick(HOOPS);
      const zone = { x: pos.x, y: pos.y, r: 60 };
      const hp = new Actor(hoopArt(60), { x: pos.x, y: pos.y, scale: depthScale(pos.y) });
      ground.append(hp.el);
      dbg.goal = { x: zone.x, y: zone.y };
      dbg.instruction = 'fetch.hoop';
      dbg.hint = () => { hp.el.classList.add('glow-soft'); return handDrag(zone); };
      await ctx.sayWait('fetch.hoop', null, { asInstruction: true });
      let misses = 0;
      for (;;) {
        const t = await waitThrow();
        const res = resolveLanding(t, zone, misses);
        await flyBall(res.point);
        if (res.hit) {
          ctx.sfx('sparkle');
          ctx.burst(zone.x, zone.y - 10, { parent: top });
          ctx.say('fetch.hoop.in');
          await fetchBack();
          hp.el.remove();
          return;
        }
        await fetchBack();
        misses++;
        hp.set({ scale: depthScale(pos.y) * (1 + 0.35 * misses) });
        hp.el.classList.add('glow-soft');
        ctx.instruct('fetch.hoop.miss');
      }
    }

    async function roundMatch() {
      ballObj.g.remove();
      const order = rng.shuffle(BALLS);
      const target = rng.pick(order);
      // balão de pista
      const bubble = s('g', { transform: 'translate(195 250)' },
        s('g', { transform: 'translate(0 4) scale(1.5)' }, cloud(1)),
        s('circle', { cx: -20, cy: 44, r: 7, fill: '#fff', stroke: '#DDEFF9', 'stroke-width': 2 }),
        s('circle', { cx: -34, cy: 60, r: 4, fill: '#fff', stroke: '#DDEFF9', 'stroke-width': 2 }),
        s('g', { transform: 'translate(2 -4)' }, ballArt(target, 24)));
      top.append(bubble);
      const xs = [100, 195, 290];
      const choices = order.map((v, i) => {
        const o = mkBall(v);
        o.x = xs[i];
        o.y = 712;
        o.render();
        o.g.classList.add('hotspot');
        o.g.setAttribute('data-testid', `choice-${v.id}`);
        o.g.prepend(s('circle', { cy: -15, r: 42, fill: '#FFF6E6', 'fill-opacity': 0.55, stroke: '#fff', 'stroke-width': 4 }));
        o.render = ((render) => () => { render(); o.body.setAttribute('transform', `${o.body.getAttribute('transform')} scale(1.6)`); })(o.render);
        o.render();
        return o;
      });
      dbg.choices = choices.map((c) => ({ id: c.variant.id, x: c.x, y: c.y - 15 }));
      dbg.correct = target.id;
      const right = choices.find((c) => c.variant.id === target.id);
      dbg.instruction = 'fetch.match';
      dbg.hint = () => { right.g.classList.add('glow-soft'); return ctx.showHand({ x: right.x + 10, y: right.y - 6 }); };
      ctx.instruct('fetch.match');
      bela.bela.setState('curious');
      let wrong = 0;
      await new Promise((resolve) => {
        let done = false;
        choices.forEach((c) => {
          scope.on(c.g, 'pointerup', async (e) => {
            e.stopPropagation();
            if (done) return;
            if (c === right) {
              done = true;
              ctx.sfx('found');
              resolve();
              return;
            }
            wrong++;
            ctx.sfx('boing');
            const art = c.body.firstChild; // grupo sem transform: a animação não desloca a bola
            art.classList.remove('wiggle');
            void art.getBBox();
            art.classList.add('wiggle');
            bela.bela.setState('curious');
            ctx.instruct('fetch.match.other');
            if (wrong >= 2) right.g.classList.add('glow-soft');
          });
        });
      });
      right.g.classList.remove('glow-soft');
      choices.filter((c) => c !== right).forEach((c) => scope.tween(300, (k) => { c.g.style.opacity = 1 - k; }).then(() => c.g.remove()));
      // a bola escolhida vira a bola do jogo (tamanho normal) e vai até a Mel
      right.g.remove();
      ballObj = mkBall(right.variant);
      const from = { x: right.x, y: right.y };
      await scope.tween(500, (k) => { ballObj.x = lerp(from.x, START.x, k); ballObj.y = lerp(from.y, START.y, k); ballObj.render(); });
      bela.bela.setState('excited');
      await ctx.sayWait('fetch.match.ok', null, { asInstruction: true });
      dbg.goal = { x: 195, y: 360 };
      dbg.hint = () => handDrag(dbg.goal);
      bubble.remove();
      const t = await waitThrow();
      await flyBall(t);
      await fetchBack();
    }

    async function roundRamp() {
      const R = { x: 195, y: 440 };
      const rp = new Actor(rampArt(), { x: R.x, y: R.y, scale: depthScale(R.y) * 1.1 });
      rp.el.dataset.y = R.y - 30;
      world.append(rp.el);
      const zone = { x: R.x, y: R.y - 10, r: 62 };
      dbg.goal = { x: zone.x, y: zone.y };
      dbg.instruction = 'fetch.ramp';
      dbg.hint = () => { rp.el.classList.add('glow-soft'); return handDrag(zone); };
      await ctx.sayWait('fetch.ramp', null, { asInstruction: true });
      let misses = 0;
      for (;;) {
        const t = await waitThrow();
        const res = resolveLanding(t, zone, misses);
        if (res.hit) {
          await flyBall({ x: R.x, y: R.y - 4 }, { peak: 60 });
          ctx.sfx('whee');
          ctx.burst(R.x, R.y - 40, { parent: top, n: 6 });
          const from = { x: ballObj.x, y: ballObj.y };
          const to = { x: R.x + (res.point.x - R.x) * 0.5, y: 268 };
          await scope.tween(900, (k) => {
            ballObj.x = lerp(from.x, to.x, k);
            ballObj.y = lerp(from.y, to.y, k);
            ballObj.z = 30 + 4 * 90 * k * (1 - k) - 30 * k;
            ballObj.rot += 12;
            ballObj.render();
          }, ease.linear);
          ctx.sfx('bounce');
          ctx.say('fetch.ramp.ok');
          await fetchBack({ viaHop: { x: R.x, y: R.y } });
          rp.el.remove();
          return;
        }
        await flyBall(res.point);
        await fetchBack();
        misses++;
        rp.set({ scale: depthScale(R.y) * 1.1 * (1 + 0.15 * misses) });
        rp.el.classList.add('glow-soft');
        ctx.instruct('fetch.ramp.miss');
      }
    }

    async function roundBox() {
      const openSide = rng.pick(['left', 'right']);
      dbg.openSide = openSide;
      const Y = 420;
      const P = { left: { x: 112, y: Y }, right: { x: 278, y: Y } };
      const wall = s('g', {});
      wall.dataset.y = Y;
      wall.append(
        s('g', { transform: `translate(20 ${Y}) scale(0.9)` }, bush(170)),
        s('g', { transform: `translate(372 ${Y}) scale(0.9)` }, bush(170)),
        s('g', { transform: `translate(195 ${Y + 6}) scale(1.15)` }, boxArt()));
      const closed = openSide === 'left' ? P.right : P.left;
      const open = openSide === 'left' ? P.left : P.right;
      wall.append(s('g', { transform: `translate(${closed.x} ${Y + 4}) scale(0.62)` }, fence(80)));
      for (let i = 0; i < 3; i++) ground.append(s('g', { transform: `translate(${open.x + (i % 2 ? 8 : -8)} ${Y + 50 - i * 34}) rotate(${open.x < 195 ? -10 : 10})`, opacity: 0.7 }, pawprint(0.8, '#C49A6C')));
      world.append(wall);
      dbg.instruction = 'fetch.free';
      dbg.goal = { x: 195, y: 330 };
      dbg.hint = () => handDrag(dbg.goal);
      ctx.instruct('fetch.free');
      const t = await waitThrow();
      // a bolinha quica e para atrás da caixa
      await flyBall({ x: (t.x + 195) / 2, y: 470 }, { peak: 90 });
      const from = { x: ballObj.x, y: ballObj.y };
      await scope.tween(600, (k) => { ballObj.x = lerp(from.x, 195, k); ballObj.y = lerp(from.y, 330, k); ballObj.z = 4 * 70 * k * (1 - k); ballObj.render(); }, ease.linear);
      ctx.sfx('bounce');
      await runTo(ctx, bela, 195, 520, { speed: 380, depth: scaleAt, after: 'curious' });
      bela.bela.look(0, -1);
      await ctx.sayWait('fetch.box', null, { asInstruction: true });
      dbg.instruction = 'fetch.box';

      const zones = s('g', {});
      top.append(zones);
      const mkZone = (p, side) => {
        const g = s('g', { class: 'hotspot', transform: `translate(${p.x} ${p.y + 18})`, 'data-testid': `path-${side}` },
          s('ellipse', { class: 'halo', rx: 46, ry: 30, fill: '#FFF6E6', opacity: 0.5, stroke: '#fff', 'stroke-width': 4 }),
          s('circle', { r: 60, fill: 'transparent' }));
        zones.append(g);
        return g;
      };
      const zOpen = mkZone(open, openSide);
      const zClosed = mkZone(closed, openSide === 'left' ? 'right' : 'left');
      dbg.paths = { open: { ...open, y: open.y + 18 }, closed: { ...closed, y: closed.y + 18 } };
      dbg.hint = () => { zOpen.classList.add('glow-soft'); return ctx.showHand({ x: open.x + 10, y: open.y + 24 }); };
      let tries = 0;
      await new Promise((resolve) => {
        let walking = false;
        scope.on(zClosed, 'pointerup', async (e) => {
          e.stopPropagation();
          if (walking) return;
          walking = true;
          tries++;
          await runTo(ctx, bela, closed.x, closed.y + 70, { speed: 360, depth: scaleAt, after: 'sniff' });
          ctx.sfx('sniff');
          await scope.wait(700);
          bela.bela.setState('curious');
          ctx.instruct('fetch.box.closed');
          zOpen.classList.add('glow-soft');
          await scope.wait(500);
          await runTo(ctx, bela, 195, 520, { speed: 360, depth: scaleAt, after: 'curious' });
          walking = false;
        });
        scope.on(zOpen, 'pointerup', (e) => {
          e.stopPropagation();
          if (walking) return;
          walking = true;
          resolve();
        });
      });
      zones.remove();
      ctx.sfx('found');
      ctx.say('fetch.box.ok');
      dbg.tries = tries;
      await fetchBack({ path: [{ x: open.x, y: open.y + 70 }, { x: open.x, y: open.y - 40 }] });
      wall.remove();
    }

    const RUN = { free: roundFree, hoop: roundHoop, match: roundMatch, ramp: roundRamp, box: roundBox };

    (async () => {
      bela.bela.setState('excited');
      ctx.sfx('barks');
      await scope.wait(600);
      bela.bela.setState('wait');
      for (let i = 0; i < rounds.length; i++) {
        dbg.round = i;
        dbg.kind = rounds[i];
        dbg.phase = 'play';
        await RUN[rounds[i]]();
        await markRound(i);
      }
      dbg.phase = 'done';
      bela.bela.setState('excited');
      await ctx.sayWait('fetch.done');
      const { state, rewards } = completeActivity(ctx.state, 'fetch');
      ctx.setState(state);
      ctx.go('done', { activity: 'fetch', rewards });
    })();
  },
};
