import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Tidteller portal has a complete assessment and one direct catalog route', () => {
  const matches = catalog.apps.filter((app) => app.slug === 'tidteller');
  assert.equal(matches.length, 1);
  const app = matches[0];
  for (const field of ['status', 'sourceUncertainty', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy', 'rightsUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk', 'scope', 'routeState']) {
    assert.equal(typeof app[field], 'string', `${field} is documented`);
    assert.ok(app[field].trim(), `${field} is non-empty`);
  }
  assert.equal(catalog.apps.filter((entry) => entry.slug === app.slug).length, 1);
});

test('Tidteller route links only to verified internal tool routes and returns to the hub', () => {
  const html = read('vibe/tidteller/index.html');
  const expected = ['klokke', 'nedtelling', 'timer', 'stoppeklokke', 'opptelling', 'nedtelling-epost', 'ticker'];
  const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1]);
  for (const slug of expected) {
    assert.ok(hrefs.includes(`/vibe/${slug}/`), `${slug} link exists`);
    assert.ok(catalog.apps.some((app) => app.slug === slug), `${slug} is in the catalog`);
  }
  assert.equal(hrefs.filter((href) => href.startsWith('/vibe/') && href !== '/vibe/').length, expected.length);
  assert.ok(hrefs.includes('/vibe/'), 'hub return link exists');
  assert.match(html, /<html lang="no">/);
  assert.match(html, /role="navigation"|<nav\b/);
  assert.match(html, /skip-link/);
  assert.match(read('vibe/tidteller/style.css'), /prefers-reduced-motion/);
});

test('Tidteller route has no form, script, external destination, persistence, or network runtime', () => {
  const html = read('vibe/tidteller/index.html');
  const css = read('vibe/tidteller/style.css');
  const runtime = `${html}\n${css}`;
  assert.doesNotMatch(html, /<script\b|<form\b|<input\b/i);
  assert.doesNotMatch(runtime, /https?:\/\/|\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage|indexedDB|sendBeacon)\b|document\.cookie/i);
  assert.match(html, /eksempler/i);
  assert.match(read('vibe/tidteller/README.md'), /Ingen PHP, API, eksterne destinasjoner, auth, lagring, telemetry, persondata eller secrets/i);
});
