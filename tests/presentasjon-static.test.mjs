import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('removed fictional Presentasjonsvisning has no exhibition route or catalog entry', () => {
  assert.equal(catalog.apps.some((app) => app.slug === 'presentasjon'), false);
  assert.equal(existsSync(new URL('../vibe/presentasjon/', import.meta.url)), false);
  assert.equal(read('VERSION').trim(), '1.1.1', 'removing an established route is a breaking SemVer change');
  assert.equal(catalog.apps.length, 40, 'after the Presentasjon and Hegra removals in v1.0.0');
});
