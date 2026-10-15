// Fondos de página en pixel art, uno por lugar. Cada patrón es un azulejo chico dibujado por código
// que se repite detrás de la pantalla (reemplaza el cuadriculado genérico).

import { seeded } from '../util.js';
import { painter, makeCanvas, stones, planks } from './paint.js';

const SCALE = 3;
const cache = new Map();

const TILES = {
  titulo: {
    size: [32, 32], bg: '#141626',
    draw(P, r) {
      P.rect(0, 0, 32, 32, '#141626');
      for (let i = 0; i < 5; i++) P.px(Math.floor(r() * 32), Math.floor(r() * 32), '#3a4166');
      P.px(7, 9, '#94b0c2');
      P.px(24, 22, '#ffcd75');
      P.rect(23, 22, 3, 1, '#5d4a3a');
      P.rect(24, 21, 1, 3, '#5d4a3a');
      P.px(24, 22, '#ffcd75');
    },
  },
  pueblo: {
    size: [32, 32], bg: '#24462a',
    draw(P, r) {
      P.rect(0, 0, 32, 32, '#24462a');
      for (let i = 0; i < 40; i++) P.px(Math.floor(r() * 32), Math.floor(r() * 32), r() < 0.5 ? '#2c5432' : '#1d3a22');
      for (const [x, y] of [[4, 6], [20, 3], [12, 18], [27, 24], [6, 27]]) {
        P.px(x, y, '#356a3a');
        P.px(x + 2, y, '#356a3a');
        P.px(x + 1, y - 1, '#3f7a42');
      }
      P.px(16, 10, '#8a5a6a');
      P.px(25, 14, '#8a7a4a');
    },
  },
  posada: {
    size: [48, 24], bg: '#3a2416',
    draw(P, r) {
      planks(P, 0, 0, 48, 24, { base: '#3a2416', dark: '#28180e', light: '#4a2e1c' }, r, { vertical: false, size: 6 });
      for (const [x, y] of [[3, 2], [27, 8], [13, 14], [40, 20]]) P.px(x, y, '#6e5440');
    },
  },
  herrero: {
    size: [32, 30], bg: '#23252f',
    draw(P, r) {
      stones(P, 0, 0, 32, 30, { base: '#2c2f3c', dark: '#23252f', light: '#363a4a', mortar: '#18191f' }, r, 6);
      P.px(9, 13, '#7a2a1a');
      P.px(22, 25, '#9a3a1a');
    },
  },
  magia: {
    size: [24, 24], bg: '#24142f',
    draw(P) {
      P.rect(0, 0, 24, 24, '#24142f');
      const star = (x, y, c) => { P.px(x, y, c); P.px(x - 1, y, c); P.px(x + 1, y, c); P.px(x, y - 1, c); P.px(x, y + 1, c); };
      star(6, 6, '#3a2450');
      P.px(6, 6, '#6a4a8a');
      star(18, 18, '#3a2450');
      P.px(18, 18, '#8a6a3a');
      P.px(18, 6, '#30203f');
      P.px(6, 18, '#30203f');
    },
  },
  entrenador: {
    size: [32, 32], bg: '#2e2228',
    draw(P, r) {
      P.rect(0, 0, 32, 32, '#2e2228');
      for (let i = 0; i < 30; i++) {
        const c = ['#3a2a32', '#4a2a30', '#2a2e3e', '#3e2a2a'][Math.floor(r() * 4)];
        P.px(Math.floor(r() * 32), Math.floor(r() * 32), c);
      }
      P.rect(0, 0, 32, 1, '#221a1e');
      P.rect(0, 0, 1, 32, '#221a1e');
      P.rect(0, 16, 32, 1, '#5a2030');
    },
  },
  mochila: {
    size: [24, 24], bg: '#24382a',
    draw(P) {
      P.rect(0, 0, 24, 24, '#24382a');
      P.rect(0, 0, 6, 24, '#2a4030');
      P.rect(12, 0, 6, 24, '#2a4030');
      P.px(15, 6, '#5a4a3a');
      P.px(14, 6, '#4a5a3a');
      P.px(16, 6, '#4a5a3a');
      P.px(3, 18, '#5a4a3a');
    },
  },
  mapa: {
    size: [32, 32], bg: '#172447',
    draw(P) {
      P.rect(0, 0, 32, 32, '#172447');
      for (const [x, y] of [[3, 7], [19, 3], [11, 20], [25, 26]]) {
        P.rect(x, y, 2, 1, '#22326a');
        P.rect(x + 2, y - 1, 2, 1, '#22326a');
        P.rect(x + 4, y, 2, 1, '#22326a');
      }
    },
  },
  bosque: {
    size: [32, 32], bg: '#1a3020',
    draw(P, r) {
      P.rect(0, 0, 32, 32, '#1a3020');
      for (let i = 0; i < 6; i++) {
        const x = Math.floor(r() * 30), y = Math.floor(r() * 30);
        P.rect(x, y, 2, 1, '#24402a');
        P.px(x + 1, y + 1, '#24402a');
      }
      P.px(10, 12, '#3a5a2a');
    },
  },
  costa: {
    size: [32, 32], bg: '#2e2a20',
    draw(P, r) {
      P.rect(0, 0, 32, 32, '#2e2a20');
      for (let i = 0; i < 26; i++) P.px(Math.floor(r() * 32), Math.floor(r() * 32), r() < 0.5 ? '#3a3426' : '#262218');
      P.rect(12, 14, 3, 2, '#5a4a3a');
      P.px(13, 13, '#5a4a3a');
    },
  },
  volcan: {
    size: [32, 32], bg: '#1f1414',
    draw(P, r) {
      P.rect(0, 0, 32, 32, '#1f1414');
      for (let i = 0; i < 20; i++) P.px(Math.floor(r() * 32), Math.floor(r() * 32), '#2a1a1a');
      P.line(2, 20, 9, 16, '#4a1a12');
      P.line(9, 16, 14, 18, '#4a1a12');
      P.px(9, 16, '#7a2a14');
      P.line(20, 6, 27, 9, '#3a1610');
    },
  },
  picos: {
    size: [24, 24], bg: '#1e2a3a',
    draw(P) {
      P.rect(0, 0, 24, 24, '#1e2a3a');
      const flake = (x, y) => {
        P.px(x, y, '#3a4e66');
        P.px(x - 1, y, '#2c3c52');
        P.px(x + 1, y, '#2c3c52');
        P.px(x, y - 1, '#2c3c52');
        P.px(x, y + 1, '#2c3c52');
      };
      flake(6, 7);
      flake(17, 17);
      P.px(19, 4, '#2c3c52');
    },
  },
  cripta: {
    size: [32, 32], bg: '#18141f',
    draw(P, r) {
      stones(P, 0, 0, 32, 32, { base: '#1e1a28', dark: '#18141f', light: '#262032', mortar: '#110e16' }, r, 8);
      P.px(20, 12, '#3a2a4a');
    },
  },
};

function tileUrl(place) {
  if (cache.has(place)) return cache.get(place);
  const def = TILES[place] ?? TILES.titulo;
  const [w, h] = def.size;
  const c = makeCanvas(w, h);
  def.draw(painter(c.getContext('2d')), seeded(place.length * 97 + 13));
  const url = c.toDataURL('image/png');
  cache.set(place, url);
  return url;
}

export function applyBackdrop(place) {
  const def = TILES[place] ?? TILES.titulo;
  const [w, h] = def.size;
  const s = document.body.style;
  s.backgroundColor = def.bg;
  s.backgroundImage = `url(${tileUrl(place)})`;
  s.backgroundSize = `${w * SCALE}px ${h * SCALE}px`;
  s.backgroundPosition = '0 0';
  document.body.dataset.place = place;
}
