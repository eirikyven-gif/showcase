import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const catalog = JSON.parse(readFileSync(new URL('../vibe/catalog.json', import.meta.url), 'utf8'));

test('Emneoversikt candidate assessment records source controls and keeps its existing synthetic route', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'emnebeskrivelser-editor');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['name', 'useCase', 'category', 'audience', 'status', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'routeState', 'sourceUncertainty']) {
    assert.ok(app[field], `${field} is documented`);
  }
  assert.match(app.status, /Kandidat beholdt i bred førstegangsrunde/);
  assert.match(app.sourceStack, /offline/i);
  assert.match(app.sourceTests, /ingen package.json/);
  assert.match(app.sourceApiAuthStoragePrivacy, /localStorage/);
  assert.match(app.sourceApiAuthStoragePrivacy, /PIN-varianten er ikke kopiert/);
  assert.match(app.rightsUncertainty, /ingen funnet lisens/);
  assert.match(app.routeState, /Eksisterende \/vibe\/emnebeskrivelser-editor/);
  assert.equal(catalog.apps.filter((entry) => entry.slug === 'laringssti-fagskolen').length, 1);
});
