// Villa Pixelia vista desde lejos: cada edificio es clickeable y lleva a su interior.
// El ancho de la escena se adapta a la pantalla: el pueblo queda en el centro y a los costados
// aparecen campos, el molino, el estanque y el bosque.

import { h, pick } from '../util.js';
import { hud } from '../ui.js';
import { createStage } from '../scene.js';
import {
  TOWN_W, TOWN_H, TOWN_MAX_W, TOWN_SPOTS, townLayout, drawTownStatic, drawTownFrame,
} from '../art/town.js';
import { BUILDINGS, TOWN_NAME, TOWN_TIPS, NOTICE_BOARD } from '../data/town.js';
import { dialogBox } from './interior.js';
import { maxHp } from '../state.js';

const LABELS = Object.fromEntries(BUILDINGS.map((b) => [b.id, b.name]));
LABELS.tablon = 'Tablón de misiones';

// Calcula cuántos píxeles nativos de ancho entran para que la escena llene la pantalla
// sin pasarse del alto disponible.
function sceneWidth() {
  const availW = Math.max(280, Math.min(window.innerWidth, 1800) - 60);
  const availH = Math.max(220, window.innerHeight - 290);
  let scale = availH / TOWN_H;
  if (availW / scale < TOWN_W) scale = availW / TOWN_W;
  return Math.max(TOWN_W, Math.min(TOWN_MAX_W, Math.round(availW / scale)));
}

export function townScreen(game, params = {}) {
  const p = game.player;
  const W = sceneWidth();
  const layout = townLayout(W);
  const stage = createStage(game, {
    w: W, h: TOWN_H,
    drawStatic: (P) => drawTownStatic(P, W),
    drawFrame: drawTownFrame,
    state: { layout },
  });
  const dialog = dialogBox(game, TOWN_NAME, null);

  const hint = params.hint ?? (p.hp < maxHp(p) * 0.35
    ? 'Estás bastante golpeado. La posada de Doña Berta, la del techo rojo, te deja como nuevo.'
    : p.statPoints > 0
      ? 'Tenés puntos de atributo sin repartir. Entrá a tu casa, la del techo verde.'
      : pick(TOWN_TIPS));

  const spots = TOWN_SPOTS.map((s) => {
    const x = layout.ox + s.x;
    const edge = x + s.w > W - 40 ? ' hotspot-edge-right' : x < 40 ? ' hotspot-edge-left' : '';
    return h('button', {
      type: 'button',
      class: `hotspot hotspot-${s.id}${edge}`,
      id: `go-${s.id}`,
      'aria-label': LABELS[s.id],
      style: {
        left: `${(x / W) * 100}%`,
        top: `${(s.y / TOWN_H) * 100}%`,
        width: `${(s.w / W) * 100}%`,
        height: `${(s.h / TOWN_H) * 100}%`,
      },
      onclick: () => {
        if (s.id === 'tablon') dialog.say(NOTICE_BOARD);
        else game.go(s.id);
      },
    }, h('span', { class: 'hotspot-label' }, LABELS[s.id]));
  });

  // Si cambia el tamaño de la ventana, se vuelve a armar la escena con el ancho nuevo.
  let timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Math.abs(sceneWidth() - W) > 8) game.go('pueblo', { hint });
    }, 250);
  };
  window.addEventListener('resize', onResize);
  game.addCleanup(() => {
    clearTimeout(timer);
    window.removeEventListener('resize', onResize);
  });

  setTimeout(() => dialog.say(hint), 150);

  return h('div', { class: 'screen town-screen' },
    hud(game),
    h('section', { class: 'stage-frame town-frame', 'aria-label': TOWN_NAME },
      h('div', { class: 'stage' }, stage.canvas, ...spots),
      dialog.el));
}
