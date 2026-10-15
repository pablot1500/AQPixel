import { h, pick } from '../util.js';
import { screen } from '../ui.js';
import { BUILDINGS, TOWN_NAME } from '../data/town.js';
import { houseCanvas } from '../sprites.js';
import { maxHp } from '../state.js';

export function townScreen(game) {
  const p = game.player;
  const hurt = p.hp < maxHp(p) * 0.35;
  const hint = hurt
    ? 'Estás bastante golpeado. La posada de Doña Berta te deja como nuevo.'
    : p.statPoints > 0
      ? 'Tenés puntos de atributo sin repartir. Abrí tu mochila.'
      : pick([
        'Cada zona tiene un elemento dominante. Llevá el arma que le duela.',
        'Los objetos raros solo se consiguen cazando. Algunos son bastante ridículos.',
        'Vender devuelve un cuarto del precio. Pensalo dos veces.',
        'El carisma te consigue descuentos. La sonrisa es gratis.',
      ]);

  return screen(game, 'town-screen',
    h('div', { class: 'town-head' },
      h('h1', { class: 'screen-title' }, TOWN_NAME),
      h('p', { class: 'hint' }, hint)),
    h('nav', { class: 'town-grid', 'aria-label': 'Edificios del pueblo' },
      ...BUILDINGS.map((b) => h('button', {
        type: 'button', class: `building${b.id === 'mapa' ? ' building-exit' : ''}`, id: `go-${b.id}`,
        onclick: () => game.go(b.id),
      },
      houseCanvas(b),
      h('span', { class: 'building-name' }, b.name),
      h('span', { class: 'building-owner' }, b.owner)))));
}
