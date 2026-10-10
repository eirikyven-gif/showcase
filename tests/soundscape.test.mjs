import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('vibe/soundscape/index.html');
const app = read('vibe/soundscape/app.js');
const css = read('vibe/soundscape/style.css');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('Soundscape is a complete, directly routable catalog app', () => {
  assert.equal(catalog.apps.filter((item) => item.slug === 'soundscape').length, 1);
  assert.match(html, /<html lang="no">/);
  assert.match(html, /<link rel="canonical" href="\/vibe\/soundscape\/">/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /src="\/vibe\/soundscape\/app\.js"/);
  assert.match(html, /href="\/vibe\/soundscape\/style\.css"/);
  assert.match(read('vibe/soundscape/README.md'), /Issue #2/);
});

test('public signal and admin catalog retain all 45 source signal rows and all 43 targets', () => {
  const groupSource = app.match(/const groups = \{([\s\S]*?)\n\};/)?.[1];
  const targetsSource = app.match(/const targetNames=\[([^\]]+)\]/)?.[1];
  assert.ok(groupSource, 'signal group data exists');
  assert.ok(targetsSource, 'sound target data exists');
  assert.equal((groupSource.match(/'[^']+'/g) || []).length, 45);
  assert.equal((targetsSource.match(/'[^']+'/g) || []).length, 43);
  assert.match(html, /id="signal-table"/);
  assert.match(html, /id="signal-editor"/);
  assert.match(html, /id="target-editor"/);
  assert.match(html, /Datakilder[\s\S]*?Simulering og signaler[\s\S]*?Parameterkoblinger[\s\S]*?Kontroll og historikk/);
  assert.match(app, /scenarioName/);
  assert.match(app, /mapping-list/);
});

test('demo has no live network, auth, cookies, or server persistence', () => {
  for (const source of [html, app]) {
    assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b/);
    assert.doesNotMatch(source, /document\.cookie|sessionStorage|indexedDB/);
    assert.doesNotMatch(source, /https?:\/\//i);
    assert.doesNotMatch(source, /api\/(?:runtime|config|login|session|netatmo)|oauth\/|Bearer\s/i);
  }
  assert.doesNotMatch(app, /password|client_secret|access_token|refresh_token|latitude|longitude/i);
  assert.match(html, /syntetisk/i);
  assert.match(html, /Ingen kontopålogging/);
});

test('synthetic profile persistence is local-only and has a full reset path', () => {
  assert.match(app, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(app, /localStorage\.removeItem\(STORAGE_KEY\)/);
  assert.match(app, /vibe\.soundscape\.demo\.v1/);
  assert.match(app, /function fullReset\(/);
  assert.match(html, /id="reset-all"[^>]*>Slett all Soundscape-demotilstand/);
  assert.match(html, /autosaves lokalt i denne nettleseren, ikke på server/i);
  assert.match(html, /Lydkurator · redaktør/);
  assert.match(html, /Lytter · observatør/);
  assert.match(app, /demoRole==='viewer'/);
  assert.match(app, /snapshots\.push\(snapshotValue\(\)\)/);
});

test('route has responsive layouts, visible keyboard focus and reduced-motion support', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /max-width: 720px/);
  assert.match(css, /max-width: 430px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /<dialog id="help-dialog"/);
});
