// Escenario animado: pinta la parte fija una sola vez y redibuja lo animado unas 12 veces por segundo.
// Se detiene solo al cambiar de pantalla (game.addCleanup).

import { painter, makeCanvas } from './art/paint.js';

const FPS = 12;
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Reloj compartido para los lienzos chicos animados (héroe, monstruos): un solo bucle para todos.
const animated = new Set();
let tickerRaf = 0;
let tickerLast = 0;
const tickerStart = performance.now();

function tick(now) {
  if (!animated.size) {
    tickerRaf = 0;
    return;
  }
  if (now - tickerLast >= 1000 / FPS) {
    tickerLast = now;
    const t = (now - tickerStart) / 1000;
    animated.forEach((draw) => draw(t));
  }
  tickerRaf = requestAnimationFrame(tick);
}

export function animateCanvas(game, canvas, draw) {
  if (reducedMotion()) return;
  animated.add(draw);
  game.addCleanup(() => animated.delete(draw));
  if (!tickerRaf) tickerRaf = requestAnimationFrame(tick);
}

export function createStage(game, { w, h, drawStatic, drawFrame, state = {}, className = 'px stage-canvas' }) {
  const base = makeCanvas(w, h);
  drawStatic(painter(base.getContext('2d')));

  const canvas = makeCanvas(w, h, className);
  const ctx = canvas.getContext('2d');
  const P = painter(ctx);
  const start = performance.now();
  let raf = 0;
  let last = 0;
  let running = true;

  function paint(now) {
    ctx.drawImage(base, 0, 0);
    drawFrame?.(P, (now - start) / 1000, state);
  }

  function loop(now) {
    if (!running) return;
    if (now - last >= 1000 / FPS) {
      last = now;
      paint(now);
    }
    raf = requestAnimationFrame(loop);
  }

  paint(start + 1000);
  if (!reducedMotion()) raf = requestAnimationFrame(loop);

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  game.addCleanup(stop);
  return { canvas, state, redraw: () => paint(performance.now()), stop };
}
