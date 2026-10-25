import test from 'node:test';
import assert from 'node:assert/strict';
import { makeRng, makeBag } from '../../js/logic/rng.js';
import { generateSession, nextTarget, isStageDone, HUNT_ITEMS } from '../../js/logic/hunt.js';
import { throwTarget, dragPointFor, resolveLanding, FIELD, START, planRounds } from '../../js/logic/fetch.js';
import { makeRegions, scrub, isDone, progress } from '../../js/logic/coverage.js';

test('caça: toda sessão é solucionável e cresce aos poucos', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const stages = generateSession(makeRng(seed));
    assert.equal(stages.length, 3);
    assert.equal(stages[0].items.length, 1);
    assert.equal(stages[0].spots.length, 2);
    assert.equal(stages[1].items.length, 2);
    assert.ok([3, 4].includes(stages[1].spots.length));
    assert.equal(stages[2].items.length, 1);
    assert.ok(stages[2].trail);
    const all = stages.flatMap((s) => s.items);
    assert.deepEqual(all.slice().sort(), HUNT_ITEMS.slice().sort());
    for (const st of stages) {
      const holders = st.spots.filter((s) => s.item);
      assert.equal(holders.length, st.items.length, 'cada objeto em um esconderijo diferente');
      assert.equal(new Set(st.spots.map((s) => s.type)).size, st.spots.length, 'esconderijos diferentes');
      st.spots.filter((s) => !s.item).forEach((s) => assert.ok(s.critter, 'lugar vazio sempre tem surpresa'));
      // abrindo todos os lugares, a fase termina
      const opened = [];
      const found = [];
      for (const sp of st.spots) { opened.push(sp.id); if (sp.item) found.push(sp.item); }
      assert.ok(isStageDone(st, found));
      assert.equal(nextTarget(st, opened), null);
    }
  }
});

test('caça: posições variam entre partidas', () => {
  const sig = (seed) => JSON.stringify(generateSession(makeRng(seed)).map((s) => s.spots.map((p) => p.type + p.item)));
  const set = new Set(Array.from({ length: 20 }, (_, i) => sig(i + 1)));
  assert.ok(set.size > 10);
});

test('bola: arraste vira ponto dentro do gramado; ida e volta batem', () => {
  const t = throwTarget(START, { x: START.x + 30, y: START.y - 100 });
  assert.ok(t.y < START.y && t.y >= FIELD.minY);
  const goal = { x: 120, y: 330 };
  const p = dragPointFor(START, goal);
  const back = throwTarget(START, p);
  assert.ok(Math.abs(back.x - goal.x) < 0.01 && Math.abs(back.y - goal.y) < 0.01);
  // puxar para baixo nunca joga a bola para trás
  const down = throwTarget(START, { x: START.x, y: START.y + 80 });
  assert.ok(down.y < START.y);
  // arraste enorme fica no gramado
  const far = throwTarget(START, { x: -999, y: -999 });
  assert.equal(far.x, FIELD.minX);
  assert.equal(far.y, FIELD.minY);
});

test('bola: alvo fica mais tolerante a cada tentativa e ajuda na terceira', () => {
  const zone = { x: 200, y: 300, r: 60 };
  const near = { x: 275, y: 300 }; // 75 de distância
  assert.equal(resolveLanding(near, zone, 0).hit, false); // raio 60
  assert.equal(resolveLanding(near, zone, 1).hit, true); // raio 81
  const far = { x: 380, y: 520 };
  assert.equal(resolveLanding(far, zone, 1).hit, false);
  const helped = resolveLanding(far, zone, 2); // terceira tentativa: a bola é puxada para a roda
  assert.ok(helped.hit && helped.assisted);
  assert.ok(Math.hypot(helped.point.x - zone.x, helped.point.y - zone.y) <= zone.r);
});

test('bola: três rodadas, a primeira livre', () => {
  for (let s = 1; s < 50; s++) {
    const r = planRounds(makeRng(s));
    assert.equal(r.length, 3);
    assert.equal(r[0], 'free');
    assert.ok(['hoop', 'match'].includes(r[1]));
    assert.ok(['ramp', 'box'].includes(r[2]));
  }
});

test('banho: só limpa onde o dedo passa, com margem, sem exigir perfeição', () => {
  const regs = makeRegions([{ x: 0, y: 0, r: 20, need: 60 }, { x: 200, y: 0, r: 20, need: 60 }]);
  scrub(regs, 0, 0, 30);
  assert.ok(regs[0].amount < 1 && regs[1].amount === 1);
  scrub(regs, 45, 0, 40, 30); // fora do círculo, mas dentro da margem
  assert.equal(regs[0].amount, 0);
  assert.ok(!isDone(regs));
  assert.ok(progress(regs) >= 0.5);
  scrub(regs, 200, 0, 60);
  assert.ok(isDone(regs));
});

test('saquinho de reações não repete em sequência', () => {
  const rng = makeRng(3);
  const next = makeBag(['a', 'b', 'c'], rng);
  let prev = null;
  for (let i = 0; i < 60; i++) { const v = next(); assert.notEqual(v, prev); prev = v; }
});
