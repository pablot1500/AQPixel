import { h, pick } from '../util.js';
import { updateHud } from '../ui.js';
import { interiorScreen } from './interior.js';
import { building } from '../data/town.js';
import { iconCanvas } from '../sprites.js';
import { STAT_IDS, STAT_INFO, trainCost, train } from '../state.js';

export function trainerScreen(game) {
  const p = game.player;
  const b = building('entrenador');
  const { view, dialog, scrollBody } = interiorScreen(game, {
    roomId: 'entrenador', speaker: b.owner, greeting: pick(b.lines), title: b.name,
  });

  function render() {
    const cost = trainCost(p);
    scrollBody.replaceChildren(
      h('p', { class: 'scroll-note' }, `Cada sesión suma 1 punto y cuesta ${cost} de oro. El precio sube con cada entrenamiento (llevás ${p.trained}).`),
      h('div', { class: 'wares' },
        ...STAT_IDS.map((id) => h('div', { class: 'ware' },
          h('span', { class: 'stat-badge' }, STAT_INFO[id].short),
          h('span', { class: 'ware-info' },
            h('span', { class: 'ware-name' }, `${STAT_INFO[id].name} `, h('strong', { class: 'stat-num' }, p.stats[id])),
            h('span', { class: 'ware-stats' }, STAT_INFO[id].desc)),
          h('span', { class: 'ware-buy' },
            h('span', { class: 'ware-price' }, iconCanvas('coin'), cost),
            h('button', {
              type: 'button', class: 'seal', disabled: p.gold < cost, id: `train-${id}`,
              onclick: () => {
                const res = train(p, id);
                if (!res.ok) { dialog.say(pick(b.poor)); return; }
                game.save();
                updateHud(game);
                dialog.say(b.trained[id]);
                render();
              },
            }, '+1'))))));
  }

  render();
  return view;
}
