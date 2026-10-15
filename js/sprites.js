// Pixel art dibujado por código. Cada sprite es una grilla de caracteres;
// cada carácter es un color de la paleta y '.' es transparente.
// Las claves a/b/c (base, sombra, brillo) se pintan con la variante de elemento:
// un mismo dibujo sirve para el slime de musgo, el de lava y el glaciar.

import { ELEMENT_SWATCH } from './data/elements.js';
import { seeded, hashString } from './util.js';

const BASE = {
  o: '#1a1c2c', // contorno
  k: '#1a1c2c', // pupilas
  w: '#f4f4f4', // blanco
  r: '#b13e53', // rojo boca
  s: '#f4c99b', // piel
  h: '#7a4b2a', // pelo
  g: '#94b0c2', // metal
  y: '#ffcd75', // dorado
  z: '#d69a2d', // dorado oscuro
  p: '#333c57', // pantalón
  m: '#5d3a1f', // botas / madera
  f: '#41a6f6',
};

export const SPRITES = {
  hero: [
    '................',
    '.....oooooo.....',
    '....ohhhhhho....',
    '...ohhhhhhhho...',
    '...ohhhssssso...',
    '...ohhsskssko...',
    '...ohssssssso...',
    '....osssssso....',
    '...ooaaaaaaoo...',
    '..oaaaccaaaasso.',
    '..osaaaaaaaaoo..',
    '..ooaaaaaaaao...',
    '....ommmmmmo....',
    '....oppooppo....',
    '...ommmoommmo...',
    '...oooooooooo...',
  ],
  w_sword: [
    '..o..',
    '.oco.',
    '.oao.',
    '.oao.',
    '.oao.',
    '.oao.',
    '.oao.',
    '.obo.',
    'oyyyo',
    '.omo.',
    '.omo.',
    '..o..',
  ],
  w_bow: [
    'oo...',
    'wao..',
    'w.ao.',
    'w..ao',
    'w..ao',
    'w..ao',
    'w..ao',
    'w..ao',
    'w..ao',
    'w..ao',
    'w.ao.',
    'wao..',
    'oo...',
  ],
  slime: [
    '................',
    '................',
    '................',
    '................',
    '................',
    '......oooo......',
    '....oocccaoo....',
    '...ocaaaaaaao...',
    '..ocaaaaaaaaao..',
    '..oaawkaaawkao..',
    '.oaaawkaaawkaao.',
    '.oaaaaaaaaaaaao.',
    '.obaaaarraaaabo.',
    '.obbaaaaaaaabbo.',
    '..obbbbbbbbbbo..',
    '...oooooooooo...',
  ],
  mushroom: [
    '................',
    '.....oooooo.....',
    '...ooaaawaaoo...',
    '..oawwaaaaaaao..',
    '.oaawwaaaaawwao.',
    '.oaaaaaawwaaaao.',
    'obaaaaaawwaaaabo',
    'obbbbbbbbbbbbbbo',
    '.oooossssssoooo.',
    '....oswkswks....',
    '....osssssso....',
    '....ossrrsso....',
    '....osssssso....',
    '....ossoosso....',
    '....oooooooo....',
    '................',
  ],
  wolf: [
    '................',
    '...o..o.........',
    '..oao.oao.....o.',
    '..oaaoaaao...oao',
    '.oaaaaaaaoooooao',
    'oaawkaaaaaaaaaao',
    'oaaaaaaaaaaaaao.',
    'ooooaaaaaaaaaao.',
    '..oooaaaaaaaabo.',
    '....obbaaaaabbo.',
    '....obbbbbbbbbo.',
    '....obo.obo.obo.',
    '....obo.obo.obo.',
    '...ooo.ooo.ooo..',
    '................',
    '................',
  ],
  crab: [
    '................',
    '.ooo........ooo.',
    'oaaco......ocaao',
    'oaoao......oaoao',
    'oaaao.o..o.oaaao',
    '.oao.owoowo.oao.',
    '..oo.okooko.oo..',
    '...oooaaaaooo...',
    '..oaaaaaaaaaao..',
    '.oaccaaaaaaccao.',
    '.oaaaaaaaaaaaao.',
    '.obaaaaaaaaaabo.',
    '..obbbbbbbbbbo..',
    '.o.o.o....o.o.o.',
    'o.o.o......o.o.o',
    '................',
  ],
  imp: [
    '................',
    '....o....o......',
    '...oco..oco.....',
    '...oaaaaaao.....',
    '..oaaaaaaaao....',
    '..owkaawkaao....',
    '..oaaaaaaaao....',
    '..okwkwaaaao....',
    '...oaaaaaao.....',
    '....obaaabo.....',
    '..ooaaaaaaaoo.o.',
    '...oobaaaboo.oao',
    '....obbbbbbooo..',
    '....oao.oao.....',
    '...ooo..ooo.....',
    '................',
  ],
  bat: [
    '................',
    '................',
    '................',
    '......o..o......',
    '.o...oaooao...o.',
    '.oo..oaaaao..oo.',
    '.oao.oraaro.oao.',
    '.oaaooaaaaooaao.',
    '.oaaaaawwaaaaao.',
    '.obaaaaaaaaaabo.',
    '.obbo.oaao.obbo.',
    '.oo...obbo...oo.',
    '.o.....oo.....o.',
    '................',
    '................',
    '................',
  ],
  yeti: [
    '................',
    '.....oooooo.....',
    '....oaaaaaao....',
    '...oaaaaaaaao...',
    '...oaffffffao...',
    '...oafkffkfao...',
    '...oaffffffao...',
    '..ooafwwwwfaoo..',
    '.oaaaaffffaaaao.',
    'oaaoaaaaaaaaoaao',
    'oaaoaaaaaaaaoaao',
    'obboaaaaaaaaobbo',
    'ooo.oaaaaaao.ooo',
    '....obbo.obbo...',
    '...oobbo.obboo..',
    '...ooooo.ooooo..',
  ],
  skeleton: [
    '................',
    '.....oooooo.....',
    '....oaaaaaao....',
    '...oaaaaaaaao...',
    '...orkaarkaao...',
    '...oaaaaaaaao...',
    '....oakakaao....',
    '.....oooooo.....',
    '......oao.......',
    '...ooaaaaaoo....',
    '..oaokakakoao...',
    '..oaoakakaoao...',
    '..oo.oaaao.oo...',
    '.....oa.ao......',
    '.....oa.ao......',
    '....ooo.ooo.....',
  ],
  ghost: [
    '................',
    '......oooo......',
    '....ooaaaaoo....',
    '...oaaaaaaaao...',
    '..oaaaaaaaaaao..',
    '..oakkaaakkaao..',
    '..oakkaaakkaao..',
    '.oaaaaaaaaaaaao.',
    '.oaaaaakkaaaaao.',
    '.oaaaaakkaaaaao.',
    '.oaaaaaaaaaaaao.',
    '.obaaaaaaaaaabo.',
    '.obbaaabbaaabbo.',
    '.obbbobbbbobbbo.',
    '.oooo.oooo.oooo.',
    '................',
  ],

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

  // ---------- Íconos 8×8 ----------
  i_sword: [
    '......oo',
    '.....oco',
    '....oao.',
    'o..oao..',
    'oyoao...',
    '.oyo....',
    'omoyo...',
    'oo.oo...',
  ],
  i_bow: [
    'oaao....',
    'ow.ao...',
    '.ow.ao..',
    '..ow.ao.',
    '..ow.ao.',
    '.ow.ao..',
    'ow.ao...',
    'oaao....',
  ],
  i_armor: [
    '.oo..oo.',
    'oaaooaao',
    'oaaaaaao',
    '.oaccao.',
    '.oaaaao.',
    '.oaaaao.',
    '.obbbbo.',
    '..oooo..',
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
  i_potion: [
    '..oooo..',
    '..ommo..',
    '..owwo..',
    '.oaaaao.',
    'oacaaaao',
    'oaaaaabo',
    'oabbbbbo',
    '.oooooo.',
  ],
  i_coin: [
    '..oooo..',
    '.oyyyyo.',
    'oywyyyzo',
    'oywyyyzo',
    'oyyyyyzo',
    'oyyyyzzo',
    '.ozzzzo.',
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
  i_anvil: [
    '........',
    'ooooooo.',
    'oggggggo',
    '.oggggo.',
    '..oggo..',
    '.oggggo.',
    'oooooooo',
    '........',
  ],
  i_dumbbell: [
    '........',
    'oo....oo',
    'ggo..ogg',
    'gggggggg',
    'ggo..ogg',
    'oo....oo',
    '........',
    '........',
  ],
  i_map: [
    '........',
    '.oooooo.',
    'oyyyyyyo',
    'oyryyyyo',
    'oyyryyyo',
    'oyyyrrro',
    '.oooooo.',
    '........',
  ],
  i_bag: [
    '...oo...',
    '..o..o..',
    '.oooooo.',
    'ommmmmmo',
    'ommyymmo',
    'ommmmmmo',
    'ommmmmmo',
    '.oooooo.',
  ],
};

// Los sprites de 16 px que dan la cara al jugador ya miran a la izquierda.
const SPRITE_DEFAULTS = {
  hero: { a: '#3b5dc9', b: '#29366f', c: '#41a6f6' },
};

export function swatchFor(element, override) {
  return { ...(ELEMENT_SWATCH[element] ?? ELEMENT_SWATCH.neutral), ...(override ?? {}) };
}

function paint(ctx, rows, pal, ox = 0, oy = 0) {
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = pal[row[x]];
      if (!color || row[x] === '.') continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  });
}

function makeCanvas(w, h, className = 'px') {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.className = className;
  return c;
}

export function spriteCanvas(name, colors = {}, className) {
  const rows = SPRITES[name];
  const c = makeCanvas(Math.max(...rows.map((r) => r.length)), rows.length, className);
  paint(c.getContext('2d'), rows, { ...BASE, ...SPRITE_DEFAULTS[name], ...colors });
  return c;
}

export function monsterCanvas(monster, className) {
  return spriteCanvas(monster.sprite, swatchFor(monster.element, monster.pal), className);
}

export function itemColors(item) {
  return swatchFor(item.element, item.tint);
}

export function iconCanvas(name, colors = {}, className = 'px icon') {
  return spriteCanvas(`i_${name}`, colors, className);
}

export function itemIcon(item) {
  return iconCanvas(item.icon, itemColors(item));
}

// El héroe se arma con su armadura (color del cuerpo) y su arma (espada o arco, color del elemento).
export function heroCanvas(weapon, armor, className) {
  const c = makeCanvas(16, 16, className);
  const ctx = c.getContext('2d');
  const armorColors = armor && armor.id !== 'ropa_aventurero' ? itemColors(armor) : SPRITE_DEFAULTS.hero;
  paint(ctx, SPRITES.hero, { ...BASE, ...armorColors });
  if (weapon?.type === 'ranged') paint(ctx, SPRITES.w_bow, { ...BASE, ...itemColors(weapon) }, 11, 3);
  else if (weapon) paint(ctx, SPRITES.w_sword, { ...BASE, ...itemColors(weapon) }, 11, 0);
  return c;
}

// ---------- Edificios del pueblo ----------
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * amount)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function houseCanvas(building) {
  const W = 40, H = 32;
  const c = makeCanvas(W, H, 'px house');
  const ctx = c.getContext('2d');
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
  const ink = BASE.o;

  // Pasto
  rect(0, 28, W, 4, '#38b764');
  rect(0, 28, W, 1, '#5aa83a');
  // Pared
  rect(5, 13, 30, 16, ink);
  rect(6, 14, 28, 14, building.wall);
  rect(6, 26, 28, 2, shade(building.wall, 0.8));
  // Techo escalonado
  for (let i = 0; i < 9; i++) {
    rect(Math.max(0, 18 - i * 2), 4 + i, Math.min(W, 4 + i * 4), 1, ink);
  }
  for (let i = 0; i < 9; i++) {
    const w = 2 + i * 4;
    rect(20 - w / 2, 5 + i, w, 1, i < 2 ? shade(building.roof, 1.25) : building.roof);
  }
  rect(1, 13, 38, 2, ink);
  rect(2, 13, 36, 1, shade(building.roof, 0.7));
  // Chimenea
  rect(27, 3, 4, 6, ink);
  rect(28, 4, 2, 4, '#c2c9d6');
  // Puerta
  rect(16, 19, 8, 10, ink);
  rect(17, 20, 6, 9, '#7a4b2a');
  rect(21, 24, 1, 1, '#ffcd75');
  // Cartel con ícono a la izquierda y ventana a la derecha
  rect(7, 16, 10, 10, ink);
  rect(8, 17, 8, 8, '#f0d8a8');
  const icon = SPRITES[`i_${building.icon}`];
  if (icon) paint(ctx, icon, { ...BASE, ...swatchFor(building.icon === 'orb' ? 'oscuridad' : 'fuego') }, 8, 17);
  rect(26, 17, 7, 7, ink);
  rect(27, 18, 5, 5, '#a6e6ff');
  rect(29, 18, 1, 5, ink);
  rect(27, 20, 5, 1, ink);
  return c;
}

// ---------- Fondos de zona ----------
export function backgroundCanvas(zone, className = 'px bg') {
  const W = 160, H = 90;
  const c = makeCanvas(W, H, className);
  const ctx = c.getContext('2d');
  const rand = seeded(hashString(zone.id));
  const { sky, far, ground, deco, sea } = zone.bg;
  const rect = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };

  // Cielo en bandas con tramado
  rect(0, 0, W, 60, sky[0]);
  for (let y = 30; y < 60; y++) {
    for (let x = (y % 2); x < W; x += 2) {
      if (y > 45 || (x + y) % 4 === 0) rect(x, y, 1, 1, sky[1]);
    }
  }
  // Nubes o estrellas
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(rand() * W), y = Math.floor(rand() * 25) + 3;
    if (deco === 'tomb' || deco === 'lava') rect(x, y, 1, 1, '#f4f4f4');
    else { rect(x, y, 12, 3, '#ffffff'); rect(x + 3, y - 2, 6, 2, '#ffffff'); }
  }
  // Horizonte lejano
  if (sea) {
    rect(0, 46, W, 14, far);
    for (let x = 0; x < W; x += 6) rect(x + Math.floor(rand() * 3), 48 + Math.floor(rand() * 10), 3, 1, '#a6e6ff');
  } else {
    let hgt = 12;
    for (let x = 0; x < W; x++) {
      hgt = Math.max(4, Math.min(22, hgt + (rand() < 0.5 ? -1 : 1) * (rand() < 0.4 ? 1 : 0)));
      rect(x, 60 - hgt, 1, hgt, far);
    }
  }
  // Suelo
  rect(0, 60, W, 30, ground[0]);
  rect(0, 60, W, 1, ground[1]);
  for (let i = 0; i < 140; i++) {
    rect(Math.floor(rand() * W), 61 + Math.floor(rand() * 29), 2, 1, ground[1]);
  }

  // Decoración según la zona, en los bordes para no tapar a los luchadores
  const spots = [6, 22, 132, 148, 70, 90];
  spots.forEach((x, i) => {
    const y = i < 4 ? 60 : 58;
    if (i >= 4 && deco !== 'tomb' && deco !== 'crystal') return;
    drawDeco(ctx, deco, x + Math.floor(rand() * 6), y, rand);
  });
  if (deco === 'lava') {
    for (let x = 0; x < W; x += 1) if (Math.sin(x / 7) > 0.6) rect(x, 84 + Math.floor(Math.sin(x / 3) * 2), 1, 2, '#ef7d57');
  }
  return c;
}

function drawDeco(ctx, deco, x, y, rand) {
  const rect = (rx, ry, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(rx, ry, w, h); };
  const ink = BASE.o;
  if (deco === 'tree') {
    rect(x + 4, y - 8, 3, 9, '#7a4b2a');
    for (let i = 0; i < 6; i++) rect(x + 5 - i, y - 22 + i * 2, 1 + i * 2, 2, i % 2 ? '#257179' : '#38b764');
    rect(x, y - 12, 11, 4, '#257179');
  } else if (deco === 'rock') {
    rect(x, y - 6, 10, 6, '#566c86');
    rect(x + 1, y - 7, 7, 1, '#94b0c2');
    rect(x + 1, y - 6, 3, 2, '#94b0c2');
  } else if (deco === 'lava') {
    rect(x, y - 10, 8, 10, '#333c57');
    rect(x + 2, y - 12, 4, 2, '#333c57');
    rect(x + 3, y - 8, 2, 8, '#ef7d57');
  } else if (deco === 'crystal') {
    const h = 8 + Math.floor(rand() * 8);
    for (let i = 0; i < h; i++) {
      const w = Math.max(1, Math.min(i, h - i, 4));
      rect(x + 4 - Math.floor(w / 2), y - i, w, 1, i % 3 ? '#73eff7' : '#f4f4f4');
    }
  } else if (deco === 'tomb') {
    rect(x, y - 9, 8, 9, ink);
    rect(x + 1, y - 8, 6, 8, '#566c86');
    rect(x + 3, y - 7, 2, 5, ink);
    rect(x + 2, y - 6, 4, 1, ink);
  }
}
