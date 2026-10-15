export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function chance(p) {
  return Math.random() < p;
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Generador pseudoaleatorio con semilla, para que los fondos se dibujen siempre igual.
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Crea nodos DOM: h('button', { class: 'btn', onclick }, 'Texto', otroNodo)
export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2), value);
      } else if (key === 'class') {
        el.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(el.style, value);
      } else if (key in el && typeof value !== 'string') {
        el[key] = value;
      } else {
        el.setAttribute(key, value === true ? '' : value);
      }
    }
  }
  appendChildren(el, children);
  return el;
}

function appendChildren(el, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) appendChildren(el, child);
    else el.append(child instanceof Node ? child : String(child));
  }
}
