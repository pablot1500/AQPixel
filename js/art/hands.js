// Manos y brazos de los vendedores: siluetas con dedos, nudillos y uñas,
// cada una en una pose distinta (apoyada, puño, agarrando algo, con los dedos abiertos).

import { INK, shade, mask, tone } from './paint.js';

// Paleta de una mano: piel, uñas y el pulgar un poco más claro.
export function handPalette(skin, nail = '#f8dcd0') {
  return {
    1: tone(skin, 0.8, 1.1),
    2: tone(nail, 0.85, 1.05),
    3: tone(shade(skin, 1.06), 0.82, 1.12),
  };
}

// Mano apoyada de dorso, dedos hacia adelante. Muñeca arriba al centro (x = 8).
function flatMask() {
  const M = mask(17, 14);
  M.rect(5, 0, 7, 3);
  M.ellipse(8, 4, 5, 2);
  M.rect(3, 4, 11, 3);
  const fingers = [[3, 3], [6, 4], [9, 4], [12, 3]];
  fingers.forEach(([fx, len]) => M.rect(fx, 7, 2, len));
  fingers.forEach(([fx, len]) => { M.set(fx, 6 + len, 2); M.set(fx + 1, 6 + len, 2); });
  // Pulgar hacia el centro del cuerpo
  M.set(2, 4).set(2, 5).set(1, 5).set(1, 6).set(0, 7).set(1, 7).set(0, 8);
  return { M, fingers };
}

// Puño visto de frente: cuatro dedos doblados y el pulgar cruzado. Muñeca arriba (x = 7).
function fistMask() {
  const M = mask(14, 12);
  M.rect(4, 0, 6, 3);
  M.rect(2, 3, 10, 7);
  M.set(2, 3, 0).set(11, 3, 0).set(2, 9, 0).set(11, 9, 0);
  M.rect(3, 8, 6, 2, 3);
  M.set(9, 9, 3);
  return M;
}

// Mano abierta con los dedos separados, como lanzando un hechizo. Muñeca arriba (x = 9).
function spreadMask(wiggle = 0) {
  const M = mask(20, 15);
  M.rect(6, 0, 7, 3);
  M.ellipse(9, 4, 5, 2);
  M.rect(4, 4, 11, 3);
  const tips = [[3, 11 + wiggle], [7, 13], [11, 13 - wiggle], [16, 10 + wiggle]];
  const roots = [[5, 7], [8, 7], [11, 7], [14, 6]];
  roots.forEach(([rx, ry], i) => {
    const [tx, ty] = tips[i];
    M.stroke(rx, ry, tx, ty - 1, 0);
    M.stroke(rx + 1, ry, tx + 1, ty - 1, 0);
    M.set(tx, ty, 2).set(tx + 1, ty, 2);
  });
  M.stroke(4, 5, 1, 9, 0);
  M.stroke(5, 5, 2, 9, 0);
  M.set(1, 10, 2);
  return { M, tips };
}

export function drawFlatHand(P, wx, wy, dir, pal) {
  const { M, fingers } = flatMask();
  const flip = dir < 0;
  const ox = wx - 8;
  M.draw(P, ox, wy, pal, { flip });
  // Nudillos y pliegues
  const sx = (x) => ox + (flip ? 16 - x : x);
  fingers.forEach(([fx]) => {
    P.px(sx(fx), wy + 6, pal[1].light);
    P.px(sx(fx + 1), wy + 9, pal[1].shade);
  });
  P.px(sx(7), wy + 2, pal[1].shade);
}

export function drawFist(P, wx, wy, pal, flip = false) {
  const M = fistMask();
  const ox = wx - 7;
  M.draw(P, ox, wy, pal, { flip });
  // Separación de los dedos y nudillos
  for (const x of [4, 6, 8, 10]) {
    const sx = ox + (flip ? 13 - x : x);
    P.rect(sx, wy + 4, 1, 4, pal[1].shade);
  }
  for (const x of [3, 5, 7, 9]) P.px(ox + (flip ? 13 - x : x), wy + 3, pal[1].light);
  P.rect(ox + (flip ? 5 : 4), wy + 8, 4, 1, pal[3].light);
}

// Mano que agarra algo vertical (mango, botella), vista de costado: el dorso de un lado,
// el pulgar arriba y los cuatro dedos que envuelven el objeto con las uñas del otro lado.
// (hx, y) es el centro del objeto a la altura donde empieza la mano; reach es cuánto lo rodean los dedos.
export function drawGrip(P, hx, y, dir, pal, reach = 4) {
  const back = 5;
  const w = back + reach + 4;
  const M = mask(w, 13);
  M.rect(0, 3, back + 1, 9);
  M.set(0, 3, 0).set(0, 11, 0);
  M.ellipse(back, 2, 3, 2, 3);
  const rows = [4, 6, 8, 10];
  rows.forEach((ry, i) => {
    const len = back + reach + (i === 0 || i === 3 ? 1 : 2);
    M.rect(1, ry, len, 2);
    M.set(len, ry, 2);
    M.set(len, ry + 1, 0);
  });
  const ox = dir > 0 ? hx - back - 1 : hx - (w - back - 2);
  M.draw(P, ox, y, pal, { flip: dir < 0 });
  const sx = (x) => ox + (dir < 0 ? w - 1 - x : x);
  rows.forEach((ry) => {
    for (let x = 2; x <= back + reach - 1; x++) P.px(sx(x), y + ry + 1, pal[1].shade);
    P.px(sx(1), y + ry, pal[1].light);
  });
  P.px(sx(back - 1), y + 1, pal[3].light);
}

export function drawSpreadHand(P, wx, wy, dir, pal, wiggle = 0) {
  const { M } = spreadMask(wiggle);
  const ox = wx - 9;
  M.draw(P, ox, wy, pal, { flip: dir < 0 });
  for (const x of [5, 8, 11, 14]) P.px(ox + (dir < 0 ? 19 - x : x), wy + 6, pal[1].light);
}

// Brazo de una pieza: hombro → codo → muñeca, con puño de manga al final.
// pal: { 1: manga, 4: puño de la manga, 5: antebrazo de piel (opcional) }
export function drawArm(P, shoulder, elbow, wrist, pal, { upper = 5, fore = 4, cuff = true, bareForearm = false } = {}) {
  const pts = [shoulder, elbow, wrist];
  const minX = Math.min(...pts.map((p) => p[0])) - upper - 3;
  const minY = Math.min(...pts.map((p) => p[1])) - upper - 3;
  const maxX = Math.max(...pts.map((p) => p[0])) + upper + 3;
  const maxY = Math.max(...pts.map((p) => p[1])) + upper + 3;
  const M = mask(maxX - minX + 1, maxY - minY + 1);
  const L = ([x, y]) => [x - minX, y - minY];
  const [s, e, w] = pts.map(L);
  M.stroke(s[0], s[1], e[0], e[1], upper, 1);
  M.stroke(e[0], e[1], w[0], w[1], fore, bareForearm ? 5 : 1);
  M.ellipse(e[0], e[1], upper, upper, 1);
  if (cuff) {
    const k = 0.72;
    const cx = e[0] + (w[0] - e[0]) * k, cy = e[1] + (w[1] - e[1]) * k;
    M.stroke(cx, cy, w[0], w[1], fore, 4);
  }
  M.draw(P, minX, minY, pal);
}

export { INK };
