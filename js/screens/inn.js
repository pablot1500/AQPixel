import { h, pick } from '../util.js';
import { screen, npcHeader, button, backButton, toast } from '../ui.js';
import { BUILDINGS } from '../data/town.js';
import { innCost, maxHp, maxMp, healFull } from '../state.js';

export function innScreen(game, params = {}) {
  const p = game.player;
  const building = BUILDINGS.find((b) => b.id === 'posada');
  const line = params.line ?? pick(building.lines);
  const cost = innCost(p);
  const full = p.hp >= maxHp(p) && p.mp >= maxMp(p);
  const halfHp = Math.round(maxHp(p) / 2);
  const halfMp = Math.round(maxMp(p) / 2);
  const stableUseful = p.hp < halfHp || p.mp < halfMp;

  const rest = () => {
    p.gold -= cost;
    healFull(p);
    game.save();
    toast('Dormiste como un tronco. Vida y maná al máximo.', 'good');
    game.go('posada', { line: 'Buen día, dormilón. Te guardé el desayuno.' });
  };
  const stable = () => {
    p.hp = Math.max(p.hp, halfHp);
    p.mp = Math.max(p.mp, halfMp);
    game.save();
    toast('Dormiste con las vacas. Algo es algo.', 'good');
    game.go('posada', { line: 'Las vacas dicen que roncás.' });
  };

  return screen(game, 'inn-screen',
    npcHeader(building, params.welcome ?? line),
    h('section', { class: 'options panel' },
      h('div', { class: 'option' },
        h('div', null, h('h2', { class: 'option-title' }, 'Cama con colchón'), h('p', null, 'Recuperás toda la vida y el maná.')),
        button(full ? 'Ya estás descansado' : `Descansar · ${cost} oro`, rest, { variant: 'primary', disabled: full || p.gold < cost })),
      h('div', { class: 'option' },
        h('div', null, h('h2', { class: 'option-title' }, 'Establo'), h('p', null, 'Gratis. Te deja con al menos la mitad de vida y maná.')),
        button('Dormir en el establo', stable, { disabled: !stableUseful }))),
    h('p', { class: 'hint' }, 'Tu partida se guarda sola en este navegador después de cada compra y combate.'),
    h('div', { class: 'row-actions' }, backButton(game)));
}
