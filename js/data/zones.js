// Zonas del mapa. Cada zona es un menú de encuentros con un elemento dominante.
// bg describe el fondo de combate que se dibuja por código.

export const ZONES = [
  {
    id: 'bosque', name: 'Bosque Musgoso', element: 'tierra', min: 1, max: 4,
    monsters: ['slime_musgo', 'hongo_saltarin', 'lobo_gris'],
    desc: 'El patio trasero del pueblo. Los slimes son casi mascotas. Casi.',
    bg: { sky: ['#73eff7', '#a6e6ff'], far: '#38b764', ground: ['#5aa83a', '#38703a'], deco: 'tree' },
  },
  {
    id: 'costa', name: 'Costa Burbujeante', element: 'agua', min: 3, max: 6,
    monsters: ['slime_marino', 'hongo_coral', 'cangrejo'],
    desc: 'Playa, sol y cangrejos con muy mal humor.',
    bg: { sky: ['#41a6f6', '#a6e6ff'], far: '#3b5dc9', sea: true, ground: ['#f0d890', '#d0b060'], deco: 'rock' },
  },
  {
    id: 'volcan', name: 'Volcán Gruñón', element: 'fuego', min: 5, max: 9,
    monsters: ['slime_lava', 'diablillo', 'murcielago_igneo'],
    desc: 'Hace calor. Mucho. Traé agua o hielo, y no para tomar.',
    bg: { sky: ['#5d275d', '#b13e53'], far: '#333c57', ground: ['#3e2a2a', '#241818'], deco: 'lava' },
  },
  {
    id: 'picos', name: 'Picos Helados', element: 'hielo', min: 8, max: 12,
    monsters: ['slime_glaciar', 'murcielago_gelido', 'yeti'],
    desc: 'Montañas eternamente nevadas. Un yeti cobra peaje.',
    bg: { sky: ['#94b0c2', '#e4f0f8'], far: '#566c86', ground: ['#f4f4f4', '#c2d3dd'], deco: 'crystal' },
  },
  {
    id: 'cripta', name: 'Cripta Olvidada', element: 'oscuridad', min: 11, max: 15,
    monsters: ['murcielago_sombrio', 'esqueleto', 'fantasma'],
    desc: 'Nadie recuerda quién está enterrado acá. Ellos tampoco.',
    bg: { sky: ['#1a1c2c', '#333c57'], far: '#29366f', ground: ['#3a3248', '#262033'], deco: 'tomb' },
  },
];

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));
