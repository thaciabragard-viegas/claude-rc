// Álbum: página de coleção (adesivos das brincadeiras, bandanas, brinquedos) + uma página por lembrança.
import { s, h } from '../engine/svg.js';
import { BANDANAS } from '../config.js';
import { memoryArt } from '../art/memory.js';
import { ball, bubble, napkin, duckToy, cushion, bandanaSwatch, PAL } from '../art/items.js';
import { makeBela } from './common.js';

export default {
  name: 'album',
  bg: '#E9D3B4',
  enter(ctx, params = {}) {
    const { layer: L, state } = ctx;
    L.append(s('rect', { x: -700, y: -900, width: 1790, height: 2600, fill: '#E9D3B4' }));
    // livro aberto
    L.append(s('rect', { x: 14, y: 150, width: 362, height: 470, rx: 18, fill: '#C98F4E', stroke: PAL.brown, 'stroke-width': 4 }),
      s('rect', { x: 26, y: 160, width: 338, height: 450, rx: 12, fill: '#FFF6E6', stroke: PAL.brown, 'stroke-width': 3 }));
    const page = s('g', {});
    L.append(page);
    const bela = makeBela(ctx, { x: 186, y: 752, scale: 0.6 });

    const memories = state.album.slice().reverse(); // mais recente primeiro
    const pages = ['collection', ...memories.map((m) => m)];
    let idx = memories.length ? 1 : 0;
    if (params.focus) idx = Math.max(0, pages.findIndex((p) => p.id === params.focus));

    function render() {
      page.replaceChildren();
      const p = pages[idx];
      if (p === 'collection') {
        // adesivos das brincadeiras já feitas
        const stickers = [
          ['fetch', ball(undefined, 22)],
          ['bath', s('g', {}, bubble(16), s('g', { transform: 'translate(16 -10)' }, bubble(10)))],
          ['hunt', s('g', { transform: 'scale(1.1)' }, napkin())],
        ];
        stickers.forEach(([id, art], i) => {
          const done = (state.plays[id] || 0) > 0;
          page.append(s('g', { transform: `translate(${88 + i * 107} 240)`, opacity: done ? 1 : 0.25 },
            s('circle', { r: 42, fill: done ? '#FFE58F' : '#EEE3D3', stroke: PAL.brown, 'stroke-width': 3, 'stroke-dasharray': done ? null : '6 6' }), art));
        });
        // bandanas
        BANDANAS.forEach((b, i) => {
          const has = state.unlocked.bandanas.includes(b.id);
          page.append(s('g', { transform: `translate(${64 + i * 66} 360) scale(0.8)`, opacity: has ? 1 : 0.2 }, bandanaSwatch(b)));
        });
        // brinquedo e almofada
        page.append(s('g', { transform: 'translate(120 480)', opacity: state.unlocked.toys.includes('patinho') ? 1 : 0.2 }, duckToy()));
        page.append(s('g', { transform: 'translate(260 480) scale(0.45)', opacity: state.unlocked.cushion ? 1 : 0.2 }, cushion()));
        if (!memories.length) {
          page.append(s('rect', { x: 70, y: 520, width: 250, height: 70, rx: 12, fill: 'none', stroke: '#D7BFA0', 'stroke-width': 4, 'stroke-dasharray': '10 10' }));
        }
      } else {
        page.append(s('g', { transform: 'translate(195 370) scale(1.02)' }, memoryArt(p)));
        page.append(s('text', { x: 195, y: 560, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: PAL.brown, text: `Aventura ${p.id}` }));
      }
      prev.disabled = idx === 0;
      next.disabled = idx === pages.length - 1;
      window.__game.album = { idx, pages: pages.length };
    }

    const nav = h('div', { class: 'row', style: 'bottom: calc(22px + var(--safe-b)); justify-content: space-between; padding: 0 22px' });
    ctx.ui.append(nav);
    const prev = ctx.button({ icon: 'left', label: 'Página anterior', cls: 'mid sky', parent: nav, onTap: () => { if (idx > 0) { idx--; ctx.sfx('rustle'); render(); } return 'keep'; } });
    const next = ctx.button({ icon: 'right', label: 'Próxima página', cls: 'mid sky', parent: nav, onTap: () => { if (idx < pages.length - 1) { idx++; ctx.sfx('rustle'); render(); } return 'keep'; } });
    render();

    bela.bela.setState('excited');
    ctx.sfx('bark');
    ctx.instruct(memories.length ? 'album.intro' : 'album.empty');
    ctx.setHint(() => ctx.say(memories.length ? 'album.intro' : 'album.empty'));
    setTimeout(() => ctx.scope.alive && bela.bela.setState('wait'), 1200);
  },
};
