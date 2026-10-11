import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('removed fictional Presentasjonsvisning has no exhibition route or catalog entry', () => {
  assert.equal(catalog.apps.some((app) => app.slug === 'presentasjon'), false);
  assert.equal(existsSync(new URL('../vibe/presentasjon/', import.meta.url)), false);
  assert.equal(read('VERSION').trim(), '2.0.0', 'removing an established route is a breaking SemVer change');
  assert.equal(catalog.apps.length, 28, 'after the curated removals in v2.0.0');
});
