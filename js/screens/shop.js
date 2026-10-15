import { h, pick } from '../util.js';
import { itemStats, updateHud, elementChip } from '../ui.js';
import { interiorScreen, ribbons } from './interior.js';
import { building } from '../data/town.js';
import { ITEMS, MAX_CONSUMABLE } from '../data/items.js';
import { ELEMENTS, ELEMENT_IDS } from '../data/elements.js';
import { itemIcon, iconCanvas } from '../sprites.js';
import { buy, buyPrice, owns } from '../state.js';

const SHOP_TABS = {
  herrero: [['weapon', 'Armas'], ['armor', 'Armaduras']],
  magia: [['spell', 'Hechizos'], ['consumable', 'Pociones']],
};
const ROOM = { herrero: 'herrero', magia: 'magia' };

export function shopScreen(game, { shopId }) {
  const p = game.player;
  const b = building(shopId);
  let tab = SHOP_TABS[shopId][0][0];
  let filter = 'todos';
  let selected = null;

  const { view, dialog, scrollBody } = interiorScreen(game, {
    roomId: ROOM[shopId], speaker: b.owner, greeting: pick(b.lines), title: b.name,
  });

  function describe(item) {
    selected = item.id;
    let msg = `${item.name}: ${itemStats(item)}. ${item.desc}`;
    if (item.slot !== 'consumable' && owns(p, item.id)) msg = pick(b.owned ?? ['Ya lo tenés.']);
    else if ((item.lvl ?? 1) > p.level) msg += ` Ojo: lo vas a poder usar recién en nivel ${item.lvl}.`;
    dialog.say(msg);
    render();
  }

  function purchase(item) {
    const res = buy(p, item.id);
    if (res.ok) {
      game.save();
      updateHud(game);
      dialog.say(pick(b.thanks));
    } else if (res.msg.includes('máximo')) {
      dialog.say(pick(b.full ?? [res.msg]));
    } else if (res.msg.includes('Ya lo')) {
      dialog.say(pick(b.owned ?? [res.msg]));
    } else {
      dialog.say(pick(b.poor));
    }
    render();
  }

  function render() {
    const stock = Object.values(ITEMS)
      .filter((it) => it.shop === shopId && it.slot === tab)
      .filter((it) => filter === 'todos' || it.element === filter)
      .sort((a, z) => a.lvl - z.lvl || a.price - z.price || a.name.localeCompare(z.name));

    const groups = new Map();
    for (const item of stock) {
      const key = item.lvl ?? 1;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    const gems = tab === 'consumable' ? null : h('div', { class: 'gems', role: 'group', 'aria-label': 'Filtrar por elemento' },
      h('button', { type: 'button', class: `gem gem-all${filter === 'todos' ? ' is-active' : ''}`, title: 'Todos', 'aria-label': 'Todos', onclick: () => { filter = 'todos'; render(); } }),
      ...['neutral', ...ELEMENT_IDS].map((el) => h('button', {
        type: 'button', class: `gem${filter === el ? ' is-active' : ''}`, style: { '--el': ELEMENTS[el].color },
        title: ELEMENTS[el].name, 'aria-label': ELEMENTS[el].name, onclick: () => { filter = el; render(); },
      })));

    const list = [...groups.entries()].map(([lvl, items]) => h('section', { class: 'ware-group' },
      h('h2', { class: 'ware-level' }, lvl > 1 ? `Desde nivel ${lvl}` : 'Para empezar'),
      ...items.map((item) => wareRow(item))));

    scrollBody.replaceChildren(...[
      ribbons(SHOP_TABS[shopId], tab, (id) => { tab = id; filter = 'todos'; render(); }),
      gems,
      gems && filter !== 'todos' ? h('p', { class: 'scroll-note' }, `Mostrando: ${ELEMENTS[filter].name}`) : null,
      list.length ? h('div', { class: 'wares' }, ...list) : h('p', { class: 'scroll-note' }, 'No hay nada de ese elemento. Volvé la semana que viene.'),
      h('p', { class: 'scroll-note' }, 'Tocá un objeto para que te lo describan. Lo que comprás se equipa en tu casa.'),
    ].filter(Boolean));
  }

  function wareRow(item) {
    const price = buyPrice(p, item);
    const isConsumable = item.slot === 'consumable';
    const have = p.consumables[item.id] ?? 0;
    const owned = !isConsumable && owns(p, item.id);
    const lowLevel = (item.lvl ?? 1) > p.level;
    const canBuy = !owned && p.gold >= price && !(isConsumable && have >= MAX_CONSUMABLE);

    const action = owned
      ? h('span', { class: 'ware-owned' }, 'Lo tenés')
      : h('button', {
        type: 'button', class: 'seal', disabled: !canBuy, title: `Comprar ${item.name}`,
        onclick: (ev) => { ev.stopPropagation(); purchase(item); },
      }, 'Comprar');

    return h('div', {
      class: `ware${selected === item.id ? ' is-selected' : ''}${item.rare ? ' is-rare' : ''}`,
      role: 'button', tabindex: '0',
      onclick: () => describe(item),
      onkeydown: (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); describe(item); } },
    },
    h('span', { class: 'ware-icon' }, itemIcon(item)),
    h('span', { class: 'ware-info' },
      h('span', { class: 'ware-name' }, item.name, !isConsumable && item.element !== 'neutral' ? elementChip(item.element, true) : null),
      h('span', { class: `ware-stats${lowLevel ? ' is-low' : ''}` }, itemStats(item), isConsumable ? ` · tenés ${have}/${MAX_CONSUMABLE}` : '')),
    h('span', { class: 'ware-buy' },
      h('span', { class: 'ware-price' }, iconCanvas('coin'), price),
      action));
  }

  render();
  return view;
}
