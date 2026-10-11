import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../vibe/bilag-v5/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../vibe/bilag-v5/app.js', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../vibe/bilag-v5/README.md', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../vibe/catalog.json', import.meta.url), 'utf8'));
const entry = catalog.apps.find((item) => item.slug === 'bilag-v5');

test('Bilag v5 has one direct route, source-pinned metadata, and source faithful controls', () => {
  assert.ok(entry);
  assert.match(entry.source, /apps-fornes-gard\/apps\/bilag-v5.*90014358fb3d70e89265b2b30d38e9376a6927b2/);
  assert.match(entry.scope, /localStorage.*syntetiske/i);
  for (const id of ['run-pdf', 'run-zip', 'reset-demo', 'fail-next', 'retry-file', 'pdf-rows', 'zip-rows', 'log-rows']) assert.match(html, new RegExp(`id="${id}"`));
  for (const action of ['runPdf', 'runZip', 'validateZipName', 'uniqueName']) assert.match(app, new RegExp(`function ${action}\\(`));
  assert.match(docs, /Kildeparitet i demoen/);
  assert.match(docs, /AutomationTest\.gs.*ZipImportTest\.gs/);
});

test('PDF behavior preserves supported types, skip rules, retry cap, and two-step conversion flow', () => {
  for (const mime of ['application/pdf', 'application/vnd.google-apps.document', 'application/vnd.google-apps.spreadsheet', 'image/jpeg', 'image/png', 'text/plain']) assert.ok(app.includes(mime));
  for (const token of ['MAX_ATTEMPTS = 3', 'MIME_TYPE_IKKE_STØTTET', 'USTABIL_ELLER_UBAR', 'RETRY_REQUESTED', 'KONVERTERT_OG_FLYTTET', 'FLYTTET', 'Dokumentasjon', 'MAX_RUNTIME']) assert.ok(app.includes(token));
  assert.match(html, /Originalen beholdes/);
});

test('ZIP behavior preserves path safety, idempotence, flattening, collisions, and isolated errors', () => {
  for (const token of ['ABSOLUT_STI', 'STIUTVIDELSE', 'MAPPEOPPFORING', 'NESTET_ZIP_IKKE_STOTTET', 'ALLEREDE_BEHANDLET', 'UGYLDIG_ELLER_KORRUPT_ZIP', 'OPPRETTET', 'synthetic-a']) assert.ok(app.includes(token) || html.includes(token));
  assert.match(app, /\(\$\{n\+\+\}\)/);
  assert.match(html, /flate|flates/);
});

test('demo has synthetic data only and no real file, network, or backend integration', () => {
  assert.match(html, /Alle navn, filer, innhold.*oppdiktet/);
  assert.match(html, /Ingen opplasting, nedlasting, parsing, PDF-konvertering/);
  assert.match(app, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(app, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.doesNotMatch(app, /\b(fetch|XMLHttpRequest|DriveApp|SpreadsheetApp|GoogleAppsScript|Utilities|FileReader|FormData|indexedDB)\b/);
  assert.doesNotMatch(`${html}\n${app}`, /1ImjOoUJSquuO27qOS4IydeWsTGfOqvE2|1P1mDFj7XZfpUV0UVrRaQyrFQ4dqi1mnNSPf24TzFP90|GEMINI_API_KEY/);
});


test('synthetic PDF, ZIP, retry, and reset interactions execute entirely in browser state', () => {
  const nodes = new Map();
  const storage = new Map();
  const element = (id) => {
    if (!nodes.has(id)) nodes.set(id, { id, dataset: {}, checked: false, hidden: false, disabled: false, innerHTML: '', textContent: '', handlers: {}, addEventListener(type, fn) { this.handlers[type] = fn; } });
    return nodes.get(id);
  };
  const sandbox = {
    document: { getElementById: element },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) },
    Intl, Date, JSON, Object, String, Number, Array, RegExp, console
  };
  vm.runInNewContext(app, sandbox);
  element('run-pdf').handlers.click();
  let state = JSON.parse(storage.get('vibe.bilag-v5.demo.v2'));
  assert.equal(state.runs.pdf, 5);
  assert.ok(element('pdf-rows').innerHTML.includes('Ferdig'));
  assert.ok(element('pdf-rows').innerHTML.includes('Blokkert'));
  element('run-zip').handlers.click();
  state = JSON.parse(storage.get('vibe.bilag-v5.demo.v2'));
  assert.equal(state.runs.zip, 2);
  assert.ok(element('zip-rows').innerHTML.includes('DEMO_kvittering (2).jpg'));
  assert.ok(element('log-rows').innerHTML.includes('STIUTVIDELSE'));
  assert.ok(element('log-rows').innerHTML.includes('NESTET_ZIP_IKKE_STOTTET'));
  element('retry-file').handlers.click({ currentTarget: element('retry-file') });
  state = JSON.parse(storage.get('vibe.bilag-v5.demo.v2'));
  assert.equal(state.pdf.find(file => file.id === 'demo-fail-3').attempts, 0);
  element('run-pdf').handlers.click();
  state = JSON.parse(storage.get('vibe.bilag-v5.demo.v2'));
  assert.equal(state.pdf.find(file => file.id === 'demo-fail-3').status, 'Ferdig');
  element('reset-demo').handlers.click();
  assert.equal(storage.has('vibe.bilag-v5.demo.v2'), false);
  assert.ok(element('pdf-rows').innerHTML.includes('Blokkert'));
});
