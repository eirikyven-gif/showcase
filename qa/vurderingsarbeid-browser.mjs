import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const XLSX = createRequire(import.meta.url)('../vibe/vurderingsarbeid-fagskolen/assets/xlsx.full.min.js');

const baseUrl = process.env.ASSESSMENT_URL || 'http://127.0.0.1:4174/vibe/vurderingsarbeid-fagskolen/';
const artifactDir = process.env.QA_ARTIFACT_DIR || path.join(os.tmpdir(), 'vurderingsarbeid-qa');
let browser;
let page;
const errors = [];
const offOrigin = [];
const origin = new URL(baseUrl).origin;
const byId = (id) => page.locator(`#${id}`);
async function selectLearner(name) {
  const value = await byId('studentSelect').locator('option').evaluateAll((options, learnerName) => options.find((option) => option.textContent.startsWith(learnerName))?.value, name);
  assert.ok(value, `student selector contains ${name}`);
  await byId('studentSelect').selectOption(value);
}
async function selectCohort(name) {
  const value = await byId('kullSelect').locator('option').evaluateAll((options, cohortName) => options.find((option) => option.textContent.includes(cohortName))?.value, name);
  assert.ok(value, `cohort selector contains ${name}`);
  await byId('kullSelect').selectOption(value);
}

before(async () => {
  await mkdir(artifactDir, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  page = await browser.newPage({ viewport: { width: 1365, height: 900 }, acceptDownloads: true });
  page.setDefaultTimeout(8000);
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('404')) errors.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400 && !new URL(response.url()).pathname.endsWith('/favicon.ico')) errors.push(`HTTP ${response.status()} ${response.url()}`); });
  page.on('request', (request) => { if (new URL(request.url()).origin !== origin) offOrigin.push(request.url()); });
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
});

after(async () => { await browser?.close(); });

async function downloadTemplateAndImport() {
  const downloadWait = page.waitForEvent('download');
  await byId('btnMal').click();
  const download = await downloadWait;
  const workbookPath = path.join(artifactDir, 'vurderingsverktoy_mal.xlsx');
  await download.saveAs(workbookPath);
  await byId('btnImporter').click();
  await page.getByRole('button', { name: 'Ja, fortsett' }).click();
  await page.getByRole('button', { name: 'Nullstill og velg fil' }).click();
  const sourceWorkbookPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../tests/fixtures/vurderingsarbeid-source-template-synthetic.xlsx');
  await byId('fileInput').setInputFiles(sourceWorkbookPath);
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await byId('modalImportkontroll').getByRole('button', { name: /Lukk/ }).last().click();
  await selectLearner('Eksempelstudent A');
  await page.getByRole('tab', { name: 'Vurdering' }).click();
  return { showcaseWorkbookPath: workbookPath, sourceWorkbookPath };
}

async function completeVisibleAssessment(includeK0 = false) {
  const criterionTabs = await page.locator('#kritNav [role=tab]').all();
  for (const tab of criterionTabs) {
    const criterionName = await tab.innerText();
    if (!includeK0 && /formelle krav/i.test(criterionName)) continue;
    await tab.click();
    const grids = page.locator('#kritPanel .svar-grid');
    const count = await grids.count();
    for (let i = 0; i < count; i++) await grids.nth(i).locator('button').first().click();
  }
}

test('real generated XLSX imports, preserves source workbook content and is synthetic', async () => {
  await page.evaluate(() => localStorage.removeItem('vibe.vurderingsarbeid.demo.v1'));
  await page.reload({ waitUntil: 'networkidle' });
  const { showcaseWorkbookPath, sourceWorkbookPath } = await downloadTemplateAndImport();
  const sheetNames = ['showcase', 'source'].map((origin) => XLSX.read(readFileSync(origin === 'source' ? sourceWorkbookPath : showcaseWorkbookPath), { type: 'buffer' }).SheetNames);
  const expectedSheets = ['Veiledning', 'Rubrikk', 'Svarsett', 'Config', 'K_Thresholds', 'Studenter', 'Oppgavetekst'];
  assert.deepEqual(sheetNames, [expectedSheets, expectedSheets]);
  const sourceWorkbook = XLSX.read(readFileSync(sourceWorkbookPath), { type: 'buffer' });
  assert.deepEqual(XLSX.utils.sheet_to_json(sourceWorkbook.Sheets.Studenter, { header: 1 }).slice(1), [['DEMO-01', 'Eksempelstudent A', 'Syntetisk eksempelgruppe', ''], ['DEMO-02', 'Eksempelstudent B', 'Syntetisk eksempelgruppe', '']]);
  assert.deepEqual(await byId('studentSelect').locator('option').evaluateAll((options) => options.map((o) => o.textContent.trim()).filter((name) => /Eksempelstudent/.test(name)).map((name) => name.split(' (')[0])), ['Eksempelstudent A', 'Eksempelstudent B']);
  await page.getByRole('tab', { name: 'Eksport' }).click();
  await page.getByRole('button', { name: /Eksporter oppsummering/ }).click();
  assert.match(await byId('eksportTekst').innerText(), /Skriv en analyse av/);
  await page.getByRole('tab', { name: 'Vurdering' }).click();
  assert.doesNotMatch(await page.locator('body').innerText(), /Ola Nordmann|Kari Nordmann|@|fødselsnummer/i);

  const invalidWorkbook = XLSX.read(readFileSync(sourceWorkbookPath), { type: 'buffer' });
  invalidWorkbook.Sheets.Studenter = XLSX.utils.aoa_to_sheet([['Navn'], ['Syntetisk navn uten ID']]);
  const invalidPath = path.join(artifactDir, 'invalid-source-workbook.xlsx');
  writeFileSync(invalidPath, XLSX.write(invalidWorkbook, { bookType: 'xlsx', type: 'buffer' }));
  await byId('btnImporter').click();
  await page.getByRole('button', { name: 'Ja, fortsett' }).click();
  await page.getByRole('button', { name: 'Nullstill og velg fil' }).click();
  await byId('fileInput').setInputFiles(invalidPath);
  await byId('modalImportkontroll').waitFor({ state: 'visible' });
  assert.match(await byId('modalImportkontroll').innerText(), /Mangler kolonne: Student_id/);
  assert.equal(await byId('studentSelect').locator('option').evaluateAll((options) => options.filter((option) => option.textContent.includes('Eksempelstudent')).length), 2);
  assert.match(await page.locator('body').innerText(), /eksisterende arbeidsøkt er beholdt/);
  await byId('modalImportkontroll').getByRole('button', { name: /Lukk/ }).last().click();
});

test('rubric scoring, progress filters, student reset and cohort move preserve assessment state', async () => {
  await page.getByRole('tab', { name: 'Vurdering' }).click();
  await selectLearner('Eksempelstudent A');
  await completeVisibleAssessment(true);
  await selectLearner('Eksempelstudent B');
  await page.getByRole('tab', { name: 'Studentoversikt' }).click();
  await byId('studentOversiktFilterFremgang').selectOption('complete');
  assert.match(await byId('studentOversiktResultat').innerText(), /Viser 1 av 2/);
  assert.match(await byId('studentOversiktListe').innerText(), /Eksempelstudent A/);
  assert.doesNotMatch(await byId('studentOversiktListe').innerText(), /Eksempelstudent B/);
  await byId('studentOversiktFilterFremgang').selectOption('');
  await byId('studentOversiktFilterK0').selectOption('ok');
  assert.match(await byId('studentOversiktResultat').innerText(), /Viser 1 av 2/);
  await byId('studentOversiktFilterK0').selectOption('');
  await byId('studentOversiktFilterIndikator').selectOption('A');
  assert.match(await byId('studentOversiktResultat').innerText(), /Viser 1 av 2/);
  assert.match(await byId('studentOversiktListe').innerText(), /Eksempelstudent A/);
  await byId('studentOversiktFilterIndikator').selectOption('');
  await byId('studentOversiktSearch').fill('DEMO-02');
  assert.match(await byId('studentOversiktResultat').innerText(), /Viser 1 av 2/);
  assert.match(await byId('studentOversiktListe').innerText(), /Eksempelstudent B/);
  await byId('studentOversiktSearch').fill('');

  const duplicateDatasetWait = page.waitForEvent('download');
  await byId('btnDatasettExport').click();
  const duplicateDataset = await duplicateDatasetWait;
  const duplicateDatasetPath = path.join(artifactDir, 'duplicate-cohort.xlsx');
  await duplicateDataset.saveAs(duplicateDatasetPath);

  await page.getByRole('button', { name: '+ Nytt kull' }).click();
  await byId('nyttKullNavn').fill('Syntetisk duplikatkull');
  await page.getByRole('button', { name: /Opprett kull|Lagre/ }).click();
  const duplicateKull = await byId('kullSelect').locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Syntetisk duplikatkull'))?.value);
  await byId('kullSelect').selectOption(duplicateKull);
  await byId('btnDatasettImport').click();
  await byId('fileDatasetInput').setInputFiles(duplicateDatasetPath);
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await byId('modalImportkontroll').getByRole('button', { name: /Lukk/ }).last().click();
  await page.getByRole('button', { name: '+ Nytt kull' }).click();
  await byId('nyttKullNavn').fill('Syntetisk flyttekull');
  await page.getByRole('button', { name: 'Opprett kull' }).click();
  const sourceKull = await byId('kullSelect').locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Kull 1'))?.value);
  await byId('kullSelect').selectOption(sourceKull);
  await page.getByRole('tab', { name: 'Vurdering' }).click();
  await page.getByRole('tab', { name: 'Studentoversikt' }).click();
  await byId('studentOversiktListe').getByRole('row').filter({ hasText: 'Eksempelstudent A' }).getByRole('button', { name: '↪ Flytt' }).click();
  const moveDialog = page.locator('#modalFlyttStudent');
  await moveDialog.waitFor({ state: 'visible' });
  const conflictingTarget = await byId('flyttStudentSelect').locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Syntetisk duplikatkull'))?.value);
  await byId('flyttStudentSelect').selectOption(conflictingTarget);
  await moveDialog.getByRole('button', { name: 'Flytt student' }).click();
  assert.match(await byId('flyttStudentConflictMsg').innerText(), /finnes allerede i mål-kullet/);
  assert.match(await byId('studentOversiktListe').innerText(), /Eksempelstudent A/);
  await moveDialog.getByRole('button', { name: 'Avbryt' }).click();
  await byId('studentOversiktListe').getByRole('row').filter({ hasText: 'Eksempelstudent A' }).getByRole('button', { name: '↪ Flytt' }).click();
  const retryTarget = await byId('flyttStudentSelect').locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Syntetisk flyttekull'))?.value);
  await byId('flyttStudentSelect').selectOption(retryTarget);
  await moveDialog.getByRole('button', { name: 'Flytt student' }).click();
  const newKull = await byId('kullSelect').locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Syntetisk flyttekull'))?.value);
  await byId('kullSelect').selectOption(newKull);
  assert.match(await page.locator('body').innerText(), /Eksempelstudent A/);
  await page.getByRole('tab', { name: 'Vurdering' }).click();
  await selectLearner('Eksempelstudent A');
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  await byId('btnKiEndelig').waitFor();
  assert.equal(await byId('btnKiEndelig').isDisabled(), false, 'completed rubric follows student to target cohort');

  await page.getByRole('tab', { name: 'Studentoversikt' }).click();
  await byId('studentOversiktListe').getByRole('button', { name: 'Nullstill' }).first().click();
  await page.getByRole('button', { name: 'Ja, fortsett' }).click();
  await page.getByRole('button', { name: 'Nullstill vurderinger nå' }).click();
  await page.getByRole('tab', { name: 'Vurdering' }).click();
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  assert.equal(await byId('btnKiEndelig').isDisabled(), true, 'individual reset clears rubric completion');
});

test('dataset XLSX round trip, prompt preview, local drafts and final approval match source gates', async () => {
  const sourceKull = await byId('kullSelect').locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Kull 1'))?.value);
  await byId('kullSelect').selectOption(sourceKull);
  await page.getByRole('tab', { name: 'Vurdering' }).click();
  await selectLearner('Eksempelstudent B');
  await completeVisibleAssessment();
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  await byId('btnKiFremoverCopy').click();
  const promptDialog = page.getByRole('dialog');
  const prompt = await promptDialog.getByRole('textbox', { name: 'Promptgrunnlag' }).inputValue();
  assert.match(prompt, /Registrerte vurderinger/);
  assert.match(prompt, /Skriv en analyse av/);
  assert.match(prompt, /Generer en kort fremovermelding med:[\s\S]*1\. Hva som er bra så langt[\s\S]*3\. Konkrete neste steg[\s\S]*Baser deg kun på registrerte svar ovenfor\./);
  assert.doesNotMatch(prompt, /Eksempelstudent|DEMO-0[12]/);
  await promptDialog.getByRole('button', { name: 'Lukk' }).click();
  await byId('btnKiFremover').click();
  assert.match(await byId('kiFremoverStatus').innerText(), /ingen KI-tjeneste ble kalt/);
  await byId('kiFremoverText').fill('Syntetisk redigert underveisutkast B');
  await selectCohort('Syntetisk flyttekull');
  await selectLearner('Eksempelstudent A');
  await selectCohort('Kull 1');
  await selectLearner('Eksempelstudent B');
  assert.equal(await byId('kiFremoverText').inputValue(), 'Syntetisk redigert underveisutkast B', 'edited under-way draft is saved per student');
  await byId('btnKiEndelig').click();
  await byId('kiEndeligOut').waitFor({ state: 'visible' });
  const draft = await byId('kiEndeligText').inputValue();
  assert.match(draft, /Helhetsvurdering[\s\S]*Styrker[\s\S]*Mangler og forbedringsområder[\s\S]*Fremovermelding[\s\S]*K0-merknad/);
  assert.equal((draft.match(/^- /gm) || []).length, 3, 'the source final feedback block has three concrete review steps');
  await byId('btnKiEndeligCopy').click();
  const finalPrompt = await page.getByRole('dialog').getByRole('textbox', { name: 'Promptgrunnlag' }).inputValue();
  assert.match(finalPrompt, /Fremovermelding \(3–5 punkter\)/);
  assert.match(finalPrompt, /K0-merknad \(kun hvis relevant\)/);
  await page.getByRole('dialog').getByRole('button', { name: 'Lukk' }).click();
  await page.getByRole('tab', { name: 'Eksport' }).click();
  await page.getByRole('button', { name: /Eksporter oppsummering/ }).click();
  assert.doesNotMatch(await byId('eksportTekst').innerText(), new RegExp(draft.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  await byId('kiEndeligText').fill('Syntetisk kontrollert slutttekst');
  await page.getByRole('button', { name: 'Godkjenn som slutttekst' }).click();
  await selectCohort('Syntetisk flyttekull');
  await selectLearner('Eksempelstudent A');
  await selectCohort('Kull 1');
  await selectLearner('Eksempelstudent B');
  assert.equal(await byId('kiEndeligText').inputValue(), 'Syntetisk kontrollert slutttekst', 'approved final text is restored for its student');
  await page.getByRole('tab', { name: 'Eksport' }).click();
  await page.getByRole('button', { name: /Eksporter oppsummering/ }).click();
  assert.match(await byId('eksportTekst').innerText(), /Syntetisk kontrollert slutttekst/);

  await page.getByRole('tab', { name: 'Studentoversikt' }).click();
  const datasetDownloadWait = page.waitForEvent('download');
  await byId('btnDatasettExport').click();
  const datasetDownload = await datasetDownloadWait;
  const datasetPath = path.join(artifactDir, 'datasett_kull.xlsx');
  await datasetDownload.saveAs(datasetPath);
  await byId('btnDatasettImport').click();
  await byId('fileDatasetInput').setInputFiles(datasetPath);
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  assert.match(await page.locator('#modalImportkontroll').innerText(), /Datasett importert/);
  await byId('modalImportkontroll').getByRole('button', { name: /Lukk/ }).last().click();
});

test('keyboard focus, local settings, responsive screenshots, and complete local reset', async () => {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => ({ tag: document.activeElement.tagName, label: document.activeElement.getAttribute('aria-label') || document.activeElement.innerText || document.activeElement.title }));
  assert.ok(firstFocus.tag === 'BUTTON' || firstFocus.tag === 'A' || firstFocus.tag === 'INPUT', `keyboard starts on a usable control: ${JSON.stringify(firstFocus)}`);
  let reachedKiTab = false;
  for (let i = 0; i < 32; i++) {
    if (await byId('tab-ki').evaluate((el) => el === document.activeElement)) { reachedKiTab = true; break; }
    await page.keyboard.press('Tab');
  }
  assert.equal(reachedKiTab, true, 'the KI-support tab is reachable in sequential keyboard order');
  assert.equal(await byId('tab-ki').evaluate((el) => el.matches(':focus-visible')), true, 'keyboard focus has a visible indicator');
  await page.keyboard.press('Enter');
  assert.equal(await byId('tab-ki').getAttribute('aria-selected'), 'true');
  await byId('globalKiStyring').fill('Lokal syntetisk QA-instruksjon');
  await page.screenshot({ path: path.join(artifactDir, 'ki-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: path.join(artifactDir, 'ki-mobile.png'), fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const unlabeled = await page.locator('button:visible, input:visible, select:visible, textarea:visible').evaluateAll((els) => els.filter((el) => !(el.getAttribute('aria-label') || el.labels?.length || el.innerText?.trim() || el.title)).map((el) => el.outerHTML.slice(0, 180)));
  assert.deepEqual(unlabeled, [], `visible controls have accessible names: ${unlabeled.join('; ')}`);
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  assert.equal(await byId('globalKiStyring').inputValue(), 'Lokal syntetisk QA-instruksjon');
  for (const width of [320, 375, 390, 768, 1024, 1365]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no horizontal overflow at ${width}px`);
  }
  await byId('btnResetDemo').click();
  await page.waitForFunction(() => !localStorage.getItem('vibe.vurderingsarbeid.demo.v1'));
  assert.deepEqual(offOrigin, []);
  assert.deepEqual(errors, []);
});
