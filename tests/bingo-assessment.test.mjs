import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Bingo assessment records source-side services and keeps the showcase route synthetic', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'bingo');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['name', 'useCase', 'category', 'audience', 'status', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState']) {
    assert.ok(app[field], `${field} is documented`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsvurdering/);
  assert.match(app.sourceStack, /Google Apps Script/);
  assert.match(app.sourceTests, /npm test/);
  assert.match(app.sourceApiAuthStoragePrivacy, /CSRF/);
  assert.match(app.sourceApiAuthStoragePrivacy, /hemmelig token/);
  assert.match(app.rightsUncertainty, /Ingen lisens/);
  assert.match(app.routeState, /Unik statisk/);
  assert.doesNotMatch(`${read('vibe/bingo/index.html')}\n${read('vibe/bingo/bingo.js')}`, /fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|https?:\/\//i);
});
