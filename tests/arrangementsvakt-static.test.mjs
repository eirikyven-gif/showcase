import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('Arrangementsvakt assessment stays static, non-operational, and free of source data', () => {
  const route = read('vibe/arrangementsvakt/index.html');
  const css = read('vibe/arrangementsvakt/style.css');
  const docs = read('vibe/arrangementsvakt/README.md');
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const entry = catalog.apps.find((app) => app.slug === 'arrangementsvakt');

  assert.ok(entry, 'candidate is listed');
  for (const field of ['status', 'sourceUncertainty', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState']) {
    assert.equal(typeof entry[field], 'string', `${field} is recorded`);
    assert.ok(entry[field].trim(), `${field} is not empty`);
  }
  assert.match(route, /rel="canonical" href="\/vibe\/arrangementsvakt\/"/);
  assert.match(route, /href="\/vibe\/"/);
  assert.match(route, /Kun vurdering – ikke til operativ bruk/);
  assert.match(route, /Alt innhold, alle roller og eventuelle eksempler her er fiktive/);
  assert.match(route, /versjonen er dokumentert i README, ikke bekreftet som aktiv produksjonsversjon/);
  assert.match(route, /Ingen lisens eller gjenbrukstillatelse/);
  assert.match(docs, /Ingen vaktliste, sjekkliste, roller/);
  assert.match(docs, /SSoT-materiale har flere versjoner/);
  assert.match(docs, /Kildetestene ble ikke kjørt/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(route, /<script\b|<form\b|<input\b|<button\b/i);
  assert.doesNotMatch(`${route}\n${css}`, /https?:\/\//i);
  assert.doesNotMatch(`${route}\n${css}`, /(?:fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|pushManager)/i);
  assert.doesNotMatch(`${route}\n${docs}`, /(?:\b[A-Z][a-z]+\s+[A-Z][a-z]+\b|@\w+|\b\+47\b|\b\d{11}\b)/);
});
