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
  assert.match(app.sourceStack, /window\.print/);
  assert.match(app.sourceApiAuthStoragePrivacy, /sideøkt/);
  assert.match(app.rightsUncertainty, /gjenbrukstillatelse/);
  assert.match(app.routeState, /Eksisterende \/vibe\/kornseddel\//);
  assert.match(app.routeState, /VERSION 0\.54\.0; foreslått 0\.55\.0/);
  assert.equal(catalog.apps.length, 39);
});

test('Kornfølgeseddel retains the editable source workflow with synthetic defaults and no persistent storage', () => {
  const html = read('vibe/kornseddel/index.html');
  const js = read('vibe/kornseddel/app.js');
  const docs = read('vibe/kornseddel/README.md');
  assert.match(html, /class="brand"/);
  assert.match(html, /Syntetisk demonstrasjon/);
  assert.match(html, /Eksempelperson/);
  assert.match(html, /Eksempelvei/);
  assert.match(html, /0000000000/);
  assert.match(html, /id="print"/);
  assert.equal((html.match(/type="radio" name="crop"/g) || []).length, 8);
  assert.match(html, /name="signature"/);
  assert.match(html, /name="glyphosate"/);
  assert.match(js, /copyMarkup\.repeat\(3\)/);
  assert.match(js, /addEventListener\('input', syncCopies\)/);
  assert.match(js, /window\.print\(\)/);
  assert.match(js, /addEventListener\('click'/);
  assert.match(docs, /Kilde-repoet/);
  assert.match(html, /<form\b/);
  assert.match(html, /<input\b/);
  assert.doesNotMatch(`${html}\n${js}`, /fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|https?:\/\//i);
  assert.doesNotMatch(html, /Gry Fornes|Dalsensvegen 8|404 13 773|5035017960/);
});

test('Kornfølgeseddel has responsive, keyboard-visible and print-only layout rules', () => {
  const html = read('vibe/kornseddel/index.html');
  const css = read('vibe/kornseddel/style.css');
  assert.match(html, /<form class="slip"/);
  assert.match(html, /id="print"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width/);
  assert.match(css, /@media\s+print/);
});
