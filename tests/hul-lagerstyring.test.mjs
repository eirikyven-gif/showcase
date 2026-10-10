import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = 'vibe/hul-lagerstyring/';
const html = readFileSync(`${route}index.html`, 'utf8');
const runtime = readFileSync(`${route}runtime-config.js`, 'utf8');
const backend = readFileSync(`${route}mock-backend.js`, 'utf8');
const readme = readFileSync(`${route}README.md`, 'utf8');

test('source-faithful HUL route is mock-only, disclosed, and resettable', () => {
  assert.match(runtime, /mockBackend:\s*true/);
  assert.match(runtime, /authMode:\s*'none'/);
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /Nullstill demo/);
  assert.match(html, /HUL_MOCK_DB_v1/);
  assert.match(html, /localStorage/);
  assert.match(backend, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(readme, /fdda6419dbe8c8891eb9d27f9f6e56ec3151a602/);
  assert.match(readme, /localStorage/);
});

test('catalog points to the route and source provenance', () => {
  const catalog = JSON.parse(readFileSync('vibe/catalog.json', 'utf8'));
  const app = catalog.apps.find((candidate) => candidate.slug === 'hul-lagerstyring');
  assert.ok(app);
  assert.match(app.source, /fdda6419dbe8c8891eb9d27f9f6e56ec3151a602/);
  assert.match(app.scope, /connect-src none/);
});
