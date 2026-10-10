import {
  PAD_COUNT,
  isModuleEnabled,
  midiNoteToFrequency,
  parsePadParameterKey,
} from './state.js?build=2026-10-10.1';
import { AudioPatchRouter, isSourceAudible } from './patch-router.js?build=2026-10-10.1';

const EPSILON = 0.0001;
const AUDIO_SESSION_TYPES = new Set(['playback', 'play-and-record']);
const PAUSED_CONTEXT_STATES = new Set(['suspended', 'interrupted']);

export function setNavigatorAudioSessionType(type, navigatorApi = globalThis.navigator) {
  if (!AUDIO_SESSION_TYPES.has(type)) throw new Error('Ugyldig lydøkt.');
  const session = navigatorApi?.audioSession;
  if (!session || !('type' in session)) return false;
  try {
    session.type = type;
    return session.type === type;
  } catch (_error) {
    return false;
  }
}

export function normalizeSampleSelection(duration, startSeconds, endSeconds, minimumSeconds = 0.001) {
  const safeDuration = Math.max(0, Number(duration) || 0);
  if (safeDuration === 0) return { start: 0, end: 0 };
  const minimum = Math.min(safeDuration, Math.max(Number(minimumSeconds) || 0, Number.EPSILON));
  const start = Math.max(0, Math.min(safeDuration - minimum, Number(startSeconds) || 0));
  const requestedEnd = Number.isFinite(Number(endSeconds)) ? Number(endSeconds) : safeDuration;
  const end = Math.min(safeDuration, Math.max(start + minimum, requestedEnd));
  return { start, end };
}

export function selectionToFrameRange(audioBuffer, startSeconds, endSeconds) {
  if (!audioBuffer?.length || !audioBuffer?.sampleRate) throw new Error('Lydklippet mangler gyldige sampledata.');
  const minimum = 1 / audioBuffer.sampleRate;
  const selection = normalizeSampleSelection(audioBuffer.duration, startSeconds, endSeconds, minimum);
  const firstFrame = Math.max(0, Math.min(audioBuffer.length - 1, Math.floor(selection.start * audioBuffer.sampleRate)));
  const lastFrame = Math.max(firstFrame + 1, Math.min(audioBuffer.length, Math.ceil(selection.end * audioBuffer.sampleRate)));
  return { ...selection, firstFrame, lastFrame, length: lastFrame - firstFrame };
}

export function calculateSamplePlayback(playback, contextTime) {
  if (!playback) return null;
  const start = Math.max(0, Number(playback.startSeconds) || 0);
  const end = Math.max(start, Number(playback.endSeconds) || 0);
  const duration = end - start;
  const bufferDuration = Math.max(end, Number(playback.bufferDuration) || 0);
  const playbackRate = Math.max(EPSILON, Number(playback.playbackRate) || 1);
  if (!duration || !bufferDuration) return null;
  const sourceElapsed = Math.max(0, (Number(contextTime) - Number(playback.startedAt)) * playbackRate);
  if (!playback.loop && sourceElapsed >= duration) return null;
  const elapsedSeconds = playback.loop ? sourceElapsed % duration : Math.min(sourceElapsed, duration);
  const positionSeconds = playback.reverse ? end - elapsedSeconds : start + elapsedSeconds;
  return {
    elapsedSeconds,
    durationSeconds: duration,
    positionSeconds,
    positionRatio: Math.max(0, Math.min(1, positionSeconds / bufferDuration)),
    reverse: Boolean(playback.reverse),
    loop: Boolean(playback.loop),
  };
}

function setSmooth(param, value, time, smoothing = 0.018) {
  if (!param) return;
  param.cancelScheduledValues(time);
  param.setTargetAtTime(Number(value), time, smoothing);
}

function makeFoldCurve(amount, symmetry = 0, drive = 0) {
  const curve = new Float32Array(4096);
  if (amount <= 0.0001 && Math.abs(symmetry) <= 0.0001 && drive <= 0.0001) {
    for (let index = 0; index < curve.length; index += 1) curve[index] = ((index / (curve.length - 1)) * 2) - 1;
    return curve;
  }
  const folds = 1 + (amount * 8);
  const inputDrive = 1 + (drive * 12);
  for (let index = 0; index < curve.length; index += 1) {
    let x = (((index / (curve.length - 1)) * 2) - 1 + (symmetry * 0.42)) * inputDrive;
    x *= folds;
    x = Math.abs((((x + 1) % 4) + 4) % 4 - 2) - 1;
    curve[index] = Math.tanh(x * (1 + drive * 2.5));
  }
  return curve;
}

function makeDriveCurve(drive) {
  const curve = new Float32Array(2048);
  const gain = 1 + (drive * 24);
  const normalizer = Math.tanh(gain);
  for (let index = 0; index < curve.length; index += 1) {
    const x = ((index / (curve.length - 1)) * 2) - 1;
    curve[index] = Math.tanh(x * gain) / normalizer;
  }
  return curve;
}

function encodeWave(audioBuffer) {
  const channels = audioBuffer.numberOfChannels;
  const frames = audioBuffer.length;
  const bytesPerSample = 2;
  const dataSize = frames * channels * bytesPerSample;
  const output = new ArrayBuffer(44 + dataSize);
  const view = new DataView(output);
  let offset = 0;
  const text = (value) => { for (const character of value) view.setUint8(offset++, character.charCodeAt(0)); };
  const u16 = (value) => { view.setUint16(offset, value, true); offset += 2; };
  const u32 = (value) => { view.setUint32(offset, value, true); offset += 4; };
  text('RIFF'); u32(36 + dataSize); text('WAVE'); text('fmt '); u32(16); u16(1); u16(channels);
  u32(audioBuffer.sampleRate); u32(audioBuffer.sampleRate * channels * bytesPerSample);
  u16(channels * bytesPerSample); u16(16); text('data'); u32(dataSize);
  const channelData = Array.from({ length: channels }, (_, channel) => audioBuffer.getChannelData(channel));
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channelData[channel][frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([output], { type: 'audio/wav' });
}

export function createWavSelection(audioBuffer, startSeconds = 0, endSeconds = audioBuffer?.duration) {
  if (!audioBuffer) throw new Error('Opptaksutkastet mangler.');
  const { firstFrame, lastFrame, length, start, end } = selectionToFrameRange(audioBuffer, startSeconds, endSeconds);
  const selected = new AudioBuffer({ length, numberOfChannels: audioBuffer.numberOfChannels, sampleRate: audioBuffer.sampleRate });
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    selected.copyToChannel(audioBuffer.getChannelData(channel).subarray(firstFrame, lastFrame), channel);
  }
  return { buffer: selected, blob: encodeWave(selected), start, end, firstFrame, lastFrame, duration: selected.duration };
}

export function calculateBufferWaveform(audioBuffer, bins = 128) {
  if (!audioBuffer) return [];
  const data = audioBuffer.getChannelData(0);
  const size = Math.max(1, Math.ceil(data.length / bins));
  return Array.from({ length: bins }, (_, bin) => {
    let peak = 0;
    const start = bin * size;
    const end = Math.min(data.length, start + size);
    const stride = Math.max(1, Math.floor((end - start) / 2048));
    for (let index = start; index < end; index += stride) peak = Math.max(peak, Math.abs(data[index]));
    return peak;
  });
}

function reverseBuffer(context, source) {
  const reversed = new AudioBuffer({ length: source.length, numberOfChannels: source.numberOfChannels, sampleRate: source.sampleRate });
  for (let channel = 0; channel < source.numberOfChannels; channel += 1) reversed.copyToChannel(Float32Array.from(source.getChannelData(channel)).reverse(), channel);
  return reversed;
}

export class AudioEngine {
  constructor() {
    this.context = null;
    this.state = null;
    this.liveVoice = null;
    this.voices = new Set();
    this.kickVoices = new Set();
    this.sequencerVoices = new Set();
    this.sequencerKickVoices = new Set();
    this.sampleBuffers = new Map();
    this.reversedBuffers = new Map();
    this.sampleSources = new Map();
    this.samplePlaybacks = new Map();
    this.padBuffers = new Map();
    this.padSources = new Map();
    this.padChannels = [];
    this.micStream = null;
    this.micSource = null;
    this.micConsumers = new Set();
    this.micSampleRecorder = null;
    this.micRecordingChunks = [];
    this.mediaRecorder = null;
    this.recordingChunks = [];
    this.recordingBlob = null;
    this.recordingUrl = null;
    this.recordingPreview = null;
    this.supportRecorder = null;
    this.supportRecordingChunks = [];
    this.supportRecordingSource = '';
    this.supportRecordingAnalysisSource = null;
    this.supportRecordingAnalyser = null;
    this.supportPreviewSource = null;
    this.supportPreviewRequest = 0;
    this.sampleHoldTimer = 0;
    this.levelBuffers = new Map();
    this.noiseConnected = false;
    this.voiceConnected = false;
    this.patchRouter = new AudioPatchRouter();
    this.driveCurveCache = new Map();
    this.pulseWaveCache = new Map();
    this.playbackResumeSnapshot = null;
  }

  async start(state) {
    if (this.context) {
      if (this.context.state === 'closed') throw new Error('Lydmotoren er lukket. Last inn appen på nytt.');
      this.state = state;
      setNavigatorAudioSessionType(this.isMicrophoneActive() ? 'play-and-record' : 'playback');
      await this.context.resume();
      await this.restorePlaybackAfterResume(state);
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) throw new Error('Web Audio støttes ikke av denne nettleseren.');
    this.context = new AudioContextClass({ latencyHint: 'interactive' });
    this.state = state;
    setNavigatorAudioSessionType('playback');

    this.masterInput = new GainNode(this.context, { gain: 1 });
    this.master = new GainNode(this.context, { gain: 0.7 });
    this.limiter = new DynamicsCompressorNode(this.context, { threshold: -5, knee: 4, ratio: 14, attack: 0.003, release: 0.16 });
    this.outputMakeup = new GainNode(this.context, { gain: 1.35 });
    this.analyser = new AnalyserNode(this.context, { fftSize: 512, smoothingTimeConstant: 0.76 });
    this.recordDestination = this.context.createMediaStreamDestination();
    this.masterInput.connect(this.master).connect(this.limiter).connect(this.outputMakeup).connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.analyser.connect(this.recordDestination);

    this.delayInput = new GainNode(this.context, { gain: 1 });
    this.delay = new DelayNode(this.context, { delayTime: state.delayTime, maxDelayTime: 1.5 });
    this.delayFeedback = new GainNode(this.context, { gain: state.delayFeedback });
    this.delayWet = new GainNode(this.context, { gain: 0.48 });
    this.delayInput.connect(this.delay).connect(this.delayWet).connect(this.masterInput);
    this.delay.connect(this.delayFeedback).connect(this.delay);

    this.channels = {
      vco: this.createChannel('vco'),
      noise: this.createChannel('noise'),
      kick: this.createChannel('kick'),
      mic: this.createChannel('mic'),
      A: this.createChannel('sampleA'),
      B: this.createChannel('sampleB'),
      pads: this.createChannel('pads'),
    };
    this.channels.pads.tone.type = 'allpass';
    this.channels.pads.send.gain.value = 0;
    this.padChannels = Array.from({ length: PAD_COUNT }, (_, index) => this.createPadChannel(index));

    this.oscLevel = new GainNode(this.context, { gain: 0 });
    this.noiseLevel = new GainNode(this.context, { gain: 0 });
    this.foldDrive = new GainNode(this.context, { gain: 1 });
    this.folder = new WaveShaperNode(this.context, { oversample: '2x' });
    this.filterDrive = new WaveShaperNode(this.context, { oversample: '2x' });
    this.filter = new BiquadFilterNode(this.context, { type: 'lowpass', frequency: 5200, Q: 1.5 });
    this.vca = new GainNode(this.context, { gain: 0 });
    this.noiseFoldDrive = new GainNode(this.context, { gain: 1 });
    this.noiseFolder = new WaveShaperNode(this.context, { oversample: '2x' });
    this.noiseFilterDrive = new WaveShaperNode(this.context, { oversample: '2x' });
    this.noiseFilter = new BiquadFilterNode(this.context, { type: 'lowpass', frequency: 5200, Q: 1.5 });
    this.noiseVca = new GainNode(this.context, { gain: 0 });
    this.patchRouter.connect('vco.out>wavefolder.in', this.oscLevel, this.foldDrive);
    this.patchRouter.connect('wavefolder.out>filter.in:vco', this.foldDrive, this.folder);
    this.patchRouter.connect('filter.chain:vco', this.folder, this.filterDrive);
    this.patchRouter.connect('filter.out>envelope.in:vco', this.filterDrive, this.filter);
    this.patchRouter.connect('envelope.chain:vco', this.filter, this.vca);
    this.patchRouter.connect('envelope.out>mixer.vco', this.vca, this.channels.vco.input);
    this.patchRouter.connect('noise.out>wavefolder.in', this.noiseLevel, this.noiseFoldDrive);
    this.patchRouter.connect('wavefolder.out>filter.in:noise', this.noiseFoldDrive, this.noiseFolder);
    this.patchRouter.connect('filter.chain:noise', this.noiseFolder, this.noiseFilterDrive);
    this.patchRouter.connect('filter.out>envelope.in:noise', this.noiseFilterDrive, this.noiseFilter);
    this.patchRouter.connect('envelope.chain:noise', this.noiseFilter, this.noiseVca);
    this.patchRouter.connect('noise.out>mixer.noise', this.noiseVca, this.channels.noise.input);

    this.lfo = new OscillatorNode(this.context, { type: 'triangle', frequency: state.lfoRate });
    this.lfoPitch = new GainNode(this.context, { gain: 0 });
    this.lfoFilter = new GainNode(this.context, { gain: 0 });
    this.lfoFold = new GainNode(this.context, { gain: 0 });
    this.lfo.connect(this.lfoPitch);
    this.lfo.connect(this.lfoFilter).connect(this.filter.detune);
    this.lfoFilter.connect(this.noiseFilter.detune);
    this.lfo.connect(this.lfoFold).connect(this.foldDrive.gain);
    this.lfoFold.connect(this.noiseFoldDrive.gain);
    this.lfo.start();
    this.sampleHoldSource = new ConstantSourceNode(this.context, { offset: 0 });
    this.sampleHoldFilter = new GainNode(this.context, { gain: 0 });
    this.sampleHoldSource.connect(this.sampleHoldFilter).connect(this.filter.detune);
    this.sampleHoldFilter.connect(this.noiseFilter.detune);
    this.sampleHoldSource.start();

    await Promise.all([this.createNoise(), this.createVoiceGraph()]);
    this.applyState(state);
    await this.context.resume();
    this.restartSampleHold();
  }

  async suspend() {
    if (!this.context) return;
    if (this.context.state === 'closed') throw new Error('Lydmotoren er lukket. Last inn appen på nytt.');
    if (this.context.state === 'suspended') {
      this.capturePlaybackResumeSnapshot();
      this.pauseSampleHold();
      return;
    }
    const previousSnapshot = this.playbackResumeSnapshot;
    const pendingSnapshot = this.createPlaybackResumeSnapshot();
    this.playbackResumeSnapshot = pendingSnapshot;
    this.pauseSampleHold();
    try {
      await this.context.suspend();
      this.playbackResumeSnapshot = this.finalizePlaybackResumeSnapshot(
        pendingSnapshot,
        this.context.currentTime,
      );
    } catch (error) {
      this.playbackResumeSnapshot = previousSnapshot;
      if (this.context.state === 'running') this.restartSampleHold();
      throw error;
    }
  }

  createPlaybackResumeSnapshot(contextTime = this.context?.currentTime) {
    if (!this.context || this.context.state === 'closed') return null;
    const capturedAt = Number(contextTime) || 0;
    const samples = new Map();
    for (const [slot, playback] of this.samplePlaybacks) {
      const progress = calculateSamplePlayback(playback, capturedAt);
      const buffer = this.sampleBuffers.get(slot);
      if (!progress || !buffer) continue;
      samples.set(slot, {
        ...playback,
        buffer,
        positionSeconds: progress.positionSeconds,
      });
    }
    const pads = new Map();
    for (const [index, voice] of this.padSources) {
      const progress = calculateSamplePlayback(voice, capturedAt);
      const buffer = this.padBuffers.get(index);
      if (!progress || !buffer) continue;
      pads.set(index, {
        ...voice,
        voice,
        buffer,
        positionSeconds: progress.positionSeconds,
      });
    }
    const liveVoice = this.liveVoice
      ? {
        voice: this.liveVoice,
        oscillator: this.liveVoice.oscillator,
        note: this.liveVoice.note,
        velocity: this.liveVoice.velocity,
      }
      : null;
    return {
      context: this.context,
      capturedAt,
      samples,
      pads,
      liveVoice,
      microphone: this.isMicrophoneActive()
        ? {
          stream: this.micStream,
          source: this.micSource,
          consumers: new Set(this.micConsumers),
          monitoring: Boolean(this.state?.micMonitoring),
        }
        : null,
    };
  }

  finalizePlaybackResumeSnapshot(snapshot, contextTime = this.context?.currentTime) {
    if (!snapshot || snapshot.context !== this.context) return null;
    const finalizedAt = Number(contextTime) || snapshot.capturedAt;
    for (const [slot, playback] of snapshot.samples) {
      const progress = calculateSamplePlayback(playback, finalizedAt);
      if (!progress) snapshot.samples.delete(slot);
      else playback.positionSeconds = progress.positionSeconds;
    }
    for (const [index, playback] of snapshot.pads) {
      const progress = calculateSamplePlayback(playback, finalizedAt);
      if (!progress) {
        snapshot.pads.delete(index);
        if (playback.voice?.endedDuringSuspend) playback.onEnded?.(index);
      }
      else playback.positionSeconds = progress.positionSeconds;
    }
    snapshot.capturedAt = finalizedAt;
    return snapshot;
  }

  capturePlaybackResumeSnapshot() {
    if (this.playbackResumeSnapshot?.context === this.context) return this.playbackResumeSnapshot;
    this.playbackResumeSnapshot = this.createPlaybackResumeSnapshot();
    return this.playbackResumeSnapshot;
  }

  hasPendingPlaybackResume() {
    return Boolean(this.playbackResumeSnapshot?.context === this.context);
  }

  invalidatePlaybackResume(kind, key) {
    const snapshot = this.playbackResumeSnapshot;
    if (!snapshot) return;
    if (kind === 'sample') snapshot.samples.delete(key);
    else if (kind === 'pad') snapshot.pads.delete(Number(key));
    else if (kind === 'voice') snapshot.liveVoice = null;
    else if (kind === 'microphone') snapshot.microphone = null;
  }

  getPausedPlaybackResumeSnapshot() {
    if (!this.context || !PAUSED_CONTEXT_STATES.has(this.context.state)) return null;
    if (this.playbackResumeSnapshot?.context === this.context) return this.playbackResumeSnapshot;
    return this.capturePlaybackResumeSnapshot();
  }

  trackSampleResumeIntent(slot, playback) {
    const snapshot = this.getPausedPlaybackResumeSnapshot();
    const buffer = this.sampleBuffers.get(slot);
    const progress = calculateSamplePlayback(playback, this.context?.currentTime);
    if (!snapshot || !buffer || !progress) return;
    snapshot.samples.set(slot, {
      ...playback,
      buffer,
      positionSeconds: progress.positionSeconds,
    });
  }

  trackPadResumeIntent(index, voice) {
    const padIndex = Number(index);
    const snapshot = this.getPausedPlaybackResumeSnapshot();
    const buffer = this.padBuffers.get(padIndex);
    const progress = calculateSamplePlayback(voice, this.context?.currentTime);
    if (!snapshot || !buffer || !progress) return;
    snapshot.pads.set(padIndex, {
      ...voice,
      voice,
      buffer,
      positionSeconds: progress.positionSeconds,
    });
  }

  trackLiveVoiceResumeIntent(voice) {
    const snapshot = this.getPausedPlaybackResumeSnapshot();
    if (!snapshot || !voice) return;
    snapshot.liveVoice = {
      voice,
      oscillator: voice.oscillator,
      note: voice.note,
      velocity: voice.velocity,
    };
  }

  async restorePlaybackAfterResume(state = this.state) {
    if (!this.context || this.context.state !== 'running') {
      throw new Error('Lydmotoren må være aktiv før avspillingen kan gjenopprettes.');
    }
    const snapshot = this.playbackResumeSnapshot?.context === this.context
      ? this.playbackResumeSnapshot
      : null;
    const restored = [];
    try {
      this.applyState(state);
      if (snapshot) {
        for (const [slot, playback] of snapshot.samples) {
          if (this.sampleSources.has(slot)) continue;
          const source = this.restoreSamplePlayback(slot, playback);
          if (source) restored.push({ kind: 'sample', key: slot, source });
        }
        for (const [index, playback] of snapshot.pads) {
          if (this.padSources.has(index)) continue;
          const voice = this.restorePadPlayback(index, playback);
          if (voice) restored.push({
            kind: 'pad',
            key: index,
            source: voice.source,
            voice,
          });
        }
        const previousVoice = snapshot.liveVoice;
        if (previousVoice && !this.liveVoice && isModuleEnabled(this.state, 'vco')) {
          const oscillator = this.createOscillator(previousVoice.note, this.context.currentTime);
          const voice = this.setLiveVoice(oscillator, previousVoice.note, previousVoice.velocity);
          this.openEnvelope(this.context.currentTime, previousVoice.velocity);
          restored.push({ kind: 'voice', key: previousVoice.note, source: oscillator, voice });
        }
      }
      this.playbackResumeSnapshot = null;
      this.restartSampleHold();
      return {
        restored: restored.length,
        samples: this.sampleSources.size,
        pads: this.padSources.size,
        liveVoice: Boolean(this.liveVoice),
        microphone: this.isMicrophoneActive(),
      };
    } catch (error) {
      for (const entry of restored.reverse()) this.rollbackRestoredPlayback(entry);
      this.pauseSampleHold();
      try {
        if (this.context.state === 'running') await this.context.suspend();
      } catch (_suspendError) { /* Keep the original restore error */ }
      throw error;
    }
  }

  rollbackRestoredPlayback(entry) {
    if (entry.kind === 'pad' && entry.voice) entry.voice.suppressEnded = true;
    try { entry.source?.stop?.(); } catch (_error) { /* Already stopped */ }
    if (entry.kind === 'sample') {
      if (this.sampleSources.get(entry.key) === entry.source) this.sampleSources.delete(entry.key);
      if (this.samplePlaybacks.get(entry.key)?.source === entry.source) this.samplePlaybacks.delete(entry.key);
    } else if (entry.kind === 'pad') {
      if (this.padSources.get(entry.key)?.source === entry.source) this.padSources.delete(entry.key);
    } else if (entry.kind === 'voice' && this.liveVoice === entry.voice) {
      this.liveVoice = null;
      this.voices.delete(entry.source);
    }
    try { entry.source?.disconnect?.(); } catch (_error) { /* Already disconnected */ }
  }

  createChannel(name) {
    const input = new GainNode(this.context, { gain: 1 });
    const tone = new BiquadFilterNode(this.context, { type: 'lowpass', frequency: 16000, Q: 0.3 });
    const analyser = new AnalyserNode(this.context, { fftSize: 128, smoothingTimeConstant: 0.78 });
    const panner = new StereoPannerNode(this.context, { pan: 0 });
    const gain = new GainNode(this.context, { gain: 0.8 });
    const send = new GainNode(this.context, { gain: 0 });
    input.connect(tone).connect(analyser).connect(panner).connect(gain).connect(this.masterInput);
    tone.connect(send).connect(this.delayInput);
    return { name, input, tone, analyser, panner, gain, send };
  }

  createPadChannel(index) {
    const input = new GainNode(this.context, { gain: 1 });
    const tone = new BiquadFilterNode(this.context, { type: 'lowpass', frequency: 14000, Q: 0.3 });
    const panner = new StereoPannerNode(this.context, { pan: 0 });
    const gain = new GainNode(this.context, { gain: 1 });
    const send = new GainNode(this.context, { gain: 0 });
    input.connect(tone).connect(panner).connect(gain);
    gain.connect(this.channels.pads.input);
    gain.connect(send).connect(this.delayInput);
    return { index, input, tone, panner, gain, send };
  }

  async createNoise() {
    try {
      await this.context.audioWorklet.addModule(new URL('../audio-worklets/noise-processor.js?build=2026-10-10.1', import.meta.url));
      this.noise = new AudioWorkletNode(this.context, 'analog-noise', { outputChannelCount: [2] });
      this.connectNoiseSource();
      this.hasNoiseWorklet = true;
    } catch (_error) {
      const frames = this.context.sampleRate * 2;
      const buffer = new AudioBuffer({ length: frames, sampleRate: this.context.sampleRate, numberOfChannels: 1 });
      const channel = buffer.getChannelData(0);
      for (let index = 0; index < frames; index += 1) channel[index] = (Math.random() * 2) - 1;
      this.noise = new AudioBufferSourceNode(this.context, { buffer, loop: true });
      this.connectNoiseSource();
      this.noise.start();
      this.hasNoiseWorklet = false;
    }
  }

  connectNoiseSource() {
    if (!this.noiseTone) {
      this.noiseTone = new BiquadFilterNode(this.context, { type: 'lowpass', frequency: 12000, Q: 0.25 });
      this.noiseWidth = new StereoPannerNode(this.context, { pan: 0 });
      this.noiseTone.connect(this.noiseWidth).connect(this.noiseLevel);
    }
  }

  setNoiseActive(active) {
    const shouldConnect = Boolean(active);
    if (!this.noise || !this.noiseTone || shouldConnect === this.noiseConnected) return;
    if (shouldConnect) this.noise.connect(this.noiseTone);
    else {
      try { this.noise.disconnect(this.noiseTone); } catch (_error) { this.noise.disconnect(); }
    }
    this.noiseConnected = shouldConnect;
  }

  async createVoiceGraph() {
    this.micInput = new GainNode(this.context, { gain: 1 });
    this.micHighpass = new BiquadFilterNode(this.context, { type: 'highpass', frequency: 90, Q: 0.7 });
    this.micCompressor = new DynamicsCompressorNode(this.context, { threshold: -28, knee: 16, ratio: 4, attack: 0.006, release: 0.16 });
    try {
      await this.context.audioWorklet.addModule(new URL('../audio-worklets/voice-processor.js?build=2026-10-10.1', import.meta.url));
      this.voiceFx = new AudioWorkletNode(this.context, 'voice-processor', { outputChannelCount: [2] });
      this.hasVoiceWorklet = true;
    } catch (_error) {
      this.voiceFx = new GainNode(this.context, { gain: 1 });
      this.hasVoiceWorklet = false;
    }
    this.micRecordDestination = this.context.createMediaStreamDestination();
    this.micInput.connect(this.micHighpass).connect(this.micCompressor).connect(this.voiceFx);
  }

  setVoiceActive(active) {
    const shouldConnect = Boolean(active);
    if (!this.voiceFx || shouldConnect === this.voiceConnected) return;
    if (shouldConnect) {
      this.voiceFx.connect(this.channels.mic.input);
      this.voiceFx.connect(this.micRecordDestination);
    } else {
      try { this.voiceFx.disconnect(); } catch (_error) { /* disconnected */ }
    }
    this.voiceConnected = shouldConnect;
  }

  applyState(state) {
    if (!this.context) return;
    this.state = state;
    const now = this.context.currentTime;
    setSmooth(this.oscLevel.gain, isModuleEnabled(state, 'vco') ? state.oscLevel : 0, now);
    setSmooth(this.noiseLevel.gain, isModuleEnabled(state, 'noise') ? state.noiseLevel : 0, now);
    this.setNoiseActive(isModuleEnabled(state, 'noise') && state.noiseLevel > 0.001);
    this.setVoiceActive(isModuleEnabled(state, 'microphone') && this.isMicrophoneActive());
    setSmooth(this.noiseTone?.frequency, state.noiseTone, now);
    setSmooth(this.master.gain, state.master, now);
    setSmooth(this.filter.frequency, state.cutoff, now);
    setSmooth(this.filter.Q, state.resonance, now);
    setSmooth(this.noiseFilter.frequency, state.cutoff, now);
    setSmooth(this.noiseFilter.Q, state.resonance, now);
    this.filter.type = isModuleEnabled(state, 'filter') ? state.filterType : 'allpass';
    this.noiseFilter.type = isModuleEnabled(state, 'filter') ? state.filterType : 'allpass';
    const foldAmount = isModuleEnabled(state, 'wavefolder') ? state.fold : 0;
    const foldSymmetry = isModuleEnabled(state, 'wavefolder') ? state.symmetry : 0;
    const foldSignature = `${Number(foldAmount).toFixed(3)}:${Number(foldSymmetry).toFixed(3)}`;
    if (foldSignature !== this.foldSignature) {
      this.folder.curve = makeFoldCurve(foldAmount, foldSymmetry, 0);
      this.noiseFolder.curve = makeFoldCurve(foldAmount, foldSymmetry, 0);
      this.foldSignature = foldSignature;
    }
    setSmooth(this.foldDrive.gain, 1 + (foldAmount * 2.5), now);
    setSmooth(this.noiseFoldDrive.gain, 1 + (foldAmount * 2.5), now);
    const driveSignature = Number(state.filterDrive).toFixed(3);
    if (driveSignature !== this.driveSignature) {
      const curve = this.getDriveCurve(state.filterDrive);
      this.filterDrive.curve = curve;
      this.noiseFilterDrive.curve = curve;
      this.driveSignature = driveSignature;
    }
    if (state.noiseDrone && isModuleEnabled(state, 'noise')) setSmooth(this.noiseVca.gain, 1, now, 0.01);
    else if (!this.liveVoice) setSmooth(this.noiseVca.gain, EPSILON, now, 0.01);
    setSmooth(this.lfo.frequency, state.lfoRate, now);
    const lfoDepth = isModuleEnabled(state, 'lfo') ? state.lfoDepth : 0;
    setSmooth(this.lfoPitch.gain, state.lfoTarget === 'pitch' ? lfoDepth * 82 : 0, now);
    setSmooth(this.lfoFilter.gain, state.lfoTarget === 'filter' ? lfoDepth * 2800 : 0, now);
    setSmooth(this.lfoFold.gain, state.lfoTarget === 'fold' ? lfoDepth * 1.5 : 0, now);
    setSmooth(this.sampleHoldFilter.gain, isModuleEnabled(state, 'sampleHold') ? state.sampleHoldDepth * 2600 : 0, now);
    if (this.hasNoiseWorklet) {
      setSmooth(this.noise.parameters.get('color'), ({ white: 0, pink: 1, brown: 2 })[state.noiseColor] ?? 0, now);
      setSmooth(this.noise.parameters.get('width'), state.noiseWidth, now);
    }
    if (this.hasVoiceWorklet) {
      const params = this.voiceFx.parameters;
      setSmooth(params.get('pitch'), state.micPitch, now);
      setSmooth(params.get('ringRate'), state.micRingRate, now);
      setSmooth(params.get('ringMix'), state.micRingMix, now);
      setSmooth(params.get('drive'), state.micDrive, now);
      setSmooth(params.get('gate'), state.micGate, now);
      setSmooth(params.get('wet'), isModuleEnabled(state, 'voiceFx') ? state.micWet : 0, now);
    }
    setSmooth(this.micInput.gain, state.micInput, now);
    setSmooth(this.channels.mic.tone.frequency, state.micTone, now);
    setSmooth(this.channels.A.tone.frequency, state.sampleATone, now);
    setSmooth(this.channels.B.tone.frequency, state.sampleBTone, now);
    if (!isModuleEnabled(state, 'padSampler')) this.stopAllPads();
    setSmooth(this.delay.delayTime, state.delayTime, now);
    setSmooth(this.delayFeedback.gain, isModuleEnabled(state, 'delay') ? state.delayFeedback : 0, now);
    this.applyMixerState(now);
  }

  applyMixerState(now = this.context.currentTime) {
    const state = this.state;
    const vcoOn = isSourceAudible(state, 'vco', isModuleEnabled(state, 'vco'));
    const noiseOn = isSourceAudible(state, 'noise', isModuleEnabled(state, 'noise'));
    const kickOn = isSourceAudible(state, 'kick', isModuleEnabled(state, 'kick'));
    const micOn = isSourceAudible(state, 'mic', isModuleEnabled(state, 'microphone') && state.micMonitoring && this.isMicrophoneActive());
    const aOn = isSourceAudible(state, 'A', isModuleEnabled(state, 'sampleA'));
    const bOn = isSourceAudible(state, 'B', isModuleEnabled(state, 'sampleB'));
    const padsOn = isSourceAudible(state, 'pads', isModuleEnabled(state, 'padSampler'));
    setSmooth(this.channels.vco.gain.gain, vcoOn ? state.synthGain : 0, now);
    setSmooth(this.channels.vco.panner.pan, state.synthPan, now);
    setSmooth(this.channels.noise.gain.gain, noiseOn ? state.noiseGain : 0, now);
    setSmooth(this.channels.kick.gain.gain, kickOn ? state.kickGain : 0, now);
    const delayOn = isModuleEnabled(state, 'delay');
    setSmooth(this.channels.vco.send.gain, vcoOn && delayOn ? state.synthSend : 0, now);
    setSmooth(this.channels.noise.send.gain, 0, now);
    setSmooth(this.channels.kick.send.gain, 0, now);
    setSmooth(this.channels.mic.gain.gain, micOn ? state.micGain : 0, now);
    setSmooth(this.channels.mic.panner.pan, state.micPan, now);
    setSmooth(this.channels.mic.send.gain, micOn && delayOn ? state.micDelay : 0, now);
    for (const [slot, on] of [['A', aOn], ['B', bOn]]) {
      setSmooth(this.channels[slot].gain.gain, on ? state[`sample${slot}Gain`] : 0, now);
      setSmooth(this.channels[slot].panner.pan, state[`sample${slot}Pan`], now);
      setSmooth(this.channels[slot].send.gain, on && delayOn ? state[`sample${slot}Send`] : 0, now);
    }
    setSmooth(this.channels.pads.gain.gain, padsOn ? state.padGain : 0, now);
    setSmooth(this.channels.pads.panner.pan, 0, now);
    setSmooth(this.channels.pads.send.gain, 0, now);
    for (let index = 0; index < PAD_COUNT; index += 1) {
      this.applyPadChannelState(index, { padsOn, delayOn, now });
    }
  }

  applyPadChannelState(index, {
    padsOn = isSourceAudible(this.state, 'pads', isModuleEnabled(this.state, 'padSampler')),
    delayOn = isModuleEnabled(this.state, 'delay'),
    now = this.context.currentTime,
  } = {}) {
    const pad = this.state?.pads?.[index];
    const channel = this.padChannels?.[index];
    if (!pad || !channel) return;
    setSmooth(channel.tone.frequency, pad.tone, now);
    setSmooth(channel.panner.pan, pad.pan, now);
    setSmooth(channel.gain.gain, pad.gain, now);
    setSmooth(channel.send.gain, padsOn && delayOn ? pad.send * this.state.padGain : 0, now);
    const source = this.padSources.get(index)?.source;
    if (source?.playbackRate) setSmooth(source.playbackRate, pad.rate, now);
  }

  updateParameters(keys, state) {
    this.state = state;
    if (!this.context) return;
    const changed = new Set(keys);
    const changedPadParameters = [...changed].map(parsePadParameterKey);
    if (changedPadParameters.length && changedPadParameters.every(Boolean)) {
      for (const index of new Set(changedPadParameters.map((parameter) => parameter.index))) {
        this.applyPadChannelState(index);
      }
      return;
    }
    if (changed.has('sampleHoldRate')) this.restartSampleHold();
    this.applyState(state);
    if (['pitch', 'fine', 'pulseWidth', 'drift'].some((key) => changed.has(key))) this.refreshLiveWave();
    for (const key of changed) {
      if (!/^sample[AB](Start|End|Rate|Reverse|Loop)$/.test(key)) continue;
      const slot = key.startsWith('sampleA') ? 'A' : 'B';
      if (this.sampleSources.has(slot)) this.playSample(slot);
    }
  }

  updateParameter(key, _value, state) { this.updateParameters([key], state); }

  restartSampleHold() {
    this.pauseSampleHold();
    if (!this.context || this.context.state !== 'running' || !this.state) return;
    const tick = () => setSmooth(this.sampleHoldSource.offset, (Math.random() * 2) - 1, this.context.currentTime, 0.004);
    tick();
    this.sampleHoldTimer = globalThis.setInterval(tick, Math.max(30, 1000 / this.state.sampleHoldRate));
  }

  pauseSampleHold() {
    globalThis.clearInterval(this.sampleHoldTimer);
    this.sampleHoldTimer = 0;
  }

  makePulseWave(widthPercent) {
    const cacheKey = Math.round(Number(widthPercent) * 10) / 10;
    if (this.pulseWaveCache.has(cacheKey)) return this.pulseWaveCache.get(cacheKey);
    const harmonics = 64;
    const real = new Float32Array(harmonics);
    const imaginary = new Float32Array(harmonics);
    const duty = widthPercent / 100;
    for (let harmonic = 1; harmonic < harmonics; harmonic += 1) {
      real[harmonic] = (2 / (harmonic * Math.PI)) * Math.sin(2 * Math.PI * harmonic * duty);
      imaginary[harmonic] = (2 / (harmonic * Math.PI)) * (1 - Math.cos(2 * Math.PI * harmonic * duty));
    }
    const wave = this.context.createPeriodicWave(real, imaginary, { disableNormalization: false });
    this.pulseWaveCache.set(cacheKey, wave);
    return wave;
  }

  getDriveCurve(drive) {
    const cacheKey = Number(drive).toFixed(3);
    if (!this.driveCurveCache.has(cacheKey)) this.driveCurveCache.set(cacheKey, makeDriveCurve(Number(drive)));
    return this.driveCurveCache.get(cacheKey);
  }

  createOscillator(note, time) {
    const oscillator = new OscillatorNode(this.context, {
      frequency: midiNoteToFrequency(note + Number(this.state.pitch)),
      detune: Number(this.state.fine) + (((Math.random() * 2) - 1) * Number(this.state.drift)),
    });
    if (this.state.waveform === 'pulse') oscillator.setPeriodicWave(this.makePulseWave(this.state.pulseWidth));
    else oscillator.type = this.state.waveform;
    this.lfoPitch.connect(oscillator.detune);
    oscillator.connect(this.oscLevel);
    oscillator.start(time);
    this.voices.add(oscillator);
    oscillator.addEventListener('ended', () => {
      this.voices.delete(oscillator);
      try { this.lfoPitch.disconnect(oscillator.detune); } catch (_error) { /* Already disconnected */ }
      try { oscillator.disconnect(); } catch (_error) { /* Already disconnected */ }
    }, { once: true });
    return oscillator;
  }

  refreshLiveWave() {
    if (!this.liveVoice || !this.context) return;
    const { note } = this.liveVoice;
    this.noteOff(note, true);
    this.noteOn(note);
  }

  openEnvelope(time, velocity = 1) {
    const targets = this.state.noiseDrone ? [this.vca] : [this.vca, this.noiseVca];
    if (!isModuleEnabled(this.state, 'envelope')) {
      for (const target of targets) {
        target.gain.cancelScheduledValues(time);
        target.gain.setTargetAtTime(Math.max(EPSILON, velocity), time, 0.004);
      }
      return;
    }
    const { attack, decay, sustain } = this.state;
    const peak = Math.max(EPSILON, Math.min(1, velocity));
    for (const target of targets) {
      target.gain.cancelScheduledValues(time);
      target.gain.setValueAtTime(Math.max(EPSILON, target.gain.value), time);
      target.gain.exponentialRampToValueAtTime(peak, time + Math.max(0.005, attack));
      target.gain.exponentialRampToValueAtTime(Math.max(EPSILON, sustain * peak), time + attack + decay);
    }
  }

  closeEnvelope(time, release = this.state.release) {
    if (!isModuleEnabled(this.state, 'envelope')) release = 0.01;
    const targets = this.state.noiseDrone ? [this.vca] : [this.vca, this.noiseVca];
    for (const target of targets) {
      target.gain.cancelScheduledValues(time);
      target.gain.setValueAtTime(Math.max(EPSILON, target.gain.value), time);
      target.gain.exponentialRampToValueAtTime(EPSILON, time + Math.max(0.01, release));
    }
  }

  setLiveVoice(oscillator, note, velocity = 0.9) {
    const voice = { oscillator, note, velocity };
    this.liveVoice = voice;
    oscillator.addEventListener('ended', () => {
      if (PAUSED_CONTEXT_STATES.has(this.context?.state) && !this.hasPendingPlaybackResume()) {
        this.capturePlaybackResumeSnapshot();
      }
      if (this.liveVoice === voice) this.liveVoice = null;
    }, { once: true });
    this.trackLiveVoiceResumeIntent(voice);
    return voice;
  }

  noteOn(note, velocity = 0.9) {
    if (!this.context) return;
    const now = this.context.currentTime;
    if (this.liveVoice) this.noteOff(this.liveVoice.note, true);
    this.setLiveVoice(this.createOscillator(note, now), note, velocity);
    this.openEnvelope(now, velocity);
  }

  noteOff(note, immediate = false) {
    if (!this.context) return;
    const resumableVoice = this.playbackResumeSnapshot?.liveVoice;
    const matchesResumableVoice = resumableVoice
      && (note === undefined || note === resumableVoice.note);
    if (!this.liveVoice || (note !== undefined && note !== this.liveVoice.note)) {
      if (matchesResumableVoice) this.invalidatePlaybackResume('voice');
      return;
    }
    const now = this.context.currentTime;
    const release = immediate ? 0.02 : this.state.release;
    this.closeEnvelope(now, release);
    try { this.liveVoice.oscillator.stop(now + release + 0.06); } catch (_error) { /* stopped */ }
    this.liveVoice = null;
    this.invalidatePlaybackResume('voice');
  }

  scheduleNote(note, startTime, duration, velocity = 0.78, slideFromNote = null) {
    if (!this.context) return;
    const oscillator = this.createOscillator(note, startTime);
    this.sequencerVoices.add(oscillator);
    oscillator.addEventListener('ended', () => this.sequencerVoices.delete(oscillator), { once: true });
    if (Number.isFinite(slideFromNote)) {
      oscillator.frequency.cancelScheduledValues(startTime);
      oscillator.frequency.setValueAtTime(midiNoteToFrequency(slideFromNote + Number(this.state.pitch)), startTime);
      oscillator.frequency.exponentialRampToValueAtTime(midiNoteToFrequency(note + Number(this.state.pitch)), startTime + Math.min(0.08, duration * 0.5));
    }
    this.openEnvelope(startTime, velocity);
    this.closeEnvelope(startTime + duration, Math.min(this.state.release, 0.3));
    oscillator.stop(startTime + duration + Math.min(this.state.release, 0.3) + 0.08);
  }

  cancelSequencerSchedule() {
    if (!this.context) return;
    const now = this.context.currentTime;
    for (const oscillator of [...this.sequencerVoices, ...this.sequencerKickVoices]) {
      try { oscillator.stop(now + 0.005); } catch (_error) { /* Already stopped */ }
    }
    this.sequencerVoices.clear();
    this.sequencerKickVoices.clear();

    const cancelFutureAutomation = (parameter) => {
      if (!parameter) return;
      try {
        if (typeof parameter.cancelAndHoldAtTime === 'function') parameter.cancelAndHoldAtTime(now);
        else {
          const currentValue = Math.max(EPSILON, Number(parameter.value) || EPSILON);
          parameter.cancelScheduledValues(now);
          parameter.setValueAtTime(currentValue, now);
        }
      } catch (_error) { /* Browser may reject automation while interrupted */ }
    };
    cancelFutureAutomation(this.vca?.gain);
    cancelFutureAutomation(this.noiseVca?.gain);

    if (!this.liveVoice) {
      this.vca?.gain?.setTargetAtTime(EPSILON, now, 0.004);
      if (!this.state?.noiseDrone) this.noiseVca?.gain?.setTargetAtTime(EPSILON, now, 0.004);
    }
  }

  triggerKick(startTime = this.context?.currentTime, options = {}) {
    if (!this.context || startTime === undefined || !isModuleEnabled(this.state, 'kick')) return;
    const { kickPitch, kickDecay, kickSweep, kickTone, kickDrive } = this.state;
    const pitch = kickPitch * (2 ** (Number(options.pitch || 0) / 12));
    const decay = kickDecay * Number(options.decay || 1);
    const velocity = Math.max(EPSILON, Number(options.velocity ?? 0.95));
    const oscillator = new OscillatorNode(this.context, { type: 'sine', frequency: pitch * kickSweep });
    const gain = new GainNode(this.context, { gain: EPSILON });
    const tone = new BiquadFilterNode(this.context, { type: 'lowpass', frequency: kickTone, Q: 0.8 });
    const drive = new WaveShaperNode(this.context, { curve: this.getDriveCurve(kickDrive), oversample: '2x' });
    oscillator.frequency.exponentialRampToValueAtTime(pitch, startTime + Math.min(0.12, decay * 0.35));
    gain.gain.setValueAtTime(velocity, startTime);
    gain.gain.exponentialRampToValueAtTime(EPSILON, startTime + decay);
    oscillator.connect(gain).connect(drive).connect(tone).connect(this.channels.kick.input);
    oscillator.start(startTime);
    oscillator.stop(startTime + decay + 0.08);
    this.kickVoices.add(oscillator);
    if (options.sequence) this.sequencerKickVoices.add(oscillator);
    oscillator.addEventListener('ended', () => {
      this.kickVoices.delete(oscillator);
      this.sequencerKickVoices.delete(oscillator);
      for (const node of [oscillator, gain, drive, tone]) {
        try { node.disconnect(); } catch (_error) { /* Already disconnected */ }
      }
    }, { once: true });
  }

  async startMicrophone({ consumer = 'module' } = {}) {
    if (!this.context) throw new Error('Start lydmotoren først.');
    if (consumer === 'module' && !isModuleEnabled(this.state, 'microphone')) throw new Error('Mikrofon-modulen er slått av.');
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Mikrofon støttes ikke i denne nettleseren.');
    setNavigatorAudioSessionType('play-and-record');
    if (!this.isMicrophoneActive()) {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false,
        });
        this.micStream = stream;
        this.micSource = this.context.createMediaStreamSource(stream);
        this.micSource.connect(this.micInput);
      } catch (error) {
        stream?.getTracks().forEach((track) => track.stop());
        this.micSource = null;
        this.micStream = null;
        setNavigatorAudioSessionType('playback');
        throw error;
      }
    }
    this.micConsumers.add(consumer);
    this.setVoiceActive(isModuleEnabled(this.state, 'microphone'));
    this.applyMixerState();
  }

  stopMicrophone({ consumer = 'module', force = false } = {}) {
    if (consumer === 'module' || force) {
      this.cancelMicSampleRecording();
      if (this.state) this.state.micMonitoring = false;
    }
    if (force) this.micConsumers.clear();
    else this.micConsumers.delete(consumer);
    this.setVoiceActive(consumer === 'module' ? false : isModuleEnabled(this.state, 'microphone'));
    if (this.micConsumers.size) {
      setNavigatorAudioSessionType('play-and-record');
      if (this.context) this.applyMixerState();
      return;
    }
    this.invalidatePlaybackResume('microphone');
    try { this.micSource?.disconnect(); } catch (_error) { /* disconnected */ }
    this.micStream?.getTracks().forEach((track) => track.stop());
    this.micSource = null;
    this.micStream = null;
    setNavigatorAudioSessionType('playback');
    if (this.context) this.applyMixerState();
  }

  isMicrophoneActive() { return Boolean(this.micStream?.getAudioTracks().some((track) => track.readyState === 'live')); }

  setMicMonitoring(enabled) {
    if (!this.state) return;
    this.state.micMonitoring = Boolean(enabled) && this.isMicrophoneActive();
    this.applyMixerState();
  }

  async loadSampleBlob(slot, blob) {
    if (!this.context) throw new Error('Start lydmotoren først.');
    let buffer;
    try { buffer = await this.context.decodeAudioData(await blob.arrayBuffer()); }
    catch (_error) { throw new Error('Lydfilen kunne ikke dekodes eller behandles på denne enheten. Kontroller formatet og tilgjengelig minne. Bruk helst M4A/AAC, MP3 eller WAV.'); }
    this.stopSample(slot);
    this.sampleBuffers.set(slot, buffer);
    this.reversedBuffers.delete(slot);
    return { name: blob.name || `Sample ${slot}`, duration: buffer.duration, type: blob.type || 'audio/*', stored: true };
  }

  removeSample(slot) {
    this.stopSample(slot);
    this.sampleBuffers.delete(slot);
    this.reversedBuffers.delete(slot);
  }

  hasSample(slot) { return this.sampleBuffers.has(slot); }

  async decodePadBlob(index, blob) {
    if (!this.context) throw new Error('Start lydmotoren først.');
    if (!Number.isInteger(Number(index)) || Number(index) < 0 || Number(index) >= PAD_COUNT) {
      throw new Error(`Ugyldig pad: ${index}`);
    }
    let buffer;
    try { buffer = await this.context.decodeAudioData(await blob.arrayBuffer()); }
    catch (_error) { throw new Error('Lydfilen kunne ikke dekodes eller behandles på denne enheten. Kontroller formatet og tilgjengelig minne. Bruk helst M4A/AAC, MP3 eller WAV.'); }
    return {
      buffer,
      metadata: {
        name: blob.name || `Pad ${Number(index) + 1}`,
        duration: buffer.duration,
        type: blob.type || 'audio/*',
        stored: true,
      },
    };
  }

  commitPadBuffer(index, buffer) {
    if (!buffer) throw new Error('Pad-samplet mangler dekodet lyd.');
    this.stopPad(index);
    this.padBuffers.set(Number(index), buffer);
  }

  removePadSample(index) {
    this.stopPad(index);
    this.padBuffers.delete(Number(index));
  }

  hasPadSample(index) { return this.padBuffers.has(Number(index)); }

  playPad(index, { velocity = 1, mode = 'one-shot', onEnded } = {}) {
    const padIndex = Number(index);
    if (!this.context || !this.padBuffers.has(padIndex) || !isModuleEnabled(this.state, 'padSampler')) return false;
    this.stopPad(padIndex);
    const pad = this.state.pads[padIndex];
    const buffer = this.padBuffers.get(padIndex);
    const source = new AudioBufferSourceNode(this.context, {
      buffer,
      playbackRate: pad.rate,
    });
    const normalizedVelocity = Math.max(0, Math.min(1, Number(velocity) || 0));
    const velocityGain = new GainNode(this.context, { gain: normalizedVelocity });
    source.loop = mode === 'loop-hold';
    source.connect(velocityGain).connect(this.padChannels?.[padIndex]?.input || this.channels.pads.input);
    const voice = this.registerPadVoice(padIndex, source, velocityGain, {
      buffer,
      velocity: normalizedVelocity,
      mode,
      onEnded,
      startedAt: this.context.currentTime,
      startSeconds: 0,
      endSeconds: buffer.duration,
      bufferDuration: buffer.duration,
      playbackRate: pad.rate,
      reverse: false,
      loop: source.loop,
    });
    try {
      source.start();
    } catch (error) {
      voice.suppressEnded = true;
      if (this.padSources.get(padIndex) === voice) this.padSources.delete(padIndex);
      for (const node of [source, velocityGain]) {
        try { node.disconnect(); } catch (_error) { /* Never connected */ }
      }
      throw error;
    }
    this.trackPadResumeIntent(padIndex, voice);
    return true;
  }

  registerPadVoice(padIndex, source, velocityGain, playback) {
    const voice = { ...playback, source, velocityGain };
    this.padSources.set(padIndex, voice);
    source.addEventListener('ended', () => {
      if (PAUSED_CONTEXT_STATES.has(this.context?.state) && !this.hasPendingPlaybackResume()) {
        this.capturePlaybackResumeSnapshot();
      }
      const isCurrentVoice = this.padSources.get(padIndex) === voice;
      const isPendingResume = this.playbackResumeSnapshot?.pads?.get(padIndex)?.source === source
        && PAUSED_CONTEXT_STATES.has(this.context?.state);
      if (isPendingResume) voice.endedDuringSuspend = true;
      if (isCurrentVoice) this.padSources.delete(padIndex);
      for (const node of [source, velocityGain]) {
        try { node.disconnect(); } catch (_error) { /* Already disconnected */ }
      }
      if (isCurrentVoice && !isPendingResume && !voice.suppressEnded) voice.onEnded?.(padIndex);
    }, { once: true });
    return voice;
  }

  restorePadPlayback(index, playback) {
    const padIndex = Number(index);
    const buffer = this.padBuffers.get(padIndex);
    if (!buffer || buffer !== playback.buffer || !isModuleEnabled(this.state, 'padSampler')) return null;
    const duration = Math.max(0, Number(playback.endSeconds) || Number(buffer.duration) || 0);
    let position = Math.max(0, Math.min(duration, Number(playback.positionSeconds) || 0));
    if (playback.loop && position >= duration) position = 0;
    const remaining = duration - position;
    if (!playback.loop && remaining <= EPSILON) return null;
    const pad = this.state?.pads?.[padIndex];
    const playbackRate = Math.max(EPSILON, Number(pad?.rate) || Number(playback.playbackRate) || 1);
    const source = new AudioBufferSourceNode(this.context, { buffer, playbackRate });
    const velocity = Math.max(0, Math.min(1, Number(playback.velocity) || 0));
    const velocityGain = new GainNode(this.context, { gain: velocity });
    source.loop = pad?.mode ? pad.mode === 'loop-hold' : Boolean(playback.loop);
    source.loopStart = 0;
    source.loopEnd = duration;
    source.connect(velocityGain).connect(this.padChannels?.[padIndex]?.input || this.channels.pads.input);
    const voice = this.registerPadVoice(padIndex, source, velocityGain, {
      ...playback,
      buffer,
      velocity,
      startedAt: this.context.currentTime - (position / playbackRate),
      positionSeconds: position,
      playbackRate,
      reverse: false,
      loop: source.loop,
    });
    try {
      if (source.loop) source.start(0, position);
      else source.start(0, position, remaining);
    } catch (error) {
      voice.suppressEnded = true;
      if (this.padSources.get(padIndex) === voice) this.padSources.delete(padIndex);
      for (const node of [source, velocityGain]) {
        try { node.disconnect(); } catch (_error) { /* Never connected */ }
      }
      throw error;
    }
    return voice;
  }

  isPadActive(index) {
    return this.padSources.has(Number(index));
  }

  stopPad(index) {
    const padIndex = Number(index);
    const voice = this.padSources.get(padIndex);
    if (voice) {
      this.padSources.delete(padIndex);
      try { voice.source.stop(); } catch (_error) { /* Already stopped */ }
    }
    this.invalidatePlaybackResume('pad', padIndex);
  }

  stopAllPads() {
    for (const index of [...this.padSources.keys()]) this.stopPad(index);
  }

  getActivePadCount() { return this.padSources.size; }

  getSampleInfo(slot) {
    const buffer = this.sampleBuffers.get(slot);
    if (!buffer) return null;
    return { duration: buffer.duration, length: buffer.length, sampleRate: buffer.sampleRate, numberOfChannels: buffer.numberOfChannels };
  }

  createSampleCrop(slot, startSeconds, endSeconds) {
    const source = this.sampleBuffers.get(slot);
    if (!source) throw new Error(`Sample ${slot} er tom.`);
    const { firstFrame, lastFrame, length } = selectionToFrameRange(source, startSeconds, endSeconds);
    const cropped = new AudioBuffer({
      length,
      numberOfChannels: source.numberOfChannels,
      sampleRate: source.sampleRate,
    });
    for (let channel = 0; channel < source.numberOfChannels; channel += 1) {
      cropped.copyToChannel(source.getChannelData(channel).subarray(firstFrame, lastFrame), channel);
    }
    const previousName = this.state?.samples?.[slot]?.name || `Sample ${slot}`;
    const filename = `${previousName.replace(/\.[^.]+$/, '')} – klipp.wav`;
    const blob = encodeWave(cropped);
    try { Object.defineProperty(blob, 'name', { value: filename }); } catch (_error) { /* Metadata carries the name */ }
    return {
      buffer: cropped,
      blob,
      firstFrame,
      lastFrame,
      metadata: { name: filename, duration: cropped.duration, type: 'audio/wav', stored: true },
    };
  }

  commitSampleCrop(slot, result) {
    if (!result?.buffer) throw new Error('Det klippede lydutvalget mangler.');
    this.stopSample(slot);
    this.sampleBuffers.set(slot, result.buffer);
    this.reversedBuffers.delete(slot);
  }

  playSample(slot) {
    if (!this.context || !this.sampleBuffers.has(slot) || !isModuleEnabled(this.state, `sample${slot}`)) return false;
    this.stopSample(slot);
    const prefix = `sample${slot}`;
    const original = this.sampleBuffers.get(slot);
    const reverse = Boolean(this.state[`${prefix}Reverse`]);
    if (reverse && !this.reversedBuffers.has(slot)) this.reversedBuffers.set(slot, reverseBuffer(this.context, original));
    const buffer = reverse ? this.reversedBuffers.get(slot) : original;
    const startRatio = Math.min(this.state[`${prefix}Start`], this.state[`${prefix}End`] - 0.01);
    const endRatio = Math.max(this.state[`${prefix}End`], startRatio + 0.01);
    const offset = (reverse ? 1 - endRatio : startRatio) * buffer.duration;
    const duration = Math.max(0.02, (endRatio - startRatio) * buffer.duration);
    const playbackRate = this.state[`${prefix}Rate`];
    const source = new AudioBufferSourceNode(this.context, { buffer, playbackRate });
    source.loop = Boolean(this.state[`${prefix}Loop`]);
    source.loopStart = offset;
    source.loopEnd = offset + duration;
    source.connect(this.channels[slot].input);
    if (source.loop) source.start(0, offset);
    else source.start(0, offset, duration);
    this.sampleSources.set(slot, source);
    const playback = {
      source,
      startedAt: this.context.currentTime,
      startSeconds: startRatio * original.duration,
      endSeconds: endRatio * original.duration,
      bufferDuration: original.duration,
      playbackRate,
      reverse,
      loop: source.loop,
    };
    this.samplePlaybacks.set(slot, playback);
    source.addEventListener('ended', () => {
      if (PAUSED_CONTEXT_STATES.has(this.context?.state) && !this.hasPendingPlaybackResume()) {
        this.capturePlaybackResumeSnapshot();
      }
      if (this.sampleSources.get(slot) === source) this.sampleSources.delete(slot);
      if (this.samplePlaybacks.get(slot)?.source === source) this.samplePlaybacks.delete(slot);
      try { source.disconnect(); } catch (_error) { /* Already disconnected */ }
    }, { once: true });
    this.trackSampleResumeIntent(slot, playback);
    return true;
  }

  restoreSamplePlayback(slot, playback) {
    const original = this.sampleBuffers.get(slot);
    if (!original || original !== playback.buffer || !isModuleEnabled(this.state, `sample${slot}`)) return null;
    const prefix = `sample${slot}`;
    const startRatio = Math.min(this.state[`${prefix}Start`], this.state[`${prefix}End`] - 0.01);
    const endRatio = Math.max(this.state[`${prefix}End`], startRatio + 0.01);
    const start = Math.max(0, Math.min(original.duration, startRatio * original.duration));
    const end = Math.max(start, Math.min(original.duration, endRatio * original.duration));
    const reverse = Boolean(this.state[`${prefix}Reverse`]);
    const loop = Boolean(this.state[`${prefix}Loop`]);
    const playbackRate = Math.max(EPSILON, Number(this.state[`${prefix}Rate`]) || 1);
    const position = Math.max(start, Math.min(end, Number(playback.positionSeconds) || start));
    const remaining = reverse ? position - start : end - position;
    if (!loop && remaining <= EPSILON) return null;
    if (reverse && !this.reversedBuffers.has(slot)) {
      this.reversedBuffers.set(slot, reverseBuffer(this.context, original));
    }
    const buffer = reverse ? this.reversedBuffers.get(slot) : original;
    const source = new AudioBufferSourceNode(this.context, { buffer, playbackRate });
    const offset = reverse ? original.duration - position : position;
    source.loop = loop;
    source.loopStart = reverse ? original.duration - end : start;
    source.loopEnd = reverse ? original.duration - start : end;
    source.connect(this.channels[slot].input);
    const elapsed = reverse ? end - position : position - start;
    const resumedPlayback = {
      ...playback,
      source,
      buffer: original,
      startedAt: this.context.currentTime - (elapsed / playbackRate),
      startSeconds: start,
      endSeconds: end,
      bufferDuration: original.duration,
      playbackRate,
      positionSeconds: position,
      reverse,
      loop,
    };
    this.sampleSources.set(slot, source);
    this.samplePlaybacks.set(slot, resumedPlayback);
    source.addEventListener('ended', () => {
      if (PAUSED_CONTEXT_STATES.has(this.context?.state) && !this.hasPendingPlaybackResume()) {
        this.capturePlaybackResumeSnapshot();
      }
      if (this.sampleSources.get(slot) === source) this.sampleSources.delete(slot);
      if (this.samplePlaybacks.get(slot)?.source === source) this.samplePlaybacks.delete(slot);
      try { source.disconnect(); } catch (_error) { /* Already disconnected */ }
    }, { once: true });
    try {
      if (loop) source.start(0, offset);
      else source.start(0, offset, remaining);
    } catch (error) {
      if (this.sampleSources.get(slot) === source) this.sampleSources.delete(slot);
      if (this.samplePlaybacks.get(slot)?.source === source) this.samplePlaybacks.delete(slot);
      try { source.disconnect(); } catch (_error) { /* Never connected */ }
      throw error;
    }
    return source;
  }

  getSamplePlaybackState(slot, contextTime = this.context?.currentTime) {
    const playback = this.samplePlaybacks.get(slot);
    const progress = calculateSamplePlayback(playback, contextTime);
    if (!progress && playback && this.samplePlaybacks.get(slot)?.source === playback.source) this.samplePlaybacks.delete(slot);
    return progress;
  }

  playSampleRange(slot, startSeconds, endSeconds) {
    if (!this.context || !this.sampleBuffers.has(slot) || !isModuleEnabled(this.state, `sample${slot}`)) return false;
    const buffer = this.sampleBuffers.get(slot);
    const selection = normalizeSampleSelection(buffer.duration, startSeconds, endSeconds, 1 / buffer.sampleRate);
    this.stopSample(slot);
    const source = new AudioBufferSourceNode(this.context, { buffer });
    source.connect(this.channels[slot].input);
    source.start(0, selection.start, selection.end - selection.start);
    this.sampleSources.set(slot, source);
    source.addEventListener('ended', () => {
      if (this.sampleSources.get(slot) === source) this.sampleSources.delete(slot);
      try { source.disconnect(); } catch (_error) { /* Already disconnected */ }
    }, { once: true });
    return true;
  }

  stopSample(slot) {
    const source = this.sampleSources.get(slot);
    if (source) { try { source.stop(); } catch (_error) { /* stopped */ } }
    this.sampleSources.delete(slot);
    this.samplePlaybacks.delete(slot);
    this.invalidatePlaybackResume('sample', slot);
  }

  getSampleWaveform(slot, bins = 128) {
    const buffer = this.sampleBuffers.get(slot);
    return calculateBufferWaveform(buffer, bins);
  }

  async startMicSampleRecording(slot) {
    if (!this.isMicrophoneActive()) throw new Error('Start mikrofonen først.');
    if (!window.MediaRecorder) throw new Error('Mikrofonopptak støttes ikke.');
    if (this.micSampleRecorder?.state === 'recording') throw new Error('Et sampleopptak er allerede aktivt.');
    const candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
    const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type));
    this.micRecordingChunks = [];
    this.micRecordingSlot = slot;
    this.micSampleRecorder = new MediaRecorder(this.micRecordDestination.stream, mimeType ? { mimeType } : undefined);
    this.micSampleRecorder.addEventListener('dataavailable', (event) => { if (event.data.size) this.micRecordingChunks.push(event.data); });
    this.micSampleRecorder.start(250);
  }

  stopMicSampleRecording() {
    return new Promise((resolve, reject) => {
      if (!this.micSampleRecorder || this.micSampleRecorder.state !== 'recording') { reject(new Error('Ingen aktiv mic-innspilling.')); return; }
      const recorder = this.micSampleRecorder;
      const slot = this.micRecordingSlot;
      recorder.addEventListener('stop', async () => {
        try {
          const blob = new Blob(this.micRecordingChunks, { type: recorder.mimeType || 'audio/webm' });
          Object.defineProperty(blob, 'name', { value: `Mic ${slot} ${new Date().toLocaleTimeString('no-NO')}` });
          const metadata = await this.loadSampleBlob(slot, blob);
          resolve({ slot, blob, metadata });
        } catch (error) { reject(error); }
        this.micSampleRecorder = null;
      }, { once: true });
      recorder.stop();
    });
  }

  cancelMicSampleRecording() {
    if (this.micSampleRecorder?.state === 'recording') this.micSampleRecorder.stop();
    this.micSampleRecorder = null;
    this.micRecordingChunks = [];
  }

  getWaveformData(target) { if (!this.analyser) return null; this.analyser.getByteTimeDomainData(target); return target; }

  getChannelLevel(name) {
    const analyser = this.channels?.[name]?.analyser;
    if (!analyser) return -Infinity;
    if (!this.levelBuffers.has(name)) this.levelBuffers.set(name, new Uint8Array(analyser.fftSize));
    const data = this.levelBuffers.get(name);
    analyser.getByteTimeDomainData(data);
    return this.getLevel(data);
  }

  getLevel(data) {
    if (!data) return -Infinity;
    let sum = 0;
    for (const value of data) { const normalized = (value - 128) / 128; sum += normalized * normalized; }
    const rms = Math.sqrt(sum / data.length);
    return rms > 0 ? 20 * Math.log10(rms) : -Infinity;
  }

  panic() {
    if (!this.context) return;
    const now = this.context.currentTime;
    this.cancelSequencerSchedule();
    this.noteOff(undefined, true);
    this.closeEnvelope(now, 0.01);
    this.noiseVca.gain.cancelScheduledValues(now);
    this.noiseVca.gain.setTargetAtTime(EPSILON, now, 0.004);
    for (const oscillator of [...this.voices, ...this.kickVoices]) {
      try { oscillator.stop(now + 0.02); } catch (_error) { /* stopped */ }
    }
    this.stopSample('A');
    this.stopSample('B');
    this.stopAllPads();
    this.stopSupportPreview();
    this.stopRecordingPreview();
  }

  startSupportRecordingAnalysis(stream) {
    this.stopSupportRecordingAnalysis();
    if (!this.context || !stream) throw new Error('Opptakssignalet kunne ikke analyseres.');
    const source = this.context.createMediaStreamSource(stream);
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.18;
    this.supportRecordingAnalysisSource = source;
    this.supportRecordingAnalyser = analyser;
    try {
      source.connect(analyser);
    } catch (error) {
      this.stopSupportRecordingAnalysis();
      throw error;
    }
  }

  stopSupportRecordingAnalysis() {
    try { this.supportRecordingAnalysisSource?.disconnect(); } catch (_error) { /* Already disconnected */ }
    try { this.supportRecordingAnalyser?.disconnect(); } catch (_error) { /* Already disconnected */ }
    this.supportRecordingAnalysisSource = null;
    this.supportRecordingAnalyser = null;
  }

  getSupportRecordingAnalysisSize() {
    return this.supportRecordingAnalyser?.fftSize || 0;
  }

  readSupportRecordingWaveform(target) {
    const analyser = this.supportRecordingAnalyser;
    if (!analyser || !(target instanceof Float32Array) || target.length < analyser.fftSize) return false;
    analyser.getFloatTimeDomainData(target);
    return true;
  }

  async startSupportRecording(source) {
    if (!this.context) throw new Error('Start lydmotoren først.');
    if (!window.MediaRecorder) throw new Error('Opptak støttes ikke av nettleseren.');
    if (this.supportRecorder?.state === 'recording') throw new Error('Et opptak er allerede aktivt.');
    if (!['microphone', 'master'].includes(source)) throw new Error('Velg en gyldig lydkilde.');
    if (source === 'microphone') await this.startMicrophone({ consumer: 'supportRecorder' });
    const stream = source === 'microphone' ? this.micStream : this.recordDestination.stream;
    const candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
    const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type));
    this.supportRecordingChunks = [];
    this.supportRecordingSource = source;
    try {
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      this.startSupportRecordingAnalysis(stream);
      this.supportRecorder = recorder;
      recorder.addEventListener('dataavailable', (event) => {
        if (this.supportRecorder === recorder && event.data.size) this.supportRecordingChunks.push(event.data);
      });
      recorder.start(250);
    } catch (error) {
      this.supportRecorder = null;
      this.supportRecordingChunks = [];
      this.supportRecordingSource = '';
      this.stopSupportRecordingAnalysis();
      if (source === 'microphone') this.stopMicrophone({ consumer: 'supportRecorder' });
      throw error;
    }
  }

  stopSupportRecording() {
    return new Promise((resolve, reject) => {
      const recorder = this.supportRecorder;
      if (!recorder || recorder.state !== 'recording') { reject(new Error('Ingen aktiv innspilling.')); return; }
      const source = this.supportRecordingSource;
      recorder.addEventListener('stop', async () => {
        try {
          const blob = new Blob(this.supportRecordingChunks, { type: recorder.mimeType || 'audio/webm' });
          const buffer = await this.context.decodeAudioData(await blob.arrayBuffer());
          resolve({ blob, buffer, duration: buffer.duration, source });
        } catch (_error) {
          reject(new Error('Opptaket kunne ikke dekodes på denne enheten. Prøv et kortere opptak.'));
        } finally {
          if (this.supportRecorder === recorder) this.supportRecorder = null;
          this.supportRecordingChunks = [];
          this.supportRecordingSource = '';
          this.stopSupportRecordingAnalysis();
          if (source === 'microphone') this.stopMicrophone({ consumer: 'supportRecorder' });
        }
      }, { once: true });
      try {
        recorder.stop();
        this.stopSupportRecordingAnalysis();
      } catch (error) {
        if (this.supportRecorder === recorder) this.supportRecorder = null;
        this.supportRecordingChunks = [];
        this.supportRecordingSource = '';
        this.stopSupportRecordingAnalysis();
        if (source === 'microphone') this.stopMicrophone({ consumer: 'supportRecorder' });
        reject(error);
      }
    });
  }

  cancelSupportRecording() {
    const recorder = this.supportRecorder;
    const source = this.supportRecordingSource;
    if (recorder?.state === 'recording') {
      try { recorder.stop(); } catch (_error) { /* Already stopped */ }
    }
    this.supportRecorder = null;
    this.supportRecordingChunks = [];
    this.supportRecordingSource = '';
    this.stopSupportRecordingAnalysis();
    if (source === 'microphone') this.stopMicrophone({ consumer: 'supportRecorder' });
    this.stopSupportPreview();
  }

  isSupportRecordingActive() { return this.supportRecorder?.state === 'recording'; }

  createRecordingSelection(audioBuffer, startSeconds, endSeconds) {
    return createWavSelection(audioBuffer, startSeconds, endSeconds);
  }

  getRecordingWaveform(audioBuffer, bins = 256) { return calculateBufferWaveform(audioBuffer, bins); }

  async prepareSupportPlayback() {
    if (!this.context) throw new Error('Start lydmotoren først.');
    setNavigatorAudioSessionType(this.isMicrophoneActive() ? 'play-and-record' : 'playback');
    if (this.context.state && this.context.state !== 'running') {
      try {
        await this.context.resume();
      } catch (_error) {
        throw new Error('Lydmotoren kunne ikke gjenopptas. Prøv å trykke på Start lyd og lytt på nytt.');
      }
    }
    if (this.context.state && this.context.state !== 'running') {
      throw new Error('Lydmotoren er fortsatt satt på pause. Prøv å trykke på Start lyd og lytt på nytt.');
    }
  }

  async playRecordingRange(audioBuffer, startSeconds, endSeconds) {
    if (!this.context) throw new Error('Start lydmotoren først.');
    if (!audioBuffer || !(Number(audioBuffer.duration) > 0) || !(Number(audioBuffer.sampleRate) > 0)) {
      throw new Error('Opptaket mangler gyldige lyddata.');
    }
    const selection = normalizeSampleSelection(audioBuffer.duration, startSeconds, endSeconds, 1 / audioBuffer.sampleRate);
    const duration = selection.end - selection.start;
    if (!(duration > 0)) throw new Error('Velg et område med positiv varighet.');
    const request = ++this.supportPreviewRequest;
    await this.prepareSupportPlayback();
    if (request !== this.supportPreviewRequest) return { started: false, reason: 'cancelled' };
    this.stopSupportPreviewSource();
    let source;
    try {
      source = new AudioBufferSourceNode(this.context, { buffer: audioBuffer });
      source.connect(this.masterInput);
      source.start(0, selection.start, duration);
    } catch (_error) {
      try { source?.disconnect(); } catch (_disconnectError) { /* Never connected */ }
      throw new Error('Det valgte opptaksområdet kunne ikke startes.');
    }
    this.supportPreviewSource = source;
    source.addEventListener('ended', () => {
      if (this.supportPreviewSource === source) this.supportPreviewSource = null;
      try { source.disconnect(); } catch (_error) { /* Already disconnected */ }
    }, { once: true });
    return { started: true, start: selection.start, end: selection.end, duration };
  }

  stopSupportPreviewSource() {
    const source = this.supportPreviewSource;
    if (source) { try { source.stop(); } catch (_error) { /* Already stopped */ } }
    this.supportPreviewSource = null;
  }

  stopSupportPreview() {
    this.supportPreviewRequest += 1;
    this.stopSupportPreviewSource();
  }

  async startRecording() {
    if (!this.context) throw new Error('Start lydmotoren først.');
    if (!window.MediaRecorder) throw new Error('Opptak støttes ikke av nettleseren.');
    const candidates = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
    const mimeType = candidates.find((type) => MediaRecorder.isTypeSupported(type));
    this.recordingChunks = [];
    this.mediaRecorder = new MediaRecorder(this.recordDestination.stream, mimeType ? { mimeType } : undefined);
    this.mediaRecorder.addEventListener('dataavailable', (event) => { if (event.data.size) this.recordingChunks.push(event.data); });
    this.mediaRecorder.start(250);
  }

  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') { reject(new Error('Ingen aktiv innspilling.')); return; }
      this.mediaRecorder.addEventListener('stop', () => {
        this.recordingBlob = new Blob(this.recordingChunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
        if (this.recordingUrl) URL.revokeObjectURL(this.recordingUrl);
        this.recordingUrl = URL.createObjectURL(this.recordingBlob);
        resolve(this.recordingBlob);
      }, { once: true });
      this.mediaRecorder.stop();
    });
  }

  playRecording() {
    if (!this.recordingUrl) return;
    this.stopRecordingPreview();
    this.recordingPreview = new Audio(this.recordingUrl);
    this.recordingPreview.addEventListener('ended', () => { this.recordingPreview = null; }, { once: true });
    this.recordingPreview.play();
  }
  stopRecordingPreview() {
    this.recordingPreview?.pause();
    this.recordingPreview = null;
  }
  downloadRecording() { if (this.recordingBlob) this.downloadBlob(this.recordingBlob, `analog-synth-opptak.${this.recordingBlob.type.includes('mp4') ? 'm4a' : 'webm'}`); }
  async downloadRecordingAsWav() {
    if (!this.recordingBlob || !this.context) throw new Error('Ta opp lyd først.');
    this.downloadBlob(encodeWave(await this.context.decodeAudioData(await this.recordingBlob.arrayBuffer())), 'analog-synth-opptak.wav');
  }
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
