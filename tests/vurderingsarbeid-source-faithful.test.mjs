import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');
const html = read('vibe/vurderingsarbeid-fagskolen/index.html');
const catalog = JSON.parse(read('vibe/catalog.json'));
const entry = catalog.apps.find((app) => app.slug === 'vurderingsarbeid-fagskolen');
const sha = '73cb9eded2f6517e3ebfbed45bdaf8e70395dac3';

test('assessment route cites exact source commit and replaces prior concept metadata', () => {
  assert.ok(entry);
  assert.match(entry.source, new RegExp(sha));
  assert.match(entry.status, /Issue #2 delvis løst/);
  assert.match(entry.scope, /XLSX import/);
  assert.match(entry.sourceApiAuthStoragePrivacy, /localStorage/);
  assert.equal(read('VERSION').trim(), '0.60.0');
  assert.match(read('vibe/vurderingsarbeid-fagskolen/README.md'), new RegExp(sha));
});

test('source workflows remain available with synthetic learners and local reset', () => {
  for (const feature of [
    'downloadMal', 'importFromWorkbook', 'exportDatasett', 'scoreKriterium',
    'renderStudentOversikt', 'setStudentOversiktFilter', 'bekreftFlyttStudent',
    'nullstillVurdering', 'resetDemoData', 'Eksempelstudent A', 'Eksempelstudent B',
  ]) assert.ok(html.includes(feature), `route includes ${feature}`);
  assert.match(html, /Ikke importer ekte studentopplysninger/);
  assert.match(html, /localStorage\.removeItem\(LS_KEY\)/);
  assert.match(html, /localStorage\.setItem\(LS_KEY/);
  assert.match(html, /student-oversikt-table-scroll/);
  assert.match(html, /overflow-x:auto/);
  assert.ok(statSync(path.join(root, 'vibe/vurderingsarbeid-fagskolen/assets/xlsx.full.min.js')).isFile());
});

test('AI credentials, endpoints, and network calls are absent from runtime', () => {
  assert.doesNotMatch(html, /fetch\s*\(|XMLHttpRequest|https?:\/\//i);
  assert.doesNotMatch(html, /api\.openai\.com|generativelanguage\.googleapis|api\.anthropic\.com|API-nøkkel|AI_PROVIDER_CONFIG|saveAiKey/);
  assert.doesNotMatch(html, /cdn\.jsdelivr\.net/);
  assert.match(html, /assets\/xlsx\.full\.min\.js/);
});
