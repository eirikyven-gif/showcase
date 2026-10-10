import assert from 'node:assert/strict';
import test from 'node:test';
import { createPadActivationController } from '../assets/pad-activation.js';

function createHarness({ delayed = false } = {}) {
  const active = new Set();
  const modes = new Map([[0, 'loop-hold'], [1, 'loop-hold'], [2, 'one-shot']]);
  const events = [];
  let releaseStart;
  const startGate = delayed ? new Promise((resolve) => { releaseStart = resolve; }) : Promise.resolve();
  const controller = createPadActivationController({
    isLoopMode: (index) => modes.get(index) === 'loop-hold',
    isActive: (index) => active.has(index),
    start: async (index, velocity, isCurrent) => {
      await startGate;
      if (!isCurrent()) return false;
      active.add(index);
      events.push(['start', index, velocity]);
      return true;
    },
    stop: (index) => {
      active.delete(index);
      events.push(['stop', index]);
    },
  });
  return { active, controller, events, modes, releaseStart };
}

test('loop pads toggle on each positive activation while one-shot retriggers', async () => {
  const harness = createHarness();
  assert.equal(await harness.controller.activate(0, 0.42), true);
  assert.equal(harness.active.has(0), true);
  assert.equal(await harness.controller.activate(0, 1), false);
  assert.equal(harness.active.has(0), false);
  assert.equal(await harness.controller.activate(0, 0.75), true);
  assert.equal(harness.active.has(0), true);

  assert.equal(await harness.controller.activate(2, 0.6), true);
  assert.equal(await harness.controller.activate(2, 0.9), true);
  assert.deepEqual(harness.events, [
    ['start', 0, 0.42],
    ['stop', 0],
    ['start', 0, 0.75],
    ['start', 2, 0.6],
    ['start', 2, 0.9],
  ]);
});

test('rapid loop activations serialize to one start followed by one stop', async () => {
  const harness = createHarness({ delayed: true });
  const first = harness.controller.activate(0, 0.5);
  const second = harness.controller.activate(0, 1);
  harness.releaseStart();
  await Promise.all([first, second]);
  assert.equal(harness.active.has(0), false);
  assert.deepEqual(harness.events, [['start', 0, 0.5], ['stop', 0]]);
});

test('cancelling a pending activation prevents a late start after cleanup', async () => {
  const harness = createHarness({ delayed: true });
  const pending = harness.controller.activate(0, 1);
  await Promise.resolve();
  harness.controller.cancel(0);
  harness.releaseStart();
  assert.equal(await pending, false);
  assert.equal(harness.active.has(0), false);
  assert.deepEqual(harness.events, []);
});

test('multiple loop pads remain independent', async () => {
  const harness = createHarness();
  await Promise.all([
    harness.controller.activate(0, 1),
    harness.controller.activate(1, 0.8),
  ]);
  assert.deepEqual([...harness.active].sort(), [0, 1]);
  await harness.controller.activate(0, 1);
  assert.deepEqual([...harness.active], [1]);
});
