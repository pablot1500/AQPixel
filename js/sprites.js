// Puerta de entrada al arte del juego: arma lienzos con el héroe, los monstruos y los íconos.
// Los dibujos viven en js/art/; acá se eligen colores según el elemento y se animan.

import { ELEMENT_SWATCH } from './data/elements.js';
import { painter, makeCanvas } from './art/paint.js';
import { drawHero, drawMonster, CREATURE_SIZE } from './art/creatures.js';
import { drawIcon, ICON_ART, ICON_SIZE } from './art/icons.js';
import { animateCanvas } from './scene.js';

export { backgroundCanvas, BATTLEFIELDS } from './art/battlefield.js';

const BASE = {
  o: '#1a1c2c', k: '#1a1c2c', w: '#f4f4f4', r: '#b13e53', g: '#94b0c2',
  y: '#ffcd75', z: '#d69a2d', m: '#5d3a1f',
};

// Sprites chicos en grilla, para los carteles colgantes del pueblo y el destello de impacto.
export const SPRITES = {
  burst: [
    '....c....',
    '.c..a..c.',
    '..c.a.c..',
    '...aca...',
    'caaacaaac',
    '...aca...',
    '..c.a.c..',
    '.c..a..c.',
    '....c....',
  ],
  i_orb: [
    '..oooo..',
    '.occaao.',
    'occaaaao',
    'ocaaaabo',
    'oaaaaabo',
    'oaaaabbo',
    '.obbbbo.',
    '..oooo..',
  ],
  i_bed: [
    '........',
    'o.......',
    'oww.....',
    'owwaaaao',
    'oaaaaaao',
    'oooooooo',
    'o......o',
    '........',
  ],
};

const HERO_DEFAULT = { a: '#3b5dc9', b: '#29366f', c: '#41a6f6' };

export function swatchFor(element, override) {
  return { ...(ELEMENT_SWATCH[element] ?? ELEMENT_SWATCH.neutral), ...(override ?? {}) };
}

export function itemColors(item) {
  return swatchFor(item.element, item.tint);
}

export function spriteCanvas(name, colors = {}, className) {
  const rows = SPRITES[name];
  const c = makeCanvas(Math.max(...rows.map((r) => r.length)), rows.length, className);
  painter(c.getContext('2d')).sprite(rows, { ...BASE, ...colors }, 0, 0);
  return c;
}

export function iconCanvas(name, colors = {}, className = 'px icon') {
  if (!ICON_ART[name]) return spriteCanvas(`i_${name}`, colors, className);
  const c = makeCanvas(ICON_SIZE, ICON_SIZE, className);
  drawIcon(painter(c.getContext('2d')), name, swatchFor('neutral', colors));
  return c;
}

export function itemIcon(item) {
  return iconCanvas(item.icon, itemColors(item));
}

export function heroLook(weapon, armor) {
  return {
    weapon,
    armor,
    armorColors: armor && armor.id !== 'ropa_aventurero' ? itemColors(armor) : HERO_DEFAULT,
    weaponColors: weapon ? itemColors(weapon) : null,
  };
}

// Sin game: dibujo quieto. Con game: animado hasta que se cambia de pantalla.
export function heroCanvas(weapon, armor, className, game) {
  const c = makeCanvas(CREATURE_SIZE, CREATURE_SIZE, className);
  const ctx = c.getContext('2d');
  const P = painter(ctx);
  const look = heroLook(weapon, armor);
  const draw = (t) => {
    ctx.clearRect(0, 0, CREATURE_SIZE, CREATURE_SIZE);
    drawHero(P, { ...look, t });
  };
  draw(0);
  if (game) animateCanvas(game, c, draw);
  return c;
}

export function monsterCanvas(monster, className, game) {
  const c = makeCanvas(CREATURE_SIZE, CREATURE_SIZE, className);
  const ctx = c.getContext('2d');
  const P = painter(ctx);
  const colors = swatchFor(monster.element, monster.pal);
  const draw = (t) => {
    ctx.clearRect(0, 0, CREATURE_SIZE, CREATURE_SIZE);
    drawMonster(P, monster.sprite, colors, monster.element, t);
  };
  draw(0.4);
  if (game) animateCanvas(game, c, draw);
  return c;
}
