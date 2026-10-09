import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(path.join(repoRoot, name), 'utf8');
const catalog = JSON.parse(read('vibe/catalog.json'));

test('existing Analog Synthesizer candidate has a complete, evidence-qualified assessment', () => {
  const matches = catalog.apps.filter((entry) => entry.slug === 'analog-synthesizer');
  assert.equal(matches.length, 1, 'keep one existing catalog route');
  const app = matches[0];

  for (const field of [
    'status', 'sourceUncertainty', 'purpose', 'demoValue', 'simplifications', 'risk',
    'scope', 'source', 'sourceStack', 'sourceTests', 'sourceApiAuthStoragePrivacy',
    'rightsUncertainty', 'routeState',
  ]) {
    assert.equal(typeof app[field], 'string', `candidate records ${field}`);
    assert.ok(app[field].trim(), `${field} is not empty`);
  }

  assert.match(app.status, /Beholdt i bred førstegangsvurdering/);
  assert.match(app.sourceUncertainty, /produksjonsdeploy er ikke bekreftet/i);
  assert.match(app.sourceTests, /ikke kjørt på nytt/i);
  assert.match(app.sourceApiAuthStoragePrivacy, /MIDI-tilgang|requestMIDIAccess/);
  assert.match(app.sourceApiAuthStoragePrivacy, /getUserMedia/);
  assert.match(app.sourceApiAuthStoragePrivacy, /localStorage/);
  assert.match(app.sourceApiAuthStoragePrivacy, /IndexedDB/);
  assert.match(app.rightsUncertainty, /ikke uavhengig bekreftet/i);
  assert.match(app.routeState, /allerede i main/i);
});

test('existing Analog Synthesizer route remains isolated, synthetic, and permission-free', () => {
  const html = read('vibe/analog-synthesizer/index.html');
  const script = read('vibe/analog-synthesizer/app.js');
  const css = read('vibe/analog-synthesizer/style.css');
  const docs = read('vibe/analog-synthesizer/README.md');
  const runtime = `${html}\n${script}\n${css}`;

  assert.match(html, /href="\/vibe\/analog-synthesizer\/style\.css"/);
  assert.match(html, /href="\/vibe\/"/);
  assert.match(html, /aria-label="Personvern og lydtilgang"/);
  assert.match(html, /Ingen mikrofon, opptak eller lagring/i);
  assert.match(script, /toggle\.addEventListener\('click'/);
  assert.match(script, /new AudioContextClass\(\)/);
  assert.match(docs, /Kildens synlige stack/);
  assert.match(docs, /lisensdekning er ikke uavhengig bekreftet/i);

  for (const pattern of [
    /getUserMedia|mediaDevices/i,
    /requestMIDIAccess|MIDIAccess/i,
    /MediaRecorder/i,
    /<input\b[^>]*type\s*=\s*["']file/i,
    /\b(?:fetch\s*\(|XMLHttpRequest|sendBeacon)\b/i,
    /\b(?:localStorage|sessionStorage|indexedDB)\b/i,
    /document\.cookie/i,
    /https?:\/\//i,
    /Authorization\s*:|credentials\s*:\s*["']include/i,
  ]) assert.doesNotMatch(runtime, pattern, `showcase runtime excludes ${pattern}`);
});
