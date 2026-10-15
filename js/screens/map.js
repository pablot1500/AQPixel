import { h, pick } from '../util.js';
import { screen, elementChip, backButton } from '../ui.js';
import { ZONES } from '../data/zones.js';
import { BUILDINGS } from '../data/town.js';
import { backgroundCanvas } from '../sprites.js';

export function mapScreen(game) {
  const p = game.player;
  const guard = BUILDINGS.find((b) => b.id === 'mapa');

  return screen(game, 'map-screen',
    h('div', { class: 'town-head' },
      h('h1', { class: 'screen-title' }, 'Mapa de zonas'),
      h('p', { class: 'hint' }, `${guard.owner}: «${pick(guard.lines)}»`)),
    h('nav', { class: 'zone-list', 'aria-label': 'Zonas' },
      ...ZONES.map((z) => {
        const danger = p.level < z.min - 1;
        return h('button', { type: 'button', class: 'zone-card', id: `zone-${z.id}`, onclick: () => game.go('zona', { zoneId: z.id }) },
          backgroundCanvas(z, 'px zone-thumb'),
          h('span', { class: 'zone-info' },
            h('span', { class: 'zone-name' }, z.name),
            h('span', { class: 'zone-meta' }, elementChip(z.element, true), ` Nv ${z.min}–${z.max}`),
            danger ? h('span', { class: 'tag tag-danger' }, 'Peligroso para tu nivel') : null));
      })),
    h('div', { class: 'row-actions' }, backButton(game)));
}
