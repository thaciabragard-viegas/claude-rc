// Teste de ponta a ponta: joga a aventura inteira com toques e arrastes reais (eventos de toque via CDP)
// num Chromium com emulação de celular. Uso: npm start (em outro terminal) e depois npm run test:e2e
// Variáveis: BASE_URL (padrão http://localhost:8080/), SHOTS (pasta para capturas, opcional).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8080/';
const SHOTS = process.env.SHOTS || '';
const SPEED = Number(process.env.SPEED || 4);
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const ok = (name, cond, extra = '') => { results.push({ name, ok: !!cond, extra }); console.log(`${cond ? '✔' : '✘'} ${name}${extra ? ` — ${extra}` : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function setup(browser, device, { sw = false } = {}) {
  const context = await browser.newContext({ ...device });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  const cdp = await context.newCDPSession(page);
  const url = `${BASE}?speed=${SPEED}${sw ? '' : '&nosw'}`;
  return { context, page, errors, cdp, url };
}

function helpers({ page, cdp }) {
  const H = {
    game: (fn, arg) => page.evaluate(fn, arg),
    async scene() { return page.evaluate(() => window.__game.scene); },
    async waitScene(name, timeout = 30000) {
      await page.waitForFunction((n) => window.__game.scene === n && !window.__game.transitioning, name, { timeout });
      await sleep(150);
    },
    async screen(x, y) { return page.evaluate(([a, b]) => window.__game.toScreen(a, b), [x, y]); },
    async tapStage(x, y) { const p = await H.screen(x, y); await page.touchscreen.tap(p.x, p.y); },
    async tapClient(x, y) { await page.touchscreen.tap(x, y); },
    async tapBtn(label) { await page.locator(`button[aria-label="${label}"]`).first().tap({ force: true }); },
    async touch(type, x, y) {
      await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }] });
    },
    async dragClient(from, to, steps = 12) {
      await H.touch('touchStart', from.x, from.y);
      for (let i = 1; i <= steps; i++) {
        await H.touch('touchMove', from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
        await sleep(16);
      }
      await H.touch('touchEnd');
    },
    async dragStage(a, b, steps) { await H.dragClient(await H.screen(a.x, a.y), await H.screen(b.x, b.y), steps); },
    async shot(name) { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); },
  };
  return H;
}

// ---------- brincadeiras ----------
async function playFetch(H, { useTapAlternative = false, testCancel = false } = {}) {
  await H.waitScene('fetch');
  const START = { x: 195, y: 650 };
  let matched = false;
  let triedClosed = false;
  let firstThrow = true;
  const t0 = Date.now();
  while ((await H.scene()) === 'fetch' && Date.now() - t0 < 120000) {
    const d = await H.game(() => { const f = window.__game.fetch; return { accepting: f.accepting, kind: f.kind, goal: f.goal, correct: f.correct, choices: f.choices, paths: f.paths, round: f.round, phase: f.phase }; });
    if (d.kind === 'match' && d.correct && !matched && !d.accepting && d.choices?.length) {
      const wrong = d.choices.find((c) => c.id !== d.correct);
      await H.tapStage(wrong.x, wrong.y); // escolha errada primeiro: deve ser gentil e não travar
      await sleep(600);
      const c = d.choices.find((x) => x.id === d.correct);
      await H.tapStage(c.x, c.y);
      matched = true;
      await H.shot('fetch-match');
    } else if (d.accepting) {
      if (testCancel && firstThrow) {
        // arraste interrompido (dedo sai/cancela): não pode travar
        const p = await H.screen(START.x, START.y - 15);
        await H.touch('touchStart', p.x, p.y);
        await H.touch('touchMove', p.x, p.y - 60);
        await H.touch('touchCancel');
        await sleep(300);
        const still = await H.game(() => window.__game.fetch.accepting);
        ok('Arraste cancelado não trava o lançamento', still);
      }
      if (useTapAlternative && firstThrow) {
        await H.tapStage(195, 380); // alternativa: tocar na grama
      } else {
        const goal = d.goal || { x: 195, y: 360 };
        const to = { x: START.x + (goal.x - START.x) / 2.6, y: START.y + (goal.y - START.y) / 2.6 };
        if (firstThrow) {
          const p = await H.screen(START.x, START.y - 15);
          const q = await H.screen(to.x, to.y);
          await H.touch('touchStart', p.x, p.y);
          for (let i = 1; i <= 8; i++) { await H.touch('touchMove', p.x + ((q.x - p.x) * i) / 8, p.y + ((q.y - p.y) * i) / 8); await sleep(16); }
          await H.shot('fetch-preview');
          await H.touch('touchEnd');
        } else {
          await H.dragStage({ x: START.x, y: START.y - 15 }, to);
        }
      }
      firstThrow = false;
      await sleep(400);
    } else if (d.kind === 'box' && d.paths) {
      if (!triedClosed) {
        triedClosed = true;
        await H.shot('fetch-box');
        await H.tapStage(d.paths.closed.x, d.paths.closed.y);
        await sleep(2500);
      } else {
        await H.tapStage(d.paths.open.x, d.paths.open.y);
        await sleep(1500);
      }
    }
    await sleep(250);
  }
  return H.scene();
}

async function playBath(H) {
  await H.waitScene('bath');
  const t0 = Date.now();
  const seen = new Set();
  while ((await H.scene()) === 'bath' && Date.now() - t0 < 150000) {
    const step = await H.game(() => window.__game.bath.step);
    if (!seen.has(step)) { seen.add(step); await H.shot(`bath-${step}`); }
    if (['mud', 'rinse', 'dry'].includes(step)) {
      const regions = await H.game(() => window.__game.bath.regions());
      for (const r of regions.slice(0, 3)) {
        await H.dragStage({ x: r.x - 45, y: r.y + 10 }, { x: r.x + 45, y: r.y - 10 }, 10);
        await H.dragStage({ x: r.x + 45, y: r.y }, { x: r.x - 45, y: r.y }, 10);
      }
    } else if (step === 'wipe') {
      const drops = await H.game(() => window.__game.bath.drops());
      for (const d of drops) await H.dragClient({ x: d.x - 40, y: d.y }, { x: d.x + 40, y: d.y }, 6);
    } else if (step === 'hide') {
      const dr = await H.game(() => window.__game.bath.drape);
      await H.tapStage(dr.x, dr.y);
      await sleep(800);
    } else if (step === 'bandana') {
      const bs = await H.game(() => window.__game.bath.bandanas);
      await H.tapStage(bs[1].x, bs[1].y);
      await sleep(500);
      await H.shot('bath-bandana-chosen');
      await H.tapBtn('Pronto');
      await H.tapBtn('Pronto').catch(() => {}); // toque repetido não pode duplicar
      await sleep(1500);
    }
    await sleep(200);
  }
  return H.scene();
}

async function playHunt(H) {
  await H.waitScene('hunt');
  const t0 = Date.now();
  let lastStage = -1;
  while ((await H.scene()) === 'hunt' && Date.now() - t0 < 120000) {
    const d = await H.game(() => ({ ...window.__game.hunt, spots: window.__game.hunt.spots }));
    if (d.phase === 'play') {
      if (d.stage !== lastStage) {
        lastStage = d.stage;
        await sleep(300);
        await H.shot(`hunt-stage${d.stage}`);
        if (d.stage === 0) {
          // farejar com a Bela antes de procurar
          await H.tapStage(78, 670);
          await sleep(1500);
        }
      }
      // tenta primeiro um lugar vazio (para ver a surpresa) e depois os que têm objeto
      const order = [...d.spots.filter((s) => !s.item), ...d.spots.filter((s) => s.item)];
      for (const sp of order) {
        if ((await H.game(() => window.__game.hunt.stage)) !== d.stage) break;
        await H.tapStage(sp.x, sp.y);
        await sleep(1300);
      }
    }
    await sleep(300);
  }
  return H.scene();
}

async function chooseFromDone(H, label) {
  await H.waitScene('done');
  await H.page.waitForFunction(() => window.__game.done?.ready, null, { timeout: 30000 });
  await H.shot(`done-${await H.game(() => window.__game.done.activity)}`);
  await H.tapBtn(label);
  await H.tapBtn(label).catch(() => {});
}

async function goSpot(H, id) {
  await H.waitScene('map');
  await H.page.waitForFunction(() => window.__game.map && !window.__game.map.busy, null, { timeout: 10000 });
  await sleep(300);
  const sp = await H.game((k) => (k === 'picnic' ? window.__game.map.picnic : window.__game.map.spots[k]), id);
  await H.tapStage(sp.x, sp.y);
}

// ---------- roteiro principal ----------
async function main() {
  const browser = await chromium.launch();
  const env = await setup(browser, devices['iPhone 13']);
  const { page, errors } = env;
  const H = helpers(env);
  H.page = page;

  await page.goto(env.url);
  await H.waitScene('title');
  await H.shot('01-title');
  await H.tapBtn('Começar a brincar');
  await H.waitScene('intro');
  await sleep(2500);
  await H.shot('02-intro');
  await page.waitForSelector('button[aria-label="Brincar"]', { timeout: 30000 });
  await H.shot('03-intro-end');
  await H.tapBtn('Brincar');
  await H.waitScene('map');
  await sleep(1200);
  await H.shot('04-map');
  ok('Abertura leva ao mapa e fica marcada como vista', await H.game(() => window.__game.state.introSeen));

  // 1) bola (com alternativa de toque e arraste cancelado)
  await goSpot(H, 'fetch');
  await H.shot('05-fetch');
  ok('Bela, pega! concluída', (await playFetch(H, { useTapAlternative: true, testCancel: true })) === 'done');
  ok('Recompensa da bola: patinho', (await H.game(() => window.__game.state.unlocked.toys)).join() === 'patinho');
  // brincar de novo, e sair no meio pelo botão de início
  await chooseFromDone(H, 'Brincar de novo');
  await H.waitScene('fetch');
  await sleep(1500);
  await H.tapBtn('Voltar ao jardim');
  await H.waitScene('map');
  ok('Voltar ao mapa no meio da atividade', true);
  // repetir a bola até o fim sem travar
  await goSpot(H, 'fetch');
  ok('Repetir a bola sem travar', (await playFetch(H)) === 'done');
  ok('Recompensa não duplicada', (await H.game(() => window.__game.state.unlocked.toys.length)) === 1);
  await chooseFromDone(H, 'Escolher outra brincadeira');

  // 2) banho
  await goSpot(H, 'bath');
  let bathHistory = [];
  const bathEnd = await (async () => {
    const r = playBath(H);
    await H.waitScene('bath');
    const poll = setInterval(async () => { try { bathHistory = await H.game(() => window.__game.bath?.history || []); } catch { /* trocando de cena */ } }, 250);
    const res = await r;
    clearInterval(poll);
    return res;
  })();
  ok('Banho concluído', bathEnd === 'done');
  ok('Banho passou por todas as etapas', ['mud', 'rinse', 'wipe', 'dry', 'hide', 'bandana'].every((s) => bathHistory.includes(s)), [...new Set(bathHistory)].join(' → '));
  const st1 = await H.game(() => window.__game.state);
  ok('Bandana escolhida salva e arco-íris liberada', st1.bandana !== 'coral' && st1.unlocked.bandanas.includes('arco'), `bandana=${st1.bandana}`);
  ok('Banho contado uma única vez', st1.plays.bath === 1, `plays.bath=${st1.plays.bath}`);
  await chooseFromDone(H, 'Escolher outra brincadeira');

  // som desligado durante a caça
  await H.waitScene('map');
  await H.tapBtn('Ligar ou desligar o som');
  ok('Som desligado', await H.game(() => window.__game.state.settings.muted));

  // 3) caça
  await goSpot(H, 'hunt');
  ok('Detetives das Patinhas concluída (com som desligado)', (await playHunt(H)) === 'done');
  ok('Almofada liberada', await H.game(() => window.__game.state.unlocked.cushion));
  await H.tapBtn('Ligar ou desligar o som').catch(() => {});
  await chooseFromDone(H, 'Escolher outra brincadeira');

  // 4) cantinho: carinho até virar de barriga
  await goSpot(H, 'corner');
  await H.waitScene('corner');
  await sleep(800);
  for (let i = 0; i < 4; i++) await H.dragStage({ x: 120, y: 520 }, { x: 260, y: 500 }, 10);
  ok('Carinho vira a Bela de barriga para cima', (await H.game(() => window.__game.corner.pose)) === 'belly');
  await H.shot('corner-belly');
  await page.locator('[data-testid="wardrobe"]').tap({ force: true });
  await sleep(500);
  await H.shot('corner-wardrobe');
  await page.locator('[data-testid="wear-ceu"]').tap({ force: true });
  ok('Troca de bandana no cantinho', (await H.game(() => window.__game.state.bandana)) === 'ceu');
  await H.tapBtn('Voltar ao jardim');

  // simula ir para segundo plano e voltar
  await H.waitScene('map');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await sleep(500);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await sleep(500);
  await H.shot('06-map-ready');

  // 5) piquenique e álbum
  ok('Aventura pronta para o piquenique', (await H.game(() => window.__game.state.adventure.done.length)) === 3);
  await goSpot(H, 'picnic');
  await H.waitScene('picnic');
  await sleep(800);
  await H.shot('picnic-call');
  const hidden = await H.game(() => window.__game.picnic.hidden);
  for (const p of hidden) { await H.tapStage(p.x, p.y); await sleep(1800); }
  await page.waitForSelector('button[aria-label="Guardar a lembrança"]', { timeout: 30000 });
  await H.shot('picnic-photo');
  await H.tapBtn('Guardar a lembrança');
  await H.tapBtn('Guardar a lembrança').catch(() => {});
  await H.waitScene('done');
  await sleep(1500);
  const st2 = await H.game(() => window.__game.state);
  ok('Lembrança criada no álbum (uma só)', st2.album.length === 1, `album=${st2.album.length}`);
  ok('História recomeça após o piquenique', st2.adventure.done.length === 0);
  await chooseFromDone(H, 'Encerrar por agora');
  await H.waitScene('bye');
  await sleep(1500);
  await H.shot('bye');
  await page.waitForSelector('button[aria-label="Voltar a brincar"]', { timeout: 30000 });
  await H.tapBtn('Voltar a brincar');
  await goSpot(H, 'album');
  await H.waitScene('album');
  await sleep(600);
  await H.shot('album');
  ok('Álbum abre na lembrança', (await H.game(() => window.__game.album.pages)) === 2);

  // 6) reabrir a página e recuperar o progresso
  await page.reload();
  await H.waitScene('title');
  await H.tapBtn('Começar a brincar');
  await H.waitScene('map');
  const st3 = await H.game(() => window.__game.state);
  ok('Progresso recuperado após reabrir (pula a abertura)', st3.album.length === 1 && st3.introSeen && st3.bandana === 'ceu');

  // 7) área adulta: reiniciar progresso
  await H.tapBtn('Área dos adultos');
  await sleep(300);
  const box = await page.locator('.gate-hold').boundingBox();
  await H.touch('touchStart', box.x + box.width / 2, box.y + box.height / 2);
  await sleep(2300);
  await H.touch('touchEnd');
  const ans = await H.game(() => window.__game.adultAnswer);
  await H.shot('adult-gate');
  await page.locator(`.gate-nums button[data-n="${ans}"]`).tap();
  await H.shot('adult-panel');
  await page.locator('text=Apagar progresso…').tap();
  await page.locator('[data-testid="confirm-reset"]').tap();
  await H.waitScene('title');
  const st4 = await H.game(() => window.__game.state);
  ok('Progresso reiniciado pela área adulta', st4.album.length === 0 && !st4.introSeen && st4.unlocked.toys.length === 0);

  // todas as variações da bola (as rodadas normalmente são sorteadas)
  for (const combo of ['hoop,ramp', 'match,box']) {
    await page.goto(`${env.url}&rounds=${combo}`);
    await H.waitScene('title');
    await H.tapBtn('Começar a brincar');
    await page.waitForFunction(() => ['intro', 'map'].includes(window.__game.scene) && !window.__game.transitioning);
    if ((await H.scene()) === 'intro') await H.tapBtn('Pular abertura');
    await goSpot(H, 'fetch');
    ok(`Variações da bola: ${combo}`, (await playFetch(H)) === 'done');
  }

  ok('Sem erros de JavaScript', errors.length === 0, errors.slice(0, 5).join(' | '));
  await env.context.close();

  // ---------- telas estreitas ----------
  for (const [name, dev] of [['narrow-se', { viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }], ['android', devices['Pixel 7']]]) {
    const e2 = await setup(browser, dev);
    const H2 = helpers(e2);
    H2.page = e2.page;
    await e2.page.goto(e2.url);
    await H2.waitScene('title');
    await H2.shot(`${name}-title`);
    await H2.tapBtn('Começar a brincar');
    await H2.waitScene('intro');
    await H2.tapBtn('Pular abertura');
    await H2.waitScene('map');
    await sleep(1200);
    await H2.shot(`${name}-map`);
    for (const sc of ['fetch', 'bath', 'hunt', 'corner']) {
      await goSpot(H2, sc);
      await H2.waitScene(sc);
      await sleep(1800);
      await H2.shot(`${name}-${sc}`);
      if (name === 'android') {
        const before = await e2.page.evaluate(() => document.querySelectorAll('.person').length);
        await H2.tapBtn('Mostrar ajuda');
        const helped = await e2.page.waitForFunction((n) => document.querySelector('.hint-hand') || document.querySelectorAll('.person').length > n, before, { timeout: 4000 }).then(() => true).catch(() => false);
        ok(`Botão de ajuda mostra uma demonstração (${sc})`, helped);
        await H2.tapBtn('Repetir a instrução');
      }
      await H2.tapBtn('Voltar ao jardim');
    }
    // nada essencial cortado: hud e botões dentro da tela
    const vis = await e2.page.evaluate(() => [...document.querySelectorAll('#hud button')].filter((b) => b.offsetParent).every((b) => { const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.width >= 56; }));
    ok(`Tela ${name}: botões visíveis e com 56px ou mais`, vis);
    ok(`Tela ${name}: sem erros`, e2.errors.length === 0, e2.errors.slice(0, 3).join(' | '));
    await e2.context.close();
  }

  // ---------- modo offline (service worker) ----------
  const e3 = await setup(browser, devices['iPhone 13'], { sw: true });
  await e3.page.goto(e3.url);
  await e3.page.waitForFunction(() => navigator.serviceWorker?.controller || null, null, { timeout: 15000 }).catch(() => {});
  await e3.page.reload();
  await e3.page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {});
  await sleep(1000);
  await e3.context.setOffline(true);
  await e3.page.reload();
  const H3 = helpers(e3);
  H3.page = e3.page;
  let offlineOk = false;
  try {
    await H3.waitScene('title', 10000);
    await H3.tapBtn('Começar a brincar');
    await H3.waitScene('intro', 10000);
    await H3.tapBtn('Pular abertura');
    await H3.waitScene('map', 10000);
    await goSpot(H3, 'bath');
    await H3.waitScene('bath', 10000);
    offlineOk = true;
  } catch (e) { console.log(e.message); }
  ok('Funciona sem internet depois do primeiro acesso', offlineOk);
  await e3.context.close();

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} verificações passaram.`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
