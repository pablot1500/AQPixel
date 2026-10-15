import { h } from '../util.js';
import { screen, itemRow, button, backButton, tabs, toast, elementChip } from '../ui.js';
import { ITEMS, SLOT_NAMES, ATTACK_TYPE_NAMES } from '../data/items.js';
import { ELEMENTS } from '../data/elements.js';
import { heroCanvas } from '../sprites.js';
import {
  STAT_IDS, STAT_INFO, equip, sell, sellPrice, isEquipped, meetsLevel, spendPoint,
  critChance, equippedItem, playerDefense, playerResist, maxHp, maxMp,
} from '../state.js';

const INV_TABS = [['weapon', 'Armas'], ['armor', 'Armaduras'], ['spell', 'Hechizos'], ['consumable', 'Pociones']];

export function backpackScreen(game, params = {}) {
  const p = game.player;
  const tab = params.tab ?? 'weapon';
  const confirmSell = params.confirmSell;
  const nav = (next) => game.go('mochila', { tab, ...next });
  const weapon = equippedItem(p, 'weapon');
  const armor = equippedItem(p, 'armor');
  const spell = equippedItem(p, 'spell');

  // ---- Atributos ----
  const statRows = STAT_IDS.map((id) => h('div', { class: 'stat-row' },
    h('span', { class: 'stat-short' }, STAT_INFO[id].short),
    h('span', { class: 'stat-value' }, p.stats[id]),
    h('div', { class: 'stat-info' }, h('strong', null, STAT_INFO[id].name), h('span', null, STAT_INFO[id].desc)),
    p.statPoints > 0
      ? button('+1', () => { spendPoint(p, id); game.save(); game.refresh(); }, { variant: 'buy', title: `Sumar 1 a ${STAT_INFO[id].name}` })
      : null));

  // ---- Resumen de combate ----
  const attackStat = weapon.type === 'ranged' ? p.stats.des : p.stats.fue;
  const bonus = Math.round(attackStat * 1.2 + p.level);
  const spellBonus = Math.round(p.stats.int * 1.4 + p.level);
  const resist = playerResist(p);
  const notable = Object.entries(resist).filter(([, v]) => v !== 100);

  const summary = h('div', { class: 'combat-summary' },
    summaryLine('Arma', `${weapon.min + bonus}–${weapon.max + bonus}`, `${ATTACK_TYPE_NAMES[weapon.type]} · ${ELEMENTS[weapon.element].name}`),
    summaryLine('Hechizo', `${spell.min + spellBonus}–${spell.max + spellBonus}`, `${spell.mp} MP · ${ELEMENTS[spell.element].name}`),
    summaryLine('Crítico', `${Math.round(critChance(p) * 100)} %`, 'Daño ×1,6'),
    summaryLine('Defensa', playerDefense(p), notable.length
      ? notable.map(([el, v]) => `${ELEMENTS[el].name} ${v} %`).join(' · ')
      : 'Sin resistencias elementales'),
    summaryLine('Vida / Maná', `${maxHp(p)} / ${maxMp(p)}`, 'Máximos'));

  // ---- Inventario ----
  let list;
  if (tab === 'consumable') {
    list = Object.entries(p.consumables).map(([id, n]) => itemRow(ITEMS[id], {
      player: p, tags: [h('span', { class: 'tag' }, `×${n}`)],
    }));
  } else {
    list = p.inventory.map((id) => ITEMS[id]).filter((it) => it.slot === tab)
      .sort((a, b) => a.lvl - b.lvl || a.name.localeCompare(b.name))
      .map((item) => {
        const actions = [];
        if (isEquipped(p, item.id)) {
          actions.push(h('span', { class: 'equipped' }, 'Equipado'));
        } else {
          actions.push(button('Equipar', () => {
            const res = equip(p, item.id);
            toast(res.msg, res.ok ? 'good' : 'bad');
            if (res.ok) { game.save(); game.refresh(); }
          }, { variant: 'primary', disabled: !meetsLevel(p, item) }));
          const confirming = confirmSell === item.id;
          actions.push(button(confirming ? `¿Seguro? +${sellPrice(item)}` : `Vender · ${sellPrice(item)}`, () => {
            if (!confirming) { nav({ confirmSell: item.id }); return; }
            const res = sell(p, item.id);
            toast(res.msg, res.ok ? 'good' : 'bad');
            game.save();
            nav({ confirmSell: null });
          }, { variant: confirming ? 'danger' : 'ghost' }));
        }
        return itemRow(item, { player: p, actions });
      });
  }

  return screen(game, 'backpack-screen',
    h('div', { class: 'backpack-top' },
      h('section', { class: 'panel hero-card' },
        heroCanvas(weapon, armor, 'px hero-portrait'),
        h('div', { class: 'equip-slots' },
          equipSlot('weapon', weapon), equipSlot('armor', armor), equipSlot('spell', spell))),
      h('section', { class: 'panel' }, h('h2', { class: 'section-title' }, 'En combate'), summary)),
    h('section', { class: 'panel stats-table' },
      h('h2', { class: 'section-title' }, 'Atributos',
        p.statPoints > 0 ? h('span', { class: 'pill pill-alert' }, `${p.statPoints} para repartir`) : null),
      ...statRows),
    h('h2', { class: 'section-title' }, 'Inventario'),
    tabs(INV_TABS, tab, (id) => nav({ tab: id, confirmSell: null })),
    h('section', { class: 'item-list panel' }, list.length ? list : h('p', { class: 'empty' }, 'Nada por acá todavía.')),
    h('p', { class: 'hint' }, 'Vender devuelve un cuarto del precio. Lo equipado no se puede vender.'),
    h('div', { class: 'row-actions' },
      backButton(game),
      button('Ir a la puerta', () => game.go('mapa'), { variant: 'ghost' })));
}

function equipSlot(slot, item) {
  return h('div', { class: 'equip-slot' },
    h('span', { class: 'equip-label' }, SLOT_NAMES[slot]),
    h('span', { class: 'equip-name' }, item.name),
    item.element !== 'neutral' ? elementChip(item.element, true) : null);
}

function summaryLine(label, value, detail) {
  return h('div', { class: 'summary-line' },
    h('span', { class: 'summary-label' }, label),
    h('span', { class: 'summary-value' }, value),
    h('span', { class: 'summary-detail' }, detail));
}
