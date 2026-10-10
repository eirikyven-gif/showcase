import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import vm from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

function createTimer() {
  const elements = Object.fromEntries(['secs', 'output', 'status', 'start', 'pause', 'reset'].map((id) => [id, {
    id,
    value: id === 'secs' ? '60' : '',
    textContent: '',
    listeners: {},
    addEventListener(type, callback) { this.listeners[type] = callback; },
    click() { this.listeners.click(); },
    input() { this.listeners.input(); },
  }]));
  let now = 1000;
  let nextInterval = 1;
  const intervals = new Map();
  const fakeDate = { now: () => now };
  vm.runInNewContext(read('vibe/timer/app.js'), {
    document: { getElementById: (id) => elements[id] },
    Date: fakeDate,
    setInterval(callback) { const id = nextInterval++; intervals.set(id, callback); return id; },
    clearInterval(id) { intervals.delete(id); },
  });
  return {
    elements,
    advance(ms) { now += ms; for (const callback of [...intervals.values()]) callback(); },
  };
}

test('Timer runtime preserves input, start, pause, continue, reset, and completion', () => {
  const { elements: e, advance } = createTimer();
  assert.equal(e.output.textContent, '01:00');
  assert.equal(e.status.textContent, 'Pauset/klar');

  e.secs.value = '8';
  e.secs.input();
  assert.equal(e.output.textContent, '00:08');
  e.start.click();
  assert.equal(e.status.textContent, 'Kjører');
  advance(2200);
  assert.equal(e.output.textContent, '00:05');
  e.pause.click();
  assert.equal(e.status.textContent, 'Pauset/klar');
  const pausedDisplay = e.output.textContent;
  advance(5000);
  assert.equal(e.output.textContent, pausedDisplay, 'paused timer does not continue to count down');

  e.start.click();
  assert.equal(e.status.textContent, 'Kjører');
  advance(6000);
  assert.equal(e.output.textContent, 'Ferdig');
  assert.equal(e.status.textContent, 'Ferdig');
  e.start.click();
  assert.equal(e.output.textContent, '00:08', 'start after completion begins the configured duration again');

  e.reset.click();
  assert.equal(e.output.textContent, '00:08', 'reset uses the current input value');
  assert.equal(e.start.textContent, 'Start');
});

test('Timer route links directly to the hub, has labeled keyboard controls, and makes no external calls', () => {
  const html = read('vibe/timer/index.html');
  const script = read('vibe/timer/app.js');
  const css = read('vibe/timer/style.css');
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const app = catalog.apps.find(({ slug }) => slug === 'timer');
  assert.ok(app);
  assert.match(html, /rel="canonical" href="\/vibe\/timer\/"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /href="\/vibe\/tidteller\/"[^>]*>← Til portal/);
  assert.match(html, /<label for="secs">Sekunder<\/label>/);
  assert.match(html, /href="#timer">Hopp til timeren<\/a>/);
  assert.match(html, /aria-live="polite"/);
  assert.match(read('vibe/assets/hub.css') + css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(app.source, /0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/);
  assert.match(app.status, /tro.*kopi/i);
  assert.match(app.scope, /ingen.*nettverkskall/i);
  assert.doesNotMatch(`${html}\n${script}\n${css}`, /https?:\/\/|\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie)\b/i);
});
