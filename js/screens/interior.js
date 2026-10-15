// Estructura común de los interiores: escena con el dueño detrás del mostrador,
// cuadro de diálogo debajo y un pergamino a la derecha con lo que se puede hacer.

import { h } from '../util.js';
import { hud } from '../ui.js';
import { createStage } from '../scene.js';
import { ROOMS, ROOM_W, ROOM_H } from '../art/interiors.js';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function dialogBox(game, speaker, stage) {
  const text = h('p', { class: 'dialog-text' });
  let timer = 0;
  let full = '';
  const finish = () => {
    clearInterval(timer);
    text.textContent = full;
    el.classList.remove('is-typing');
    if (stage) stage.state.talking = false;
  };
  const el = h('div', { class: 'dialog', role: 'status', 'aria-live': 'polite', onclick: finish },
    speaker ? h('span', { class: 'dialog-name' }, speaker) : null,
    text,
    h('span', { class: 'dialog-next', 'aria-hidden': 'true' }, '▼'));
  game.addCleanup(() => clearInterval(timer));

  function say(message) {
    clearInterval(timer);
    full = message;
    if (reducedMotion()) {
      finish();
      return;
    }
    let i = 0;
    text.textContent = '';
    el.classList.add('is-typing');
    if (stage) stage.state.talking = true;
    timer = setInterval(() => {
      i += 2;
      text.textContent = full.slice(0, i);
      if (i >= full.length) finish();
    }, 28);
  }
  return { el, say };
}

export function ribbons(options, active, onpick) {
  return h('div', { class: 'ribbons', role: 'tablist' },
    ...options.map(([id, label]) => h('button', {
      type: 'button', role: 'tab', class: `ribbon${id === active ? ' is-active' : ''}`,
      'aria-selected': id === active ? 'true' : 'false', onclick: () => onpick(id),
    }, label)));
}

export function interiorScreen(game, { roomId, speaker, greeting, title, state = {} }) {
  const room = ROOMS[roomId];
  const stage = createStage(game, {
    w: ROOM_W, h: ROOM_H, drawStatic: room.drawStatic, drawFrame: room.drawFrame,
    state: { talking: false, ...state },
  });
  const dialog = dialogBox(game, speaker, stage);
  const scrollBody = h('div', { class: 'scroll-body' });
  const exit = h('button', { type: 'button', class: 'exit-sign', id: 'btn-exit', onclick: () => game.go('pueblo') }, '◄ Salir');

  const onKey = (ev) => { if (ev.key === 'Escape') game.go('pueblo'); };
  document.addEventListener('keydown', onKey);
  game.addCleanup(() => document.removeEventListener('keydown', onKey));

  const view = h('div', { class: 'screen interior-screen' },
    hud(game),
    h('div', { class: 'interior' },
      h('section', { class: 'stage-frame', 'aria-label': title },
        h('div', { class: 'stage' }, stage.canvas, exit),
        dialog.el),
      h('aside', { class: 'scroll', 'aria-label': 'Pergamino' },
        h('div', { class: 'scroll-roll', 'aria-hidden': 'true' }),
        h('div', { class: 'scroll-paper' }, h('h1', { class: 'scroll-title' }, title), scrollBody),
        h('div', { class: 'scroll-roll', 'aria-hidden': 'true' }))));

  setTimeout(() => dialog.say(greeting), 150);
  return { view, stage, dialog, scrollBody };
}
