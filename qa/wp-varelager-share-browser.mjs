import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const baseUrl = process.env.WP_VARELAGER_URL || 'http://127.0.0.1:4178/vibe/wp-varelager/';
let browser;
let context;
let page;
const errors = [];
const offOrigin = [];
const origin = new URL(baseUrl).origin;

function watchPage(target) {
  target.on('pageerror', error => errors.push(error.message));
  target.on('request', request => { if (new URL(request.url()).origin !== origin) offOrigin.push(request.url()); });
}

before(async () => {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
  page = await context.newPage();
  page.setDefaultTimeout(8000);
  watchPage(page);
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
});

after(async () => { await browser?.close(); });

async function createShare(label, scenario) {
  await page.locator('#tab-delte').click();
  await page.locator('#share-label').fill(label);
  await page.locator('#share-list').selectOption('Sikkerhet');
  await page.locator('#share-expiry-scenario').selectOption(scenario);
  await page.locator('[data-action="create-share"]').click();
  const row = page.locator('.list-row').filter({ hasText: label });
  await row.getByRole('button', { name: 'Kopier lokal rute' }).click();
  return page.evaluate(() => navigator.clipboard.readText());
}

test('copied synthetic slug opens the same list and expiry scenario across visits and reloads', async () => {
  assert.match(await page.locator('#administrasjon').innerText(), /Tilgangssimulering · bare lokal[\s\S]*ikke innlogging eller sikkerhetskontroll/i);

  const activeUrl = await createShare('Syntetisk sikkerhetsliste', 'active');
  const activeParsed = new URL(activeUrl);
  assert.equal(activeParsed.origin + activeParsed.pathname, origin + '/vibe/wp-varelager/');
  assert.equal(activeParsed.search, '');
  assert.equal(activeParsed.hash, '#share-preview/sikkerhet-active');
  assert.doesNotMatch(activeUrl, /token|bearer|share=|id=|Syntetisk sikkerhetsliste/i);

  const freshPage = await context.newPage();
  watchPage(freshPage);
  await freshPage.goto(activeUrl, { waitUntil: 'networkidle' });
  assert.match(await freshPage.locator('#share-preview-title').innerText(), /Sikkerhet/);
  assert.match(await freshPage.locator('#view').innerText(), /Valgt syntetisk liste: Sikkerhet/);
  assert.match(await freshPage.locator('#share-expiry-state').innerText(), /Aktiv \(simulert\)/);
  assert.deepEqual(await freshPage.locator('#view tbody tr').allInnerTexts(), [
    'Førstehjelpssett, syntetisk eksempel\tDEMO-SIK-02\t8 sett\tSikkerhet\tTilgjengelig'
  ]);
  await freshPage.reload({ waitUntil: 'networkidle' });
  assert.match(await freshPage.locator('#share-expiry-state').innerText(), /Aktiv \(simulert\)/);
  await freshPage.locator('#share-preview-date').fill('2100-01-01');
  await freshPage.locator('#share-preview-date').dispatchEvent('change');
  assert.match(await freshPage.locator('#share-expiry-state').innerText(), /Utløpt \(simulert\)/);
  await freshPage.reload({ waitUntil: 'networkidle' });
  assert.match(await freshPage.locator('#share-expiry-state').innerText(), /Aktiv \(simulert\)/, 'manual date simulation resets on reload while the synthetic share slug remains active');
  await assertSafetyAndReflowOn(freshPage);

  const expiredUrl = await createShare('Syntetisk utløpt liste', 'expired');
  assert.equal(new URL(expiredUrl).hash, '#share-preview/sikkerhet-expired');
  await freshPage.goto(expiredUrl, { waitUntil: 'networkidle' });
  assert.match(await freshPage.locator('#share-expiry-state').innerText(), /Utløpt \(simulert\)/);
  await freshPage.reload({ waitUntil: 'networkidle' });
  assert.match(await freshPage.locator('#share-expiry-state').innerText(), /Utløpt \(simulert\)/, 'expired scenario resolves from the allowlisted slug after reload');
  await assertSafetyAndReflowOn(freshPage);

  await freshPage.getByRole('button', { name: 'Tilbake til portalen' }).click();
  assert.notEqual(new URL(freshPage.url()).hash.startsWith('#share-preview/'), true);
  assert.deepEqual(errors, []);
  assert.deepEqual(offOrigin, []);
});

async function assertSafetyAndReflowOn(target) {
  assert.equal(new URL(target.url()).search, '');
  assert.match(new URL(target.url()).hash, /^#share-preview\/[a-z0-9-]+-(active|expired)$/);
  for (const width of [320, 390, 768, 1440]) {
    await target.setViewportSize({ width, height: 844 });
    const layout = await target.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    assert.ok(layout.page <= layout.viewport, `share preview has no page overflow at ${width}px: ${JSON.stringify(layout)}`);
  }
  await target.setViewportSize({ width: 390, height: 844 });
}
