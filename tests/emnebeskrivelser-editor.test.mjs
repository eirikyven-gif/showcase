import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root, 'vibe/emnebeskrivelser-editor/index.html'), 'utf8');
const css = readFileSync(path.join(root, 'vibe/emnebeskrivelser-editor/style.css'), 'utf8');
const readme = readFileSync(path.join(root, 'vibe/emnebeskrivelser-editor/README.md'), 'utf8');
const catalog = JSON.parse(readFileSync(path.join(root, 'vibe/catalog.json'), 'utf8'));

test('Emneoversikt is a complete static, synthetic showcase route', () => {
  assert.ok(statSync(path.join(root, 'vibe/emnebeskrivelser-editor/index.html')).isFile());
  assert.ok(statSync(path.join(root, 'vibe/emnebeskrivelser-editor/style.css')).isFile());
  const entry = catalog.apps.find((app) => app.slug === 'emnebeskrivelser-editor');
  assert.ok(entry, 'candidate stays in the broad catalog');
  assert.match(html, /<html lang="nb">/);
  assert.match(html, /<h1\b/);
  assert.match(html, /<nav\b[^>]*aria-label=/);
  assert.match(html, /<table>/);
  assert.match(html, /scope="col"/);
  assert.match(html, /scope="row"/);
  assert.match(html, /oppdiktet eksempel/i);
  assert.doesNotMatch(html, /<script\b|<form\b|<(?:input|textarea|select|button)\b/i);
  assert.doesNotMatch(html, /https?:\/\//i);
  assert.doesNotMatch(html, /<img\b/i);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(readme, /mulig tilsvarende appfamilieversjon/i);
  assert.match(readme, /snapshot-historikk/i);
  assert.match(readme, /PIN-konfigurasjonen/i);
  assert.match(readme, /rettighetsstatus/i);
  assert.match(readme, /Ingen lisensfil ble funnet/i);
});
