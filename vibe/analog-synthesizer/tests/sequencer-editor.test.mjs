import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyRelativeStepAdjustment,
  booleanSelectionState,
  canCopyStepSelection,
  createRelativeStepAdjustment,
  numericSelectionState,
  pruneStepSelection,
  runConfirmedStepAction,
  setSelectedBooleanValue,
  setSelectedNumericValue,
  sortedStepIndexes,
  toggleStepIndex,
} from '../assets/sequencer-editor.js';

const pitch = { key: 'note', min: -24, max: 24, step: 1 };
const velocity = { key: 'velocity', min: 0, max: 1, step: 0.01 };
const gate = { key: 'gate', min: 0.1, max: 1, step: 0.01 };
const ratchet = { key: 'ratchet', min: 1, max: 4, step: 1 };

test('selection toggles, sorts and prunes hidden steps without touching step data', () => {
  const steps = [{ active: false }, { active: true }, { active: false }];
  let selection = toggleStepIndex(new Set([2]), 0, steps.length);
  assert.deepEqual(sortedStepIndexes(selection, steps.length), [0, 2]);
  selection = toggleStepIndex(selection, 2, steps.length);
  assert.deepEqual([...selection], [0]);
  assert.deepEqual([...pruneStepSelection(new Set([0, 7, -1, 1.5]), 3)], [0]);
  assert.deepEqual(steps, [{ active: false }, { active: true }, { active: false }]);
});

test('relative pitch adjustment preserves intervals across selected steps', () => {
  const steps = [{ note: -12 }, { note: 2 }, { note: 10 }];
  const selection = new Set([0, 1, 2]);
  const adjustment = createRelativeStepAdjustment(steps, selection, pitch);
  const changed = applyRelativeStepAdjustment(steps, adjustment, -7, pitch);
  assert.deepEqual(changed, [
    { index: 0, value: -7 },
    { index: 1, value: 7 },
    { index: 2, value: 15 },
  ]);
  assert.deepEqual(steps.map((step) => step.note), [-7, 7, 15]);
});

test('relative velocity, gate and ratchet adjustments use captured start values', () => {
  const steps = [
    { velocity: 0.2, gate: 0.25, ratchet: 1 },
    { velocity: 0.6, gate: 0.65, ratchet: 3 },
  ];
  const selection = new Set([0, 1]);
  for (const [definition, nextReference, expected] of [
    [velocity, 0.35, [0.35, 0.75]],
    [gate, 0.15, [0.15, 0.55]],
    [ratchet, 2, [2, 4]],
  ]) {
    const adjustment = createRelativeStepAdjustment(steps, selection, definition);
    applyRelativeStepAdjustment(steps, adjustment, nextReference, definition);
    assert.deepEqual(steps.map((step) => step[definition.key]), expected);
  }
});

test('relative adjustment clamps deterministically at parameter boundaries', () => {
  const steps = [{ note: 23 }, { note: -23 }];
  const selection = new Set([0, 1]);
  const adjustment = createRelativeStepAdjustment(steps, selection, pitch);
  applyRelativeStepAdjustment(steps, adjustment, 24, pitch);
  assert.deepEqual(steps.map((step) => step.note), [24, -22]);

  const negativeAdjustment = createRelativeStepAdjustment(steps, selection, pitch);
  applyRelativeStepAdjustment(steps, negativeAdjustment, -24, pitch);
  assert.deepEqual(steps.map((step) => step.note), [-24, -24]);
});

test('mixed values are reported and Sett likt normalizes selected values', () => {
  const steps = [
    { velocity: 0.2, active: true, slide: false },
    { velocity: 0.8, active: false, slide: false },
  ];
  const selection = new Set([0, 1]);
  assert.deepEqual(numericSelectionState(steps, selection, velocity), {
    indexes: [0, 1],
    reference: 0.2,
    values: [0.2, 0.8],
    mixed: true,
  });
  assert.deepEqual(booleanSelectionState(steps, selection, 'active'), {
    indexes: [0, 1],
    value: true,
    mixed: true,
  });
  assert.equal(booleanSelectionState(steps, selection, 'slide').mixed, false);

  assert.deepEqual(setSelectedNumericValue(steps, selection, velocity, 0.55), {
    indexes: [0, 1],
    value: 0.55,
  });
  setSelectedBooleanValue(steps, selection, 'active', true);
  assert.deepEqual(steps, [
    { velocity: 0.55, active: true, slide: false },
    { velocity: 0.55, active: true, slide: false },
  ]);
});

test('copy eligibility requires exactly one valid selected step', () => {
  assert.equal(canCopyStepSelection(new Set(), 16), false);
  assert.equal(canCopyStepSelection(new Set([4]), 16), true);
  assert.equal(canCopyStepSelection(new Set([4, 5]), 16), false);
  assert.equal(canCopyStepSelection(new Set([16]), 16), false);
});

test('cancelled confirmation makes no change and confirmed action runs once', () => {
  const state = { value: 3 };
  let confirmMessage = '';
  const cancelled = runConfirmedStepAction(
    (message) => {
      confirmMessage = message;
      return false;
    },
    'Bekreft handling',
    () => { state.value = 9; },
  );
  assert.equal(cancelled, false);
  assert.equal(confirmMessage, 'Bekreft handling');
  assert.equal(state.value, 3);

  let actionCount = 0;
  const confirmed = runConfirmedStepAction(
    () => true,
    'Bekreft handling',
    () => {
      actionCount += 1;
      state.value = 9;
    },
  );
  assert.equal(confirmed, true);
  assert.equal(actionCount, 1);
  assert.equal(state.value, 9);
});
