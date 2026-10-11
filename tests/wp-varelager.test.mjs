import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('vibe/wp-varelager/index.html');
const js = read('vibe/wp-varelager/app.js');
const css = read('vibe/wp-varelager/style.css');
const audit = read('vibe/wp-varelager/PARITY.md');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('source provenance is pinned and safe local parity boundaries remain explicit', () => {
  assert.equal(read('VERSION').trim(), '1.1.1');
  assert.equal(catalog.apps.length, 40);
  const app = catalog.apps.find(item => item.slug === 'wp-varelager');
  assert.ok(app);
  assert.match(app.source, /e080136b7b0bc20e1885c9c9456f7143ca170861/);
  assert.match(app.status, /PR #90 merged as v0\.61\.0/i);
  assert.match(app.status, /deployment #38123085728 succeeded/i);
  assert.match(app.routeState, /Stable existing route \/vibe\/wp-varelager\//);
  assert.match(app.routeState, /merged as v0\.61\.0.*deploy run #38123085728 succeeded/i);
  assert.match(app.routeState, /no real auth\/authorization.*volatile page memory/i);
  assert.doesNotMatch(app.routeState, /draft|not deployed|proposes v0\.61\.0/i);
  assert.match(app.sourceUncertainty, /7506300fcd587546f7772e1cab4d55293bd7b947/);
  assert.match(audit, /local equivalents/i);
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
  assert.match(js, /blankOption:'-- Velg --'/);
  assert.match(js, /opts\(db\.statuses,db\.statuses\[0\],'--'\)/);
  assert.match(js, /opts\(db\.locations,db\.locations\[0\],'--'\)/);
  assert.match(js, /start\.reportValidity\(\);end\.reportValidity\(\)/);
  assert.ok(js.includes("field('sku',item?'SKU *':'SKU',x.sku,'text',{required:!!item})"));
  assert.match(js, /candidate=`AUTO-/);
  assert.match(js, /i\.id!==item\.id&&i\.sku\.toLowerCase\(\)===data\.sku\.toLowerCase\(\)/);
  assert.match(js, /function sortedMetaFields\(activeOnly=false\)/);
  assert.match(js, /existing\.key===key/);
  assert.match(js, /\[a-z0-9_\]\{1,64\}/);
  assert.doesNotMatch(js, /it\.meta\[key\]=it\.meta\[old\]/);
  assert.doesNotMatch(js, /form\.reportValidity\(\)/);
});

test('safety simplifications are explicit; only source view preference uses browser storage', () => {
  assert.match(html, /Ingen WordPress, PHP, innlogging, server, database eller API er tilkoblet/i);
  assert.match(js, /hu_inv_view_mode/);
  assert.doesNotMatch(js, /\b(fetch|XMLHttpRequest|WebSocket|EventSource)\b|upload_to_server|wp_handle_upload/i);
  assert.doesNotMatch(js, /sessionStorage|indexedDB|document\.cookie/);
  assert.match(js, /mailto:\$\{encodeURIComponent\(c\.email\)\}/);
  assert.match(js, /@example\.invalid/);
  assert.match(js, /ingen privat delingsressurs, bearer-token eller e-post opprettes/i);
  assert.match(js, /Ingen dokumentbytes er lastet opp eller lagret/);
  assert.match(js, /#share-preview/);
  assert.match(js, /Ruten kopiert|Tokenløs lokal forhåndsvisningsrute kopiert/);
  for (const source of [html, css]) {
    assert.doesNotMatch(source, /https?:\/\//i);
    assert.doesNotMatch(source, /sessionStorage|indexedDB|document\.cookie|wp_ajax|wp_remote_|wp_nonce/i);
    assert.doesNotMatch(source, /password\s*[:=]|secret\s*[:=]|bearer\s+/i);
  }
  assert.match(html, /href="\/vibe\/assets\/hub\.css"/);
  assert.match(css, /:focus-visible/);
});

test('source capabilities have local role presets and individual in-memory gates', () => {
  for (const cap of ['hu_inventory_read','hu_inventory_manage_items','hu_inventory_manage_categories','hu_inventory_manage_locations','hu_inventory_manage_attachments','hu_inventory_manage_notes','hu_inventory_manage_contacts','hu_inventory_manage_rentals','hu_inventory_manage_import_export','hu_inventory_view_reports']) assert.ok(js.includes(`'${cap}'`), cap);
  for (const role of ['administrator','manager','reader','visitor','custom']) assert.ok(html.includes(`value="${role}"`), role);
  assert.match(js, /function hasCap\(cap\)/);
  assert.match(js, /function actionCapability\(button\)/);
  assert.match(html, /Valget simulerer UI-gating/);
  assert.match(html, /ikke innlogging eller sikkerhetskontroll/);
  assert.match(audit, /Local role selector presets/i);
});

test('share and attachment source interactions map to safe local previews and metadata lifecycle', () => {
  assert.match(js, /function sharePreviewView\(\)/);
  assert.match(js, /id="share-list"/);
  assert.match(js, /category=document\.querySelector\('#share-list'\)\.value/);
  assert.match(js, /slug=shareSlugFor\(category,scenario\)/);
  assert.match(js, /db\.shares\.push\(\{id:id\(\),label,category,scenario,slug/);
  assert.match(js, /id="share-expiry-scenario"/);
  assert.match(js, /function resolveShareSlug\(slug\)/);
  assert.match(js, /2099-12-31/);
  assert.match(js, /2000-01-01/);
  assert.match(js, /id="share-preview-date"/);
  assert.match(js, /Utløpt \(simulert\)/);
  assert.match(js, /const SYNTHETIC_SHARE_ITEMS=makeDefaults\(\)\.items\.map/);
  assert.match(js, /items=category===null\?\[\]:SYNTHETIC_SHARE_ITEMS\.filter\(i=>category==='all'\|\|i\.category===category\)/);
  assert.match(js, /function shareRouteUrl\(share\)/);
  assert.match(js, /resolveShareSlug\(slug\)/);
  assert.match(js, /data-action="copy-share-route"/);
  assert.match(js, /location\.origin\}\$\{location\.pathname\}#share-preview\/\$\{encodeURIComponent\(fixture\?\.slug\|\|''\)\}/);
  assert.doesNotMatch(js, /shareRouteUrl\([^)]*label|shareRouteUrl\([^)]*contactId|shareRouteUrl\([^)]*id/);
  assert.match(js, /function fixturePreview\(fixture\)/);
  assert.match(js, /Slett vedleggsmetadata/);
  assert.match(js, /synthetic-inventory-photo\.png/);
  assert.match(js, /synthetic-instructions\.pdf/);
  assert.match(js, /type="file" accept="\.jpg,\.jpeg,\.png,\.pdf,\.docx/);
  assert.match(js, /let attachmentDraftFile=null,activeAttachmentUrl=null/);
  assert.match(js, /URL\.createObjectURL\(a\.file\)/);
  assert.match(js, /URL\.revokeObjectURL\(activeAttachmentUrl\)/);
  assert.match(js, /file:selected\|\|null/);
  assert.match(js, /attachmentDraftFile\.size>10\*1024\*1024/);
  assert.match(js, /id="attachment-reset"/);
  assert.match(css, /\.detail-grid>\*\{min-width:0;max-width:100%\}/);
  assert.match(js, /localStorage\.setItem\('hu_inv_view_mode'/);
  assert.doesNotMatch(js, /localStorage\.setItem\([^\n]*(?:attachment|vedlegg)|fetch\([^\n]*(?:attachment|vedlegg)/i);
  assert.match(audit, /selected File reference, label, category and type stay in page memory/i);
  assert.match(audit, /tokenless route/i);
});
