import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');

test('Progresjonsplan has complete broad-round metadata and one direct route', () => {
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const matches = catalog.apps.filter((entry) => entry.slug === 'progresjonsplan');
  assert.equal(matches.length, 1);
  for (const key of ['name', 'useCase', 'category', 'audience', 'status', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState', 'sourceUncertainty']) {
    assert.ok(matches[0][key], `${key} is documented`);
  }
  assert.deepEqual(matches[0].audience.length > 0, true);
});

test('Progresjonsplan is an original synthetic demo without auth, network, or persistence', () => {
  const html = read('vibe/progresjonsplan/index.html');
  const js = read('vibe/progresjonsplan/app.js');
  const docs = read('vibe/progresjonsplan/README.md');
  assert.match(html, /rel="canonical" href="\/vibe\/progresjonsplan\/"/);
  assert.match(html, /Fiktiv demo/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(js, /const modules = \[/);
  assert.match(js, /new Set\(\)/);
  assert.match(js, /type = 'radio'/);
  assert.match(docs, /ingen lisens/i);
  assert.match(docs, /WordPress-rolle-\/nonce-kontroller/);
  assert.doesNotMatch(`${html}\n${js}`, /(?:fetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker|pushManager|https?:\/\/)/i);
  assert.doesNotMatch(`${html}\n${js}`, /<form\b|type\s*=\s*["']password/i);
});

test('Progresjonsplan has responsive layout and visible keyboard focus', () => {
  const css = read('vibe/progresjonsplan/style.css');
  const html = read('vibe/progresjonsplan/index.html');
  assert.match(css, /@media\s*\(max-width:\s*600px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.feedback:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-live="polite"/);
});

test('step transitions, answer feedback, and return keep keyboard focus in context', () => {
  const js = read('vibe/progresjonsplan/app.js');
  assert.match(js, /heading\.tabIndex = -1/);
  assert.match(js, /\(feedback \?\? heading\)\.focus\(\)/);
  assert.match(js, /const returnModuleIndex = activeModule[\s\S]*?overview\.querySelectorAll\('button'\)\[returnModuleIndex\]\?\.focus\(\)/);
  assert.match(js, /feedback\.setAttribute\('role', 'status'\);\s*feedback\.setAttribute\('tabindex', '-1'\);/);
  assert.match(js, /player\.append\(actions\);\s*\(feedback \?\? heading\)\.focus\(\);/);
});

test('completing a module restores focus to that module’s button, including out-of-order completion', () => {
  const js = read('vibe/progresjonsplan/app.js');
  assert.match(js, /const completedIndex = activeModule;\s*completed\.add\(completedIndex\);[\s\S]*?renderOverview\(\);\s*overview\.querySelectorAll\('button'\)\[completedIndex\]\?\.focus\(\);/);
  assert.doesNotMatch(js, /indexForFocus|completed\.size\s*-\s*1/);
});
