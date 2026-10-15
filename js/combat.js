// Lógica de combate por turnos, sin nada de interfaz.
// Cada acción modifica el estado y devuelve una lista de eventos que la pantalla reproduce en orden.

import { ITEMS } from './data/items.js';
import { MONSTERS } from './data/monsters.js';
import { ELEMENTS, makeResist, effectivenessText } from './data/elements.js';
import { randInt, randRange, chance, clamp } from './util.js';
import {
  maxHp, maxMp, critChance, equippedItem, playerDefense, playerResist, addXp,
} from './state.js';

const CRIT_MULT = 1.6;
const armorFactor = (def) => 1 - def / (def + 40);

export function createEnemy(monsterId, level) {
  const m = MONSTERS[monsterId];
  const hp = Math.round((26 + level * 12) * (m.hp ?? 1));
  return {
    id: monsterId,
    name: m.name,
    sprite: m.sprite,
    element: m.element,
    level,
    hp,
    maxHp: hp,
    dex: Math.round((4 + level * 0.9) * (m.dex ?? 1)),
    armor: Math.round(level * 1.5 * (m.armor ?? 1)),
    power: (4 + level * 2.6) * (m.atk ?? 1),
    resist: makeResist(m.element, m.resist),
  };
}

// Elige un monstruo de la zona, favoreciendo los que están cerca del nivel del jugador.
function pickEncounter(player, zone) {
  const weights = zone.monsters.map((id) => (MONSTERS[id].level <= player.level + 1 ? 3 : 1));
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  const index = weights.findIndex((w) => (roll -= w) < 0);
  const monsterId = zone.monsters[index < 0 ? 0 : index];
  const base = MONSTERS[monsterId].level;
  const bump = base < player.level + 2 && chance(0.4) ? 1 : 0;
  return { monsterId, level: clamp(base + bump, zone.min, zone.max) };
}

export function startBattle(player, zone) {
  const { monsterId, level } = pickEncounter(player, zone);
  const battle = { zoneId: zone.id, enemy: createEnemy(monsterId, level), turn: 1, over: false, result: null };
  const events = [{ type: 'log', text: `¡Apareció ${battle.enemy.name} (Nv ${level})!` }];

  const playerInit = player.stats.des + randInt(0, 4);
  const enemyInit = battle.enemy.dex + randInt(0, 4);
  if (enemyInit > playerInit) {
    events.push({ type: 'log', text: `${battle.enemy.name} es más rápido y ataca primero.` });
    enemyTurn(player, battle, events);
  } else {
    events.push({ type: 'log', text: 'Sos más rápido: empezás vos.' });
  }
  return { battle, events };
}

// ---------- Turno del jugador ----------
// action: { type: 'attack' } | { type: 'spell' } | { type: 'item', id } | { type: 'flee' }
export function playerTurn(player, battle, action) {
  const events = [];
  if (battle.over) return events;
  const e = battle.enemy;

  if (action.type === 'attack') {
    const weapon = equippedItem(player, 'weapon');
    const stat = weapon.type === 'ranged' ? player.stats.des : player.stats.fue;
    events.push({ type: 'act', who: 'player', kind: weapon.type });
    const hit = clamp(0.88 + (player.stats.des - e.dex) * 0.012 + (weapon.acc ?? 0) / 100, 0.55, 0.98);
    if (!chance(hit)) {
      events.push({ type: 'miss', target: 'enemy', text: `${e.name} esquivó tu ${weapon.name}.` });
    } else {
      const raw = randInt(weapon.min, weapon.max) + stat * 1.2 + player.level;
      hitEnemy(battle, raw * armorFactor(e.armor), weapon.element, critChance(player), weapon.name, events);
    }
  } else if (action.type === 'spell') {
    const spell = equippedItem(player, 'spell');
    if (player.mp < spell.mp) {
      events.push({ type: 'log', text: `No te alcanza el maná para ${spell.name}.`, noTurn: true });
      return events;
    }
    player.mp -= spell.mp;
    events.push({ type: 'act', who: 'player', kind: 'spell', element: spell.element });
    events.push({ type: 'resource', stat: 'mp' });
    const raw = randInt(spell.min, spell.max) + player.stats.int * 1.4 + player.level;
    hitEnemy(battle, raw, spell.element, critChance(player), spell.name, events);
  } else if (action.type === 'item') {
    const item = ITEMS[action.id];
    if (!(player.consumables[action.id] > 0)) {
      events.push({ type: 'log', text: `No te quedan: ${item.name}.`, noTurn: true });
      return events;
    }
    player.consumables[action.id] -= 1;
    const max = item.heal === 'hp' ? maxHp(player) : maxMp(player);
    const before = player[item.heal];
    player[item.heal] = Math.min(max, before + Math.round(max * item.amount));
    events.push({
      type: 'heal', target: 'player', stat: item.heal, amount: player[item.heal] - before,
      text: `Tomaste ${item.name}.`,
    });
  } else if (action.type === 'flee') {
    const odds = clamp(0.55 + (player.stats.des - e.dex) * 0.03, 0.2, 0.9);
    if (chance(odds)) {
      battle.over = true;
      battle.result = 'flee';
      events.push({ type: 'log', text: 'Huiste con más velocidad que dignidad.' });
      events.push({ type: 'end', result: 'flee' });
      return events;
    }
    events.push({ type: 'log', text: `¡${e.name} te cerró el paso!` });
  }

  if (e.hp <= 0) {
    battle.over = true;
    battle.result = 'win';
    events.push({ type: 'log', text: `¡Derrotaste a ${e.name}!` });
    events.push({ type: 'end', result: 'win' });
    return events;
  }

  enemyTurn(player, battle, events);
  battle.turn += 1;
  return events;
}

function hitEnemy(battle, raw, element, critOdds, sourceName, events) {
  const e = battle.enemy;
  const mult = (e.resist[element] ?? 100) / 100;
  const crit = mult > 0 && chance(critOdds);
  let amount = raw * randRange(0.9, 1.1) * mult * (crit ? CRIT_MULT : 1);
  amount = mult === 0 ? 0 : Math.max(1, Math.round(amount));
  e.hp = Math.max(0, e.hp - amount);
  const parts = [`${sourceName}: ${amount} de daño${element !== 'neutral' ? ` de ${ELEMENTS[element].name}` : ''}.`];
  if (crit) parts.unshift('¡Crítico!');
  const eff = effectivenessText(mult);
  if (eff) parts.push(eff);
  events.push({ type: 'damage', target: 'enemy', amount, crit, mult, element, text: parts.join(' ') });
}

// ---------- Turno del enemigo ----------
function enemyTurn(player, battle, events) {
  const e = battle.enemy;
  const m = MONSTERS[e.id];
  const specials = m.attacks.filter((a) => a.chance);
  const attack = specials.find((a) => chance(a.chance)) ?? m.attacks[0];
  const element = attack.element ?? e.element;
  events.push({ type: 'act', who: 'enemy', kind: 'melee', element });

  const hit = clamp(0.85 + (e.dex - player.stats.des) * 0.012, 0.5, 0.95);
  if (!chance(hit)) {
    events.push({ type: 'miss', target: 'player', text: `Esquivaste ${attack.name}.` });
    return;
  }
  const mult = (playerResist(player)[element] ?? 100) / 100;
  const crit = chance(0.05);
  let amount = e.power * (attack.power ?? 1) * randRange(0.8, 1.2) * mult * armorFactor(playerDefense(player));
  amount = Math.max(1, Math.round(amount * (crit ? CRIT_MULT : 1)));
  player.hp = Math.max(0, player.hp - amount);
  const text = `${crit ? '¡Crítico! ' : ''}${e.name} usó ${attack.name}: ${amount} de daño.`;
  events.push({ type: 'damage', target: 'player', amount, crit, mult, element, text });

  if (player.hp <= 0) {
    battle.over = true;
    battle.result = 'lose';
    events.push({ type: 'log', text: 'Todo se pone oscuro...' });
    events.push({ type: 'end', result: 'lose' });
  }
}

// ---------- Recompensas ----------
export function applyRewards(player, battle) {
  const e = battle.enemy;
  const m = MONSTERS[e.id];
  const luck = Math.max(0, player.stats.sue - 5);
  const xp = Math.round((10 * Math.pow(e.level, 1.3) + 5) * (m.xp ?? 1));
  const gold = Math.round((6 + e.level * 5) * randRange(0.85, 1.15) * (1 + luck * 0.01) * (m.gold ?? 1));

  player.gold += gold;
  player.kills[e.id] = (player.kills[e.id] ?? 0) + 1;

  const drops = [];
  for (const d of m.drops ?? []) {
    if (!chance(d.chance * (1 + luck * 0.03))) continue;
    const item = ITEMS[d.id];
    if (player.inventory.includes(d.id)) {
      const value = Math.floor(item.price / 4);
      player.gold += value;
      drops.push({ item, duplicate: true, value });
    } else {
      player.inventory.push(d.id);
      drops.push({ item, duplicate: false });
    }
  }
  const levels = addXp(player, xp);
  return { xp, gold, drops, levels };
}

export function applyDefeat(player) {
  player.hp = Math.max(1, Math.round(maxHp(player) / 2));
  player.mp = Math.max(player.mp, Math.round(maxMp(player) / 2));
}
