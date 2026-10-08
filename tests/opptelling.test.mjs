import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appSource = readFileSync(path.join(repoRoot, 'vibe/opptelling/app.js'), 'utf8');

function createDemo() {
  const listeners = new Map();
  const elements = Object.fromEntries(['start', 'output', 'start-now', 'reset'].map((id) => [id, {
    value: '',
    textContent: '',
    focused: false,
    addEventListener(type, callback) { listeners.set(`${id}:${type}`, callback); },
    focus() { this.focused = true; },
  }]));
  let intervalCallback;
  vm.runInNewContext(appSource, {
    document: { getElementById: (id) => elements[id] },
    window: { setInterval(callback) { intervalCallback = callback; } },
    Date,
  });
  return {
    elements,
    click(id) { listeners.get(`${id}:click`)(); },
    input() { listeners.get('start:input')(); },
    tick() { intervalCallback(); },
  };
}

test('opptelling shows an empty prompt, calculates elapsed time, and refreshes live', () => {
  const demo = createDemo();
  assert.match(demo.elements.output.textContent, /Velg starttid/);
  demo.elements.start.value = '2000-01-01T00:00';
  demo.input();
  assert.match(demo.elements.output.textContent, /^Forløpt: \d+ dager/);
  const before = demo.elements.output.textContent;
  demo.tick();
  assert.match(demo.elements.output.textContent, /^Forløpt: \d+ dager/);
  assert.ok(before.includes('timer'));
});

test('Start nå chooses the current local minute and reset clears the value', () => {
  const demo = createDemo();
  demo.click('start-now');
  assert.match(demo.elements.start.value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  assert.match(demo.elements.output.textContent, /^Forløpt: 0 dager/);
  demo.click('reset');
  assert.equal(demo.elements.start.value, '');
  assert.match(demo.elements.output.textContent, /Velg starttid/);
  assert.equal(demo.elements.start.focused, true);
});

test('future start times do not produce a negative elapsed duration', () => {
  const demo = createDemo();
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const localFuture = new Date(future.getTime() - future.getTimezoneOffset() * 60000);
  demo.elements.start.value = localFuture.toISOString().slice(0, 16);
  demo.input();
  assert.match(demo.elements.output.textContent, /^Forløpt: 0 dager · 0 timer · 0 minutter · 0 sekunder$/);
});
