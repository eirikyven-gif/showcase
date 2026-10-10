import { DEFAULT_PATCH_ROUTES, sanitizePatchRoutes } from './patch-router.js?build=2026-10-10.1';

export const APP_VERSION = '0.15.1';
export const STORAGE_KEY = 'analog-synthesizer:presets:v1';
export const SESSION_KEY = 'analog-synthesizer:session:v2';
export const SAMPLE_SLOTS = Object.freeze(['A', 'B']);
export const PAD_COUNT = 12;
export const PAD_PARAMETER_DEFINITIONS = Object.freeze([
  { key: 'rate', label: 'Pitch / fart', min: 0.5, max: 2, step: 0.01, unit: '×' },
  { key: 'gain', label: 'Volum', min: 0, max: 1.25, step: 0.01, unit: '', display: 'percent125' },
  { key: 'pan', label: 'Pan', min: -1, max: 1, step: 0.01, unit: '' },
  { key: 'tone', label: 'Tone', min: 300, max: 16000, step: 1, unit: ' Hz', scale: 'log' },
  { key: 'send', label: 'Delay-send', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
]);
const PAD_PARAMETER_DEFAULTS = Object.freeze({
  rate: 1,
  gain: 1,
  pan: 0,
  tone: 14000,
  send: 0.08,
});
const padParameterByProperty = new Map(PAD_PARAMETER_DEFINITIONS.map((definition) => [definition.key, definition]));

export function createPadParameterKey(index, property) {
  const padIndex = Number(index);
  if (!Number.isInteger(padIndex) || padIndex < 0 || padIndex >= PAD_COUNT || !padParameterByProperty.has(property)) {
    throw new Error('Ugyldig padparameter.');
  }
  return `pad.${padIndex}.${property}`;
}

export function parsePadParameterKey(key) {
  const match = /^pad\.(\d+)\.(rate|gain|pan|tone|send)$/.exec(String(key || ''));
  if (!match) return null;
  const index = Number(match[1]);
  if (index < 0 || index >= PAD_COUNT) return null;
  return { index, property: match[2] };
}
export const MIXER_CHANNEL_KEYS = Object.freeze([
  'synthGain',
  'noiseGain',
  'kickGain',
  'micGain',
  'sampleAGain',
  'sampleBGain',
  'padGain',
]);

export const MODULE_DEFINITIONS = Object.freeze([
  { id: 'vco', label: 'VCO', disableable: true },
  { id: 'noise', label: 'Noise', disableable: true },
  { id: 'sampleHold', label: 'Sample & Hold', disableable: true },
  { id: 'wavefolder', label: 'Wavefolder', disableable: true },
  { id: 'filter', label: 'Filter', disableable: true },
  { id: 'envelope', label: 'ADSR / VCA', disableable: true },
  { id: 'lfo', label: 'LFO', disableable: true },
  { id: 'kick', label: 'Kick', disableable: true },
  { id: 'sequencer', label: 'Sequencer', disableable: true },
  { id: 'microphone', label: 'Mikrofon', disableable: true },
  { id: 'voiceFx', label: 'Voice FX', disableable: true },
  { id: 'sampleA', label: 'Sample A', disableable: true },
  { id: 'sampleB', label: 'Sample B', disableable: true },
  { id: 'padSampler', label: 'Pad Sampler', disableable: true },
  { id: 'mixer', label: 'Mikser', disableable: false },
  { id: 'delay', label: 'Delay', disableable: true },
  { id: 'master', label: 'Master / opptak', disableable: false },
  { id: 'scope', label: 'Scope', disableable: false },
  { id: 'keyboard', label: 'Keyboard', disableable: false, visible: false },
]);

export const DEFAULT_MODULE_LAYOUT = Object.freeze(MODULE_DEFINITIONS.map((module, order) => ({
  id: module.id,
  order,
  visible: module.visible !== false,
  enabled: true,
})));

export function isModuleEnabled(state, id) {
  return state?.moduleLayout?.find((module) => module.id === id)?.enabled !== false;
}

export function applyStepSelection(step, selectedForEditing = false) {
  if (!step || typeof step !== 'object') return 'ignored';
  if (!step.active) {
    step.active = true;
    return 'activated';
  }
  if (selectedForEditing) {
    step.active = false;
    return 'deactivated';
  }
  return 'edit';
}

export function bindStepButtonSelection(button, {
  step,
  index,
  kind,
  steps,
  isMultiSelect,
  getSelectedIndexes,
  setSelectedIndexes,
  updateButton,
  renderEditor,
  persist,
  onSelectionChange,
}) {
  button.addEventListener('click', () => {
    const selectedIndexes = new Set(getSelectedIndexes());
    let action;
    let stateChanged = false;
    if (isMultiSelect()) {
      if (selectedIndexes.has(index)) {
        selectedIndexes.delete(index);
        action = 'deselected';
      } else {
        selectedIndexes.add(index);
        action = 'selected';
      }
    } else {
      action = applyStepSelection(step, selectedIndexes.has(index));
      selectedIndexes.clear();
      if (action === 'edit') selectedIndexes.add(index);
      stateChanged = action === 'activated' || action === 'deactivated';
    }
    setSelectedIndexes(selectedIndexes);

    const container = button.parentElement;
    if (!container) throw new Error('Sequencertrinnet må være montert før det kan velges.');
    for (const candidate of container.querySelectorAll('.step')) {
      const candidateIndex = Number(candidate.dataset.step);
      updateButton(candidate, steps[candidateIndex], candidateIndex, selectedIndexes.has(candidateIndex));
    }

    renderEditor(kind);
    onSelectionChange?.(action, selectedIndexes);
    if (stateChanged) persist();
  });
}

export const voicePresets = Object.freeze({
  Clean: { micPitch: 0, micRingRate: 0, micRingMix: 0, micDrive: 0.05, micTone: 10000, micDelay: 0.04, micWet: 0.08 },
  Robot: { micPitch: 0, micRingRate: 38, micRingMix: 0.88, micDrive: 0.32, micTone: 5200, micDelay: 0.12, micWet: 0.86 },
  Monster: { micPitch: -8, micRingRate: 18, micRingMix: 0.2, micDrive: 0.58, micTone: 2400, micDelay: 0.2, micWet: 0.92 },
  Chipmunk: { micPitch: 7, micRingRate: 0, micRingMix: 0.04, micDrive: 0.12, micTone: 12000, micDelay: 0.08, micWet: 0.9 },
  Radio: { micPitch: 0, micRingRate: 0, micRingMix: 0, micDrive: 0.38, micTone: 3200, micDelay: 0.05, micWet: 0.72 },
  'Broken circuit': { micPitch: -3, micRingRate: 73, micRingMix: 0.72, micDrive: 0.82, micTone: 6800, micDelay: 0.34, micWet: 0.96 },
});

export const parameterGroups = {
  vco: [
    { key: 'pitch', label: 'Pitch', min: -24, max: 24, step: 1, unit: ' st' },
    { key: 'fine', label: 'Finstemming', min: -100, max: 100, step: 1, unit: ' cent' },
    { key: 'pulseWidth', label: 'Pulsbredde', min: 10, max: 90, step: 1, unit: '%' },
    { key: 'drift', label: 'Analog drift', min: 0, max: 30, step: 1, unit: ' cent' },
    { key: 'oscLevel', label: 'VCO-nivå', min: 0, max: 1.5, step: 0.01, unit: '', display: 'percent' },
  ],
  noise: [
    { key: 'noiseLevel', label: 'Noise-nivå', min: 0, max: 2.5, step: 0.01, unit: '', display: 'percent' },
    { key: 'noiseTone', label: 'Tone', min: 120, max: 16000, step: 1, unit: ' Hz', scale: 'log' },
    { key: 'noiseWidth', label: 'Stereo width', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  sampleHold: [
    { key: 'sampleHoldRate', label: 'S&H-rate', min: 0.25, max: 16, step: 0.25, unit: ' Hz' },
    { key: 'sampleHoldDepth', label: 'S&H-dybde', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  wavefolder: [
    { key: 'fold', label: 'Wavefold', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
    { key: 'symmetry', label: 'Symmetri', min: -1, max: 1, step: 0.01, unit: '' },
  ],
  filter: [
    { key: 'cutoff', label: 'Cutoff', min: 40, max: 16000, step: 1, unit: ' Hz', scale: 'log' },
    { key: 'resonance', label: 'Resonans', min: 0.1, max: 18, step: 0.1, unit: '' },
    { key: 'filterDrive', label: 'Filter drive', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  envelope: [
    { key: 'attack', label: 'Attack', min: 0.005, max: 2.5, step: 0.005, unit: ' s' },
    { key: 'decay', label: 'Decay', min: 0.01, max: 3, step: 0.01, unit: ' s' },
    { key: 'sustain', label: 'Sustain', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
    { key: 'release', label: 'Release', min: 0.01, max: 4, step: 0.01, unit: ' s' },
  ],
  lfo: [
    { key: 'lfoRate', label: 'LFO-rate', min: 0.05, max: 20, step: 0.05, unit: ' Hz', scale: 'log' },
    { key: 'lfoDepth', label: 'LFO-dybde', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  kick: [
    { key: 'kickPitch', label: 'Pitch', min: 35, max: 110, step: 1, unit: ' Hz' },
    { key: 'kickDecay', label: 'Decay', min: 0.08, max: 1.2, step: 0.01, unit: ' s' },
    { key: 'kickSweep', label: 'Pitch-envelope', min: 1, max: 8, step: 0.1, unit: '×' },
    { key: 'kickTone', label: 'Tone', min: 80, max: 4000, step: 1, unit: ' Hz', scale: 'log' },
    { key: 'kickDrive', label: 'Drive', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  transport: [
    { key: 'tempo', label: 'Tempo', min: 50, max: 180, step: 1, unit: ' BPM' },
    { key: 'swing', label: 'Swing', min: 0, max: 0.45, step: 0.01, unit: '', display: 'percent' },
  ],
  sequence: [
    { key: 'gate', label: 'Gate', min: 0.1, max: 0.95, step: 0.01, unit: '', display: 'percent' },
  ],
  microphone: [
    { key: 'micInput', label: 'Input', min: 0, max: 2, step: 0.01, unit: '', display: 'percent2' },
    { key: 'micGate', label: 'Noise gate', min: -70, max: -20, step: 1, unit: ' dB' },
    { key: 'micGain', label: 'Volum', min: 0, max: 1.25, step: 0.01, unit: '', display: 'percent125' },
    { key: 'micPan', label: 'Pan', min: -1, max: 1, step: 0.01, unit: '' },
  ],
  voiceFx: [
    { key: 'micPitch', label: 'Pitch shift', min: -12, max: 12, step: 1, unit: ' st' },
    { key: 'micRingRate', label: 'Robotfrekvens', min: 0, max: 120, step: 1, unit: ' Hz' },
    { key: 'micRingMix', label: 'Robotmiks', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
    { key: 'micDrive', label: 'Drive', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
    { key: 'micTone', label: 'Tone', min: 300, max: 14000, step: 1, unit: ' Hz', scale: 'log' },
    { key: 'micDelay', label: 'Delay-send', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
    { key: 'micWet', label: 'FX wet/dry', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  sampleA: [
    { key: 'sampleAStart', label: 'Start', min: 0, max: 0.95, step: 0.01, unit: '', display: 'percent', editorOnly: true },
    { key: 'sampleAEnd', label: 'Slutt', min: 0.05, max: 1, step: 0.01, unit: '', display: 'percent', editorOnly: true },
    { key: 'sampleARate', label: 'Pitch / fart', min: 0.5, max: 2, step: 0.01, unit: '×' },
    { key: 'sampleAGain', label: 'Volum', min: 0, max: 1.25, step: 0.01, unit: '', display: 'percent125' },
    { key: 'sampleAPan', label: 'Pan', min: -1, max: 1, step: 0.01, unit: '' },
    { key: 'sampleATone', label: 'Tone', min: 300, max: 16000, step: 1, unit: ' Hz', scale: 'log' },
    { key: 'sampleASend', label: 'Delay-send', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  sampleB: [
    { key: 'sampleBStart', label: 'Start', min: 0, max: 0.95, step: 0.01, unit: '', display: 'percent', editorOnly: true },
    { key: 'sampleBEnd', label: 'Slutt', min: 0.05, max: 1, step: 0.01, unit: '', display: 'percent', editorOnly: true },
    { key: 'sampleBRate', label: 'Pitch / fart', min: 0.5, max: 2, step: 0.01, unit: '×' },
    { key: 'sampleBGain', label: 'Volum', min: 0, max: 1.25, step: 0.01, unit: '', display: 'percent125' },
    { key: 'sampleBPan', label: 'Pan', min: -1, max: 1, step: 0.01, unit: '' },
    { key: 'sampleBTone', label: 'Tone', min: 300, max: 16000, step: 1, unit: ' Hz', scale: 'log' },
    { key: 'sampleBSend', label: 'Delay-send', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  padSampler: [
    { key: 'padGain', label: 'Volum', min: 0, max: 1.25, step: 0.01, unit: '', display: 'percent125' },
  ],
  mixer: [
    { key: 'synthGain', label: 'VCO i mikser', min: 0, max: 2, step: 0.01, unit: '', display: 'percent' },
    { key: 'noiseGain', label: 'Noise i mikser', min: 0, max: 2, step: 0.01, unit: '', display: 'percent' },
    { key: 'kickGain', label: 'Kick i mikser', min: 0, max: 2, step: 0.01, unit: '', display: 'percent' },
    { key: 'synthPan', label: 'VCO pan', min: -1, max: 1, step: 0.01, unit: '' },
    { key: 'synthSend', label: 'VCO delay', min: 0, max: 1, step: 0.01, unit: '', display: 'percent' },
  ],
  delay: [
    { key: 'delayTime', label: 'Delaytid', min: 0.05, max: 0.8, step: 0.01, unit: ' s' },
    { key: 'delayFeedback', label: 'Feedback', min: 0, max: 0.72, step: 0.01, unit: '', display: 'percent' },
  ],
  master: [
    { key: 'master', label: 'Master', min: 0, max: 1.25, step: 0.01, unit: '', display: 'percent' },
  ],
};

const emptySample = Object.freeze({ name: '', duration: 0, type: '', stored: false });
export function createEmptyPadMetadata(parameterDefaults = {}) {
  return {
    ...emptySample,
    mode: 'one-shot',
    ...PAD_PARAMETER_DEFAULTS,
    ...parameterDefaults,
  };
}
const initialNotes = [true, false, true, false, true, false, false, true, true, false, true, false, true, false, true, false];
const initialKicks = [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false];
const initialOffsets = [0, 3, 7, 10, 12, 10, 7, 3, 0, 3, 7, 10, 12, 15, 10, 7];

export function createSynthStep(index = 0, source = {}) {
  return {
    active: Boolean(source.active ?? initialNotes[index] ?? false),
    note: clamp(source.note ?? initialOffsets[index] ?? 0, -24, 24),
    velocity: clamp(source.velocity ?? 0.78, 0, 1),
    gate: clamp(source.gate ?? 1, 0.1, 1),
    ratchet: Math.round(clamp(source.ratchet ?? 1, 1, 4)),
    slide: Boolean(source.slide),
  };
}

export function createKickStep(index = 0, source = {}) {
  return {
    active: Boolean(source.active ?? initialKicks[index] ?? false),
    velocity: clamp(source.velocity ?? 0.95, 0, 1),
    pitch: clamp(source.pitch ?? 0, -24, 24),
    decay: clamp(source.decay ?? 1, 0.25, 2),
    ratchet: Math.round(clamp(source.ratchet ?? 1, 1, 4)),
  };
}

export const defaultPreset = Object.freeze({
  version: 8,
  name: 'Init',
  waveform: 'sawtooth', noiseColor: 'white', filterType: 'lowpass', lfoTarget: 'filter',
  pitch: 0, fine: 0, pulseWidth: 50, drift: 5, oscLevel: 0.78, noiseLevel: 0.1,
  noiseTone: 12000, noiseWidth: 0.45,
  sampleHoldRate: 2, sampleHoldDepth: 0, fold: 0.1, symmetry: 0, cutoff: 5200,
  resonance: 1.5, filterDrive: 0.08, attack: 0.01, decay: 0.22, sustain: 0.7,
  release: 0.35, lfoRate: 2.5, lfoDepth: 0.08, kickPitch: 54, kickDecay: 0.36,
  kickSweep: 4.5, kickTone: 1600, kickDrive: 0.34, kickSteps: 16, sequenceSteps: 16, tempo: 112, swing: 0.08,
  gate: 0.62, master: 0.78,
  voicePreset: 'Clean', micInput: 1, micGate: -52, micPitch: 0, micRingRate: 0,
  micRingMix: 0, micDrive: 0.05, micTone: 10000, micDelay: 0.04, micWet: 0.08,
  micGain: 0.85, micPan: 0, micMonitoring: false, micMute: false, micSolo: false,
  sampleAStart: 0, sampleAEnd: 1, sampleARate: 1, sampleAGain: 0.8, sampleAPan: -0.12,
  sampleATone: 16000, sampleASend: 0.05, sampleALoop: false, sampleAReverse: false,
  sampleAMute: false, sampleASolo: false,
  sampleBStart: 0, sampleBEnd: 1, sampleBRate: 1, sampleBGain: 0.8, sampleBPan: 0.12,
  sampleBTone: 16000, sampleBSend: 0.05, sampleBLoop: false, sampleBReverse: false,
  sampleBMute: false, sampleBSolo: false,
  padGain: 0.8, padMute: false, padSolo: false,
  synthGain: 1, noiseGain: 1, kickGain: 0.9, synthPan: 0, synthSend: 0.04,
  synthMute: false, synthSolo: false, noiseMute: false, noiseSolo: false, noiseDrone: false,
  kickMute: false, kickSolo: false,
  delayTime: 0.28, delayFeedback: 0.32,
  samples: { A: emptySample, B: emptySample },
  pads: Array.from({ length: PAD_COUNT }, createEmptyPadMetadata),
  moduleLayout: DEFAULT_MODULE_LAYOUT,
  patchRoutes: DEFAULT_PATCH_ROUTES,
  synthSteps: Array.from({ length: 16 }, (_, index) => createSynthStep(index)),
  kickSequence: Array.from({ length: 16 }, (_, index) => createKickStep(index)),
});

export function clonePreset(preset = defaultPreset) { return JSON.parse(JSON.stringify(preset)); }
export function createInitSession() { return clonePreset(defaultPreset); }
export function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value))); }
export function midiNoteToFrequency(note) { return 440 * (2 ** ((Number(note) - 69) / 12)); }

export function sanitizePreset(input) {
  const next = clonePreset(defaultPreset);
  if (!input || typeof input !== 'object') return next;
  for (const definitions of Object.values(parameterGroups)) {
    for (const definition of definitions) {
      if (Number.isFinite(Number(input[definition.key]))) next[definition.key] = clamp(input[definition.key], definition.min, definition.max);
    }
  }
  if (['sine', 'triangle', 'sawtooth', 'pulse'].includes(input.waveform)) next.waveform = input.waveform;
  if (['white', 'pink', 'brown'].includes(input.noiseColor)) next.noiseColor = input.noiseColor;
  if (['lowpass', 'bandpass', 'highpass'].includes(input.filterType)) next.filterType = input.filterType;
  if (['pitch', 'filter', 'fold'].includes(input.lfoTarget)) next.lfoTarget = input.lfoTarget;
  if (Object.hasOwn(voicePresets, input.voicePreset)) next.voicePreset = input.voicePreset;
  if (typeof input.name === 'string') next.name = input.name.slice(0, 48) || 'Uten navn';
  next.synthSteps = Array.from({ length: 16 }, (_, index) => {
    const source = Array.isArray(input.synthSteps)
      ? input.synthSteps[index]
      : { active: input.notes?.[index], note: input.stepNotes?.[index] };
    return createSynthStep(index, source && typeof source === 'object' ? source : {});
  });
  next.kickSequence = Array.from({ length: 16 }, (_, index) => {
    const source = Array.isArray(input.kickSequence) ? input.kickSequence[index] : { active: input.kicks?.[index] };
    return createKickStep(index, source && typeof source === 'object' ? source : {});
  });
  for (const key of ['micMonitoring', 'micMute', 'micSolo', 'sampleALoop', 'sampleAReverse', 'sampleAMute', 'sampleASolo', 'sampleBLoop', 'sampleBReverse', 'sampleBMute', 'sampleBSolo', 'padMute', 'padSolo', 'synthMute', 'synthSolo', 'noiseMute', 'noiseSolo', 'noiseDrone', 'kickMute', 'kickSolo']) next[key] = Boolean(input[key]);
  for (const slot of SAMPLE_SLOTS) {
    const sample = input.samples?.[slot];
    if (sample && typeof sample === 'object') {
      next.samples[slot] = {
        name: typeof sample.name === 'string' ? sample.name.slice(0, 120) : '',
        duration: Number.isFinite(Number(sample.duration)) ? Math.max(0, Number(sample.duration)) : 0,
        type: typeof sample.type === 'string' ? sample.type.slice(0, 80) : '',
        stored: Boolean(sample.stored),
      };
    }
  }
  const legacyPadParameters = {
    pan: Number.isFinite(Number(input.padPan)) ? clamp(input.padPan, -1, 1) : PAD_PARAMETER_DEFAULTS.pan,
    tone: Number.isFinite(Number(input.padTone)) ? clamp(input.padTone, 300, 16000) : PAD_PARAMETER_DEFAULTS.tone,
    send: Number.isFinite(Number(input.padSend)) ? clamp(input.padSend, 0, 1) : PAD_PARAMETER_DEFAULTS.send,
  };
  next.pads = Array.from({ length: PAD_COUNT }, (_, index) => {
    const pad = input.pads?.[index];
    if (!pad || typeof pad !== 'object') return createEmptyPadMetadata(legacyPadParameters);
    return {
      name: typeof pad.name === 'string' ? pad.name.slice(0, 120) : '',
      duration: Number.isFinite(Number(pad.duration)) ? Math.max(0, Number(pad.duration)) : 0,
      type: typeof pad.type === 'string' ? pad.type.slice(0, 80) : '',
      stored: Boolean(pad.stored),
      mode: pad.mode === 'loop-hold' ? 'loop-hold' : 'one-shot',
      rate: Number.isFinite(Number(pad.rate))
        ? clamp(pad.rate, padParameterByProperty.get('rate').min, padParameterByProperty.get('rate').max)
        : PAD_PARAMETER_DEFAULTS.rate,
      gain: Number.isFinite(Number(pad.gain))
        ? clamp(pad.gain, padParameterByProperty.get('gain').min, padParameterByProperty.get('gain').max)
        : PAD_PARAMETER_DEFAULTS.gain,
      pan: Number.isFinite(Number(pad.pan))
        ? clamp(pad.pan, padParameterByProperty.get('pan').min, padParameterByProperty.get('pan').max)
        : legacyPadParameters.pan,
      tone: Number.isFinite(Number(pad.tone))
        ? clamp(pad.tone, padParameterByProperty.get('tone').min, padParameterByProperty.get('tone').max)
        : legacyPadParameters.tone,
      send: Number.isFinite(Number(pad.send))
        ? clamp(pad.send, padParameterByProperty.get('send').min, padParameterByProperty.get('send').max)
        : legacyPadParameters.send,
    };
  });
  for (const key of ['kickSteps', 'sequenceSteps']) {
    if ([4, 8, 16].includes(Number(input[key]))) next[key] = Number(input[key]);
  }
  const incomingLayout = Array.isArray(input.moduleLayout) ? input.moduleLayout : [];
  const byId = new Map(incomingLayout.map((module) => [module?.id, module]));
  next.moduleLayout = MODULE_DEFINITIONS.map((definition, fallbackOrder) => {
    const stored = byId.get(definition.id);
    return {
      id: definition.id,
      order: Number.isFinite(Number(stored?.order)) ? Number(stored.order) : fallbackOrder,
      visible: stored ? Boolean(stored.visible) : definition.visible !== false,
      enabled: definition.disableable ? (stored ? Boolean(stored.enabled) : true) : true,
    };
  }).sort((a, b) => a.order - b.order).map((module, order) => ({ ...module, order }));
  const sourceStateByModule = {
    vco: ['synthSolo'], noise: ['noiseSolo', 'noiseDrone'], kick: ['kickSolo'],
    microphone: ['micSolo'], sampleA: ['sampleASolo'], sampleB: ['sampleBSolo'],
    padSampler: ['padSolo'],
  };
  for (const module of next.moduleLayout) {
    if (module.enabled && module.visible) continue;
    for (const key of sourceStateByModule[module.id] || []) next[key] = false;
  }
  next.patchRoutes = sanitizePatchRoutes(input.patchRoutes);
  next.version = 8;
  return next;
}

export function formatParameter(definition, value) {
  if (definition.display === 'percent') return `${Math.round(Number(value) * 100)}%`;
  if (definition.display === 'percent125') return `${Math.round((Number(value) / 1.25) * 125)}%`;
  if (definition.display === 'percent2') return `${Math.round((Number(value) / 2) * 200)}%`;
  if (definition.scale === 'log' && Number(value) >= 1000) return `${(Number(value) / 1000).toFixed(1)} kHz`;
  const decimals = definition.step < 0.1 ? 2 : definition.step < 1 ? 1 : 0;
  return `${Number(value).toFixed(decimals)}${definition.unit}`;
}

export function sliderToValue(definition, sliderValue) {
  if (definition.scale !== 'log') return Number(sliderValue);
  const ratio = Number(sliderValue) / 1000;
  return definition.min * ((definition.max / definition.min) ** ratio);
}

export function valueToSlider(definition, value) {
  if (definition.scale !== 'log') return Number(value);
  return 1000 * (Math.log(Number(value) / definition.min) / Math.log(definition.max / definition.min));
}
