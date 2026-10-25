import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, completeActivity, adventureReady, nextStep, completePicnic, setBandana, resetProgress, load, save, normalize, setSettings } from '../../js/logic/state.js';

const memStore = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };

test('história segue bola → banho → caça → piquenique', () => {
  let s = defaultState();
  assert.equal(nextStep(s), 'fetch');
  s = completeActivity(s, 'fetch').state;
  assert.equal(nextStep(s), 'bath');
  s = completeActivity(s, 'hunt').state; // fora de ordem também vale
  assert.equal(nextStep(s), 'bath');
  s = completeActivity(s, 'bath').state;
  assert.equal(nextStep(s), 'picnic');
  assert.ok(adventureReady(s));
});

test('recompensas são previsíveis e não duplicam', () => {
  let s = defaultState();
  let r = completeActivity(s, 'fetch');
  assert.deepEqual(r.rewards.map((x) => x.id), ['patinho']);
  r = completeActivity(r.state, 'fetch');
  assert.deepEqual(r.rewards, []);
  assert.deepEqual(r.state.unlocked.toys, ['patinho']);
  assert.equal(r.state.plays.fetch, 2);
  s = completeActivity(r.state, 'bath').state;
  assert.ok(s.unlocked.bandanas.includes('arco'));
  s = completeActivity(s, 'hunt').state;
  assert.equal(s.unlocked.cushion, true);
});

test('piquenique só acontece com a aventura completa e cria uma lembrança', () => {
  let s = defaultState();
  let p = completePicnic(s, { date: '2026-10-25', members: [] });
  assert.equal(p.memory, null);
  for (const a of ['fetch', 'bath', 'hunt']) s = completeActivity(s, a).state;
  s = setBandana(s, 'arco');
  p = completePicnic(s, { date: '2026-10-25', members: ['mamae'] });
  assert.equal(p.state.album.length, 1);
  assert.equal(p.memory.bandana, 'arco');
  assert.deepEqual(p.state.adventure.done, []);
  assert.ok(p.state.unlocked.bandanas.includes('estrelas'));
  // repetir sem nova aventura não duplica
  const again = completePicnic(p.state, { date: 'x', members: [] });
  assert.equal(again.state.album.length, 1);
});

test('bandana bloqueada não pode ser escolhida', () => {
  const s = setBandana(defaultState(), 'estrelas');
  assert.equal(s.bandana, 'coral');
});

test('salvar, carregar e reiniciar mantendo os ajustes de som', () => {
  const st = memStore();
  let s = completeActivity(defaultState(), 'fetch').state;
  s = setSettings(s, { music: 0.1, muted: true });
  save(st, 'k', s);
  const back = load(st, 'k');
  assert.equal(back.plays.fetch, 1);
  assert.equal(back.settings.music, 0.1);
  const r = resetProgress(back);
  assert.equal(r.plays.fetch, 0);
  assert.equal(r.settings.muted, true);
});

test('dados corrompidos ou antigos não quebram o jogo', () => {
  const st = memStore();
  st.setItem('k', '{isto não é json');
  assert.deepEqual(load(st, 'k'), defaultState());
  const n = normalize({ bandana: 'inexistente', unlocked: { bandanas: ['xyz'] }, adventure: { done: ['fetch', 'foo'] } });
  assert.equal(n.bandana, 'coral');
  assert.deepEqual(n.adventure.done, ['fetch']);
  assert.ok(!n.unlocked.bandanas.includes('xyz'));
});
