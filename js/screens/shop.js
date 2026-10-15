import { h, pick } from '../util.js';
import { screen, npcHeader, itemRow, button, backButton, tabs, toast, elementChip } from '../ui.js';
import { BUILDINGS } from '../data/town.js';
import { ITEMS, MAX_CONSUMABLE } from '../data/items.js';
import { ELEMENT_IDS } from '../data/elements.js';
import { buy, buyPrice, owns } from '../state.js';

const SHOP_TABS = {
  herrero: [['weapon', 'Armas'], ['armor', 'Armaduras']],
  magia: [['spell', 'Hechizos'], ['consumable', 'Pociones']],
};

export function shopScreen(game, params = {}) {
  const shopId = params.shopId;
  const p = game.player;
  const building = BUILDINGS.find((b) => b.id === shopId);
  const tab = params.tab ?? SHOP_TABS[shopId][0][0];
  const filter = params.filter ?? 'todos';
  const line = params.line ?? pick(building.lines);
  const nav = (next) => game.go(shopId, { tab, filter, line, ...next });

  const stock = Object.values(ITEMS)
    .filter((it) => it.shop === shopId && it.slot === tab)
    .filter((it) => filter === 'todos' || it.element === filter)
    .sort((a, b) => a.lvl - b.lvl || a.price - b.price || a.name.localeCompare(b.name));

  const showFilter = tab !== 'consumable';
  const filterBar = showFilter
    ? h('div', { class: 'filters', role: 'group', 'aria-label': 'Filtrar por elemento' },
      h('button', { type: 'button', class: `filter${filter === 'todos' ? ' is-active' : ''}`, onclick: () => nav({ filter: 'todos' }) }, 'Todos'),
      ...['neutral', ...ELEMENT_IDS].map((el) => h('button', {
        type: 'button', class: `filter${filter === el ? ' is-active' : ''}`, onclick: () => nav({ filter: el }),
      }, elementChip(el, true))))
    : null;

  const rows = stock.map((item) => {
    const price = buyPrice(p, item);
    let action;
    if (item.slot === 'consumable') {
      const have = p.consumables[item.id] ?? 0;
      action = button(`Comprar · ${price}`, () => purchase(item), { disabled: have >= MAX_CONSUMABLE || p.gold < price, variant: 'buy' });
      return itemRow(item, { player: p, actions: [action], tags: [h('span', { class: 'tag' }, `Tenés ${have}/${MAX_CONSUMABLE}`)] });
    }
    if (owns(p, item.id)) action = h('span', { class: 'owned' }, 'Ya lo tenés');
    else action = button(`Comprar · ${price}`, () => purchase(item), { disabled: p.gold < price, variant: 'buy' });
    return itemRow(item, { player: p, actions: [action] });
  });

  function purchase(item) {
    const res = buy(p, item.id);
    toast(res.msg, res.ok ? 'good' : 'bad');
    if (res.ok) {
      game.save();
      game.refresh();
    }
  }

  return screen(game, 'shop-screen',
    npcHeader(building, line),
    tabs(SHOP_TABS[shopId], tab, (id) => nav({ tab: id, filter: 'todos' })),
    filterBar,
    h('section', { class: 'item-list panel' },
      rows.length ? rows : h('p', { class: 'empty' }, 'No hay nada de ese elemento por ahora. Volvé la semana que viene.')),
    h('p', { class: 'hint' }, 'Para equipar o vender lo que compraste, abrí tu mochila.'),
    h('div', { class: 'row-actions' }, backButton(game), button('Abrir mochila', () => game.go('mochila'), { variant: 'ghost' })));
}
