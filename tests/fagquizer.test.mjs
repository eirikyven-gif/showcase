import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Fagquizer has one documented candidate route and a clearly synthetic fixed-choice example', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'fagquizer');
  assert.equal(matches.length, 1);
  const entry = matches[0];
  for (const field of ['source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState', 'status']) {
    assert.equal(typeof entry[field], 'string', `${field} is documented`);
    assert.ok(entry[field].trim(), `${field} is non-empty`);
  }
  const html = read('vibe/fagquizer/index.html');
  const script = read('vibe/fagquizer/app.js');
  const css = read('vibe/fagquizer/style.css');
  const notes = read('vibe/fagquizer/README.md');
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /type="radio"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /oppdiktet|minieksempel/i);
  assert.match(html, /ikke et validert undervisnings- eller vurderingsverktøy/i);
  assert.match(script, /value === 'stop'/);
  assert.match(script, /addEventListener\('click'/);
  assert.doesNotMatch(script, /#answers['"]\)\.focus\(/, 'restart does not move focus to a non-focusable fieldset');
  assert.match(notes, /fokus forblir på knappen «Start på nytt»/);
  assert.match(css, /--red:\s*#a9283c/i);
  assert.match(css, /--red-dark:\s*#791b2b/i);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-width:\s*320px/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(notes, /v0\.5/);
  assert.match(notes, /Rettighetene.*uavklart/i);
  assert.match(notes, /Ingen deploy utført/i);
  assert.doesNotMatch(html + script, /https?:\/\/|\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|sendBeacon)\b|document\.cookie/i);
  assert.doesNotMatch(html + script, /<textarea\b|<input\b[^>]*type="text"|\b(?:studentnavn|elevnavn|svartekst)\b/i);
});
