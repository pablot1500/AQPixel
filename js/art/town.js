// Villa Pixelia vista desde lejos. drawStatic pinta todo lo que no se mueve una sola vez;
// drawFrame agrega lo animado (humo, fuego, agua, banderas, vecinos) en cada cuadro.

import { seeded } from '../util.js';
import {
  INK, PAL, shade, stones, planks, timber, roof, windowPane, door, chimney, signBoard, hangingSign,
  tree, pine, bush, barrel, crate, lampPost, fence, flowers,
} from './paint.js';
import { SPRITES, swatchFor } from '../sprites.js';

export const TOWN_W = 320;
export const TOWN_H = 200;

// Zonas clickeables (coordenadas del lienzo nativo).
export const TOWN_SPOTS = [
  { id: 'magia', x: 8, y: 2, w: 82, h: 92 },
  { id: 'posada', x: 100, y: 14, w: 114, h: 80 },
  { id: 'herrero', x: 224, y: 22, w: 94, h: 72 },
  { id: 'entrenador', x: 4, y: 100, w: 96, h: 56 },
  { id: 'mochila', x: 224, y: 104, w: 72, h: 50 },
  { id: 'tablon', x: 136, y: 166, w: 48, h: 30 },
  { id: 'mapa', x: 252, y: 156, w: 68, h: 44 },
];

const STONE_WARM = { base: '#a89a8a', dark: '#7a6c60', light: '#c8bcae', mortar: '#5e5248' };
const STONE_GREY = { base: '#8b8fa3', dark: '#5d6175', light: '#b4b8c8', mortar: '#44485a' };
const STONE_ARCANE = { base: '#8a7fa8', dark: '#5e5480', light: '#b0a6cc', mortar: '#3e3658' };

const icon = (name) => SPRITES[`i_${name}`];

// Recorridos de los vecinos que pasean por la plaza.
const WALKERS = [
  { path: [[157, 98], [157, 130], [140, 150], [118, 148]], speed: 9, shirt: '#b13e53', hair: '#7a4b2a' },
  { path: [[206, 150], [186, 160], [134, 162], [112, 152], [134, 136], [186, 136]], speed: 7, shirt: '#3b5dc9', hair: '#ffcd75', loop: true },
  { path: [[60, 152], [96, 156]], speed: 6, shirt: '#38b764', hair: '#1a1c2c' },
];

export function drawTownStatic(P) {
  const rand = seeded(7);
  drawSkyAndHills(P, rand);
  drawGround(P, rand);
  drawPaths(P, rand);
  drawPlaza(P, rand);

  // Fila del fondo
  pine(P, 94, 92, 26);
  pine(P, 218, 90, 22);
  drawMagicTower(P, rand);
  drawInn(P, rand);
  drawSmithy(P, rand);

  // Fila del medio
  drawGym(P, rand);
  drawHouse(P, rand);
  lampPost(P, 112, 140);
  lampPost(P, 210, 140);
  bush(P, 104, 128, 4, rand, '#ef7d57');
  bush(P, 218, 130, 4, rand, '#f080b0');
  drawFountainBase(P);

  // Primer plano
  drawNoticeBoard(P, rand);
  flowers(P, 92, 176, 40, 18, rand, 22);
  flowers(P, 190, 178, 50, 16, rand, 16);
  bush(P, 106, 190, 6, rand);
  bush(P, 214, 192, 5, rand, '#b07ad0');
  tree(P, 18, 198, 16, rand);
  tree(P, 66, 200, 12, rand, ['#2a5a2a', '#3a7d3a', '#5aa83a', '#a7f070']);
  bush(P, 40, 194, 5, rand);
  drawGate(P, rand);
}

// ---------- Cielo, montañas y suelo ----------
function drawSkyAndHills(P, rand) {
  const bands = ['#5fb4ef', '#72c0f2', '#86ccf6', '#9ad6fa', '#b0e0fb'];
  bands.forEach((c, i) => P.rect(0, i * 7, 320, 7, c));
  for (let i = 1; i < bands.length; i++) P.dither(0, i * 7 - 1, 320, 2, bands[i], i);

  // Cordillera lejana con nieve
  const far = [[0, 30], [24, 18], [46, 26], [72, 12], [100, 24], [128, 14], [156, 26], [184, 10], [214, 24], [240, 16], [268, 26], [296, 12], [320, 22], [320, 44], [0, 44]];
  P.poly(far, '#8aa6c8');
  for (const [px, py] of far.slice(1, 13)) {
    if (py < 20) P.poly([[px - 5, py + 5], [px, py], [px + 5, py + 5], [px + 2, py + 4], [px, py + 6], [px - 2, py + 4]], '#eef6ff');
  }
  const near = [[0, 36], [30, 28], [60, 34], [90, 26], [130, 34], [170, 27], [210, 35], [250, 26], [290, 33], [320, 28], [320, 48], [0, 48]];
  P.poly(near, '#6a8aa8');
  P.dither(0, 38, 320, 8, '#5a7a98', 0);

  // Línea de bosque
  for (let x = -4; x < 324; x += 7) {
    const r = 5 + Math.floor(rand() * 4);
    P.ellipse(x, 46 - Math.floor(rand() * 4), r, r - 1, '#24603a');
  }
  for (let x = 0; x < 324; x += 9) {
    P.ellipse(x + 3, 46 - Math.floor(rand() * 3), 3, 2, '#2e7a3a');
  }
}

function drawGround(P, rand) {
  P.rect(0, 48, 320, 152, PAL.grass);
  P.rect(0, 48, 320, 2, '#24603a');
  P.dither(0, 50, 320, 3, '#3a7d3a', 0);
  for (let i = 0; i < 900; i++) {
    const x = Math.floor(rand() * 320), y = 52 + Math.floor(rand() * 148);
    P.px(x, y, rand() < 0.6 ? PAL.grassDark : PAL.grassLight);
  }
  // Matas de pasto
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rand() * 320), y = 56 + Math.floor(rand() * 144);
    P.px(x, y, '#2e7a3a');
    P.px(x + 2, y, '#2e7a3a');
    P.px(x + 1, y - 1, PAL.grassLight);
  }
}

function pathStroke(P, pts, width, color) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= steps; s++) {
      const x = x0 + ((x1 - x0) * s) / steps;
      const y = y0 + ((y1 - y0) * s) / steps;
      P.ellipse(Math.round(x), Math.round(y), width, Math.max(1, Math.round(width * 0.6)), color);
    }
  }
}

const PATHS = [
  [[46, 94], [62, 116], [110, 140]],
  [[157, 94], [157, 132]],
  [[270, 94], [252, 114], [210, 138]],
  [[46, 154], [70, 158], [108, 154]],
  [[258, 152], [236, 156], [212, 152]],
  [[196, 160], [244, 180], [288, 200]],
  [[160, 162], [160, 172]],
];

function drawPaths(P, rand) {
  PATHS.forEach((pts) => pathStroke(P, pts, 6, PAL.dirtDark));
  PATHS.forEach((pts) => pathStroke(P, pts, 5, PAL.dirt));
  PATHS.forEach((pts) => {
    for (let i = 0; i + 1 < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      for (let s = 0; s < 1; s += 0.08) {
        const x = x0 + (x1 - x0) * s + (rand() * 8 - 4), y = y0 + (y1 - y0) * s + (rand() * 4 - 2);
        P.px(x, y, rand() < 0.5 ? PAL.dirtLight : PAL.dirtDark);
      }
    }
  });
}

function drawPlaza(P, rand) {
  const cx = 160, cy = 148, rx = 58, ry = 18;
  P.ellipse(cx, cy, rx + 2, ry + 2, '#6a6a7c');
  P.ellipse(cx, cy, rx, ry, '#9a9aa8');
  for (let y = cy - ry; y <= cy + ry; y += 3) {
    const row = (y - cy + ry) / 3;
    for (let x = cx - rx; x <= cx + rx; x += 5) {
      const sx = x + (row % 2 ? 2 : 0);
      const inside = ((sx - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 0.92;
      if (!inside) continue;
      P.rect(sx, y, 4, 2, rand() < 0.25 ? '#b4b4c0' : '#a8a8b6');
      P.rect(sx, y + 2, 4, 1, '#7a7a8c');
      P.px(sx, y, '#c8c8d4');
    }
  }
}

// ---------- Torre de magia ----------
function drawMagicTower(P, rand) {
  // Anexo
  P.rect(63, 69, 22, 25, INK);
  P.rect(64, 70, 20, 24, '#c8b8e8');
  P.dither(64, 70, 20, 24, '#b8a6dc', 0);
  roof(P, { x: 61, y: 60, w: 26, h: 10, inset: 5, base: '#5a3a7a', dark: '#3e2458', light: '#8a62b0' }, rand);
  windowPane(P, 70, 76, 7, 7, { lit: true, frame: '#5a3a7a' });
  P.sprite(['.o.', 'ooo', '.o.'], { o: PAL.gold }, 72, 87);

  // Cuerpo cilíndrico
  P.rect(27, 44, 38, 50, INK);
  stones(P, 28, 45, 36, 49, STONE_ARCANE, rand, 5);
  P.dither(28, 45, 5, 49, '#c8bfe0', 0);
  P.rect(56, 45, 8, 49, '#5e5480');
  P.dither(52, 45, 4, 49, '#5e5480', 1);
  stones(P, 56, 45, 8, 49, { base: '#6a5f8c', dark: '#4a4068', light: '#7e72a0', mortar: '#30284a' }, rand, 5);
  // Cornisas doradas
  for (const y of [44, 68]) {
    P.rect(25, y, 42, 3, INK);
    P.rect(26, y + 1, 40, 1, PAL.goldDark);
    P.rect(26, y, 40, 1, PAL.gold);
  }
  // Balconcito
  P.rect(24, 66, 44, 1, INK);
  for (let x = 26; x < 66; x += 3) P.rect(x, 62, 1, 5, PAL.iron);
  P.rect(24, 61, 44, 1, PAL.ironLight);

  // Techo cónico con estrellas
  P.poly([[21, 46], [46, 4], [71, 46]], INK);
  P.poly([[23, 45], [46, 7], [69, 45]], '#6a3a8a');
  P.poly([[23, 45], [46, 7], [40, 45]], '#8a52b0');
  P.poly([[54, 45], [46, 7], [69, 45]], '#45235e');
  for (let y = 12; y < 45; y += 6) {
    const half = Math.round(((y - 7) / 38) * 23);
    P.rect(46 - half, y, half * 2, 1, '#45235e');
  }
  const starPts = [[40, 30], [52, 22], [46, 38], [34, 40], [58, 40], [48, 14]];
  starPts.forEach(([x, y]) => {
    P.px(x, y, PAL.gold);
    P.px(x - 1, y, PAL.goldDark);
    P.px(x + 1, y, PAL.goldDark);
    P.px(x, y - 1, PAL.goldDark);
    P.px(x, y + 1, PAL.goldDark);
  });
  P.rect(21, 45, 51, 2, '#45235e');

  // Ventana redonda iluminada
  P.blob(46, 54, 4, 4, '#3e2458');
  P.ellipse(46, 54, 3, 3, '#d0a0ff');
  P.ellipse(45, 53, 1, 1, '#f4e0ff');
  P.rect(46, 51, 1, 7, '#5a3a7a');
  P.rect(43, 54, 7, 1, '#5a3a7a');
  windowPane(P, 32, 76, 5, 7, { lit: true, frame: '#5a3a7a' });

  // Puerta en arco con luna
  door(P, 40, 80, 12, 14, { color: '#4a2e5e', arch: true, rand });
  P.sprite(['.oo', 'o..', 'o..', '.oo'], { o: PAL.gold }, 44, 85);

  hangingSign(P, 56, 74, icon('orb'), { ...swatchFor('oscuridad'), o: INK }, 1);

  // Escoba apoyada (alguien la dejó estacionada)
  P.line(86, 93, 80, 76, PAL.woodDark);
  P.line(87, 93, 81, 76, PAL.wood);
  P.poly([[84, 88], [90, 94], [86, 95], [82, 92]], '#d4a96e');
  P.line(83, 89, 86, 94, '#a07a44');

  // Caldero (el burbujeo se anima)
  P.rect(13, 92, 2, 3, PAL.woodDark);
  P.rect(22, 92, 2, 3, PAL.woodDark);
  P.blob(18, 88, 6, 4, '#2a2a3a');
  P.rect(12, 84, 13, 2, INK);
  P.ellipse(18, 85, 5, 1, '#5ad04a');
  P.px(15, 89, '#4a4e60');
}

// ---------- Posada ----------
function drawInn(P, rand) {
  const x = 106, w = 98;
  // Planta baja de piedra
  P.rect(x - 1, 73, w + 2, 22, INK);
  stones(P, x, 74, w, 20, STONE_WARM, rand, 5);
  // Planta alta con entramado, sobresale un poco
  P.rect(x - 3, 52, w + 6, 22, INK);
  timber(P, x - 2, 53, w + 4, 20, '#efe0c0', PAL.beam, rand);
  P.rect(x - 3, 73, w + 6, 2, PAL.beam);
  // Techo y buhardillas
  roof(P, { x: x - 6, y: 26, w: w + 12, h: 26, inset: 12, base: '#b13e53', dark: '#7a2238', light: '#e0606a' }, rand);
  for (const dx of [26, 64]) {
    const bx = x + dx;
    P.rect(bx - 1, 34, 14, 14, INK);
    timber(P, bx, 35, 12, 12, '#efe0c0', PAL.beam, rand);
    windowPane(P, bx + 3, 38, 6, 6, { lit: true });
    roof(P, { x: bx - 2, y: 28, w: 16, h: 6, inset: 7, base: '#b13e53', dark: '#7a2238', light: '#e0606a' }, rand);
  }
  chimney(P, x + 14, 14, 8, 18, rand);
  chimney(P, x + 82, 18, 6, 14, rand);

  // Ventanas de arriba con postigos y macetas
  [x + 12, x + 36, x + 56, x + 80].forEach((wx, i) => windowPane(P, wx, 57, 8, 9, {
    lit: i !== 2, shutters: '#7a2238', box: i % 2 === 0, rand,
  }));
  // Puerta doble con faroles
  door(P, x + 39, 77, 20, 17, { color: '#7a4b2a', arch: true, wall: '#a89a8a', rand });
  P.rect(x + 49, 77, 1, 17, INK);
  for (const lx of [x + 34, x + 63]) {
    P.rect(lx, 79, 3, 5, INK);
    P.rect(lx + 1, 80, 1, 3, PAL.lit);
  }
  signBoard(P, x + 30, 66, 38, 7, 'POSADA', { bg: '#7a2238', fg: PAL.gold });
  windowPane(P, x + 9, 79, 12, 8, { lit: true, rand });
  windowPane(P, x + 77, 79, 12, 8, { lit: true, rand });
  hangingSign(P, x + w, 78, icon('bed'), { o: INK, w: PAL.white, a: '#b13e53' }, 1);

  // Barriles y banco
  barrel(P, x - 10, 83);
  barrel(P, x - 2, 85);
  P.rect(x + 66, 90, 14, 2, INK);
  P.rect(x + 66, 89, 14, 1, PAL.woodLight);
  P.rect(x + 67, 92, 1, 2, INK);
  P.rect(x + 78, 92, 1, 2, INK);
}

// ---------- Herrería ----------
function drawSmithy(P, rand) {
  const x = 252, w = 52;
  // Cuerpo principal
  P.rect(x - 1, 59, w + 2, 36, INK);
  stones(P, x, 60, w, 34, STONE_GREY, rand, 5);
  roof(P, { x: x - 4, y: 40, w: w + 8, h: 19, inset: 8, base: '#4a5878', dark: '#333c57', light: '#6a7ca0' }, rand);
  // Chimenea grande de la fragua
  chimney(P, x + 38, 22, 9, 26, rand);

  signBoard(P, x + 6, 63, 40, 7, 'HERRERIA', { bg: '#333c57', fg: '#ffcd75' });
  door(P, x + 20, 76, 12, 18, { color: '#5d3a1f', rand });
  P.rect(x + 21, 79, 10, 1, PAL.ironLight);
  windowPane(P, x + 5, 76, 9, 8, { lit: true, rand });
  windowPane(P, x + 38, 76, 9, 8, { lit: false, rand });
  for (let i = 0; i < 3; i++) P.rect(x + 39 + i * 3, 76, 1, 8, PAL.iron);

  // Cobertizo de la fragua a la izquierda
  P.poly([[223, 66], [253, 60], [253, 64], [223, 70]], INK);
  P.poly([[224, 66], [252, 61], [252, 63], [224, 68]], '#6a7ca0');
  P.rect(225, 68, 2, 26, INK);
  P.rect(225, 68, 1, 26, PAL.wood);
  // Fragua de ladrillos (la boca del fuego se anima)
  P.rect(228, 78, 18, 16, INK);
  stones(P, 229, 79, 16, 15, { base: '#a0503a', dark: '#6e3020', light: '#c87050', mortar: '#4a2018' }, rand, 4);
  P.rect(232, 84, 10, 7, INK);
  P.rect(233, 85, 8, 6, '#3a1a10');
  // Yunque
  P.rect(242, 88, 11, 3, INK);
  P.rect(243, 88, 9, 2, '#5d6175');
  P.rect(243, 88, 9, 1, '#8b8fa3');
  P.rect(245, 91, 5, 2, INK);
  P.rect(244, 93, 7, 1, INK);
  // Herramientas colgadas
  P.line(228, 72, 228, 76, PAL.iron);
  P.rect(227, 71, 3, 1, PAL.iron);

  // Estante de armas afuera, con hojas de cada elemento
  P.rect(305, 79, 12, 15, INK);
  P.rect(306, 80, 10, 1, PAL.woodLight);
  P.rect(306, 90, 10, 2, PAL.wood);
  ['fuego', 'hielo', 'viento'].forEach((el, i) => {
    const sw = swatchFor(el);
    const sx = 307 + i * 3;
    P.rect(sx, 74, 1, 13, sw.a);
    P.px(sx, 73, sw.c);
    P.rect(sx - 1, 86, 3, 1, PAL.gold);
    P.rect(sx, 87, 1, 3, PAL.woodDark);
  });
  crate(P, 292, 86, 8);
}

// ---------- Gimnasio ----------
function drawGym(P, rand) {
  const x = 12, w = 80;
  P.rect(x - 1, 119, w + 2, 36, INK);
  planks(P, x, 120, w, 34, { base: '#a0603a', dark: '#6e3a20', light: '#c47a4a' }, rand, { size: 4 });
  roof(P, { x: x - 5, y: 100, w: w + 10, h: 19, inset: 14, base: '#d0743a', dark: '#9a4a24', light: '#ef9a57' }, rand);
  // Emblema de mancuerna en el frente del techo
  P.rect(43, 104, 19, 9, INK);
  P.rect(44, 105, 17, 7, '#f4f4f4');
  P.rect(47, 108, 11, 1, PAL.iron);
  P.rect(46, 106, 2, 5, INK);
  P.rect(57, 106, 2, 5, INK);

  signBoard(P, x + 22, 123, 36, 7, 'GIMNASIO', { bg: '#7a2238', fg: PAL.white });
  // Portón de granero entreabierto
  P.rect(x + 27, 133, 26, 21, INK);
  P.rect(x + 28, 134, 10, 20, '#2a1a12');
  planks(P, x + 38, 134, 14, 20, { base: '#7a2238', dark: '#5a1428', light: '#a03048' }, rand, { size: 3 });
  P.line(x + 38, 134, x + 51, 153, PAL.white);
  P.line(x + 51, 134, x + 38, 153, PAL.white);
  P.frame(x + 38, 134, 14, 20, PAL.white);
  // Pesas dentro, apenas visibles
  P.rect(x + 30, 148, 6, 1, PAL.ironLight);
  P.rect(x + 29, 146, 2, 4, INK);
  P.rect(x + 35, 146, 2, 4, INK);

  windowPane(P, x + 7, 132, 10, 8, { lit: false, shutters: '#38b764', rand });
  windowPane(P, x + 63, 132, 10, 8, { lit: false, shutters: '#38b764', rand });

  // Muñeco de entrenamiento
  P.rect(100, 136, 2, 18, PAL.woodDark);
  P.rect(95, 140, 12, 2, PAL.woodDark);
  P.blob(101, 134, 3, 3, '#e8c878');
  P.rect(97, 142, 9, 7, INK);
  P.rect(98, 142, 7, 6, '#d4a96e');
  P.px(100, 133, INK);
  P.px(102, 133, INK);
  P.rect(98, 144, 7, 1, '#b13e53');
  // Mancuernas en el pasto
  for (const dx of [16, 28]) {
    P.rect(dx, 155, 7, 1, PAL.ironLight);
    P.rect(dx - 1, 153, 2, 4, INK);
    P.rect(dx + 6, 153, 2, 4, INK);
  }
}

// ---------- Tu casa ----------
function drawHouse(P, rand) {
  const x = 234, w = 50;
  P.rect(x - 1, 125, w + 2, 28, INK);
  timber(P, x, 126, w, 26, '#f0e4c8', '#6e4a2a', rand);
  roof(P, { x: x - 5, y: 106, w: w + 10, h: 19, inset: 10, base: '#38804a', dark: '#255a34', light: '#5aa860' }, rand);
  chimney(P, x + 36, 98, 6, 12, rand);
  // Ventana redonda del altillo
  P.blob(x + 25, 115, 3, 3, '#255a34');
  P.ellipse(x + 25, 115, 2, 2, PAL.lit);
  door(P, x + 20, 136, 11, 16, { color: '#38804a', arch: true, wall: '#f0e4c8', rand });
  windowPane(P, x + 6, 133, 8, 7, { lit: true, box: true, rand });
  windowPane(P, x + 37, 133, 8, 7, { lit: true, box: true, rand });
  signBoard(P, x + 15, 128, 21, 6, 'CASA', { bg: '#255a34', fg: PAL.white });
  // Buzón y huerta
  P.rect(x - 6, 142, 2, 11, PAL.woodDark);
  P.rect(x - 9, 138, 8, 5, INK);
  P.rect(x - 8, 139, 6, 3, '#3b5dc9');
  P.px(x - 3, 137, '#b13e53');
  fence(P, x + 52, 146, 16);
  for (let i = 0; i < 3; i++) {
    P.px(x + 54 + i * 5, 152, '#ef7d57');
    P.px(x + 55 + i * 5, 151, '#38b764');
  }
}

// ---------- Tablón de misiones ----------
function drawNoticeBoard(P, rand) {
  const x = 144, y = 172;
  P.rect(x + 2, y + 10, 2, 14, INK);
  P.rect(x + 28, y + 10, 2, 14, INK);
  P.rect(x + 2, y + 10, 1, 14, PAL.wood);
  P.rect(x + 28, y + 10, 1, 14, PAL.wood);
  P.rect(x - 1, y - 1, 34, 18, INK);
  planks(P, x, y, 32, 16, { base: '#8a5a32', dark: '#5d3a1f', light: '#a87048' }, rand, { vertical: false, size: 4 });
  P.poly([[x - 3, y + 1], [x + 16, y - 6], [x + 35, y + 1]], INK);
  P.poly([[x - 1, y], [x + 16, y - 5], [x + 33, y]], '#5d3a1f');
  // Papelitos clavados
  [[x + 3, y + 3, '#f4f4f4'], [x + 12, y + 2, '#ffe9a8'], [x + 21, y + 4, '#f4f4f4']].forEach(([px, py, c]) => {
    P.rect(px, py, 8, 9, c);
    P.rect(px + 1, py + 3, 6, 1, '#94b0c2');
    P.rect(px + 1, py + 5, 5, 1, '#94b0c2');
    P.px(px + 3, py, '#b13e53');
  });
}

// ---------- Puerta del pueblo ----------
function drawGate(P, rand) {
  P.ctx.save();
  P.ctx.translate(0, 12);
  // Muralla
  P.rect(250, 166, 70, 34, INK);
  stones(P, 251, 167, 69, 33, STONE_GREY, rand, 5);
  for (let x = 251; x < 320; x += 6) {
    P.rect(x, 162, 4, 5, INK);
    P.rect(x + 1, 163, 2, 4, '#8b8fa3');
  }
  // Torres
  for (const tx of [256, 302]) {
    P.rect(tx - 1, 150, 20, 50, INK);
    stones(P, tx, 151, 18, 49, STONE_GREY, rand, 5);
    P.dither(tx + 13, 151, 5, 49, '#5d6175', 0);
    P.rect(tx - 3, 148, 24, 4, INK);
    P.rect(tx - 2, 149, 22, 2, '#b4b8c8');
    for (let x = tx - 2; x < tx + 20; x += 5) {
      P.rect(x, 143, 3, 6, INK);
      P.rect(x + 1, 144, 1, 5, '#b4b8c8');
    }
    P.rect(tx + 7, 158, 4, 7, INK);
    P.rect(tx + 8, 159, 2, 5, '#3a3248');
    // Asta para la bandera (la tela se anima)
    if (tx > 300) P.rect(tx + 9, 128, 1, 16, INK);
  }
  // Arco con el camino que sale del pueblo
  const ax = 276, aw = 24;
  P.rect(ax - 1, 168, aw + 2, 32, INK);
  P.rect(ax, 170, aw, 30, '#5aa83a');
  P.rect(ax, 170, aw, 8, '#8fd3ff');
  P.rect(ax, 176, aw, 3, '#3a7d3a');
  P.poly([[ax + 8, 200], [ax + 11, 179], [ax + 14, 179], [ax + 18, 200]], PAL.dirt);
  for (let i = 0; i < 6; i++) {
    const cut = 6 - Math.round(Math.sqrt(36 - (6 - i) * (6 - i)));
    P.rect(ax, 168 + i, cut * 2, 1, INK);
    P.rect(ax + aw - cut * 2, 168 + i, cut * 2, 1, INK);
  }
  // Rastrillo levantado
  for (let x = ax + 2; x < ax + aw - 1; x += 3) P.rect(x, 169, 1, 6, PAL.iron);
  P.rect(ax + 1, 172, aw - 2, 1, PAL.iron);
  P.rect(ax - 2, 166, aw + 4, 2, '#5d6175');

  // Guardia Ramón
  const guard = [
    '..ooo..',
    '.ogggo.',
    '.ossso.',
    '.oskso.',
    'oorrroo',
    'orrrrro',
    'osrrrso',
    '.orrro.',
    '.obbbo.',
    '.ob.bo.',
    '.oo.oo.',
  ];
  P.sprite(guard, { o: INK, g: '#8b8fa3', s: '#f4c99b', k: INK, r: '#3b5dc9', b: '#5d3a1f' }, 266, 175);
  P.rect(273, 166, 1, 20, PAL.woodDark);
  P.px(273, 165, PAL.ironLight);
  P.px(273, 164, PAL.white);
  P.ctx.restore();
}

function drawFountainBase(P) {
  const cx = 160, cy = 150;
  P.ellipse(cx, cy + 2, 20, 7, INK);
  P.ellipse(cx, cy + 1, 19, 6, '#8b8fa3');
  P.ellipse(cx, cy, 19, 6, '#b4b8c8');
  P.ellipse(cx, cy, 16, 4, '#3b5dc9');
  P.rect(cx - 2, cy - 12, 5, 12, INK);
  P.rect(cx - 1, cy - 12, 3, 12, '#b4b8c8');
  P.ellipse(cx, cy - 13, 7, 2, INK);
  P.ellipse(cx, cy - 13, 6, 1, '#b4b8c8');
  P.rect(cx - 5, cy - 13, 11, 1, '#41a6f6');
}

// ---------- Animación ----------
export function drawTownFrame(P, t) {
  // Nubes que se desplazan
  [[20, 8, 0.6], [150, 4, 0.4], [250, 12, 0.5]].forEach(([x0, y, speed], i) => {
    const x = ((x0 + t * speed * 4) % 360) - 30;
    P.ellipse(x, y + 2, 10, 3, '#e8f6ff');
    P.ellipse(x + 6, y, 7, 3, '#ffffff');
    P.ellipse(x - 5, y + 1, 6, 2, '#ffffff');
    if (i === 1) P.ellipse(x + 14, y + 2, 5, 2, '#ffffff');
  });

  smoke(P, 124, 12, t, '#d8d8e0', 0);
  smoke(P, 190, 16, t, '#d8d8e0', 1.3);
  smoke(P, 294, 20, t, '#6a6a7c', 0.5, 1.4);
  smoke(P, 273, 96, t, '#d8d8e0', 2.1, 0.8);

  // Fuego de la fragua
  const flick = Math.floor(t * 8) % 3;
  P.rect(233, 88 - flick, 8, 3 + flick, '#ef7d57');
  P.rect(235, 89 - flick, 4, 2 + flick, '#ffcd75');
  P.px(236 + (flick % 2), 86 - flick, '#fff1b8');
  P.dither(228, 74, 20, 4, flick ? '#ef7d57' : '#b13e53', flick);

  // Caldero burbujeante
  const b = Math.floor(t * 4) % 4;
  P.px(15 + b, 84 - (b % 2), '#a7f070');
  P.px(20 - b, 83, '#5ad04a');
  if (b === 2) P.px(18, 81, '#a7f070');

  // Cristal de la torre que late
  const pulse = (Math.sin(t * 3) + 1) / 2;
  const crystal = pulse > 0.5 ? '#f080ff' : '#b07ad0';
  P.poly([[46, -1], [50, 4], [46, 9], [42, 4]], INK);
  P.poly([[46, 0], [49, 4], [46, 8], [43, 4]], crystal);
  P.px(45, 3, '#ffffff');
  const sparkle = Math.floor(t * 5) % 6;
  [[38, 2], [55, 6], [40, 10], [53, 0], [36, 7], [57, 11]].forEach(([sx, sy], i) => {
    if (i === sparkle || i === (sparkle + 3) % 6) P.px(sx, sy, '#fff1b8');
  });

  // Fuente: chorros y ondas
  const w = Math.floor(t * 6) % 4;
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const xx = 160 + dir * (2 + i);
      const yy = 137 - Math.round(3 * Math.sin((i / 6) * Math.PI)) + (i > 3 ? i - 3 : 0);
      P.px(xx, yy, (i + w) % 2 ? '#a6e6ff' : '#41a6f6');
    }
  }
  P.px(160, 134 - (w % 2), '#a6e6ff');
  for (let i = 0; i < 4; i++) {
    const rx = 148 + ((i * 7 + w * 2) % 24);
    P.rect(rx, 150 + (i % 2) * 2, 3, 1, '#73c6ff');
  }

  // Banderas al viento
  flag(P, 312, 140, t, '#ffcd75', 1.4);

  // Vecinos paseando
  WALKERS.forEach((wk, i) => walker(P, wk, t + i * 3));

  // Un slime mascota que salta en el pasto
  const hop = Math.abs(Math.sin(t * 3));
  const sx = 120 + Math.round(Math.sin(t * 0.5) * 12);
  const sy = 188 - Math.round(hop * 4);
  P.ellipse(sx, 190, 4, 1, '#2e7a3a');
  P.blob(sx, sy, 4, 3, '#5aa83a');
  P.ellipse(sx - 1, sy - 1, 2, 1, '#a7f070');
  P.px(sx - 1, sy, INK);
  P.px(sx + 2, sy, INK);
}

function smoke(P, x, y, t, color, offset, scale = 1) {
  for (let i = 0; i < 4; i++) {
    const phase = (t * 0.6 + offset + i / 4) % 1;
    const py = y - phase * 18 * scale;
    const px = x + Math.sin((t + i) * 2) * 2 + phase * 6;
    const r = Math.max(1, Math.round((1 + phase * 3) * scale));
    if (phase < 0.85) P.ellipse(Math.round(px), Math.round(py), r, Math.max(1, r - 1), color);
  }
}

function flag(P, x, y, t, color, offset) {
  for (let i = 0; i < 9; i++) {
    const wave = Math.round(Math.sin(t * 6 + offset + i * 0.7));
    P.rect(x + 1 + i, y + wave, 1, 5, i === 0 ? INK : i % 3 === 0 ? shade(color, 0.75) : color);
  }
}

function walker(P, wk, t) {
  const pts = wk.path;
  const segs = [];
  let total = 0;
  const route = wk.loop ? [...pts, pts[0]] : [...pts, ...pts.slice(0, -1).reverse()];
  for (let i = 0; i + 1 < route.length; i++) {
    const len = Math.hypot(route[i + 1][0] - route[i][0], route[i + 1][1] - route[i][1]);
    segs.push({ a: route[i], b: route[i + 1], len });
    total += len;
  }
  let d = (t * wk.speed) % total;
  let seg = segs[0];
  for (const s of segs) {
    if (d <= s.len) { seg = s; break; }
    d -= s.len;
  }
  const k = seg.len ? d / seg.len : 0;
  const x = Math.round(seg.a[0] + (seg.b[0] - seg.a[0]) * k);
  const y = Math.round(seg.a[1] + (seg.b[1] - seg.a[1]) * k);
  const step = Math.floor(t * 6) % 2;
  const flip = seg.b[0] < seg.a[0];
  const rows = [
    '.ooo.',
    'ohhho',
    'ossso',
    '.oso.',
    'occco',
    'occco',
    '.ooo.',
    step ? '.o.o.' : 'o...o',
  ];
  P.ellipse(x, y, 3, 1, 'rgba(26,28,44,0.35)');
  P.sprite(rows, { o: INK, h: wk.hair, s: '#f4c99b', c: wk.shirt }, x - 2, y - 8, flip);
}
