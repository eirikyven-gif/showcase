import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('vibe/emnebeskrivelser-editor/index.html');
const catalog = JSON.parse(read('vibe/catalog.json'));
const app = catalog.apps.find((entry) => entry.slug === 'emnebeskrivelser-editor');

test('emnebeskrivelser editor replaces concept placeholder with source-backed app and metadata', () => {
  assert.ok(app);
  assert.equal(catalog.apps.filter((entry) => entry.slug === 'emnebeskrivelser-editor').length, 1);
  for (const field of ['status', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState', 'sourceUncertainty']) {
    assert.equal(typeof app[field], 'string', `${field} is documented`);
    assert.ok(app[field].trim());
  }
  assert.match(app.source, /d5bc306bc9f017354bd487ff8608b0659196e4dd/);
  assert.match(html, /Emnebeskrivelser-editor · Vibe-demo/);
  assert.match(html, /href="\.\.\/"/);
  assert.match(html, /Syntetisk demonstrasjon/);
  assert.match(html, /Syntetisk fagansvarlig/);
  assert.match(html, /href="\.\.\/"/);
  assert.equal(read('VERSION').trim(), '0.61.0');
});

test('the core source workflows remain present in the isolated route', () => {
  for (const text of [
    'Nyhetsbulletin', 'Generell informasjon', 'Fremdriftsplan', 'Oppgaver', 'Pensum', 'Arbeidskrav', 'Eksamen',
    'insertLocalImage', 'insertLocalTopImage', 'insertTable', 'insertSectionTemplate', 'createOrUpdateToc',
    'createResourceOverview', 'accessibilityReport', 'offlineStatusReport', 'previewAsStudent', 'exitStudentPreview',
    'exportEditable', 'exportReadOnly', 'saveSnapshot', 'restoreSnapshot', 'undoDelete', 'toggleMenu',
  ]) assert.ok(html.includes(text), `source workflow ${text} remains`);
  assert.match(html, /Lagre redigerbar HTML/);
  assert.match(html, /Lagre skrivebeskyttet HTML/);
  assert.match(html, /Tilbake til redigering/);
  assert.match(html, /aria-modal="true"/);
});

test('edits remain browser-local and full reset removes content, palette and snapshots', () => {
  assert.match(html, /localStorage\.setItem\(storageKey/);
  assert.match(html, /localStorage\.setItem\(snapshotKey/);
  assert.match(html, /localStorage\.removeItem\(storageKey\)/);
  assert.match(html, /localStorage\.removeItem\(paletteKey\)/);
  assert.match(html, /localStorage\.removeItem\('emneside-editor-v1-6-0-snapshots'\)/);
  assert.match(html, /Nullstill lokalt lagret innhold/);
  assert.match(html, /Ingenting sendes til en server/);
  assert.match(html, /personopplysninger/i);
});

test('route does not make external requests or copy source secrets/authentication', () => {
  assert.doesNotMatch(html, /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource)\s*\(/i);
  assert.doesNotMatch(html, /<script\s+src=/i);
  assert.doesNotMatch(html, /<link[^>]+href=["']https?:/i);
  assert.doesNotMatch(html, /<img[^>]+src=["']https?:/i);
  assert.doesNotMatch(html, /edit-pin-config|PBKDF2|api[_-]?key|bearer\s+[A-Za-z0-9._-]+/i);
  assert.match(html, /Eksterne bilder er deaktivert/);
  assert.match(html, /Content-Security-Policy/);
  assert.match(html, /connect-src \'none\'/);
  assert.match(html, /Eksterne lenker er deaktivert/);
  assert.match(html, /readAsDataURL/);
});

test('page has a keyboard focus indicator and responsive viewport support', () => {
  assert.match(html, /name="viewport"/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /@media\s*\(max-width:\s*760px\)/);
  assert.match(html, /<html lang="nb">/);
  assert.match(html, /role="status"|aria-live="polite"/);
});
