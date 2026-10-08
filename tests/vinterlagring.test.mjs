import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const html = read('vibe/vinterlagring-fornes/index.html');
const css = read('vibe/vinterlagring-fornes/style.css');
const readme = read('vibe/vinterlagring-fornes/README.md');

test('Vinterlagring is catalogued as a broad-round synthetic demo', () => {
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const entry = catalog.apps.find((app) => app.slug === 'vinterlagring-fornes');
  assert.ok(entry);
  for (const field of ['name', 'useCase', 'category', 'status', 'demoValue', 'simplifications', 'risk', 'scope']) {
    assert.equal(typeof entry[field], 'string', `${field} is documented`);
    assert.ok(entry[field].length > 0, `${field} is not empty`);
  }
  assert.ok(entry.audience.length > 0);
  assert.match(entry.risk, /Lagerkart Vinter/);
  assert.match(entry.status, /bred førstegangsvurdering/);
  assert.match(read('VERSION').trim(), /^0\.20\.\d+$/);
});

test('demo has one static fictional storage state and no personal data form', () => {
  assert.match(html, /<html lang="no">/);
  assert.match(html, /<h3>V-04<\/h3>/);
  assert.match(html, />Lagret<\/span>/);
  assert.equal([...html.matchAll(/<article\b/g)].length, 1);
  assert.doesNotMatch(html, /<form\b|<input\b|<textarea\b|<select\b/i);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(readme, /Mulig overlapp med Lagerkart Vinter/);
});

test('demo has no scripts, external resources, network, auth, or persistence', () => {
  assert.doesNotMatch(html, /<script\b|https?:\/\/|\bsrc\s*=/i);
  assert.doesNotMatch(css, /url\s*\(|https?:\/\//i);
  const combined = `${html}\n${css}`;
  assert.doesNotMatch(combined, /\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|PHPSESSID|password|email)\b/i);
  assert.doesNotMatch(combined, /<form\b|<input\b|<textarea\b|<select\b/i);
});

test('page includes semantic landmarks, accessible status, focus, and mobile layout', () => {
  assert.match(html, /<main>/);
  assert.match(html, /aria-labelledby="page-title"/);
  assert.match(html, /aria-label="Eksempelplass V-04, lagret"/);
  assert.match(html, /role="img" aria-label=/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /prefers-reduced-motion/);
});
