// Bestiario. Los multiplicadores (hp, atk, dex, armor, xp, gold) ajustan la curva base por nivel.
// sprite + pal reutilizan un mismo dibujo con otra paleta: barato de producir, fácil de reconocer.

export const MONSTERS = {
  // ---- Bosque Musgoso (tierra) ----
  slime_musgo: {
    name: 'Slime Musgoso', sprite: 'slime', element: 'tierra', level: 1,
    pal: { a: '#5aa83a', b: '#38703a', c: '#a7f070' },
    attacks: [{ name: 'Salpicón' }, { name: 'Panzazo pegajoso', power: 1.4, chance: 0.2 }],
    drops: [{ id: 'cuchara_legendaria', chance: 0.07 }],
    desc: 'Gelatina con opiniones. Huele a pasto mojado.',
  },
  hongo_saltarin: {
    name: 'Hongo Saltarín', sprite: 'mushroom', element: 'tierra', level: 2, hp: 0.9, dex: 1.2,
    pal: { a: '#d0955a', b: '#7a4b2a', c: '#f0c890' },
    attacks: [{ name: 'Cabezazo' }, { name: 'Nube de esporas', power: 1.3, chance: 0.25 }],
    drops: [{ id: 'esporas_locas', chance: 0.06 }],
    desc: 'Salta, rebota y no pide perdón.',
  },
  lobo_gris: {
    name: 'Lobo Gris', sprite: 'wolf', element: 'viento', level: 3, atk: 1.1, dex: 1.3, hp: 0.95,
    pal: { a: '#94b0c2', b: '#566c86', c: '#f4f4f4' },
    attacks: [{ name: 'Mordisco' }, { name: 'Aullido cortante', power: 1.5, chance: 0.2 }],
    drops: [{ id: 'garra_lobo', chance: 0.05 }],
    desc: 'Corre como el viento. También huele como el viento después de comer porotos.',
  },

  // ---- Costa Burbujeante (agua) ----
  slime_marino: {
    name: 'Slime Marino', sprite: 'slime', element: 'agua', level: 3,
    attacks: [{ name: 'Chapuzón' }, { name: 'Ola de baba', power: 1.4, chance: 0.2 }],
    drops: [{ id: 'caparazon_burbujas', chance: 0.05 }],
    desc: 'Primo costero del slime musgoso. Más salado.',
  },
  hongo_coral: {
    name: 'Coral Saltarín', sprite: 'mushroom', element: 'agua', level: 4, hp: 0.9, dex: 1.2,
    pal: { a: '#f080b0', b: '#b13e53', c: '#ffd0e8' },
    attacks: [{ name: 'Rebote' }, { name: 'Chorro a presión', power: 1.4, chance: 0.25 }],
    drops: [],
    desc: 'Un hongo que se mudó a la playa y no volvió más.',
  },
  cangrejo: {
    name: 'Cangrejo Gruñón', sprite: 'crab', element: 'agua', level: 5, armor: 2.5, hp: 1.1, dex: 0.8,
    pal: { a: '#ef7d57', b: '#b13e53', c: '#ffcd75' },
    attacks: [{ name: 'Pinzazo' }, { name: 'Doble pinza', power: 1.6, chance: 0.2 }],
    drops: [{ id: 'pinza_gigante', chance: 0.06 }],
    resist: { tierra: 120 },
    desc: 'Caparazón duro: los hechizos lo atraviesan mejor que las espadas.',
  },

  // ---- Volcán Gruñón (fuego) ----
  slime_lava: {
    name: 'Slime de Lava', sprite: 'slime', element: 'fuego', level: 6, hp: 1.1,
    attacks: [{ name: 'Salpicón ardiente' }, { name: 'Erupción', power: 1.5, chance: 0.2 }],
    resist: { fuego: 0 },
    drops: [{ id: 'lluvia_lava', chance: 0.05 }],
    desc: 'Inmune al fuego. No lo abraces.',
  },
  diablillo: {
    name: 'Diablillo', sprite: 'imp', element: 'fuego', level: 7, dex: 1.3, atk: 1.1,
    attacks: [{ name: 'Pinchazo' }, { name: 'Escupitajo de brasas', power: 1.5, chance: 0.25 }],
    drops: [{ id: 'tridente_diablillo', chance: 0.05 }],
    desc: 'Trabaja medio tiempo de villano. Quiere un aumento.',
  },
  murcielago_igneo: {
    name: 'Murciélago Ígneo', sprite: 'bat', element: 'fuego', level: 8, dex: 1.5, hp: 0.85,
    attacks: [{ name: 'Aletazo' }, { name: 'Picada en llamas', power: 1.6, chance: 0.2 }],
    drops: [{ id: 'capa_murcielago', chance: 0.05 }],
    desc: 'Difícil de acertar. Fácil de oler a chamuscado.',
  },

  // ---- Picos Helados (hielo) ----
  slime_glaciar: {
    name: 'Slime Glaciar', sprite: 'slime', element: 'hielo', level: 9, hp: 1.15,
    attacks: [{ name: 'Granizo' }, { name: 'Abrazo helado', power: 1.5, chance: 0.2 }],
    drops: [{ id: 'arco_boreal', chance: 0.05 }],
    desc: 'Un slime marino que se quedó dormido en la montaña.',
  },
  murcielago_gelido: {
    name: 'Murciélago Gélido', sprite: 'bat', element: 'hielo', level: 10, dex: 1.5, hp: 0.85,
    attacks: [{ name: 'Aletazo frío' }, { name: 'Chillido glacial', power: 1.6, chance: 0.2 }],
    drops: [{ id: 'capa_escarcha', chance: 0.05 }],
    desc: 'Duerme colgado de carámbanos.',
  },
  yeti: {
    name: 'Yeti', sprite: 'yeti', element: 'hielo', level: 11, hp: 1.35, atk: 1.15, dex: 0.8,
    pal: { a: '#f4f4f4', b: '#94b0c2', c: '#ffffff', f: '#41a6f6' },
    attacks: [{ name: 'Manotazo' }, { name: 'Avalancha', power: 1.7, chance: 0.2 }],
    resist: { hielo: 0 },
    drops: [{ id: 'garrote_yeti', chance: 0.05 }],
    desc: 'Existe. Y está enojado porque nadie le cree.',
  },

  // ---- Cripta Olvidada (oscuridad) ----
  murcielago_sombrio: {
    name: 'Murciélago Sombrío', sprite: 'bat', element: 'oscuridad', level: 12, dex: 1.5, hp: 0.85,
    attacks: [{ name: 'Mordisco' }, { name: 'Chillido sombrío', power: 1.6, chance: 0.2 }],
    drops: [{ id: 'chillido_sombrio', chance: 0.05 }],
    desc: 'Le teme a la luz. Y a los murciélagos ígneos.',
  },
  esqueleto: {
    name: 'Esqueleto', sprite: 'skeleton', element: 'oscuridad', level: 13, hp: 1.1, armor: 1.5,
    pal: { a: '#f4f4f4', b: '#94b0c2', r: '#b07ad0' },
    attacks: [{ name: 'Huesazo' }, { name: 'Lluvia de costillas', power: 1.6, chance: 0.2 }],
    resist: { oscuridad: 0, luz: 175 },
    drops: [{ id: 'hueso_afilado', chance: 0.05 }],
    desc: 'Inmune a la oscuridad. La luz lo desarma, literalmente.',
  },
  fantasma: {
    name: 'Fantasma', sprite: 'ghost', element: 'oscuridad', level: 14, hp: 1.0, dex: 1.4,
    pal: { a: '#e4dcf4', b: '#a090c8', c: '#ffffff' },
    attacks: [{ name: 'Susto' }, { name: 'Lamento eterno', power: 1.6, chance: 0.25 }],
    resist: { neutral: 40 },
    drops: [{ id: 'sabana_embrujada', chance: 0.05 }],
    desc: 'Las armas sin elemento casi lo atraviesan. Traé algo con luz.',
  },
};
