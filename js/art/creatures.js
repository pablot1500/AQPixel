// Héroe y monstruos a 32×32, dibujados por código con sombreado y animación (t en segundos).
// Los colores a/b/c vienen de la variante elemental (base, sombra, brillo).

import { INK, shade } from './paint.js';

export const CREATURE_SIZE = 32;
const SHADOW = 'rgba(26, 28, 44, 0.35)';

// Polígono con contorno: expande cada vértice 1 px hacia afuera del centro.
function opoly(P, pts, color) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  P.poly(pts.map(([x, y]) => [x + Math.sign(Math.round(x - cx)), y + Math.sign(Math.round(y - cy))]), INK);
  P.poly(pts, color);
}

function eye(P, x, y, { look = -1, blink = false, iris = INK, h = 3 } = {}) {
  if (blink) {
    P.rect(x - 1, y + 1, 3, 1, INK);
    return;
  }
  P.rect(x - 1, y - 1, 3, h + 2, INK);
  P.rect(x - 1, y, 3, h, '#ffffff');
  P.rect(x + (look < 0 ? -1 : 0), y + 1, 2, h - 1, iris);
  P.px(x + (look < 0 ? -1 : 0), y + 1, '#ffffff');
}

const blinking = (t, period = 3.7) => (t % period) < 0.13;

// ---------- Héroe ----------
export function drawHero(P, { weapon, armor, armorColors, weaponColors, t = 0 }) {
  const b = Math.floor(t * 2) % 2;
  const skin = '#f4c99b', skinDark = '#d89a6a';
  const hair = '#7a4b2a', hairDark = '#4a2e1a', hairLight = '#a8703c';
  const ar = armorColors;
  const heavy = (armor?.def ?? 0) >= 6;
  const cape = '#b13e53', capeDark = '#7a2238';

  P.ellipse(16, 30, 9, 1, SHADOW);

  // Capa que flamea detrás
  const wave = Math.round(Math.sin(t * 5) * 1.5);
  opoly(P, [[12, 14 + b], [8, 16 + b], [5 + wave, 27], [8, 28], [11 - wave, 27], [13, 18 + b]], cape);
  P.line(9, 18 + b, 7 + wave, 26, capeDark);
  P.line(10, 18 + b, 9, 27, capeDark);

  // Piernas y botas
  for (const [lx, bx] of [[12, 10], [17, 16]]) {
    P.rect(lx - 1, 22, 5, 6, INK);
    P.rect(lx, 22, 3, 5, '#333c57');
    P.px(lx, 23, '#4a5478');
    P.rect(bx, 26, 7, 4, INK);
    P.rect(bx + 1, 26, 5, 3, '#5d3a1f');
    P.rect(bx + 1, 26, 5, 1, '#8a5a32');
    P.px(bx + 5, 28, '#3a2416');
  }

  // Brazo de atrás
  P.rect(8, 16 + b, 4, 6, INK);
  P.rect(9, 16 + b, 2, 5, ar.b);
  P.rect(9, 21 + b, 2, 1, skinDark);

  // Torso
  P.rect(10, 14 + b, 12, 11, INK);
  P.rect(11, 15 + b, 10, 9, ar.a);
  P.rect(11, 15 + b, 2, 9, ar.c);
  P.rect(19, 15 + b, 2, 9, ar.b);
  P.rect(11, 23 + b, 10, 1, ar.b);
  if (heavy) {
    P.rect(13, 17 + b, 6, 1, ar.b);
    P.rect(13, 19 + b, 6, 1, ar.b);
    P.px(12, 16 + b, '#ffffff');
    P.px(19, 16 + b, '#ffffff');
  } else {
    P.px(15, 16 + b, skin);
    P.px(16, 16 + b, skin);
    P.px(15, 17 + b, skinDark);
  }
  // Cinturón con hebilla
  P.rect(11, 21 + b, 10, 2, '#5d3a1f');
  P.rect(15, 21 + b, 2, 2, '#ffcd75');
  P.px(15, 21 + b, '#fff1b8');
  // Faldón
  P.rect(10, 24, 12, 2, INK);
  P.rect(11, 24, 10, 1, ar.b);

  // Cabeza
  const hy = 8 + b;
  P.blob(15, hy, 6, 6, skin);
  P.rect(19, hy - 3, 2, 8, skinDark);
  P.dither(18, hy - 4, 3, 9, skinDark, 0);
  // Pelo despeinado con mechones en punta
  for (const [x, top] of [[10, hy - 9], [13, hy - 10], [16, hy - 9], [19, hy - 7]]) {
    P.poly([[x - 3, hy - 4], [x, top - 1], [x + 3, hy - 4]], INK);
    P.poly([[x - 2, hy - 4], [x, top], [x + 2, hy - 4]], hair);
  }
  P.ellipse(14, hy - 4, 7, 3, INK);
  P.ellipse(14, hy - 4, 6, 2, hair);
  P.rect(8, hy - 4, 5, 10, INK);
  P.rect(9, hy - 4, 4, 9, hair);
  P.rect(9, hy + 3, 3, 2, hairDark);
  P.poly([[17, hy - 2], [21, hy - 3], [20, hy + 1]], hair);
  P.px(20, hy, INK);
  P.rect(11, hy - 6, 4, 1, hairLight);
  P.px(13, hy - 9, hairLight);
  P.px(16, hy - 8, hairLight);
  // Vincha con puntas que vuelan
  P.rect(9, hy - 2, 12, 2, INK);
  P.rect(10, hy - 2, 10, 1, '#e04a5f');
  const tail = Math.round(Math.sin(t * 6) * 1);
  P.line(9, hy - 1, 5, hy + tail, '#e04a5f');
  P.line(9, hy, 6, hy + 2 + tail, '#b13e53');
  // Cara
  P.rect(14, hy + 1, 1, 2, INK);
  P.rect(18, hy + 1, 1, 2, INK);
  if (blinking(t)) { P.px(14, hy + 1, skin); P.px(18, hy + 1, skin); }
  P.px(13, hy + 3, '#f09090');
  P.px(19, hy + 3, '#e88080');
  P.rect(16, hy + 4, 2, 1, '#7a2238');
  P.px(12, hy + 1, skinDark);

  // Arma
  const wc = weaponColors;
  if (weapon?.type === 'ranged') {
    for (let i = 0; i <= 20; i++) {
      const x = 25 + Math.round(4 * Math.sin((Math.PI * i) / 20));
      P.px(x + 1, 6 + i + b, INK);
      P.px(x, 6 + i + b, i % 5 === 0 ? wc.c : wc.a);
      P.px(x - 1, 6 + i + b, INK);
    }
    P.rect(24, 6 + b, 1, 21, '#e8e0d0');
    P.rect(22, 15 + b, 5, 3, INK);
    P.rect(23, 16 + b, 3, 1, '#5d3a1f');
  } else if (weapon) {
    P.rect(22, 0 + b, 4, 18, INK);
    P.rect(23, 1 + b, 2, 16, wc.a);
    P.rect(23, 1 + b, 1, 16, wc.c);
    P.px(24, 16 + b, wc.b);
    P.rect(20, 16 + b, 8, 3, INK);
    P.rect(21, 17 + b, 6, 1, '#ffcd75');
    P.rect(23, 19 + b, 2, 3, '#5d3a1f');
    P.rect(22, 22 + b, 4, 2, INK);
    P.rect(23, 22 + b, 2, 1, '#ffcd75');
  }
  // Brazo de adelante y mano
  P.rect(19, 15 + b, 4, 5, INK);
  P.rect(20, 16 + b, 2, 3, ar.a);
  P.blob(23, 19 + b, 1, 1, skin);

  // Chispas del elemento del arma
  if (weapon && weapon.element !== 'neutral') {
    for (let i = 0; i < 3; i++) {
      const ph = (t * 1.2 + i / 3) % 1;
      const px = 24 + Math.round(Math.sin(t * 4 + i * 2) * 3);
      const py = 16 - Math.round(ph * 16) + b;
      if (ph < 0.8) P.px(px, py, i % 2 ? wc.c : wc.a);
    }
  }
}

// ---------- Monstruos ----------
export const MONSTER_ART = {
  slime(P, c, t, el) {
    const sq = Math.sin(t * 4);
    const rx = 12 + Math.round(sq);
    const ry = 9 - Math.round(sq);
    const cx = 16, base = 29, cy = base - ry;
    P.ellipse(16, 30, rx, 1, SHADOW);
    for (let y = cy - ry - 1; y <= base; y++) {
      const dy = y - cy;
      let w;
      if (dy <= 0) w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / ((ry + 1) * (ry + 1)))));
      else w = rx - Math.round((dy / (base - cy)) ** 2 * 2);
      P.rect(cx - w - 1, y, w * 2 + 3, 1, INK);
      if (y > cy - ry - 1 && y < base) P.rect(cx - w, y, w * 2 + 1, 1, y > base - 4 ? c.b : c.a);
    }
    P.dither(cx + 4, cy - 2, rx - 4, ry + 4, c.b, 0);
    P.ellipse(cx - 5, cy - 4, 3, 2, c.c);
    P.px(cx - 6, cy - 5, '#ffffff');
    P.px(cx - 5, cy - 5, '#ffffff');
    P.px(cx + 5, cy + 3, c.c);
    P.px(cx + 7, cy + 1, c.c);
    P.px(cx + 6, cy + 5, c.c);
    const bl = blinking(t);
    eye(P, cx - 5, cy, { blink: bl, h: 4 });
    eye(P, cx + 2, cy, { blink: bl, h: 4 });
    P.rect(cx - 3, cy + 6, 4, 1, INK);
    P.px(cx - 4, cy + 5, INK);
    P.px(cx + 1, cy + 5, INK);
    P.rect(cx - 2, cy + 7, 2, 1, '#e04a5f');
    // Gotita que cae por un costado
    const drip = (t * 0.7) % 1;
    P.px(cx + rx - 1, cy + 2 + Math.round(drip * 6), c.c);

    const top = cy - ry - 1;
    if (el === 'tierra') {
      P.line(cx, top, cx, top - 3, '#38703a');
      P.blob(cx - 2, top - 4, 2, 1, '#5aa83a');
      P.blob(cx + 2, top - 5, 2, 1, '#a7f070');
    } else if (el === 'agua') {
      const ph = (t * 0.8) % 1;
      const by = top - 2 - Math.round(ph * 5);
      if (ph < 0.85) { P.blob(cx + 3, by, 1, 1, '#a6e6ff'); P.px(cx + 2, by - 1, '#ffffff'); }
    } else if (el === 'fuego') {
      const f = Math.floor(t * 10) % 3;
      P.poly([[cx - 4, top + 2], [cx - 2, top - 5 - f], [cx, top - 2], [cx + 2, top - 7 + f], [cx + 5, top + 2]], '#ef7d57');
      P.poly([[cx - 2, top + 2], [cx, top - 3], [cx + 3, top + 2]], '#ffcd75');
    } else if (el === 'hielo') {
      for (const [dx, hgt] of [[-5, 4], [0, 6], [5, 3]]) {
        P.poly([[cx + dx - 2, top + 2], [cx + dx, top + 1 - hgt], [cx + dx + 2, top + 2]], INK);
        P.poly([[cx + dx - 1, top + 2], [cx + dx, top + 2 - hgt], [cx + dx + 1, top + 2]], '#f4f4f4');
      }
    }
  },

  mushroom(P, c, t) {
    const hop = Math.round(Math.abs(Math.sin(t * 3)) * 3);
    const y0 = -hop;
    P.ellipse(16, 30, 9 - hop, 1, SHADOW);
    // Pies
    P.blob(12, 28 + y0, 2, 1, '#8a6238');
    P.blob(20, 28 + y0, 2, 1, '#8a6238');
    // Tallo con cara
    P.blob(16, 22 + y0, 6, 6, '#f4e4c1');
    P.rect(20, 18 + y0, 2, 9, '#d8c49a');
    eye(P, 14, 20 + y0, { blink: blinking(t, 4.1), h: 3 });
    eye(P, 18, 20 + y0, { blink: blinking(t, 4.1), h: 3 });
    P.px(12, 24 + y0, '#f09090');
    P.px(20, 24 + y0, '#f09090');
    P.rect(15, 25 + y0, 3, 1, INK);
    // Sombrero
    P.ellipse(16, 12 + y0, 14, 9, INK);
    P.ellipse(16, 12 + y0, 13, 8, c.a);
    P.rect(3, 13 + y0, 27, 4, INK);
    P.ellipse(16, 15 + y0, 12, 2, '#e8d8b0');
    for (let x = 6; x <= 26; x += 3) P.px(x, 15 + y0, '#c8b48a');
    P.dither(19, 6 + y0, 9, 8, c.b, 0);
    P.ellipse(9, 8 + y0, 3, 2, c.c);
    for (const [x, y, r] of [[10, 10, 2], [19, 6, 2], [24, 11, 1], [15, 10, 1], [5, 12, 1]]) {
      P.ellipse(x, y + y0, r + 1, r, '#f8f4ec');
      P.px(x + r, y + y0 + 1, '#d8d0c0');
    }
  },

  wolf(P, c, t) {
    const br = Math.floor(t * 2) % 2;
    const wag = Math.round(Math.sin(t * 7) * 2);
    P.ellipse(17, 30, 12, 1, SHADOW);
    // Cola
    opoly(P, [[26, 16], [30, 10 + wag], [31, 13 + wag], [28, 19]], c.a);
    P.px(30, 11 + wag, c.c);
    // Patas traseras y delanteras
    for (const [x, tone] of [[24, c.b], [27, c.a], [10, c.b], [14, c.a]]) {
      P.rect(x - 1, 21, 4, 8, INK);
      P.rect(x, 21, 2, 7, tone);
      P.rect(x - 1, 27, 4, 2, INK);
      P.rect(x, 27, 3, 1, shade(tone, 0.8));
    }
    // Cuerpo
    P.ellipse(19, 18 - br, 11, 6, INK);
    P.ellipse(19, 18 - br, 10, 5, c.a);
    P.rect(11, 20 - br, 16, 3, c.b);
    P.dither(11, 19 - br, 18, 2, c.b, 1);
    for (let x = 12; x < 28; x += 3) P.px(x, 13 - br, c.c);
    // Pecho peludo
    opoly(P, [[8, 15], [13, 13], [14, 22], [10, 23]], c.c);
    P.px(10, 20, c.a);
    P.px(11, 22, c.a);
    // Cabeza y orejas
    opoly(P, [[6, 7], [8, 2], [10, 7]], c.a);
    opoly(P, [[10, 7], [13, 3], [14, 8]], c.b);
    P.px(8, 5, '#f0a0a0');
    P.blob(9, 11, 5, 4, c.a);
    opoly(P, [[5, 11], [0, 13], [1, 16], [6, 16]], c.a);
    P.px(0, 13, INK);
    P.rect(1, 16, 5, 1, INK);
    P.px(2, 17, '#ffffff');
    P.px(4, 17, '#ffffff');
    P.rect(2, 15, 4, 1, c.b);
    // Ojo
    P.rect(6, 9, 3, 2, INK);
    P.px(7, 9, '#ffcd75');
    if (!blinking(t)) P.px(6, 9, '#ffcd75');
    P.rect(5, 8, 4, 1, c.b);
  },

  crab(P, c, t) {
    const snap = Math.floor(t * 3) % 2;
    P.ellipse(16, 30, 12, 1, SHADOW);
    // Patas
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const sx = 16 + dir * (5 + i * 3);
        P.line(sx, 24, sx + dir * 3, 28, INK);
        P.line(sx, 23, sx + dir * 2, 27, c.b);
      }
    }
    // Brazos y pinzas
    for (const dir of [-1, 1]) {
      const cx = 16 + dir * 11;
      P.line(16 + dir * 6, 20, cx, 13, INK);
      P.line(16 + dir * 6, 19, cx, 12, c.a);
      const open = snap ? 3 : 1;
      opoly(P, [[cx - 4, 12], [cx, 3], [cx + 4, 12]], c.a);
      P.rect(cx - 1, 4, 2, open + 3, INK);
      P.px(cx - 2, 6, c.c);
      P.px(cx + dir, 10, c.b);
    }
    // Ojos en antenas
    for (const ex of [12, 20]) {
      P.rect(ex, 12, 1, 5, INK);
      P.blob(ex, 11, 2, 2, '#ffffff');
      P.px(ex - 1, 11, INK);
      P.px(ex - 1, 12, INK);
    }
    // Caparazón
    P.ellipse(16, 21, 12, 6, INK);
    P.ellipse(16, 21, 11, 5, c.a);
    P.ellipse(14, 19, 6, 2, c.c);
    P.rect(6, 24, 21, 2, c.b);
    for (const [x, y] of [[10, 21], [20, 20], [16, 23], [23, 22]]) P.px(x, y, c.b);
    P.rect(14, 24, 4, 1, INK);
    const bub = (t * 0.9) % 1;
    if (bub < 0.7) P.blob(18, 22 - Math.round(bub * 10), 1, 1, '#a6e6ff', '#41a6f6');
  },

  imp(P, c, t) {
    const hover = Math.round(Math.sin(t * 3) * 1.5);
    const flap = Math.floor(t * 8) % 2;
    P.ellipse(16, 30, 7, 1, SHADOW);
    const y = hover;
    // Alas
    for (const dir of [-1, 1]) {
      const tip = flap ? 4 : 9;
      opoly(P, [[16 + dir * 3, 16 + y], [16 + dir * 13, tip + y], [16 + dir * 11, 18 + y], [16 + dir * 7, 17 + y], [16 + dir * 5, 21 + y]], '#5d275d');
      P.line(16 + dir * 4, 16 + y, 16 + dir * 12, tip + 1 + y, '#3e1d4a');
    }
    // Cola con punta de flecha
    P.line(19, 24 + y, 25, 26 + y, INK);
    P.line(25, 26 + y, 27, 22 + y, INK);
    opoly(P, [[26, 19 + y], [29, 21 + y], [26, 23 + y]], c.b);
    // Cuerpo
    P.blob(16, 21 + y, 5, 5, c.a);
    P.ellipse(16, 23 + y, 3, 2, c.c);
    P.rect(12, 26 + y, 3, 3, INK);
    P.rect(17, 26 + y, 3, 3, INK);
    P.px(13, 27 + y, c.b);
    P.px(18, 27 + y, c.b);
    // Tridente
    P.rect(5, 6 + y, 1, 23, INK);
    P.rect(4, 6 + y, 1, 22, '#8b8fa3');
    P.rect(2, 5 + y, 6, 1, INK);
    for (const x of [2, 4, 7]) P.rect(x, 2 + y, 1, 3, '#c2c9d6');
    P.blob(8, 20 + y, 1, 1, c.a);
    // Cabeza, cuernos y orejas
    opoly(P, [[10, 7 + y], [9, 1 + y], [13, 5 + y]], '#f0e4c8');
    opoly(P, [[19, 5 + y], [23, 1 + y], [22, 7 + y]], '#f0e4c8');
    opoly(P, [[8, 11 + y], [4, 9 + y], [9, 14 + y]], c.a);
    opoly(P, [[23, 11 + y], [28, 9 + y], [23, 14 + y]], c.a);
    P.blob(16, 11 + y, 7, 6, c.a);
    P.ellipse(13, 8 + y, 3, 2, c.c);
    P.dither(18, 7 + y, 4, 9, c.b, 0);
    eye(P, 13, 9 + y, { iris: '#ffcd75', blink: blinking(t, 3.1) });
    eye(P, 18, 9 + y, { iris: '#ffcd75', blink: blinking(t, 3.1) });
    P.rect(11, 14 + y, 9, 2, INK);
    P.px(12, 14 + y, '#ffffff');
    P.px(17, 14 + y, '#ffffff');
    P.px(11, 13 + y, INK);
    P.px(19, 13 + y, INK);
  },

  bat(P, c, t) {
    const f = Math.floor(t * 9) % 3;
    const y = Math.round(Math.sin(t * 4) * 2);
    P.ellipse(16, 30, 8, 1, SHADOW);
    const tipY = [3, 9, 15][f];
    for (const dir of [-1, 1]) {
      const pts = [[16 + dir * 3, 13 + y], [16 + dir * 15, tipY + y], [16 + dir * 14, 17 + y], [16 + dir * 11, 15 + y], [16 + dir * 9, 19 + y], [16 + dir * 6, 16 + y], [16 + dir * 4, 19 + y]];
      opoly(P, pts, c.b);
      P.line(16 + dir * 3, 13 + y, 16 + dir * 15, tipY + y, c.a);
      P.line(16 + dir * 9, 12 + y + Math.round((tipY - 12) / 2), 16 + dir * 9, 18 + y, c.a);
    }
    opoly(P, [[11, 9 + y], [12, 3 + y], [14, 8 + y]], c.a);
    opoly(P, [[18, 8 + y], [20, 3 + y], [21, 9 + y]], c.a);
    P.blob(16, 14 + y, 5, 6, c.a);
    P.ellipse(16, 17 + y, 3, 3, c.c);
    P.rect(13, 12 + y, 2, 2, '#ef3e3e');
    P.rect(18, 12 + y, 2, 2, '#ef3e3e');
    P.px(13, 12 + y, '#ffcd75');
    P.px(18, 12 + y, '#ffcd75');
    P.rect(15, 16 + y, 3, 1, INK);
    P.px(15, 17 + y, '#ffffff');
    P.px(17, 17 + y, '#ffffff');
    P.rect(14, 20 + y, 1, 2, INK);
    P.rect(18, 20 + y, 1, 2, INK);
  },

  yeti(P, c, t) {
    const br = Math.floor(t * 1.6) % 2;
    P.ellipse(16, 30, 13, 1, SHADOW);
    // Pies
    for (const fx of [10, 22]) {
      P.blob(fx, 28, 3, 1, '#566c86');
    }
    // Cuerpo peludo
    P.blob(16, 19 - br, 12, 10, c.a);
    for (let a = 0; a < 18; a++) {
      const ang = (a / 18) * Math.PI * 2;
      const x = 16 + Math.round(Math.cos(ang) * 13);
      const yy = 19 - br + Math.round(Math.sin(ang) * 11);
      if (yy < 27) P.px(x, yy, INK);
    }
    P.dither(20, 12 - br, 8, 14, c.b, 0);
    P.ellipse(11, 13 - br, 4, 3, c.c);
    // Brazos
    for (const dir of [-1, 1]) {
      P.blob(16 + dir * 12, 21, 4, 7, c.a);
      P.rect(16 + dir * 12 - 2, 25, 5, 3, '#566c86');
      P.px(16 + dir * 12, 18, c.b);
    }
    // Cara
    P.blob(16, 13 - br, 7, 5, c.f ?? '#41a6f6');
    P.ellipse(15, 11 - br, 4, 1, shade(c.f ?? '#41a6f6', 1.3));
    eye(P, 13, 11 - br, { blink: blinking(t, 4.4), h: 2 });
    eye(P, 19, 11 - br, { blink: blinking(t, 4.4), h: 2 });
    P.rect(11, 9 - br, 4, 1, c.b);
    P.rect(17, 9 - br, 4, 1, c.b);
    P.rect(12, 15 - br, 8, 3, INK);
    P.rect(13, 16 - br, 6, 1, '#7a2238');
    P.rect(13, 15 - br, 1, 2, '#ffffff');
    P.rect(18, 15 - br, 1, 2, '#ffffff');
    // Cuernos
    opoly(P, [[8, 11 - br], [4, 4 - br], [11, 9 - br]], '#c2c9d6');
    opoly(P, [[24, 11 - br], [28, 4 - br], [21, 9 - br]], '#c2c9d6');
    P.px(6, 6 - br, '#f4f4f4');
    P.px(26, 6 - br, '#f4f4f4');
    // Aliento helado
    const ph = (t * 0.7) % 1;
    if (ph < 0.6) {
      P.ellipse(7 - Math.round(ph * 6), 15 - br - Math.round(ph * 3), 1 + Math.round(ph * 2), 1, 'rgba(244,244,244,0.8)');
    }
  },

  skeleton(P, c, t) {
    const sway = Math.round(Math.sin(t * 2) * 1);
    const chat = Math.floor(t * 6) % 2;
    const glow = (Math.sin(t * 4) + 1) / 2 > 0.5 ? c.r ?? '#b07ad0' : shade(c.r ?? '#b07ad0', 0.7);
    P.ellipse(16, 30, 9, 1, SHADOW);
    // Piernas
    for (const [x0, x1] of [[14, 12], [18, 20]]) {
      P.line(x0, 22, x1, 28, INK);
      P.line(x0 + 1, 22, x1 + 1, 28, c.a);
      P.rect(x1 - 1, 28, 4, 2, INK);
      P.rect(x1, 28, 3, 1, c.a);
    }
    // Trapo violeta en la cadera
    opoly(P, [[11 + sway, 21], [21 + sway, 21], [20 + sway, 25], [16 + sway, 23], [12 + sway, 25]], glow === c.r ? '#5d275d' : '#4a1f4a');
    // Columna y costillas
    P.rect(15 + sway, 13, 2, 9, c.a);
    for (let i = 0; i < 3; i++) {
      const ry = 15 + i * 2;
      P.rect(11 + sway, ry, 10, 1, c.a);
      P.rect(11 + sway, ry + 1, 10, 1, INK);
      P.px(10 + sway, ry, INK);
      P.px(21 + sway, ry, INK);
    }
    // Brazo con hueso garrote
    P.line(11 + sway, 15, 7, 19, c.a);
    P.line(7, 19, 5, 14, c.a);
    P.blob(4, 9, 2, 4, c.a);
    P.blob(4, 5, 2, 2, c.a);
    P.line(21 + sway, 15, 23, 21, c.a);
    P.blob(23, 22, 1, 1, c.a);
    // Cráneo
    P.blob(15 + sway, 8, 6, 6, c.a);
    P.dither(18 + sway, 4, 3, 8, c.b, 0);
    P.ellipse(13 + sway, 5, 2, 1, '#ffffff');
    P.rect(11 + sway, 7, 3, 3, INK);
    P.rect(16 + sway, 7, 3, 3, INK);
    P.px(12 + sway, 8, glow);
    P.px(17 + sway, 8, glow);
    P.px(14 + sway, 10, INK);
    P.rect(11 + sway, 12 + chat, 9, 2, INK);
    P.rect(12 + sway, 12 + chat, 7, 1, c.a);
    for (let x = 12; x < 19; x += 2) P.px(x + sway, 12 + chat, INK);
  },

  ghost(P, c, t) {
    const fy = Math.round(Math.sin(t * 2) * 2);
    // Estela tenue
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.5 + i / 3) % 1;
      P.px(16 + Math.round(Math.sin(t * 3 + i) * 6), 29 - Math.round(ph * 4), 'rgba(228,220,244,0.5)');
    }
    const top = 4 + fy;
    for (let y = top; y <= 26 + fy; y++) {
      let w;
      if (y < top + 10) w = Math.round(10 * Math.sqrt(Math.max(0, 1 - ((top + 10 - y) / 10.5) ** 2)));
      else w = 10 + Math.round((y - top - 10) / 6);
      P.rect(16 - w - 1, y, w * 2 + 3, 1, INK);
      P.rect(16 - w, y, w * 2 + 1, 1, y > 20 + fy ? c.b : c.a);
    }
    for (let x = 4; x <= 28; x++) {
      const by = 26 + fy + Math.round(Math.sin(x * 0.9 + t * 6) * 1.5);
      P.rect(x, 26 + fy, 1, by - 26 - fy + 1, x % 2 ? c.b : c.a);
      P.px(x, by + 1, INK);
    }
    P.dither(20, top + 3, 6, 18, c.b, 0);
    P.ellipse(11, top + 4, 3, 2, c.c ?? '#ffffff');
    // Bracitos
    const wave = Math.round(Math.sin(t * 4) * 2);
    P.blob(4, 16 + fy + wave, 2, 2, c.a);
    P.blob(28, 16 + fy - wave, 2, 2, c.a);
    // Cara
    P.blob(11, 12 + fy, 2, 3, INK);
    P.blob(19, 12 + fy, 2, 3, INK);
    P.px(10, 11 + fy, '#5d4a7a');
    P.px(18, 11 + fy, '#5d4a7a');
    P.blob(15, 19 + fy, 2, 2, INK);
    P.px(15, 20 + fy, '#3a2a4a');
    P.px(8, 16 + fy, '#d0a0d0');
    P.px(22, 16 + fy, '#d0a0d0');
  },
};

export function drawMonster(P, sprite, colors, element, t = 0) {
  (MONSTER_ART[sprite] ?? MONSTER_ART.slime)(P, colors, t, element);
}
