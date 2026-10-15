// Fondos de combate por zona: capas de paisaje dibujadas una vez y clima animado encima.
// Los luchadores se paran en el centro de abajo; la decoración va al fondo y a los bordes.

import { seeded, hashString } from '../util.js';
import { INK, PAL, painter, makeCanvas, stones, tree, pine, bush, flowers } from './paint.js';

export const BF_W = 192;
export const BF_H = 108;
const GROUND = 66;

function sky(P, colors) {
  const band = Math.ceil(GROUND / colors.length);
  colors.forEach((c, i) => P.rect(0, i * band, BF_W, band, c));
  for (let i = 1; i < colors.length; i++) P.dither(0, i * band - 1, BF_W, 2, colors[i], i);
}

function ridge(P, rand, y, amp, color, step = 1) {
  let h = amp / 2;
  for (let x = 0; x < BF_W; x += step) {
    h = Math.max(2, Math.min(amp, h + (rand() - 0.5) * 3));
    P.rect(x, y - Math.round(h), step, Math.round(h) + 40, color);
  }
}

function groundBand(P, rand, base, dark, light) {
  P.rect(0, GROUND, BF_W, BF_H - GROUND, base);
  P.rect(0, GROUND, BF_W, 1, dark);
  for (let i = 0; i < 260; i++) {
    const y = GROUND + 1 + Math.floor(rand() * (BF_H - GROUND));
    P.px(Math.floor(rand() * BF_W), y, rand() < 0.55 ? dark : light);
  }
}

// ---------- Bosque Musgoso ----------
const bosque = {
  drawStatic(P, rand) {
    sky(P, ['#6cc4f4', '#84d0f6', '#9edcf8', '#b8e8fa']);
    ridge(P, rand, 50, 14, '#7ab08a');
    ridge(P, rand, 58, 10, '#4f8e55');
    for (let x = -6; x < BF_W + 6; x += 9) pine(P, x + Math.floor(rand() * 4), 64, 18 + Math.floor(rand() * 8), ['#1f4a32', '#2a6a40', '#3f8a4a']);
    groundBand(P, rand, '#5aa83a', '#3f8a3a', '#7cc456');
    // Senda de tierra donde se pelea
    P.poly([[30, BF_H], [70, GROUND + 4], [122, GROUND + 4], [162, BF_H]], PAL.dirt);
    P.poly([[34, BF_H], [72, GROUND + 6], [120, GROUND + 6], [158, BF_H]], PAL.dirtLight);
    for (let i = 0; i < 60; i++) P.px(50 + Math.floor(rand() * 92), GROUND + 6 + Math.floor(rand() * 40), PAL.dirtDark);
    // Rayos de sol entre los árboles
    for (const x0 of [40, 96, 150]) {
      for (let i = 0; i < 40; i++) if (i % 3 === 0) P.px(x0 + i, i + 4, 'rgba(255,246,200,0.55)');
    }
    tree(P, 8, 100, 18, rand);
    tree(P, 184, 102, 16, rand, ['#2a5a2a', '#3a7d3a', '#5aa83a', '#a7f070']);
    bush(P, 30, 98, 6, rand, '#ef7d57');
    bush(P, 166, 96, 5, rand, '#f080b0');
    flowers(P, 0, GROUND + 4, 50, 30, rand, 18);
    flowers(P, 142, GROUND + 4, 50, 30, rand, 18);
    // Hongos
    for (const [x, y] of [[44, 100], [150, 102]]) {
      P.rect(x, y - 3, 2, 3, '#f4e4c1');
      P.ellipse(x + 1, y - 4, 3, 1, '#b13e53');
      P.px(x, y - 5, '#ffffff');
    }
  },
  drawFrame(P, t) {
    cloudDrift(P, t, ['#ffffff', '#e8f6ff'], 8);
    // Hojas que caen
    for (let i = 0; i < 7; i++) {
      const ph = (t * 0.12 + i / 7) % 1;
      const x = (i * 29 + Math.sin(t * 1.5 + i) * 8 + ph * 20) % BF_W;
      const y = ph * BF_H;
      P.px(x, y, i % 2 ? '#a7f070' : '#d0955a');
      P.px(x + 1, y + (Math.floor(t * 4 + i) % 2), i % 2 ? '#5aa83a' : '#a0703c');
    }
    // Mariposas
    for (let i = 0; i < 2; i++) {
      const x = 20 + i * 140 + Math.sin(t * 0.8 + i) * 12;
      const y = 78 + Math.cos(t * 1.3 + i * 2) * 6;
      const w = Math.floor(t * 8) % 2;
      P.px(x, y, INK);
      P.px(x - 1, y - w, i ? '#f080b0' : '#ffcd75');
      P.px(x + 1, y - w, i ? '#f080b0' : '#ffcd75');
    }
  },
};

// ---------- Costa Burbujeante ----------
const costa = {
  drawStatic(P, rand) {
    sky(P, ['#41a6f6', '#62b8f8', '#86ccfa', '#aee0fc']);
    // Isla lejana con palmera
    P.ellipse(150, 44, 16, 3, '#5aa83a');
    P.rect(150, 34, 1, 9, '#8a5a32');
    P.poly([[144, 35], [151, 32], [157, 36], [151, 34]], '#38b764');
    // Mar
    P.rect(0, 44, BF_W, GROUND - 44, '#3b5dc9');
    P.dither(0, 44, BF_W, 6, '#41a6f6', 0);
    P.rect(0, 44, BF_W, 1, '#73c6ff');
    groundBand(P, rand, '#f0d890', '#d0b060', '#fff0c0');
    P.rect(0, GROUND, BF_W, 3, '#d0b060');
    // Palmera grande al borde
    for (let i = 0; i < 38; i++) {
      const x = 12 + Math.round(Math.sin(i / 14) * 5);
      P.rect(x - 2, 100 - i, 5, 1, i % 4 === 0 ? '#5d3a1f' : '#8a5a32');
      P.px(x - 2, 100 - i, INK);
      P.px(x + 2, 100 - i, INK);
    }
    for (const [dx, dy] of [[-16, 6], [14, 8], [-12, -4], [16, -2], [0, -8]]) {
      P.poly([[16, 62], [16 + dx, 62 + dy], [16 + dx * 0.6, 62 + dy + 3]], INK);
      P.poly([[16, 62], [16 + dx - Math.sign(dx), 62 + dy], [16 + dx * 0.6, 62 + dy + 2]], '#38b764');
    }
    P.blob(18, 64, 2, 2, '#7a4b2a');
    P.blob(13, 65, 2, 2, '#7a4b2a');
    // Rocas, estrella de mar y caracoles
    for (const [x, y, r] of [[170, 96, 8], [182, 90, 5], [40, 104, 4]]) {
      P.blob(x, y, r, Math.round(r * 0.7), '#8b8fa3');
      P.ellipse(x - 2, y - 2, Math.round(r / 2), 1, '#b4b8c8');
    }
    P.poly([[150, 100], [152, 96], [154, 100], [158, 101], [154, 102], [152, 106], [150, 102], [146, 101]], '#ef7d57');
    P.px(152, 101, '#ffcd75');
    for (const [x, y] of [[60, 98], [130, 104], [96, 92]]) {
      P.ellipse(x, y, 2, 1, '#f4e4f0');
      P.px(x + 1, y, '#d0a0c0');
    }
  },
  drawFrame(P, t) {
    cloudDrift(P, t, ['#ffffff', '#e8f6ff'], 6);
    // Olas y brillos
    for (let row = 0; row < 4; row++) {
      const y = 48 + row * 4;
      for (let x = 0; x < BF_W; x += 14) {
        const xx = (x + Math.floor(t * (4 + row)) + row * 5) % (BF_W + 14) - 7;
        P.rect(xx, y, 5, 1, row % 2 ? '#73c6ff' : '#a6e6ff');
      }
    }
    if (Math.floor(t * 3) % 2) P.px(90 + Math.floor(t * 7) % 40, 50, '#ffffff');
    // Espuma que va y viene sobre la arena
    const foam = Math.round((Math.sin(t * 1.2) + 1) * 2);
    for (let x = 0; x < BF_W; x += 2) P.px(x, GROUND + foam + ((x / 2) % 2), '#ffffff');
    P.rect(0, GROUND, BF_W, foam, '#73c6ff');
    // Gaviota
    const gx = (t * 14) % (BF_W + 40) - 20;
    const gy = 18 + Math.sin(t) * 4;
    const w = Math.floor(t * 5) % 2;
    P.px(gx, gy, '#f4f4f4');
    P.px(gx - 1, gy - w, '#f4f4f4');
    P.px(gx + 1, gy - w, '#f4f4f4');
    P.px(gx - 2, gy - 1 + w, '#566c86');
    P.px(gx + 2, gy - 1 + w, '#566c86');
  },
};

// ---------- Volcán Gruñón ----------
const volcan = {
  drawStatic(P, rand) {
    sky(P, ['#2a1030', '#4a1838', '#7a2238', '#b13e53']);
    for (let i = 0; i < 12; i++) P.px(Math.floor(rand() * BF_W), Math.floor(rand() * 20), '#ef7d57');
    // Volcán con cráter brillante
    P.poly([[50, GROUND], [86, 20], [106, 20], [142, GROUND]], '#2a1a24');
    P.poly([[50, GROUND], [86, 20], [92, 20], [70, GROUND]], '#3a2430');
    P.rect(86, 19, 20, 2, '#ef7d57');
    P.rect(90, 18, 12, 1, '#ffcd75');
    for (const [x0, y0, x1] of [[94, 21, 84], [98, 21, 110]]) {
      for (let y = y0; y < 46; y++) P.px(x0 + Math.round(((x1 - x0) * (y - y0)) / 25) + (y % 3 === 0 ? 1 : 0), y, '#ef7d57');
    }
    ridge(P, rand, 60, 10, '#1f1418');
    groundBand(P, rand, '#3e2a2a', '#241818', '#5a3a34');
    // Río de lava (el brillo se anima)
    P.poly([[0, 78], [60, 74], [120, 80], [BF_W, 76], [BF_W, 84], [120, 88], [60, 82], [0, 86]], '#b13e53');
    // Rocas de basalto
    for (const [x, y, w, h] of [[2, 92, 18, 14], [170, 88, 20, 18], [150, 100, 10, 8], [34, 100, 9, 7]]) {
      P.rect(x - 1, y - 1, w + 2, h + 1, INK);
      stones(P, x, y, w, h, { base: '#3a3240', dark: '#241e2a', light: '#56485e', mortar: '#18141c' }, rand, 4);
    }
  },
  drawFrame(P, t) {
    // Lava que fluye
    for (let x = 0; x < BF_W; x += 1) {
      const y = 80 + Math.round(Math.sin(x / 20) * 2);
      const glow = Math.sin(x / 6 - t * 3) > 0.3;
      P.px(x, y, glow ? '#ffcd75' : '#ef7d57');
      if (glow && x % 3 === 0) P.px(x, y + 2, '#ef7d57');
    }
    // Humo y chispas del cráter
    for (let i = 0; i < 4; i++) {
      const ph = (t * 0.25 + i / 4) % 1;
      P.ellipse(96 + Math.round(Math.sin(t + i) * 4 + ph * 10), 16 - ph * 18, 2 + Math.round(ph * 4), 1 + Math.round(ph * 2), 'rgba(58,40,56,0.85)');
    }
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.6 + i / 6) % 1;
      P.px(96 + Math.round(Math.sin(i * 2.1) * ph * 20), 20 - Math.round(Math.sin(ph * Math.PI) * 14), ph < 0.5 ? '#ffcd75' : '#ef7d57');
    }
    // Brasas que suben del suelo
    for (let i = 0; i < 8; i++) {
      const ph = (t * 0.35 + i / 8) % 1;
      P.px((i * 27 + Math.sin(t * 2 + i) * 5) % BF_W, BF_H - ph * 50, ph < 0.6 ? '#ffcd75' : '#b13e53');
    }
  },
};

// ---------- Picos Helados ----------
const picos = {
  drawStatic(P, rand) {
    sky(P, ['#94b0c2', '#acc4d4', '#c4d8e4', '#dceaf2']);
    const peaks = [[0, 46], [20, 22], [40, 38], [62, 12], [90, 34], [118, 16], [146, 36], [170, 20], [BF_W, 40], [BF_W, GROUND], [0, GROUND]];
    P.poly(peaks, '#7d96b0');
    for (let i = 1; i < 8; i++) {
      const [x, y] = peaks[i];
      if (y < 30) P.poly([[x - 9, y + 9], [x, y], [x + 9, y + 9], [x + 4, y + 7], [x, y + 10], [x - 4, y + 7]], '#f4f4f4');
    }
    ridge(P, rand, 58, 12, '#c2d3dd');
    for (let x = 4; x < BF_W; x += 13) {
      pine(P, x + Math.floor(rand() * 5), 64, 16 + Math.floor(rand() * 6), ['#1f3a40', '#2a5050', '#3a6a62']);
      P.rect(x - 2, 52, 5, 1, '#f4f4f4');
    }
    groundBand(P, rand, '#f4f4f4', '#c2d3dd', '#ffffff');
    P.dither(0, GROUND + 1, BF_W, 6, '#dceaf2', 0);
    // Cristales de hielo
    for (const [x, h] of [[10, 18], [22, 12], [176, 16], [186, 10]]) {
      for (let i = 0; i < h; i++) {
        const w = Math.max(1, Math.min(i, h - i, 4));
        P.rect(x - Math.floor(w / 2), 104 - i, w, 1, i % 3 ? '#73eff7' : '#ffffff');
      }
      P.px(x - 1, 104 - h + 2, INK);
    }
    // Huellas en la nieve
    for (let i = 0; i < 6; i++) P.rect(60 + i * 14, 98 - (i % 2) * 3, 2, 1, '#c2d3dd');
  },
  drawFrame(P, t) {
    // Nieve que cae
    for (let i = 0; i < 40; i++) {
      const speed = 8 + (i % 4) * 3;
      const y = (i * 37 + t * speed) % BF_H;
      const x = (i * 53 + Math.sin(t + i) * 6) % BF_W;
      P.px(x, y, i % 5 ? '#ffffff' : '#dceaf2');
    }
    // Niebla baja
    for (let i = 0; i < 3; i++) {
      const x = ((t * (4 + i)) + i * 70) % (BF_W + 60) - 30;
      P.ellipse(x, 62 + i * 3, 22, 2, 'rgba(244,244,244,0.45)');
    }
  },
};

// ---------- Cripta Olvidada ----------
const cripta = {
  drawStatic(P, rand) {
    sky(P, ['#141626', '#1a1c2c', '#222640', '#2a2e4a']);
    P.blob(150, 18, 10, 10, '#fff6c8');
    P.ellipse(146, 15, 3, 2, '#e0d8a8');
    P.ellipse(153, 21, 2, 1, '#e0d8a8');
    // Mausoleo al fondo
    P.rect(70, 30, 52, 30, INK);
    stones(P, 71, 31, 50, 29, { base: '#3a3248', dark: '#2a2436', light: '#4a4058', mortar: '#1a1622' }, rand, 5);
    P.poly([[66, 31], [96, 16], [126, 31]], INK);
    P.poly([[69, 30], [96, 18], [123, 30]], '#2a2436');
    for (const x of [76, 88, 104, 116]) {
      P.rect(x, 34, 3, 26, '#4a4058');
      P.rect(x, 34, 1, 26, '#5e5470');
    }
    P.rect(92, 44, 8, 16, INK);
    P.rect(93, 45, 6, 15, '#1a1622');
    ridge(P, rand, 62, 6, '#1e1a28');
    groundBand(P, rand, '#3a3248', '#262033', '#4a4058');
    // Árboles secos
    for (const [x, dir] of [[14, 1], [180, -1]]) {
      P.rect(x - 2, 40, 4, 66, '#1a1622');
      P.line(x, 50, x + dir * 12, 38, '#1a1622');
      P.line(x, 46, x - dir * 8, 34, '#1a1622');
      P.line(x + dir * 12, 38, x + dir * 16, 40, '#1a1622');
      P.line(x - dir * 8, 34, x - dir * 10, 28, '#1a1622');
    }
    // Lápidas y reja
    for (const [x, y, k] of [[34, 96, 0], [50, 86, 1], [140, 88, 0], [160, 98, 1], [120, 80, 1]]) {
      P.rect(x - 1, y - 11, 10, 12, INK);
      P.rect(x, y - 10, 8, 10, '#5d6175');
      P.ellipse(x + 4, y - 10, 4, 2, '#5d6175');
      if (k) { P.rect(x + 3, y - 8, 2, 6, INK); P.rect(x + 1, y - 6, 6, 2, INK); }
      else { P.rect(x + 2, y - 7, 4, 1, INK); P.rect(x + 2, y - 5, 4, 1, INK); }
      P.px(x + 1, y - 9, '#8b8fa3');
    }
    for (let x = 0; x < BF_W; x += 6) {
      if (x > 64 && x < 128) continue;
      P.rect(x, 54, 1, 12, '#262033');
      P.px(x, 53, '#4a4058');
    }
    P.rect(0, 57, 64, 1, '#262033');
    P.rect(128, 57, 64, 1, '#262033');
  },
  drawFrame(P, t) {
    for (let i = 0; i < 14; i++) if ((Math.floor(t * 2) + i) % 4) P.px((i * 41) % BF_W, (i * 13) % 26, '#c2c9d6');
    // Luz de la ventana del mausoleo
    if (Math.sin(t * 3) > -0.4) { P.rect(94, 47, 4, 6, '#b07ad0'); P.px(95, 48, '#e0c0f0'); }
    // Niebla que se arrastra
    for (let i = 0; i < 4; i++) {
      const x = ((t * (5 + i * 2)) + i * 60) % (BF_W + 80) - 40;
      P.ellipse(x, 70 + i * 9, 28, 2, 'rgba(160,144,200,0.35)');
    }
    // Fuegos fatuos
    for (let i = 0; i < 3; i++) {
      const x = 30 + i * 60 + Math.sin(t * 1.4 + i * 2) * 10;
      const y = 74 + Math.cos(t * 1.8 + i) * 6;
      P.px(x, y, '#d0a0ff');
      P.px(x, y - 1, '#ffffff');
      P.px(x - 1, y, 'rgba(176,122,208,0.6)');
      P.px(x + 1, y, 'rgba(176,122,208,0.6)');
    }
  },
};

function cloudDrift(P, t, colors, speed) {
  [[20, 8], [110, 4], [170, 14]].forEach(([x0, y], i) => {
    const x = ((x0 + t * speed * (0.6 + i * 0.2)) % (BF_W + 40)) - 20;
    P.ellipse(x, y + 2, 9, 2, colors[1]);
    P.ellipse(x + 4, y, 6, 2, colors[0]);
    P.ellipse(x - 4, y + 1, 5, 2, colors[0]);
  });
}

export const BATTLEFIELDS = { bosque, costa, volcan, picos, cripta };

export function battlefieldFor(zone) {
  const field = BATTLEFIELDS[zone.id] ?? bosque;
  return {
    w: BF_W,
    h: BF_H,
    drawStatic: (P) => field.drawStatic(P, seeded(hashString(zone.id))),
    drawFrame: (P, t) => field.drawFrame(P, t),
  };
}

// Versión quieta para miniaturas (mapa y cartel de la zona).
export function backgroundCanvas(zone, className = 'px bg') {
  const c = makeCanvas(BF_W, BF_H, className);
  const P = painter(c.getContext('2d'));
  const f = battlefieldFor(zone);
  f.drawStatic(P);
  f.drawFrame(P, 2.5);
  return c;
}


