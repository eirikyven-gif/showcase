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
const version = readFileSync(new URL('../../VERSION', base), 'utf8').trim();

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

test('native draft, publish, trash, restore, source filters, and dashboard scope are modeled locally', () => {
  assert.match(js, /postStatus==='publish'/);
  assert.match(js, /postStatus==='trash'/);
  assert.match(js, /data-restore-item/);
  assert.match(js, /data-permanent-delete-item/);
  assert.match(js, /invPostStatus/);
  assert.match(js, /hul_status/);
  assert.match(js, /data-cancel-quick/);
  assert.match(js, /recent=\[\.\.\.published\]\.sort/);
});

test('taxonomy assignment, loan edge validation, linked synthetic fixtures, and referential cleanup exist', () => {
  for (const behavior of [
    'data-assigned-term',
    'Planlagt retur kan ikke være før utlånsdato',
    'Samme lagervare kan bare velges én gang',
    "n===10?[1,5,8]:n===2?[1]:[]",
    "name:'[TESTDATA] Syntetisk arrangementsutstyr'",
    'removeItemAndReferences',
    "b.test||usedBorrowers.has(b.id)",
  ]) assert.ok(js.includes(behavior), `missing ${behavior}`);
  assert.match(js, /db\.lists=db\.lists\.filter\(l=>!l\.test&&!l\.items\.some/);
});

test('source-parity corrections and v0.60.6 release tracking stay in this route', () => {
  assert.equal(version, '0.60.6');
  assert.match(routeEntry.routeState, /patch v0\.60\.6 på main v0\.60\.5/);
  assert.match(routeEntry.routeState, /PR #94 er rebased/);
  assert.match(js, /function isListExpired/);
  assert.match(js, /ZIP64/);
  assert.match(js, /aria-labelledby','textPromptTitle'/);
  assert.match(js, /packageChoices/);
});
