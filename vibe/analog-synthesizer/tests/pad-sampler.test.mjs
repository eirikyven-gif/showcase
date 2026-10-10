import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { AudioEngine } from '../assets/audio-engine.js';
import {
  PAD_COUNT,
  createEmptyPadMetadata,
  defaultPreset,
  sanitizePreset,
} from '../assets/state.js';
import { padSampleStorageKey } from '../assets/sample-store.js';

class FakeNode {
  connect(target) {
    if (!this.targets) this.targets = [];
    this.targets.push(target);
    this.target = target;
    return target;
  }

  disconnect() {
    this.disconnected = true;
  }
}

class FakeAudioParam {
  constructor(value = 0) {
    this.value = value;
  }

  cancelScheduledValues() {}

  setTargetAtTime(value) {
    this.value = value;
  }
}

class FakeSourceNode extends FakeNode {
  constructor(_context, options = {}) {
    super();
    this.buffer = options.buffer;
    this.playbackRate = new FakeAudioParam(options.playbackRate ?? 1);
    this.loop = false;
    this.listeners = new Map();
    this.started = false;
    this.stopped = false;
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
  }

  emitEnded() {
    this.listeners.get('ended')?.();
  }
}

class FakeGainNode extends FakeNode {
  constructor(_context, options = {}) {
    super();
    this.gain = new FakeAudioParam(options.gain);
  }
}

function createPadEngine() {
  const engine = new AudioEngine();
  engine.context = { currentTime: 0 };
  engine.state = sanitizePreset(defaultPreset);
  engine.channels = { pads: { input: new FakeNode() } };
  engine.padChannels = Array.from({ length: PAD_COUNT }, (_, index) => ({
    index,
    input: new FakeNode(),
    tone: { frequency: new FakeAudioParam(14000) },
    panner: { pan: new FakeAudioParam(0) },
    gain: { gain: new FakeAudioParam(1) },
    send: { gain: new FakeAudioParam(0) },
  }));
  for (let index = 0; index < PAD_COUNT; index += 1) {
    engine.padBuffers.set(index, { id: index, duration: 1 });
  }
  return engine;
}

test('pad metadata migrates to twelve safe slots with individual parameters and playback mode', () => {
  const migrated = sanitizePreset({
    version: 6,
    padPan: 0.24,
    padTone: 7600,
    padSend: 0.31,
    pads: [
      {
        name: 'Kick',
        duration: 1.25,
        type: 'audio/wav',
        stored: true,
        mode: 'loop-hold',
        rate: 9,
        gain: -2,
        pan: -0.4,
        tone: 2200,
        send: 0.7,
      },
      { name: 'Snare', duration: -4, stored: true, mode: 'invalid' },
    ],
  });
  assert.equal(PAD_COUNT, 12);
  assert.equal(migrated.version, 8);
  assert.equal(migrated.pads.length, 12);
  assert.deepEqual(migrated.pads[0], {
    name: 'Kick',
    duration: 1.25,
    type: 'audio/wav',
    stored: true,
    mode: 'loop-hold',
    rate: 2,
    gain: 0,
    pan: -0.4,
    tone: 2200,
    send: 0.7,
  });
  assert.equal(migrated.pads[1].duration, 0);
  assert.equal(migrated.pads[1].mode, 'one-shot');
  assert.deepEqual(
    {
      rate: migrated.pads[1].rate,
      gain: migrated.pads[1].gain,
      pan: migrated.pads[1].pan,
      tone: migrated.pads[1].tone,
      send: migrated.pads[1].send,
    },
    { rate: 1, gain: 1, pan: 0.24, tone: 7600, send: 0.31 },
  );
  assert.deepEqual(createEmptyPadMetadata(), {
    name: '',
    duration: 0,
    type: '',
    stored: false,
    mode: 'one-shot',
    rate: 1,
    gain: 1,
    pan: 0,
    tone: 14000,
    send: 0.08,
  });
});

test('pad sample storage keys are collision-free from Sample A and B', () => {
  const keys = Array.from({ length: PAD_COUNT }, (_, index) => padSampleStorageKey(index));
  assert.equal(new Set(keys).size, PAD_COUNT);
  assert.deepEqual(keys, [
    'pad:01', 'pad:02', 'pad:03', 'pad:04', 'pad:05', 'pad:06',
    'pad:07', 'pad:08', 'pad:09', 'pad:10', 'pad:11', 'pad:12',
  ]);
  assert.ok(keys.every((key) => !['A', 'B'].includes(key)));
  assert.throws(() => padSampleStorageKey(-1), /Ugyldig pad/);
  assert.throws(() => padSampleStorageKey(12), /Ugyldig pad/);
});

test('audio engine supports twelve simultaneous pads, isolated retrigger and explicit loop stop', () => {
  const originalSource = globalThis.AudioBufferSourceNode;
  const originalGain = globalThis.GainNode;
  globalThis.AudioBufferSourceNode = FakeSourceNode;
  globalThis.GainNode = FakeGainNode;
  try {
    const engine = createPadEngine();
    const ended = [];
    for (let index = 0; index < PAD_COUNT; index += 1) {
      assert.equal(engine.playPad(index, {
        velocity: index === 0 ? 0.42 : 1,
        mode: index === 1 ? 'loop-hold' : 'one-shot',
        onEnded: (pad) => ended.push(pad),
      }), true);
    }
    assert.equal(engine.getActivePadCount(), 12);
    assert.equal(engine.padSources.get(0).velocityGain.gain.value, 0.42);
    assert.equal(engine.padSources.get(0).source.playbackRate.value, 1);
    assert.equal(engine.padSources.get(1).source.loop, true);

    const firstVoice = engine.padSources.get(0).source;
    engine.playPad(0, { velocity: 0.8, mode: 'one-shot', onEnded: (pad) => ended.push(pad) });
    assert.equal(firstVoice.stopped, true);
    assert.equal(engine.getActivePadCount(), 12);
    firstVoice.emitEnded();
    assert.equal(engine.getActivePadCount(), 12);
    assert.deepEqual(ended, []);

    const retriggered = engine.padSources.get(0).source;
    assert.equal(engine.isPadActive(0), true);
    assert.equal(retriggered.stopped, false);
    retriggered.emitEnded();
    assert.equal(engine.getActivePadCount(), 11);
    assert.deepEqual(ended, [0]);

    const held = engine.padSources.get(1).source;
    assert.equal(engine.isPadActive(1), true);
    engine.stopPad(1);
    assert.equal(held.stopped, true);
    assert.equal(engine.getActivePadCount(), 10);

    engine.stopAllPads();
    assert.equal(engine.getActivePadCount(), 0);
  } finally {
    globalThis.AudioBufferSourceNode = originalSource;
    globalThis.GainNode = originalGain;
  }
});

test('active pad voices keep independent rate, volume, pan, tone and delay send', () => {
  const originalSource = globalThis.AudioBufferSourceNode;
  const originalGain = globalThis.GainNode;
  globalThis.AudioBufferSourceNode = FakeSourceNode;
  globalThis.GainNode = FakeGainNode;
  try {
    const engine = createPadEngine();
    Object.assign(engine.state.pads[0], {
      rate: 1.6,
      gain: 0.72,
      pan: -0.45,
      tone: 3400,
      send: 0.65,
    });
    Object.assign(engine.state.pads[1], {
      rate: 0.75,
      gain: 0.36,
      pan: 0.6,
      tone: 9200,
      send: 0.18,
    });
    engine.state.padGain = 0.8;

    engine.applyPadChannelState(0, { padsOn: true, delayOn: true, now: 0 });
    engine.applyPadChannelState(1, { padsOn: true, delayOn: true, now: 0 });
    assert.deepEqual(
      [
        engine.padChannels[0].gain.gain.value,
        engine.padChannels[0].panner.pan.value,
        engine.padChannels[0].tone.frequency.value,
        engine.padChannels[0].send.gain.value,
      ],
      [0.72, -0.45, 3400, 0.52],
    );
    assert.deepEqual(
      [
        engine.padChannels[1].gain.gain.value,
        engine.padChannels[1].panner.pan.value,
        engine.padChannels[1].tone.frequency.value,
      ],
      [0.36, 0.6, 9200],
    );
    assert.ok(Math.abs(engine.padChannels[1].send.gain.value - 0.144) < 0.000001);

    assert.equal(engine.playPad(0, { velocity: 0.5, mode: 'loop-hold' }), true);
    assert.equal(engine.padSources.get(0).velocityGain.gain.value, 0.5);
    assert.equal(engine.padSources.get(0).source.playbackRate.value, 1.6);
    engine.state.pads[0].rate = 0.9;
    engine.state.pads[0].pan = 0.1;
    const untouchedPadOnePan = engine.padChannels[1].panner.pan.value;
    engine.updateParameters(['pad.0.rate', 'pad.0.pan'], engine.state);
    assert.equal(engine.padSources.get(0).source.playbackRate.value, 0.9);
    assert.equal(engine.padChannels[0].panner.pan.value, 0.1);
    assert.equal(engine.padChannels[1].panner.pan.value, untouchedPadOnePan);
    assert.equal(engine.isPadActive(0), true);

    engine.applyPadChannelState(0, { padsOn: false, delayOn: true, now: 0.2 });
    assert.equal(engine.padChannels[0].send.gain.value, 0);
    engine.applyPadChannelState(0, { padsOn: true, delayOn: false, now: 0.3 });
    assert.equal(engine.padChannels[0].send.gain.value, 0);
  } finally {
    globalThis.AudioBufferSourceNode = originalSource;
    globalThis.GainNode = originalGain;
  }
});

test('pad loading commits decoded audio only after durable storage succeeds', async () => {
  const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
  const body = app.match(/async function loadPadBlob\([\s\S]*?\n\}/)?.[0] || '';
  const decodeAt = body.indexOf('await engine.decodePadBlob');
  const storeAt = body.indexOf('await putPadSample');
  const commitAt = body.indexOf('engine.commitPadBuffer');
  assert.ok(decodeAt >= 0 && storeAt > decodeAt && commitAt > storeAt);
  assert.match(app, /Lyd mangler på denne enheten/);
  assert.match(app, /await hydratePadSamples\(\)/);
});

test('Pad Sampler exposes accessible 4×3 touch UI, libraries and a shared mixer channel', async () => {
  const [html, app, css, engine] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../assets/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../assets/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../assets/audio-engine.js', import.meta.url), 'utf8'),
  ]);
  for (const id of [
    'padGrid', 'padSamplerStatus', 'selectedPadHeading', 'selectedPadName', 'padMode',
    'padFile', 'padProjectLibrary', 'padRecordingLibrary', 'padRemove', 'padMute',
    'padSolo', 'padMeter', 'padParameterControls', 'padSamplerControls', 'padMixerMeter',
  ]) assert.match(html, new RegExp(`id="${id}"`));
  assert.match(app, /Array\.from\(\{ length: PAD_COUNT \}/);
  assert.match(app, /button\.setAttribute\('aria-label'/);
  assert.match(html, />Loop \(av\/på\)</);
  assert.doesNotMatch(html, />Loop \/ hold</);
  assert.match(app, /button\.setAttribute\('aria-pressed', String\(activePadUi\.has\(index\)\)\)/);
  assert.match(app, /button\.setAttribute\('aria-current', 'true'\)/);
  assert.match(app, /createPadActivationController\(\{/);
  assert.match(app, /await activatePad\(index, velocity\)/);
  assert.match(app, /void activatePad\(index, 1\)/);
  assert.doesNotMatch(app, /releasePadIfUnheld|engine\.releasePad/);
  const midiRelease = app.match(/if \(phase === 'end'\) \{[\s\S]*?\n  \}/)?.[0] || '';
  assert.doesNotMatch(midiRelease, /stopPad|releasePad|activatePad/);
  assert.match(app, /if \(state\.pads\[selectedPadIndex\]\.mode === 'loop-hold' && mode === 'one-shot'\) \{\s*stopPadPlayback\(selectedPadIndex\)/);
  assert.match(app, /if \(id === 'padSampler'\) stopAllPadPlayback\(\)/);
  assert.match(app, /cancelAllPadActivations\(\)/);
  assert.match(app, /velocity = message\?\.type === 'note' \? message\.velocity : 1/);
  assert.match(app, /openRecorder\(\s*event\.currentTarget,\s*padTarget\(selectedPadIndex\)/);
  assert.match(app, /openSampleLibrary\(\s*padTarget\(selectedPadIndex\)/);
  assert.match(app, /PAD_PARAMETER_DEFINITIONS\.map/);
  assert.match(app, /createPadParameterKey\(selectedPadIndex, definition\.key\)/);
  assert.match(app, /setStateParameterValue\(key, Number\(value\)\)/);
  assert.match(css, /\.pad-grid \{[^}]*grid-template-columns: repeat\(4, minmax\(44px, 1fr\)\)/);
  assert.match(css, /\.sample-pad \{[\s\S]*?min-height: 76px/);
  assert.match(css, /\.sample-pad\.missing/);
  assert.match(css, /\.pad-parameter-controls \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(engine, /this\.padChannels = Array\.from\(\{ length: PAD_COUNT \}/);
  assert.match(engine, /pad\.send \* this\.state\.padGain/);
  assert.doesNotMatch(engine, /state\.pad(?:Pan|Tone|Send)/);
});
