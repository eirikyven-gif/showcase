import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Kornfølgeseddel has complete broad-round metadata and retains one existing route', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'kornseddel');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['name','useCase','category','audience','status','sourceUncertainty','purpose','demoValue','simplifications','risk','scope','source','sourceStack','sourceTests','sourceApiAuthStoragePrivacy','rightsUncertainty','routeState']) {
    assert.ok(app[field], `${field} is documented`);
  }
  assert.match(app.status, /Beholdt i bred førstegangsvurdering/);
  assert.match(app.source, /apps-fornes-gard\/apps\/kornseddel/);
  assert.match(app.sourceTests, /Ingen package\.json/);
  assert.match(app.sourceApiAuthStoragePrivacy, /sideøkt/);
  assert.match(app.rightsUncertainty, /gjenbrukstillatelse/);
  assert.match(app.routeState, /Eksisterende unik/);
  assert.equal(catalog.apps.length, 39);
});

test('Kornfølgeseddel contains only fixed synthetic content and opens the native print dialog', () => {
  const html = read('vibe/kornseddel/index.html');
  const js = read('vibe/kornseddel/app.js');
  const docs = read('vibe/kornseddel/README.md');
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /Kun oppdiktede eksempeldata/);
  assert.match(html, /Eksempelgård/);
  assert.match(html, /Prøvemottak/);
  assert.match(html, /PRØVE-026/);
  assert.match(html, /id="print-button"/);
  assert.match(js, /window\.print\(\)/);
  assert.match(js, /addEventListener\('click'/);
  assert.match(docs, /Kilde-repoet/);
  assert.doesNotMatch(`${html}\n${js}`, /<form\b|<input\b|<textarea\b|fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|https?:\/\//i);
});

test('Kornfølgeseddel has responsive, keyboard-visible and print-only layout rules', () => {
  const html = read('vibe/kornseddel/index.html');
  const css = read('vibe/kornseddel/style.css');
  assert.match(html, /class="skip-link"/);
  assert.match(html, /id="print-status"[^>]*aria-live="polite"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width/);
  assert.match(css, /@media\s+print/);
});
