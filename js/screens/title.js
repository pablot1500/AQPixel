import { h } from '../util.js';
import { button } from '../ui.js';
import { NEWS } from '../data/town.js';
import { MONSTERS } from '../data/monsters.js';
import { ITEMS } from '../data/items.js';
import { heroCanvas, monsterCanvas } from '../sprites.js';

export function titleScreen(game) {
  const saved = game.player;
  const parade = h('div', { class: 'parade', 'aria-hidden': 'true' },
    heroCanvas(ITEMS.espada_fuego, ITEMS.cota_malla, 'px', game),
    ...['slime_musgo', 'murcielago_igneo', 'slime_glaciar', 'fantasma']
      .map((id) => monsterCanvas(MONSTERS[id], 'px', game)));

  const nameInput = h('input', {
    id: 'hero-name', class: 'input', maxlength: '16', autocomplete: 'off',
    placeholder: 'Tu nombre de aventurero', 'aria-label': 'Nombre del personaje',
  });
  const warning = h('p', { class: 'warn', hidden: true }, 'Esto borra la partida guardada. Tocá de nuevo para confirmar.');
  let confirming = false;
  const startNew = () => {
    if (saved && !confirming) {
      confirming = true;
      warning.hidden = false;
      newBtn.textContent = 'Sí, empezar de cero';
      return;
    }
    game.newGame(nameInput.value || 'Aventurero');
  };
  const newBtn = button(saved ? 'Nueva partida' : '¡A la aventura!', startNew, { variant: saved ? 'ghost' : 'primary' });
  const form = h('form', { class: 'title-form', onsubmit: (ev) => { ev.preventDefault(); startNew(); } },
    h('label', { class: 'label', for: 'hero-name' }, 'Nombre'),
    nameInput, newBtn, warning);

  return h('div', { class: 'screen title-screen' },
    h('section', { class: 'title-hero panel' },
      h('h1', { class: 'logo' }, h('span', null, 'AQ'), 'PIXEL'),
      h('p', { class: 'tagline' }, 'Un RPG de turnos para ratos libres. Elegí bien el elemento y pegá fuerte.'),
      parade,
      saved
        ? h('div', { class: 'continue' },
          button(`Continuar: ${saved.name} · Nv ${saved.level}`, () => game.go('pueblo'), { variant: 'primary', id: 'btn-continue' }))
        : null,
      form),
    h('section', { class: 'news panel' },
      h('h2', { class: 'section-title' }, 'Novedades'),
      ...NEWS.map((n) => h('article', { class: 'news-item' }, h('h3', null, n.title), h('p', null, n.body)))));
}
