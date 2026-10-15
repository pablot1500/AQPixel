// Retratos de los dueños de cada local, de la cintura para arriba, apoyados en el mostrador.
// Se redibujan en cada cuadro para parpadear y mover la boca mientras hablan.

import { INK, PAL, shade } from './paint.js';

export const COUNTER_Y = 140;

// Cuerpo base: torso, cuello, cabeza con orejas, ojos, cejas, nariz, boca y rubor.
function bust(P, cx, o, anim) {
  const { hy, rx = 13, ry = 14, skin, clothes, sw = 30 } = o;
  const skinDark = o.skinDark ?? shade(skin, 0.84);
  const skinDeep = shade(skin, 0.7);
  const skinLight = shade(skin, 1.08);
  const clothesDark = o.clothesDark ?? shade(clothes, 0.72);
  const clothesLight = o.clothesLight ?? shade(clothes, 1.22);
  const sy = hy + ry + 4;

  // Torso con hombros redondeados
  const torso = [[cx - sw, COUNTER_Y], [cx - sw, sy + 10], [cx - sw + 9, sy], [cx + sw - 9, sy], [cx + sw, sy + 10], [cx + sw, COUNTER_Y]];
  P.poly(torso.map(([x, y]) => [x + (x < cx ? -1 : 1), y - 1]), INK);
  P.poly(torso, clothes);
  P.poly([[cx - sw, COUNTER_Y], [cx - sw, sy + 10], [cx - sw + 9, sy], [cx - sw + 13, sy], [cx - sw + 6, COUNTER_Y]], clothesLight);
  P.poly([[cx + sw - 7, COUNTER_Y], [cx + sw - 13, sy], [cx + sw - 9, sy], [cx + sw, sy + 10], [cx + sw, COUNTER_Y]], clothesDark);
  // Pliegues de la ropa
  P.line(cx - 6, sy + 14, cx - 9, COUNTER_Y - 2, clothesDark);
  P.line(cx + 8, sy + 16, cx + 10, COUNTER_Y - 2, clothesDark);
  // Brazos que bajan hasta el mostrador
  for (const dir of [-1, 1]) {
    const ax = cx + dir * (sw - 7);
    P.line(ax, sy + 12, ax - dir * 3, COUNTER_Y - 1, INK);
    P.line(ax + dir, sy + 12, ax - dir * 2, COUNTER_Y - 1, dir < 0 ? clothesLight : clothesDark);
  }
  o.body?.(P, cx, sy, { skin, skinDark, clothes, clothesDark, clothesLight, sw });

  // Cuello con sombra del mentón
  P.rect(cx - 6, hy + ry - 4, 13, 9, INK);
  P.rect(cx - 5, hy + ry - 4, 11, 8, skinDark);
  P.rect(cx - 5, hy + ry - 4, 11, 3, skinDeep);
  o.behindHead?.(P, cx, hy);

  // Orejas
  for (const dir of [-1, 1]) {
    P.blob(cx + dir * (rx + 1), hy + 2, 2, 4, dir < 0 ? skin : skinDark);
    P.rect(cx + dir * (rx + 1), hy + 1, 1, 3, skinDeep);
  }
  // Cabeza con volumen
  P.blob(cx, hy, rx, ry, skin);
  P.ellipse(cx - 4, hy - 5, 5, 4, skinLight);
  P.dither(cx + Math.round(rx / 3), hy - ry + 4, Math.round(rx * 0.7), ry * 2 - 7, skinDark, 0);
  P.rect(cx + rx - 2, hy - 4, 2, 11, skinDark);
  P.ellipse(cx, hy + ry - 2, rx - 5, 1, skinDark);

  // Ojos
  const ey = hy + (o.eyeDy ?? 1);
  for (const ex of [cx - 7, cx + 3]) {
    if (anim.blink) {
      P.rect(ex - 1, ey + 2, 6, 1, INK);
      P.px(ex - 1, ey + 1, INK);
    } else {
      P.rect(ex, ey, 4, 4, '#ffffff');
      P.rect(ex + 1, ey, 3, 4, o.eyes ?? '#3b5dc9');
      P.rect(ex + 2, ey + 1, 1, 3, INK);
      P.px(ex + 1, ey, '#ffffff');
      P.rect(ex - 1, ey - 1, 6, 1, INK);
      P.px(ex - 1, ey, INK);
      P.px(ex + 4, ey + 3, skinDark);
    }
  }
  // Cejas
  const browC = o.brows ?? INK;
  P.rect(cx - 8, ey - 4, 6, 1, browC);
  P.px(cx - 8, ey - 3, browC);
  P.rect(cx + 3, ey - 4, 6, 1, browC);
  P.px(cx + 8, ey - 3, browC);
  // Nariz
  P.rect(cx, ey + 4, 1, 3, skinDark);
  P.px(cx - 1, ey + 7, skinDeep);
  P.px(cx + 1, ey + 7, skinDeep);
  P.px(cx - 1, ey + 4, skinLight);
  // Rubor
  if (o.blush !== false) {
    P.rect(cx - 10, ey + 7, 3, 1, '#f09090');
    P.rect(cx + 8, ey + 7, 3, 1, '#f09090');
  }
  // Boca
  const my = ey + 10;
  const lips = o.lips ?? '#8a3048';
  if (anim.mouthOpen) {
    P.rect(cx - 3, my - 1, 7, 4, INK);
    P.rect(cx - 2, my - 1, 5, 1, '#f4f4f4');
    P.rect(cx - 2, my + 1, 5, 1, '#b13e53');
  } else {
    P.rect(cx - 3, my, 7, 1, lips);
    P.px(cx - 4, my - 1, lips);
    P.px(cx + 4, my - 1, lips);
    P.px(cx, my + 1, skinDark);
  }
  o.face?.(P, cx, hy, anim, { skin, skinDark, skinDeep, ey, my, sy });
}

function hands(P, cx, sw, skin, extra = 0) {
  const dark = shade(skin, 0.8);
  for (const dir of [-1, 1]) {
    const hx = cx + dir * (sw - 9 + extra);
    P.blob(hx, COUNTER_Y + 3, 5, 3, skin);
    P.rect(hx - 4, COUNTER_Y + 5, 9, 1, dark);
    for (let f = -2; f <= 2; f += 2) P.px(hx + f, COUNTER_Y + 1, dark);
    P.px(hx - dir * 3, COUNTER_Y + 2, shade(skin, 1.08));
  }
}

// ---------- Doña Berta, la posadera ----------
export function drawBerta(P, cx, anim) {
  const hair = '#c2c3cf', hairDark = '#8b8fa3', hairLight = '#e4e4ec', skin = '#f4c99b';
  const o = {
    hy: 84, skin, clothes: '#b13e53', sw: 30, eyes: '#6a4a2a', brows: hairDark,
    body: (P2, x, sy) => {
      // Mangas abullonadas
      for (const dir of [-1, 1]) {
        P2.blob(x + dir * 24, sy + 6, 7, 6, '#c84a60');
        P2.ellipse(x + dir * 24 - 2, sy + 3, 3, 2, '#e0606a');
      }
      // Delantal con volados, bolsillo y corazón bordado
      P2.rect(x - 15, sy + 10, 31, COUNTER_Y - sy - 10, INK);
      P2.rect(x - 14, sy + 11, 29, COUNTER_Y - sy - 11, '#f4f4f4');
      P2.rect(x + 8, sy + 11, 7, COUNTER_Y - sy - 11, '#dcdce4');
      for (let fx = x - 14; fx < x + 15; fx += 3) P2.px(fx, sy + 11, '#ffffff');
      P2.rect(x - 6, sy + 26, 13, 8, '#dcdce4');
      P2.frame(x - 6, sy + 26, 13, 8, '#b4b8c8');
      P2.sprite(['.r.r.', 'rrrrr', '.rrr.', '..r..'], { r: '#e04a5f' }, x - 2, sy + 15);
      P2.line(x - 14, sy + 11, x - 19, sy + 2, '#f4f4f4');
      P2.line(x + 14, sy + 11, x + 19, sy + 2, '#f4f4f4');
      // Cuello blanco y collar de perlas
      P2.rect(x - 8, sy - 1, 17, 5, INK);
      P2.rect(x - 7, sy, 15, 3, '#f4f4f4');
      for (let i = -6; i <= 6; i += 2) P2.px(x + i, sy + 4 + Math.round(Math.abs(i) / 3), '#fff6e0');
    },
    behindHead: (P2, x, hy) => {
      // Rodete grande con horquilla
      P2.blob(x, hy - 19, 8, 7, hair);
      P2.ellipse(x - 3, hy - 22, 3, 2, hairLight);
      P2.line(x - 5, hy - 17, x + 3, hy - 24, hairDark);
      P2.rect(x + 6, hy - 24, 6, 1, '#ffcd75');
      P2.px(x + 12, hy - 24, '#e04a5f');
    },
    face: (P2, x, hy) => {
      // Pelo canoso recogido con ondas
      P2.ellipse(x, hy - 9, 14, 7, INK);
      P2.ellipse(x, hy - 9, 13, 6, hair);
      for (const dir of [-1, 1]) {
        P2.rect(x + dir * 12 - (dir < 0 ? 2 : 0), hy - 8, 4, 12, INK);
        P2.rect(x + dir * 12 - (dir < 0 ? 1 : 0), hy - 8, 3, 11, hair);
        P2.blob(x + dir * 13, hy + 4, 2, 2, hair);
      }
      for (let i = -10; i <= 8; i += 4) P2.line(x + i, hy - 13, x + i + 3, hy - 7, hairDark);
      P2.rect(x - 6, hy - 14, 7, 1, hairLight);
      // Aros dorados
      P2.blob(x - 15, hy + 7, 1, 1, PAL.gold);
      P2.blob(x + 15, hy + 7, 1, 1, PAL.gold);
      // Arruguitas de risa
      P2.px(x - 10, hy + 2, '#d8a070');
      P2.px(x + 10, hy + 2, '#d8a070');
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw, skin);
}

// ---------- Gruñido, el herrero enano ----------
export function drawGrunido(P, cx, anim) {
  const skin = '#e8a878', beard = '#d0743a', beardDark = '#9a4a24', beardLight = '#ef9a57';
  const o = {
    hy: 92, rx: 14, ry: 13, skin, clothes: '#5d6175', sw: 34, eyes: '#1a1c2c', brows: beardDark, blush: false,
    body: (P2, x, sy) => {
      // Cota de malla en los hombros
      for (const dir of [-1, 1]) {
        P2.blob(x + dir * 26, sy + 8, 8, 7, '#7d8396');
        for (let i = 0; i < 12; i++) P2.px(x + dir * 26 + ((i * 3) % 12) - 6, sy + 4 + Math.floor(i / 4) * 3, '#a4aab8');
      }
      // Delantal de cuero con tiras, bolsillo y herramientas
      P2.rect(x - 19, sy + 6, 39, COUNTER_Y - sy - 6, INK);
      P2.rect(x - 18, sy + 7, 37, COUNTER_Y - sy - 7, '#7a4b2a');
      P2.dither(x - 18, sy + 7, 37, COUNTER_Y - sy - 7, '#6a3e22', 0);
      P2.rect(x - 18, sy + 7, 37, 1, '#9a6a3e');
      P2.line(x - 18, sy + 7, x - 24, sy - 1, '#5d3a1f');
      P2.line(x + 18, sy + 7, x + 24, sy - 1, '#5d3a1f');
      P2.rect(x + 4, sy + 26, 11, 9, '#5d3a1f');
      P2.rect(x + 6, sy + 22, 1, 6, '#8b8fa3');
      P2.rect(x + 10, sy + 21, 2, 7, '#a0703c');
      P2.rect(x + 9, sy + 20, 4, 2, '#8b8fa3');
      for (const rx of [x - 16, x + 16]) P2.px(rx, sy + 9, PAL.gold);
    },
    face: (P2, x, hy, a, { ey, skinDark }) => {
      // Mancha de hollín
      P2.px(x - 9, ey + 4, '#6a5a50');
      P2.px(x - 8, ey + 5, '#6a5a50');
      // Barba gigante trenzada
      const bp = [[x - 15, hy + 1], [x - 11, hy + 8], [x - 6, hy + 10], [x + 6, hy + 10], [x + 11, hy + 8], [x + 15, hy + 1], [x + 15, hy + 18], [x + 9, hy + 32], [x, hy + 42], [x - 9, hy + 32], [x - 15, hy + 18]];
      P2.poly(bp.map(([px, py]) => [px + (px < x ? -1 : px > x ? 1 : 0), py + 1]), INK);
      P2.poly(bp, beard);
      P2.poly([[x + 5, hy + 11], [x + 15, hy + 5], [x + 14, hy + 19], [x + 8, hy + 31], [x + 2, hy + 38]], beardDark);
      for (let i = 0; i < 8; i++) P2.line(x - 11 + i * 3, hy + 13, x - 9 + i * 2.5, hy + 30, i % 2 ? beardDark : shade(beard, 0.85));
      P2.line(x - 8, hy + 15, x - 6, hy + 26, beardLight);
      P2.line(x - 3, hy + 14, x - 2, hy + 30, beardLight);
      for (const bx of [x - 5, x + 5]) {
        P2.rect(bx - 2, hy + 34, 5, 10, INK);
        P2.rect(bx - 1, hy + 34, 3, 9, beard);
        P2.rect(bx - 1, hy + 38, 3, 2, PAL.gold);
        P2.px(bx, hy + 38, '#fff1b8');
      }
      // Bigote
      P2.poly([[x - 11, ey + 9], [x - 2, ey + 6], [x + 2, ey + 6], [x + 11, ey + 9], [x + 8, ey + 12], [x, ey + 9], [x - 7, ey + 12]], beardLight);
      P2.line(x - 9, ey + 10, x - 2, ey + 8, beard);
      if (a.mouthOpen) P2.rect(x - 2, ey + 12, 5, 3, INK);
      // Nariz grande y roja
      P2.blob(x, ey + 5, 3, 3, '#d88860');
      P2.px(x - 1, ey + 3, '#f0c098');
      P2.px(x + 2, ey + 6, skinDark);
      // Cejas tupidas
      P2.rect(x - 9, ey - 5, 7, 2, beardDark);
      P2.rect(x + 3, ey - 5, 7, 2, beardDark);
      P2.px(x - 9, ey - 6, beardDark);
      P2.px(x + 9, ey - 6, beardDark);
      // Casco con cuernos y remaches
      for (const dir of [-1, 1]) {
        const pts = [[x + dir * 15, hy - 9], [x + dir * 22, hy - 15], [x + dir * 24, hy - 26], [x + dir * 20, hy - 20], [x + dir * 13, hy - 14]];
        P2.poly(pts.map(([px, py]) => [px + dir, py]), INK);
        P2.poly(pts, dir < 0 ? '#f0e4c8' : '#d8c8a8');
        P2.line(x + dir * 17, hy - 13, x + dir * 22, hy - 21, dir < 0 ? '#c8b898' : '#b8a888');
      }
      P2.ellipse(x, hy - 8, 16, 10, INK);
      P2.ellipse(x, hy - 8, 15, 9, '#8b8fa3');
      P2.rect(x - 15, hy - 8, 31, 8, '#8b8fa3');
      P2.ellipse(x - 5, hy - 12, 6, 3, '#c2c9d6');
      P2.px(x - 7, hy - 13, '#ffffff');
      P2.dither(x + 6, hy - 14, 9, 12, '#5d6175', 0);
      P2.rect(x - 16, hy - 1, 33, 4, INK);
      P2.rect(x - 15, hy - 1, 31, 3, '#5d6175');
      P2.rect(x - 15, hy - 1, 31, 1, '#7d8396');
      for (let i = -12; i <= 12; i += 6) P2.px(x + i, hy, PAL.gold);
      P2.rect(x - 1, hy - 17, 3, 16, '#5d6175');
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw, skin, 2);
  // Martillo apoyado en el mostrador
  P.rect(cx + 36, COUNTER_Y - 18, 4, 22, INK);
  P.rect(cx + 37, COUNTER_Y - 17, 2, 20, PAL.wood);
  P.px(cx + 37, COUNTER_Y - 12, PAL.woodLight);
  P.rect(cx + 30, COUNTER_Y - 26, 16, 9, INK);
  P.rect(cx + 31, COUNTER_Y - 25, 14, 7, '#8b8fa3');
  P.rect(cx + 31, COUNTER_Y - 25, 14, 2, '#c2c9d6');
  P.rect(cx + 31, COUNTER_Y - 20, 14, 2, '#5d6175');
}

// ---------- Madame Chispas, la hechicera ----------
export function drawChispas(P, cx, anim, t = 0) {
  const skin = '#f0d0b8', hair = '#2a2440', hairLight = '#4a4070', robe = '#6a3a8a';
  const o = {
    hy: 92, rx: 12, ry: 13, skin, clothes: robe, sw: 28, eyes: '#38b764', brows: hair, lips: '#9a2a7a',
    behindHead: (P2, x, hy) => {
      // Pelo largo y ondulado que cae sobre los hombros
      P2.ellipse(x, hy - 2, 15, 14, INK);
      P2.ellipse(x, hy - 2, 14, 13, hair);
      for (const dir of [-1, 1]) {
        const lx = x + dir * 13;
        for (let y = hy; y < hy + 34; y++) {
          const wob = Math.round(Math.sin(y / 3) * 1.2);
          P2.rect(lx - 3 + wob, y, 7, 1, INK);
          P2.rect(lx - 2 + wob, y, 5, 1, hair);
          if (y % 5 === 0) P2.px(lx + wob, y, hairLight);
        }
      }
    },
    body: (P2, x, sy) => {
      // Estrellitas bordadas y ribete dorado
      for (const [dx, dy] of [[-20, 14], [-10, 30], [14, 22], [22, 34], [-22, 32]]) {
        P2.px(x + dx, sy + dy, PAL.gold);
        P2.px(x + dx - 1, sy + dy, '#b07ad0');
        P2.px(x + dx + 1, sy + dy, '#b07ad0');
      }
      P2.line(x - 10, sy, x, sy + 18, PAL.gold);
      P2.line(x + 10, sy, x, sy + 18, PAL.gold);
      P2.line(x - 9, sy, x, sy + 16, PAL.goldDark);
      // Broche de luna
      P2.blob(x, sy + 20, 3, 3, '#f4f4f4');
      P2.ellipse(x + 1, sy + 19, 2, 2, '#c8b8e8');
      P2.px(x - 1, sy + 21, '#ffffff');
    },
    face: (P2, x, hy, a, { ey }) => {
      // Flequillo ondulado
      P2.ellipse(x, hy - 8, 13, 6, hair);
      P2.poly([[x - 13, hy - 5], [x - 5, hy - 5], [x - 9, hy + 1]], hair);
      P2.poly([[x + 2, hy - 5], [x + 12, hy - 5], [x + 9, hy - 1]], hair);
      P2.line(x - 8, hy - 10, x - 3, hy - 6, hairLight);
      // Lunar
      P2.px(x + 6, ey + 8, '#5a3a3a');
      // Anteojos redondos dorados
      for (const gx of [x - 5, x + 5]) {
        P2.frame(gx - 4, ey - 2, 8, 7, PAL.gold);
        P2.px(gx - 3, ey - 1, '#ffffff');
      }
      P2.rect(x - 1, ey, 3, 1, PAL.gold);
      // Sombrero puntiagudo, torcido, con estrellas y hebilla
      P2.ellipse(x, hy - 12, 23, 4, INK);
      P2.ellipse(x, hy - 12, 22, 3, '#45235e');
      P2.ellipse(x - 4, hy - 13, 10, 1, '#6a3a8a');
      const cone = [[x - 14, hy - 12], [x - 7, hy - 34], [x + 6, hy - 50], [x + 18, hy - 44], [x + 8, hy - 35], [x + 14, hy - 12]];
      P2.poly(cone.map(([px, py]) => [px + (px < x ? -1 : 1), py - 1]), INK);
      P2.poly(cone, robe);
      P2.poly([[x - 14, hy - 12], [x - 7, hy - 34], [x - 3, hy - 33], [x - 8, hy - 12]], '#8a52b0');
      P2.poly([[x + 6, hy - 12], [x + 8, hy - 35], [x + 14, hy - 12]], '#45235e');
      P2.rect(x - 13, hy - 18, 27, 4, PAL.gold);
      P2.rect(x - 13, hy - 17, 27, 1, PAL.goldDark);
      P2.rect(x - 3, hy - 19, 7, 6, INK);
      P2.rect(x - 2, hy - 18, 5, 4, '#fff1b8');
      P2.rect(x - 1, hy - 17, 3, 2, INK);
      P2.blob(x + 17, hy - 44, 2, 2, PAL.gold);
      const tw = Math.floor(t * 3) % 3;
      [[x - 4, hy - 26], [x + 4, hy - 31], [x + 1, hy - 40], [x + 8, hy - 24]].forEach(([sx, sy2], i) => {
        P2.px(sx, sy2, i === tw ? '#ffffff' : PAL.gold);
      });
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw, skin);
  // Búho en el hombro, con plumas y orejitas
  const ox = cx + 38, oy = 104;
  P.blob(ox, oy, 7, 9, '#8a6238');
  P.ellipse(ox, oy + 3, 5, 5, '#d4a96e');
  for (let i = 0; i < 5; i++) P.px(ox - 3 + (i % 3) * 3, oy + 1 + Math.floor(i / 3) * 3, '#a07a48');
  for (const dir of [-1, 1]) {
    P.blob(ox + dir * 3, oy - 3, 2, 2, '#f4f4f4');
    P.px(ox + dir * 3, oy - 3, anim.blink ? '#8a6238' : INK);
    P.poly([[ox + dir * 5, oy - 7], [ox + dir * 7, oy - 12], [ox + dir * 2, oy - 8]], '#6e4a28');
  }
  P.px(ox, oy - 1, PAL.gold);
  P.px(ox, oy, PAL.goldDark);
  P.rect(ox - 3, oy + 9, 2, 2, PAL.gold);
  P.rect(ox + 2, oy + 9, 2, 2, PAL.gold);
}

// ---------- Coach Bíceps ----------
export function drawBiceps(P, cx, anim) {
  const skin = '#d89a6a', skinDark = '#b0724a', skinLight = '#f0b888';
  const o = {
    hy: 84, skin, skinDark, clothes: '#f4f4f4', clothesDark: '#c2c9d6', sw: 26, eyes: '#5a3a1f', brows: '#2a1a12', blush: false,
    body: (P2, x, sy) => {
      // Musculosa con emblema
      P2.rect(x - 18, sy + 3, 37, 5, '#b13e53');
      P2.rect(x - 18, sy + 20, 37, 3, '#b13e53');
      P2.blob(x, sy + 32, 6, 5, '#b13e53');
      P2.rect(x - 4, sy + 32, 9, 1, '#f4f4f4');
      P2.rect(x - 5, sy + 30, 2, 5, '#f4f4f4');
      P2.rect(x + 4, sy + 30, 2, 5, '#f4f4f4');
      // Brazos enormes de una pieza: hombro, bíceps marcado y antebrazo con muñequera
      for (const dir of [-1, 1]) {
        const bx = x + dir * 28;
        const arm = [
          [bx - dir * 7, sy - 1], [bx + dir * 6, sy], [bx + dir * 12, sy + 9], [bx + dir * 12, sy + 22],
          [bx + dir * 8, sy + 30], [bx + dir * 6, COUNTER_Y - 4], [bx - dir * 5, COUNTER_Y - 4],
          [bx - dir * 7, sy + 28], [bx - dir * 9, sy + 14],
        ];
        P2.poly(arm.map(([px, py]) => [px + Math.sign(px - bx), py + (py < sy + 15 ? -1 : 1)]), INK);
        P2.poly(arm, skin);
        P2.poly([[bx + dir * 4, sy + 2], [bx + dir * 12, sy + 9], [bx + dir * 12, sy + 22], [bx + dir * 8, sy + 30], [bx + dir * 6, COUNTER_Y - 4], [bx + dir * 2, COUNTER_Y - 4], [bx + dir * 6, sy + 24]], skinDark);
        P2.ellipse(bx - dir * 1, sy + 5, 4, 3, skinLight);
        P2.ellipse(bx, sy + 18, 5, 5, skinLight);
        P2.ellipse(bx - dir * 1, sy + 17, 2, 2, '#f8c8a0');
        P2.line(bx - dir * 7, sy + 11, bx + dir * 7, sy + 12, skinDark);
        P2.line(bx - dir * 6, sy + 25, bx + dir * 6, sy + 27, skinDark);
        P2.rect(bx - 6, COUNTER_Y - 10, 13, 5, INK);
        P2.rect(bx - 5, COUNTER_Y - 9, 11, 3, '#e04a5f');
        P2.rect(bx - 5, COUNTER_Y - 9, 11, 1, '#f07080');
      }
      // Silbato con cordón
      P2.line(x - 8, sy, x, sy + 13, '#3b5dc9');
      P2.line(x + 8, sy, x, sy + 13, '#3b5dc9');
      P2.rect(x - 3, sy + 13, 7, 4, INK);
      P2.rect(x - 2, sy + 14, 5, 2, PAL.gold);
      P2.px(x - 2, sy + 14, '#fff1b8');
    },
    face: (P2, x, hy, a, { ey, my }) => {
      // Pelo corto en punta
      P2.ellipse(x, hy - 10, 13, 5, INK);
      P2.ellipse(x, hy - 10, 12, 4, '#2a1a12');
      for (let i = -11; i <= 11; i += 3) P2.poly([[x + i - 2, hy - 11], [x + i + 1, hy - 18 + (i % 2 ? 1 : 0)], [x + i + 3, hy - 11]], '#2a1a12');
      P2.rect(x - 6, hy - 14, 4, 1, '#4a3a2a');
      // Vincha roja con nudo
      P2.rect(x - 14, hy - 8, 29, 5, INK);
      P2.rect(x - 13, hy - 7, 27, 3, '#e04a5f');
      P2.rect(x - 13, hy - 7, 27, 1, '#f07080');
      P2.poly([[x + 14, hy - 7], [x + 22, hy - 3], [x + 20, hy + 1], [x + 14, hy - 4]], '#e04a5f');
      P2.poly([[x + 14, hy - 6], [x + 21, hy - 9], [x + 22, hy - 5]], '#b13e53');
      // Bigote espeso
      P2.rect(x - 7, my - 3, 15, 3, '#2a1a12');
      P2.px(x - 8, my - 1, '#2a1a12');
      P2.px(x + 8, my - 1, '#2a1a12');
      P2.px(x - 3, my - 3, '#4a3a2a');
      // Sonrisa con dientes
      if (!a.mouthOpen) {
        P2.rect(x - 4, my, 9, 3, INK);
        P2.rect(x - 3, my, 7, 1, '#ffffff');
      }
      // Brillo de sudor
      P2.px(x + 9, ey - 2, '#ffffff');
      P2.px(x + 10, ey - 1, '#a6e6ff');
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw + 4, skin, 0);
}
