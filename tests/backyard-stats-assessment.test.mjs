import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Backyard candidate assessment distinguishes documented plans from the source scaffold', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'backyard-stats');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['name', 'useCase', 'category', 'audience', 'status', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState']) {
    assert.ok(app[field], `${field} is documented`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsvurdering/);
  assert.match(app.sourceStack, /ikke implementert/);
  assert.match(app.sourceTests, /Ingen testkode/);
  assert.match(app.sourceApiAuthStoragePrivacy, /maks én gang per minutt/);
  assert.match(app.sourceApiAuthStoragePrivacy, /ikke fastslått/);
  assert.match(app.rightsUncertainty, /GPL-2\.0-or-later/);
  assert.match(app.routeState, /unik eksisterende/);
  assert.match(read('vibe/backyard-stats/index.html'), /oppdiktet/i);
  assert.doesNotMatch(read('vibe/backyard-stats/index.html'), /<script\b|<form\b|<input\b|fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|indexedDB|https?:\/\//i);
});
