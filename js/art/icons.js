// Íconos de 16×16 para objetos e interfaz, teñidos con los colores del elemento (a, b, c).

import { INK } from './paint.js';

export const ICON_SIZE = 16;

export const ICON_ART = {
  sword(P, c) {
    // Hoja en diagonal con contorno
    for (let i = 0; i < 10; i++) {
      P.rect(5 + i, 9 - i, 3, 3, INK);
    }
    for (let i = 0; i < 10; i++) {
      P.px(6 + i, 9 - i, c.a);
      P.px(6 + i, 10 - i, c.b);
      P.px(5 + i, 9 - i, c.c);
    }
    P.px(15, 0, INK);
    // Guarda, empuñadura y pomo
    P.line(1, 8, 7, 14, INK);
    P.line(2, 7, 8, 13, INK);
    P.line(2, 8, 7, 13, '#ffcd75');
    P.rect(2, 11, 3, 3, INK);
    P.px(3, 12, '#8a5a32');
    P.px(2, 13, '#8a5a32');
    P.rect(0, 13, 3, 3, INK);
    P.px(1, 14, '#ffcd75');
  },
  bow(P, c) {
    for (let i = 0; i <= 13; i++) {
      const a = (i / 13) * (Math.PI / 2);
      const x = Math.round(2 + Math.sin(a) * 12);
      const y = Math.round(14 - Math.cos(a) * 12);
      P.rect(x - 1, y - 1, 3, 3, INK);
    }
    for (let i = 0; i <= 13; i++) {
      const a = (i / 13) * (Math.PI / 2);
      const x = Math.round(2 + Math.sin(a) * 12);
      const y = Math.round(14 - Math.cos(a) * 12);
      P.px(x, y, i % 4 === 0 ? c.c : c.a);
    }
    P.line(2, 2, 14, 14, '#e8e0d0');
    // Flecha
    P.line(3, 12, 11, 4, '#8a5a32');
    P.rect(10, 3, 3, 2, INK);
    P.px(12, 3, '#c2c9d6');
    P.px(3, 12, '#f4f4f4');
    P.px(2, 13, '#f4f4f4');
  },
  armor(P, c) {
    const pts = [[2, 3], [6, 1], [10, 1], [14, 3], [13, 8], [12, 15], [4, 15], [3, 8]];
    P.poly(pts.map(([x, y]) => [x + (x < 8 ? -1 : 1), y + (y < 8 ? -1 : 1)]), INK);
    P.poly(pts, c.a);
    P.poly([[2, 3], [6, 1], [7, 2], [5, 15], [4, 15], [3, 8]], c.c);
    P.poly([[10, 2], [14, 3], [13, 8], [12, 15], [11, 15]], c.b);
    P.poly([[6, 1], [10, 1], [8, 5]], INK);
    P.rect(4, 10, 9, 2, INK);
    P.rect(5, 10, 7, 1, '#8a5a32');
    P.px(8, 10, '#ffcd75');
    P.px(5, 5, '#ffffff');
  },
  orb(P, c) {
    P.blob(8, 7, 6, 6, c.a);
    P.ellipse(9, 9, 4, 3, c.b);
    P.ellipse(8, 7, 4, 4, c.a);
    P.ellipse(6, 5, 2, 2, c.c);
    P.px(5, 4, '#ffffff');
    P.px(11, 9, c.c);
    P.rect(4, 13, 9, 3, INK);
    P.rect(5, 13, 7, 2, '#d69a2d');
    P.rect(5, 13, 7, 1, '#ffcd75');
  },
  potion(P, c) {
    P.blob(8, 10, 5, 5, '#c2e4f0');
    P.ellipse(8, 11, 4, 3, c.a);
    P.rect(4, 11, 9, 3, c.a);
    P.ellipse(8, 13, 3, 1, c.b);
    P.px(6, 10, c.c);
    P.px(10, 12, c.c);
    P.px(5, 7, '#ffffff');
    P.px(5, 8, '#ffffff');
    P.rect(5, 2, 7, 5, INK);
    P.rect(6, 3, 5, 3, '#c2e4f0');
    P.rect(5, 0, 7, 3, INK);
    P.rect(6, 1, 5, 1, '#a0703c');
  },
  coin(P) {
    P.blob(8, 8, 6, 6, '#ffcd75');
    P.ellipse(9, 9, 5, 5, '#d69a2d');
    P.ellipse(8, 8, 5, 5, '#ffcd75');
    P.ellipse(8, 8, 3, 3, '#f0b850');
    P.rect(7, 5, 2, 7, '#fff1b8');
    P.px(6, 6, '#fff1b8');
    P.px(4, 4, '#ffffff');
  },
  bed(P) {
    P.rect(1, 6, 3, 9, INK);
    P.rect(2, 7, 1, 8, '#a0703c');
    P.rect(1, 9, 14, 5, INK);
    P.rect(2, 10, 12, 3, '#3b5dc9');
    P.rect(2, 10, 12, 1, '#41a6f6');
    P.blob(5, 9, 2, 1, '#f4f4f4');
    P.rect(13, 9, 2, 6, INK);
  },
};

export function drawIcon(P, name, colors) {
  (ICON_ART[name] ?? ICON_ART.orb)(P, colors);
}
