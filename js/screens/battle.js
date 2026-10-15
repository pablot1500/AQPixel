import { h, sleep } from '../util.js';
import { screen, bar, button, elementChip, updateHud } from '../ui.js';
import { ZONE_BY_ID } from '../data/zones.js';
import { MONSTERS } from '../data/monsters.js';
import { ITEMS } from '../data/items.js';
import { ELEMENTS, ELEMENT_IDS } from '../data/elements.js';
import { monsterCanvas, heroCanvas, spriteCanvas, swatchFor, itemIcon } from '../sprites.js';
import { battlefieldFor } from '../art/battlefield.js';
import { createStage } from '../scene.js';
import { startBattle, playerTurn, applyRewards, applyDefeat } from '../combat.js';
import { equippedItem, maxHp, maxMp } from '../state.js';

const POS = { player: { x: 24, y: 60 }, enemy: { x: 74, y: 60 } };

export function battleScreen(game, { zoneId }) {
  const p = game.player;
  const zone = ZONE_BY_ID[zoneId];
  const { battle, events: opening } = startBattle(p, zone);
  const e = battle.enemy;
  const monster = MONSTERS[e.id];
  const weapon = equippedItem(p, 'weapon');
  const spell = equippedItem(p, 'spell');
  let busy = true;

  // ---- Escena ----
  const heroSprite = heroCanvas(weapon, equippedItem(p, 'armor'), 'px fighter fighter-hero', game);
  const enemySprite = monsterCanvas(monster, 'px fighter fighter-enemy', game);
  const field = createStage(game, { ...battlefieldFor(zone), className: 'px scene-bg' });
  const fx = h('div', { class: 'fx-layer', 'aria-hidden': 'true' });
  const scene = h('div', { class: 'scene' }, field.canvas, heroSprite, enemySprite, fx);
  const sprites = { player: heroSprite, enemy: enemySprite };

  // ---- Panel del enemigo ----
  const enemyBarSlot = h('div', null, bar('hp', e.hp, e.maxHp, 'VIDA'));
  const resistGrid = h('div', { class: 'resist-grid', id: 'resist-grid', hidden: true },
    ...['neutral', ...ELEMENT_IDS].map((el) => {
      const v = e.resist[el];
      const cls = v === 0 ? 'immune' : v > 100 ? 'weak' : v < 100 ? 'strong' : '';
      return h('div', { class: `resist-cell ${cls}` }, elementChip(el, true), h('span', { class: 'resist-val' }, `${v} %`));
    }));
  const weakList = ['neutral', ...ELEMENT_IDS].filter((el) => e.resist[el] > 100).map((el) => ELEMENTS[el].name);
  const infoBtn = h('button', {
    type: 'button', class: 'link-btn', 'aria-expanded': 'false', 'aria-controls': 'resist-grid',
    onclick: () => {
      resistGrid.hidden = !resistGrid.hidden;
      infoBtn.setAttribute('aria-expanded', String(!resistGrid.hidden));
      infoBtn.textContent = resistGrid.hidden ? 'Ver resistencias ▾' : 'Ocultar resistencias ▴';
    },
  }, 'Ver resistencias ▾');
  const enemyPanel = h('section', { class: 'enemy-panel panel' },
    h('div', { class: 'enemy-head' },
      h('span', { class: 'enemy-name' }, e.name),
      h('span', { class: 'hud-level' }, `Nv ${e.level}`),
      elementChip(e.element, true)),
    enemyBarSlot,
    h('div', { class: 'enemy-weak' },
      h('span', null, h('span', { class: 'res-label good' }, 'Débil a: '), weakList.join(', ') || 'nada'),
      infoBtn),
    resistGrid);

  const log = h('div', { class: 'log panel', 'aria-live': 'polite' });
  const actions = h('section', { class: 'actions' });

  // ---- Acciones ----
  function effTag(element) {
    const mult = (e.resist[element] ?? 100) / 100;
    if (mult === 1) return null;
    const cls = mult === 0 ? 'immune' : mult > 1 ? 'good' : 'bad';
    return h('span', { class: `eff eff-${cls}` }, mult === 0 ? 'inmune' : `×${String(mult).replace('.', ',')}`);
  }

  function actionButton({ key, icon, title, sub, tag, onclick, disabled, id }) {
    return h('button', { type: 'button', class: 'action', onclick, disabled: busy || disabled, id },
      h('span', { class: 'action-key', 'aria-hidden': 'true' }, key),
      icon,
      h('span', { class: 'action-text' }, h('span', { class: 'action-title' }, title, tag), h('span', { class: 'action-sub' }, sub)));
  }

  function renderActions() {
    if (battle.over) return;
    const potHp = p.consumables.pocion_vida ?? 0;
    const potMp = p.consumables.pocion_mana ?? 0;
    actions.replaceChildren(
      actionButton({ key: '1', id: 'act-attack', icon: itemIcon(weapon), title: 'Atacar', sub: weapon.name, tag: effTag(weapon.element), onclick: () => act({ type: 'attack' }) }),
      actionButton({ key: '2', id: 'act-spell', icon: itemIcon(spell), title: spell.name, sub: `${spell.mp} MP`, tag: effTag(spell.element), disabled: p.mp < spell.mp, onclick: () => act({ type: 'spell' }) }),
      actionButton({ key: '3', id: 'act-hp', icon: itemIcon(ITEMS.pocion_vida), title: 'Poción de vida', sub: `Te quedan ${potHp}`, disabled: !potHp || p.hp >= maxHp(p), onclick: () => act({ type: 'item', id: 'pocion_vida' }) }),
      actionButton({ key: '4', id: 'act-mp', icon: itemIcon(ITEMS.pocion_mana), title: 'Poción de maná', sub: `Te quedan ${potMp}`, disabled: !potMp || p.mp >= maxMp(p), onclick: () => act({ type: 'item', id: 'pocion_mana' }) }),
      actionButton({ key: '5', id: 'act-flee', icon: null, title: 'Huir', sub: 'Sin castigo, sin premio', onclick: () => act({ type: 'flee' }) }),
    );
  }

  async function act(action) {
    if (busy || battle.over) return;
    busy = true;
    renderActions();
    await play(playerTurn(p, battle, action));
    game.save();
    busy = false;
    renderActions();
  }

  // ---- Reproducción de eventos ----
  function addLog(text, cls = '') {
    log.append(h('p', { class: cls }, text));
    while (log.children.length > 4) log.firstChild.remove();
  }

  function retrigger(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function float(target, text, cls, color) {
    const pos = POS[target];
    const el = h('span', { class: `float ${cls}`, style: { left: `${pos.x}%`, top: `${pos.y - 22}%`, color } }, text);
    fx.append(el);
    setTimeout(() => el.remove(), 1100);
  }

  function burst(target, element) {
    const pos = POS[target];
    const colors = swatchFor(element);
    const el = spriteCanvas('burst', colors, 'px burst');
    el.style.left = `${pos.x}%`;
    el.style.top = `${pos.y}%`;
    fx.append(el);
    // Chispas del color del elemento que salen disparadas
    const sparks = [];
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 26 + Math.random() * 22;
      const spark = h('span', {
        class: 'spark',
        style: {
          left: `${pos.x}%`, top: `${pos.y}%`, background: i % 2 ? colors.c : colors.a,
          '--dx': `${Math.cos(ang) * dist}px`, '--dy': `${Math.sin(ang) * dist}px`,
        },
      });
      sparks.push(spark);
    }
    fx.append(...sparks);
    setTimeout(() => { el.remove(); sparks.forEach((s) => s.remove()); }, 600);
  }

  async function play(evts) {
    for (const ev of evts) {
      switch (ev.type) {
        case 'log':
          addLog(ev.text);
          await sleep(ev.noTurn ? 0 : 350);
          break;
        case 'act': {
          const sprite = sprites[ev.who];
          if (ev.kind === 'spell') {
            retrigger(sprite, 'cast');
            await sleep(200);
          } else {
            retrigger(sprite, ev.who === 'player' ? 'lunge-right' : 'lunge-left');
            await sleep(180);
          }
          break;
        }
        case 'damage': {
          const color = ev.element !== 'neutral' ? ELEMENTS[ev.element].color : '#f4f4f4';
          burst(ev.target, ev.element);
          retrigger(sprites[ev.target], 'hit');
          if (ev.crit || ev.mult >= 1.5) retrigger(scene, 'shake');
          const label = ev.mult === 0 ? 'INMUNE' : `${ev.amount}${ev.crit ? '!' : ''}`;
          float(ev.target, label, `${ev.crit ? 'is-crit' : ''} ${ev.mult >= 1.5 ? 'is-super' : ''}`, ev.crit ? '#ffcd75' : color);
          if (ev.target === 'enemy') enemyBarSlot.replaceChildren(bar('hp', e.hp, e.maxHp, 'VIDA'));
          else updateHud(game, { locked: true });
          addLog(ev.text, ev.target === 'player' ? 'log-hurt' : 'log-hit');
          await sleep(650);
          break;
        }
        case 'miss':
          float(ev.target, 'FALLÓ', 'is-miss');
          addLog(ev.text, 'log-miss');
          await sleep(500);
          break;
        case 'heal':
          float('player', `+${ev.amount}`, 'is-heal', ev.stat === 'hp' ? '#a7f070' : '#73eff7');
          updateHud(game, { locked: true });
          addLog(`${ev.text} +${ev.amount} ${ev.stat === 'hp' ? 'de vida' : 'de maná'}.`, 'log-heal');
          await sleep(500);
          break;
        case 'resource':
          updateHud(game, { locked: true });
          break;
        case 'end':
          finish(ev.result);
          break;
        default:
          break;
      }
    }
  }

  // ---- Fin del combate ----
  function finish(result) {
    document.removeEventListener('keydown', onKey);
    if (result === 'win') {
      enemySprite.classList.add('defeated');
      const r = applyRewards(p, battle);
      game.save();
      updateHud(game);
      actions.replaceChildren(h('div', { class: 'result panel result-win' },
        h('h2', { class: 'result-title' }, '¡Victoria!'),
        h('ul', { class: 'loot' },
          h('li', null, `+${r.xp} de experiencia`),
          h('li', null, `+${r.gold} de oro`),
          ...r.drops.map((d) => h('li', { class: 'loot-rare' }, itemIcon(d.item),
            d.duplicate ? `${d.item.name} (repetido, lo vendiste por ${d.value} de oro)` : `¡Objeto raro! ${d.item.name}`)),
          r.levels ? h('li', { class: 'loot-level' }, `¡Subiste a nivel ${p.level}! Tenés ${p.statPoints} puntos para repartir.`) : null),
        h('div', { class: 'row-actions' },
          button('Seguir cazando', () => game.go('batalla', { zoneId }), { variant: 'primary', id: 'btn-again' }),
          r.levels || r.drops.length ? button('Mochila', () => game.go('mochila'), { variant: 'ghost' }) : null,
          button('Volver al pueblo', () => game.go('pueblo'), { variant: 'ghost' }))));
    } else if (result === 'lose') {
      heroSprite.classList.add('defeated');
      applyDefeat(p);
      game.save();
      actions.replaceChildren(h('div', { class: 'result panel result-lose' },
        h('h2', { class: 'result-title' }, 'Derrota'),
        h('p', null, 'Doña Berta te encontró roncando en el barro y te arrastró hasta la posada. No perdiste nada, salvo el orgullo.'),
        h('div', { class: 'row-actions' },
          button('Despertar en la posada', () => game.go('posada', { welcome: '¿Otra vez vos? Te dejé media vida en la mesita de luz.' }), { variant: 'primary', id: 'btn-wake' }))));
    } else {
      game.save();
      actions.replaceChildren(h('div', { class: 'result panel' },
        h('h2', { class: 'result-title' }, 'Escapaste'),
        h('p', null, 'Nadie vio nada. Bueno, el monstruo sí.'),
        h('div', { class: 'row-actions' },
          button('Volver a la zona', () => game.go('zona', { zoneId }), { variant: 'primary' }),
          button('Volver al pueblo', () => game.go('pueblo'), { variant: 'ghost' }))));
    }
  }

  // ---- Atajos de teclado ----
  const keyMap = { 1: 'act-attack', 2: 'act-spell', 3: 'act-hp', 4: 'act-mp', 5: 'act-flee' };
  function onKey(ev) {
    const id = keyMap[ev.key];
    if (!id || ev.target.tagName === 'INPUT') return;
    document.getElementById(id)?.click();
  }
  document.addEventListener('keydown', onKey);
  game.addCleanup(() => document.removeEventListener('keydown', onKey));

  renderActions();
  setTimeout(async () => {
    await play(opening);
    if (!battle.over) {
      busy = false;
      renderActions();
    }
  }, 250);

  const view = screen(game, 'battle-screen', enemyPanel, scene, log, actions);
  view.querySelector('#hud .pill')?.setAttribute('disabled', '');
  return view;
}
