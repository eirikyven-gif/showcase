import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const baseUrl = process.env.WP_VARELAGER_URL || 'http://127.0.0.1:4178/vibe/wp-varelager/';
let browser;
let page;
const errors = [];
const offOrigin = [];
const origin = new URL(baseUrl).origin;

before(async () => {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).origin !== origin) offOrigin.push(request.url()); });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
});

after(async () => { await browser?.close(); });

test('selected synthetic share list previews matching items and local expiry state', async () => {
  assert.match(await page.locator('#administrasjon').innerText(), /Tilgangssimulering · bare lokal[\s\S]*ikke innlogging eller sikkerhetskontroll/i);
  assert.match(await page.locator('#administrasjon').innerText(), /ikke innlogging eller sikkerhetskontroll/i);
  await page.locator('#tab-delte').click();
  await page.locator('#share-label').fill('Syntetisk sikkerhetsliste');
  await page.locator('#share-list').selectOption('Sikkerhet');
  await page.locator('#share-days').fill('1');
  await page.locator('[data-action="create-share"]').click();
  const row = page.locator('.list-row').filter({ hasText: 'Syntetisk sikkerhetsliste' });
  await row.getByRole('link', { name: 'Åpne forhåndsvisning' }).click();

  assert.equal(new URL(page.url()).hash, '#share-preview');
  assert.match(await page.locator('#share-preview-title').innerText(), /Syntetisk sikkerhetsliste/);
  assert.match(await page.locator('#view').innerText(), /Valgt syntetisk liste: Sikkerhet/);
  assert.match(await page.locator('#share-expiry-state').innerText(), /Aktiv \(simulert\)/);
  assert.deepEqual(await page.locator('#view tbody tr').allInnerTexts(), [
    'Førstehjelpssett, syntetisk eksempel\tDEMO-SIK-02\t8 sett\tSikkerhet\tTilgjengelig'
  ]);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const layout = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    assert.ok(layout.page <= layout.viewport, `share preview has no page overflow at ${width}px: ${JSON.stringify(layout)}`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#share-preview-date').fill('2099-01-01');
  await page.locator('#share-preview-date').dispatchEvent('change');
  assert.match(await page.locator('#share-expiry-state').innerText(), /Utløpt \(simulert\)/);
  assert.equal(new URL(page.url()).search, '');
  assert.equal(new URL(page.url()).hash, '#share-preview');
  assert.doesNotMatch(page.url(), /token|bearer|share=|id=/i);

  await page.getByRole('button', { name: 'Tilbake til portalen' }).click();
  assert.notEqual(new URL(page.url()).hash, '#share-preview');
  assert.deepEqual(errors, []);
  assert.deepEqual(offOrigin, []);
});
