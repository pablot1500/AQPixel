// Edificios del pueblo y sus dueños. Cada lista de frases se elige al azar.

export const TOWN_NAME = 'Villa Pixelia';

export const BUILDINGS = [
  {
    id: 'posada', name: 'Posada La Siesta', owner: 'Doña Berta',
    lines: [
      '¿Otra vez cubierto de baba de slime? Pasá, que hay sopa.',
      'Las camas no muerden. Las pulgas, un poco.',
      'Si te desmayás afuera, te voy a buscar. Pero me debés una torta.',
    ],
    thanks: ['Dormí tranquilo, que yo cuido la puerta.', 'Hasta mañana, tesoro.'],
    poor: ['Sin oro no hay colchón, corazón. El establo es gratis.'],
  },
  {
    id: 'herrero', name: 'El Yunque Gruñón', owner: 'Gruñido',
    lines: [
      'Si lo rompés, lo pagás. Si no lo rompés, también lo pagás.',
      '¿Vas al volcán con una espada de fuego? Mal. Llevá agua.',
      'Mismo diseño, ocho elementos. Eficiencia enana.',
    ],
    thanks: ['Buena compra. No la uses para abrir latas.', 'Trato hecho. Afilala de vez en cuando.', 'Otro cliente satisfecho. Bah, satisfecho yo.'],
    poor: ['¿Y el oro? Esto no es una biblioteca.', 'Volvé cuando tengas con qué pagar.'],
    owned: ['Esa ya la tenés. ¿Querés dos? No te entran en las manos.'],
  },
  {
    id: 'magia', name: 'Chispas & Cía.', owner: 'Madame Chispas',
    lines: [
      'Todo hechizo viene con garantía de cero días.',
      'Las pociones no se devuelven. Por razones obvias.',
      '¿Ese olor? Es el Infierno. El hechizo, no el lugar.',
    ],
    thanks: ['Excelente elección. Mi búho lo aprueba.', 'Que la magia te acompañe. Y que no te explote.'],
    poor: ['La magia es gratis. Los frascos no.', 'Mi búho dice que no te alcanza.'],
    owned: ['Ese hechizo ya lo sabés, querido.'],
    full: ['No te entran más frascos en la mochila.'],
  },
  {
    id: 'entrenador', name: 'Gimnasio Bíceps', owner: 'Coach Bíceps',
    lines: [
      '¡Una flexión más! Bueno, dos. Y pagás.',
      'El carisma también se entrena. Sonreí. Más. Menos, me asustás.',
      'Sin dolor no hay ganancia. Sin oro tampoco.',
    ],
    poor: ['¡Sin oro no hay rutina! Andá a cazar algo.'],
    trained: {
      fue: '¡Eso! Ahora abrís los frascos difíciles.',
      des: 'Más rápido que un slime apurado.',
      int: 'Leer también es ejercicio. Para la cabeza.',
      res: 'Aguantás más golpes. No es lo mismo que buscarlos.',
      car: 'Sonreí. Eso. Ahora das menos miedo.',
      sue: 'No sé cómo se entrena la suerte, pero pagaste, así que funciona.',
    },
  },
  {
    id: 'mochila', name: 'Tu Casa', owner: 'Tu casa',
    lines: [
      'Tu casa. Huele a medias limpias y a aventura.',
      'El gato ni se inmutó cuando entraste.',
      'Acá guardás tu equipo. El ropero no cierra del todo.',
    ],
  },
  {
    id: 'mapa', name: 'Puerta del Pueblo', owner: 'Guardia Ramón',
    lines: [
      'Afuera hay monstruos. Adentro también, pero pagan alquiler.',
      'Revisá contra qué elemento vas a pelear antes de salir.',
      'Si volvés sin piernas, no cuenta como turismo.',
    ],
  },
];

export const TOWN_TIPS = [
  'Tocá un edificio para entrar. La puerta de la derecha lleva a las zonas de caza.',
  'Cada zona tiene un elemento dominante. Llevá el arma que le duela.',
  'Los objetos raros solo se consiguen cazando. Algunos son bastante ridículos.',
  'Vender devuelve un cuarto del precio. Pensalo dos veces.',
  'El carisma te consigue descuentos. La sonrisa es gratis.',
];

export const NOTICE_BOARD = 'El tablón de misiones todavía está vacío. Dicen que pronto llegan pedidos de ayuda y un tal Rey Slime.';

export const NEWS = [
  { title: 'Semana 2: ¡Villa Pixelia, en persona!', body: 'Ahora podés recorrer el pueblo y entrar a cada local. Gruñido estrenó estante de armas.' },
  { title: 'Semana 1: ¡Abrió Villa Pixelia!', body: '5 zonas, 15 monstruos y más de 70 objetos para coleccionar. Los objetos raros solo se consiguen cazando.' },
  { title: 'Próximamente', body: 'Escudos, mascotas, banco, misiones con jefes y el regreso del Rey Slime.' },
];

export const building = (id) => BUILDINGS.find((b) => b.id === id);
