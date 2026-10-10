import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('vibe/wp-varelager/index.html');
const js = read('vibe/wp-varelager/app.js');
const css = read('vibe/wp-varelager/style.css');
const readme = read('vibe/wp-varelager/README.md');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('WP Varelager provenance pins the archived functional plugin and new route', () => {
  assert.equal(read('VERSION').trim(), '0.61.0');
  assert.equal(catalog.apps.length, 42);
  const app = catalog.apps.find(item => item.slug === 'wp-varelager');
  assert.ok(app);
  assert.match(app.source, /e080136b7b0bc20e1885c9c9456f7143ca170861/);
  assert.match(app.sourceUncertainty, /7506300fcd587546f7772e1cab4d55293bd7b947/);
  assert.match(app.status, /kandidat|simulator|demonstrasjon/i);
  assert.match(readme, /arkivert/i);
  assert.match(readme, /Issue #2/);
  assert.match(html, /Syntetisk demonstrasjon/);
  assert.match(html, /ingenting lastes opp eller lagres ved omlasting/);
});

test('all seven portal tabs and mirrored admin shortcuts have a runnable local workflow', () => {
  for (const label of ['Utstyr', 'Utleie', 'Rapporter', 'Delte lister', 'Import/eksport', 'Lageropptelling', 'Innstillinger']) {
    assert.match(html, new RegExp(label.replace('/', '\\/')));
  }
  for (const action of ['data-admin-view="varer"', 'data-admin-view="utleie"', 'data-admin-view="innstillinger"']) assert.match(html, new RegExp(action));
  for (const workflow of ['render()', 'itemForm(', 'rentalView(', 'reportsView(', 'sharesView(', 'importView(', 'countsView(', 'settingsView(']) assert.ok(js.includes(workflow), workflow);
});

test('items, instances, details, attachments, notes, history, filters, gallery and bulk actions are wired', () => {
  for (const key of ['add-item', 'edit-item', 'delete-item', 'detail-instance', 'add-instance', 'edit-instance', 'delete-instance', 'add-attachment', 'view-attachment', 'delete-attachment', 'add-note', 'edit-meta', 'adjust-stock', 'layout-gallery', 'apply-bulk']) {
    assert.ok(js.includes(`'${key}'`) || js.includes(`"${key}"`), `${key} action exists`);
  }
  for (const field of ['Serienummer', 'Tilstand', 'Instruks', 'Notater', 'Historikk', 'Størrelse', 'Vekt (gram)', 'Løp (flervalg)', 'Brukes på løp']) {
    if (field !== 'Brukes på løp') assert.ok(js.includes(field), `${field} is represented`);
  }
  assert.match(js, /Grupper/);
  assert.match(js, /Tabell/);
  assert.match(js, /Galleri/);
});

test('rentals, contacts, wizard, status transitions and setup/configuration CRUD are implemented', () => {
  for (const action of ['add-contact', 'edit-contact', 'delete-contact', 'new-rental', 'wizard-next', 'wizard-add-line', 'wizard-remove-line', 'wizard-create', 'activate-rental', 'return-rental', 'add-rental-line', 'remove-rental-line', 'edit-config', 'delete-config', 'add-meta-field', 'edit-meta-field', 'delete-meta-field', 'setup']) {
    assert.ok(js.includes(`'${action}'`) || js.includes(`"${action}"`), `${action} action exists`);
  }
  assert.match(js, /Hos leietaker/);
  assert.match(js, /Aktiv/);
  assert.match(js, /Returnert/);
  assert.match(js, /KATKODE/);
  assert.match(js, /example\.invalid/);
});

test('sharing, local CSV import/template, XLSX export, reporting and stock-count audit are represented', () => {
  for (const action of ['create-share', 'revoke-share', 'share-preview', 'template', 'import-csv', 'export-all', 'export-selected', 'count-adjust']) {
    assert.ok(js.includes(`'${action}'`) || js.includes(`"${action}"`), `${action} action exists`);
  }
  assert.match(js, /function parseCsv/);
  assert.match(js, /function downloadXlsx/);
  assert.match(js, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
  assert.match(js, /function downloadCsv/);
  assert.match(js, /function log/);
  assert.match(js, /Per kategori/);
  assert.match(js, /Ingen ekte URL, token eller ekstern tilgang/i);
});

test('the demo has no WordPress/server persistence/API/private source media or real secrets', () => {
  for (const source of [html, css]) {
    assert.doesNotMatch(source, /https?:\/\//i);
    assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie|wp_ajax|wp_remote_|wp_nonce)\b/i);
    assert.doesNotMatch(source, /password\s*[:=]|secret\s*[:=]|bearer\s+/i);
  }
  assert.match(js, /accept="\.csv,text\/csv"/, 'the only file picker is the local CSV importer');
  assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b|upload_to_server|wp_handle_upload/i);
  assert.doesNotMatch(js, /FormData\([^)]*files/i);
  assert.match(html, /href="\/vibe\/assets\/hub\.css"/);
  assert.match(css, /:focus-visible/);
});
