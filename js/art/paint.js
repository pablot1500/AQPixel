// Herramientas para dibujar pixel art por código: primitivas, texturas y piezas de arquitectura.
// Todas trabajan en coordenadas de píxel del lienzo nativo (sin escalar).

export const INK = '#1a1c2c';

export const PAL = {
  ink: INK,
  white: '#f4f4f4',
  gold: '#ffcd75',
  goldDark: '#d69a2d',
  lit: '#ffd77a',
  litHi: '#fff1b8',
  glass: '#2a3a5c',
  glassHi: '#5a7ab0',
  wood: '#8a5a32',
  woodDark: '#5d3a1f',
  woodLight: '#b47a46',
  beam: '#4a2e1a',
  iron: '#4a4e60',
  ironLight: '#7d8396',
  grass: '#4f9e45',
  grassDark: '#3a7d3a',
  grassLight: '#6cbf4a',
  dirt: '#b88a54',
  dirtDark: '#8a6238',
  dirtLight: '#d4a96e',
};

export function painter(ctx) {
  const P = {
    ctx,
    rect(x, y, w, h, c) {
      if (w <= 0 || h <= 0) return;
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    },
    px(x, y, c) {
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    },
    frame(x, y, w, h, c) {
      P.rect(x, y, w, 1, c);
      P.rect(x, y + h - 1, w, 1, c);
      P.rect(x, y, 1, h, c);
      P.rect(x + w - 1, y, 1, h, c);
    },
    ellipse(cx, cy, rx, ry, c) {
      for (let dy = -ry; dy <= ry; dy++) {
        const dx = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry || 1))));
        P.rect(cx - dx, cy + dy, dx * 2 + 1, 1, c);
      }
    },
    // Elipse con contorno de 1 px.
    blob(cx, cy, rx, ry, c, outline = INK) {
      P.ellipse(cx, cy, rx + 1, ry + 1, outline);
      P.ellipse(cx, cy, rx, ry, c);
    },
    line(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
      const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        P.px(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
    },
    // Polígono relleno por barrido de líneas.
    poly(points, c) {
      const ys = points.map((p) => p[1]);
      const minY = Math.floor(Math.min(...ys)), maxY = Math.ceil(Math.max(...ys));
      for (let y = minY; y < maxY; y++) {
        const yc = y + 0.5;
        const xs = [];
        for (let i = 0; i < points.length; i++) {
          const [ax, ay] = points[i];
          const [bx, by] = points[(i + 1) % points.length];
          if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
        }
        xs.sort((a, b) => a - b);
        for (let i = 0; i + 1 < xs.length; i += 2) P.rect(Math.round(xs[i]), y, Math.round(xs[i + 1]) - Math.round(xs[i]), 1, c);
      }
    },
    dither(x, y, w, h, c, phase = 0) {
      for (let yy = 0; yy < h; yy++) {
        for (let xx = (yy + phase) % 2; xx < w; xx += 2) P.px(x + xx, y + yy, c);
      }
    },
    speckle(x, y, w, h, c, count, rand) {
      for (let i = 0; i < count; i++) P.px(x + Math.floor(rand() * w), y + Math.floor(rand() * h), c);
    },
    sprite(rows, pal, x, y, flip = false) {
      rows.forEach((row, yy) => {
        for (let xx = 0; xx < row.length; xx++) {
          const ch = row[xx];
          if (ch === '.' || !pal[ch]) continue;
          P.px(flip ? x + row.length - 1 - xx : x + xx, y + yy, pal[ch]);
        }
      });
    },
    text(str, x, y, c) {
      let cx = x;
      for (const ch of str.toUpperCase()) {
        const g = FONT[ch];
        if (g) g.forEach((row, yy) => { for (let xx = 0; xx < 3; xx++) if (row[xx] === '#') P.px(cx + xx, y + yy, c); });
        cx += 4;
      }
    },
  };
  return P;
}

export const textWidth = (str) => str.length * 4 - 1;

// Fuente de 3×5 para carteles.
const FONT = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'], C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'], E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'], I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'], K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'], O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'], Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'], U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'], W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
  '&': ['.#.', '#.#', '.#.', '#.#', '.##'], '.': ['...', '...', '...', '...', '.#.'], '-': ['...', '...', '###', '...', '...'],
  ' ': ['...', '...', '...', '...', '...'],
};

export function makeCanvas(w, h, className = 'px') {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.className = className;
  return c;
}

export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * amount)));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
}

// ---------- Texturas ----------

export function stones(P, x, y, w, h, col, rand, rowH = 5) {
  P.rect(x, y, w, h, col.mortar);
  let row = 0;
  for (let yy = y; yy < y + h; yy += rowH, row++) {
    let xx = x - (row % 2 ? 4 : 0) - Math.floor(rand() * 3);
    const sh = Math.min(rowH - 1, y + h - yy);
    while (xx < x + w) {
      const sw = 5 + Math.floor(rand() * 5);
      const sx = Math.max(x, xx), ex = Math.min(x + w, xx + sw - 1);
      if (ex > sx && sh > 0) {
        const tone = rand();
        P.rect(sx, yy, ex - sx, sh, tone < 0.2 ? col.dark : tone > 0.9 ? col.light : col.base);
        P.rect(sx, yy, ex - sx, 1, col.light);
        if (sh > 2) P.rect(sx, yy + sh - 1, ex - sx, 1, col.dark);
      }
      xx += sw;
    }
  }
}

export function planks(P, x, y, w, h, col, rand, { vertical = true, size = 4 } = {}) {
  P.rect(x, y, w, h, col.base);
  if (vertical) {
    for (let xx = x; xx < x + w; xx += size) {
      P.rect(xx, y, 1, h, col.dark);
      if (xx + 1 < x + w) P.rect(xx + 1, y, 1, h, col.light);
      if (rand() < 0.5) P.px(xx + 2, y + Math.floor(rand() * h), col.dark);
    }
  } else {
    for (let yy = y; yy < y + h; yy += size) {
      P.rect(x, yy, w, 1, col.dark);
      if (yy + 1 < y + h) P.rect(x, yy + 1, w, 1, col.light);
      let seam = x + Math.floor(rand() * 20);
      while (seam < x + w) {
        P.rect(seam, yy, 1, Math.min(size, y + h - yy), col.dark);
        seam += 14 + Math.floor(rand() * 14);
      }
    }
  }
}

export function timber(P, x, y, w, h, plaster, beam, rand) {
  P.rect(x, y, w, h, plaster);
  P.speckle(x, y, w, h, shade(plaster, 0.93), Math.floor((w * h) / 18), rand);
  P.rect(x, y, w, 2, beam);
  P.rect(x, y + h - 2, w, 2, beam);
  const step = 14;
  const cols = [];
  for (let xx = x; xx <= x + w - 2; xx += step) cols.push(xx);
  cols[cols.length - 1] = x + w - 2;
  cols.forEach((xx) => P.rect(xx, y, 2, h, beam));
  for (let i = 0; i + 1 < cols.length; i++) {
    if (i % 2) continue;
    const x0 = cols[i] + 2, x1 = cols[i + 1];
    P.line(x0, y + h - 3, x1 - 1, y + 2, beam);
    P.line(x0 + 1, y + h - 3, x1 - 1, y + 3, beam);
  }
}

// Techo de tejas visto desde el frente: trapecio con hileras festoneadas.
export function roof(P, { x, y, w, h, inset, base, dark, light }) {
  const pts = [[x, y + h], [x + inset, y], [x + w - inset, y], [x + w, y + h]];
  P.poly([[x - 1, y + h + 1], [x + inset - 1, y - 1], [x + w - inset + 1, y - 1], [x + w + 1, y + h + 1]], INK);
  P.poly(pts, base);
  for (let yy = y + 3, row = 0; yy < y + h; yy += 4, row++) {
    const t = (yy - y) / h;
    const lx = Math.round(x + inset * (1 - t)), rx = Math.round(x + w - inset * (1 - t));
    P.rect(lx, yy, rx - lx, 1, dark);
    for (let xx = lx + (row % 2 ? 2 : 5); xx < rx - 1; xx += 6) {
      P.px(xx, yy - 1, dark);
      P.px(xx, yy - 2, dark);
      P.px(xx - 2, yy - 3, light);
      P.px(xx - 1, yy - 3, light);
    }
  }
  P.rect(x + inset, y, w - inset * 2, 2, light);
  P.rect(x + inset, y + 2, w - inset * 2, 1, dark);
  P.rect(x - 1, y + h, w + 2, 2, PAL.woodDark);
  P.rect(x - 1, y + h + 2, w + 2, 1, INK);
}

export function windowPane(P, x, y, w, h, opts = {}) {
  const { lit = false, shutters = null, box = false, arch = false, frame = PAL.woodLight, rand } = opts;
  P.rect(x - 2, y - 2, w + 4, h + 4, INK);
  P.rect(x - 1, y - 1, w + 2, h + 2, frame);
  P.rect(x, y, w, h, lit ? PAL.lit : PAL.glass);
  if (lit) {
    P.rect(x + 1, y + 1, w - 2, h - 2, PAL.litHi);
    P.dither(x, y, w, h, PAL.lit, 1);
  } else {
    for (let i = 0; i < Math.min(w, h) - 1; i++) P.px(x + 1 + i, y + h - 2 - i, PAL.glassHi);
  }
  if (arch) {
    P.rect(x - 1, y - 2, 2, 2, opts.wall ?? INK);
    P.rect(x + w - 1, y - 2, 2, 2, opts.wall ?? INK);
    P.px(x, y, frame);
    P.px(x + w - 1, y, frame);
  }
  P.rect(x + Math.floor(w / 2), y, 1, h, frame);
  P.rect(x, y + Math.floor(h / 2), w, 1, frame);
  P.rect(x - 2, y + h + 1, w + 4, 1, '#d8d0c0');
  if (shutters) {
    for (const sx of [x - 6, x + w + 2]) {
      P.rect(sx, y - 2, 4, h + 4, INK);
      P.rect(sx + 1, y - 1, 2, h + 2, shutters);
      P.rect(sx + 1, y + 1, 2, 1, shade(shutters, 0.7));
      P.rect(sx + 1, y + h - 2, 2, 1, shade(shutters, 0.7));
    }
  }
  if (box) {
    P.rect(x - 2, y + h + 2, w + 4, 3, INK);
    P.rect(x - 1, y + h + 2, w + 2, 2, PAL.wood);
    const flowers = ['#ef7d57', '#f080b0', '#ffcd75', '#f4f4f4'];
    for (let xx = x - 1; xx < x + w + 1; xx += 2) {
      P.px(xx, y + h + 1, '#38b764');
      P.px(xx + 1, y + h, flowers[Math.floor((rand ? rand() : Math.random()) * flowers.length)]);
    }
  }
}

export function door(P, x, y, w, h, opts = {}) {
  const { color = PAL.wood, arch = false, step = true, rand = Math.random } = opts;
  P.rect(x - 1, y - 1, w + 2, h + 1, INK);
  planks(P, x, y, w, h, { base: color, dark: shade(color, 0.7), light: shade(color, 1.2) }, rand, { size: 3 });
  if (arch) {
    const r = Math.floor(w / 2);
    for (let i = 0; i < r; i++) {
      const cut = r - Math.round(Math.sqrt(r * r - (r - i) * (r - i)));
      P.rect(x - 1, y - 1 + i, cut + 1, 1, opts.wall ?? INK);
      P.rect(x + w - cut, y - 1 + i, cut + 1, 1, opts.wall ?? INK);
      P.px(x - 1 + cut, y - 1 + i, INK);
      P.px(x + w - cut, y - 1 + i, INK);
    }
  }
  P.rect(x, y + 3, w, 1, PAL.iron);
  P.rect(x, y + h - 4, w, 1, PAL.iron);
  P.px(x + w - 3, y + Math.floor(h / 2), PAL.gold);
  if (step) {
    P.rect(x - 3, y + h, w + 6, 2, '#8b8fa3');
    P.rect(x - 3, y + h, w + 6, 1, '#b4b8c8');
  }
}

export function chimney(P, x, y, w, h, rand) {
  P.rect(x - 1, y - 1, w + 2, h + 1, INK);
  stones(P, x, y, w, h, { base: '#a08a7a', dark: '#6e5c50', light: '#c8b4a4', mortar: '#5a4a40' }, rand, 4);
  P.rect(x - 2, y - 2, w + 4, 3, INK);
  P.rect(x - 1, y - 1, w + 2, 1, '#8a7a6e');
}

export function signBoard(P, x, y, w, h, label, colors = {}) {
  const { bg = PAL.wood, fg = PAL.gold } = colors;
  P.rect(x - 1, y - 1, w + 2, h + 2, INK);
  P.rect(x, y, w, h, bg);
  P.rect(x, y, w, 1, shade(bg, 1.3));
  P.rect(x, y + h - 1, w, 1, shade(bg, 0.7));
  P.text(label, x + Math.floor((w - textWidth(label)) / 2), y + Math.floor((h - 5) / 2), fg);
}

export function hangingSign(P, x, y, iconRows, iconPal, dir = 1) {
  const bx = dir > 0 ? x : x - 14;
  P.rect(bx, y, 14, 1, INK);
  P.rect(bx, y + 1, 14, 1, PAL.iron);
  P.px(dir > 0 ? x + 2 : x - 3, y + 2, PAL.iron);
  const sx = dir > 0 ? x + 3 : x - 13;
  P.px(sx + 1, y + 2, INK);
  P.px(sx + 8, y + 2, INK);
  P.rect(sx - 1, y + 3, 12, 12, INK);
  P.rect(sx, y + 4, 10, 10, '#e8cf9a');
  P.rect(sx, y + 13, 10, 1, '#b8955a');
  P.sprite(iconRows, iconPal, sx + 1, y + 5);
}

export function tree(P, cx, baseY, size, rand, tones = ['#1f5a32', '#2e7a3a', '#4f9e45', '#7cc456']) {
  P.rect(cx - 2, baseY - size, 5, size, INK);
  P.rect(cx - 1, baseY - size, 3, size, PAL.woodDark);
  P.px(cx, baseY - Math.floor(size / 2), PAL.wood);
  P.rect(cx - 3, baseY - 1, 7, 1, INK);
  const top = baseY - size - Math.round(size * 0.6);
  const blobs = [
    [0, 0, size * 0.75, size * 0.62], [-size * 0.55, size * 0.25, size * 0.55, size * 0.45],
    [size * 0.55, size * 0.25, size * 0.55, size * 0.45], [0, -size * 0.35, size * 0.5, size * 0.4],
  ].map(([dx, dy, rx, ry]) => [cx + Math.round(dx), top + Math.round(dy), Math.round(rx), Math.round(ry)]);
  blobs.forEach(([x, y, rx, ry]) => P.ellipse(x, y, rx + 1, ry + 1, INK));
  blobs.forEach(([x, y, rx, ry]) => P.ellipse(x, y, rx, ry, tones[0]));
  blobs.forEach(([x, y, rx, ry]) => P.ellipse(x - 1, y - 1, Math.max(1, rx - 2), Math.max(1, ry - 2), tones[1]));
  blobs.forEach(([x, y, rx, ry]) => P.ellipse(x - 2, y - 2, Math.max(1, Math.round(rx / 2)), Math.max(1, Math.round(ry / 2)), tones[2]));
  blobs.forEach(([x, y, rx, ry]) => {
    P.px(x - Math.round(rx / 2), y - Math.round(ry / 2), tones[3]);
    P.px(x - Math.round(rx / 2) + 1, y - Math.round(ry / 2), tones[3]);
  });
  for (let i = 0; i < size; i++) P.px(cx - size + Math.floor(rand() * size * 2), top + Math.floor(rand() * size), tones[0]);
}

export function pine(P, cx, baseY, h, tones = ['#1f4a32', '#2e6b3a', '#4f8e45']) {
  P.rect(cx - 1, baseY - 4, 3, 4, PAL.woodDark);
  const layers = 3;
  for (let i = 0; i < layers; i++) {
    const ly = baseY - 3 - i * Math.floor(h / 4);
    const lw = Math.floor(h / 2) - i * 2;
    const th = Math.floor(h / 3);
    P.poly([[cx - lw - 1, ly + 1], [cx + 0.5, ly - th - 1], [cx + lw + 2, ly + 1]], INK);
    P.poly([[cx - lw, ly], [cx + 0.5, ly - th], [cx + lw + 1, ly]], tones[1]);
    P.poly([[cx - lw + 2, ly - 1], [cx + 0.5, ly - th + 1], [cx, ly - 1]], tones[2]);
    P.rect(cx - lw, ly - 1, lw * 2 + 1, 1, tones[0]);
  }
}

export function bush(P, cx, cy, r, rand, berries = null) {
  P.blob(cx, cy, r + 2, r, '#2e7a3a');
  P.ellipse(cx - 1, cy - 1, r, r - 2, '#4f9e45');
  P.px(cx - Math.floor(r / 2), cy - Math.floor(r / 2), '#7cc456');
  P.px(cx - Math.floor(r / 2) + 1, cy - Math.floor(r / 2), '#7cc456');
  if (berries) for (let i = 0; i < r + 1; i++) P.px(cx - r + Math.floor(rand() * r * 2), cy - r / 2 + Math.floor(rand() * r), berries);
}

export function barrel(P, x, y) {
  P.rect(x, y + 1, 9, 10, INK);
  P.rect(x + 1, y, 7, 12, INK);
  P.rect(x + 1, y + 1, 7, 10, PAL.wood);
  P.rect(x + 2, y + 1, 2, 10, PAL.woodLight);
  P.rect(x + 6, y + 1, 2, 10, PAL.woodDark);
  P.rect(x + 1, y + 3, 7, 1, PAL.iron);
  P.rect(x + 1, y + 8, 7, 1, PAL.iron);
  P.rect(x + 2, y + 1, 5, 1, '#c89a64');
}

export function crate(P, x, y, s = 9) {
  P.rect(x, y, s, s, INK);
  P.rect(x + 1, y + 1, s - 2, s - 2, PAL.woodLight);
  P.rect(x + 1, y + 1, s - 2, 1, '#d4a06a');
  P.line(x + 1, y + 1, x + s - 2, y + s - 2, PAL.woodDark);
  P.line(x + s - 2, y + 1, x + 1, y + s - 2, PAL.woodDark);
  P.frame(x + 1, y + 1, s - 2, s - 2, PAL.wood);
}

export function lampPost(P, x, baseY, glow = true) {
  P.rect(x - 1, baseY - 16, 3, 16, INK);
  P.rect(x, baseY - 16, 1, 16, PAL.iron);
  P.rect(x - 2, baseY - 1, 5, 1, INK);
  P.rect(x - 3, baseY - 22, 7, 7, INK);
  P.rect(x - 2, baseY - 21, 5, 5, glow ? PAL.lit : PAL.glass);
  P.px(x - 1, baseY - 20, PAL.litHi);
  P.rect(x - 3, baseY - 23, 7, 1, PAL.iron);
  P.px(x, baseY - 24, INK);
}

export function fence(P, x, y, w) {
  P.rect(x, y + 2, w, 1, PAL.woodDark);
  P.rect(x, y + 5, w, 1, PAL.woodDark);
  for (let xx = x; xx < x + w; xx += 5) {
    P.rect(xx, y, 2, 8, INK);
    P.px(xx, y, PAL.woodLight);
    P.px(xx, y + 1, PAL.wood);
  }
}

export function flowers(P, x, y, w, h, rand, count = 12) {
  const colors = ['#ef7d57', '#f080b0', '#ffcd75', '#f4f4f4', '#b07ad0', '#73eff7'];
  for (let i = 0; i < count; i++) {
    const fx = x + Math.floor(rand() * w), fy = y + Math.floor(rand() * h);
    P.px(fx, fy + 1, '#2e7a3a');
    P.px(fx, fy, colors[Math.floor(rand() * colors.length)]);
  }
}

// ---------- Siluetas con contorno y volumen automáticos ----------
// Se marcan píxeles en una grilla (cada valor es una región: piel, manga, uña...) y al dibujar
// se agrega el contorno de afuera y la luz arriba a la izquierda y la sombra abajo a la derecha.
export function mask(w, h) {
  const grid = Array.from({ length: h }, () => new Array(w).fill(0));
  const M = {
    w,
    h,
    set(x, y, v = 1) {
      x = Math.round(x);
      y = Math.round(y);
      if (x >= 0 && y >= 0 && x < w && y < h) grid[y][x] = v;
      return M;
    },
    get(x, y) {
      return x >= 0 && y >= 0 && x < w && y < h ? grid[y][x] : 0;
    },
    rect(x, y, rw, rh, v = 1) {
      for (let yy = 0; yy < rh; yy++) for (let xx = 0; xx < rw; xx++) M.set(x + xx, y + yy, v);
      return M;
    },
    ellipse(cx, cy, rx, ry, v = 1) {
      for (let dy = -ry; dy <= ry; dy++) {
        const dx = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry || 1))));
        for (let x = -dx; x <= dx; x++) M.set(cx + x, cy + dy, v);
      }
      return M;
    },
    // Trazo grueso: estampa discos a lo largo del segmento.
    stroke(x0, y0, x1, y1, r = 1, v = 1) {
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2));
      for (let i = 0; i <= steps; i++) {
        const k = i / steps;
        M.ellipse(Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), r, r, v);
      }
      return M;
    },
    tri(ax, ay, bx, by, cx, cy, v = 1) {
      const minX = Math.floor(Math.min(ax, bx, cx)), maxX = Math.ceil(Math.max(ax, bx, cx));
      const minY = Math.floor(Math.min(ay, by, cy)), maxY = Math.ceil(Math.max(ay, by, cy));
      const sign = (px, py, x1, y1, x2, y2) => (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const d1 = sign(x, y, ax, ay, bx, by), d2 = sign(x, y, bx, by, cx, cy), d3 = sign(x, y, cx, cy, ax, ay);
          const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
          if (!(neg && pos)) M.set(x, y, v);
        }
      }
      return M;
    },
    // pal: { valor: color | { base, shade, light } }
    draw(P, ox, oy, pal, { flip = false, outline = INK } = {}) {
      const at = (x, y) => M.get(flip ? w - 1 - x : x, y);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const v = at(x, y);
          if (!v) {
            if (outline && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1))) P.px(ox + x, oy + y, outline);
            continue;
          }
          const c = pal[v];
          if (!c) continue;
          if (typeof c === 'string') {
            P.px(ox + x, oy + y, c);
            continue;
          }
          const edgeDark = !at(x + 1, y) || !at(x, y + 1);
          const edgeLight = !at(x - 1, y) || !at(x, y - 1);
          P.px(ox + x, oy + y, edgeDark ? c.shade ?? c.base : edgeLight ? c.light ?? c.base : c.base);
        }
      }
    },
  };
  return M;
}

export const tone = (base, shadeAmt = 0.8, lightAmt = 1.12) => ({ base, shade: shade(base, shadeAmt), light: shade(base, lightAmt) });
