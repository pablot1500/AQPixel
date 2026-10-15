import { h, pick } from '../util.js';
import { screen, npcHeader, button, backButton, toast } from '../ui.js';
import { BUILDINGS } from '../data/town.js';
import { STAT_IDS, STAT_INFO, trainCost, train } from '../state.js';

export function trainerScreen(game, params = {}) {
  const p = game.player;
  const building = BUILDINGS.find((b) => b.id === 'entrenador');
  const line = params.line ?? pick(building.lines);
  const cost = trainCost(p);

  const doTrain = (stat) => {
    const res = train(p, stat);
    toast(res.msg, res.ok ? 'good' : 'bad');
    if (res.ok) {
      game.save();
      game.refresh();
    }
  };

  return screen(game, 'trainer-screen',
    npcHeader(building, line),
    h('section', { class: 'panel stats-table' },
      h('p', { class: 'hint' }, `Cada sesión cuesta ${cost} de oro y sube 25 de oro con cada entrenamiento. Llevás ${p.trained}.`),
      ...STAT_IDS.map((id) => h('div', { class: 'stat-row' },
        h('span', { class: 'stat-short' }, STAT_INFO[id].short),
        h('span', { class: 'stat-value' }, p.stats[id]),
        h('div', { class: 'stat-info' }, h('strong', null, STAT_INFO[id].name), h('span', null, STAT_INFO[id].desc)),
        button(`+1 · ${cost}`, () => doTrain(id), { disabled: p.gold < cost, variant: 'buy' })))),
    h('div', { class: 'row-actions' }, backButton(game)));
}
