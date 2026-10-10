import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../vibe/larebot/index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../vibe/larebot/app.js', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../vibe/larebot/style.css', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../vibe/larebot/README.md', import.meta.url), 'utf8');

test('Lærebot keeps both synthetic roles and the learner question/citation flow', () => {
  assert.match(html, /data-mode="learner"/);
  assert.match(html, /data-mode="admin"/);
  assert.match(html, /Fag/);
  assert.match(html, /Tema/);
  assert.match(html, /textarea[^>]+id="question"/);
  assert.match(html, /syntetisk/i);
  assert.match(script, /data-starter/);
  assert.match(script, /Kilde:/);
});

test('Lærebot stores only the editor configuration locally and offers a reset', () => {
  assert.match(script, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(script, /localStorage\.removeItem\(STORAGE_KEY/);
  assert.match(html, /id="reset-demo"/);
  assert.match(html, /ikke skriv inn navn.*personopplysninger/i);
  assert.match(docs, /Questions and replies exist only in page memory and are never transmitted or persisted/i);
  assert.doesNotMatch(script, /\b(?:fetch|XMLHttpRequest|sendBeacon|sessionStorage|indexedDB|document\.cookie)\b/i);
  assert.doesNotMatch(html + script, /password|PIN-kode|api\/(?:auth|chat)|credentials\s*:/i);
});

test('Lærebot keeps visible keyboard focus and reduced-motion support', () => {
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(html, /class="skip-link"/);
});
