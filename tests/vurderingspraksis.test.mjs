import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(file, import.meta.url), 'utf8');
const html = read('../vibe/vurderingspraksis/index.html');
const app = read('../vibe/vurderingspraksis/app.js');
const content = read('../vibe/vurderingspraksis/content.js');
const appearance = read('../vibe/vurderingspraksis/appearance.js');
const docs = read('../vibe/vurderingspraksis/README.md');
const catalog = JSON.parse(read('../vibe/catalog.json'));

test('source-faithful route and catalog record document isolated scope and source SHA', () => {
  const entry = catalog.apps.find((item) => item.slug === 'vurderingspraksis');
  assert.ok(entry);
  assert.match(entry.source, /92379f1108ec71013a06c4e5976a6fe79de81a3e/);
  assert.match(entry.status, /delvis løst/i);
  assert.match(entry.routeState, /Eksisterende.*\/vibe\/vurderingspraksis/);
  for (const view of ['prep', 'day1', 'day2', 'afterwork']) assert.match(html, new RegExp(`data-view="${view}"`));
  assert.match(content, /const topics = \[/);
  for (const topic of ['workplace', 'overall', 'lub', 'assessment', 'criteria', 'activities', 'requirements', 'documentation', 'evaluation']) assert.match(content, new RegExp(`key:'${topic}'`));
  assert.match(app, /function flowMarkup/);
  assert.match(app, /function quickMenuMarkup/);
  assert.match(app, /function showRoute/);
});

test('route discloses synthetic content and resets its only local preferences', () => {
  assert.match(html, /Syntetisk demonstrasjon/);
  assert.match(html, /lagres lokalt/i);
  assert.match(html, /id="reset-local-data"/);
  assert.match(app, /localStorage\.removeItem\(FLOW_SEEN_KEY\)/);
  assert.match(app, /localStorage\.removeItem\('vibe-vurderingspraksis-appearance-v2'\)/);
  assert.match(appearance, /localStorage\.setItem\(key/);
  assert.match(docs, /Nullstill lokale valg/);
});

test('route has no external calls, private resource identifiers, or participant data', () => {
  const bundle = `${html}\n${app}\n${content}\n${appearance}`;
  assert.doesNotMatch(bundle, /https?:\/\//i);
  assert.doesNotMatch(bundle, /(?:fetch\s*\(|XMLHttpRequest|sendBeacon|youtube-nocookie|drive\.google|sessionStorage|indexedDB|document\.cookie)/i);
  assert.doesNotMatch(bundle, /1257JBC|1ztyJGssl|12QwjEzN6|26\.–27\. oktober 2026|15\. august 2026/);
  assert.match(content, /Eksempel: forventningene/);
});
