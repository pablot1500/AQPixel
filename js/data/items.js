// Catálogo de objetos. Las variantes elementales se generan a partir de un mismo diseño:
// un dibujo, ocho versiones. Para sumar contenido alcanza con agregar entradas acá.
//
// slot: weapon | armor | spell | consumable
// shop: 'herrero' | 'magia' | null (null = solo se consigue como botín)

import { ELEMENT_IDS, ELEMENTS } from './elements.js';

export const ITEMS = {};

function add(item) {
  ITEMS[item.id] = { element: 'neutral', lvl: 1, shop: null, rare: false, ...item };
}

// ---------- Armas básicas ----------
add({ id: 'espada_madera', name: 'Espada de Madera', slot: 'weapon', icon: 'sword', type: 'melee',
  min: 3, max: 6, price: 8, tint: { a: '#c48a4a', b: '#7a4b2a', c: '#f0c890' },
  desc: 'Más astillas que filo. Regalo de bienvenida.' });
add({ id: 'espada_hierro', name: 'Espada de Hierro', slot: 'weapon', icon: 'sword', type: 'melee',
  min: 6, max: 10, price: 60, shop: 'herrero', desc: 'Confiable, aburrida, efectiva.' });
add({ id: 'arco_caza', name: 'Arco de Caza', slot: 'weapon', icon: 'bow', type: 'ranged',
  min: 5, max: 9, acc: 5, price: 70, shop: 'herrero', desc: 'Usa Destreza. Apuntá con un ojo cerrado.' });

// ---------- Armaduras básicas ----------
add({ id: 'ropa_aventurero', name: 'Ropa de Aventurero', slot: 'armor', icon: 'armor', def: 2, price: 8,
  tint: { a: '#3b5dc9', b: '#29366f', c: '#41a6f6' }, desc: 'Huele a aventura. Y a sudor.' });
add({ id: 'cota_malla', name: 'Cota de Malla', slot: 'armor', icon: 'armor', def: 6, lvl: 2, price: 90,
  shop: 'herrero', desc: 'Tintinea al caminar. Los monstruos te escuchan venir.' });
add({ id: 'armadura_placas', name: 'Armadura de Placas', slot: 'armor', icon: 'armor', def: 12, lvl: 7,
  price: 340, shop: 'herrero', desc: 'Pesa como un ropero. Protege como dos.' });

// ---------- Hechizo inicial ----------
add({ id: 'chispa', name: 'Chispa', slot: 'spell', icon: 'orb', element: 'energia',
  min: 4, max: 8, mp: 4, price: 8, desc: 'Como frotar un globo, pero con intención.' });

// ---------- Variantes elementales ----------
const SPELL_NAMES = {
  fuego: ['Bola de Fuego', 'Infierno'],
  agua: ['Torrente', 'Maremoto'],
  hielo: ['Lanza de Hielo', 'Ventisca'],
  viento: ['Ráfaga', 'Tornado'],
  tierra: ['Pedrada', 'Terremoto'],
  energia: ['Rayo', 'Tormenta Eléctrica'],
  luz: ['Destello', 'Juicio Solar'],
  oscuridad: ['Sombra', 'Eclipse'],
};

for (const el of ELEMENT_IDS) {
  const E = ELEMENTS[el].name;
  add({ id: `espada_${el}`, name: `Espada de ${E}`, slot: 'weapon', icon: 'sword', type: 'melee', element: el,
    min: 8, max: 13, lvl: 3, price: 170, shop: 'herrero', desc: `Una espada de hierro con ganas de ${E.toLowerCase()}.` });
  add({ id: `arco_${el}`, name: `Arco de ${E}`, slot: 'weapon', icon: 'bow', type: 'ranged', element: el,
    min: 7, max: 12, acc: 5, lvl: 3, price: 180, shop: 'herrero', desc: 'Las flechas salen encantadas de fábrica.' });
  add({ id: `mandoble_${el}`, name: `Mandoble de ${E}`, slot: 'weapon', icon: 'sword', type: 'melee', element: el,
    min: 15, max: 22, lvl: 8, price: 520, shop: 'herrero', desc: 'Para cuando una espada normal no alcanza.' });
  add({ id: `manto_${el}`, name: `Manto de ${E}`, slot: 'armor', icon: 'armor', element: el,
    def: 5, resist: { [el]: -40 }, lvl: 4, price: 220, shop: 'herrero', desc: `Recibís 40 % menos de daño de ${E}.` });
  add({ id: `hechizo_${el}_1`, name: SPELL_NAMES[el][0], slot: 'spell', icon: 'orb', element: el,
    min: 9, max: 15, mp: 7, lvl: 2, price: 130, shop: 'magia', desc: 'Hechizo básico de la escuela de ' + E + '.' });
  add({ id: `hechizo_${el}_2`, name: SPELL_NAMES[el][1], slot: 'spell', icon: 'orb', element: el,
    min: 20, max: 30, mp: 14, lvl: 7, price: 420, shop: 'magia', desc: 'Hechizo avanzado. No lo pruebes en casa.' });
}

// ---------- Botín raro (solo se consigue cazando) ----------
add({ id: 'cuchara_legendaria', name: 'Cuchara Legendaria', slot: 'weapon', icon: 'sword', type: 'melee',
  min: 7, max: 12, lvl: 2, price: 140, rare: true, tint: { a: '#ffcd75', b: '#d69a2d', c: '#fff6c8' },
  desc: 'Forjada para la sopa del fin del mundo. Nadie sabe por qué está dentro de un slime.' });
add({ id: 'esporas_locas', name: 'Esporas Locas', slot: 'spell', icon: 'orb', element: 'tierra',
  min: 11, max: 17, mp: 6, lvl: 3, price: 180, rare: true, desc: 'Más baratas en maná que una Pedrada. Pican la nariz.' });
add({ id: 'garra_lobo', name: 'Garra del Lobo Gris', slot: 'weapon', icon: 'sword', type: 'melee', element: 'viento',
  min: 10, max: 15, lvl: 3, price: 220, rare: true, desc: 'El lobo la quiere de vuelta.' });
add({ id: 'caparazon_burbujas', name: 'Caparazón de Burbujas', slot: 'armor', icon: 'armor', element: 'agua',
  def: 8, resist: { agua: -30, fuego: -20 }, lvl: 4, price: 260, rare: true, desc: 'Hace plop cuando te golpean.' });
add({ id: 'pinza_gigante', name: 'Pinza Gigante', slot: 'weapon', icon: 'sword', type: 'melee', element: 'agua',
  min: 12, max: 18, lvl: 5, price: 300, rare: true, desc: 'Sirve de arma y de cascanueces.' });
add({ id: 'lluvia_lava', name: 'Lluvia de Lava', slot: 'spell', icon: 'orb', element: 'fuego',
  min: 22, max: 30, mp: 12, lvl: 6, price: 480, rare: true, desc: 'Prohibida en espacios cerrados.' });
add({ id: 'tridente_diablillo', name: 'Tridente del Diablillo', slot: 'weapon', icon: 'sword', type: 'melee', element: 'fuego',
  min: 16, max: 23, lvl: 7, price: 520, rare: true, desc: 'Tres puntas, cero modales.' });
add({ id: 'capa_murcielago', name: 'Capa de Murciélago', slot: 'armor', icon: 'armor', element: 'fuego',
  def: 10, resist: { fuego: -40 }, lvl: 7, price: 480, rare: true, desc: 'Te deja colgar cabeza abajo con estilo.' });
add({ id: 'arco_boreal', name: 'Arco Boreal', slot: 'weapon', icon: 'bow', type: 'ranged', element: 'hielo',
  min: 19, max: 26, acc: 10, lvl: 9, price: 700, rare: true, desc: 'Dispara con colores de aurora.' });
add({ id: 'capa_escarcha', name: 'Capa de Escarcha', slot: 'armor', icon: 'armor', element: 'hielo',
  def: 14, resist: { hielo: -50, fuego: 20 }, lvl: 10, price: 720, rare: true, desc: 'Fresquita en verano. Odia el fuego.' });
add({ id: 'garrote_yeti', name: 'Garrote del Yeti', slot: 'weapon', icon: 'sword', type: 'melee', element: 'hielo',
  min: 24, max: 32, lvl: 11, price: 900, rare: true, desc: 'Un carámbano del tamaño de un poste.' });
add({ id: 'chillido_sombrio', name: 'Chillido Sombrío', slot: 'spell', icon: 'orb', element: 'oscuridad',
  min: 30, max: 40, mp: 15, lvl: 12, price: 950, rare: true, desc: 'Molesta a enemigos y vecinos por igual.' });
add({ id: 'hueso_afilado', name: 'Hueso Afilado', slot: 'weapon', icon: 'sword', type: 'melee', element: 'oscuridad',
  min: 28, max: 38, lvl: 13, price: 1100, rare: true, desc: 'Su dueño anterior ya no lo necesitaba.' });
add({ id: 'sabana_embrujada', name: 'Sábana Embrujada', slot: 'armor', icon: 'armor', element: 'oscuridad',
  def: 18, resist: { oscuridad: -50, luz: 25 }, lvl: 13, price: 1200, rare: true, desc: 'Recién lavada. Sigue embrujada.' });

// ---------- Consumibles ----------
add({ id: 'pocion_vida', name: 'Poción de Vida', slot: 'consumable', icon: 'potion', heal: 'hp', amount: 0.45,
  price: 18, shop: 'magia', tint: { a: '#ef7d57', b: '#b13e53', c: '#ffcd75' }, desc: 'Recupera 45 % de la vida. Sabe a frutilla.' });
add({ id: 'pocion_mana', name: 'Poción de Maná', slot: 'consumable', icon: 'potion', heal: 'mp', amount: 0.5,
  price: 18, shop: 'magia', tint: { a: '#41a6f6', b: '#3b5dc9', c: '#a6e6ff' }, desc: 'Recupera 50 % del maná. Sabe a lunes.' });

export const MAX_CONSUMABLE = 10;

export const SLOT_NAMES = { weapon: 'Arma', armor: 'Armadura', spell: 'Hechizo', consumable: 'Consumible' };
export const ATTACK_TYPE_NAMES = { melee: 'Cuerpo a cuerpo', ranged: 'A distancia' };
