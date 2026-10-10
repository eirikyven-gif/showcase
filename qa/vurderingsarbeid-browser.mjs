import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const baseUrl = process.env.ASSESSMENT_URL || 'http://127.0.0.1:4174/vibe/vurderingsarbeid-fagskolen/';
let browser;
let page;
const errors = [];
const offOrigin = [];
const origin = new URL(baseUrl).origin;

before(async () => {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('404')) errors.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400 && !new URL(response.url()).pathname.endsWith('/favicon.ico')) errors.push(`HTTP ${response.status()} ${response.url()}`); });
  page.on('request', (request) => { if (new URL(request.url()).origin !== origin) offOrigin.push(request.url()); });
  page.on('dialog', (dialog) => dialog.accept());
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
});

after(async () => { await browser?.close(); });

test('synthetic sample opens and local feedback/prompt workflows work per learner', async () => {
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  await page.locator('#btnKiFremover').click();
  await page.locator('#kiFremoverOut').waitFor({ state: 'visible' });
  assert.match(await page.locator('#kiFremoverStatus').innerText(), /ingen KI-tjeneste ble kalt/);
  const learnerSelect = page.locator('#studentSelect');
  const values = await learnerSelect.locator('option').evaluateAll((options) => options.map((option) => option.value).filter(Boolean));
  assert.equal(values.length, 2);
  const first = await learnerSelect.inputValue();
  await page.locator('#kiFremoverText').fill('syntetisk redigert utkast A');
  await learnerSelect.selectOption(values.find((value) => value !== first));
  assert.notEqual(await page.locator('#kiFremoverText').inputValue(), 'syntetisk redigert utkast A');
  await learnerSelect.selectOption(first);
  assert.equal(await page.locator('#kiFremoverText').inputValue(), 'syntetisk redigert utkast A');
  await page.locator('#btnKiFremoverCopy').click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  const prompt = await page.getByRole('textbox', { name: 'Promptgrunnlag' }).inputValue();
  assert.match(prompt, /Registrerte vurderinger/);
  assert.doesNotMatch(prompt, /Eksempelstudent|DEMO-0[12]/);
  await page.getByRole('button', { name: 'Lukk' }).click();
});

test('complete assessment enables final draft, explicit approval and export', async () => {
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  await page.locator('#btnKiEndelig').waitFor();
  assert.equal(await page.locator('#btnKiEndelig').isDisabled(), false);
  await page.locator('#btnKiEndelig').click();
  await page.locator('#kiEndeligOut').waitFor({ state: 'visible' });
  assert.match(await page.locator('#kiEndeligText').inputValue(), /Helhetsvurdering[\s\S]*Styrker[\s\S]*Mangler og forbedringsområder[\s\S]*Fremovermelding[\s\S]*K0-merknad/);
  const draft = await page.locator('#kiEndeligText').inputValue();
  await page.getByRole('tab', { name: 'Eksport' }).click();
  await page.getByRole('button', { name: /Eksporter oppsummering/ }).click();
  assert.doesNotMatch(await page.locator('#eksportTekst').innerText(), new RegExp(draft.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  await page.locator('#kiEndeligText').fill('Godkjent syntetisk eksempeltekst');
  await page.getByRole('button', { name: 'Godkjenn som slutttekst' }).click();
  assert.match(await page.locator('#slutttekstStatus').innerText(), /godkjent og lagret lokalt/);
  await page.getByRole('tab', { name: 'Eksport' }).click();
  await page.getByRole('button', { name: /Eksporter oppsummering/ }).click();
  assert.match(await page.locator('#eksportTekst').innerText(), /Godkjent syntetisk eksempeltekst/);
});

test('local settings persist, mobile layout has no overflow, and reset stays local', async () => {
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  await page.locator('#globalKiStyring').fill('Syntetisk lokal instruksjon for QA');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('tab', { name: 'KI-støtte' }).click();
  assert.equal(await page.locator('#globalKiStyring').inputValue(), 'Syntetisk lokal instruksjon for QA');
  for (const width of [320, 375, 390, 768, 1024, 1365]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `no horizontal overflow at ${width}px`);
  }
  await page.locator('#btnResetDemo').click();
  await page.waitForFunction(() => !localStorage.getItem('vibe.vurderingsarbeid.demo.v1'));
  assert.deepEqual(offOrigin, []);
  assert.deepEqual(errors, []);
});
