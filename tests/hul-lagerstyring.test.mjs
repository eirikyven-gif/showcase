import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

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
  assert.match(html, /localStorage/);
  assert.match(backend, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(readme, /fdda6419dbe8c8891eb9d27f9f6e56ec3151a602/);
  assert.match(readme, /localStorage/);
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
  assert.equal(version, '0.60.2');
  assert.match(app.source, /fdda6419dbe8c8891eb9d27f9f6e56ec3151a602/);
  assert.match(app.scope, /connect-src none/);
  assert.match(app.routeState, /VERSION bumped til 0\.60\.2/);
  assert.doesNotMatch(app.risk, /rolle-simulator|rolle.*sideøkten/);
});
