import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../vibe/wp-l-ringssti/index.html', import.meta.url), 'utf8');
const js = readFileSync(new URL('../vibe/wp-l-ringssti/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../vibe/wp-l-ringssti/style.css', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../vibe/wp-l-ringssti/README.md', import.meta.url), 'utf8');
const catalog = JSON.parse(readFileSync(new URL('../vibe/catalog.json', import.meta.url), 'utf8'));

test('WP Læringssti route has direct and hub navigation plus both usable views', () => {
  assert.match(html, /canonical" href="\/vibe\/wp-l-ringssti\/"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /data-view="learn"/);
  assert.match(html, /data-view="edit"/);
  assert.match(html, /data-tab="modules"/);
  assert.match(html, /data-tab="timeline"/);
  assert.match(html, /data-tab="media"/);
  assert.match(js, /overview: true/);
  assert.match(js, /state\.overview = true/);
});

test('demo preserves the source player and editor feature families with synthetic content', () => {
  for (const type of ['factBox', 'accordion', 'hierarchy', 'timeline', 'richText', 'quiz', 'case']) assert.match(js, new RegExp(type));
  for (const action of ['previous', 'next', 'finish-module', 'check-quiz', 'save-draft', 'clear-draft', 'ai-quiz', 'ai-case', 'add-module', 'move-element', 'remove-module', 'add-event', 'add-option']) assert.match(js, new RegExp(`'${action}'`));
  assert.match(js, /Syntetisk læringssti/);
  assert.match(js, /locked: true/);
  assert.match(docs, /motstrid|sprik/i);
  assert.match(docs, /syntetiske/i);
});

test('all transient demo actions stay in memory without requests, cookies, or browser persistence', () => {
  assert.match(js, /let state = seed\(\)/);
  assert.doesNotMatch(`${html}\n${js}`, /\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.sendBeacon)\b/i);
  assert.doesNotMatch(`${html}\n${js}`, /https?:\/\//i);
  assert.match(js, /document\.addEventListener\('click'/);
  assert.match(docs, /Oppdatering nullstiller alt/);
});

test('interactive controls have visible keyboard focus and the layout adapts to mobile', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-label="Redigeringsområder"/);
  assert.match(html, /aria-live="polite"/);
});

test('catalog entry documents the faithful copy and its static-demo boundary', () => {
  const entry = catalog.apps.find((app) => app.slug === 'wp-l-ringssti');
  assert.ok(entry);
  assert.match(entry.status, /tro kopi|funksjonskopi/i);
  assert.match(entry.source, /WP-l-ringssti/);
  assert.match(entry.sourceStack, /PHP|WordPress/i);
  assert.match(entry.sourceApiAuthStoragePrivacy, /ingen nettverkskall|ingen nettverk/i);
  assert.match(entry.rightsUncertainty, /lisens/i);
  assert.match(entry.scope, /ingen.*lagring/i);
});
