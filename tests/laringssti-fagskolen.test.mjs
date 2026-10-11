import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const html = read('vibe/laringssti-fagskolen/index.html');
const script = read('vibe/laringssti-fagskolen/app.js');
const css = read('vibe/laringssti-fagskolen/style.css');
const docs = read('vibe/laringssti-fagskolen/README.md');
const catalog = JSON.parse(read('vibe/catalog.json'));
const entry = catalog.apps.find((app) => app.slug === 'laringssti-fagskolen');

test('Læringssti route follows the locked synthetic end-to-end demo outline', () => {
  assert.ok(entry);
  assert.equal(catalog.apps.filter((app) => app.slug === 'laringssti-fagskolen').length, 1);
  for (const field of ['Kartlegg bygget', 'Vurder funnene', 'valgfri rekkefølge', 'bilde', 'video', 'lyd', 'enkeltvalg', 'flervalg', 'sortering', 'prioritering', 'fritekst', 'lærerforhåndsvisning', 'kategori- og modulfremdrift']) {
    assert.ok(`${entry.demoValue} ${docs}`.toLocaleLowerCase('nb').includes(field.toLocaleLowerCase('nb')), `documents ${field}`);
  }
  for (const criterion of ["criterion: 'none'", "criterion: 'video'", "criterion: 'text'", "criterion: 'automatic'"]) assert.ok(script.includes(criterion), `supports ${criterion}`);
  for (const activity of ["type: 'single'", "type: 'multi'", "type: 'sorting'", "type: 'priority'", "type: 'text'", "type: 'solutionText'", "type: 'solutionVideo'"]) assert.ok(script.includes(activity), `supports ${activity}`);
});

test('direct route, hub return, media alternatives, and keyboard-friendly controls are present', () => {
  assert.match(html, /href="\/vibe\/laringssti-fagskolen\/"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /Hopp til innholdet/);
  assert.match(script, /href="#\$\{esc\(hash\)\}"/);
  assert.match(script, /aria-label="\$\{esc\(page\.alt \|\| page\.mediaTitle\)\}"/);
  assert.match(script, /Textalternativ|Tekstalternativ/);
  assert.match(script, /Lydalternativ:/);
  assert.match(script, /<video class="demo-video" controls/);
  assert.match(script, /<audio class="demo-audio" controls/);
  assert.match(script, /<track kind="captions" srclang="nb"/);
  for (const asset of ['synthetic-building.mp4', 'synthetic-building.vtt', 'synthetic-tone.wav']) {
    assert.ok(statSync(path.join(root, 'vibe/laringssti-fagskolen/assets', asset)).size > 100, `${asset} exists and is nonempty`);
  }
  assert.match(script, /data-direction/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width:/);
  assert.match(css, /prefers-reduced-motion/);
});

test('demo persistence is local, resettable, and teacher preview does not write student progress', () => {
  assert.match(script, /localStorage\.setItem\(KEY/);
  assert.match(script, /localStorage\.removeItem\(KEY\)/);
  assert.match(script, /window\.confirm\('Nullstille all lokal fremdrift/);
  assert.match(script, /if \(state\.role === 'teacher'\) \{ announce\('Lærerforhåndsvisning lagrer ikke studentaktivitet eller progresjon\.'\); return; \}/);
  assert.match(script, /if \(state\.role !== 'teacher'\) save\(\)/);
  assert.match(entry.scope, /localStorage/);
  assert.match(entry.scope, /Ingen konto/);
  assert.match(entry.rightsUncertainty, /produksjonsinnhold eller mediefiler er kopiert/i);
  assert.match(docs, /Ingen konto, passord, innlogging/);
});

test('runtime has no server/API, external asset, password, cookie, or alternate transport surface', () => {
  assert.doesNotMatch(`${html}\n${script}`, /\b(?:fetch|XMLHttpRequest|sendBeacon|indexedDB|sessionStorage|document\.cookie)\b/i);
  assert.doesNotMatch(`${html}\n${script}`, /type\s*=\s*["']password["']/i);
  assert.doesNotMatch(`${html}\n${script}`, /https?:\/\//i);
  assert.doesNotMatch(`${html}\n${script}`, /\b(?:Authorization\s*:|credentials\s*:\s*["']include)/i);
});
