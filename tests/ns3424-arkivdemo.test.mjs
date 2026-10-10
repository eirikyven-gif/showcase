import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');

test('catalog and route identify the archived app and its status', () => {
  const html = read('vibe/ns3424-arkivdemo/index.html');
  const docs = read('vibe/ns3424-arkivdemo/README.md');
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const app = catalog.apps.find(item => item.slug === 'ns3424-arkivdemo');
  assert.ok(app);
  assert.equal(read('VERSION').trim(), '0.60.1');
  assert.match(app.source, /eirikyven-gif\/ns3456/);
  assert.match(app.source, /5c58678269fb2c24d83af8afedeb65c8878732ff/);
  assert.match(app.status, /arkivert app-fdvu-ns3424/);
  assert.match(app.status, /Issue #2 delvis/);
  assert.match(app.routeState, /0\.59\.0.*0\.60\.0/);
  assert.match(html, /rel="canonical" href="\/vibe\/ns3424-arkivdemo\/"/);
  assert.match(html, /eirikyven-gif\/ns3456, app-fdvu-ns3424 v0\.1\.1; arkivert/);
  assert.match(docs, /5c58678269fb2c24d83af8afedeb65c8878732ff/);
  assert.match(html, /ikke faglig veiledning/i);
  assert.match(html, /Nullstill hele demoen/);
});

test('route retains core learning areas, five synthetic cases and the ten-question quiz', () => {
  const html = read('vibe/ns3424-arkivdemo/index.html');
  for (const id of ['intro', 'tg', 'levels', 'kg', 'risk', 'process', 'practice', 'quiz']) {
    assert.match(html, new RegExp(`data-section="${id}"`));
    assert.match(html, new RegExp(`id="sec-${id}"`));
  }
  assert.equal((html.match(/class="practice-component"/g) || []).length, 5);
  assert.equal((html.match(/class="quiz-q"/g) || []).length, 10);
  for (let i = 1; i <= 5; i++) {
    assert.match(html, new RegExp(`Syntetisk case SYN-0${i}`));
    assert.match(html, new RegExp(`data-required-observations="[234]"`));
    assert.match(html, new RegExp(`data-risk-case="p${i}"`));
  }
  for (const term of ['Analysenivå', 'Tilstandsgrader (TG0–TG3)', 'Konsekvensgrader (KG0–KG3)', 'sannsynlighet', 'casearbeidsark']) assert.ok(html.toLowerCase().includes(term.toLowerCase()), term);
  assert.match(html, /function checkQuiz\(\)/);
  assert.match(html, /function resetQuiz\(\)/);
  assert.match(html, /Illustrativ risikoklasse/);
});

test('no auth, persistence, network, or external runtime; reset clears interactive state', () => {
  const html = read('vibe/ns3424-arkivdemo/index.html');
  assert.doesNotMatch(html, /(?:fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker)/i);
  assert.doesNotMatch(html, /<form\b|type=["']password|type=["']email|<script[^>]+src=|<link[^>]+href=["']https?:/i);
  assert.doesNotMatch(html, /Apps Script|script\.google\.com|AKfycb|@gmail\.com|Hadsel sykehus|Nordskogen skole/);
  assert.match(html, /document\.getElementById\('reset-all'\)[\s\S]*?resetPractice\(\)[\s\S]*?resetQuiz\(\)[\s\S]*?worksheet[\s\S]*?accordion-body[\s\S]*?\.section/);
  assert.match(html, /role="note"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /@media \(max-width: 600px\)/);
});
