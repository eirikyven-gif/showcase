import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Dugnadsplanlegging has a complete broad-round assessment without a duplicate route', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'dugnadsplanlegging');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['name','useCase','category','audience','status','sourceUncertainty','purpose','demoValue','simplifications','risk','scope','source','sourceStack','sourceTests','sourceApiAuthStoragePrivacy','rightsUncertainty','routeState']) {
    assert.ok(app[field], `${field} is documented`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsrunde/);
  assert.match(app.source, /diverse-apper\/apps\/dugnadsplanlegging/);
  assert.match(app.sourceTests, /ingen test-script/i);
  assert.match(app.sourceApiAuthStoragePrivacy, /e-post og telefon/i);
  assert.match(app.rightsUncertainty, /uttrykkelig gjenbrukstillatelse/i);
  assert.match(app.routeState, /Eksisterende unik/);
  assert.equal(catalog.apps.length, 39);
});

test('Dugnadsplanlegging uses only synthetic memory-only assignments', () => {
  const html = read('vibe/dugnadsplanlegging/index.html');
  const js = read('vibe/dugnadsplanlegging/app.js');
  const docs = read('vibe/dugnadsplanlegging/README.md');
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /Syntetisk eksempel/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="reset-plan"/);
  assert.match(js, /const roster = \['Deltaker A', 'Deltaker B', 'Deltaker C', 'Deltaker D'\]/);
  assert.match(js, /planStatus\.textContent/);
  assert.match(js, /renderShifts\(\)/);
  assert.match(docs, /SSoT v1\.0/);
  assert.doesNotMatch(`${html}\n${js}`, /<form\b|<input\b|<textarea\b|fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|https?:\/\//i);
  assert.doesNotMatch(`${html}\n${js}`, /@|\+47|[0-9]{8}/);
});

test('Dugnadsplanlegging is keyboard-labeled and responsive', () => {
  const html = read('vibe/dugnadsplanlegging/index.html');
  const css = read('vibe/dugnadsplanlegging/style.css');
  assert.match(html, /class="skip-link"/);
  assert.match(read('vibe/dugnadsplanlegging/app.js'), /label\.htmlFor = `participant-\$\{shift\.id\}`/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\(max-width:650px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
