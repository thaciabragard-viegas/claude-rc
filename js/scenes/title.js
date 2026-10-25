// Tela inicial: um toque grande para começar (também libera o áudio no celular).
import { h } from '../engine/svg.js';
import { GAME } from '../config.js';
import { backdrop, flowerPatch, treeAt, sunAt, grassTufts } from '../art/scenery.js';
import { makeBela, makePerson } from './common.js';

export default {
  name: 'title',
  noHud: true,
  enter(ctx) {
    const L = ctx.layer;
    L.append(backdrop({ horizon: 330 }), sunAt(336, 262), treeAt(60, 420, 1.1), treeAt(340, 430, 0.9),
      grassTufts([[60, 600], [320, 640], [140, 720], [260, 520]]), flowerPatch(90, 500), flowerPatch(300, 690, ['#FFD45C', '#B79CE8', '#FF7F6B']));
    const mel = makePerson(ctx, 'mel', { x: 140, y: 530, scale: 1.25 });
    mel.person.wave(true);
    const bela = makeBela(ctx, { x: 245, y: 538, scale: 1.05, flip: -1 });
    bela.bela.setState('excited');

    ctx.ui.append(h('div', { class: 'title-wrap' }, h('h1', { text: GAME.title }), h('p', { text: GAME.subtitle })));
    const row = h('div', { class: 'row', style: 'bottom: calc(40px + var(--safe-b))' });
    ctx.ui.append(row);
    ctx.button({
      icon: 'paw', label: 'Começar a brincar', cls: 'big pulse', parent: row,
      onTap: () => {
        ctx.unlockAudio();
        ctx.sfx('barks');
        ctx.go(ctx.state.introSeen ? 'map' : 'intro');
      },
    });
  },
};
