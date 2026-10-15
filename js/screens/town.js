// Villa Pixelia vista desde lejos: cada edificio es clickeable y lleva a su interior.

import { h, pick } from '../util.js';
import { hud } from '../ui.js';
import { createStage } from '../scene.js';
import { TOWN_W, TOWN_H, TOWN_SPOTS, drawTownStatic, drawTownFrame } from '../art/town.js';
import { BUILDINGS, TOWN_NAME, TOWN_TIPS, NOTICE_BOARD } from '../data/town.js';
import { dialogBox } from './interior.js';
import { maxHp } from '../state.js';

const LABELS = Object.fromEntries(BUILDINGS.map((b) => [b.id, b.name]));
LABELS.tablon = 'Tablón de misiones';

export function townScreen(game) {
  const p = game.player;
  const stage = createStage(game, { w: TOWN_W, h: TOWN_H, drawStatic: drawTownStatic, drawFrame: drawTownFrame });
  const dialog = dialogBox(game, TOWN_NAME, null);

  const hint = p.hp < maxHp(p) * 0.35
    ? 'Estás bastante golpeado. La posada de Doña Berta, la del techo rojo, te deja como nuevo.'
    : p.statPoints > 0
      ? 'Tenés puntos de atributo sin repartir. Entrá a tu casa, la del techo verde.'
      : pick(TOWN_TIPS);

  const spots = TOWN_SPOTS.map((s) => h('button', {
    type: 'button',
    class: `hotspot hotspot-${s.id}${s.x + s.w > TOWN_W - 40 ? ' hotspot-edge-right' : s.x < 40 ? ' hotspot-edge-left' : ''}`,
    id: `go-${s.id}`,
    'aria-label': LABELS[s.id],
    style: {
      left: `${(s.x / TOWN_W) * 100}%`,
      top: `${(s.y / TOWN_H) * 100}%`,
      width: `${(s.w / TOWN_W) * 100}%`,
      height: `${(s.h / TOWN_H) * 100}%`,
    },
    onclick: () => {
      if (s.id === 'tablon') dialog.say(NOTICE_BOARD);
      else game.go(s.id);
    },
  }, h('span', { class: 'hotspot-label' }, LABELS[s.id])));

  setTimeout(() => dialog.say(hint), 150);

  return h('div', { class: 'screen town-screen' },
    hud(game),
    h('section', { class: 'stage-frame town-frame', 'aria-label': TOWN_NAME },
      h('div', { class: 'stage' }, stage.canvas, ...spots),
      dialog.el));
}
