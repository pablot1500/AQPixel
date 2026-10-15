// Sistema elemental: cada criatura resiste su elemento y es débil a su opuesto.
// Las resistencias son el porcentaje de daño que se recibe: 150 = +50 %, 50 = mitad, 0 = inmune.

export const ELEMENT_IDS = ['fuego', 'agua', 'hielo', 'viento', 'tierra', 'energia', 'luz', 'oscuridad'];

export const ELEMENTS = {
  neutral:   { name: 'Neutral',   color: '#c2c9d6', dark: '#566c86', weakTo: [] },
  fuego:     { name: 'Fuego',     color: '#ef7d57', dark: '#b13e53', weakTo: ['agua', 'hielo'] },
  agua:      { name: 'Agua',      color: '#41a6f6', dark: '#3b5dc9', weakTo: ['fuego'] },
  hielo:     { name: 'Hielo',     color: '#73eff7', dark: '#41a6f6', weakTo: ['fuego'] },
  viento:    { name: 'Viento',    color: '#a7f070', dark: '#38b764', weakTo: ['tierra'] },
  tierra:    { name: 'Tierra',    color: '#d0955a', dark: '#7a4b2a', weakTo: ['viento'] },
  energia:   { name: 'Energía',   color: '#ffcd75', dark: '#d69a2d', weakTo: ['agua'] },
  luz:       { name: 'Luz',       color: '#fff6c8', dark: '#e0c860', weakTo: ['oscuridad'] },
  oscuridad: { name: 'Oscuridad', color: '#b07ad0', dark: '#5d275d', weakTo: ['luz'] },
};

// Colores para pintar sprites con la variante de un elemento (a = base, b = sombra, c = brillo).
export const ELEMENT_SWATCH = {
  neutral:   { a: '#c2c9d6', b: '#7d8ba0', c: '#f4f4f4' },
  fuego:     { a: '#ef7d57', b: '#b13e53', c: '#ffcd75' },
  agua:      { a: '#41a6f6', b: '#3b5dc9', c: '#a6e6ff' },
  hielo:     { a: '#73eff7', b: '#41a6f6', c: '#f4f4f4' },
  viento:    { a: '#a7f070', b: '#38b764', c: '#e6ffc8' },
  tierra:    { a: '#d0955a', b: '#7a4b2a', c: '#f0c890' },
  energia:   { a: '#ffcd75', b: '#d69a2d', c: '#fff6c8' },
  luz:       { a: '#fff6c8', b: '#e0c860', c: '#ffffff' },
  oscuridad: { a: '#7b3d8f', b: '#3e1d4a', c: '#b07ad0' },
};

export function makeResist(element, overrides = {}) {
  const r = { neutral: 100 };
  for (const id of ELEMENT_IDS) r[id] = 100;
  if (element && element !== 'neutral') {
    r[element] = 50;
    for (const weak of ELEMENTS[element].weakTo) r[weak] = 150;
  }
  return Object.assign(r, overrides);
}

export function effectivenessText(mult) {
  if (mult === 0) return '¡Inmune!';
  if (mult >= 1.5) return '¡Súper efectivo!';
  if (mult > 1) return 'Efectivo.';
  if (mult <= 0.5) return 'Poco efectivo...';
  if (mult < 1) return 'Le cuesta.';
  return '';
}
