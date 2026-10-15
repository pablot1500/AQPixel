import { load, save, wipe, newPlayer } from './state.js';
import { titleScreen } from './screens/title.js';
import { townScreen } from './screens/town.js';
import { shopScreen } from './screens/shop.js';
import { innScreen } from './screens/inn.js';
import { trainerScreen } from './screens/trainer.js';
import { backpackScreen } from './screens/backpack.js';
import { mapScreen } from './screens/map.js';
import { zoneScreen } from './screens/zone.js';
import { battleScreen } from './screens/battle.js';

const SCREENS = {
  titulo: titleScreen,
  pueblo: townScreen,
  posada: innScreen,
  herrero: (game, params) => shopScreen(game, { ...params, shopId: 'herrero' }),
  magia: (game, params) => shopScreen(game, { ...params, shopId: 'magia' }),
  entrenador: trainerScreen,
  mochila: backpackScreen,
  mapa: mapScreen,
  zona: zoneScreen,
  batalla: battleScreen,
};

const app = document.getElementById('app');

const game = {
  player: load(),
  current: null,
  onLeave: null,
  go(name, params = {}) {
    game.current = { name, params };
    render();
    window.scrollTo(0, 0);
  },
  refresh() {
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
  },
  save() {
    if (game.player) save(game.player);
  },
  newGame(name) {
    wipe();
    game.player = newPlayer(name);
    game.save();
    game.go('pueblo');
  },
};

function render() {
  game.onLeave?.();
  game.onLeave = null;
  const { name, params } = game.current;
  const needsPlayer = name !== 'titulo';
  const view = needsPlayer && !game.player ? titleScreen(game) : SCREENS[name](game, params);
  app.replaceChildren(view);
}

game.go('titulo');
