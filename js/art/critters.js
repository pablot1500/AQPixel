// Animalitos del pueblo y de la casa, dibujados con siluetas de contorno automático.

import { INK, mask, tone } from './paint.js';

const FUR = { 1: tone('#e8904a', 0.78, 1.18), 2: tone('#f4f0e8', 0.86, 1.04), 3: '#f0a0a0' };
const STRIPE = '#c0602a';

// Punto de una curva cuadrática (para colas).
const bez = (p0, p1, p2, k) => [
  (1 - k) * (1 - k) * p0[0] + 2 * (1 - k) * k * p1[0] + k * k * p2[0],
  (1 - k) * (1 - k) * p0[1] + 2 * (1 - k) * k * p1[1] + k * k * p2[1],
];

// Gato atigrado durmiendo enroscado como un rollito. (x, y) es la esquina superior izquierda.
export function drawSleepingCat(P, x, y, t) {
  const b = Math.floor(t * 1.4) % 2;
  const twitch = (t % 5.3) < 0.25;
  const flick = Math.round(Math.sin(t * 2.2) * 1.5);
  const M = mask(40, 26);

  // Cuerpo redondo que respira
  M.ellipse(24, 15 - b, 11, 8 + b);
  // Cola que rodea el cuerpo por delante, con la punta que se sacude
  const p0 = [33, 19], p1 = [36, 25], p2 = [13 + flick, 23];
  for (let i = 0; i <= 16; i++) {
    const [tx, ty] = bez(p0, p1, p2, i / 16);
    M.ellipse(Math.round(tx), Math.round(ty), 1, 1, 1);
  }
  // Cabeza grande apoyada, con orejas (la derecha se mueve de vez en cuando)
  M.ellipse(12, 15, 7, 6);
  M.tri(5, 12, 6, 4, 11, 9);
  M.tri(12, 9, twitch ? 17 : 16, twitch ? 4 : 3, 18, 12);
  // Hocico, pecho y patitas blancas
  M.ellipse(10, 18, 3, 2, 2);
  M.ellipse(16, 20, 2, 2, 2);
  M.ellipse(8, 22, 2, 1, 2);
  M.ellipse(13, 22, 2, 1, 2);
  // Interior rosado de las orejas
  M.set(7, 8, 3).set(7, 9, 3).set(8, 10, 3);
  M.set(twitch ? 16 : 15, 7, 3).set(15, 8, 3).set(15, 9, 3).set(14, 9, 3);

  P.ellipse(x + 21, y + 24, 18, 2, 'rgba(26, 28, 44, 0.25)');
  M.draw(P, x, y, FUR);

  // Contorno de la cabeza sobre el cuerpo, para que se lean separados
  for (let k = -5; k <= 4; k++) {
    const hx = 12 + Math.round(Math.sqrt(Math.max(0, 1 - (k * k) / 36)) * 7);
    P.px(x + hx + 1, y + 15 + k, '#a04a1a');
  }
  // Rayas atigradas que siguen la curva del lomo
  for (let i = 0; i < 5; i++) {
    const ang = -2.4 + i * 0.45;
    const r0 = 6, r1 = 10;
    const cx = 24, cy = 15 - b;
    P.line(x + cx + Math.round(Math.cos(ang) * r0), y + cy + Math.round(Math.sin(ang) * (r0 - 1)),
      x + cx + Math.round(Math.cos(ang) * r1), y + cy + Math.round(Math.sin(ang) * (r1 - 2)), STRIPE);
  }
  for (const [sx, sy] of [[10, 11], [11, 10], [12, 11], [13, 10], [14, 11]]) P.px(x + sx, y + sy, STRIPE);
  for (let i = 1; i <= 16; i += 3) {
    const [tx, ty] = bez(p0, p1, p2, i / 16);
    P.px(x + Math.round(tx), y + Math.round(ty) - 1, STRIPE);
    P.px(x + Math.round(tx), y + Math.round(ty), STRIPE);
  }
  // Mejillas esponjosas
  P.px(x + 5, y + 16, '#f4f0e8');
  P.px(x + 4, y + 17, '#f4f0e8');
  // Ojos cerrados con pestañitas, nariz y boquita
  for (const ex of [7, 13]) {
    P.px(x + ex, y + 14, INK);
    P.px(x + ex + 1, y + 15, INK);
    P.px(x + ex + 2, y + 15, INK);
    P.px(x + ex + 3, y + 14, INK);
    P.px(x + ex + 3, y + 13, INK);
  }
  P.rect(x + 10, y + 17, 2, 1, '#e07a8a');
  P.px(x + 10, y + 18, '#e07a8a');
  P.px(x + 9, y + 19, INK);
  P.px(x + 11, y + 19, INK);
  P.px(x + 10, y + 18, INK);
  // Bigotes
  for (const [wx, wy] of [[5, 17], [3, 17], [2, 16], [5, 19], [3, 20], [16, 17], [18, 16]]) P.px(x + wx, y + wy, '#fff6e8');

  // Zetas que suben mientras duerme
  for (let i = 0; i < 2; i++) {
    const ph = (t * 0.35 + i / 2) % 1;
    if (ph > 0.75) continue;
    const zx = x + 14 + Math.round(ph * 8) + i * 3;
    const zy = y + 4 - Math.round(ph * 16);
    P.text('Z', zx, zy, ph < 0.4 ? '#f4f4f4' : 'rgba(244, 244, 244, 0.6)');
  }
}

// Gato sentado en el techo, de perfil, con la cola que se balancea.
export function drawSittingCat(P, x, y, t) {
  const sway = Math.round(Math.sin(t * 2.5) * 2);
  const blink = (t % 4.2) < 0.2;
  const M = mask(14, 12);
  M.ellipse(5, 8, 3, 3);
  M.rect(3, 9, 5, 3);
  M.ellipse(4, 4, 3, 2);
  M.tri(1, 3, 2, 0, 4, 3);
  M.tri(4, 3, 6, 0, 7, 3);
  const p0 = [8, 10], p1 = [12, 10], p2 = [11 + sway, 3];
  for (let i = 0; i <= 8; i++) {
    const [tx, ty] = bez(p0, p1, p2, i / 8);
    M.set(Math.round(tx), Math.round(ty), 1);
  }
  M.ellipse(4, 10, 1, 1, 2);
  M.set(2, 5, 2).set(3, 5, 2);
  M.draw(P, x, y, FUR);
  P.px(x + 4, y + 7, STRIPE);
  P.px(x + 6, y + 8, STRIPE);
  P.px(x + 2, y + 3, blink ? STRIPE : INK);
  P.px(x + 5, y + 3, blink ? STRIPE : INK);
}
