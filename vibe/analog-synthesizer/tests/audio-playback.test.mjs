import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { AudioEngine } from '../assets/audio-engine.js';
import {
  createAudioPlaybackController,
  resolveAudioPlaybackView,
} from '../assets/audio-playback-controller.js';

class FakeAudioContext extends EventTarget {
  constructor() {
    super();
    this.state = 'suspended';
    this.sampleRate = 48000;
    this.currentTime = 12;
    this.failSuspend = false;
  }

  async resume() {
    this.state = 'running';
    this.dispatchEvent(new Event('statechange'));
  }

  async suspend() {
    if (this.failSuspend) throw new Error('Suspend feilet');
    this.state = 'suspended';
    this.dispatchEvent(new Event('statechange'));
  }
}

class FakeAudioEngine {
  constructor() {
    this.context = null;
    this.startCalls = 0;
    this.suspendCalls = 0;
    this.receivedState = null;
    this.pendingResume = false;
    this.captureCalls = 0;
    this.restoreCalls = 0;
  }

  async start(state) {
    this.startCalls += 1;
    this.receivedState = state;
    if (!this.context) this.context = new FakeAudioContext();
    await this.context.resume();
    await this.restorePlaybackAfterResume();
  }

  async suspend() {
    this.suspendCalls += 1;
    this.capturePlaybackResumeSnapshot();
    await this.context?.suspend();
  }

  capturePlaybackResumeSnapshot() {
    this.captureCalls += 1;
    this.pendingResume = true;
  }

  hasPendingPlaybackResume() {
    return this.pendingResume;
  }

  async restorePlaybackAfterResume() {
    if (!this.pendingResume) return;
    this.restoreCalls += 1;
    this.pendingResume = false;
  }
}

test('playback view distinguishes initial, running, stopped and interrupted audio truthfully', () => {
  const initial = resolveAudioPlaybackView();
  assert.equal(initial.state, 'initial');
  assert.equal(initial.startLabel, 'Start lyd');
  assert.equal(initial.stopDisabled, true);
  assert.match(initial.waveformStatus, /flat linje/);

  const running = resolveAudioPlaybackView({ contextState: 'running', sampleRate: 48000 });
  assert.equal(running.running, true);
  assert.equal(running.topStatus, 'Lyd på · 48 kHz');
  assert.equal(running.stopDisabled, false);
  assert.equal(running.waveformLive, true);

  const suspended = resolveAudioPlaybackView({ contextState: 'suspended' });
  assert.equal(suspended.startLabel, 'Gjenoppta');
  assert.equal(suspended.playerTitle, 'Stoppet');
  assert.equal(suspended.waveformLive, false);

  const interrupted = resolveAudioPlaybackView({ contextState: 'interrupted' });
  assert.equal(interrupted.state, 'interrupted');
  assert.match(interrupted.playerCopy, /Gjenoppta/);
});

test('rapid start, stop and resume operations serialize on one AudioContext', async () => {
  const engine = new FakeAudioEngine();
  const session = { name: 'Bevart prosjekt', sequenceSteps: 16 };
  const views = [];
  let pauses = 0;
  let resumes = 0;
  const controller = createAudioPlaybackController({
    engine,
    getState: () => session,
    onPause: () => { pauses += 1; },
    onResume: () => { resumes += 1; },
    onChange: (view) => views.push(view),
  });

  const operations = await Promise.all([controller.start(), controller.stop(), controller.start()]);
  assert.deepEqual(operations, [true, true, true]);
  assert.equal(engine.context.state, 'running');
  assert.equal(engine.startCalls, 2);
  assert.equal(engine.suspendCalls, 1);
  assert.equal(engine.receivedState, session);
  assert.equal(session.name, 'Bevart prosjekt');
  assert.ok(pauses >= 1);
  assert.ok(resumes >= 2);
  assert.equal(views.at(-1).state, 'running');
});

test('failed stop restores running controls and can be retried', async () => {
  const engine = new FakeAudioEngine();
  const errors = [];
  const views = [];
  const controller = createAudioPlaybackController({
    engine,
    getState: () => ({}),
    onChange: (view) => views.push(view),
    onError: (error) => errors.push(error.message),
  });

  assert.equal(await controller.start(), true);
  engine.context.failSuspend = true;
  assert.equal(await controller.stop(), false);
  assert.equal(engine.context.state, 'running');
  assert.equal(views.at(-1).state, 'error');
  assert.equal(views.at(-1).stopDisabled, false);
  assert.deepEqual(errors, ['Suspend feilet']);

  engine.context.failSuspend = false;
  assert.equal(await controller.stop(), true);
  assert.equal(engine.context.state, 'suspended');
  assert.equal(views.at(-1).state, 'suspended');
});

test('external AudioContext interruption pauses and resumes the shared lifecycle', async () => {
  const engine = new FakeAudioEngine();
  const views = [];
  let pauses = 0;
  let resumes = 0;
  const controller = createAudioPlaybackController({
    engine,
    getState: () => ({}),
    onPause: () => { pauses += 1; },
    onResume: () => { resumes += 1; },
    onChange: (view) => views.push(view),
  });
  await controller.start();

  engine.context.state = 'interrupted';
  engine.context.dispatchEvent(new Event('statechange'));
  assert.equal(views.at(-1).state, 'interrupted');
  assert.equal(pauses, 1);

  engine.context.state = 'running';
  engine.context.dispatchEvent(new Event('statechange'));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(views.at(-1).state, 'running');
  assert.equal(engine.captureCalls, 1);
  assert.equal(engine.restoreCalls, 1);
  assert.ok(resumes >= 2);
});

test('AudioEngine suspend keeps context and project audio state intact', async () => {
  const engine = new AudioEngine();
  const context = {
    state: 'running',
    currentTime: 7,
    async suspend() { this.state = 'suspended'; },
  };
  const state = { name: 'Bevart', noiseDrone: false };
  const sample = {};
  const pad = {};
  engine.context = context;
  engine.state = state;
  engine.sampleBuffers.set('A', sample);
  engine.padBuffers.set(0, pad);
  engine.sampleHoldTimer = globalThis.setInterval(() => {}, 10000);

  await engine.suspend();

  assert.equal(engine.context, context);
  assert.equal(engine.context.state, 'suspended');
  assert.equal(engine.state, state);
  assert.equal(engine.sampleBuffers.get('A'), sample);
  assert.equal(engine.padBuffers.get(0), pad);
  assert.equal(engine.sampleHoldTimer, 0);
});

test('sequencer cancellation removes only queued sequence voices and future envelopes', () => {
  const engine = new AudioEngine();
  const stopped = [];
  const oscillator = { stop: (time) => stopped.push(time) };
  const kick = { stop: (time) => stopped.push(time) };
  const automation = {
    value: 0.5,
    heldAt: null,
    targets: [],
    cancelAndHoldAtTime(time) { this.heldAt = time; },
    setTargetAtTime(value, time) { this.targets.push({ value, time }); },
  };
  const sample = {};
  const pad = {};
  engine.context = { currentTime: 9 };
  engine.state = { noiseDrone: false };
  engine.vca = { gain: { ...automation } };
  engine.noiseVca = { gain: { ...automation } };
  engine.sequencerVoices.add(oscillator);
  engine.sequencerKickVoices.add(kick);
  engine.sampleSources.set('A', sample);
  engine.padSources.set(0, pad);

  engine.cancelSequencerSchedule();

  assert.deepEqual(stopped, [9.005, 9.005]);
  assert.equal(engine.sequencerVoices.size, 0);
  assert.equal(engine.sequencerKickVoices.size, 0);
  assert.equal(engine.sampleSources.get('A'), sample);
  assert.equal(engine.padSources.get(0), pad);
  assert.equal(engine.vca.gain.heldAt, 9);
  assert.equal(engine.noiseVca.gain.heldAt, 9);
});

test('global audio stop pauses Sequencer scheduling without clearing its run intent', async () => {
  const app = await readFile(new URL('../assets/app.js', import.meta.url), 'utf8');
  const pause = app.match(/function pauseSequencerForAudioLifecycle\(\) \{([\s\S]*?)\n\}\n\nfunction resumeSequencerForAudioLifecycle/)?.[1] || '';
  const resume = app.match(/function resumeSequencerForAudioLifecycle\(\) \{([\s\S]*?)\n\}\n\nfunction scheduleSequence/)?.[1] || '';
  const scheduler = app.match(/function scheduleSequence\(\) \{([\s\S]*?)\n\}\n\nfunction highlightStep/)?.[1] || '';

  assert.match(pause, /sequencePausedForAudio = true/);
  assert.match(pause, /engine\.cancelSequencerSchedule\(\)/);
  assert.match(pause, /pendingVisualSteps\.length = 0/);
  assert.doesNotMatch(pause, /sequenceRunning = false|currentStep = 0/);
  assert.match(resume, /nextStepTime = engine\.context\.currentTime \+ 0\.05/);
  assert.match(resume, /window\.setInterval\(scheduleSequence, SEQUENCER_TICK_MS\)/);
  assert.doesNotMatch(resume, /currentStep = 0/);
  assert.match(scheduler, /sequencePausedForAudio/);
  assert.match(scheduler, /engine\.context\?\.state !== 'running'/);
});
