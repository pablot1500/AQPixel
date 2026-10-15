// Interiores de los locales a 320×200: pared temática, mostrador y dueño detrás.
// drawStatic pinta una vez; drawFrame agrega fuego, luz, partículas, parpadeo y boca.

import { seeded } from '../util.js';
import { INK, PAL, shade, stones, planks, windowPane, barrel } from './paint.js';
import { drawBerta, drawGrunido, drawChispas, drawBiceps, COUNTER_Y } from './npcs.js';
import { drawHero } from './creatures.js';
import { drawSleepingCat } from './critters.js';
import { swatchFor } from '../sprites.js';
import { ELEMENT_IDS } from '../data/elements.js';

export const ROOM_W = 320;
export const ROOM_H = 200;
const NPC_X = 160;

// ---------- Piezas comunes ----------
function ceilingBeams(P, color = PAL.beam) {
  P.rect(0, 0, ROOM_W, 9, INK);
  P.rect(0, 0, ROOM_W, 8, color);
  P.rect(0, 1, ROOM_W, 1, shade(color, 1.25));
  P.rect(0, 7, ROOM_W, 1, shade(color, 0.7));
  for (let x = 10; x < ROOM_W; x += 50) {
    P.rect(x, 0, 8, 11, INK);
    P.rect(x + 1, 0, 6, 10, shade(color, 1.15));
    P.rect(x + 1, 0, 1, 10, shade(color, 1.4));
    P.px(x + 3, 8, PAL.iron);
  }
}

function floorBoards(P, rand, base = '#8a5a32') {
  planks(P, 0, COUNTER_Y - 2, ROOM_W, ROOM_H - COUNTER_Y + 2, { base, dark: shade(base, 0.7), light: shade(base, 1.15) }, rand, { vertical: false, size: 6 });
}

function counter(P, rand, opts = {}) {
  const { x = 26, w = 268, top = '#c8945a', front = '#8a5a32', cloth = null, panels = 5 } = opts;
  // Tapa con canto
  P.rect(x - 3, COUNTER_Y - 1, w + 6, 10, INK);
  P.rect(x - 2, COUNTER_Y, w + 4, 8, top);
  P.rect(x - 2, COUNTER_Y, w + 4, 1, shade(top, 1.3));
  P.rect(x - 2, COUNTER_Y + 2, w + 4, 1, shade(top, 1.1));
  P.rect(x - 2, COUNTER_Y + 7, w + 4, 1, shade(top, 0.65));
  for (let i = 0; i < 6; i++) P.rect(x + Math.floor(rand() * w), COUNTER_Y + 3 + Math.floor(rand() * 3), 6 + Math.floor(rand() * 10), 1, shade(top, 0.9));
  // Frente con paneles tallados
  P.rect(x, COUNTER_Y + 9, w, ROOM_H - COUNTER_Y - 9, INK);
  planks(P, x + 1, COUNTER_Y + 9, w - 2, ROOM_H - COUNTER_Y - 9, { base: front, dark: shade(front, 0.7), light: shade(front, 1.15) }, rand, { size: 7 });
  const pw = Math.floor((w - 12) / panels);
  for (let i = 0; i < panels; i++) {
    const px = x + 7 + i * pw;
    P.rect(px, COUNTER_Y + 16, pw - 8, 36, shade(front, 0.72));
    P.rect(px, COUNTER_Y + 16, pw - 8, 1, shade(front, 0.5));
    P.rect(px, COUNTER_Y + 16, 1, 36, shade(front, 0.5));
    P.rect(px + pw - 9, COUNTER_Y + 16, 1, 36, shade(front, 1.3));
    P.rect(px, COUNTER_Y + 51, pw - 8, 1, shade(front, 1.3));
    P.rect(px + 3, COUNTER_Y + 19, pw - 14, 30, shade(front, 0.82));
    P.blob(px + Math.floor((pw - 8) / 2), COUNTER_Y + 33, 2, 2, shade(front, 0.62));
  }
  P.rect(x, ROOM_H - 3, w, 3, shade(front, 0.5));
  if (cloth) {
    P.rect(x - 1, COUNTER_Y + 8, w + 2, 12, INK);
    P.rect(x, COUNTER_Y + 8, w, 11, cloth);
    P.rect(x, COUNTER_Y + 8, w, 1, shade(cloth, 1.3));
    P.dither(x, COUNTER_Y + 15, w, 3, shade(cloth, 0.8), 0);
    for (let fx = x + 1; fx < x + w; fx += 4) {
      P.rect(fx, COUNTER_Y + 19, 2, 3, PAL.gold);
      P.px(fx, COUNTER_Y + 21, PAL.goldDark);
    }
  }
}

function fireGlow(P, x, y, w, h, t, colors = ['#ef7d57', '#ffcd75', '#fff1b8']) {
  const n = Math.max(4, Math.round(w / 6));
  for (let i = 0; i < n; i++) {
    const fx = x + 3 + Math.floor((i * (w - 6)) / (n - 1));
    const fh = Math.max(3, Math.round(h * (0.45 + 0.55 * Math.abs(Math.sin(t * 7 + i * 1.7)))));
    P.poly([[fx - 3, y + h], [fx, y + h - fh], [fx + 3, y + h]], colors[0]);
    P.poly([[fx - 2, y + h], [fx, y + h - Math.round(fh * 0.7)], [fx + 2, y + h]], colors[1]);
    P.px(fx, y + h - Math.round(fh * 0.35), colors[2]);
  }
  P.rect(x, y + h - 2, w, 2, '#b13e53');
  for (let i = 0; i < 3; i++) P.rect(x + 4 + i * Math.floor(w / 3), y + h - 1, Math.floor(w / 4), 1, '#5d3a1f');
}

// Resplandor que tiembla sobre la pared, como luz de fuego.
function warmLight(P, cx, cy, r, t, color = 'rgba(255, 170, 80, 0.10)') {
  const k = 1 + Math.sin(t * 9) * 0.04 + Math.sin(t * 13) * 0.03;
  P.ellipse(cx, cy, Math.round(r * k), Math.round(r * 0.7 * k), color);
  P.ellipse(cx, cy, Math.round(r * 0.6 * k), Math.round(r * 0.45 * k), color);
}

function candle(P, x, y, t, i = 0, h = 8) {
  P.rect(x - 2, y, 4, h, INK);
  P.rect(x - 1, y, 2, h, '#f4f0e0');
  P.px(x - 1, y + 1, '#ffffff');
  P.px(x, y + 2, '#e8dcc0');
  P.rect(x - 3, y + h, 6, 2, PAL.goldDark);
  P.rect(x - 3, y + h, 6, 1, PAL.gold);
  const f = Math.floor(t * 9 + i) % 3;
  P.px(x, y - 1, '#ef7d57');
  P.px(x, y - 2, '#ffcd75');
  P.px(x, y - 3 - (f === 0 ? 1 : 0), '#fff1b8');
  if (f === 2) P.px(x + 1, y - 2, '#ffcd75');
  P.ellipse(x, y - 2, 4, 3, 'rgba(255, 220, 140, 0.12)');
}

function steam(P, x, y, t, offset = 0, color = 'rgba(244, 244, 244, 0.7)') {
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.7 + offset + i / 3) % 1;
    const px = x + Math.round(Math.sin(t * 2 + i * 2) * 2);
    P.px(px, y - Math.round(ph * 12), color);
    if (ph > 0.3) P.px(px + 1, y - Math.round(ph * 12) - 1, color);
  }
}

function motes(P, t, x, y, w, h, color, n = 10, speed = 0.05) {
  for (let i = 0; i < n; i++) {
    const ph = (t * speed + i / n) % 1;
    const mx = x + ((i * 37) % w) + Math.round(Math.sin(t * 0.8 + i) * 4);
    const my = y + h - Math.round(ph * h);
    P.px(mx, my, color);
  }
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
    planks(P, 0, 8, ROOM_W, 96, { base: '#a0703c', dark: '#7a4b2a', light: '#c08a50' }, rand, { vertical: false, size: 7 });
    planks(P, 0, 104, ROOM_W, 36, { base: '#6e4424', dark: '#4a2e1a', light: '#8a5a32' }, rand, { size: 6 });
    P.rect(0, 102, ROOM_W, 3, INK);
    P.rect(0, 103, ROOM_W, 1, '#c08a50');
    ceilingBeams(P);
    for (const x of [6, 308]) {
      P.rect(x - 1, 9, 8, 131, INK);
      P.rect(x, 9, 6, 131, '#5d3a1f');
      P.rect(x, 9, 1, 131, '#8a5a32');
      P.rect(x + 5, 9, 1, 131, '#3a2416');
    }
    floorBoards(P, rand);

    // Estantes con jarras, platos, miel y un queso
    for (const y of [36, 64]) {
      P.rect(18, y, 80, 4, INK);
      P.rect(19, y, 78, 2, PAL.woodLight);
      P.rect(19, y + 2, 78, 1, PAL.woodDark);
      for (const bx of [24, 88]) P.poly([[bx, y + 4], [bx + 6, y + 4], [bx, y + 10]], PAL.woodDark);
    }
    for (let i = 0; i < 6; i++) {
      const mx = 22 + i * 12;
      const c = i % 2 ? '#c8945a' : '#e8d8b8';
      P.rect(mx, 25, 9, 11, INK);
      P.rect(mx + 1, 26, 7, 10, c);
      P.rect(mx + 1, 26, 2, 10, shade(c, 1.1));
      P.rect(mx + 1, 28, 7, 1, shade(c, 0.8));
      P.rect(mx + 9, 28, 2, 5, INK);
      P.px(mx + 9, 29, c);
    }
    for (let i = 0; i < 4; i++) {
      const c = i % 2 ? '#f4f4f4' : '#a6c8e8';
      P.blob(28 + i * 18, 56, 7, 8, c);
      P.ellipse(28 + i * 18, 56, 4, 5, shade(c, 0.88));
      P.px(25 + i * 18, 51, '#ffffff');
    }
    P.blob(80, 58, 6, 5, '#ffcd75');
    P.ellipse(80, 55, 6, 2, '#ffe08a');
    P.poly([[80, 58], [86, 55], [86, 60]], '#f0b850');

    // Pizarrón con el menú
    P.rect(26, 76, 58, 24, INK);
    P.rect(27, 77, 56, 22, '#5d3a1f');
    P.rect(29, 79, 52, 18, '#2e3b34');
    P.dither(29, 79, 52, 18, '#344238', 0);
    P.text('SOPA DEL', 33, 81, '#f4f4f4');
    P.text('DIA', 33, 88, '#f4f4f4');
    P.text('5', 70, 88, '#ffcd75');
    P.blob(74, 90, 1, 1, '#ffcd75');

    // Tablero de llaves de las habitaciones
    P.rect(212, 40, 30, 26, INK);
    planks(P, 213, 41, 28, 24, { base: '#7a4b2a', dark: '#5d3a1f', light: '#9a6a3e' }, rand, { size: 7 });
    for (let i = 0; i < 6; i++) {
      const kx = 217 + (i % 3) * 9, ky = 45 + Math.floor(i / 3) * 10;
      P.px(kx, ky, PAL.iron);
      if (i !== 4) {
        P.rect(kx - 1, ky + 1, 3, 3, PAL.gold);
        P.rect(kx, ky + 4, 1, 3, PAL.gold);
        P.rect(kx - 1, ky + 5, 3, 2, ['#e04a5f', '#3b5dc9', '#38b764'][i % 3]);
      }
    }

    // Trofeo: cabeza de slime en una placa
    P.blob(NPC_X, 32, 18, 14, '#7a4b2a');
    P.ellipse(NPC_X, 32, 16, 12, '#a0703c');
    P.ellipse(NPC_X - 4, 27, 7, 4, '#c08a50');
    P.blob(NPC_X, 31, 12, 9, '#5aa83a');
    P.ellipse(NPC_X - 4, 27, 6, 3, '#a7f070');
    P.px(NPC_X - 7, 26, '#ffffff');
    P.rect(NPC_X - 6, 30, 3, 3, INK);
    P.rect(NPC_X + 4, 30, 3, 3, INK);
    P.px(NPC_X - 5, 30, '#ffffff');
    P.px(NPC_X + 5, 30, '#ffffff');
    P.rect(NPC_X - 3, 36, 7, 1, INK);
    P.rect(NPC_X - 2, 37, 4, 1, '#e04a5f');
    P.rect(NPC_X - 12, 44, 25, 6, INK);
    P.rect(NPC_X - 11, 45, 23, 4, PAL.gold);
    P.rect(NPC_X - 9, 46, 19, 1, PAL.goldDark);

    // Chimenea de piedra con repisa
    P.rect(244, 30, 62, 110, INK);
    stones(P, 245, 31, 60, 109, { base: '#a89a8a', dark: '#7a6c60', light: '#c8bcae', mortar: '#5e5248' }, rand, 6);
    P.rect(240, 56, 70, 6, INK);
    P.rect(241, 57, 68, 4, '#7a4b2a');
    P.rect(241, 57, 68, 1, '#a0703c');
    P.rect(254, 80, 42, 60, INK);
    P.rect(255, 81, 40, 59, '#2a1810');
    P.dither(255, 81, 40, 20, '#3a2216', 0);
    P.rect(258, 130, 34, 5, '#5d3a1f');
    P.rect(262, 127, 26, 3, '#7a4b2a');
    // Repisa: reloj, frasco y candelabro
    P.rect(250, 44, 12, 12, INK);
    P.rect(251, 45, 10, 10, '#a0703c');
    P.blob(256, 50, 3, 3, '#f4f4f4');
    P.rect(256, 48, 1, 3, INK);
    P.rect(256, 50, 2, 1, INK);
    P.rect(284, 46, 7, 10, INK);
    P.rect(285, 47, 5, 9, '#3b5dc9');
    P.rect(285, 47, 1, 9, '#41a6f6');
    // Leña apilada al costado
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3 - i; j++) {
        const lx = 224 + j * 7 + i * 3, ly = 132 - i * 6;
        P.blob(lx, ly, 3, 3, '#8a5a32');
        P.ellipse(lx, ly, 1, 1, '#d4a96e');
      }
    }

    // Barriles con canilla
    barrel(P, 10, 118);
    barrel(P, 21, 120);
    barrel(P, 15, 106);
    P.rect(25, 124, 3, 2, PAL.gold);

    // Jamón y ristra de ajos colgando
    P.rect(120, 8, 1, 12, '#a0703c');
    P.blob(120, 26, 5, 7, '#b0603a');
    P.ellipse(119, 24, 2, 3, '#d08060');
    P.rect(196, 8, 1, 8, '#d4a96e');
    for (let i = 0; i < 4; i++) P.blob(196 + (i % 2 ? 2 : -2), 16 + i * 5, 2, 2, '#f4f0e0');

    counter(P, rand);
    // Sobre el mostrador: pan, libro de huéspedes con pluma, campanita
    P.blob(60, 134, 11, 5, '#c8843a');
    P.ellipse(57, 131, 6, 2, '#e8b060');
    for (const dx of [-6, 0, 6]) P.line(60 + dx - 1, 133, 60 + dx + 1, 130, '#8a5a32');
    P.rect(84, 130, 22, 10, INK);
    P.rect(85, 131, 10, 8, '#f4f0e0');
    P.rect(95, 131, 10, 8, '#e8e0d0');
    for (let i = 0; i < 3; i++) { P.rect(86, 133 + i * 2, 7, 1, '#94b0c2'); P.rect(96, 133 + i * 2, 7, 1, '#94b0c2'); }
    P.line(104, 136, 112, 124, '#f4f4f4');
    P.line(105, 136, 112, 126, '#c2c9d6');
    P.blob(240, 135, 5, 4, PAL.gold);
    P.ellipse(239, 133, 2, 1, '#fff1b8');
    P.rect(240, 128, 1, 3, INK);
    P.rect(233, 139, 15, 1, INK);
  },
  drawFrame(P, t, state) {
    fireGlow(P, 258, 104, 34, 26, t);
    warmLight(P, 275, 110, 60, t);
    const glow = Math.floor(t * 6) % 2;
    P.dither(245, 132, 60, 8, glow ? '#ef7d57' : '#d0743a', glow);
    // Pava colgada con vapor
    P.rect(275, 81, 1, 10, PAL.iron);
    P.blob(275, 97, 7, 5, '#3a3a48');
    P.ellipse(273, 95, 2, 1, '#5d6175');
    P.rect(268, 93, 15, 2, INK);
    steam(P, 282, 92, t, 0.3);
    // Farol colgante con halo que tiembla
    P.rect(104, 9, 1, 12, PAL.iron);
    P.rect(99, 21, 11, 13, INK);
    P.rect(100, 22, 9, 11, glow ? PAL.lit : '#ffe08a');
    P.rect(100, 22, 9, 1, PAL.iron);
    P.rect(104, 22, 1, 11, PAL.iron);
    P.rect(98, 33, 13, 2, INK);
    warmLight(P, 104, 28, 18, t + 1, 'rgba(255, 220, 140, 0.10)');
    drawBerta(P, NPC_X, npcAnim(state, t));
    // Jarra espumante y vapor de la sopa
    P.rect(198, 122, 14, 18, INK);
    P.rect(199, 123, 12, 17, '#d69a2d');
    P.rect(199, 123, 3, 17, '#f0b850');
    P.rect(199, 123, 12, 4, '#f4f4f4');
    P.blob(201, 122, 2, 1, '#ffffff');
    P.rect(211, 127, 4, 8, INK);
    P.rect(212, 128, 2, 6, '#d69a2d');
    for (let i = 0; i < 2; i++) {
      const ph = (t * 0.8 + i / 2) % 1;
      P.px(203 + i * 4, 123 - Math.round(ph * 4), '#ffffff');
    }
    // Plato de sopa humeante
    P.ellipse(128, 138, 10, 3, INK);
    P.ellipse(128, 137, 9, 2, '#f4f4f4');
    P.ellipse(128, 137, 6, 1, '#d0743a');
    steam(P, 126, 134, t, 0);
    steam(P, 131, 134, t, 0.5);
    motes(P, t, 30, 20, 260, 80, 'rgba(255, 230, 170, 0.6)', 8, 0.03);
  },
};

// ---------- Herrería ----------
export const smithyRoom = {
  drawStatic(P) {
    const rand = seeded(23);
    stones(P, 0, 0, ROOM_W, 140, { base: '#6e7286', dark: '#4e5266', light: '#8b8fa3', mortar: '#33364a' }, rand, 7);
    P.dither(0, 100, ROOM_W, 40, '#4e5266', 0);
    ceilingBeams(P, '#3a2618');
    floorBoards(P, rand, '#5d4a3a');

    // Fragua: campana de piedra, hogar de ladrillo y chimenea
    P.poly([[6, 40], [80, 40], [66, 8], [20, 8]], INK);
    P.poly([[8, 40], [78, 40], [65, 9], [21, 9]], '#5d6175');
    P.poly([[8, 40], [30, 40], [26, 9], [21, 9]], '#7d8396');
    P.dither(50, 10, 26, 30, '#4e5266', 0);
    P.rect(4, 40, 80, 5, INK);
    P.rect(5, 41, 78, 3, '#8b8fa3');
    P.rect(5, 41, 78, 1, '#b4b8c8');
    P.rect(8, 45, 72, 95, INK);
    stones(P, 9, 46, 70, 94, { base: '#a0503a', dark: '#6e3020', light: '#c87050', mortar: '#4a2018' }, rand, 5);
    P.rect(20, 86, 48, 42, INK);
    P.rect(21, 87, 46, 41, '#2a120c');
    P.rect(18, 126, 52, 14, '#3a3a48');
    P.rect(18, 126, 52, 2, '#5d6175');
    for (let i = 0; i < 10; i++) P.blob(24 + i * 4.5, 124, 2, 1, i % 2 ? '#3a2a2a' : '#2a1a1a');

    // Fuelle de cuero
    P.poly([[82, 112], [102, 104], [108, 118], [86, 124]], INK);
    P.poly([[83, 113], [101, 106], [106, 117], [86, 122]], '#7a4b2a');
    for (let i = 0; i < 3; i++) P.line(87 + i * 5, 112 - i * 2, 90 + i * 5, 121 - i * 2, '#5d3a1f');
    P.rect(76, 116, 8, 3, PAL.iron);

    // Barril de agua para templar
    barrel(P, 88, 126);
    P.ellipse(92, 127, 3, 1, '#41a6f6');

    // Emblema: escudo con espadas cruzadas
    for (const dir of [-1, 1]) {
      P.line(NPC_X - 24 * dir, 10, NPC_X + 18 * dir, 52, INK);
      P.line(NPC_X - 23 * dir, 10, NPC_X + 19 * dir, 52, '#c2c9d6');
      P.line(NPC_X - 24 * dir, 11, NPC_X + 18 * dir, 53, '#7d8396');
      P.rect(NPC_X + 13 * dir - 3, 45, 7, 3, INK);
      P.rect(NPC_X + 13 * dir - 2, 46, 5, 1, PAL.gold);
      P.rect(NPC_X + 18 * dir - 1, 52, 3, 4, '#5d3a1f');
    }
    P.blob(NPC_X, 32, 14, 15, '#b13e53');
    P.ellipse(NPC_X, 32, 11, 12, '#7a2238');
    P.ellipse(NPC_X - 4, 26, 4, 5, '#a03048');
    P.blob(NPC_X, 32, 4, 4, PAL.gold);
    P.px(NPC_X - 1, 31, '#fff1b8');
    P.rect(NPC_X - 14, 31, 29, 1, PAL.gold);
    P.rect(NPC_X, 18, 1, 29, PAL.gold);

    // Herramientas y cadenas colgadas
    for (const [cx, len] of [[100, 30], [114, 20], [206, 26]]) {
      for (let y = 9; y < 9 + len; y += 2) P.px(cx, y, y % 4 ? PAL.ironLight : PAL.iron);
    }
    P.line(100, 39, 96, 52, PAL.iron);
    P.line(100, 39, 104, 52, PAL.iron);
    P.blob(114, 32, 4, 4, PAL.iron);
    P.blob(114, 32, 2, 2, '#6e7286');
    P.rect(203, 35, 7, 4, '#8b8fa3');
    P.rect(206, 39, 1, 10, PAL.wood);
    // Herraduras de la suerte
    for (const [hx, hy] of [[126, 66], [194, 66]]) {
      P.ellipse(hx, hy, 5, 5, INK);
      P.ellipse(hx, hy, 4, 4, '#8b8fa3');
      P.ellipse(hx, hy + 1, 2, 3, '#6e7286');
      P.rect(hx - 2, hy + 1, 5, 5, '#6e7286');
    }

    // Estante de armas: una hoja de cada elemento, hacha, arco y lanza
    P.rect(212, 20, 100, 104, INK);
    planks(P, 213, 21, 98, 102, { base: '#7a4b2a', dark: '#5d3a1f', light: '#9a6a3e' }, rand, { size: 7 });
    for (const y of [58, 104]) {
      P.rect(213, y, 98, 4, '#4a2e1a');
      P.rect(213, y, 98, 1, '#6e4424');
    }
    ELEMENT_IDS.forEach((el, i) => {
      const sw = swatchFor(el);
      const x = 219 + i * 12;
      P.rect(x - 1, 23, 5, 33, INK);
      P.rect(x, 24, 3, 31, sw.a);
      P.rect(x, 24, 1, 31, sw.c);
      P.rect(x + 2, 24, 1, 31, sw.b);
      P.px(x + 1, 23, sw.c);
      P.rect(x - 3, 54, 9, 3, INK);
      P.rect(x - 2, 55, 7, 1, PAL.gold);
      P.rect(x, 57, 3, 7, PAL.woodDark);
      P.px(x + 1, 64, PAL.gold);
    });
    P.rect(222, 68, 3, 34, PAL.woodDark);
    P.poly([[225, 68], [238, 63], [238, 82], [225, 76]], INK);
    P.poly([[225, 69], [237, 65], [237, 80], [225, 75]], '#c2c9d6');
    P.line(226, 70, 236, 66, '#f4f4f4');
    for (let i = 0; i < 34; i++) {
      const bx = 254 + Math.round(8 * Math.sin((i / 33) * Math.PI));
      P.px(bx - 1, 68 + i, INK);
      P.px(bx, 68 + i, PAL.woodLight);
      P.px(bx + 1, 68 + i, PAL.woodDark);
    }
    P.rect(253, 68, 1, 34, '#f4f4f4');
    P.rect(290, 64, 3, 40, PAL.woodDark);
    P.poly([[287, 66], [291, 54], [295, 66]], INK);
    P.poly([[288, 66], [291, 56], [294, 66]], '#c2c9d6');
    P.rect(288, 66, 7, 2, '#b13e53');

    // Escudo redondo y casco en la pared izquierda
    P.blob(126, 96, 12, 12, '#7a4b2a');
    P.ellipse(126, 96, 9, 9, '#a0703c');
    for (let i = -8; i <= 8; i += 4) P.rect(126 + i, 88, 1, 17, '#7a4b2a');
    P.blob(126, 96, 4, 4, '#8b8fa3');
    P.px(125, 95, '#c2c9d6');
    P.blob(196, 96, 9, 8, '#8b8fa3');
    P.ellipse(193, 92, 4, 3, '#c2c9d6');
    P.rect(188, 97, 17, 3, INK);
    P.rect(195, 97, 3, 6, INK);

    counter(P, rand, { top: '#8b8fa3', front: '#5d3a1f' });
    for (let x = 32; x < 290; x += 26) P.blob(x, COUNTER_Y + 4, 1, 1, PAL.ironLight);
    // Lingotes apilados, herradura y piedra de afilar
    for (const [lx, ly, c] of [[50, 133, '#c2c9d6'], [62, 133, '#c2c9d6'], [56, 128, '#ffcd75']]) {
      P.poly([[lx - 5, ly + 5], [lx - 3, ly], [lx + 5, ly], [lx + 7, ly + 5]], INK);
      P.poly([[lx - 4, ly + 4], [lx - 2, ly + 1], [lx + 4, ly + 1], [lx + 6, ly + 4]], c);
      P.rect(lx - 2, ly + 1, 6, 1, shade(c, 1.2));
    }
    P.rect(234, 132, 20, 7, INK);
    P.rect(235, 133, 18, 5, '#8a7a6a');
    P.rect(235, 133, 18, 1, '#aa9a8a');
  },
  drawFrame(P, t, state) {
    fireGlow(P, 22, 104, 44, 22, t);
    warmLight(P, 44, 108, 60, t, 'rgba(255, 140, 60, 0.12)');
    const f = Math.floor(t * 8) % 2;
    P.dither(9, 80, 70, 6, f ? '#ef7d57' : '#c85a3a', f);
    // Chispas que suben por la campana
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.8 + i / 6) % 1;
      P.px(30 + i * 6 + Math.round(Math.sin(t * 5 + i) * 3), 100 - ph * 70, ph < 0.5 ? '#ffcd75' : '#ef7d57');
    }
    // Humito dentro de la campana
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.3 + i / 3) % 1;
      P.ellipse(44 + Math.round(Math.sin(t + i) * 4), 36 - ph * 26, 3 + Math.round(ph * 3), 2, 'rgba(90, 90, 110, 0.5)');
    }
    // Brillo que recorre las hojas del estante
    const glint = (t * 0.5) % 3;
    if (glint < 1) {
      const gx = 219 + Math.floor(glint * 8) * 12;
      const gy = 24 + Math.floor((t * 40) % 30);
      P.px(gx, gy, '#ffffff');
      P.px(gx + 1, gy - 1, '#ffffff');
      P.px(gx - 1, gy + 1, 'rgba(255,255,255,0.6)');
    }
    // Fuelle que respira
    const pump = Math.round((Math.sin(t * 2) + 1) * 2);
    P.rect(90, 104 - pump, 14, 2, '#5d3a1f');
    drawGrunido(P, NPC_X, npcAnim(state, t));
    motes(P, t, 0, 40, 120, 90, 'rgba(255, 180, 90, 0.7)', 6, 0.08);
  },
};

// ---------- Tienda de magia ----------
export const magicRoom = {
  drawStatic(P) {
    const rand = seeded(31);
    P.rect(0, 0, ROOM_W, 140, '#3e2458');
    for (let y = 10; y < 140; y += 12) {
      for (let x = (y / 12) % 2 ? 4 : 10; x < ROOM_W; x += 12) {
        P.px(x, y, '#5a3a7a');
        P.px(x - 1, y + 1, '#5a3a7a');
        P.px(x + 1, y + 1, '#5a3a7a');
        P.px(x, y + 2, '#5a3a7a');
        P.px(x, y + 1, '#7a52a0');
      }
    }
    P.rect(0, 0, ROOM_W, 8, '#2a1840');
    P.rect(0, 8, ROOM_W, 1, PAL.gold);
    P.rect(0, 9, ROOM_W, 1, PAL.goldDark);
    floorBoards(P, rand, '#4a2e3a');

    // Ventana redonda con cielo nocturno
    P.blob(NPC_X, 50, 34, 34, '#5d3a1f');
    P.ellipse(NPC_X, 50, 31, 31, '#7a4b2a');
    P.ellipse(NPC_X - 6, 44, 24, 24, '#8a5a32');
    P.ellipse(NPC_X, 50, 28, 28, '#1d2b53');
    P.dither(NPC_X - 28, 60, 57, 18, '#29366f', 0);
    P.blob(NPC_X + 10, 36, 8, 8, '#fff6c8');
    P.ellipse(NPC_X + 14, 33, 7, 7, '#1d2b53');
    P.px(NPC_X + 6, 40, '#e0d8a8');
    // Silueta de montañas en la ventana
    P.poly([[NPC_X - 28, 72], [NPC_X - 14, 58], [NPC_X - 4, 66], [NPC_X + 8, 56], [NPC_X + 28, 72], [NPC_X + 22, 76], [NPC_X - 22, 76]], '#141c3a');
    P.rect(NPC_X, 22, 1, 56, '#7a4b2a');
    P.rect(NPC_X - 28, 50, 57, 1, '#7a4b2a');

    // Estantes llenos: frascos, libros, calaveras y frascos con ojos
    for (const sx of [6, 238]) {
      P.rect(sx, 12, 76, 128, INK);
      P.rect(sx + 1, 13, 74, 127, '#2a1840');
      P.dither(sx + 1, 13, 74, 127, '#24142f', 0);
      for (let shelf = 0; shelf < 4; shelf++) {
        const sy = 42 + shelf * 30;
        P.rect(sx + 1, sy, 74, 4, '#7a4b2a');
        P.rect(sx + 1, sy, 74, 1, '#a0703c');
        P.rect(sx + 1, sy + 3, 74, 1, '#4a2e1a');
        let x = sx + 4;
        while (x < sx + 68) {
          const kind = rand();
          if (shelf % 2 === 0 && kind < 0.5) {
            const colors = ['#ef7d57', '#41a6f6', '#a7f070', '#f080b0', '#ffcd75', '#73eff7', '#b07ad0'];
            const c = colors[Math.floor(rand() * colors.length)];
            const h = 10 + Math.floor(rand() * 10);
            const w = 6 + Math.floor(rand() * 5);
            const round = rand() < 0.5;
            if (round) {
              P.blob(x + Math.floor(w / 2), sy - Math.floor(w / 2) - 1, Math.floor(w / 2), Math.floor(w / 2), c);
              P.ellipse(x + Math.floor(w / 2) - 1, sy - w + 2, 1, 1, shade(c, 1.4));
              P.rect(x + Math.floor(w / 2) - 1, sy - w - 4, 3, 4, INK);
              P.px(x + Math.floor(w / 2), sy - w - 3, '#c2e4f0');
            } else {
              P.rect(x, sy - h, w, h, INK);
              P.rect(x + 1, sy - h + 4, w - 2, h - 4, c);
              P.rect(x + 1, sy - h + 4, 1, h - 5, shade(c, 1.4));
              P.rect(x + 1, sy - h + 1, w - 2, 3, '#c2e4f0');
              P.rect(x + 1, sy - Math.floor(h / 2), w - 2, 3, '#f4f0e0');
              P.rect(x + Math.floor(w / 2) - 1, sy - h - 3, 3, 3, INK);
              P.px(x + Math.floor(w / 2), sy - h - 2, '#c8945a');
            }
            x += w + 3;
          } else if (kind < 0.82) {
            const n = 2 + Math.floor(rand() * 4);
            for (let b = 0; b < n && x < sx + 70; b++) {
              const bh = 14 + Math.floor(rand() * 9);
              const bc = ['#b13e53', '#3b5dc9', '#38b764', '#d69a2d', '#5d275d', '#257179'][Math.floor(rand() * 6)];
              P.rect(x, sy - bh, 5, bh, INK);
              P.rect(x + 1, sy - bh + 1, 3, bh - 1, bc);
              P.px(x + 1, sy - bh + 1, shade(bc, 1.3));
              P.rect(x + 1, sy - bh + 4, 3, 1, PAL.gold);
              P.rect(x + 1, sy - 4, 3, 1, PAL.gold);
              x += 5;
            }
            if (rand() < 0.5) {
              P.poly([[x, sy], [x + 2, sy], [x + 12, sy - 14], [x + 10, sy - 15]], INK);
              P.poly([[x + 1, sy - 1], [x + 2, sy - 1], [x + 11, sy - 14], [x + 10, sy - 14]], '#7a2238');
              x += 10;
            }
            x += 3;
          } else if (kind < 0.92) {
            P.blob(x + 5, sy - 6, 5, 5, '#e8e0d0');
            P.rect(x + 2, sy - 7, 3, 3, INK);
            P.rect(x + 6, sy - 7, 3, 3, INK);
            P.rect(x + 2, sy - 2, 7, 2, '#e8e0d0');
            P.px(x + 4, sy - 2, INK);
            P.px(x + 6, sy - 2, INK);
            x += 14;
          } else {
            P.rect(x, sy - 14, 11, 14, INK);
            P.rect(x + 1, sy - 12, 9, 12, '#a6e6c8');
            P.blob(x + 5, sy - 6, 2, 2, '#ffffff');
            P.px(x + 5, sy - 6, '#257179');
            P.rect(x, sy - 15, 11, 2, '#8a5a32');
            x += 14;
          }
        }
      }
    }

    // Caldero en el piso, a la derecha
    P.rect(222, 186, 4, 8, INK);
    P.rect(248, 186, 4, 8, INK);
    P.blob(236, 172, 20, 15, '#2a2a3a');
    P.ellipse(230, 166, 8, 5, '#3a3a4c');
    P.rect(216, 158, 41, 5, INK);
    P.rect(217, 159, 39, 2, '#3a3a4c');
    P.ellipse(236, 159, 18, 2, '#38b764');
    P.rect(220, 194, 32, 4, '#3a1a10');

    counter(P, rand, { x: 46, w: 162, top: '#5d3a1f', front: '#45235e', cloth: '#6a3a8a', panels: 3 });
    // Libro de hechizos abierto
    P.poly([[64, 138], [78, 130], [92, 138]], INK);
    P.rect(65, 132, 13, 7, '#f4f0e0');
    P.rect(78, 132, 13, 7, '#e8e0d0');
    for (let i = 0; i < 3; i++) { P.rect(67, 133 + i * 2, 9, 1, '#94b0c2'); P.rect(80, 133 + i * 2, 9, 1, '#b07ad0'); }
    P.rect(78, 131, 1, 8, '#b13e53');
    // Pie de la bola de cristal
    P.rect(108, 132, 24, 8, INK);
    P.rect(109, 133, 22, 6, PAL.goldDark);
    P.rect(109, 133, 22, 2, PAL.gold);
    for (const fx of [112, 120, 128]) P.px(fx, 136, '#fff1b8');
    // Frasquitos a la venta sobre el paño
    for (const [x, c] of [[184, '#ef7d57'], [192, '#41a6f6'], [200, '#a7f070']]) {
      P.blob(x, 135, 3, 4, c);
      P.rect(x - 1, 128, 3, 4, INK);
      P.px(x, 129, '#c2e4f0');
      P.px(x - 1, 134, '#ffffff');
    }
  },
  drawFrame(P, t, state) {
    // Estrellas que titilan y una estrella fugaz de vez en cuando
    [[-18, 38], [-8, 58], [6, 62], [-20, 52], [18, 60], [-6, 30], [22, 46], [-14, 66]].forEach(([dx, dy], i) => {
      if ((Math.floor(t * 3) + i) % 3) P.px(NPC_X + dx, dy, '#fff6c8');
    });
    const shoot = t % 7;
    if (shoot < 0.6) {
      const k = shoot / 0.6;
      const sx = NPC_X - 20 + Math.round(k * 34), sy = 30 + Math.round(k * 12);
      P.px(sx, sy, '#ffffff');
      P.px(sx - 1, sy - 1, 'rgba(255,255,255,0.6)');
      P.px(sx - 2, sy - 1, 'rgba(255,255,255,0.3)');
    }
    // Hierbas y cristales colgados del techo, que se mecen
    [[96, '#38b764', 0], [112, '#a7f070', 1], [208, '#5aa83a', 2], [224, '#b07ad0', 3]].forEach(([x, c, i]) => {
      const sway = Math.round(Math.sin(t * 1.5 + i) * 1);
      P.rect(x, 9, 1, 8 + i * 2, '#a0703c');
      const y0 = 17 + i * 2;
      if (i === 3) {
        P.poly([[x - 3 + sway, y0 + 4], [x + sway, y0], [x + 3 + sway, y0 + 4], [x + sway, y0 + 10]], INK);
        P.poly([[x - 2 + sway, y0 + 4], [x + sway, y0 + 1], [x + 2 + sway, y0 + 4], [x + sway, y0 + 9]], c);
        if (Math.floor(t * 2) % 3 === 0) P.px(x - 1 + sway, y0 + 3, '#ffffff');
      } else {
        P.poly([[x - 5 + sway, y0], [x + sway, y0 - 4], [x + 5 + sway, y0], [x + 1 + sway, y0 + 12], [x - 1 + sway, y0 + 12]], c);
        P.line(x + sway, y0 - 2, x + sway, y0 + 11, shade(c, 0.7));
      }
    });
    drawChispas(P, NPC_X, npcAnim(state, t), t);
    // Bola de cristal con humo interior
    const g = (Math.sin(t * 2.5) + 1) / 2;
    P.blob(120, 121, 12, 12, g > 0.5 ? '#b07ad0' : '#8a52b0');
    P.ellipse(120, 121, 9, 9, g > 0.5 ? '#d0a0ff' : '#b07ad0');
    P.ellipse(120 + Math.round(Math.sin(t * 2) * 3), 122, 3, 2, '#f4e0ff');
    P.ellipse(120 - Math.round(Math.sin(t * 2) * 3), 119, 2, 1, '#e8c8ff');
    P.px(114, 114, '#ffffff');
    P.px(115, 114, '#ffffff');
    P.px(114, 115, '#ffffff');
    P.ellipse(120, 121, 18, 14, 'rgba(208, 160, 255, 0.08)');
    candle(P, 98, 128, t, 0);
    candle(P, 174, 127, t, 1, 10);
    // Runas que suben del libro
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.6 + i / 3) % 1;
      const rx = 76 + Math.round(Math.sin(t * 2 + i * 2) * 5);
      const ry = 128 - Math.round(ph * 22);
      if (ph < 0.8) { P.px(rx, ry, '#d0a0ff'); P.px(rx + 1, ry - 1, '#b07ad0'); }
    }
    // Burbujas y vapor del caldero
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.8 + i / 4) % 1;
      if (ph < 0.6) P.blob(224 + i * 7, 156 - ph * 18, 1, 1, '#a7f070', '#38b764');
    }
    steam(P, 236, 150, t, 0, 'rgba(167, 240, 112, 0.45)');
    const fl = Math.floor(t * 8) % 2;
    P.rect(224, 192 - fl, 24, 2 + fl, '#ef7d57');
    P.rect(228, 193 - fl, 16, 1 + fl, '#ffcd75');
    // Chispas mágicas flotando en el aire
    motes(P, t, 10, 20, 300, 110, 'rgba(240, 200, 255, 0.8)', 12, 0.05);
  },
};

// ---------- Gimnasio ----------
export const gymRoom = {
  drawStatic(P) {
    const rand = seeded(41);
    planks(P, 0, 0, ROOM_W, 92, { base: '#d4a96e', dark: '#b0884e', light: '#e8c890' }, rand, { size: 9 });
    P.rect(0, 92, ROOM_W, 48, '#b13e53');
    P.dither(0, 120, ROOM_W, 20, '#9a3448', 0);
    P.rect(0, 92, ROOM_W, 4, '#f4f4f4');
    P.rect(0, 99, ROOM_W, 2, '#f4f4f4');
    P.rect(0, 96, ROOM_W, 1, '#c2c9d6');
    floorBoards(P, rand, '#b0804a');

    // Ventanal con luz de sol
    windowPane(P, 16, 16, 42, 32, { lit: false, frame: '#f4f4f4' });
    P.rect(16, 16, 42, 32, '#a6e6ff');
    P.rect(16, 38, 42, 10, '#73c6ff');
    P.ellipse(30, 26, 6, 2, '#ffffff');
    P.rect(36, 16, 2, 32, '#f4f4f4');
    P.rect(16, 31, 42, 2, '#f4f4f4');
    for (const cx of [8, 60]) {
      P.rect(cx, 12, 8, 42, INK);
      P.rect(cx + 1, 13, 6, 40, '#3b5dc9');
      P.rect(cx + 2, 13, 2, 40, '#41a6f6');
    }

    // Póster motivacional
    P.rect(186, 12, 46, 58, INK);
    P.rect(187, 13, 44, 56, '#fff6c8');
    P.rect(187, 13, 44, 4, '#e04a5f');
    P.blob(209, 28, 4, 4, '#d89a6a');
    P.rect(205, 33, 9, 14, '#b13e53');
    for (const dir of [-1, 1]) {
      P.line(209 + dir * 4, 34, 209 + dir * 11, 29, '#d89a6a');
      P.line(209 + dir * 11, 29, 209 + dir * 10, 22, '#d89a6a');
      P.blob(209 + dir * 10, 22, 2, 2, '#d89a6a');
      P.rect(209 + dir * 13 - 2, 19, 5, 3, '#5d6175');
    }
    P.line(207, 47, 203, 56, '#3b5dc9');
    P.line(211, 47, 215, 56, '#3b5dc9');
    P.text('SIN DOLOR', 192, 60, '#b13e53');

    // Repisa de trofeos y medallas
    P.rect(76, 46, 56, 4, INK);
    P.rect(77, 46, 54, 2, PAL.woodDark);
    for (let i = 0; i < 4; i++) {
      const tx = 84 + i * 13;
      const tc = [PAL.gold, '#c2c9d6', '#d0955a', PAL.gold][i];
      const th = i === 3 ? 14 : 10;
      P.rect(tx - 5, 46 - th, 11, th - 4, INK);
      P.rect(tx - 4, 47 - th, 9, th - 6, tc);
      P.px(tx - 3, 48 - th, '#ffffff');
      P.rect(tx - 1, 42, 3, 2, INK);
      P.rect(tx - 3, 44, 7, 2, INK);
      P.px(tx - 6, 48 - th + 1, tc);
      P.px(tx + 6, 48 - th + 1, tc);
    }
    for (let i = 0; i < 3; i++) {
      P.line(86 + i * 16, 54, 90 + i * 16, 62, ['#e04a5f', '#3b5dc9', '#38b764'][i]);
      P.blob(90 + i * 16, 64, 2, 2, [PAL.gold, '#c2c9d6', '#d0955a'][i]);
    }

    // Reloj de pared
    P.blob(258, 28, 12, 12, '#f4f4f4');
    P.blob(258, 28, 11, 11, '#f4f4f4');
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      P.px(258 + Math.round(Math.cos(a) * 9), 28 + Math.round(Math.sin(a) * 9), i % 3 ? '#94b0c2' : INK);
    }

    // Estante de mancuernas y pesas rusas
    P.rect(6, 104, 70, 36, INK);
    P.rect(7, 105, 68, 34, '#5d6175');
    P.rect(7, 105, 68, 1, '#7d8396');
    for (let row = 0; row < 3; row++) {
      const ry = 110 + row * 10;
      P.rect(7, ry + 5, 68, 2, '#3a3e4e');
      for (let i = 0; i < 4; i++) {
        const dx = 11 + i * 16;
        const s = 3 - (row % 2);
        P.rect(dx, ry + 1, 11, 1, PAL.ironLight);
        P.rect(dx - 1, ry + 1 - s, 3, s * 2 + 1, INK);
        P.rect(dx + 10, ry + 1 - s, 3, s * 2 + 1, INK);
        P.px(dx, ry + 1 - s, '#5d6175');
      }
    }
    // Soga colgada
    for (let i = 0; i < 26; i++) P.px(82 + Math.round(Math.sin(i / 4) * 2), 66 + i, i % 2 ? '#e04a5f' : '#f07080');
    P.rect(80, 64, 5, 3, INK);

    counter(P, rand, { top: '#f4f4f4', front: '#b13e53' });
    // Logo de mancuerna en el frente
    P.rect(NPC_X - 16, COUNTER_Y + 26, 33, 16, INK);
    P.rect(NPC_X - 15, COUNTER_Y + 27, 31, 14, '#f4f4f4');
    P.rect(NPC_X - 9, COUNTER_Y + 33, 19, 2, '#5d6175');
    P.rect(NPC_X - 12, COUNTER_Y + 29, 4, 10, INK);
    P.rect(NPC_X + 9, COUNTER_Y + 29, 4, 10, INK);
    // Toalla, batido, cronómetro y planilla
    P.rect(56, 132, 24, 8, INK);
    P.rect(57, 133, 22, 6, '#41a6f6');
    P.rect(57, 136, 22, 1, '#f4f4f4');
    P.blob(102, 134, 5, 5, '#c2c9d6');
    P.ellipse(102, 134, 3, 3, '#f4f4f4');
    P.px(102, 133, INK);
    P.rect(101, 127, 3, 2, INK);
    P.rect(260, 124, 18, 16, INK);
    P.rect(261, 125, 16, 15, '#f4f0e0');
    P.rect(265, 123, 8, 3, '#8b8fa3');
    for (let i = 0; i < 4; i++) P.rect(263, 129 + i * 3, 12, 1, '#94b0c2');
  },
  drawFrame(P, t, state) {
    // Rayo de sol con polvo flotando
    for (let i = 0; i < 70; i++) if (i % 2 === 0) P.px(28 + Math.floor(i * 0.9), 50 + i, 'rgba(255, 246, 200, 0.5)');
    P.poly([[18, 50], [58, 50], [110, 130], [70, 130]], 'rgba(255, 246, 200, 0.10)');
    motes(P, t, 30, 54, 70, 70, 'rgba(255, 246, 200, 0.85)', 9, 0.04);
    // Bolsa de boxeo que se balancea
    const sw = Math.round(Math.sin(t * 2.2) * 4);
    P.line(292, 0, 292 + sw, 36, PAL.iron);
    P.rect(283 + sw, 36, 19, 56, INK);
    P.rect(284 + sw, 37, 17, 54, '#b13e53');
    P.rect(284 + sw, 37, 4, 54, '#e04a5f');
    P.rect(298 + sw, 37, 3, 54, '#7a2238');
    P.rect(284 + sw, 48, 17, 2, INK);
    P.rect(284 + sw, 78, 17, 2, INK);
    P.ellipse(292 + sw, 36, 7, 2, '#5d6175');
    // Agujas del reloj
    const a = t * 0.8;
    P.line(258, 28, 258 + Math.round(Math.cos(a) * 8), 28 + Math.round(Math.sin(a) * 8), '#b13e53');
    P.line(258, 28, 258 + Math.round(Math.cos(a / 12) * 5), 28 + Math.round(Math.sin(a / 12) * 5), INK);
    drawBiceps(P, NPC_X, npcAnim(state, t));
  },
};

// ---------- Tu casa ----------
export const homeRoom = {
  drawStatic(P) {
    const rand = seeded(53);
    P.rect(0, 0, ROOM_W, 140, '#5a8a5a');
    for (let x = 0; x < ROOM_W; x += 14) {
      P.rect(x, 0, 6, 106, '#6a9a64');
      for (let y = 12; y < 106; y += 18) P.px(x + 10, y + ((x / 14) % 2) * 9, '#f0d8a0');
    }
    planks(P, 0, 106, ROOM_W, 34, { base: '#8a5a32', dark: '#5d3a1f', light: '#a87048' }, rand, { size: 7 });
    P.rect(0, 104, ROOM_W, 3, INK);
    P.rect(0, 105, ROOM_W, 1, '#c08a50');
    ceilingBeams(P, '#5d3a1f');
    floorBoards(P, rand, '#a0703c');

    // Ventana con cortinas atadas
    windowPane(P, 128, 24, 64, 42, { lit: false, frame: '#f4f4f4' });
    P.rect(128, 24, 64, 42, '#8fd3ff');
    P.rect(128, 56, 64, 10, '#5aa83a');
    P.rect(128, 54, 64, 2, '#3a7d3a');
    P.poly([[150, 56], [158, 46], [166, 56]], '#2e7a3a');
    P.rect(159, 24, 2, 42, '#f4f4f4');
    P.rect(128, 44, 64, 2, '#f4f4f4');
    for (const [cx, dir] of [[118, 1], [192, -1]]) {
      P.poly([[cx, 18], [cx + 12, 18], [cx + 8 + dir * 2, 50], [cx + 12, 74], [cx, 74]], INK);
      P.poly([[cx + 1, 19], [cx + 11, 19], [cx + 7 + dir * 2, 50], [cx + 11, 73], [cx + 1, 73]], '#b13e53');
      P.rect(cx + 2, 19, 2, 54, '#e04a5f');
      P.rect(cx + 2, 49, 9, 3, PAL.gold);
    }
    P.rect(114, 15, 92, 4, INK);
    P.rect(115, 16, 90, 2, PAL.woodDark);
    P.blob(114, 17, 3, 3, PAL.gold);
    P.blob(206, 17, 3, 3, PAL.gold);
    // Maceta en el alféizar
    P.rect(176, 62, 10, 8, INK);
    P.rect(177, 63, 8, 7, '#c87050');
    P.blob(181, 58, 5, 4, '#38b764');
    P.px(179, 55, '#f080b0');
    P.px(183, 56, '#ffcd75');

    // Cuadro del slime y calendario
    P.rect(36, 26, 34, 28, INK);
    P.rect(37, 27, 32, 26, PAL.gold);
    P.rect(37, 27, 32, 1, '#fff1b8');
    P.rect(40, 30, 26, 20, '#a6e6ff');
    P.rect(40, 44, 26, 6, '#5aa83a');
    P.blob(53, 43, 8, 5, '#5aa83a');
    P.ellipse(50, 41, 3, 1, '#a7f070');
    P.px(50, 43, INK);
    P.px(55, 43, INK);
    P.rect(82, 30, 18, 22, INK);
    P.rect(83, 31, 16, 20, '#f4f4f4');
    P.rect(83, 31, 16, 5, '#e04a5f');
    for (let i = 0; i < 9; i++) P.px(85 + (i % 3) * 5, 39 + Math.floor(i / 3) * 4, i === 4 ? '#e04a5f' : '#94b0c2');

    // Cama con acolchado de retazos
    P.rect(8, 112, 96, 40, INK);
    P.rect(9, 113, 94, 9, '#f4f4f4');
    P.blob(28, 116, 13, 4, '#ffffff');
    P.ellipse(26, 115, 8, 2, '#f4f4f4');
    const quilt = ['#3b5dc9', '#e04a5f', '#38b764', '#ffcd75'];
    for (let qy = 0; qy < 3; qy++) {
      for (let qx = 0; qx < 8; qx++) {
        P.rect(9 + qx * 12, 122 + qy * 10, 12, 10, quilt[(qx + qy) % 4]);
        P.rect(9 + qx * 12, 122 + qy * 10, 12, 1, shade(quilt[(qx + qy) % 4], 1.25));
        P.px(9 + qx * 12, 122 + qy * 10, '#f4f4f4');
      }
    }
    P.rect(4, 96, 8, 60, INK);
    P.rect(5, 97, 6, 59, PAL.woodLight);
    P.rect(5, 97, 2, 59, '#d4a06a');
    P.blob(8, 96, 4, 3, PAL.woodLight);
    P.rect(100, 108, 8, 48, INK);
    P.rect(101, 109, 6, 47, PAL.woodLight);

    // Mesita de luz con lámpara y libro
    P.rect(110, 132, 22, 24, INK);
    P.rect(111, 133, 20, 22, PAL.wood);
    P.rect(111, 133, 20, 2, PAL.woodLight);
    P.rect(113, 141, 16, 1, PAL.woodDark);
    P.px(121, 145, PAL.gold);
    P.rect(116, 128, 10, 4, INK);
    P.rect(117, 128, 8, 3, '#3b5dc9');

    // Ropero con un poco de ropa asomando
    P.rect(236, 32, 72, 120, INK);
    planks(P, 237, 33, 70, 118, { base: '#8a5a32', dark: '#5d3a1f', light: '#a87048' }, rand, { size: 10 });
    P.rect(271, 33, 2, 118, INK);
    P.rect(240, 40, 28, 50, '#7a4b2a');
    P.rect(276, 40, 28, 50, '#7a4b2a');
    P.frame(240, 40, 28, 50, '#a87048');
    P.frame(276, 40, 28, 50, '#a87048');
    P.blob(267, 98, 2, 2, PAL.gold);
    P.blob(277, 98, 2, 2, PAL.gold);
    P.rect(232, 28, 80, 5, INK);
    P.rect(233, 29, 78, 3, PAL.woodLight);
    P.poly([[262, 151], [266, 140], [270, 151]], '#e04a5f');
    // Sombrero sobre el ropero
    P.ellipse(258, 24, 10, 2, '#5d3a1f');
    P.blob(258, 20, 5, 4, '#7a4b2a');
    P.rect(253, 21, 11, 1, '#e04a5f');

    // Alfombra redonda y baúl con remaches dorados
    P.ellipse(NPC_X + 8, 176, 58, 14, INK);
    P.ellipse(NPC_X + 8, 176, 57, 13, '#b13e53');
    P.ellipse(NPC_X + 8, 176, 49, 10, '#ffcd75');
    P.ellipse(NPC_X + 8, 176, 42, 8, '#b13e53');
    P.ellipse(NPC_X + 8, 176, 30, 5, '#7a2238');
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      P.px(NPC_X + 8 + Math.round(Math.cos(a) * 53), 176 + Math.round(Math.sin(a) * 11.5), '#f4f4f4');
    }
    P.rect(250, 158, 40, 26, INK);
    planks(P, 251, 163, 38, 20, { base: '#8a5a32', dark: '#5d3a1f', light: '#a87048' }, rand, { size: 5 });
    P.rect(251, 159, 38, 5, '#a87048');
    P.rect(251, 159, 38, 1, '#c08a50');
    P.rect(251, 168, 38, 2, PAL.gold);
    P.rect(266, 167, 8, 7, INK);
    P.rect(267, 168, 6, 5, PAL.gold);
    P.px(270, 170, INK);
  },
  drawFrame(P, t, state) {
    // Nubes que pasan por la ventana
    for (let i = 0; i < 2; i++) {
      const x = 128 + ((t * 3 + i * 34) % 80) - 8;
      if (x > 128 && x < 186) {
        P.ellipse(x, 30 + i * 8, 5, 2, '#ffffff');
        P.ellipse(x + 3, 29 + i * 8, 3, 1, '#ffffff');
      }
    }
    P.rect(117, 24, 11, 42, '#5a8a5a');
    P.rect(192, 24, 10, 42, '#5a8a5a');
    // Rayo de sol sobre la alfombra
    P.poly([[132, 66], [190, 66], [214, 168], [150, 168]], 'rgba(255, 246, 200, 0.10)');
    motes(P, t, 140, 70, 60, 90, 'rgba(255, 246, 200, 0.8)', 7, 0.035);
    // Lámpara de la mesita
    P.rect(120, 116, 3, 12, INK);
    P.poly([[112, 117], [116, 106], [126, 106], [130, 117]], INK);
    P.poly([[113, 116], [117, 107], [125, 107], [129, 116]], '#ffcd75');
    P.ellipse(121, 116, 10, 6, 'rgba(255, 220, 140, 0.12)');
    // Gato atigrado durmiendo enroscado sobre la cama
    drawSleepingCat(P, 42, 100, t);
    // El héroe, con el equipo puesto, al doble de tamaño
    if (state.heroLook) {
      P.ellipse(NPC_X + 8, 190, 22, 3, 'rgba(26, 28, 44, 0.35)');
      P.ctx.save();
      P.ctx.translate(NPC_X + 8 - 32, 128);
      P.ctx.scale(2, 2);
      drawHero(P, { ...state.heroLook, t });
      P.ctx.restore();
    }
  },
};

export const ROOMS = { posada: innRoom, herrero: smithyRoom, magia: magicRoom, entrenador: gymRoom, mochila: homeRoom };

