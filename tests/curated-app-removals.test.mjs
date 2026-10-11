import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const catalog = JSON.parse(readFileSync(new URL('../vibe/catalog.json', import.meta.url), 'utf8'));
const removed = [
  'bilag-v5',
  'bilag',
  'wp-l-ringssti',
  'ns3424-arkivdemo',
  'vibe-coding',
  'vurderingspraksis',
  'kornseddel',
  'vinterlagring-fornes',
  'progresjonsplan',
  'lagerstyring-hell-ultra',
  'hul-lagerstyring',
  'wp-varelager',
];

test('curated routes and catalog entries are removed for the v2 breaking release', () => {
  assert.equal(readFileSync(new URL('../VERSION', import.meta.url), 'utf8').trim(), '2.0.0');
  assert.equal(catalog.apps.length, 28);
  for (const slug of removed) {
    assert.equal(catalog.apps.some((app) => app.slug === slug), false, `${slug} is absent from the hub catalog`);
    assert.equal(existsSync(new URL(`../vibe/${slug}/`, import.meta.url)), false, `${slug} route files are absent`);
  }
});
