// Retratos de los dueños de cada local, de la cintura para arriba, apoyados en el mostrador.
// Se redibujan en cada cuadro para poder parpadear y mover la boca mientras hablan.

import { INK, PAL, shade } from './paint.js';

const COUNTER_Y = 112;

function bust(P, cx, o, anim) {
  const { headY, rx, ry, skin, clothes, sw = 19 } = o;
  const skinDark = o.skinDark ?? shade(skin, 0.82);
  const clothesDark = shade(clothes, 0.7);
  const clothesLight = shade(clothes, 1.25);
  const sy = headY + ry + 3;

  // Torso
  const torso = [[cx - sw, COUNTER_Y], [cx - sw, sy + 6], [cx - sw + 6, sy], [cx + sw - 6, sy], [cx + sw, sy + 6], [cx + sw, COUNTER_Y]];
  P.poly(torso.map(([x, y]) => [x + (x < cx ? -1 : 1), y - 1]), INK);
  P.poly(torso, clothes);
  P.poly([[cx - sw, COUNTER_Y], [cx - sw, sy + 6], [cx - sw + 6, sy], [cx - sw + 9, sy], [cx - sw + 4, COUNTER_Y]], clothesLight);
  P.poly([[cx + sw - 5, COUNTER_Y], [cx + sw - 9, sy], [cx + sw - 6, sy], [cx + sw, sy + 6], [cx + sw, COUNTER_Y]], clothesDark);
  // Brazos
  for (const dir of [-1, 1]) {
    const ax = cx + dir * (sw - 5);
    P.line(ax, sy + 8, ax + dir * -2, COUNTER_Y - 1, clothesDark);
  }
  o.body?.(P, cx, sy, { skin, skinDark, clothes, clothesDark, clothesLight, sw });

  // Cuello y cabeza
  P.rect(cx - 4, headY + ry - 2, 9, 6, INK);
  P.rect(cx - 3, headY + ry - 2, 7, 5, skinDark);
  o.behindHead?.(P, cx, headY);
  P.blob(cx - rx - 1, headY + 2, 2, 3, skin);
  P.blob(cx + rx + 1, headY + 2, 2, 3, skinDark);
  P.blob(cx, headY, rx, ry, skin);
  P.dither(cx + Math.round(rx / 2), headY - ry + 3, Math.round(rx / 2), ry * 2 - 5, skinDark, 0);
  P.rect(cx + rx - 1, headY - 3, 1, 8, skinDark);

  // Cara
  const ey = headY + (o.eyeDy ?? 0);
  const blink = anim.blink;
  for (const ex of [cx - 5, cx + 3]) {
    if (blink) {
      P.rect(ex, ey + 1, 3, 1, INK);
    } else {
      P.rect(ex, ey, 3, 3, '#ffffff');
      P.rect(ex + 1, ey, 2, 3, o.eyes ?? '#3b5dc9');
      P.rect(ex + 1, ey + 1, 1, 2, INK);
      P.px(ex + 2, ey, '#ffffff');
    }
  }
  P.rect(cx - 6, ey - 3, 5, 1, o.brows ?? INK);
  P.rect(cx + 2, ey - 3, 5, 1, o.brows ?? INK);
  P.px(cx, ey + 4, skinDark);
  P.px(cx + 1, ey + 5, skinDark);
  P.px(cx - 1, ey + 5, skinDark);
  if (o.blush !== false) {
    P.rect(cx - 8, ey + 5, 2, 1, '#f09090');
    P.rect(cx + 6, ey + 5, 2, 1, '#f09090');
  }
  const my = ey + 8;
  if (anim.mouthOpen) {
    P.rect(cx - 2, my - 1, 5, 3, INK);
    P.rect(cx - 1, my, 3, 1, '#b13e53');
  } else {
    P.rect(cx - 2, my, 5, 1, o.lips ?? '#7a2238');
    P.px(cx - 3, my - 1, o.lips ?? '#7a2238');
    P.px(cx + 3, my - 1, o.lips ?? '#7a2238');
  }
  o.face?.(P, cx, headY, anim, { skin, skinDark, ey, my });
}

function hands(P, cx, sw, skin) {
  for (const dir of [-1, 1]) {
    const hx = cx + dir * (sw - 7);
    P.blob(hx, COUNTER_Y + 2, 4, 2, skin);
    P.rect(hx - 3, COUNTER_Y + 3, 7, 1, shade(skin, 0.8));
    P.px(hx - 1, COUNTER_Y + 1, shade(skin, 0.85));
    P.px(hx + 1, COUNTER_Y + 1, shade(skin, 0.85));
  }
}

// ---------- Doña Berta, la posadera ----------
export function drawBerta(P, cx, anim) {
  const hair = '#c2c3cf', hairDark = '#8b8fa3', skin = '#f4c99b';
  const o = {
    headY: 64, rx: 10, ry: 11, skin, clothes: '#b13e53', sw: 21, eyes: '#5a3a1f', brows: hairDark,
    body: (P2, x, sy) => {
      // Delantal con bolsillo y cuello blanco
      P2.rect(x - 11, sy + 8, 23, COUNTER_Y - sy - 8, INK);
      P2.rect(x - 10, sy + 9, 21, COUNTER_Y - sy - 9, '#f4f4f4');
      P2.rect(x - 10, sy + 9, 21, 1, '#ffffff');
      P2.rect(x - 4, sy + 22, 9, 6, '#dcdce4');
      P2.frame(x - 4, sy + 22, 9, 6, '#b4b8c8');
      P2.line(x - 10, sy + 9, x - 14, sy + 2, '#f4f4f4');
      P2.line(x + 10, sy + 9, x + 14, sy + 2, '#f4f4f4');
      P2.rect(x - 6, sy - 1, 13, 4, INK);
      P2.rect(x - 5, sy, 11, 2, '#f4f4f4');
    },
    behindHead: (P2, x, hy) => {
      P2.blob(x, hy - 15, 6, 5, hair);
      P2.ellipse(x - 2, hy - 17, 2, 1, '#e4e4ec');
      P2.rect(x - 6, hy - 12, 13, 1, hairDark);
    },
    face: (P2, x, hy) => {
      // Pelo recogido con mechones
      P2.ellipse(x, hy - 7, 11, 5, INK);
      P2.ellipse(x, hy - 7, 10, 4, hair);
      P2.rect(x - 11, hy - 6, 3, 8, hair);
      P2.rect(x + 9, hy - 6, 3, 8, hair);
      P2.px(x - 11, hy - 6, INK);
      P2.rect(x - 4, hy - 9, 6, 1, '#e4e4ec');
      P2.line(x - 6, hy - 4, x - 2, hy - 7, hairDark);
      P2.line(x + 6, hy - 4, x + 2, hy - 7, hairDark);
      // Aros dorados
      P2.px(x - 12, hy + 5, PAL.gold);
      P2.px(x + 12, hy + 5, PAL.gold);
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw, skin);
}

// ---------- Gruñido, el herrero enano ----------
export function drawGrunido(P, cx, anim) {
  const skin = '#e8a878', beard = '#d0743a', beardDark = '#9a4a24', beardLight = '#ef9a57';
  const o = {
    headY: 70, rx: 11, ry: 10, skin, clothes: '#566c86', sw: 24, eyes: '#1a1c2c', brows: beardDark, blush: false,
    body: (P2, x, sy) => {
      // Delantal de cuero con tiras
      P2.rect(x - 13, sy + 4, 27, COUNTER_Y - sy - 4, INK);
      P2.rect(x - 12, sy + 5, 25, COUNTER_Y - sy - 5, '#7a4b2a');
      P2.dither(x - 12, sy + 5, 25, COUNTER_Y - sy - 5, '#6a3e22', 0);
      P2.rect(x - 12, sy + 5, 25, 1, '#9a6a3e');
      P2.line(x - 12, sy + 5, x - 17, sy - 1, '#5d3a1f');
      P2.line(x + 12, sy + 5, x + 17, sy - 1, '#5d3a1f');
      P2.rect(x - 2, sy + 20, 5, 4, '#9a6a3e');
    },
    face: (P2, x, hy, a, { ey }) => {
      // Barba gigante que cubre el pecho
      const bp = [[x - 12, hy + 1], [x - 9, hy + 6], [x - 5, hy + 7], [x + 5, hy + 7], [x + 9, hy + 6], [x + 12, hy + 1], [x + 12, hy + 14], [x + 7, hy + 26], [x, hy + 34], [x - 7, hy + 26], [x - 12, hy + 14]];
      P2.poly(bp.map(([px, py]) => [px + (px < x ? -1 : px > x ? 1 : 0), py + 1]), INK);
      P2.poly(bp, beard);
      P2.poly([[x + 4, hy + 8], [x + 12, hy + 4], [x + 11, hy + 15], [x + 6, hy + 25], [x + 2, hy + 30]], beardDark);
      for (let i = 0; i < 6; i++) P2.line(x - 8 + i * 3, hy + 10, x - 6 + i * 2, hy + 24, beardDark);
      P2.line(x - 6, hy + 12, x - 4, hy + 20, beardLight);
      // Trenzas con anillos
      for (const bx of [x - 4, x + 4]) {
        P2.rect(bx - 1, hy + 28, 3, 6, beard);
        P2.rect(bx - 1, hy + 31, 3, 1, PAL.gold);
      }
      // Bigote
      P2.poly([[x - 8, ey + 7], [x - 1, ey + 5], [x + 2, ey + 5], [x + 9, ey + 7], [x + 6, ey + 9], [x, ey + 7], [x - 5, ey + 9]], beardLight);
      if (a.mouthOpen) P2.rect(x - 1, ey + 9, 3, 2, INK);
      // Nariz grande
      P2.blob(x, ey + 4, 2, 2, '#d08860');
      P2.px(x - 1, ey + 3, '#f0c098');
      // Cejas tupidas
      P2.rect(x - 7, ey - 4, 6, 2, beardDark);
      P2.rect(x + 2, ey - 4, 6, 2, beardDark);
      // Casco con cuernos
      P2.poly([[x - 13, hy - 7], [x - 18, hy - 12], [x - 19, hy - 19], [x - 16, hy - 15], [x - 11, hy - 11]], INK);
      P2.poly([[x - 13, hy - 8], [x - 17, hy - 12], [x - 18, hy - 17], [x - 15, hy - 14], [x - 11, hy - 11]], '#f0e4c8');
      P2.poly([[x + 13, hy - 7], [x + 18, hy - 12], [x + 19, hy - 19], [x + 16, hy - 15], [x + 11, hy - 11]], INK);
      P2.poly([[x + 13, hy - 8], [x + 17, hy - 12], [x + 18, hy - 17], [x + 15, hy - 14], [x + 11, hy - 11]], '#d8c8a8');
      P2.ellipse(x, hy - 7, 13, 8, INK);
      P2.ellipse(x, hy - 7, 12, 7, '#8b8fa3');
      P2.rect(x - 12, hy - 7, 25, 8, '#8b8fa3');
      P2.ellipse(x - 4, hy - 10, 4, 2, '#c2c9d6');
      P2.rect(x - 13, hy - 1, 27, 3, INK);
      P2.rect(x - 12, hy - 1, 25, 2, '#5d6175');
      for (let i = -10; i <= 10; i += 5) P2.px(x + i, hy, PAL.gold);
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw, skin);
  // Martillo apoyado en el mostrador
  P.rect(cx + 24, COUNTER_Y - 14, 3, 16, INK);
  P.rect(cx + 25, COUNTER_Y - 13, 1, 14, PAL.wood);
  P.rect(cx + 20, COUNTER_Y - 19, 11, 6, INK);
  P.rect(cx + 21, COUNTER_Y - 18, 9, 4, '#8b8fa3');
  P.rect(cx + 21, COUNTER_Y - 18, 9, 1, '#c2c9d6');
}

// ---------- Madame Chispas, la hechicera ----------
export function drawChispas(P, cx, anim) {
  const skin = '#f0d0b8', hair = '#2a2440', robe = '#6a3a8a';
  const o = {
    headY: 70, rx: 9, ry: 10, skin, clothes: robe, sw: 19, eyes: '#38b764', brows: hair, lips: '#8a2a6a',
    behindHead: (P2, x, hy) => {
      // Pelo largo que cae sobre los hombros
      P2.ellipse(x, hy - 2, 12, 11, INK);
      P2.ellipse(x, hy - 2, 11, 10, hair);
      for (const lx of [x - 13, x + 8]) {
        P2.rect(lx, hy, 6, 24, INK);
        P2.rect(lx + 1, hy, 4, 23, hair);
        P2.rect(lx + (lx < x ? 1 : 3), hy + 2, 1, 18, '#3a3260');
      }
    },
    body: (P2, x, sy) => {
      // Ribete dorado y broche de luna
      P2.line(x - 8, sy, x, sy + 14, PAL.gold);
      P2.line(x + 8, sy, x, sy + 14, PAL.gold);
      P2.blob(x, sy + 16, 2, 2, '#f4f4f4');
      P2.px(x + 1, sy + 15, '#c8b8e8');
      for (let i = 0; i < 4; i++) P2.px(x - 14 + i * 9, sy + 26 + (i % 2) * 4, PAL.gold);
    },
    face: (P2, x, hy, a, { ey }) => {
      // Flequillo
      P2.ellipse(x, hy - 6, 10, 5, hair);
      P2.poly([[x - 10, hy - 4], [x - 4, hy - 4], [x - 7, hy]], hair);
      // Anteojos redondos
      for (const gx of [x - 4, x + 4]) {
        P2.frame(gx - 3, ey - 1, 6, 5, PAL.gold);
      }
      P2.rect(x, ey, 1, 1, PAL.gold);
      // Sombrero puntiagudo y torcido
      P2.ellipse(x, hy - 9, 17, 3, INK);
      P2.ellipse(x, hy - 9, 16, 2, '#45235e');
      P2.poly([[x - 11, hy - 9], [x - 5, hy - 26], [x + 6, hy - 38], [x + 14, hy - 33], [x + 6, hy - 27], [x + 11, hy - 9]], INK);
      P2.poly([[x - 10, hy - 10], [x - 4, hy - 26], [x + 6, hy - 36], [x + 12, hy - 33], [x + 5, hy - 26], [x + 10, hy - 10]], robe);
      P2.poly([[x - 10, hy - 10], [x - 4, hy - 26], [x - 1, hy - 25], [x - 5, hy - 10]], '#8a52b0');
      P2.rect(x - 10, hy - 14, 21, 3, PAL.gold);
      P2.rect(x - 10, hy - 13, 21, 1, PAL.goldDark);
      P2.blob(x + 13, hy - 33, 1, 1, PAL.gold);
      [[x - 2, hy - 20], [x + 4, hy - 24], [x + 1, hy - 30]].forEach(([sx, sy2]) => P2.px(sx, sy2, PAL.gold));
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw, skin);
  // Búho en el hombro
  const ox = cx - 26, oy = 80;
  P.blob(ox, oy, 5, 6, '#8a6238');
  P.ellipse(ox, oy + 2, 3, 3, '#d4a96e');
  P.blob(ox - 2, oy - 2, 1, 1, '#f4f4f4');
  P.blob(ox + 2, oy - 2, 1, 1, '#f4f4f4');
  P.px(ox - 2, oy - 2, anim.blink ? '#8a6238' : INK);
  P.px(ox + 2, oy - 2, anim.blink ? '#8a6238' : INK);
  P.px(ox, oy, PAL.gold);
  P.px(ox - 4, oy - 6, INK);
  P.px(ox + 4, oy - 6, INK);
}

// ---------- Coach Bíceps ----------
export function drawBiceps(P, cx, anim) {
  const skin = '#d89a6a', skinDark = '#b0724a';
  const o = {
    headY: 64, rx: 10, ry: 11, skin, skinDark, clothes: '#f4f4f4', sw: 20, eyes: '#5a3a1f', brows: '#2a1a12', blush: false,
    body: (P2, x, sy, c) => {
      // Musculosa con franja roja y hombros descubiertos
      P2.rect(x - 14, sy + 2, 29, 4, '#b13e53');
      P2.rect(x - 14, sy + 14, 29, 2, '#b13e53');
      for (const dir of [-1, 1]) {
        const bx = x + dir * 22;
        P2.blob(bx, sy + 9, 8, 9, skin);
        P2.ellipse(bx + dir * 2, sy + 11, 4, 5, skinDark);
        P2.ellipse(bx - dir * 2, sy + 5, 3, 3, '#f0b888');
        P2.blob(bx + dir * 1, sy + 24, 6, 9, skin);
        P2.ellipse(bx + dir * 3, sy + 26, 2, 5, skinDark);
      }
      // Silbato
      P2.line(x - 6, sy, x, sy + 10, '#3b5dc9');
      P2.line(x + 6, sy, x, sy + 10, '#3b5dc9');
      P2.rect(x - 2, sy + 10, 5, 3, INK);
      P2.rect(x - 1, sy + 11, 3, 1, PAL.gold);
      void c;
    },
    face: (P2, x, hy, a, { ey, my }) => {
      // Pelo corto en punta
      P2.ellipse(x, hy - 8, 10, 4, INK);
      P2.ellipse(x, hy - 8, 9, 3, '#2a1a12');
      for (let i = -8; i <= 8; i += 3) P2.poly([[x + i - 1, hy - 9], [x + i + 1, hy - 14], [x + i + 2, hy - 9]], '#2a1a12');
      // Vincha roja con nudo
      P2.rect(x - 11, hy - 6, 23, 4, INK);
      P2.rect(x - 10, hy - 5, 21, 2, '#e04a5f');
      P2.poly([[x + 11, hy - 5], [x + 17, hy - 2], [x + 15, hy + 1], [x + 11, hy - 3]], '#e04a5f');
      // Bigote
      P2.rect(x - 5, my - 2, 11, 2, '#2a1a12');
      P2.px(x - 6, my - 1, '#2a1a12');
      P2.px(x + 6, my - 1, '#2a1a12');
      // Sonrisa con dientes
      if (!a.mouthOpen) {
        P2.rect(x - 3, my, 7, 2, INK);
        P2.rect(x - 2, my, 5, 1, '#ffffff');
      }
      P2.px(x + 5, ey - 1, '#ffffff');
    },
  };
  bust(P, cx, o, anim);
  hands(P, cx, o.sw + 4, skin);
}
