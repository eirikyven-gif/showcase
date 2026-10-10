import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');

test('Bingo route keeps its public and admin workflows with direct hub return', () => {
  const html = read('vibe/bingo/index.html');
  const app = JSON.parse(read('vibe/catalog.json')).apps.find(item => item.slug === 'bingo');
  assert.ok(app);
  assert.match(app.status, /tro arbeidsflytkopi/i);
  assert.match(html, /href="\/vibe\/"/);
  for (const id of ['public-tab', 'admin-tab', 'week-public', 'open-admin', 'payment-info', 'qr-file', 'logo-file', 'save-settings', 'generate-week', 'reset-demo', 'reset-demo-public']) assert.match(html, new RegExp(`id="${id}"`));
  for (const kind of ['tall', 'name']) assert.match(html, new RegExp(`data-download="${kind}"`));
  assert.match(html, /A4 liggende/);
  assert.match(html, /A4 stående/);
  assert.match(html, /Bingo-arrangør/);
  assert.match(html, /localStorage|nettleseren/i);
  assert.match(html, /role="status"/);
  assert.match(html, /aria-live="polite"/);
});

test('sample fixtures preserve board shape while containing no identifying source names', () => {
  const script = read('vibe/bingo/bingo.js');
  assert.match(script, /length: 30/);
  assert.match(script, /Eksempelnavn B-01/);
  assert.match(script, /Eksempelnavn O-06/);
  assert.match(script, /FRI RUTE/);
  assert.match(script, /columnIndex \* 15 \+ 1/);
  assert.doesNotMatch(script, /Ola Nordmann|Kari Nordmann|Per Hansen|Anne Larsen/);
  assert.match(script, /<table class="number-grid" aria-label=/);
  assert.match(script, /<th scope="col">/);
  assert.match(script, /<th class="name-index" scope="row">/);
});

test('settings and generated week persist locally and can be fully reset', () => {
  const script = read('vibe/bingo/bingo.js');
  const html = read('vibe/bingo/index.html');
  assert.match(script, /localStorage\.getItem\(STORE_KEY\)/);
  assert.match(script, /localStorage\.setItem\(STORE_KEY/);
  assert.match(script, /localStorage\.removeItem\(STORE_KEY\)/);
  assert.match(script, /vibe-bingo-demo-v1/);
  assert.match(script, /window\.confirm\(/);
  assert.match(html, /lagres bare i denne nettleseren/);
  assert.match(html, /Nullstill alle lokale demodata/);
  assert.match(html, /Nullstill alle demodata/);
  assert.match(script, /ikke kontaktet/);
});

test('local assets stay browser-only, restrict unsafe SVG, and have no live integrations', () => {
  const html = read('vibe/bingo/index.html');
  const script = read('vibe/bingo/bingo.js');
  assert.match(html, /accept="image\/png,image\/jpeg,image\/svg\+xml"/);
  assert.match(script, /300_000/);
  assert.match(script, /external resources|eksterne ressurser/i);
  assert.match(script, /FileReader/);
  assert.match(script, /readAsDataURL/);
  assert.match(script, /validLocalImage/);
  assert.doesNotMatch(script, /fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/i);
  assert.doesNotMatch(script, /document\.cookie|sessionStorage|indexedDB/i);
  assert.doesNotMatch(html + script, /type="password"|autocomplete="current-password"|https?:\/\//i);
});

test('route and docs document synthetic behavior, privacy boundaries, and print formats', () => {
  const html = read('vibe/bingo/index.html');
  const css = read('vibe/bingo/bingo.css');
  const docs = read('vibe/bingo/README.md');
  assert.match(html, /print-board/);
  assert.match(css, /@page landscape/);
  assert.match(css, /@page portrait/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /max-width:760px/);
  assert.match(css, /@media print/);
  assert.match(docs, /0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/);
  assert.match(docs, /SSoT v0\.1 og presisering v0\.2/);
  assert.match(docs, /Google Apps Script.*SSB.*One\.com/);
  assert.match(docs, /Ingen kildekode, logo, dokumentmal/);
});
