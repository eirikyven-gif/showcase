import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Presentasjonsvisning has one complete assessment and a direct route', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'presentasjon');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['status', 'sourceUncertainty', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState']) {
    assert.equal(typeof app[field], 'string', `${field} is documented`);
    assert.ok(app[field].trim(), `${field} is not empty`);
  }
  assert.match(read('vibe/presentasjon/index.html'), /href="\/vibe\/"/);
  assert.match(read('vibe/assets/hub.js'), /\/vibe\/\$\{encodeURIComponent\(app\.slug\)\}\//, 'the hub builds a direct link for every catalog slug');
  assert.match(read('vibe/presentasjon/index.html'), /href="\/vibe\/assets\/hub\.css"/);
  assert.match(read('vibe/presentasjon/index.html'), /src="app\.js"/);
  assert.equal(read('VERSION').trim(), '0.36.1');
  assert.equal(catalog.apps.length, 38, 'the catalog has 38 routes after Ukelønn');
});

test('demo uses fictional local slides and does not persist or contact external services', () => {
  const html = read('vibe/presentasjon/index.html');
  const script = read('vibe/presentasjon/app.js');
  const css = read('vibe/presentasjon/style.css');
  assert.match(html, /fiktiv demonstrasjon/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /id="previous"/);
  assert.match(html, /id="next"/);
  assert.match(script, /ArrowLeft/);
  assert.match(script, /ArrowRight/);
  for (const source of [html, script, css]) {
    assert.doesNotMatch(source, /https?:\/\//i);
    assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|sendBeacon)\b/);
    assert.doesNotMatch(source, /\b(password|authorization|bearer|oauth|api[_-]?key)\b/i);
  }
});
