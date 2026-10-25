// Área dos adultos: protegida por "segure 2 segundos" + "toque no número escrito por extenso".
import { h } from '../engine/svg.js';
import { setSettings, resetProgress } from '../logic/state.js';

const WORDS = { 2: 'DOIS', 3: 'TRÊS', 4: 'QUATRO', 5: 'CINCO', 6: 'SEIS', 7: 'SETE', 8: 'OITO', 9: 'NOVE' };

export function openAdult(ctx) {
  if (document.querySelector('.adult')) return;
  const overlay = h('div', { class: 'adult', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Área dos adultos' });
  const panel = h('div', { class: 'panel' });
  overlay.append(panel);
  ctx.ui.append(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('pointerup', (e) => { if (e.target === overlay) close(); });

  // etapa 1: segurar
  const ring = `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="#FFE58F" stroke="#6B4A3A" stroke-width="4"/><circle class="prog" cx="60" cy="60" r="52" fill="none" stroke="#FF7F6B" stroke-width="10" stroke-dasharray="327" stroke-dashoffset="327" transform="rotate(-90 60 60)"/></svg>`;
  const hold = h('div', { class: 'gate-hold', role: 'button', 'aria-label': 'Segure por dois segundos' });
  hold.innerHTML = `${ring}<span>Segure aqui</span>`;
  const closeBtn = h('button', { class: 'tbtn ghost close-x', type: 'button', text: 'Fechar', onclick: close });
  panel.append(closeBtn, h('h2', { text: 'Área dos adultos' }), h('p', { text: 'Segure o círculo por 2 segundos.' }), hold);

  let timer = null;
  let start = 0;
  const prog = hold.querySelector('.prog');
  const stop = () => { cancelAnimationFrame(timer); timer = null; prog.setAttribute('stroke-dashoffset', 327); };
  hold.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { hold.setPointerCapture(e.pointerId); } catch { /* ok */ }
    start = performance.now();
    const tick = () => {
      const k = Math.min(1, (performance.now() - start) / 2000);
      prog.setAttribute('stroke-dashoffset', 327 * (1 - k));
      if (k >= 1) { stop(); step2(); return; }
      timer = requestAnimationFrame(tick);
    };
    timer = requestAnimationFrame(tick);
  });
  hold.addEventListener('pointerup', stop);
  hold.addEventListener('pointercancel', stop);

  // etapa 2: número por extenso (exige leitura)
  function step2() {
    const nums = Object.keys(WORDS).map(Number);
    const ans = nums[Math.floor(Math.random() * nums.length)];
    const opts = new Set([ans]);
    while (opts.size < 4) opts.add(nums[Math.floor(Math.random() * nums.length)]);
    const shuffled = [...opts].sort(() => Math.random() - 0.5);
    panel.replaceChildren(closeBtn, h('h2', { text: 'Área dos adultos' }), h('p', { text: `Toque no número ${WORDS[ans]}.` }));
    const row = h('div', { class: 'gate-nums' });
    shuffled.forEach((n) => row.append(h('button', {
      class: 'tbtn', type: 'button', text: String(n), 'data-n': n,
      onclick: () => (n === ans ? settings() : close()),
    })));
    panel.append(row);
    window.__game.adultAnswer = ans;
  }

  // painel
  function settings() {
    const st = ctx.state.settings;
    const slider = (key, label) => {
      const input = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: st[key], 'aria-label': label });
      input.addEventListener('input', () => ctx.setState(setSettings(ctx.state, { [key]: Number(input.value), muted: false })));
      return h('label', {}, h('span', { text: label }), input);
    };
    const cap = h('input', { type: 'checkbox' });
    cap.checked = st.captions !== false;
    cap.addEventListener('change', () => ctx.setState(setSettings(ctx.state, { captions: cap.checked })));

    const s = ctx.state;
    const summary = `Lembranças no álbum: ${s.album.length}. Bola: ${s.plays.fetch}× · Banho: ${s.plays.bath}× · Detetives: ${s.plays.hunt}×.`;
    const resetArea = h('div', { class: 'actions' });
    const resetBtn = h('button', { class: 'tbtn danger', type: 'button', text: 'Apagar progresso…' });
    resetArea.append(resetBtn);
    resetBtn.addEventListener('click', () => {
      resetArea.replaceChildren(
        h('p', { text: 'Tem certeza? Isso apaga o álbum, as bandanas e os brinquedos ganhos neste aparelho. Os ajustes de som continuam.' }),
        h('button', { class: 'tbtn danger', type: 'button', text: 'Sim, apagar tudo', 'data-testid': 'confirm-reset', onclick: () => { ctx.setState(resetProgress(ctx.state)); close(); ctx.go('title'); } }),
        h('button', { class: 'tbtn', type: 'button', text: 'Cancelar', onclick: () => { resetArea.replaceChildren(resetBtn); } }));
    });

    panel.replaceChildren(
      closeBtn,
      h('h2', { text: 'Área dos adultos' }),
      h('h3', { text: 'Som' }),
      slider('music', 'Música'),
      slider('voice', 'Voz'),
      slider('sfx', 'Efeitos'),
      h('label', { class: 'toggle' }, cap, h('span', { text: 'Mostrar legenda das falas' })),
      h('p', { class: 'small', text: 'O botão de alto-falante no canto da tela liga e desliga todo o som.' }),
      h('h3', { text: 'Abertura' }),
      h('div', { class: 'actions' }, h('button', { class: 'tbtn', type: 'button', text: 'Ver a abertura de novo', onclick: () => { close(); ctx.go('intro'); } })),
      h('h3', { text: 'Progresso' }),
      h('p', { text: summary }),
      resetArea,
      h('h3', { text: 'Privacidade' }),
      h('ul', {},
        h('li', { text: 'Sem anúncios, compras, chat, cadastro, ranking ou rastreamento.' }),
        h('li', { text: 'Não usa câmera, microfone nem localização.' }),
        h('li', { text: 'O progresso fica salvo apenas neste aparelho, no armazenamento do navegador. Nada é enviado para servidores.' }),
        h('li', { text: 'Limpar os dados do navegador (ou do site) apaga o progresso.' }),
        h('li', { text: 'A narração usa a voz do próprio aparelho. Em alguns celulares, o sistema pode usar uma voz on-line do fabricante.' })),
      h('h3', { text: 'Personalização' }),
      h('p', { text: 'Nomes, cores, fotos dos personagens e gravações das falas ficam no arquivo js/config.js. Veja docs/PERSONALIZACAO.md.' }),
    );
  }
}
