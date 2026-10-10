import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('vibe/wp-varelager/index.html');
const js = read('vibe/wp-varelager/app.js');
const css = read('vibe/wp-varelager/style.css');
const audit = read('vibe/wp-varelager/PARITY.md');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('source provenance is pinned and the unresolved parity state is explicit', () => {
  assert.equal(read('VERSION').trim(), '0.61.0');
  assert.equal(catalog.apps.length, 42);
  const app = catalog.apps.find(item => item.slug === 'wp-varelager');
  assert.ok(app);
  assert.match(app.source, /e080136b7b0bc20e1885c9c9456f7143ca170861/);
  assert.match(app.sourceUncertainty, /7506300fcd587546f7772e1cab4d55293bd7b947/);
  assert.match(app.status, /kandidat|simulator|demonstrasjon/i);
  assert.match(audit, /Status: incomplete/i);
  assert.match(audit, /PR #90 must stay draft/i);
  assert.match(html, /Syntetisk demonstrasjon/);
  assert.match(html, /ingenting lastes opp eller lagres ved omlasting/);
});

test('portal exposes the source six tabs, with known subarea gaps documented', () => {
  const tabs = [...html.matchAll(/data-tab="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(tabs, ['varer', 'utleie', 'rapporter', 'delte', 'import', 'innstillinger']);
  for (const token of ['render()', 'itemForm(', 'rentalView(', 'reportsView(', 'sharesView(', 'importView(', 'countsView(', 'settingsView(']) assert.ok(js.includes(token), token);
  for (const gap of ['contact detail', 'distinct admin screens', 'CSV', 'delta', 'source CSV/XLSX schemas']) assert.match(audit, new RegExp(gap, 'i'));
});

test('source supported item and rental workflows are represented, without claiming parity', () => {
  for (const action of ['add-item', 'edit-item', 'detail-instance', 'add-instance', 'edit-instance', 'delete-instance', 'add-attachment', 'view-attachment', 'delete-attachment', 'add-note', 'edit-meta', 'layout-gallery', 'wizard-next', 'wizard-add-line', 'wizard-remove-line', 'wizard-create', 'activate-rental', 'return-rental']) {
    assert.ok(js.includes(`'${action}'`) || js.includes(`"${action}"`), `${action} action exists`);
  }
  for (const feature of ['Serienummer', 'Tilstand', 'Instruks', 'Notater', 'Historikk', 'Størrelse', 'Vekt (gram)', 'Grupper', 'Tabell', 'Galleri']) assert.ok(js.includes(feature), feature);
  assert.match(audit, /incomplete/i);
  assert.match(audit, /unsupported controls/i);
});

test('tenant list/detail fields, rental history, and synthetic contact notes are represented', () => {
  for (const token of ['view-contact', 'close-contact', 'add-contact-note', 'org_number', 'Utleiehistorikk', 'Demo-bruker (syntetisk)']) assert.ok(js.includes(token), token);
  assert.match(js, /function contactDetail\(c\)/);
  assert.match(js, /if\(contact\)fields\.push\(field\('note'/, 'source add form omits note; edit form includes it');
  assert.match(audit, /contact detail/i);
});

test('reports nest stock count and expose source absolute/delta controls with required reason', () => {
  assert.match(js, /data-report-sub="lageropptelling"/);
  assert.match(js, /value="opptelling">Opptelling \(absolutt antall\)/);
  assert.match(js, /value="justering">Justering \(\+\/- delta\)/);
  assert.match(js, /data-count-reason=.*required/);
  assert.match(js, /if\(!reason\.value\.trim\(\)\)/);
  assert.doesNotMatch(html, /data-tab="opptelling"/);
});

test('local import/export, synthetic sharing and safety boundaries are explicit', () => {
  assert.match(js, /function parseCsv/);
  assert.match(js, /function downloadXlsx/);
  assert.match(js, /function log/);
  assert.match(js, /Ingen ekte URL, token eller ekstern tilgang/i);
  assert.match(audit, /Import\/export/i);
  for (const source of [html, css]) {
    assert.doesNotMatch(source, /https?:\/\//i);
    assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|document\.cookie|wp_ajax|wp_remote_|wp_nonce)\b/i);
    assert.doesNotMatch(source, /password\s*[:=]|secret\s*[:=]|bearer\s+/i);
  }
  assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b|upload_to_server|wp_handle_upload/i);
  assert.doesNotMatch(js, /FormData\([^)]*files/i);
  assert.match(html, /href="\/vibe\/assets\/hub\.css"/);
  assert.match(css, /:focus-visible/);
});
