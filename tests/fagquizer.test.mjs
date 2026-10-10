import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));
const html = read('vibe/fagquizer/index.html');
const app = read('vibe/fagquizer/app.js');
const css = read('vibe/fagquizer/style.css');
const sourceData = read('vibe/fagquizer/data.js').replace(/^window\.FAGQUIZER_DATA = /, '').replace(/;\s*$/, '');
const data = JSON.parse(sourceData);

test('The copied app has one catalog entry and a direct hub-linked route', () => {
  const matches = catalog.apps.filter((entry) => entry.slug === 'fagquizer');
  assert.equal(matches.length, 1);
  for (const field of ['source','sourceStack','sourceTests','sourceApiAuthStoragePrivacy','rightsUncertainty','purpose','demoValue','simplifications','risk','scope','routeState','status']) {
    assert.ok(matches[0][field]?.trim(), `${field} is documented`);
  }
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /aria-label="Tilbake til Vibe-utstillingen"/);
  assert.match(html, /Nullstill all demodata/);
});

test('The source learning catalog and all activity types are represented', () => {
  assert.equal(data.nature.length, 16);
  assert.equal(data.society.length, 15);
  assert.equal(data.cards.length, 16);
  assert.equal(data.words.length, 15);
  assert.equal(data.open.length, 15);
  assert.equal(data.society[0].answers.length, 4);
  assert.match(data.nature[1].why, /13,8 milliarder år/);
  assert.match(data.society[0].answers[0][1], /mennesker/);
  assert.match(data.cards[0].definition, /mennesker/);
  assert.match(data.words[0].prompt, /landskap/);
  assert.match(data.open[0].q, /naturlandskap/);
  for (const behavior of ['renderSubject','renderTopic','startQuiz','selectChoice','startCards','startWords','startOpen','renderAdmin','checkOpen','checkWord']) {
    assert.match(app, new RegExp(`function ${behavior}\\b`), `${behavior} flow exists`);
  }
});

test('Authentication and grading are labelled simulations; local data has a full reset', () => {
  assert.match(html, /Syntetisk testdemo/);
  assert.match(html, /Ikke skriv inn personopplysninger/);
  assert.match(app, /Demo-elev/);
  assert.match(app, /Demo-admin/);
  assert.match(app, /localStorage\.setItem\(STORE/);
  assert.match(app, /localStorage\.removeItem\(STORE\)/);
  assert.match(app, /Demovurdering/);
  assert.match(app, /ikke KI/);
  assert.doesNotMatch(html + app, /document\.cookie|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest|\bfetch\s*\(/i);
  assert.doesNotMatch(html + app, /QUIZ_(?:OPENAI|GEMINI)_API_KEY|sk-[A-Za-z0-9]{16,}|studentnavn|elevnavn/i);
});

test('The interface exposes live status, keyboard controls, focus, mobile layout and reduced motion', () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(app, /keydown/);
  assert.match(app, /role="status"/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /min-width:320px/);
  assert.match(css, /prefers-reduced-motion/);
});
