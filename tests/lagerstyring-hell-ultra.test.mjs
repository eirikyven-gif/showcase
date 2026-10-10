import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const base = new URL('../vibe/lagerstyring-hell-ultra/', import.meta.url);
const html = readFileSync(new URL('index.html', base), 'utf8');
const js = readFileSync(new URL('app.js', base), 'utf8');
const css = readFileSync(new URL('style.css', base), 'utf8');
const readme = readFileSync(new URL('README.md', base), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../../vibe/catalog.json', base), 'utf8'));
const routeEntry = catalog.apps.find((entry) => entry.slug === 'lagerstyring-hell-ultra');

test('route shell exposes role simulation and clearly marks synthetic data', () => {
  assert.match(html, /DEMO · syntetiske data/);
  assert.match(html, /Besøkende/);
  assert.match(html, /Lageransvarlig \(simulert\)/);
});

test('public and admin source workflows are represented', () => {
  for (const flow of ['Lageroversikt', 'Sorter etter', 'Grupper etter', 'Kort', 'Liste', 'Aktivt utlån', 'Utlånshistorikk', 'Denne listen har utløpt', 'copyList', 'data-quick-field', 'Aktive enkeltlån (eldre registreringer)', 'addSub', 'mediaFiles', 'createExtended', 'confirmImport', 'templateXlsx', 'data-edit-loan', 'data-return-legacy']) assert.ok(js.includes(flow), `missing ${flow}`);
  assert.match(js, /#\/item\//);
  assert.match(js, /#\/list\//);
});

test('runtime has no source tokens, network, auth or persistent browser storage', () => {
  assert.doesNotMatch(js, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|wp_generate_password|hul_lager_item_token/);
  assert.match(readme, /ingen WP-auth, API|Ingen konto|WordPress-brukerinnlogging/);
  assert.match(readme, /WordPress-side som administratoren selv velger/);
});

test('catalog records mapping uncertainty, source SHA, safety boundary, and partial issue scope', () => {
  assert.equal(routeEntry.source.includes('f1f13246677d15de24e84070d8dad74f2a0376ee'), true);
  assert.match(routeEntry.sourceUncertainty, /portalens permanente side-slug kan ikke utledes/);
  assert.match(routeEntry.scope, /#\/item/);
  assert.match(routeEntry.scope, /nettverkskall/i);
  assert.match(routeEntry.routeState, /issue #2 delvis løst/i);
});

test('responsive and keyboard-focus styling is present', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\(max-width:560px\)/);
  assert.match(css, /@media\(max-width:850px\)/);
});
