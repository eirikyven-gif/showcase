const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const baseUrl = process.env.HUL_BASE_URL || 'http://127.0.0.1:8766';
const chromePath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

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
  const browser = await chromium.launch({ headless: true, executablePath: chromePath, args: ['--no-sandbox'] });
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

  const headingLevels = await page.locator('#inventory-form-attachments-lists').locator('h1,h2,h3,h4,h5,h6').evaluateAll((elements) => elements.map((element) => element.tagName));
  assert.equal(headingLevels.includes('H4'), false, 'new-item attachments headings do not skip level 3');
  assert.deepEqual(errors, [], 'no JavaScript errors during accessibility interactions');
  console.log(JSON.stringify({ workspaces: ['liste', 'bestilling', 'lager', 'lister', 'ny vare', 'utlån', 'innstillinger', 'detalj'], modal: 'focus entry, Tab/Shift+Tab containment, Escape close, and focus restoration passed', contrast: { inventoryCaption: contrastRatio(imageFallback.foreground, imageFallback.background), detailAccent: contrastRatio(detailGreen.foreground, detailGreen.background) }, initialFocus, pageErrors: errors }));
  await context.close();
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
