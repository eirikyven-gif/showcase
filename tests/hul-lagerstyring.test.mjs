import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const route = 'vibe/hul-lagerstyring/';
const html = readFileSync(`${route}index.html`, 'utf8');
const runtime = readFileSync(`${route}runtime-config.js`, 'utf8');
const backend = readFileSync(`${route}mock-backend.js`, 'utf8');
const readme = readFileSync(`${route}README.md`, 'utf8');
const css = readFileSync(`${route}style.css`, 'utf8');
const controls = readFileSync(`${route}demo-controls.js`, 'utf8');
const appJs = readFileSync(`${route}app.js`);

test('HUL browser app preserves the complete source frontend at its pinned commit', () => {
  const app = JSON.parse(readFileSync('vibe/catalog.json', 'utf8')).apps.find((candidate) => candidate.slug === 'hul-lagerstyring');
  assert.ok(app);
  assert.match(app.source, /fdda6419dbe8c8891eb9d27f9f6e56ec3151a602/);
  assert.equal(
    createHash('sha256').update(appJs).digest('hex'),
    '0d0a236b1aec73b3545cbc053222b40d0a1b500b6002ea121fd1e4c1ce778894',
    'app.js matches app/frontend/app.js at the pinned source commit byte for byte'
  );
});

test('source-faithful HUL route is mock-only, disclosed, and resettable', () => {
  assert.match(runtime, /mockBackend:\s*true/);
  assert.match(runtime, /authMode:\s*'none'/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /script-src 'self'(?:;|\s)/);
  assert.match(html, /style-src 'self'(?:;|\s)/);
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    assert.match(attrs, /\bsrc=/i);
    assert.equal(body.trim(), '');
  }
  assert.match(html, /img-src 'self' data: blob:/);
  assert.match(html, /media-src 'self' data: blob:/);
  assert.match(html, /font-src 'self' data:/);
  assert.match(html, /Klargjører lokal demovisning/);
  assert.doesNotMatch(html, /Klargjører innlogging og sesjon/);
  assert.match(html, /Nullstill demo/);
  assert.match(controls, /HUL_MOCK_DB_v1/);
  assert.match(controls, /data-order-line-qty/);
  assert.match(controls, /aria-label', 'Antall for '/);
  assert.match(controls, /Navn på ny liste/);
  assert.match(html, /localStorage/);
  assert.match(backend, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(readme, /fdda6419dbe8c8891eb9d27f9f6e56ec3151a602/);
  assert.match(readme, /localStorage/);
});

test('HUL accessibility corrections keep normal-text contrast and modal keyboard support', () => {
  assert.match(css, /\.text-slate-500[^}]*rgb\(71 85 105/);
  assert.match(css, /\.text-emerald-600[^}]*rgb\(4 120 87/);
  assert.match(controls, /normalizeAttachmentHeadings/);
  assert.match(controls, /#inventory-form-attachments-lists h4/);
  assert.match(controls, /makeModalKeyboardAccessible/);
  assert.match(controls, /event\.key !== 'Tab'/);
  assert.match(controls, /event\.shiftKey/);
  assert.match(controls, /state\.opener\.focus\(\)/);
  assert.match(appJs.toString('utf8'), /role="dialog" aria-modal="true" aria-labelledby=/);
  assert.match(readme, /axe-core 4\.10\.3/);
  assert.match(readme, /qa\/hul-lagerstyring-accessibility\.cjs/);
});

test('HUL route has no off-origin script, style, image, font, media, or network resource', () => {
  const references = [];
  for (const [, tagName, attrs] of html.matchAll(/<(script|link|img|source|audio|video|track)\b([^>]*)>/gi)) {
    const allowedAttrs = tagName.toLowerCase() === 'link' ? ['href'] : (tagName.toLowerCase() === 'video' ? ['src', 'poster'] : ['src']);
    for (const attr of allowedAttrs) {
      for (const [, value] of attrs.matchAll(new RegExp(`\\b${attr}=["']([^"']+)["']`, 'gi'))) references.push(value);
    }
  }
  for (const ref of references) {
    assert.doesNotMatch(ref, /^(?:https?:|\/\/)/i, `resource is same-origin: ${ref}`);
    if (!/^(?:data:|blob:)/i.test(ref)) {
      const target = path.join(route, ref.split(/[?#]/, 1)[0]);
      assert.ok(existsSync(target), `local resource exists: ${target}`);
    }
  }
  assert.doesNotMatch(html, /https?:\/\//i, 'HTML contains no off-origin URL');
  const cssRules = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(cssRules, /https?:\/\//i, 'CSS contains no off-origin URL');
  assert.doesNotMatch(cssRules, /@import\b/i, 'stylesheet has no imported styles');
  for (const [, ref] of cssRules.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    assert.match(ref, /^(?:data:|blob:|#)/i, `stylesheet URL is inline or local: ${ref}`);
  }
  assert.match(html, /style\.css/);
  assert.match(runtime, /backendBaseUrl:\s*'mock:\/\//);
  assert.match(backend, /window\.fetch = function hulMockFetch/);
  assert.match(backend, /if \(!shouldIntercept\(url\)\)/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /mock-backend\.js/);
  assert.match(html, /demo-controls\.js/);
  assert.match(controls, /Nullstill demo|demo-reset/);
  for (const source of [html, runtime, backend, controls, appJs.toString('utf8')]) {
    assert.doesNotMatch(source, /https?:\/\/(?!schemas\.openxmlformats\.org\/)|wss?:\/\//i, 'route runtime contains no external URL/API endpoint');
    assert.doesNotMatch(source, /\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b/, 'route runtime uses no alternate network API');
  }
});

test('catalog points to the route and source provenance', () => {
  const catalog = JSON.parse(readFileSync('vibe/catalog.json', 'utf8'));
  const app = catalog.apps.find((candidate) => candidate.slug === 'hul-lagerstyring');
  const version = readFileSync('VERSION', 'utf8').trim();
  assert.ok(app);
  assert.equal(version, '0.60.4');
  assert.match(app.source, /fdda6419dbe8c8891eb9d27f9f6e56ec3151a602/);
  assert.match(app.scope, /connect-src none/);
  assert.match(app.routeState, /PR #97/);
  assert.match(app.routeState, /ingen merge eller deploy/i);
  assert.doesNotMatch(app.risk, /rolle-simulator|rolle.*sideøkten/);
});

test('HUL mock supports complete synthetic order, picking, deviation, status and loan workflows', async () => {
  const values = new Map();
  const window = { __HUL_RUNTIME_CONFIG: { mockBackend: true, backendBaseUrl: 'mock://hul-mock.local' }, fetch: async () => { throw new Error('unexpected network'); } };
  const context = { window, document: { dispatchEvent() {} }, CustomEvent: function CustomEvent() {}, localStorage: { getItem: (key) => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }, URLSearchParams, Promise, Date, Math, JSON, Uint8Array, DataView, TextEncoder, ArrayBuffer, btoa: (value) => Buffer.from(value, 'binary').toString('base64') };
  vm.runInNewContext(backend, context);
  async function request(pathname, method = 'GET', body = {}) {
    const response = await window.fetch(`mock://hul-mock.local${pathname}`, { method, body: method === 'POST' ? JSON.stringify(body) : undefined });
    return response.json();
  }
  const draft = await request('/api/v1/orders/draft', 'POST', { lines: [] });
  const orderId = draft.orderId;
  assert.ok(orderId);
  const added = await request(`/api/v1/orders/${orderId}/lines`, 'POST', { productId: 'FLASKE-01', quantity: 2 });
  const lineId = added.line.id;
  await request(`/api/v1/orders/${orderId}/lines`, 'POST', { productId: 'TROJE-S', quantity: 1 });
  await request(`/api/v1/orders/${orderId}/lines`, 'POST', { _method: 'PUT', lineId, quantity: 3 });
  const detail = await request(`/api/v1/orders/${orderId}`);
  assert.equal(detail.bestilling.linjer[0].requestedQty, 3);
  const removable = detail.bestilling.linjer[1].id;
  await request(`/api/v1/orders/${orderId}/lines`, 'POST', { _method: 'DELETE', lineId: removable });
  await request(`/api/v1/orders/${orderId}/submit`, 'POST', {});
  await request(`/api/v1/orders/${orderId}/status`, 'POST', { status: 'PICKING' });
  await request(`/api/v1/orders/${orderId}/lines/${lineId}/pick`, 'POST', { pickedQty: 2 });
  await request(`/api/v1/orders/${orderId}/lines/${lineId}/deviation`, 'POST', { actualQty: 2, reason: 'DAMAGED' });
  const queue = await request('/api/v1/orders?status=DEVIATION');
  assert.equal(queue.bestillinger[0].status, 'DEVIATION');
  assert.equal(queue.bestillinger[0].linjer[0].lineStatus, 'DEVIATION');

  const loanDraft = await request('/api/v1/orders/draft', 'POST', {});
  const loanOrderId = loanDraft.orderId;
  const loanLine = await request(`/api/v1/orders/${loanOrderId}/lines`, 'POST', { productId: 'FLASKE-01', quantity: 2 });
  await request(`/api/v1/orders/${loanOrderId}/submit`, 'POST', {});
  await request(`/api/v1/orders/${loanOrderId}/status`, 'POST', { status: 'PICKING' });
  await request(`/api/v1/orders/${loanOrderId}/lines/${loanLine.line.id}/pick`, 'POST', { pickedQty: 2 });
  await request(`/api/v1/orders/${loanOrderId}/status`, 'POST', { status: 'READY_FOR_PICKUP' });
  const loanResult = await request(`/api/v1/orders/${loanOrderId}/loan`, 'POST', { borrowerId: 'DEMO-LAANER-01' });
  assert.equal(loanResult.createdLoans.length, 1);
  assert.equal((await request('/api/v1/loans')).data.length, 1);
  assert.equal((await request('/api/v1/orders?status=COMPLETED')).bestillinger[0].id, loanOrderId);

  const storedBeforeReload = values.get('HUL_MOCK_DB_v1');
  assert.match(storedBeforeReload, /syntetisk-bruker/);
  const refreshedWindow = { __HUL_RUNTIME_CONFIG: window.__HUL_RUNTIME_CONFIG, fetch: async () => { throw new Error('unexpected network'); } };
  context.window = refreshedWindow;
  vm.runInNewContext(backend, context);
  const afterRefresh = await refreshedWindow.fetch(`mock://hul-mock.local/api/v1/orders?status=DEVIATION`);
  assert.equal((await afterRefresh.json()).bestillinger[0].status, 'DEVIATION');
  values.delete('HUL_MOCK_DB_v1');
  assert.equal(values.has('HUL_MOCK_DB_v1'), false, 'demo reset removes the complete local database');
});

test('HUL demo remains responsive and confines write actions to the local mock', () => {
  assert.match(css, /@media/);
  assert.match(html, /connect-src 'none'/);
  assert.match(runtime, /backendBaseUrl:\s*'mock:\/\//);
  assert.match(backend, /api\\\/v1\\\/orders/);
  assert.match(backend, /localStorage\.setItem\(STORAGE_KEY/);
});
