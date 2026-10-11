const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const baseUrl = process.env.HUL_BASE_URL || 'http://127.0.0.1:8766';
const chromePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
let browser;

function contrastRatio(foreground, background) {
  const luminance = (color) => {
    const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map((channel) => {
      const srgb = channel / 255;
      return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
    });
    return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

(async () => {
  browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route((url) => url.href.startsWith(`${baseUrl}/vibe/hul-lagerstyring/`), async (route) => {
    const response = await route.fetch();
    if (new URL(route.request().url()).pathname.endsWith('/')) {
      const body = (await response.text())
        .replaceAll('__APP_JS_VERSION__', 'dev-local')
        .replaceAll('__RUNTIME_CONFIG_VERSION__', 'dev-local');
      await route.fulfill({ response, body });
      return;
    }
    await route.continue();
  });

  await page.goto(`${baseUrl}/vibe/hul-lagerstyring/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);

  // Add a disposable fixture to the browser's local mock database so the
  // source UI exposes both document preview and variant selection overlays.
  await page.evaluate(() => {
    const key = 'HUL_MOCK_DB_v1';
    const db = JSON.parse(localStorage.getItem(key));
    const itemId = 'AA-QA-SYNTHETIC-ITEM';
    const documentId = 'AA-QA-SYNTHETIC-DOCUMENT';
    db.items.push({
      id: itemId,
      navn: 'Syntetisk AA-kontrollvare',
      kategori: 'Utstyr',
      plassering: 'Hylle A1',
      status: 'Tilgjengelig',
      tilstand: 'God',
      beholdning: 5,
      arrangementer: [],
      aktiv: true,
      underenheter: [{
        id: 'AA-QA-SYNTHETIC-VARIANT',
        type: 'variant',
        navn: 'Syntetisk størrelse M',
        antall: 3,
        status: 'Tilgjengelig',
        tilstand: 'God',
        vedlegg: []
      }]
    });
    db.documents[itemId] = [{
      id: documentId,
      dokumentId: documentId,
      tittel: 'Syntetisk QA-bilde',
      filnavn: 'synthetic-aa-qa.png',
      mimeType: 'image/png',
      erBilde: true,
      driveUrl: '#',
      sortering: 1
    }];
    localStorage.setItem(key, JSON.stringify(db));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    const mockFetch = window.fetch;
    const image = {
      mimeType: 'image/png',
      previewType: 'image',
      dataBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
    };
    window.fetch = function syntheticDocumentMedia(url, options) {
      if (String(url).includes('/api/v1/documents/AA-QA-SYNTHETIC-DOCUMENT/media')) {
        const body = JSON.stringify({ ok: true, data: image });
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: { get: (name) => name.toLowerCase() === 'content-type' ? 'application/json' : null },
          text: () => Promise.resolve(body)
        });
      }
      return mockFetch.call(this, url, options);
    };
  });

  const assertWorkspace = async (name) => {
    await page.waitForFunction((expected) => {
      const workspace = document.querySelector(`[data-smoke-workspace="${expected}"]`);
      return workspace && !workspace.classList.contains('hidden');
    }, name);
  };
  const assertNamedControls = async () => {
    const unnamed = await page.locator('button:visible,input:visible,select:visible,textarea:visible,[role="button"]:visible').evaluateAll((elements) => elements
      .filter((element) => {
        if (element.disabled || element.getAttribute('aria-hidden') === 'true') return false;
        return !(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || element.title || element.innerText.trim()
          || (element.id && document.querySelector(`label[for="${CSS.escape(element.id)}"]`)) || element.closest('label'));
      })
      .map((element) => element.outerHTML.slice(0, 140)));
    assert.deepEqual(unnamed, [], 'visible controls have accessible names');
  };
  const openMenu = async () => {
    if (!(await page.locator('#hamburger-menu').isVisible())) await page.locator('#hamburger-button').click();
  };
  const colorRatio = async (selector) => page.locator(selector).first().evaluate((element) => {
    let node = element;
    let background = 'rgb(255, 255, 255)';
    while (node && node !== document.documentElement) {
      const color = getComputedStyle(node).backgroundColor;
      const alpha = color.match(/[\d.]+/g)?.[3];
      if (color.startsWith('rgb') && (alpha === undefined || Number(alpha) > 0)) {
        background = color;
        if (alpha === undefined || Number(alpha) >= 1) break;
      }
      node = node.parentElement;
    }
    return { foreground: getComputedStyle(element).color, background };
  });
  const auditDialog = async ({ overlay, opener }) => {
    const dialog = page.locator(overlay);
    await dialog.waitFor({ state: 'visible' });
    assert.equal(await dialog.getAttribute('role'), 'dialog');
    assert.equal(await dialog.getAttribute('aria-modal'), 'true');
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    assert.ok(labelledBy, `${overlay} has a programmatic label reference`);
    assert.ok((await page.locator(`#${labelledBy}`).textContent()).trim(), `${overlay} label is not empty`);
    assert.ok(await page.evaluate((selector) => !!document.activeElement.closest(selector), overlay), `${overlay} receives focus`);
    await assertNamedControls();
    if (overlay === '#attachment-overlay') {
      assert.equal(await dialog.locator('img:visible').getAttribute('alt'), 'Syntetisk QA-bilde', 'synthetic attachment preview has alternative text');
    }
    if (overlay === '#bestilling-variant-overlay') {
      assert.equal(await dialog.locator('[data-bestilling-variant-option]').getAttribute('aria-label'), 'Velg variant Syntetisk størrelse M (AA-QA-SYNTHETIC-VARIANT)');
    }
    const focusable = dialog.locator('a[href]:visible,button:not([disabled]):visible,input:not([disabled]):visible,select:not([disabled]):visible,textarea:not([disabled]):visible,[tabindex]:not([tabindex="-1"]):visible');
    await focusable.last().focus();
    await page.keyboard.press('Tab');
    assert.ok(await page.evaluate((selector) => !!document.activeElement.closest(selector), overlay), `${overlay} contains forward Tab`);
    await focusable.first().focus();
    await page.keyboard.press('Shift+Tab');
    assert.ok(await page.evaluate((selector) => !!document.activeElement.closest(selector), overlay), `${overlay} contains reverse Tab`);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    await page.waitForFunction((selector) => {
      const element = document.querySelector(selector);
      return element && element === document.activeElement;
    }, opener);
    const focusRestored = await page.locator(opener).evaluate((element) => element === document.activeElement);
    const activeElement = focusRestored ? '' : await page.evaluate(() => document.activeElement.outerHTML.slice(0, 180));
    assert.equal(focusRestored, true, `${overlay} restores focus to its opener (active: ${activeElement})`);
  };

  assertWorkspace('liste');
  await assertNamedControls();
  await page.keyboard.press('Tab');
  const initialFocus = await page.evaluate(() => ({ id: document.activeElement.id, shadow: getComputedStyle(document.activeElement).boxShadow }));
  assert.equal(initialFocus.id, 'demo-reset');
  assert.notEqual(initialFocus.shadow, 'none', 'first keyboard focus is visibly indicated');
  const imageFallback = await colorRatio('.text-\\[11px\\]');
  assert.ok(contrastRatio(imageFallback.foreground, imageFallback.background) >= 4.5, 'inventory fallback caption meets normal-text contrast');

  for (const [menuId, workspace] of [
    ['menu-bestilling', 'bestilling'], ['menu-lager', 'lager'], ['menu-lister', 'lister'],
    ['menu-ny-vare', 'detaljgruppe'], ['menu-utlan', 'detaljgruppe'], ['admin-toggle-button', 'admin'],
  ]) {
    await openMenu();
    await page.locator(`#${menuId}`).click();
    await assertWorkspace(workspace);
    await assertNamedControls();
  }

  await page.locator('#hamburger-button').click();
  await page.locator('#menu-lagerliste').click();
  await assertWorkspace('liste');
  await page.locator('#bulk-actions-accordion summary').click();
  await page.locator('[data-bulk-item-id="FLASKE-01"]').check();
  await page.locator('#bulk-actions-select').selectOption('add-to-list');
  await page.locator('#bulk-actions-run-button').click();
  const modal = page.locator('#add-to-list-overlay');
  await modal.waitFor({ state: 'visible' });
  assert.equal(await modal.getAttribute('aria-modal'), 'true');
  assert.equal(await modal.getAttribute('aria-labelledby'), 'add-to-list-overlay-title');
  assert.ok(await page.evaluate(() => !!document.activeElement.closest('#add-to-list-overlay')), 'opening a dialog moves focus inside');
  await assertNamedControls();

  const modalButtons = modal.locator('button:visible,select:visible,input:visible');
  await modalButtons.last().focus();
  await page.keyboard.press('Tab');
  assert.ok(await page.evaluate(() => !!document.activeElement.closest('#add-to-list-overlay')), 'Tab remains inside the dialog');
  await page.keyboard.press('Shift+Tab');
  assert.ok(await page.evaluate(() => !!document.activeElement.closest('#add-to-list-overlay')), 'Shift+Tab remains inside the dialog');
  await page.keyboard.press('Escape');
  await modal.waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.activeElement.id), 'bulk-actions-run-button', 'closing a dialog returns focus to its opener');

  await page.locator('[data-inventory-id="FLASKE-01"]').click();
  await assertWorkspace('detaljgruppe');
  await assertNamedControls();
  const detailGreen = await colorRatio('#detail-workspace .tracking-\\[0\\.16em\\]');
  assert.ok(contrastRatio(detailGreen.foreground, detailGreen.background) >= 4.5, 'detail accent text meets normal-text contrast');

  await openMenu();
  await page.locator('#menu-lagerliste').click();
  await assertWorkspace('liste');
  await page.locator('[data-inventory-id="AA-QA-SYNTHETIC-ITEM"]').click();
  await assertWorkspace('detaljgruppe');
  const attachmentOpener = 'button[data-open-document-overlay="AA-QA-SYNTHETIC-DOCUMENT"]:has(img[data-main-image-id="AA-QA-SYNTHETIC-DOCUMENT"])';
  await page.locator(attachmentOpener).click();
  await auditDialog({ overlay: '#attachment-overlay', opener: attachmentOpener });

  await page.locator('[data-detail-add-to-order="true"]').click();
  await auditDialog({ overlay: '#bestilling-variant-overlay', opener: '[data-detail-add-to-order="true"]' });

  const headingLevels = await page.locator('#inventory-form-attachments-lists').locator('h1,h2,h3,h4,h5,h6').evaluateAll((elements) => elements.map((element) => element.tagName));
  assert.equal(headingLevels.includes('H4'), false, 'new-item attachments headings do not skip level 3');
  assert.deepEqual(errors, [], 'no JavaScript errors during accessibility interactions');
  console.log(JSON.stringify({ workspaces: ['liste', 'bestilling', 'lager', 'lister', 'ny vare', 'utlån', 'innstillinger', 'detalj'], dialogs: ['add-to-list', 'attachment', 'variant'].map((id) => `${id}: label, focus entry, Tab/Shift+Tab containment, Escape close, and focus restoration passed`), fixture: 'synthetic item, image metadata, and variant in browser-local mock storage', contrast: { inventoryCaption: contrastRatio(imageFallback.foreground, imageFallback.background), detailAccent: contrastRatio(detailGreen.foreground, detailGreen.background) }, initialFocus, pageErrors: errors }));
  await context.close();
  await browser.close();
})().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close().catch(() => {});
  process.exit(1);
});
