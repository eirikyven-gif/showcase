import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync, createReadStream } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test, { after, before } from 'node:test';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(repo, 'vibe/ukelonn');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const routes = [
  '', 'logg-inn/', 'registrer/', 'min-oversikt/', 'historikk/', 'admin/',
  'admin/logg-inn/', 'admin/gjoremal/', 'admin/brukere/', 'admin/brukere/historikk/',
  'admin/registreringer/', 'admin/forslag/', 'admin/perioder/', 'admin/utbetalinger/',
];
let server, browser, base;
const requests = [];

before(async () => {
  server = createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');
    requests.push(url.pathname);
    const relative = decodeURIComponent(url.pathname.replace(/^\/vibe\/ukelonn\/?/, ''));
    let filename = path.resolve(app, relative || 'index.html');
    if (!filename.startsWith(app + path.sep) && filename !== path.join(app, 'index.html')) return response.writeHead(403).end();
    if (existsSync(filename) && statSync(filename).isDirectory()) filename = path.join(filename, 'index.html');
    if (!existsSync(filename)) return response.writeHead(404).end('Not found');
    const type = filename.endsWith('.css') ? 'text/css'
      : filename.endsWith('.js') ? 'text/javascript'
        : filename.endsWith('.svg') ? 'image/svg+xml'
          : filename.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'text/html; charset=utf-8';
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    createReadStream(filename).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/vibe/ukelonn/`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
});
after(async () => { await browser?.close(); await new Promise(resolve => server?.close(resolve)); });

test('app pages and assets are present as direct static routes', () => {
  for (const route of routes) assert.ok(existsSync(path.join(app, route, 'index.html')), `direct route ${route || '/'}`);
  for (const script of ['demo-api.js', 'shell.js', 'ukelonn.js', 'overview.js', 'history.js', 'admin-dashboard.js', 'tasks-admin.js', 'auth.js', 'suggestions.js', 'suggestions-admin.js', 'periods-admin.js', 'payments-admin.js', 'payout-claims-admin.js', 'admin-registrations.js', 'user-history-admin.js']) {
    assert.ok(existsSync(path.join(app, 'assets', script)), `${script} exists`);
  }
  assert.equal(readFileSync(path.join(app, 'assets/ukelonn-gjoremal-mal.xlsx')).subarray(0, 2).toString(), 'PK');
});

test('every app route opens directly and refreshes without browser errors or server API calls', async () => {
  requests.length = 0;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes) {
    const response = await page.goto(base + route);
    assert.equal(response.status(), 200, `route responds successfully: ${route || '/'}`);
    assert.equal(new URL(page.url()).pathname, `/vibe/ukelonn/${route}`, `direct path ${route || '/'}`);
    const layout = await page.evaluate(() => {
      const viewport = document.documentElement.clientWidth;
      const tableWraps = [...document.querySelectorAll('.table-wrap')];
      const outOfBounds = [...document.querySelectorAll('body *')].filter(node => node.getBoundingClientRect().right > viewport + 2);
      return { viewport, pageScrollWidth: document.documentElement.scrollWidth, bodyOverflow: getComputedStyle(document.body).overflowX, tableOverflows: tableWraps.map(tableWrap => getComputedStyle(tableWrap).overflowX), outsideTables: outOfBounds.filter(node => !tableWraps.some(tableWrap => tableWrap.contains(node))).map(node => `${node.tagName}.${String(node.className || '')}`) };
    });
    assert.ok(['hidden', 'clip'].includes(layout.bodyOverflow), `page overflow is clipped on ${route || '/'}: ${JSON.stringify(layout)}`);
    assert.deepEqual(layout.outsideTables, [], `mobile content outside deliberate table scroll wrappers: ${JSON.stringify(layout)}`);
    assert.ok(layout.tableOverflows.every(value => ['auto', 'scroll'].includes(value)), `wide tables have internal scroll areas on ${route}: ${JSON.stringify(layout)}`);
    assert.equal((await page.reload()).status(), 200, `refresh responds successfully: ${route || '/'}`);
  }
  await page.goto(base + 'registrer/');
  const menu = page.locator('[data-mobile-menu-toggle]');
  assert.equal(await menu.getAttribute('aria-label'), 'Åpne meny');
  await menu.click();
  assert.equal(await menu.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await menu.getAttribute('aria-expanded'), 'false');
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Åpne meny');
  assert.deepEqual(errors, []);
  assert.equal(requests.some(url => url.includes('/api/')), false);
  await context.close();
});

test('demo has synthetic personas, explicit local storage/reset, no auth fields, PHP or external service references', () => {
  const html = routes.map(route => readFileSync(path.join(app, route, 'index.html'), 'utf8')).join('\n');
  const scripts = [...(function* walk(dir) { for (const entry of require('node:fs').readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) yield* walk(full); else if (full.endsWith('.js')) yield full; } })(app)].map(file => readFileSync(file, 'utf8')).join('\n');
  assert.match(html, /Voksen A/);
  assert.match(html, /Ingen PIN eller innlogging brukes/);
  assert.doesNotMatch(html, /type=["']password["']|name=["']pin["']/i);
  assert.match(scripts, /localStorage\.setItem/);
  assert.match(scripts, /localStorage\.removeItem\(key\)/);
  assert.match(scripts, /Nullstill alle demoendringer/);
  assert.match(scripts, /window\.fetch\s*=\s*async/);
  assert.match(scripts, /throw new TypeError\('Ukelønn-demoen tillater bare lokale simuleringer/);
  assert.doesNotMatch(`${html}\n${scripts}`, /document\.cookie|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon|https?:\/\//i);
  assert.equal(existsSync(path.join(app, 'api')), false, 'no source API/server code is copied');
});

test('user and admin workflows persist locally, reset fully, expose hub route, and make no API network requests', async () => {
  requests.length = 0;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto(base + 'admin/gjoremal/');
  await page.getByRole('row', { name: /Rydde rom/ }).waitFor();
  assert.equal(await page.getByRole('link', { name: 'Til Vibe-huben' }).getAttribute('href'), '/vibe/');
  assert.ok(await page.locator('.demo-notice').getByText(/bare lokalt/i).count());
  await page.locator('[data-task-create]').getByLabel('Navn').fill('Syntetisk prøveoppgave');
  await page.locator('[data-task-create]').getByLabel('Godkjent betaling (kr)').fill('12.5');
  await page.getByRole('button', { name: 'Opprett gjøremål' }).click();
  await page.getByRole('row', { name: /Syntetisk prøveoppgave/ }).waitFor();
  assert.equal(await page.locator('[data-tasks] input').count(), 0, 'task table stays read-only');
  await page.getByRole('button', { name: 'Rediger Syntetisk prøveoppgave' }).click();
  const taskDialog = page.getByRole('dialog', { name: 'Rediger gjøremål' });
  await taskDialog.waitFor({ state: 'visible' });
  assert.equal(await page.evaluate(() => document.activeElement?.id), 'edit-task-name');
  await page.keyboard.press('Escape');
  await taskDialog.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Rediger Syntetisk prøveoppgave' }).click();
  await taskDialog.getByLabel('Navn').fill('Syntetisk oppgave justert');
  await taskDialog.getByRole('button', { name: 'Lagre endringer' }).click();
  await page.getByRole('row', { name: /Syntetisk oppgave justert/ }).waitFor();
  await page.locator('#task-excel-file').setInputFiles(path.join(repo, 'tests/fixtures/ukelonn-import-synthetic.xlsx'));
  await page.getByRole('button', { name: 'Importer Excel-fil' }).click();
  await page.getByRole('row', { name: /Syntetisk testoppgave/ }).waitFor();
  await page.reload();
  await page.getByRole('row', { name: /Syntetisk oppgave justert/ }).waitFor();
  await page.getByRole('button', { name: 'Nullstill alle demoendringer' }).click();
  await page.getByRole('row', { name: /Rydde rom/ }).waitFor();
  await page.goto(base + 'registrer/');
  await page.getByRole('checkbox', { name: /Rydde kjøkken/ }).check();
  await page.getByRole('button', { name: 'Send inn registrering' }).click();
  await page.locator('.user-registration-table').getByRole('row', { name: /Rydde kjøkken/ }).waitFor();
  await page.reload();
  await page.locator('.user-registration-table').getByRole('row', { name: /Rydde kjøkken/ }).waitFor();
  await page.goto(base + 'logg-inn/');
  await page.getByRole('link', { name: 'Fortsett som Voksen B' }).click();
  await page.goto(base + 'min-oversikt/');
  await page.getByRole('heading', { name: 'Opptjening', exact: true }).waitFor();
  await page.getByText('Hei Voksen B').waitFor();
  const layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(layout.scrollWidth <= layout.width, `mobile page overflows: ${JSON.stringify(layout)}`);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.classList.contains('skip-link')), true, 'skip link is first keyboard stop');
  assert.ok(await page.locator(':focus-visible').count());
  assert.deepEqual(pageErrors, []);
  assert.equal(requests.some(url => url.includes('/api/')), false, 'API simulations never reached the HTTP server');
  const stored = await page.evaluate(() => Object.keys(localStorage));
  assert.deepEqual(stored, ['ukelonn-showcase-demo-v1']);
  await context.close();
});
