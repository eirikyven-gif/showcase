function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function decimalPlaces(value) {
  const source = String(value);
  return source.includes('.') ? source.length - source.indexOf('.') - 1 : 0;
}

export function quantizeStepValue(value, definition) {
  const min = Number(definition.min);
  const max = Number(definition.max);
  const step = Number(definition.step) || 1;
  const clamped = clamp(value, min, max);
  const quantized = min + (Math.round((clamped - min) / step) * step);
  return Number(clamp(quantized, min, max).toFixed(decimalPlaces(step)));
}

export function sortedStepIndexes(selection, length = 16) {
  const limit = Math.max(0, Number(length) || 0);
  return [...(selection || [])]
    .map(Number)
    .filter((index) => Number.isInteger(index) && index >= 0 && index < limit)
    .sort((a, b) => a - b);
}

export function toggleStepIndex(selection, index, length = 16) {
  const next = new Set(sortedStepIndexes(selection, length));
  const stepIndex = Number(index);
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= length) return next;
  if (next.has(stepIndex)) next.delete(stepIndex);
  else next.add(stepIndex);
  return next;
}

export function pruneStepSelection(selection, length) {
  return new Set(sortedStepIndexes(selection, length));
}

export function numericSelectionState(steps, selection, definition) {
  const indexes = sortedStepIndexes(selection, steps.length);
  if (!indexes.length) return null;
  const values = indexes.map((index) => quantizeStepValue(steps[index][definition.key], definition));
  return {
    indexes,
    reference: values[0],
    values,
    mixed: values.some((value) => value !== values[0]),
  };
}

export function createRelativeStepAdjustment(steps, selection, definition, referenceValue) {
  const summary = numericSelectionState(steps, selection, definition);
  if (!summary) return null;
  return {
    key: definition.key,
    indexes: summary.indexes,
    signature: `${definition.key}:${summary.indexes.join(',')}`,
    reference: quantizeStepValue(referenceValue ?? summary.reference, definition),
    starts: summary.indexes.map((index) => [index, quantizeStepValue(steps[index][definition.key], definition)]),
  };
}

export function applyRelativeStepAdjustment(steps, adjustment, nextReference, definition) {
  if (!adjustment || adjustment.key !== definition.key) return [];
  const reference = quantizeStepValue(nextReference, definition);
  const delta = reference - adjustment.reference;
  const changed = [];
  for (const [index, startValue] of adjustment.starts) {
    if (!steps[index]) continue;
    const value = quantizeStepValue(startValue + delta, definition);
    steps[index][definition.key] = value;
    changed.push({ index, value });
  }
  return changed;
}

export function setSelectedNumericValue(steps, selection, definition, value) {
  const nextValue = quantizeStepValue(value, definition);
  const indexes = sortedStepIndexes(selection, steps.length);
  for (const index of indexes) steps[index][definition.key] = nextValue;
  return { indexes, value: nextValue };
}

export function booleanSelectionState(steps, selection, key) {
  const indexes = sortedStepIndexes(selection, steps.length);
  if (!indexes.length) return null;
  const values = indexes.map((index) => Boolean(steps[index][key]));
  return {
    indexes,
    value: values[0],
    mixed: values.some((value) => value !== values[0]),
  };
}

export function setSelectedBooleanValue(steps, selection, key, value) {
  const indexes = sortedStepIndexes(selection, steps.length);
  for (const index of indexes) steps[index][key] = Boolean(value);
  return indexes;
}

export function canCopyStepSelection(selection, length = 16) {
  return sortedStepIndexes(selection, length).length === 1;
}

export function runConfirmedStepAction(confirmAction, message, action) {
  if (!confirmAction(message)) return false;
  action();
  return true;
}
