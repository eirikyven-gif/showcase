import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('vibe/wp-varelager/index.html');
const js = read('vibe/wp-varelager/app.js');
const css = read('vibe/wp-varelager/style.css');
const audit = read('vibe/wp-varelager/PARITY.md');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('source provenance is pinned and parity gaps remain explicit', () => {
  assert.equal(read('VERSION').trim(), '0.61.0');
  assert.equal(catalog.apps.length, 42);
  const app = catalog.apps.find(item => item.slug === 'wp-varelager');
  assert.ok(app);
  assert.match(app.source, /e080136b7b0bc20e1885c9c9456f7143ca170861/);
  assert.match(app.sourceUncertainty, /7506300fcd587546f7772e1cab4d55293bd7b947/);
  assert.match(audit, /Status: incomplete/i);
  assert.match(audit, /PR #90 stays draft/i);
  assert.match(html, /Syntetisk demonstrasjon/);
  assert.match(html, /ved omlasting/);
});

test('portal exposes source tabs, nested stock count, and source actions', () => {
  const tabs = [...html.matchAll(/data-tab="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(tabs, ['varer', 'utleie', 'rapporter', 'delte', 'import', 'innstillinger']);
  for (const token of ['itemView(', 'itemDetail(', 'instanceDetail(', 'contactsView(', 'rentalWorkflowView(', 'reportsView(', 'countsView(', 'settingsView(', 'adminView(']) assert.ok(js.includes(token), token);
  for (const token of ['toggle-add-menu', 'add-item', 'edit-item', 'add-instance', 'edit-instance', 'delete-instance', 'add-attachment', 'view-attachment', 'delete-attachment', 'add-note', 'edit-meta', 'activate-rental', 'return-rental', 'edit-rental']) assert.ok(js.includes(token), token);
  for (const token of ['Serienummer', 'Tilstandsnotat', 'Instruks', 'Notater', 'Historikk', 'Størrelse', 'Vekt (gram)', 'Grupper', 'Tabell', 'Galleri']) assert.ok(js.includes(token), token);
  assert.match(js, /data-report-sub="lageropptelling"/);
  assert.match(js, /data-count-reason=.*required/);
});

test('source agreements, admin areas, config fields and import/export schemas are represented', () => {
  for (const token of ['Kladd', 'Aktiv', 'Returnert', '1. Detaljer', '2. Varer', '3. Oversikt', 'contact_id', 'Startdato (AAAA-MM-DD)', 'Sluttdato (AAAA-MM-DD)', 'Avtaleopplysninger oppdatert lokalt']) assert.ok(js.includes(token), token);
  for (const token of ['data-admin-view="equipment"', 'data-admin-view="rental"', 'data-admin-view="settings"']) assert.ok(html.includes(token), token);
  assert.ok(js.includes('data-admin-rental-sub'));
  for (const field of ['field_key', 'label', 'type', 'unit', 'active', 'order', 'run_date', 'note']) assert.ok(js.includes(field), field);
  assert.match(js, /Navn','SKU','Enhet','Antall','Innkjøpspris','Estimert verdi','Notat/);
  assert.match(js, /ID','SKU','Navn','Kategori','Enhet','Antall','Innkjøpspris','Estimert verdi','Notat/);
  assert.match(js, /duplicate SKU|duplikat SKU/i);
  assert.match(audit, /Import\/export/i);
});

test('safety simplifications are explicit; only source view preference uses browser storage', () => {
  assert.match(html, /Ingen WordPress, PHP, konto, server, database eller API er tilkoblet/i);
  assert.match(js, /hu_inv_view_mode/);
  assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b|upload_to_server|wp_handle_upload/i);
  assert.doesNotMatch(js, /sessionStorage|indexedDB|document\.cookie/);
  assert.match(js, /mailto:\$\{encodeURIComponent\(c\.email\)\}/);
  assert.match(js, /@example\.invalid/);
  assert.match(js, /Ingen offentlig lenke eller e-post opprettet/);
  assert.match(js, /Ingen privat fil lastes opp/);
  for (const source of [html, css]) {
    assert.doesNotMatch(source, /https?:\/\//i);
    assert.doesNotMatch(source, /sessionStorage|indexedDB|document\.cookie|wp_ajax|wp_remote_|wp_nonce/i);
    assert.doesNotMatch(source, /password\s*[:=]|secret\s*[:=]|bearer\s+/i);
  }
  assert.match(html, /href="\/vibe\/assets\/hub\.css"/);
  assert.match(css, /:focus-visible/);
});
