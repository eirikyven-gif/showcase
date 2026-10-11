import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const baseUrl = process.env.WP_VARELAGER_URL || 'http://127.0.0.1:4179/vibe/wp-varelager/';
let browser, context, page;
const errors = [], offOrigin = [];
const origin = new URL(baseUrl).origin;

before(async () => {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).origin !== origin) offOrigin.push(request.url()); });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
});
after(async () => { await browser?.close(); });

test('attachment file selection stays in memory, previews locally, deletes and resets', async () => {
  await page.getByRole('button', { name: 'Vis Målportal, syntetisk eksempel' }).click();
  await page.locator('[data-action="add-attachment"]').click();
  const filePicker = page.getByLabel('Velg fil (JPG, PNG, PDF eller DOCX)');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    const dimensions = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    assert.ok(dimensions.page <= dimensions.viewport, `attachment picker has no page overflow at ${width}px: ${JSON.stringify(dimensions)}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await filePicker.setInputFiles({ name: 'synthetic-upload.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p7sAAAAASUVORK5CYII=', 'base64') });
  await page.locator('#attachment-file-status').waitFor();
  await page.locator('#editor-fields [name="label"]').fill('Synthetic upload QA');
  await page.locator('#editor-fields [name="category"]').selectOption('Sertifikat');
  await page.locator('#editor-submit').click();
  const row = page.locator('.list-row').filter({ hasText: 'synthetic-upload.png' });
  await row.waitFor();
  assert.match(await row.innerText(), /Sertifikat.*Synthetic upload QA|Synthetic upload QA.*Sertifikat/);

  await row.getByRole('button', { name: /Vis vedlegg synthetic-upload\.png/ }).click();
  await page.locator('#editor-fields img[alt="Lokal forhåndsvisning av synthetic-upload.png"]').waitFor();
  const urls = await page.evaluate(() => {
    const img = document.querySelector('#editor-fields img');
    window.__attachmentPreviewUrl = img.src;
    window.__revokedUrls = [];
    const original = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = value => { window.__revokedUrls.push(value); original(value); };
    return { src: img.src, type: img.getAttribute('src').slice(0, 5) };
  });
  assert.equal(urls.type, 'blob:');
  await page.locator('#editor-submit').click();
  await page.waitForFunction(() => window.__revokedUrls?.includes(window.__attachmentPreviewUrl));

  const deleteButton = page.getByRole('button', { name: 'Slett vedleggsmetadata synthetic-upload.png' });
  await deleteButton.click();
  await page.waitForFunction(() => ![...document.querySelectorAll('.list-row')].some(row => row.innerText.includes('synthetic-upload.png')));
  await page.reload({ waitUntil: 'networkidle' });
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), []);
  assert.deepEqual(await page.context().cookies(), []);
  await page.getByRole('button', { name: 'Vis Målportal, syntetisk eksempel' }).click();
  assert.doesNotMatch(await page.locator('#item-detail').innerText(), /synthetic-upload\.png|Synthetic upload QA/);

  await page.locator('[data-action="add-attachment"]').click();
  await page.locator('#attachment-file').setInputFiles({ name: 'synthetic-discard.png', mimeType: 'image/png', buffer: Buffer.from('local synthetic bytes') });
  await page.locator('#attachment-reset').click();
  assert.equal(await page.locator('#attachment-file').inputValue(), '');
  assert.match(await page.locator('#attachment-file-status').innerText(), /nullstilt/i);
  await page.locator('#attachment-file').setInputFiles({ name: 'synthetic-discard.png', mimeType: 'image/png', buffer: Buffer.from('local synthetic bytes') });
  await page.getByRole('button', { name: 'Avbryt' }).click();
  await page.locator('[data-action="add-attachment"]').click();
  assert.equal(await page.locator('#attachment-file').inputValue(), '');
  assert.equal(await page.locator('#editor-fields [name="fixture"]').inputValue(), 'none');
  await page.getByRole('button', { name: 'Avbryt' }).click();
  assert.deepEqual(errors, []);
  assert.deepEqual(offOrigin, []);
});
