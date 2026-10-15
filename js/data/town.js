// Edificios del pueblo y sus dueños. Cada frase es una línea al azar al entrar.

export const TOWN_NAME = 'Villa Pixelia';

export const BUILDINGS = [
  {
    id: 'posada', name: 'Posada La Siesta', owner: 'Doña Berta', icon: 'bed',
    roof: '#b13e53', wall: '#f0d8a8',
    lines: [
      '¿Otra vez cubierto de baba de slime? Pasá, que hay sopa.',
      'Las camas no muerden. Las pulgas, un poco.',
      'Si te desmayás afuera, te voy a buscar. Pero me debés una torta.',
    ],
  },
  {
    id: 'herrero', name: 'El Yunque Gruñón', owner: 'Gruñido, el enano', icon: 'anvil',
    roof: '#566c86', wall: '#c2a080',
    lines: [
      'Si lo rompés, lo pagás. Si no lo rompés, también lo pagás.',
      '¿Querés un arma de fuego para el volcán? Mal. Querés una de agua.',
      'Mismo diseño, ocho elementos. Eficiencia enana.',
    ],
  },
  {
    id: 'magia', name: 'Chispas & Cía.', owner: 'Madame Chispas', icon: 'orb',
    roof: '#5d275d', wall: '#c8b8e8',
    lines: [
      'Todo hechizo viene con garantía de cero días.',
      'Las pociones no se devuelven. Por razones obvias.',
      '¿Ese olor? Es el Infierno. El hechizo, no el lugar.',
    ],
  },
  {
    id: 'entrenador', name: 'Gimnasio Bíceps', owner: 'Coach Bíceps', icon: 'dumbbell',
    roof: '#ef7d57', wall: '#f4f4f4',
    lines: [
      '¡Una flexión más! Bueno, dos. Y pagás.',
      'El carisma también se entrena. Sonreí. Más. Menos, me asustás.',
      'Sin dolor no hay ganancia. Sin oro tampoco.',
    ],
  },
  {
    id: 'mochila', name: 'Tu Mochila', owner: 'Equipo y atributos', icon: 'bag',
    roof: '#38b764', wall: '#e8d0a0',
  },
  {
    id: 'mapa', name: 'Puerta del Pueblo', owner: 'Guardia Ramón', icon: 'map',
    roof: '#29366f', wall: '#94b0c2',
    lines: [
      'Afuera hay monstruos. Adentro también, pero pagan alquiler.',
      'Revisá contra qué elemento vas a pelear antes de salir.',
      'Si volvés sin piernas, no cuenta como turismo.',
    ],
  },
];

export const NEWS = [
  { title: 'Semana 1: ¡Abrió Villa Pixelia!', body: '5 zonas, 15 monstruos y más de 70 objetos para coleccionar. Los objetos raros solo se consiguen cazando.' },
  { title: 'Próximamente', body: 'Escudos, mascotas, banco, misiones con jefes y el regreso del Rey Slime.' },
];
