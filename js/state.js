// Estado del jugador, fórmulas derivadas y guardado local.

import { ITEMS, MAX_CONSUMABLE } from './data/items.js';
import { makeResist } from './data/elements.js';

const SAVE_KEY = 'aqpixel.save.v1';
export const LEVEL_CAP = 20;
export const POINTS_PER_LEVEL = 3;

export const STAT_IDS = ['fue', 'des', 'int', 'res', 'car', 'sue'];
export const STAT_INFO = {
  fue: { name: 'Fuerza', short: 'FUE', desc: 'Daño cuerpo a cuerpo' },
  des: { name: 'Destreza', short: 'DES', desc: 'Precisión, evasión, iniciativa y daño a distancia' },
  int: { name: 'Inteligencia', short: 'INT', desc: 'Daño mágico y maná máximo' },
  res: { name: 'Resistencia', short: 'RES', desc: 'Vida máxima' },
  car: { name: 'Carisma', short: 'CAR', desc: 'Descuentos en tiendas (mascotas en la Fase 2)' },
  sue: { name: 'Suerte', short: 'SUE', desc: 'Críticos, oro extra y botín raro' },
};

export function newPlayer(name) {
  const p = {
    version: 1,
    name: name.trim().slice(0, 16) || 'Aventurero',
    level: 1,
    xp: 0,
    gold: 60,
    statPoints: 0,
    trained: 0,
    stats: { fue: 5, des: 5, int: 5, res: 5, car: 5, sue: 5 },
    equipment: { weapon: 'espada_madera', armor: 'ropa_aventurero', spell: 'chispa' },
    inventory: ['espada_madera', 'ropa_aventurero', 'chispa'],
    consumables: { pocion_vida: 3, pocion_mana: 1 },
    kills: {},
    hp: 0,
    mp: 0,
  };
  p.hp = maxHp(p);
  p.mp = maxMp(p);
  return p;
}

// ---------- Derivados ----------
export const maxHp = (p) => 40 + p.level * 10 + p.stats.res * 6;
export const maxMp = (p) => 10 + p.level * 3 + p.stats.int * 3;
export const xpToNext = (level) => Math.round(25 * Math.pow(level, 1.6));
export const critChance = (p) => 0.04 + p.stats.sue * 0.006;
export const equippedItem = (p, slot) => ITEMS[p.equipment[slot]];

export function playerDefense(p) {
  return equippedItem(p, 'armor')?.def ?? 0;
}

export function playerResist(p) {
  const r = makeResist('neutral');
  const armor = equippedItem(p, 'armor');
  for (const [el, mod] of Object.entries(armor?.resist ?? {})) r[el] += mod;
  return r;
}

const priceMult = (p) => 1 - Math.min(0.2, Math.max(0, p.stats.car - 5) * 0.01);
export const buyPrice = (p, item) => Math.max(1, Math.round(item.price * priceMult(p)));
export const sellPrice = (item) => Math.floor(item.price / 4);
export const trainCost = (p) => 30 + p.trained * 25;
export const innCost = (p) => 5 + p.level * 3;

export function clampResources(p) {
  p.hp = Math.min(Math.max(p.hp, 0), maxHp(p));
  p.mp = Math.min(Math.max(p.mp, 0), maxMp(p));
}

export function healFull(p) {
  p.hp = maxHp(p);
  p.mp = maxMp(p);
}

// ---------- Inventario y tienda ----------
export const owns = (p, id) => p.inventory.includes(id);
export const meetsLevel = (p, item) => p.level >= (item.lvl ?? 1);
export const isEquipped = (p, id) => Object.values(p.equipment).includes(id);

export function buy(p, id) {
  const item = ITEMS[id];
  const cost = buyPrice(p, item);
  if (p.gold < cost) return { ok: false, msg: 'No te alcanza el oro.' };
  if (item.slot === 'consumable') {
    const have = p.consumables[id] ?? 0;
    if (have >= MAX_CONSUMABLE) return { ok: false, msg: `Llevás el máximo (${MAX_CONSUMABLE}).` };
    p.consumables[id] = have + 1;
  } else {
    if (owns(p, id)) return { ok: false, msg: 'Ya lo tenés.' };
    p.inventory.push(id);
  }
  p.gold -= cost;
  return { ok: true, msg: `Compraste ${item.name}.` };
}

export function sell(p, id) {
  const item = ITEMS[id];
  if (isEquipped(p, id)) return { ok: false, msg: 'Primero sacátelo.' };
  const i = p.inventory.indexOf(id);
  if (i < 0) return { ok: false, msg: 'No lo tenés.' };
  p.inventory.splice(i, 1);
  const value = sellPrice(item);
  p.gold += value;
  return { ok: true, msg: `Vendiste ${item.name} por ${value} de oro.` };
}

export function equip(p, id) {
  const item = ITEMS[id];
  if (!meetsLevel(p, item)) return { ok: false, msg: `Necesitás nivel ${item.lvl}.` };
  p.equipment[item.slot] = id;
  clampResources(p);
  return { ok: true, msg: `Equipaste ${item.name}.` };
}

// ---------- Progresión ----------
export function addXp(p, amount) {
  let levels = 0;
  if (p.level >= LEVEL_CAP) return levels;
  p.xp += amount;
  while (p.level < LEVEL_CAP && p.xp >= xpToNext(p.level)) {
    p.xp -= xpToNext(p.level);
    p.level += 1;
    p.statPoints += POINTS_PER_LEVEL;
    levels += 1;
  }
  if (p.level >= LEVEL_CAP) p.xp = 0;
  if (levels) healFull(p);
  return levels;
}

export function spendPoint(p, stat) {
  if (p.statPoints <= 0) return false;
  const hpBefore = maxHp(p);
  const mpBefore = maxMp(p);
  p.stats[stat] += 1;
  p.statPoints -= 1;
  p.hp += maxHp(p) - hpBefore;
  p.mp += maxMp(p) - mpBefore;
  return true;
}

export function train(p, stat) {
  const cost = trainCost(p);
  if (p.gold < cost) return { ok: false, msg: 'No te alcanza el oro.' };
  p.gold -= cost;
  p.trained += 1;
  p.statPoints += 1;
  spendPoint(p, stat);
  return { ok: true, msg: `+1 ${STAT_INFO[stat].name}. ¡Se nota el músculo!` };
}

// ---------- Guardado ----------
export function save(p) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return null;
    const p = { ...newPlayer(data.name), ...data };
    // Descarta objetos que ya no existen en el catálogo.
    p.inventory = p.inventory.filter((id) => ITEMS[id]);
    for (const [slot, id] of Object.entries(p.equipment)) {
      if (!ITEMS[id]) p.equipment[slot] = newPlayer('x').equipment[slot];
      if (!p.inventory.includes(p.equipment[slot])) p.inventory.push(p.equipment[slot]);
    }
    clampResources(p);
    return p;
  } catch {
    return null;
  }
}

export function wipe() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* sin almacenamiento disponible */
  }
}
