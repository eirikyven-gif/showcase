import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');

test('isolated route and catalog document source, route, scope, and uncertainties', () => {
  const html = read('vibe/ns3424-lab/index.html');
  const docs = read('vibe/ns3424-lab/README.md');
  const catalog = JSON.parse(read('vibe/catalog.json'));
  const app = catalog.apps.find(item => item.slug === 'ns3424-lab');
  assert.ok(app);
  assert.equal(catalog.apps.length, 39);
  for (const field of ['status', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState', 'sourceUncertainty']) {
    assert.equal(typeof app[field], 'string', `${field} is documented`);
    assert.ok(app[field].trim());
  }
  assert.match(app.source, /6938f28097d428d1af4c55d701ebb58bad9ff8a7/);
  assert.match(app.routeState, /e54dc69c748c61c070ee5a588bef019a2db5eed6/);
  assert.match(html, /rel="canonical" href="\/vibe\/ns3424-lab\/"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /Kun en illustrativ demo/);
  assert.match(html, /ikke uavhengig kontrollert/);
  assert.match(html, /ikke verifisert/);
  assert.match(html, /Nullstill hele demoen/);
  assert.match(app.rightsUncertainty, /rett til offentlig gjenbruk er ikke avklart/);
  assert.match(app.risk, /faglige riktighet er ikke kontrollert/);
});

test('preserves all eight sections, six exercise scenarios, ten quiz questions, and source interactions', () => {
  const html = read('vibe/ns3424-lab/index.html');
  for (const id of ['intro', 'tg', 'levels', 'kg', 'risk', 'process', 'practice', 'quiz']) {
    assert.match(html, new RegExp(`data-section="${id}"`));
    assert.match(html, new RegExp(`id="sec-${id}"`));
  }
  assert.equal((html.match(/class="practice-component"/g) || []).length, 6);
  assert.equal((html.match(/class="quiz-q"/g) || []).length, 10);
  for (const term of ['Tilstandsgrader (TG0–TG3)', 'Tre analysenivåer', 'Konsekvensgrader (KG0–KG3)', 'Risikomatrise', 'Prosesstrinnene i detalj', 'Yttertak — Enebolig fra 1985', 'Elektrisk anlegg — Rekkehus fra 1968', 'Kunnskapstest — NS3424']) assert.ok(html.includes(term), term);
  assert.match(html, /selectGrade\(this/);
  assert.match(html, /checkQuiz\(\)/);
  assert.match(html, /resetQuiz\(\)/);
  assert.match(html, /resetPractice\(\)/);
});

test('keeps the demo browser-only and offers a complete in-memory reset', () => {
  const html = read('vibe/ns3424-lab/index.html');
  assert.doesNotMatch(html, /(?:fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie|serviceWorker)/i);
  assert.doesNotMatch(html, /<form\b|type=["']password|type=["']email/i);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=["']https?:/i);
  assert.match(html, /function resetPractice\(\)[\s\S]*?Object\.keys\(practiceState\)[\s\S]*?delete practiceState\[key\]/);
  assert.match(html, /document\.getElementById\('reset-all'\)[\s\S]*?resetPractice\(\)[\s\S]*?resetQuiz\(\)[\s\S]*?accordion-body[\s\S]*?\.section/);
  assert.match(html, /role="note"/);
  assert.match(html, /aria-label="Demoens kapitler"/);
  assert.match(html, /aria-expanded/);
  assert.match(html, /aria-controls/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /@media \(max-width: 600px\)/);
});
