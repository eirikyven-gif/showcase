import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../vibe/bilag/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../vibe/bilag/app.js', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../vibe/bilag/README.md', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../vibe/catalog.json', import.meta.url), 'utf8'));

test('Bilag route and catalog identify the inspected source commit and stable route', () => {
  const entries = catalog.apps.filter((entry) => entry.slug === 'bilag');
  assert.equal(entries.length, 1);
  assert.match(entries[0].source, /forsikring-bilag.*f32f92ed00d1286e25e9cc7a0454ba1ad8c579eb/);
  assert.match(entries[0].scope, /localStorage.*syntetisk/i);
  assert.match(html, /\/vibe\/bilag\/app\.js/);
  assert.match(docs, /app\/bilagsregister\.gs.*app\/bilagsregister-core\.gs/);
});

test('source-facing queue, sheets, human review, movement, stop, resume, log, and reset flows are represented', () => {
  for (const id of ['start-run', 'stop-run', 'reset-demo', 'losore-rows', 'drift-rows', 'queue-rows', 'log-rows']) {
    assert.match(html, new RegExp(`id="${id}"`), `${id} exists in the route`);
  }
  for (const behavior of ['startRun', 'processNext', 'stopRun', 'moveMarked', 'resetDemo', 'addLog']) {
    assert.match(app, new RegExp(`function ${behavior}\\(`), `${behavior} is implemented`);
  }
  assert.match(app, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(app, /state\.log = preservedLog/);
  assert.match(app, /target\.some\(\(existing\) => existing\.id === fingerprint\)/);
});

test('demo uses explicit synthetic fixtures and contains no live service integration', () => {
  assert.match(html, /Alle filnavn, varer, datoer og beløp er oppdiktet/);
  assert.match(app, /DEMO_faktura_traktorfilter\.pdf/);
  assert.doesNotMatch(app, /\b(fetch|XMLHttpRequest|GoogleAppsScript|DriveApp|SpreadsheetApp|UrlFetchApp)\b/);
  assert.doesNotMatch(app, /GEMINI_API_KEY|1BEsimZAurrN9MviJS6vFosoQBJr6zz94|1k1uij0qYnfNnZ_Fdb7rVX3LEfUBMGF0YqBvh0J3TpZI/);
  assert.match(app, /vibe\.bilag\.demo\.v1/);
  assert.match(app, /window\.confirm\(/);
});
