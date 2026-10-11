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
  assert.equal(read('VERSION').trim(), '0.61.0');
  assert.match(app.source, /eirikyven-gif\/ns3456/);
  assert.match(app.source, /5c58678269fb2c24d83af8afedeb65c8878732ff/);
  assert.match(app.status, /kildeparitet[\s\S]*5c58678269fb2c24d83af8afedeb65c8878732ff/);
  assert.match(app.status, /Issue #2 delvis/);
  assert.match(app.routeState, /correction merged as patch v0\.60\.7 based on v0\.60\.6 \(PR #100\)/);
  assert.match(app.routeState, /included in successful deployment #38122871657/);
  assert.doesNotMatch(app.routeState, /no deployment is claimed|not deployed|ikke deployet/i);
  assert.equal(app.parityDocument, 'vibe/ns3424-arkivdemo/PARITY.md');
  assert.match(html, /rel="canonical" href="\/vibe\/ns3424-arkivdemo\/"/);
  assert.match(html, /eirikyven-gif\/ns3456, app-fdvu-ns3424 v0\.1\.1; arkivert/);
  assert.match(docs, /5c58678269fb2c24d83af8afedeb65c8878732ff/);
  assert.match(docs, /PARITY\.md/);
  assert.match(html, /ikke faglig veiledning/i);
  assert.match(html, /Nullstill hele demoen/);
  assert.match(html, /Før du starter/);
  assert.match(html, /Trinn \$\{welcomeStep\+1\} av/);
  assert.match(html, /id="info-dialog"/);
  assert.match(html, /id="feedback-dialog"/);
  assert.match(html, /tilbakemeldingen er ikke sendt eller lagret/i);
});

test('source learning path has every module and dedicated local workflows', () => {
  const html = read('vibe/ns3424-arkivdemo/index.html');
  const docs = read('vibe/ns3424-arkivdemo/PARITY.md');
  for (const title of [
    'Start her: NS 3424 i praksis (demo)',
    'NS 3424: Formål, leveranser og avgrensning',
    'Analysenivå 1–3: Velg riktig nivå',
    'TG0–TG3 + TGIU og referansenivå',
    'Konsekvens (KG) + sannsynlighet → risiko',
    'Hva er en god observasjon? (observasjon vs tolkning)',
    'Case 1: Fuktspor på bad (enkel)',
    'Case 2: Sprekker i pusset fasade (lett–middels)',
    'Case 3: Ventilasjon og inneklima (middels)',
    'Case 4: Branncelle-dør og rømningsvei (middels–høy)',
    'Case 5: Kombinasjonsbygg bolig + næring (kompleks)'
  ]) assert.ok(html.includes(title), title);
  for (const hook of ['data-module-open', 'data-level', 'data-tg', 'data-kg', 'data-prob', 'data-sort', 'data-case-observation', 'data-case-level', 'data-case-tg-reason', 'data-case-kg-reason', 'data-case-risk-reason', 'data-case-now', 'data-case-short', 'data-case-long', 'data-case-further', 'data-submit-case', 'data-skip-quiz', 'data-complete-module']) assert.ok(html.includes(hook), hook);
  assert.match(docs, /No built-in print, report generation, PDF\/export or download function was found/);
  assert.match(docs, /master log remains provenance for a separate plan/i);
  for (const unsupported of ['data-case-level-reason', 'data-case-documentation', 'data-case-evidence', 'data-case-verification', 'data-case-uncertainty', 'data-case-priority', 'data-case-student-comment']) assert.doesNotMatch(html, new RegExp(unsupported));
  assert.doesNotMatch(html, /Vis arbeidsarkssammendrag|Eksporter rapport|Last ned PDF/);
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
  assert.match(html, /Hvilket analysenivå kreves når du skal verifisere teknisk ytelse med målinger og beregninger/);
  assert.match(html, /q1_analysenivå/);
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
