import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');

function demo() {
  const listeners = new Map();
  const cells = { children: [], append(button) { this.children.push(button); } };
  const status = { textContent: '' };
  const reset = { addEventListener(type, callback) { listeners.set(`reset:${type}`, callback); } };
  const document = {
    getElementById(id) { return ({ cells, status, reset })[id]; },
    createElement() {
      const attrs = {};
      return { type: '', textContent: '', className: '', disabled: false, focused: false,
        setAttribute(key, value) { attrs[key] = value; }, getAttribute(key) { return attrs[key]; },
        addEventListener(type, callback) { listeners.set(`${cells.children.length}:${type}`, callback); },
        focus() { this.focused = true; } };
    },
  };
  vm.runInNewContext(read('vibe/bingo/bingo.js'), { document });
  return { cells, status, reset, click(index) { listeners.get(`${index}:click`)(); }, clear() { listeners.get('reset:click')(); } };
}

test('catalog includes the retained Bingo candidate and route is standalone', () => {
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const bingo = catalog.apps.filter(app => app.slug === 'bingo');
  assert.equal(bingo.length, 1);
  assert.match(bingo[0].status, /Beholdt i bred/);
  const html = read('vibe/bingo/index.html');
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /aria-live="polite"/);
  assert.doesNotMatch(html, /<form|<iframe|<img/i);
});

test('synthetic card has 25 accessible buttons and only local toggles', () => {
  const game = demo();
  assert.equal(game.cells.children.length, 25);
  assert.equal(game.cells.children[12].textContent, 'FRI RUTE');
  game.click(0);
  assert.equal(game.cells.children[0].getAttribute('aria-pressed'), 'true');
  assert.match(game.status.textContent, /1 rute markert/);
  game.clear();
  assert.equal(game.cells.children[0].getAttribute('aria-pressed'), 'false');
  assert.equal(game.cells.children[0].focused, true);
  assert.match(game.status.textContent, /nullstilt/);
});

test('demo has no browser storage, network, or server integration', () => {
  const js = read('vibe/bingo/bingo.js');
  assert.doesNotMatch(js, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket/i);
  assert.doesNotMatch(js, /https?:\/\//i);
});
