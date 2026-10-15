import { h, pick } from '../util.js';
import { updateHud } from '../ui.js';
import { interiorScreen } from './interior.js';
import { building } from '../data/town.js';
import { iconCanvas } from '../sprites.js';
import { innCost, maxHp, maxMp, healFull } from '../state.js';

export function innScreen(game, params = {}) {
  const p = game.player;
  const b = building('posada');
  const { view, dialog, scrollBody } = interiorScreen(game, {
    roomId: 'posada', speaker: b.owner, greeting: params.welcome ?? pick(b.lines), title: b.name,
  });

  function render() {
    const cost = innCost(p);
    const full = p.hp >= maxHp(p) && p.mp >= maxMp(p);
    const halfHp = Math.round(maxHp(p) / 2);
    const halfMp = Math.round(maxMp(p) / 2);
    const stableUseful = p.hp < halfHp || p.mp < halfMp;

    const rest = () => {
      if (p.gold < cost) { dialog.say(pick(b.poor)); return; }
      p.gold -= cost;
      healFull(p);
      game.save();
      updateHud(game);
      dialog.say(`${pick(b.thanks)} (Recuperaste toda la vida y el maná.)`);
      render();
    };
    const stable = () => {
      p.hp = Math.max(p.hp, halfHp);
      p.mp = Math.max(p.mp, halfMp);
      game.save();
      updateHud(game);
      dialog.say('Las vacas dicen que roncás. Algo descansaste, igual.');
      render();
    };

    scrollBody.replaceChildren(
      h('div', { class: 'wares' },
        service('Cama con colchón', 'Recuperás toda la vida y el maná.', cost,
          full ? 'Descansado' : 'Dormir', rest, full || p.gold < cost, 'btn-rest'),
        service('Establo', 'Gratis. Te deja con al menos la mitad de vida y maná.', 0,
          'Dormir', stable, !stableUseful, 'btn-stable')),
      h('p', { class: 'scroll-note' }, 'Tu partida se guarda sola en este navegador después de cada compra y combate.'));
  }

  render();
  return view;
}

function service(name, desc, price, label, onclick, disabled, id) {
  return h('div', { class: 'ware' },
    h('span', { class: 'ware-icon' }, iconCanvas('bed')),
    h('span', { class: 'ware-info' }, h('span', { class: 'ware-name' }, name), h('span', { class: 'ware-stats' }, desc)),
    h('span', { class: 'ware-buy' },
      h('span', { class: 'ware-price' }, iconCanvas('coin'), price || 'Gratis'),
      h('button', { type: 'button', class: 'seal', id, disabled, onclick }, label)));
}
