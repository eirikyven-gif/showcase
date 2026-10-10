import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');
const html = read('vibe/vurderingsarbeid-fagskolen/index.html');
const catalog = JSON.parse(read('vibe/catalog.json'));
const entry = catalog.apps.find((app) => app.slug === 'vurderingsarbeid-fagskolen');
const sha = '73cb9eded2f6517e3ebfbed45bdaf8e70395dac3';

test('assessment route cites exact source commit and current release metadata', () => {
  assert.ok(entry);
  assert.match(entry.source, new RegExp(sha));
  assert.match(entry.status, /Issue #2 delvis løst/);
  assert.match(entry.scope, /KI-fremovermelding\/sluttvurdering.*lokal deterministisk simulering/);
  assert.match(entry.sourceApiAuthStoragePrivacy, /localStorage/);
  assert.match(entry.routeState, /0\.60\.1.*0\.61\.0/);
  assert.equal(read('VERSION').trim(), '0.61.0');
  assert.match(read('vibe/vurderingsarbeid-fagskolen/README.md'), new RegExp(sha));
  assert.match(read('vibe/vurderingsarbeid-fagskolen/PARITY.md'), new RegExp(sha));
});

test('rubric, workbook, student/cohort, progress and reset workflows are present', () => {
  for (const feature of [
    'downloadMal', 'importFromWorkbook', 'exportDatasett', 'scoreKriterium',
    'renderStudentOversikt', 'setStudentOversiktFilter', 'bekreftFlyttStudent',
    'nullstillVurdering', 'resetDemoData', 'Eksempelstudent A', 'Eksempelstudent B',
    'Oppgavetekst', 'K0', 'btnImportkontroll',
  ]) assert.ok(html.includes(feature), `route includes ${feature}`);
  assert.match(html, /Ikke importer ekte studentopplysninger/);
  assert.match(html, /Eksempeloppgave/);
  assert.match(html, /Skriv en analyse av\.\.\./);
  assert.match(html, /Skriv som en faglig, nøktern og konkret støtte for faglærer/);
  assert.match(html, /localStorage\.removeItem\(LS_KEY\)/);
  assert.match(html, /localStorage\.setItem\(LS_KEY/);
  assert.match(html, /eksisterende arbeidsøkt er beholdt/);
  assert.match(html, /student-oversikt-table-scroll/);
  assert.match(html, /overflow-x:auto/);
  assert.ok(statSync(path.join(root, 'vibe/vurderingsarbeid-fagskolen/assets/xlsx.full.min.js')).isFile());
});

test('source feedback workflows remain with clear local simulation and manual prompt copy', () => {
  for (const id of [
    'tab-ki', 'panel-ki', 'btnKiFremover', 'btnKiFremoverCopy', 'kiFremoverText',
    'btnKiEndelig', 'btnKiEndeligCopy', 'kiEndeligText', 'globalKiStyring',
  ]) assert.match(html, new RegExp(`id="${id}"`), `source UI control ${id} exists`);
  for (const fn of [
    'buildAiClipboardText', 'buildDataPrompt', 'copyKiFremoverPrompt', 'copyKiEndeligPrompt',
    'genKiFremover', 'genKiEndelig', 'onKiFremoverEdit', 'onSlutttekstEdit',
    'godkjennSlutttekst', 'nullstillKiFremover', 'saveAiSettings', 'resetKiSettings',
  ]) assert.match(html, new RegExp(`function ${fn}\\(`), `source workflow ${fn} exists`);
  assert.match(html, /Lokal simulering/);
  assert.match(html, /Kopieringen sender ikke data fra nettleseren/);
  assert.match(html, /Alle ikke-K0-punkt må besvares/);
  assert.match(html, /Godkjenn som slutttekst/);
  assert.match(html, /Ikke besvart/);
  assert.match(html, /Stikkord for kriteriet/);
  assert.match(html, /computeSamletIndikator/);
  assert.match(html, /computeK0Status/);
});

test('all exact-source function declarations have an explicit implementation or security rationale', () => {
  const ledger = JSON.parse(read('vibe/vurderingsarbeid-fagskolen/FUNCTION-COVERAGE.json'));
  assert.equal(ledger.sourceCommit, sha);
  assert.equal(ledger.functionCount, 141);
  assert.equal(ledger.entries.length, ledger.functionCount);
  assert.equal(new Set(ledger.entries.map((entry) => entry.sourceFunction)).size, ledger.functionCount);
  for (const entry of ledger.entries) {
    assert.equal(entry.source, 'app/vurderingsverktoy.html');
    assert.ok(entry.line > 0, `${entry.sourceFunction} has a source line reference`);
    assert.ok(entry.note.length > 30, `${entry.sourceFunction} has a concrete coverage note`);
    if (entry.coverage === 'same-name') assert.match(html, new RegExp(`function ${entry.showcaseFunction}\\s*\\(`));
    else if (entry.coverage === 'local-equivalent') assert.ok(entry.showcaseFunction.split(' / ').every((name) => html.includes(name)));
    else {
      assert.equal(entry.coverage, 'security-removed');
      assert.equal(entry.showcaseFunction, null);
      assert.match(entry.note, /credential|provider|network|external|secret|KI|AI|service|API key/i);
    }
  }
});

test('source-generated workbook fixture is sanitized, complete and covered by browser QA', () => {
  const ledger = read('qa/vurderingsarbeid-browser.mjs');
  assert.match(ledger, /vurderingsarbeid-source-template-synthetic\.xlsx/);
  assert.match(ledger, /rubric scoring, progress filters, student reset and cohort move preserve assessment state/);
  assert.match(ledger, /dataset XLSX round trip/);
  assert.match(ledger, /keyboard focus/);
  assert.ok(statSync(path.join(root, 'tests/fixtures/vurderingsarbeid-source-template-synthetic.xlsx')).size > 10000);
  const fixture = createRequire(import.meta.url)('../vibe/vurderingsarbeid-fagskolen/assets/xlsx.full.min.js');
  const workbook = fixture.read(readFileSync(path.join(root, 'tests/fixtures/vurderingsarbeid-source-template-synthetic.xlsx')), { type: 'buffer' });
  assert.deepEqual(workbook.SheetNames, ['Veiledning', 'Rubrikk', 'Svarsett', 'Config', 'K_Thresholds', 'Studenter', 'Oppgavetekst']);
  const students = fixture.utils.sheet_to_json(workbook.Sheets.Studenter, { header: 1 }).slice(1);
  assert.deepEqual(students, [['DEMO-01', 'Eksempelstudent A', 'Syntetisk eksempelgruppe', ''], ['DEMO-02', 'Eksempelstudent B', 'Syntetisk eksempelgruppe', '']]);
});

test('no external AI credentials, provider services, network calls, or CDN enter runtime', () => {
  assert.doesNotMatch(html, /fetch\s*\(|XMLHttpRequest|api\.openai\.com|generativelanguage\.googleapis|api\.anthropic\.com|id="aiKey"|saveAiKey|AI_PROVIDER_CONFIG|cdn\.jsdelivr\.net/i);
  assert.match(html, /assets\/xlsx\.full\.min\.js/);
  assert.match(html, /API-nøkkelinnstillinger fra kildeappen er fjernet/);
});
