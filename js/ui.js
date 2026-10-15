// Componentes de interfaz compartidos por todas las pantallas.

import { h } from './util.js';
import { ELEMENTS } from './data/elements.js';
import { ATTACK_TYPE_NAMES } from './data/items.js';
import { maxHp, maxMp, xpToNext, LEVEL_CAP } from './state.js';
import { iconCanvas, itemIcon, houseCanvas } from './sprites.js';

export function button(label, onclick, opts = {}) {
  return h('button', {
    type: 'button',
    class: `btn ${opts.variant ? `btn-${opts.variant}` : ''} ${opts.class ?? ''}`.trim(),
    onclick,
    disabled: opts.disabled ?? false,
    title: opts.title,
    id: opts.id,
  }, label);
}

export function bar(kind, cur, max, label) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
  return h('div', { class: `bar bar-${kind}`, role: 'progressbar', 'aria-label': label, 'aria-valuenow': cur, 'aria-valuemax': max },
    h('div', { class: 'bar-fill', style: { width: `${pct}%` } }),
    h('span', { class: 'bar-text' }, `${label} ${cur}/${max}`));
}

export function hud(game, opts = {}) {
  const p = game.player;
  const atCap = p.level >= LEVEL_CAP;
  return h('header', { class: 'hud panel', id: 'hud' },
    h('div', { class: 'hud-top' },
      h('span', { class: 'hud-name' }, p.name),
      h('span', { class: 'hud-level' }, `Nv ${p.level}`),
      p.statPoints > 0
        ? h('button', { type: 'button', class: 'pill pill-alert', disabled: opts.locked, onclick: () => game.go('mochila') }, `+${p.statPoints} puntos`)
        : null,
      h('span', { class: 'hud-gold', title: 'Oro' }, iconCanvas('coin'), h('span', null, p.gold))),
    h('div', { class: 'hud-bars' },
      bar('hp', p.hp, maxHp(p), 'VIDA'),
      bar('mp', p.mp, maxMp(p), 'MANÁ'),
      atCap ? bar('xp', 1, 1, 'NIVEL MÁX') : bar('xp', p.xp, xpToNext(p.level), 'EXP')));
}

export function updateHud(game, opts) {
  document.getElementById('hud')?.replaceWith(hud(game, opts));
}

export function screen(game, cls, ...children) {
  return h('div', { class: `screen ${cls}` }, hud(game), h('main', { class: 'screen-body' }, ...children));
}

export function elementChip(element, small = false) {
  const el = ELEMENTS[element] ?? ELEMENTS.neutral;
  return h('span', { class: `chip${small ? ' chip-sm' : ''}`, style: { '--el': el.color } }, el.name);
}

export function itemStats(item) {
  switch (item.slot) {
    case 'weapon':
      return `Daño ${item.min}–${item.max} · ${ATTACK_TYPE_NAMES[item.type]}${item.acc ? ` · Precisión +${item.acc} %` : ''}`;
    case 'armor': {
      const res = Object.entries(item.resist ?? {})
        .map(([el, v]) => `${ELEMENTS[el].name} ${v < 0 ? '−' : '+'}${Math.abs(v)} %`);
      return [`Defensa ${item.def}`, ...res].join(' · ');
    }
    case 'spell':
      return `Daño ${item.min}–${item.max} · ${item.mp} MP`;
    case 'consumable':
      return item.heal === 'hp' ? `Cura ${item.amount * 100} % de la vida` : `Recupera ${item.amount * 100} % del maná`;
    default:
      return '';
  }
}

export function itemRow(item, { actions = [], tags = [], player } = {}) {
  const lowLevel = player && player.level < (item.lvl ?? 1);
  return h('div', { class: `item-row${item.rare ? ' is-rare' : ''}` },
    h('div', { class: 'item-icon' }, itemIcon(item)),
    h('div', { class: 'item-info' },
      h('div', { class: 'item-name' },
        item.name,
        item.slot !== 'consumable' && item.element !== 'neutral' ? elementChip(item.element, true) : null,
        item.rare ? h('span', { class: 'tag tag-rare' }, 'Raro') : null,
        ...tags),
      h('div', { class: 'item-stats' },
        itemStats(item),
        item.lvl > 1 ? h('span', { class: lowLevel ? 'req req-bad' : 'req' }, ` · Nv ${item.lvl}`) : null),
      h('div', { class: 'item-desc' }, item.desc)),
    actions.length ? h('div', { class: 'item-actions' }, ...actions) : null);
}

export function npcHeader(building, line) {
  return h('section', { class: 'npc panel' },
    houseCanvas(building),
    h('div', { class: 'npc-text' },
      h('h1', { class: 'npc-title' }, building.name),
      h('div', { class: 'npc-owner' }, building.owner),
      line ? h('p', { class: 'npc-line' }, `«${line}»`) : null));
}

export function backButton(game, to = 'pueblo', label = 'Volver al pueblo') {
  return button(`◄ ${label}`, () => game.go(to), { variant: 'ghost', class: 'back' });
}

export function tabs(options, active, onpick) {
  return h('div', { class: 'tabs', role: 'tablist' },
    ...options.map(([id, label]) => h('button', {
      type: 'button', role: 'tab', class: `tab${id === active ? ' is-active' : ''}`,
      'aria-selected': id === active ? 'true' : 'false', onclick: () => onpick(id),
    }, label)));
}

let toastTimer;
export function toast(message, kind = 'info') {
  let el = document.getElementById('toast');
  if (!el) {
    el = h('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.append(el);
  }
  el.textContent = message;
  el.dataset.kind = kind;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}
