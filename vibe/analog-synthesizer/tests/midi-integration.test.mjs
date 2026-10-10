import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appUrl = new URL('../assets/app.js', import.meta.url);
const htmlUrl = new URL('../index.html', import.meta.url);
const stylesUrl = new URL('../assets/styles.css', import.meta.url);

function functionBody(source, name, nextName) {
  const expression = new RegExp(`function ${name}\\([^)]*\\) \\{([\\s\\S]*?)\\n\\}\\n\\n(?:async )?function ${nextName}\\(`);
  return source.match(expression)?.[1] || '';
}

test('MIDI setup UI exposes one accessible control for every integration hook', async () => {
  const html = await readFile(htmlUrl, 'utf8');
  const ids = [
    'midiStatus',
    'openMidiSettings',
    'midiDialog',
    'closeMidiSettings',
    'requestMidiAccess',
    'midiSupportMessage',
    'midiActivity',
    'midiDeviceList',
    'midiProfileSelect',
    'newMidiProfile',
    'renameMidiProfile',
    'deleteMidiProfile',
    'loadMidimixProfile',
    'midiLearnTarget',
    'midiLearnMode',
    'midiLearnChannel',
    'startMidiLearn',
    'cancelMidiLearn',
    'midiLearnStatus',
    'midiMappingList',
  ];
  for (const id of ids) {
    assert.equal(html.match(new RegExp(`id="${id}"`, 'g'))?.length, 1, `${id} must exist exactly once`);
  }
  const dialog = html.match(/<dialog id="midiDialog"[\s\S]*?<\/dialog>/)?.[0] || '';
  assert.match(dialog, /aria-labelledby="midiTitle"/);
  assert.match(dialog, /aria-describedby="midiDescription"/);
  assert.match(dialog, /class="button panic-button panic-action"/);
  assert.match(dialog, /id="midiSupportMessage"[\s\S]*?role="status"[\s\S]*?aria-live="polite"/);
  assert.match(dialog, /id="midiLearnStatus"[\s\S]*?role="status"[\s\S]*?aria-live="polite"/);
  assert.match(dialog, /id="midiLearnStatus"[^>]*tabindex="-1"/);
  assert.match(dialog, /id="midiActivity"[^>]*aria-live="off"/);
  assert.match(dialog, /Safari på iPad og iPhone støtter ikke direkte MIDI-tilkobling/);
});

test('app routes mapped CC through canonical state without a full interface render', async () => {
  const app = await readFile(appUrl, 'utf8');
  assert.match(app, /from '\.\/midi-controller\.js\?build=2026-10-10\.1'/);
  assert.doesNotMatch(app, /function handleMidi\(event\)/);
  assert.doesNotMatch(app, /data1 === 1|data1 === 7|data1 === 74/);

  const body = functionBody(app, 'applyMidiParameter', 'applyMidiAction');
  assert.match(body, /setStateParameterValue\(key, Number\(value\)\)/);
  assert.match(body, /syncRenderedControls\(key, getStateParameterValue\(key\)\)/);
  assert.match(body, /queueAudioParameter\(key\)/);
  assert.match(body, /persistSession\(\)/);
  assert.doesNotMatch(body, /syncControls\(/);
});

test('app integrates all mapped button actions and preserves unmapped note performance', async () => {
  const app = await readFile(appUrl, 'utf8');
  const actions = functionBody(app, 'applyMidiAction', 'applyMidiPerformance');
  assert.match(actions, /action === 'sequence-step-toggle'/);
  assert.match(actions, /state\.synthSteps\[index\]\.active = !state\.synthSteps\[index\]\.active/);
  assert.match(actions, /updateSelectedStepButtons\(\[index\]\)/);
  assert.match(actions, /if \(selectedSynthSteps\.has\(index\)\) renderStepEditor\(\)/);
  assert.doesNotMatch(actions, /selectedSynthSteps\.(?:clear|delete)|multiSelectSteps\s*=/);
  assert.match(actions, /persistSession\(\)/);
  assert.match(actions, /action === 'sequencer-toggle'/);
  assert.match(actions, /await toggleSequencer\(\)/);
  assert.match(actions, /action === 'kick-trigger'/);
  assert.match(actions, /await ensureAudio\(\)/);
  assert.match(actions, /engine\.triggerKick\(\)/);
  assert.match(actions, /action === 'pad-trigger'/);
  assert.match(actions, /await activatePad\(index, velocity\)/);
  assert.doesNotMatch(actions, /releasePadIfUnheld|engine\.releasePad/);

  const performance = functionBody(app, 'applyMidiPerformance', 'initializeMidiController');
  assert.match(performance, /engine\.noteOff\(note\)/);
  assert.match(performance, /await ensureAudio\(\)/);
  assert.match(performance, /engine\.noteOn\(note, velocity\)/);
});

test('MIDI profiles, learning, device selection and dialog lifecycle are wired', async () => {
  const app = await readFile(appUrl, 'utf8');
  for (const contract of [
    /createMidiController\(\{/,
    /setInputEnabled\(input\.id, checkbox\.checked\)/,
    /createProfile\(name\.trim\(\), active \? \{ fromProfileId: active\.id \} : \{\}\)/,
    /activateProfile\(AKAI_MIDIMIX_X2_PROFILE\.id\)/,
    /startLearn\(\{ target, mode, channel \}\)/,
    /setMappingActive\(mapping\.id, enabled\.checked\)/,
    /removeMapping\(mapping\.id\)/,
    /midiController\?\.destroy\?\.\(\)/,
    /midiDialogReturnTarget/,
    /function captureMidiFocus\(\)/,
    /function restoreMidiFocus\(token\)/,
    /type === 'learn-collision'/,
    /onMidiMessage: queueMidiActivity/,
  ]) assert.match(app, contract);
});

test('MIDI UI remains touch-friendly and the controller participates in the PWA build gate', async () => {
  const [styles, worker, updater, packageJson, version] = await Promise.all([
    readFile(stylesUrl, 'utf8'),
    readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
    readFile(new URL('../assets/update-controller.js', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
    readFile(new URL('../version.json', import.meta.url), 'utf8').then(JSON.parse),
  ]);
  assert.match(styles, /\.midi-dialog[\s\S]*?overflow-x: hidden/);
  assert.match(styles, /\.midi-actions \.button \{[^}]*min-height: 48px/);
  assert.match(styles, /\.midi-mapping-actions \.button \{[^}]*min-height: 44px/);
  assert.match(styles, /@media \(max-width: 640px\)[\s\S]*?\.midi-mapping-row/);
  assert.match(worker, /assets\/midi-controller\.js\?build=\$\{BUILD_ID\}/);
  assert.match(worker, /assets\/pad-activation\.js\?build=\$\{BUILD_ID\}/);
  assert.match(updater, /'\.\/assets\/midi-controller\.js'/);
  assert.match(updater, /'\.\/assets\/pad-activation\.js'/);
  assert.match(updater, /midiSource\.includes\('export function createMidiController'\)/);
  assert.match(packageJson.scripts.check, /assets\/midi-controller\.js/);
  assert.match(packageJson.scripts.check, /assets\/pad-activation\.js/);
  assert.equal(packageJson.version, '0.15.1');
  assert.equal(version.version, '0.15.1');
  assert.equal(version.build, '2026-10-10.1');
});
