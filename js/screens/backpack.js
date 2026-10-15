// Tu casa: el héroe aparece con el equipo puesto y el pergamino muestra la ficha y el inventario.

import { h, pick } from '../util.js';
import { itemStats, updateHud, elementChip } from '../ui.js';
import { interiorScreen, ribbons } from './interior.js';
import { building } from '../data/town.js';
import { ITEMS, SLOT_NAMES, ATTACK_TYPE_NAMES } from '../data/items.js';
import { ELEMENTS } from '../data/elements.js';
import { heroCanvas, itemIcon } from '../sprites.js';
import {
  STAT_IDS, STAT_INFO, equip, sell, sellPrice, isEquipped, meetsLevel, spendPoint,
  critChance, equippedItem, playerDefense, playerResist, maxHp, maxMp,
} from '../state.js';

const TABS = [['ficha', 'Ficha'], ['weapon', 'Armas'], ['armor', 'Armaduras'], ['spell', 'Hechizos'], ['consumable', 'Pociones']];

export function backpackScreen(game) {
  const p = game.player;
  const b = building('mochila');
  let tab = p.statPoints > 0 ? 'ficha' : 'weapon';
  let confirmSell = null;
  const hero = () => heroCanvas(equippedItem(p, 'weapon'), equippedItem(p, 'armor'));

  const greeting = p.statPoints > 0
    ? `Tenés ${p.statPoints} puntos de atributo para repartir. Están en la ficha.`
    : pick(b.lines);
  const { view, stage, dialog, scrollBody } = interiorScreen(game, {
    roomId: 'mochila', speaker: p.name, greeting, title: b.name, state: { hero: hero() },
  });

  function afterChange(message) {
    game.save();
    updateHud(game);
    stage.state.hero = hero();
    stage.redraw();
    if (message) dialog.say(message);
    render();
  }

  function render() {
    const content = tab === 'ficha' ? sheet() : tab === 'consumable' ? potions() : inventory(tab);
    scrollBody.replaceChildren(ribbons(TABS, tab, (id) => { tab = id; confirmSell = null; render(); }), content);
  }

  // ---- Ficha: equipo puesto, números de combate y atributos ----
  function sheet() {
    const weapon = equippedItem(p, 'weapon');
    const spell = equippedItem(p, 'spell');
    const attackStat = weapon.type === 'ranged' ? p.stats.des : p.stats.fue;
    const bonus = Math.round(attackStat * 1.2 + p.level);
    const spellBonus = Math.round(p.stats.int * 1.4 + p.level);
    const notable = Object.entries(playerResist(p)).filter(([, v]) => v !== 100);

    return h('div', { class: 'sheet' },
      h('div', { class: 'equip-list' },
        ...['weapon', 'armor', 'spell'].map((slot) => {
          const it = equippedItem(p, slot);
          return h('div', { class: 'equip-line' },
            h('span', { class: 'ware-icon' }, itemIcon(it)),
            h('span', { class: 'ware-info' },
              h('span', { class: 'equip-slot-name' }, SLOT_NAMES[slot]),
              h('span', { class: 'ware-name' }, it.name, it.element !== 'neutral' ? elementChip(it.element, true) : null)));
        })),
      h('dl', { class: 'numbers' },
        num('Arma', `${weapon.min + bonus}–${weapon.max + bonus}`, `${ATTACK_TYPE_NAMES[weapon.type]} · ${ELEMENTS[weapon.element].name}`),
        num('Hechizo', `${spell.min + spellBonus}–${spell.max + spellBonus}`, `${spell.mp} MP · ${ELEMENTS[spell.element].name}`),
        num('Crítico', `${Math.round(critChance(p) * 100)} %`, 'Daño ×1,6'),
        num('Defensa', playerDefense(p), notable.length ? notable.map(([el, v]) => `${ELEMENTS[el].name} ${v} %`).join(' · ') : 'Sin resistencias elementales'),
        num('Vida / Maná', `${maxHp(p)} / ${maxMp(p)}`, 'Máximos')),
      h('h2', { class: 'ware-level' }, p.statPoints > 0 ? `Atributos · ${p.statPoints} puntos para repartir` : 'Atributos'),
      h('div', { class: 'wares' },
        ...STAT_IDS.map((id) => h('div', { class: 'ware' },
          h('span', { class: 'stat-badge' }, STAT_INFO[id].short),
          h('span', { class: 'ware-info' },
            h('span', { class: 'ware-name' }, `${STAT_INFO[id].name} `, h('strong', { class: 'stat-num' }, p.stats[id])),
            h('span', { class: 'ware-stats' }, STAT_INFO[id].desc)),
          p.statPoints > 0
            ? h('span', { class: 'ware-buy' }, h('button', {
              type: 'button', class: 'seal', id: `point-${id}`, title: `Sumar 1 a ${STAT_INFO[id].name}`,
              onclick: () => { spendPoint(p, id); afterChange(`+1 de ${STAT_INFO[id].name}. Se nota.`); },
            }, '+1'))
            : null))));
  }

  function inventory(slot) {
    const items = p.inventory.map((id) => ITEMS[id]).filter((it) => it.slot === slot)
      .sort((a, z) => a.lvl - z.lvl || a.name.localeCompare(z.name));
    if (!items.length) return h('p', { class: 'scroll-note' }, 'Nada por acá todavía. Pasá por las tiendas o salí a cazar.');
    return h('div', { class: 'wares' },
      ...items.map((item) => {
        const equipped = isEquipped(p, item.id);
        const confirming = confirmSell === item.id;
        const actions = equipped
          ? [h('span', { class: 'ware-owned' }, 'Puesto')]
          : [
            h('button', {
              type: 'button', class: 'seal', disabled: !meetsLevel(p, item),
              title: meetsLevel(p, item) ? `Equipar ${item.name}` : `Necesitás nivel ${item.lvl}`,
              onclick: () => { const res = equip(p, item.id); afterChange(res.ok ? `Te pusiste ${item.name}. Te queda pintado.` : res.msg); },
            }, 'Equipar'),
            h('button', {
              type: 'button', class: `seal seal-ghost${confirming ? ' is-danger' : ''}`,
              onclick: () => {
                if (!confirming) { confirmSell = item.id; dialog.say(`¿Vender ${item.name} por ${sellPrice(item)} de oro? Tocá de nuevo para confirmar.`); render(); return; }
                const res = sell(p, item.id);
                confirmSell = null;
                afterChange(res.msg);
              },
            }, confirming ? `¿Seguro? +${sellPrice(item)}` : `Vender ${sellPrice(item)}`),
          ];
        return h('div', { class: `ware${item.rare ? ' is-rare' : ''}${equipped ? ' is-selected' : ''}` },
          h('span', { class: 'ware-icon' }, itemIcon(item)),
          h('span', { class: 'ware-info' },
            h('span', { class: 'ware-name' }, item.name, item.element !== 'neutral' ? elementChip(item.element, true) : null,
              item.rare ? h('span', { class: 'tag tag-rare' }, 'Raro') : null),
            h('span', { class: `ware-stats${meetsLevel(p, item) ? '' : ' is-low'}` }, itemStats(item), item.lvl > 1 ? ` · Nv ${item.lvl}` : '')),
          h('span', { class: 'ware-buy ware-buy-col' }, ...actions));
      }));
  }

  function potions() {
    return h('div', { class: 'wares' },
      ...Object.entries(p.consumables).map(([id, n]) => {
        const item = ITEMS[id];
        return h('div', { class: 'ware' },
          h('span', { class: 'ware-icon' }, itemIcon(item)),
          h('span', { class: 'ware-info' }, h('span', { class: 'ware-name' }, item.name), h('span', { class: 'ware-stats' }, itemStats(item))),
          h('span', { class: 'ware-buy' }, h('span', { class: 'ware-price' }, `×${n}`)));
      }),
      h('p', { class: 'scroll-note' }, 'Las pociones se usan en combate. Madame Chispas vende más.'));
  }

  render();
  return view;
}

function num(label, value, detail) {
  return h('div', { class: 'num' },
    h('dt', null, label),
    h('dd', null, h('strong', null, value), h('span', null, detail)));
}

