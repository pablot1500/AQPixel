// Interiores de los locales: pared temática, mostrador y dueño detrás.
// Cada interior tiene drawStatic (una vez) y drawFrame (cada cuadro: fuego, velas, parpadeo, boca).

import { seeded } from '../util.js';
import {
  INK, PAL, shade, stones, planks, windowPane, barrel, crate, makeCanvas,
} from './paint.js';
import { drawBerta, drawGrunido, drawChispas, drawBiceps } from './npcs.js';
import { swatchFor } from '../sprites.js';
import { ELEMENT_IDS } from '../data/elements.js';

export const ROOM_W = 256;
export const ROOM_H = 160;
const COUNTER_Y = 112;
const NPC_X = 128;

// ---------- Piezas comunes ----------
function ceilingBeams(P, color = PAL.beam) {
  P.rect(0, 0, ROOM_W, 7, INK);
  P.rect(0, 0, ROOM_W, 6, color);
  P.rect(0, 5, ROOM_W, 1, shade(color, 0.7));
  for (let x = 0; x < ROOM_W; x += 40) {
    P.rect(x, 0, 6, 8, INK);
    P.rect(x + 1, 0, 4, 7, shade(color, 1.2));
  }
}

function floorBoards(P, rand, base = '#8a5a32') {
  P.rect(0, COUNTER_Y - 2, ROOM_W, ROOM_H - COUNTER_Y + 2, base);
  planks(P, 0, COUNTER_Y - 2, ROOM_W, ROOM_H - COUNTER_Y + 2, { base, dark: shade(base, 0.7), light: shade(base, 1.15) }, rand, { vertical: false, size: 5 });
}

function counter(P, rand, opts = {}) {
  const { x = 22, w = 212, top = '#c8945a', front = '#8a5a32', cloth = null } = opts;
  // Tapa
  P.rect(x - 2, COUNTER_Y - 1, w + 4, 8, INK);
  P.rect(x - 1, COUNTER_Y, w + 2, 6, top);
  P.rect(x - 1, COUNTER_Y, w + 2, 1, shade(top, 1.25));
  P.rect(x - 1, COUNTER_Y + 5, w + 2, 1, shade(top, 0.7));
  // Frente con paneles
  P.rect(x, COUNTER_Y + 7, w, ROOM_H - COUNTER_Y - 7, INK);
  planks(P, x + 1, COUNTER_Y + 7, w - 2, ROOM_H - COUNTER_Y - 7, { base: front, dark: shade(front, 0.7), light: shade(front, 1.15) }, rand, { size: 6 });
  const panels = 4;
  const pw = Math.floor((w - 10) / panels);
  for (let i = 0; i < panels; i++) {
    const px = x + 5 + i * pw;
    P.rect(px, COUNTER_Y + 13, pw - 6, 30, shade(front, 0.75));
    P.frame(px, COUNTER_Y + 13, pw - 6, 30, shade(front, 1.3));
    P.rect(px + 1, COUNTER_Y + 42, pw - 8, 1, shade(front, 0.55));
  }
  if (cloth) {
    P.rect(x - 1, COUNTER_Y + 6, w + 2, 9, INK);
    P.rect(x, COUNTER_Y + 6, w, 8, cloth);
    P.rect(x, COUNTER_Y + 6, w, 1, shade(cloth, 1.3));
    for (let fx = x; fx < x + w; fx += 4) {
      P.rect(fx, COUNTER_Y + 14, 2, 2, PAL.gold);
    }
  }
}

function fireGlow(P, x, y, w, h, t, colors = ['#ef7d57', '#ffcd75', '#fff1b8']) {
  const f = Math.floor(t * 10) % 4;
  for (let i = 0; i < 5; i++) {
    const fx = x + 2 + Math.floor((i * (w - 4)) / 4);
    const fh = Math.max(2, Math.round(h * (0.5 + 0.5 * Math.abs(Math.sin(t * 7 + i * 1.7)))));
    P.rect(fx - 2, y + h - fh, 5, fh, colors[0]);
    P.rect(fx - 1, y + h - Math.round(fh * 0.7), 3, Math.round(fh * 0.7), colors[1]);
    P.px(fx, y + h - Math.round(fh * 0.4), colors[2]);
  }
  P.rect(x, y + h - 2, w, 2, '#b13e53');
  if (f % 2) P.px(x + 3 + f * 3, y + h - Math.round(h * 0.9), colors[1]);
}

function candle(P, x, y, t, i = 0) {
  P.rect(x - 1, y, 3, 6, INK);
  P.rect(x, y, 1, 6, '#f4f0e0');
  P.rect(x - 2, y + 6, 5, 1, PAL.goldDark);
  const f = Math.floor(t * 9 + i) % 3;
  P.px(x, y - 1, '#ffcd75');
  P.px(x, y - 2 - (f === 0 ? 1 : 0), '#fff1b8');
  if (f === 2) P.px(x + 1, y - 2, '#ef7d57');
}

function npcAnim(state, t) {
  const blink = (t % 3.4) < 0.14;
  const mouthOpen = state.talking && Math.floor(t * 8) % 2 === 0;
  return { blink, mouthOpen };
}

// ---------- Posada ----------
export const innRoom = {
  drawStatic(P) {
    const rand = seeded(11);
    P.rect(0, 0, ROOM_W, ROOM_H, '#7a4b2a');
    planks(P, 0, 6, ROOM_W, 74, { base: '#a0703c', dark: '#7a4b2a', light: '#c08a50' }, rand, { vertical: false, size: 6 });
    planks(P, 0, 80, ROOM_W, 32, { base: '#6e4424', dark: '#4a2e1a', light: '#8a5a32' }, rand, { size: 5 });
    P.rect(0, 79, ROOM_W, 2, INK);
    P.rect(0, 80, ROOM_W, 1, '#c08a50');
    ceilingBeams(P);
    for (const x of [6, 246]) {
      P.rect(x - 1, 6, 6, 106, INK);
      P.rect(x, 6, 4, 106, '#5d3a1f');
      P.rect(x, 6, 1, 106, '#8a5a32');
    }
    floorBoards(P, rand);

    // Estante con jarras y platos
    P.rect(16, 30, 58, 3, INK);
    P.rect(17, 30, 56, 2, PAL.woodLight);
    P.rect(16, 52, 58, 3, INK);
    P.rect(17, 52, 56, 2, PAL.woodLight);
    for (let i = 0; i < 5; i++) {
      const mx = 20 + i * 11;
      P.rect(mx, 21, 7, 9, INK);
      P.rect(mx + 1, 22, 5, 8, i % 2 ? '#c8945a' : '#e8d8b8');
      P.rect(mx + 1, 23, 5, 1, shade(i % 2 ? '#c8945a' : '#e8d8b8', 0.8));
      P.rect(mx + 7, 24, 2, 4, INK);
    }
    for (let i = 0; i < 4; i++) {
      P.blob(24 + i * 14, 45, 5, 6, i % 2 ? '#f4f4f4' : '#a6c8e8');
      P.ellipse(24 + i * 14, 45, 3, 4, shade(i % 2 ? '#f4f4f4' : '#a6c8e8', 0.88));
    }

    // Pizarrón con el menú
    P.rect(26, 60, 40, 18, INK);
    P.rect(27, 61, 38, 16, '#5d3a1f');
    P.rect(29, 63, 34, 12, '#2e3b34');
    P.text('SOPA', 31, 64, '#f4f4f4');
    P.rect(31, 71, 14, 1, '#94b0c2');
    P.rect(48, 71, 8, 1, '#ffcd75');

    // Trofeo: cabeza de slime en una placa (nadie pregunta cómo)
    P.blob(NPC_X, 26, 14, 11, '#7a4b2a');
    P.ellipse(NPC_X, 26, 12, 9, '#a0703c');
    P.blob(NPC_X, 25, 9, 7, '#5aa83a');
    P.ellipse(NPC_X - 2, 22, 5, 3, '#a7f070');
    P.rect(NPC_X - 5, 24, 2, 2, INK);
    P.rect(NPC_X + 4, 24, 2, 2, INK);
    P.rect(NPC_X - 2, 29, 5, 1, '#b13e53');
    P.rect(NPC_X - 8, 34, 17, 4, INK);
    P.rect(NPC_X - 7, 35, 15, 2, PAL.gold);

    // Chimenea de piedra
    P.rect(180, 30, 62, 82, INK);
    stones(P, 181, 31, 60, 81, { base: '#a89a8a', dark: '#7a6c60', light: '#c8bcae', mortar: '#5e5248' }, rand, 6);
    P.rect(176, 44, 70, 5, INK);
    P.rect(177, 45, 68, 3, '#7a4b2a');
    P.rect(177, 45, 68, 1, '#a0703c');
    P.rect(194, 64, 34, 48, INK);
    P.rect(195, 65, 32, 47, '#2a1810');
    P.rect(198, 104, 26, 4, '#5d3a1f');
    P.rect(200, 102, 22, 2, '#7a4b2a');
    // Olla colgada y adornos del estante
    P.rect(210, 65, 1, 14, PAL.iron);
    P.blob(210, 84, 6, 4, '#3a3a48');
    P.rect(204, 80, 13, 2, INK);
    barrel(P, 186, 33);
    P.rect(230, 36, 6, 8, INK);
    P.rect(231, 37, 4, 7, '#3b5dc9');

    // Barriles apilados
    barrel(P, 10, 95);
    barrel(P, 19, 97);
    barrel(P, 14, 84);

    counter(P, rand);
    // Sobre el mostrador: pan, campanita y llave
    P.blob(60, 108, 8, 4, '#c8843a');
    P.ellipse(58, 106, 4, 1, '#e8b060');
    P.line(54, 107, 56, 105, '#8a5a32');
    P.line(60, 107, 62, 105, '#8a5a32');
    P.blob(196, 108, 4, 3, PAL.gold);
    P.rect(196, 103, 1, 2, INK);
    P.rect(190, 111, 12, 1, INK);
    P.rect(84, 110, 6, 2, PAL.gold);
    P.rect(90, 109, 4, 4, '#f4f4f4');
  },
  drawFrame(P, t, state) {
    fireGlow(P, 198, 84, 26, 20, t);
    const glow = Math.floor(t * 6) % 2;
    P.dither(181, 112 - 8, 60, 8, glow ? '#ef7d57' : '#d0743a', glow);
    // Farol colgante
    P.rect(84, 6, 1, 10, PAL.iron);
    P.rect(80, 16, 9, 10, INK);
    P.rect(81, 17, 7, 8, glow ? PAL.lit : '#ffe08a');
    P.rect(81, 17, 7, 1, PAL.iron);
    P.rect(84, 17, 1, 8, PAL.iron);
    drawBerta(P, NPC_X, npcAnim(state, t));
    // Jarra espumante
    P.rect(160, 98, 11, 14, INK);
    P.rect(161, 99, 9, 13, '#d69a2d');
    P.rect(161, 99, 9, 3, '#f4f4f4');
    P.rect(170, 102, 3, 6, INK);
    P.px(163 + (Math.floor(t * 3) % 3), 97 - (Math.floor(t * 4) % 2), '#f4f4f4');
  },
};

// ---------- Herrería ----------
export const smithyRoom = {
  drawStatic(P) {
    const rand = seeded(23);
    stones(P, 0, 0, ROOM_W, 112, { base: '#6e7286', dark: '#4e5266', light: '#8b8fa3', mortar: '#33364a' }, rand, 6);
    ceilingBeams(P, '#3a2618');
    floorBoards(P, rand, '#5d4a3a');

    // Fragua con campana de piedra
    P.poly([[6, 30], [60, 30], [50, 6], [16, 6]], INK);
    P.poly([[8, 30], [58, 30], [49, 7], [17, 7]], '#5d6175');
    P.dither(8, 8, 50, 22, '#4e5266', 0);
    P.rect(4, 30, 60, 4, INK);
    P.rect(5, 31, 58, 2, '#8b8fa3');
    P.rect(6, 34, 56, 78, INK);
    stones(P, 7, 35, 54, 77, { base: '#a0503a', dark: '#6e3020', light: '#c87050', mortar: '#4a2018' }, rand, 5);
    P.rect(16, 70, 36, 34, INK);
    P.rect(17, 71, 34, 33, '#2a120c');
    P.rect(16, 102, 36, 10, '#3a3a48');
    // Fuelle
    P.poly([[62, 92], [76, 86], [80, 96], [64, 102]], INK);
    P.poly([[63, 93], [75, 88], [78, 95], [64, 100]], '#7a4b2a');
    P.rect(58, 94, 6, 2, PAL.iron);

    // Emblema: escudo con espadas cruzadas
    for (const dir of [-1, 1]) {
      P.line(NPC_X - 18 * dir, 10, NPC_X + 14 * dir, 42, INK);
      P.line(NPC_X - 17 * dir, 10, NPC_X + 15 * dir, 42, '#c2c9d6');
      P.line(NPC_X - 18 * dir, 11, NPC_X + 14 * dir, 43, '#7d8396');
      P.rect(NPC_X + 10 * dir - 2, 36, 5, 2, PAL.gold);
    }
    P.blob(NPC_X, 26, 11, 12, '#b13e53');
    P.ellipse(NPC_X, 26, 8, 9, '#7a2238');
    P.blob(NPC_X, 26, 3, 3, PAL.gold);
    P.rect(NPC_X - 11, 25, 23, 1, PAL.gold);
    P.rect(NPC_X, 14, 1, 24, PAL.gold);

    // Cadenas y tenazas colgadas
    for (const [cx, len] of [[80, 26], [92, 18]]) {
      for (let y = 7; y < 7 + len; y += 2) P.px(cx, y, y % 4 ? PAL.ironLight : PAL.iron);
    }
    P.line(80, 33, 77, 44, PAL.iron);
    P.line(80, 33, 83, 44, PAL.iron);
    P.blob(92, 28, 3, 3, PAL.iron);

    // Estante de armas con una hoja de cada elemento
    P.rect(166, 18, 84, 80, INK);
    planks(P, 167, 19, 82, 78, { base: '#7a4b2a', dark: '#5d3a1f', light: '#9a6a3e' }, rand, { size: 6 });
    P.rect(167, 46, 82, 3, '#4a2e1a');
    P.rect(167, 84, 82, 3, '#4a2e1a');
    ELEMENT_IDS.forEach((el, i) => {
      const sw = swatchFor(el);
      const x = 172 + i * 10;
      P.rect(x - 1, 22, 4, 24, INK);
      P.rect(x, 23, 2, 22, sw.a);
      P.rect(x, 23, 1, 22, sw.c);
      P.px(x, 22, sw.c);
      P.rect(x - 3, 45, 8, 2, INK);
      P.rect(x - 2, 45, 6, 1, PAL.gold);
      P.rect(x, 47, 2, 6, PAL.woodDark);
    });
    // Hacha, arco y lanza
    P.rect(176, 56, 2, 28, PAL.woodDark);
    P.poly([[178, 56], [188, 52], [188, 66], [178, 62]], INK);
    P.poly([[178, 57], [187, 54], [187, 64], [178, 61]], '#c2c9d6');
    for (let i = 0; i < 26; i++) {
      const bx = 204 + Math.round(6 * Math.sin((i / 25) * Math.PI));
      P.px(bx, 56 + i, PAL.woodLight);
      P.px(bx + 1, 56 + i, PAL.woodDark);
    }
    P.rect(203, 56, 1, 26, '#f4f4f4');
    P.rect(228, 52, 2, 32, PAL.woodDark);
    P.poly([[226, 54], [229, 46], [232, 54]], '#c2c9d6');

    // Escudo redondo en la pared izquierda
    P.blob(100, 70, 10, 10, '#7a4b2a');
    P.ellipse(100, 70, 7, 7, '#a0703c');
    P.blob(100, 70, 3, 3, '#8b8fa3');
    P.frame(91, 69, 19, 3, PAL.iron);

    counter(P, rand, { top: '#8b8fa3', front: '#5d3a1f' });
    // Casco y herradura sobre el mostrador
    P.blob(52, 106, 9, 6, '#8b8fa3');
    P.ellipse(50, 104, 4, 2, '#c2c9d6');
    P.rect(43, 108, 19, 4, INK);
    P.rect(44, 108, 17, 3, '#5d6175');
    P.ellipse(206, 108, 6, 4, INK);
    P.ellipse(206, 108, 5, 3, '#8b8fa3');
    P.ellipse(206, 109, 3, 2, '#8b8fa3');
    P.rect(203, 108, 7, 4, shade('#8b8fa3', 1));
    P.ellipse(206, 110, 2, 2, '#5d4a3a');
  },
  drawFrame(P, t, state) {
    fireGlow(P, 18, 82, 32, 20, t);
    const f = Math.floor(t * 8) % 2;
    P.dither(7, 64, 54, 6, f ? '#ef7d57' : '#c85a3a', f);
    // Chispas que suben
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.9 + i / 3) % 1;
      P.px(26 + i * 8 + Math.round(Math.sin(t * 5 + i) * 2), 80 - ph * 40, ph < 0.5 ? '#ffcd75' : '#ef7d57');
    }
    drawGrunido(P, NPC_X, npcAnim(state, t));
  },
};

// ---------- Tienda de magia ----------
export const magicRoom = {
  drawStatic(P) {
    const rand = seeded(31);
    P.rect(0, 0, ROOM_W, 112, '#3e2458');
    for (let y = 8; y < 112; y += 10) {
      for (let x = (y / 10) % 2 ? 4 : 9; x < ROOM_W; x += 10) {
        P.px(x, y, '#5a3a7a');
        P.px(x - 1, y + 1, '#5a3a7a');
        P.px(x + 1, y + 1, '#5a3a7a');
        P.px(x, y + 2, '#5a3a7a');
      }
    }
    P.rect(0, 0, ROOM_W, 6, '#2a1840');
    P.rect(0, 6, ROOM_W, 1, PAL.gold);
    floorBoards(P, rand, '#4a2e3a');

    // Ventana redonda con cielo nocturno (las estrellas titilan)
    P.blob(NPC_X, 40, 26, 26, '#5d3a1f');
    P.ellipse(NPC_X, 40, 23, 23, '#7a4b2a');
    P.ellipse(NPC_X, 40, 21, 21, '#1d2b53');
    P.dither(NPC_X - 21, 50, 43, 12, '#29366f', 0);
    P.blob(NPC_X + 8, 30, 6, 6, '#fff6c8');
    P.ellipse(NPC_X + 11, 28, 5, 5, '#1d2b53');
    P.rect(NPC_X, 19, 1, 42, '#7a4b2a');
    P.rect(NPC_X - 21, 40, 43, 1, '#7a4b2a');

    // Estantes llenos de frascos y libros
    for (const sx of [6, 188]) {
      P.rect(sx, 10, 62, 102, INK);
      P.rect(sx + 1, 11, 60, 101, '#2a1840');
      for (let shelf = 0; shelf < 4; shelf++) {
        const sy = 34 + shelf * 24;
        P.rect(sx + 1, sy, 60, 3, '#7a4b2a');
        P.rect(sx + 1, sy, 60, 1, '#a0703c');
        let x = sx + 4;
        while (x < sx + 56) {
          const kind = rand();
          if (shelf % 2 === 0 && kind < 0.55) {
            // Frasco de poción
            const colors = ['#ef7d57', '#41a6f6', '#a7f070', '#f080b0', '#ffcd75', '#73eff7', '#b07ad0'];
            const c = colors[Math.floor(rand() * colors.length)];
            const h = 8 + Math.floor(rand() * 8);
            const w = 5 + Math.floor(rand() * 4);
            P.rect(x, sy - h, w, h, INK);
            P.rect(x + 1, sy - h + 3, w - 2, h - 3, c);
            P.rect(x + 1, sy - h + 3, 1, h - 4, shade(c, 1.4));
            P.rect(x + Math.floor(w / 2) - 1, sy - h - 2, 3, 3, INK);
            P.px(x + Math.floor(w / 2), sy - h - 1, '#c8945a');
            x += w + 2;
          } else if (kind < 0.85) {
            // Libros
            const n = 2 + Math.floor(rand() * 3);
            for (let b = 0; b < n && x < sx + 58; b++) {
              const bh = 12 + Math.floor(rand() * 7);
              const bc = ['#b13e53', '#3b5dc9', '#38b764', '#d69a2d', '#5d275d'][Math.floor(rand() * 5)];
              P.rect(x, sy - bh, 4, bh, INK);
              P.rect(x + 1, sy - bh + 1, 2, bh - 1, bc);
              P.px(x + 1, sy - bh + 3, PAL.gold);
              x += 4;
            }
            x += 2;
          } else {
            // Calavera con vela
            P.blob(x + 4, sy - 5, 4, 4, '#e8e0d0');
            P.px(x + 3, sy - 5, INK);
            P.px(x + 5, sy - 5, INK);
            P.rect(x + 2, sy - 2, 5, 2, '#e8e0d0');
            x += 11;
          }
        }
      }
    }

    // Hierbas y cristales colgados del techo
    [[78, '#38b764'], [92, '#a7f070'], [164, '#5aa83a'], [176, '#d0955a']].forEach(([x, c], i) => {
      P.rect(x, 6, 1, 8 + i * 2, '#a0703c');
      P.poly([[x - 4, 14 + i * 2], [x, 10 + i * 2], [x + 4, 14 + i * 2], [x + 1, 24 + i * 2], [x - 1, 24 + i * 2]], c);
      P.line(x, 12 + i * 2, x, 22 + i * 2, shade(c, 0.7));
    });

    // Caldero en el piso
    P.rect(226, 146, 3, 6, INK);
    P.rect(248, 146, 3, 6, INK);
    P.blob(238, 136, 15, 11, '#2a2a3a');
    P.ellipse(234, 132, 6, 4, '#3a3a4c');
    P.rect(222, 125, 33, 4, INK);
    P.ellipse(238, 126, 14, 2, '#38b764');

    counter(P, rand, { x: 40, w: 176, top: '#5d3a1f', front: '#45235e', cloth: '#6a3a8a' });
    // Libro abierto
    P.poly([[54, 110], [66, 104], [78, 110]], INK);
    P.rect(55, 106, 11, 5, '#f4f0e0');
    P.rect(66, 106, 11, 5, '#e8e0d0');
    P.rect(57, 107, 7, 1, '#94b0c2');
    P.rect(68, 107, 7, 1, '#94b0c2');
    P.rect(57, 109, 5, 1, '#94b0c2');
    P.rect(66, 105, 1, 6, '#b13e53');
    // Pie de la bola de cristal
    P.rect(186, 106, 18, 6, INK);
    P.rect(187, 107, 16, 4, PAL.goldDark);
    P.rect(187, 107, 16, 1, PAL.gold);
  },
  drawFrame(P, t, state) {
    // Estrellas que titilan en la ventana
    [[-12, 32], [-6, 46], [4, 50], [-14, 44], [12, 48], [-4, 26]].forEach(([dx, dy], i) => {
      if ((Math.floor(t * 3) + i) % 3) P.px(NPC_X + dx, dy, '#fff6c8');
    });
    drawChispas(P, NPC_X, npcAnim(state, t));
    // Bola de cristal
    const g = (Math.sin(t * 2.5) + 1) / 2;
    P.blob(195, 98, 9, 9, g > 0.5 ? '#b07ad0' : '#8a52b0');
    P.ellipse(195, 98, 6, 6, g > 0.5 ? '#d0a0ff' : '#b07ad0');
    P.ellipse(195 + Math.round(Math.sin(t * 2) * 2), 99, 2, 2, '#f4e0ff');
    P.px(191, 93, '#ffffff');
    P.px(192, 93, '#ffffff');
    candle(P, 88, 104, t, 0);
    candle(P, 170, 104, t, 1);
    // Burbujas del caldero
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.8 + i / 3) % 1;
      P.blob(230 + i * 7, 124 - ph * 14, ph < 0.6 ? 1 : 0, ph < 0.6 ? 1 : 0, '#a7f070', '#38b764');
    }
    if (Math.floor(t * 4) % 2) P.px(236, 125, '#a7f070');
  },
};

// ---------- Gimnasio ----------
export const gymRoom = {
  drawStatic(P) {
    const rand = seeded(41);
    planks(P, 0, 0, ROOM_W, 70, { base: '#d4a96e', dark: '#b0884e', light: '#e8c890' }, rand, { size: 8 });
    P.rect(0, 70, ROOM_W, 42, '#b13e53');
    P.rect(0, 70, ROOM_W, 3, '#f4f4f4');
    P.rect(0, 76, ROOM_W, 2, '#f4f4f4');
    floorBoards(P, rand, '#a0703c');

    // Ventana con luz de sol
    windowPane(P, 14, 14, 30, 22, { lit: false, frame: '#f4f4f4' });
    P.rect(14, 14, 30, 22, '#a6e6ff');
    P.rect(28, 14, 2, 22, '#f4f4f4');
    P.rect(14, 24, 30, 2, '#f4f4f4');
    P.dither(18, 38, 30, 32, '#f0d090', 0);

    // Póster motivacional
    P.rect(150, 10, 36, 44, INK);
    P.rect(151, 11, 34, 42, '#fff6c8');
    P.blob(168, 22, 3, 3, '#d89a6a');
    P.rect(166, 26, 5, 10, '#b13e53');
    P.line(160, 22, 166, 28, '#d89a6a');
    P.line(176, 22, 170, 28, '#d89a6a');
    P.blob(159, 21, 2, 2, '#d89a6a');
    P.blob(177, 21, 2, 2, '#d89a6a');
    P.line(167, 36, 164, 42, '#3b5dc9');
    P.line(169, 36, 172, 42, '#3b5dc9');
    P.text('SIN', 162, 44, '#b13e53');

    // Repisa de trofeos
    P.rect(64, 34, 40, 3, INK);
    P.rect(65, 34, 38, 2, PAL.woodDark);
    for (let i = 0; i < 3; i++) {
      const tx = 70 + i * 13;
      const tc = [PAL.gold, '#c2c9d6', '#d0955a'][i];
      P.rect(tx - 4, 24, 9, 6, INK);
      P.rect(tx - 3, 25, 7, 4, tc);
      P.rect(tx - 1, 30, 3, 2, INK);
      P.rect(tx - 2, 32, 5, 2, INK);
      P.px(tx - 5, 26, tc);
      P.px(tx + 5, 26, tc);
    }

    // Reloj de pared
    P.blob(214, 22, 9, 9, '#f4f4f4');
    P.rect(214, 16, 1, 7, INK);
    P.rect(214, 22, 5, 1, INK);

    // Estante de mancuernas
    P.rect(4, 80, 52, 32, INK);
    P.rect(5, 81, 50, 30, '#5d6175');
    for (let row = 0; row < 3; row++) {
      const ry = 86 + row * 9;
      P.rect(5, ry + 4, 50, 2, '#3a3e4e');
      for (let i = 0; i < 3; i++) {
        const dx = 9 + i * 16;
        const s = 3 - row % 2;
        P.rect(dx, ry + 1, 10, 1, PAL.ironLight);
        P.rect(dx - 1, ry + 1 - s, 3, s * 2 + 1, INK);
        P.rect(dx + 9, ry + 1 - s, 3, s * 2 + 1, INK);
      }
    }
    counter(P, rand, { top: '#f4f4f4', front: '#b13e53' });
    // Toalla, batido y cronómetro
    P.rect(52, 106, 18, 6, INK);
    P.rect(53, 107, 16, 4, '#41a6f6');
    P.rect(53, 109, 16, 1, '#f4f4f4');
    P.rect(186, 96, 9, 16, INK);
    P.rect(187, 98, 7, 14, '#f080b0');
    P.rect(187, 96, 7, 2, '#f4f4f4');
    P.blob(84, 108, 4, 4, '#c2c9d6');
    P.px(84, 107, INK);
    P.rect(83, 102, 3, 2, INK);
  },
  drawFrame(P, t, state) {
    // Bolsa de boxeo que se balancea
    const sw = Math.round(Math.sin(t * 2.2) * 3);
    P.line(232, 0, 232 + sw, 30, PAL.iron);
    P.rect(225 + sw, 30, 15, 44, INK);
    P.rect(226 + sw, 31, 13, 42, '#b13e53');
    P.rect(226 + sw, 31, 3, 42, '#e04a5f');
    P.rect(226 + sw, 40, 13, 2, INK);
    P.rect(226 + sw, 62, 13, 2, INK);
    // Agujas del reloj
    const a = t * 0.8;
    P.line(214, 22, 214 + Math.round(Math.cos(a) * 6), 22 + Math.round(Math.sin(a) * 6), '#b13e53');
    drawBiceps(P, NPC_X, npcAnim(state, t));
  },
};

// ---------- Tu casa ----------
export const homeRoom = {
  drawStatic(P) {
    const rand = seeded(53);
    P.rect(0, 0, ROOM_W, 112, '#5a8a5a');
    for (let x = 0; x < ROOM_W; x += 12) P.rect(x, 0, 5, 84, '#6a9a64');
    planks(P, 0, 84, ROOM_W, 28, { base: '#8a5a32', dark: '#5d3a1f', light: '#a87048' }, rand, { size: 6 });
    P.rect(0, 83, ROOM_W, 2, INK);
    P.rect(0, 84, ROOM_W, 1, '#c08a50');
    ceilingBeams(P, '#5d3a1f');
    floorBoards(P, rand, '#a0703c');

    // Ventana con cortinas
    windowPane(P, 104, 20, 48, 32, { lit: false, frame: '#f4f4f4' });
    P.rect(104, 20, 48, 32, '#8fd3ff');
    P.rect(104, 44, 48, 8, '#5aa83a');
    P.ellipse(118, 28, 6, 2, '#ffffff');
    P.rect(127, 20, 2, 32, '#f4f4f4');
    P.rect(104, 35, 48, 2, '#f4f4f4');
    for (const cx of [96, 152]) {
      P.rect(cx, 14, 10, 46, INK);
      P.rect(cx + 1, 15, 8, 44, '#b13e53');
      P.rect(cx + 2, 15, 2, 44, '#e04a5f');
    }
    P.rect(92, 13, 72, 3, PAL.woodDark);

    // Cuadro de un slime
    P.rect(30, 22, 26, 22, INK);
    P.rect(31, 23, 24, 20, PAL.gold);
    P.rect(33, 25, 20, 16, '#a6e6ff');
    P.blob(43, 36, 6, 4, '#5aa83a');
    P.px(41, 35, INK);
    P.px(45, 35, INK);

    // Cama con frazada
    P.rect(8, 92, 76, 30, INK);
    P.rect(9, 93, 74, 8, '#f4f4f4');
    P.rect(9, 101, 74, 20, '#3b5dc9');
    P.dither(9, 101, 74, 20, '#29366f', 0);
    P.rect(9, 101, 74, 2, '#41a6f6');
    P.rect(6, 80, 6, 46, INK);
    P.rect(7, 81, 4, 45, PAL.woodLight);
    P.rect(80, 88, 6, 38, INK);
    P.rect(81, 89, 4, 37, PAL.woodLight);
    P.blob(24, 96, 9, 3, '#ffffff');

    // Ropero
    P.rect(190, 26, 56, 96, INK);
    planks(P, 191, 27, 54, 94, { base: '#8a5a32', dark: '#5d3a1f', light: '#a87048' }, rand, { size: 9 });
    P.rect(217, 27, 2, 94, INK);
    P.px(214, 74, PAL.gold);
    P.px(221, 74, PAL.gold);
    P.rect(188, 24, 60, 4, INK);
    P.rect(189, 25, 58, 2, PAL.woodLight);

    // Alfombra redonda y baúl
    P.ellipse(NPC_X, 146, 46, 10, INK);
    P.ellipse(NPC_X, 146, 45, 9, '#b13e53');
    P.ellipse(NPC_X, 146, 38, 7, '#ffcd75');
    P.ellipse(NPC_X, 146, 32, 5, '#b13e53');
    crate(P, 200, 132, 20);
    P.rect(200, 138, 20, 2, PAL.iron);
  },
  drawFrame(P, t, state) {
    // Gato durmiendo en la cama (respira)
    const breathe = Math.floor(t * 1.5) % 2;
    P.blob(56, 96 - breathe, 8, 4 + breathe, '#ef7d57');
    P.blob(48, 94, 4, 4, '#ef7d57');
    P.px(46, 89, INK);
    P.px(50, 89, INK);
    P.rect(46, 94, 2, 1, INK);
    P.rect(50, 94, 2, 1, INK);
    const tail = Math.round(Math.sin(t * 2) * 2);
    P.line(64, 98, 70, 94 + tail, '#d0743a');
    if (Math.floor(t) % 4 === 0) P.text('Z', 54, 80 - Math.floor((t % 1) * 4), '#f4f4f4');
    // El héroe, con el equipo que lleva puesto
    if (state.hero) {
      P.ctx.imageSmoothingEnabled = false;
      const bob = Math.floor(t * 2) % 2;
      P.ellipse(NPC_X, 147, 14, 3, 'rgba(26,28,44,0.4)');
      P.ctx.drawImage(state.hero, NPC_X - 24, 100 + bob, 48, 48);
    }
  },
};

export const ROOMS = { posada: innRoom, herrero: smithyRoom, magia: magicRoom, entrenador: gymRoom, mochila: homeRoom };

export { makeCanvas };
