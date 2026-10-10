import assert from 'node:assert/strict';
import test from 'node:test';
import { AudioEngine } from '../assets/audio-engine.js';
import { resolveSequencerResumeStep } from '../assets/audio-playback-controller.js';
import { PAD_COUNT, defaultPreset, sanitizePreset } from '../assets/state.js';

class FakeNode extends EventTarget {
  connect(target) {
    if (!this.targets) this.targets = [];
    this.targets.push(target);
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

class FakeBufferSource extends FakeNode {
  static instances = [];
  static startCount = 0;
  static failAtStart = 0;

  constructor(context, options = {}) {
    super();
    this.context = context;
    this.buffer = options.buffer;
    this.playbackRate = new FakeAudioParam(options.playbackRate ?? 1);
    this.loop = false;
    this.started = false;
    this.stopped = false;
    this.startArguments = [];
    FakeBufferSource.instances.push(this);
  }

  start(...args) {
    FakeBufferSource.startCount += 1;
    if (FakeBufferSource.startCount === FakeBufferSource.failAtStart) throw new Error('Kildestart feilet');
    this.started = true;
    this.startArguments = args;
  }

  stop() {
    this.stopped = true;
  }

  emitEnded() {
    this.dispatchEvent(new Event('ended'));
  }
}

class FakeGainNode extends FakeNode {
  constructor(_context, options = {}) {
    super();
    this.gain = new FakeAudioParam(options.gain);
  }
}

class FakeAudioContext extends EventTarget {
  constructor() {
    super();
    this.state = 'running';
    this.currentTime = 2;
    this.sampleRate = 48000;
    this.failResume = false;
    this.failSuspend = false;
    this.onSuspend = null;
  }

  async suspend() {
    if (this.failSuspend) throw new Error('Suspend feilet');
    this.state = 'suspended';
    this.onSuspend?.();
    this.dispatchEvent(new Event('statechange'));
  }

  async resume() {
    if (this.failResume) throw new Error('Resume feilet');
    this.state = 'running';
    this.dispatchEvent(new Event('statechange'));
  }
}

function fakeBuffer(duration = 10) {
  return {
    duration,
    length: duration * 48000,
    sampleRate: 48000,
    numberOfChannels: 1,
  };
}

function createResumeEngine() {
  const engine = new AudioEngine();
  engine.context = new FakeAudioContext();
  engine.state = sanitizePreset({
    ...defaultPreset,
    sampleAStart: 0.1,
    sampleAEnd: 0.9,
    sampleARate: 1,
    sampleALoop: false,
    sampleBStart: 0.2,
    sampleBEnd: 0.8,
    sampleBRate: 1.5,
    sampleBLoop: true,
    sampleBReverse: true,
    pads: defaultPreset.pads.map((pad, index) => ({
      ...pad,
      stored: true,
      duration: 10,
      rate: index === 0 ? 0.5 : 1,
      mode: index === 1 ? 'loop-hold' : 'one-shot',
    })),
  });
  engine.channels = {
    A: { input: new FakeNode() },
    B: { input: new FakeNode() },
    pads: { input: new FakeNode() },
  };
  engine.padChannels = Array.from({ length: PAD_COUNT }, (_, index) => ({
    index,
    input: new FakeNode(),
  }));
  engine.sampleBuffers.set('A', fakeBuffer());
  engine.sampleBuffers.set('B', fakeBuffer());
  engine.reversedBuffers.set('B', fakeBuffer());
  engine.padBuffers.set(0, fakeBuffer());
  engine.padBuffers.set(1, fakeBuffer());
  engine.applyState = function applyState(nextState) {
    this.state = nextState;
  };
  engine.restartSampleHold = () => {};
  engine.pauseSampleHold = () => {};
  return engine;
}

function withFakeAudioNodes(run) {
  const OriginalSource = globalThis.AudioBufferSourceNode;
  const OriginalGain = globalThis.GainNode;
  globalThis.AudioBufferSourceNode = FakeBufferSource;
  globalThis.GainNode = FakeGainNode;
  FakeBufferSource.instances = [];
  FakeBufferSource.startCount = 0;
  FakeBufferSource.failAtStart = 0;
  return Promise.resolve()
    .then(run)
    .finally(() => {
      if (OriginalSource === undefined) delete globalThis.AudioBufferSourceNode;
      else globalThis.AudioBufferSourceNode = OriginalSource;
      if (OriginalGain === undefined) delete globalThis.GainNode;
      else globalThis.GainNode = OriginalGain;
    });
}

test('resume restores only source nodes lost by the browser and keeps their paused positions', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    const endedPads = [];
    assert.equal(engine.playSample('A'), true);
    assert.equal(engine.playSample('B'), true);
    assert.equal(engine.playPad(0, { velocity: 0.42, mode: 'one-shot', onEnded: (index) => endedPads.push(index) }), true);
    assert.equal(engine.playPad(1, { velocity: 0.8, mode: 'loop-hold', onEnded: (index) => endedPads.push(index) }), true);

    const context = engine.context;
    const sampleA = engine.sampleSources.get('A');
    const sampleB = engine.sampleSources.get('B');
    const pad0 = engine.padSources.get(0);
    const pad1 = engine.padSources.get(1);
    context.currentTime = 5;
    context.onSuspend = () => {
      sampleA.emitEnded();
      pad0.source.emitEnded();
    };

    await engine.suspend();
    assert.equal(engine.sampleSources.has('A'), false);
    assert.equal(engine.padSources.has(0), false);
    assert.equal(engine.sampleSources.get('B'), sampleB);
    assert.equal(engine.padSources.get(1), pad1);

    await engine.start(engine.state);

    assert.equal(engine.context, context);
    assert.equal(engine.sampleSources.size, 2);
    assert.equal(engine.padSources.size, 2);
    assert.equal(engine.sampleSources.get('B'), sampleB);
    assert.equal(engine.padSources.get(1), pad1);
    assert.notEqual(engine.sampleSources.get('A'), sampleA);
    assert.notEqual(engine.padSources.get(0), pad0);
    assert.deepEqual(engine.sampleSources.get('A').startArguments, [0, 4, 5]);
    assert.deepEqual(engine.padSources.get(0).source.startArguments, [0, 1.5, 8.5]);
    assert.equal(engine.padSources.get(0).velocityGain.gain.value, 0.42);
    engine.padSources.get(0).source.emitEnded();
    assert.deepEqual(endedPads, [0]);
  });
});

test('explicit source stops while suspended override the older resume snapshot', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('A');
    engine.playPad(0, { velocity: 1, mode: 'one-shot' });
    await engine.suspend();

    engine.stopSample('A');
    engine.stopPad(0);
    await engine.start(engine.state);

    assert.equal(engine.sampleSources.has('A'), false);
    assert.equal(engine.padSources.has(0), false);
  });
});

test('reverse loop resumes at the matching phase and playback rate', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('B');
    const original = engine.sampleSources.get('B');
    engine.context.currentTime = 5;
    engine.context.onSuspend = () => original.emitEnded();

    await engine.suspend();
    await engine.start(engine.state);

    const resumed = engine.sampleSources.get('B');
    assert.notEqual(resumed, original);
    assert.equal(resumed.loop, true);
    assert.equal(resumed.loopStart, 2);
    assert.equal(resumed.loopEnd, 8);
    assert.equal(resumed.playbackRate.value, 1.5);
    assert.deepEqual(resumed.startArguments, [0, 6.5]);
    assert.equal(engine.getSamplePlaybackState('B', 6).positionSeconds, 8);
  });
});

test('a held synth voice is restored once, while note-off during suspend cancels it', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    const created = [];
    const envelopes = [];
    const createVoice = (note) => {
      const oscillator = new FakeNode();
      oscillator.note = note;
      oscillator.stopped = false;
      oscillator.stop = () => { oscillator.stopped = true; };
      engine.voices.add(oscillator);
      created.push(oscillator);
      return oscillator;
    };
    engine.createOscillator = (note) => createVoice(note);
    engine.openEnvelope = (_time, velocity) => envelopes.push(velocity);
    engine.closeEnvelope = () => {};
    const original = createVoice(64);
    engine.liveVoice = { oscillator: original, note: 64, velocity: 0.73 };
    engine.context.onSuspend = () => {
      engine.voices.delete(engine.liveVoice?.oscillator);
      engine.liveVoice = null;
    };

    await engine.suspend();
    await engine.start(engine.state);
    assert.equal(engine.liveVoice.note, 64);
    assert.equal(engine.liveVoice.velocity, 0.73);
    assert.notEqual(engine.liveVoice.oscillator, original);
    assert.deepEqual(envelopes, [0.73]);

    await engine.suspend();
    engine.noteOff(64);
    await engine.start(engine.state);
    assert.equal(engine.liveVoice, null);
    assert.equal(created.length, 2);
  });
});

test('microphone stream, monitor intent and noise drone state survive without new permission', async () => {
  const engine = createResumeEngine();
  const stream = {
    getAudioTracks: () => [{ readyState: 'live' }],
  };
  const micSource = {};
  engine.micStream = stream;
  engine.micSource = micSource;
  engine.micConsumers.add('module');
  engine.state.micMonitoring = true;
  engine.state.noiseDrone = true;
  let appliedState = null;
  engine.applyState = function applyState(nextState) {
    this.state = nextState;
    appliedState = nextState;
  };

  await engine.suspend();
  await engine.start(engine.state);

  assert.equal(engine.micStream, stream);
  assert.equal(engine.micSource, micSource);
  assert.deepEqual([...engine.micConsumers], ['module']);
  assert.equal(engine.state.micMonitoring, true);
  assert.equal(appliedState.noiseDrone, true);
});

test('source loss during an external interruption snapshots intent before registry cleanup', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('A');
    engine.playPad(0, { velocity: 0.6, mode: 'one-shot' });
    const sample = engine.sampleSources.get('A');
    const pad = engine.padSources.get(0);

    engine.context.currentTime = 4;
    engine.context.state = 'interrupted';
    sample.emitEnded();
    pad.source.emitEnded();

    assert.equal(engine.sampleSources.size, 0);
    assert.equal(engine.padSources.size, 0);
    assert.equal(engine.hasPendingPlaybackResume(), true);

    await engine.start(engine.state);

    assert.equal(engine.sampleSources.size, 1);
    assert.equal(engine.padSources.size, 1);
    assert.deepEqual(engine.sampleSources.get('A').startArguments, [0, 3, 6]);
    assert.deepEqual(engine.padSources.get(0).source.startArguments, [0, 1, 9]);
  });
});

test('parameter changes made while stopped override stale sample and pad settings', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('B');
    engine.playPad(1, { velocity: 0.7, mode: 'loop-hold' });
    const sample = engine.sampleSources.get('B');
    const pad = engine.padSources.get(1);
    engine.context.currentTime = 5;
    engine.context.onSuspend = () => {
      sample.emitEnded();
      pad.source.emitEnded();
    };

    await engine.suspend();
    Object.assign(engine.state, {
      sampleBStart: 0.3,
      sampleBEnd: 0.7,
      sampleBRate: 0.75,
      sampleBReverse: false,
      sampleBLoop: false,
    });
    engine.state.pads[1].rate = 1.8;

    await engine.start(engine.state);

    const resumedSample = engine.sampleSources.get('B');
    const resumedPad = engine.padSources.get(1);
    assert.equal(resumedSample.loop, false);
    assert.equal(resumedSample.playbackRate.value, 0.75);
    assert.deepEqual(resumedSample.startArguments, [0, 3.5, 3.5]);
    assert.equal(resumedPad.source.loop, true);
    assert.equal(resumedPad.source.playbackRate.value, 1.8);
    assert.deepEqual(resumedPad.source.startArguments, [0, 3]);
  });
});

test('failed suspend does not leave a false resume snapshot', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('A');
    engine.context.failSuspend = true;

    await assert.rejects(engine.suspend(), /Suspend feilet/);

    assert.equal(engine.context.state, 'running');
    assert.equal(engine.hasPendingPlaybackResume(), false);
    assert.equal(engine.sampleSources.size, 1);
  });
});

test('failed resume preserves one retryable snapshot without creating duplicate sources', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('A');
    const original = engine.sampleSources.get('A');
    engine.context.onSuspend = () => original.emitEnded();
    await engine.suspend();
    engine.context.failResume = true;

    await assert.rejects(engine.start(engine.state), /Resume feilet/);
    assert.equal(engine.sampleSources.has('A'), false);
    assert.equal(engine.hasPendingPlaybackResume(), true);

    engine.context.failResume = false;
    await engine.start(engine.state);
    assert.equal(engine.sampleSources.size, 1);
    assert.equal(engine.hasPendingPlaybackResume(), false);
  });
});

test('partial source restoration rolls back before a clean retry', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('A');
    engine.playSample('B');
    const sampleA = engine.sampleSources.get('A');
    const sampleB = engine.sampleSources.get('B');
    engine.context.onSuspend = () => {
      sampleA.emitEnded();
      sampleB.emitEnded();
    };
    await engine.suspend();
    FakeBufferSource.failAtStart = FakeBufferSource.startCount + 2;

    await assert.rejects(engine.start(engine.state), /Kildestart feilet/);

    assert.equal(engine.context.state, 'suspended');
    assert.equal(engine.sampleSources.size, 0);
    assert.equal(engine.hasPendingPlaybackResume(), true);

    FakeBufferSource.failAtStart = 0;
    await engine.start(engine.state);
    assert.equal(engine.sampleSources.size, 2);
    assert.equal(engine.hasPendingPlaybackResume(), false);
  });
});

test('three stop and resume cycles keep surviving sources and registries stable', async () => {
  await withFakeAudioNodes(async () => {
    const engine = createResumeEngine();
    engine.playSample('B');
    engine.playPad(1, { velocity: 0.7, mode: 'loop-hold' });
    const sample = engine.sampleSources.get('B');
    const pad = engine.padSources.get(1);
    const sourceCount = FakeBufferSource.instances.length;

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await engine.suspend();
      await engine.start(engine.state);
    }

    assert.equal(engine.sampleSources.get('B'), sample);
    assert.equal(engine.padSources.get(1), pad);
    assert.equal(engine.sampleSources.size, 1);
    assert.equal(engine.padSources.size, 1);
    assert.equal(FakeBufferSource.instances.length, sourceCount);
  });
});

test('sequencer resumes from the earliest cancelled lookahead step', () => {
  const pending = [
    { step: 7, synthStep: 7, time: 12.08 },
    { step: 8, synthStep: 0, time: 12.2 },
  ];
  assert.equal(resolveSequencerResumeStep(pending, 9, 12), 7);
  assert.equal(resolveSequencerResumeStep([], 9, 12), 9);
  assert.equal(resolveSequencerResumeStep([{ synthStep: 3, time: 12.1 }], 9, 12), 9);
});
