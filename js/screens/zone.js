import { h } from '../util.js';
import { screen, elementChip, button, backButton } from '../ui.js';
import { ZONE_BY_ID } from '../data/zones.js';
import { MONSTERS } from '../data/monsters.js';
import { ELEMENTS, makeResist } from '../data/elements.js';
import { backgroundCanvas, monsterCanvas } from '../sprites.js';
import { maxHp } from '../state.js';

export function zoneScreen(game, { zoneId }) {
  const p = game.player;
  const zone = ZONE_BY_ID[zoneId];
  const hurt = p.hp < maxHp(p) * 0.3;

  return screen(game, 'zone-screen',
    h('section', { class: 'zone-banner' },
      backgroundCanvas(zone, 'px zone-bg'),
      h('div', { class: 'zone-banner-text' },
        h('h1', { class: 'screen-title' }, zone.name),
        h('span', { class: 'zone-meta' }, elementChip(zone.element, true), ` Nv recomendado ${zone.min}–${zone.max}`))),
    h('p', { class: 'zone-desc' }, zone.desc),
    hurt ? h('p', { class: 'warn' }, 'Te queda poca vida. Considerá volver a la posada antes de cazar.') : null,
    h('div', { class: 'row-actions hunt-row' },
      button('¡Cazar!', () => game.go('batalla', { zoneId }), { variant: 'primary', class: 'btn-big', id: 'btn-hunt' }),
      button('Mochila', () => game.go('mochila'), { variant: 'ghost' })),
    h('h2', { class: 'section-title' }, 'Criaturas de la zona'),
    h('section', { class: 'bestiary' },
      ...zone.monsters.map((id) => {
        const m = MONSTERS[id];
        const resist = makeResist(m.element, m.resist);
        const weak = Object.entries(resist).filter(([, v]) => v > 100).map(([el]) => el);
        const strong = Object.entries(resist).filter(([, v]) => v < 100).map(([el]) => el);
        const kills = p.kills[id] ?? 0;
        return h('article', { class: 'monster-card panel' },
          monsterCanvas(m, 'px monster-thumb'),
          h('div', { class: 'monster-info' },
            h('h3', { class: 'monster-name' }, m.name, elementChip(m.element, true)),
            h('p', { class: 'monster-desc' }, m.desc),
            h('p', { class: 'monster-res' },
              h('span', { class: 'res-label good' }, 'Débil a: '),
              weak.length ? weak.map((el) => ELEMENTS[el].name).join(', ') : 'nada en particular'),
            h('p', { class: 'monster-res' },
              h('span', { class: 'res-label bad' }, 'Resiste: '),
              strong.map((el) => `${ELEMENTS[el].name}${resist[el] === 0 ? ' (inmune)' : ''}`).join(', ') || 'nada'),
            h('p', { class: 'monster-kills' }, kills ? `Derrotados: ${kills}` : 'Todavía no peleaste con este')));
      })),
    h('div', { class: 'row-actions' }, backButton(game, 'mapa', 'Volver al mapa'), backButton(game)));
}
