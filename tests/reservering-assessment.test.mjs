import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Reservering assessment documents source data risks while the route remains a non-booking demo', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'reservering');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['name', 'useCase', 'category', 'audience', 'status', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState']) {
    assert.ok(app[field], `${field} is documented`);
  }
  assert.match(app.sourceStack, /WordPress\/PHP/);
  assert.match(app.sourceTests, /Ingen testkode/);
  assert.match(app.sourceApiAuthStoragePrivacy, /telefon/);
  assert.match(app.sourceApiAuthStoragePrivacy, /SHA-256/);
  assert.match(app.rightsUncertainty, /GPL-2\.0-or-later/);
  assert.match(app.routeState, /unik eksisterende/);
  const html = read('vibe/reservering/index.html');
  assert.match(html, /Kun syntetiske eksempeldata/);
  assert.match(html, /kan ikke velges eller reserveres/);
  assert.doesNotMatch(html, /<form\b|<input\b|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|https?:\/\//i);
});
