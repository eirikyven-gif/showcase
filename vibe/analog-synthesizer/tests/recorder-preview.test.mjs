import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { AudioEngine, setNavigatorAudioSessionType } from '../assets/audio-engine.js';

function installAudioSession() {
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const changes = [];
  const audioSession = {
    current: 'auto',
    get type() { return this.current; },
    set type(value) {
      this.current = value;
      changes.push(value);
    },
  };
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { audioSession },
  });
  return {
    audioSession,
    changes,
    restore() {
      if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
      else delete globalThis.navigator;
    },
  };
}

function installBufferSource() {
  const OriginalSource = globalThis.AudioBufferSourceNode;
  const sources = [];
  class FakeBufferSource {
    constructor(context, { buffer }) {
      this.context = context;
      this.buffer = buffer;
      this.listeners = new Map();
      sources.push(this);
    }

    connect(target) { this.target = target; }
    start(when, offset, duration) { this.startArgs = { when, offset, duration }; }
    stop() { this.stopped = true; }
    disconnect() { this.disconnected = true; }
    addEventListener(type, listener) { this.listeners.set(type, listener); }
  }
  globalThis.AudioBufferSourceNode = FakeBufferSource;
  return {
    sources,
    restore() {
      if (OriginalSource === undefined) delete globalThis.AudioBufferSourceNode;
      else globalThis.AudioBufferSourceNode = OriginalSource;
    },
  };
}

test('audio-session switching is feature-detected and never required on other browsers', () => {
  assert.equal(setNavigatorAudioSessionType('playback', {}), false);
  const session = { type: 'auto' };
  assert.equal(setNavigatorAudioSessionType('play-and-record', { audioSession: session }), true);
  assert.equal(session.type, 'play-and-record');
  assert.throws(() => setNavigatorAudioSessionType('invalid', { audioSession: session }), /Ugyldig lydøkt/);
  const protectedSession = {};
  Object.defineProperty(protectedSession, 'type', { get: () => 'auto', set: () => { throw new Error('blocked'); } });
  assert.equal(setNavigatorAudioSessionType('playback', { audioSession: protectedSession }), false);
});

test('recording preview restores playback, resumes context and confirms the started range', async () => {
  const session = installAudioSession();
  const sourceFixture = installBufferSource();
  const engine = new AudioEngine();
  const context = {
    state: 'suspended',
    resumeCalls: 0,
    async resume() {
      this.resumeCalls += 1;
      this.state = 'running';
    },
  };
  engine.context = context;
  engine.masterInput = { name: 'protected-master-route' };
  const buffer = { duration: 4, sampleRate: 48000 };

  try {
    const first = await engine.playRecordingRange(buffer, 1, 2.5);
    assert.deepEqual(first, { started: true, start: 1, end: 2.5, duration: 1.5 });
    assert.equal(context.resumeCalls, 1);
    assert.equal(session.audioSession.type, 'playback');
    assert.deepEqual(sourceFixture.sources[0].startArgs, { when: 0, offset: 1, duration: 1.5 });
    assert.equal(sourceFixture.sources[0].target, engine.masterInput);

    const second = await engine.playRecordingRange(buffer, 0, 4);
    assert.equal(second.started, true);
    assert.equal(sourceFixture.sources[0].stopped, true);
    assert.equal(sourceFixture.sources.length, 2);

    sourceFixture.sources[1].listeners.get('ended')();
    assert.equal(sourceFixture.sources[1].disconnected, true);
    assert.equal(engine.supportPreviewSource, null);

    const third = await engine.playRecordingRange(buffer, 0.5, 1);
    assert.equal(third.started, true);
    engine.stopSupportPreview();
    assert.equal(sourceFixture.sources[2].stopped, true);
    assert.equal(engine.supportPreviewSource, null);
  } finally {
    engine.stopSupportPreview();
    sourceFixture.restore();
    session.restore();
  }
});

test('pending or interrupted preview cannot create a false playing state', async () => {
  const session = installAudioSession();
  const sourceFixture = installBufferSource();
  const engine = new AudioEngine();
  let releaseResume;
  engine.context = {
    state: 'suspended',
    resume: () => new Promise((resolve) => { releaseResume = () => { engine.context.state = 'running'; resolve(); }; }),
  };
  engine.masterInput = {};
  const buffer = { duration: 1, sampleRate: 48000 };

  try {
    const pending = engine.playRecordingRange(buffer, 0, 1);
    await Promise.resolve();
    engine.stopSupportPreview();
    releaseResume();
    assert.deepEqual(await pending, { started: false, reason: 'cancelled' });
    assert.equal(sourceFixture.sources.length, 0);

    engine.context = { state: 'interrupted', resume: async () => {} };
    await assert.rejects(
      engine.playRecordingRange(buffer, 0, 1),
      /fortsatt satt på pause/,
    );
    engine.context = { state: 'suspended', resume: async () => { throw new Error('blocked'); } };
    await assert.rejects(
      engine.playRecordingRange(buffer, 0, 1),
      /kunne ikke gjenopptas/,
    );
    await assert.rejects(
      engine.playRecordingRange(null, 0, 1),
      /mangler gyldige lyddata/,
    );
    assert.equal(sourceFixture.sources.length, 0);
  } finally {
    engine.stopSupportPreview();
    sourceFixture.restore();
    session.restore();
  }
});

test('recorder UI only announces playback after confirmed source start', async () => {
  const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
  const body = app.slice(
    app.indexOf('async function previewRecorderSelection'),
    app.indexOf('function stopRecorderSelection'),
  );
  assert.match(body, /await engine\.playRecordingRange/);
  assert.match(body, /if \(!playback\.started\) return/);
  assert.match(body, /Spiller valgt område/);
  assert.match(body, /Kunne ikke spille valgt område/);
});
