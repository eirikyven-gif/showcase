import {
  APP_VERSION,
  DEFAULT_MODULE_LAYOUT,
  MODULE_DEFINITIONS,
  MIXER_CHANNEL_KEYS,
  PAD_COUNT,
  PAD_PARAMETER_DEFINITIONS,
  SAMPLE_SLOTS,
  SESSION_KEY,
  STORAGE_KEY,
  clonePreset,
  createEmptyPadMetadata,
  createInitSession,
  createPadParameterKey,
  createSynthStep,
  defaultPreset,
  formatParameter,
  isModuleEnabled,
  parameterGroups,
  parsePadParameterKey,
  sanitizePreset,
  sliderToValue,
  bindStepButtonSelection,
  valueToSlider,
  voicePresets,
} from './state.js?build=2026-10-10.1';
import {
  applyRelativeStepAdjustment,
  booleanSelectionState,
  canCopyStepSelection,
  createRelativeStepAdjustment,
  numericSelectionState,
  pruneStepSelection,
  runConfirmedStepAction,
  setSelectedBooleanValue,
  setSelectedNumericValue,
  sortedStepIndexes,
} from './sequencer-editor.js?build=2026-10-10.1';
import { AudioEngine, normalizeSampleSelection } from './audio-engine.js?build=2026-10-10.1';
import {
  createAudioPlaybackController,
  resolveSequencerResumeStep,
} from './audio-playback-controller.js?build=2026-10-10.1';
import {
  flatWaveformPath,
  masterWaveformPath,
  resolveMasterWaveformStatus,
  waveformLevel,
} from './master-waveform.js?build=2026-10-10.1';
import {
  appendRecordingWaveformFrame,
  createRecordingWaveformHistory,
  recordingWaveformPath,
  resetRecordingWaveformHistory,
} from './recording-waveform.js?build=2026-10-10.1';
import {
  deletePadSample,
  deleteSample,
  getPadSample,
  getSample,
  putPadSample,
  putSample,
} from './sample-store.js?build=2026-10-10.1';
import { ProjectSync } from './project-sync.js?build=2026-10-10.1';
import { createPadActivationController } from './pad-activation.js?build=2026-10-10.1';
import { LocalSampleLibrary, getLibraryLoadTargets, normalizeLibraryTargetSlot } from './local-sample-library.js?build=2026-10-10.1';
import { SharedRecordingLibrary } from './shared-recording-library.js?build=2026-10-10.1';
import { UpdateController } from './update-controller.js?build=2026-10-10.1';
import { resetLocalData } from './local-data.js';
import {
  AKAI_MIDIMIX_X2_PROFILE,
  CONTINUOUS_PARAMETERS,
  createMidiController,
} from './midi-controller.js?build=2026-10-10.1';

const $ = (selector) => document.querySelector(selector);
const engine = new AudioEngine();
let state = readSession();
const padActivationController = createPadActivationController({
  isLoopMode: (index) => state.pads[index]?.mode === 'loop-hold',
  isActive: (index) => engine.isPadActive(index),
  start: (index, velocity, isCurrent) => startPad(index, velocity, isCurrent),
  stop: (index) => stopPadPlayback(index, { cancelPending: false }),
});
let octave = 3;
let sequenceRunning = false;
let sequenceTimer = 0;
let nextStepTime = 0;
let currentStep = 0;
let sessionSaveTimer = 0;
let pendingSessionSave = false;
let audioApplyTimer = 0;
let toastTimer = 0;
let recording = false;
let samplesHydrated = false;
let sampleHydrationPromise = null;
let micRecordingSlot = '';
let editingModules = false;
let draggedModuleId = '';
const activePointers = new Map();
const activeKeys = new Map();
const renderedControls = new Map();
const scopeData = new Uint8Array(512);
const VISUAL_FRAME_INTERVAL = 1000 / 15;
const PLAYER_REDUCED_MOTION_FRAME_INTERVAL = 1000 / 4;
const SESSION_SAVE_DELAY = 180;
const AUDIO_APPLY_INTERVAL = 1000 / 30;
const SEQUENCER_TICK_MS = 30;
const SEQUENCER_LOOKAHEAD_SECONDS = 0.22;
const SEQUENCER_RECOVERY_MARGIN = 0.025;
const lastMeterValues = new Map();
const pendingAudioParameters = new Set();
const pendingVisualSteps = [];
let lastVisualFrame = 0;
let lastPlayerWaveformFrame = 0;
let sequencePausedForAudio = false;
let audioPlaybackController;
let audioPlaybackView;
let audioPlayerResizeObserver;
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let projectSync;
let sampleLibrary;
let sharedRecordingLibrary;
let updateController;
let midiController;
let libraryPreview;
let libraryPreviewUrl = '';
let sampleLibraryTargetSlot = '';
let sampleLibraryReturnTarget = null;
let sharedRecordingTargetSlot = '';
let selectedPadIndex = 0;
const activePadUi = new Set();
const heldPadPointers = new Map();
const heldPadKeys = new Set();
const heldMidiPadSources = new Map();
let multiSelectSteps = false;
let selectedSynthSteps = new Set();
let activeStepAdjustment = null;
let stepClipboard = null;
const focusedModuleIds = [];
const focusPlaceholders = new Map();
let focusReturnTarget = null;
let deferredInstallPrompt = null;
let sampleEditorDraft = null;
let sampleEditorReturnTarget = null;
let recorderDraft = null;
let recorderReturnTarget = null;
let recorderStartedAt = 0;
let recorderLimitTimer = 0;
let recorderClockTimer = 0;
let recorderStopping = false;
let recorderLiveAnimationFrame = 0;
let recorderLiveLastDraw = 0;
let recorderLiveSamples = new Float32Array(0);
const recorderLiveHistory = createRecordingWaveformHistory(192);
let panicResetting = false;
let sharedRecordingPreview = null;
let sharedRecordingPreviewUrl = '';
let midiDialogReturnTarget = null;
let midiLearnMessage = '';
let midiActivityTimer = 0;
let midiActivityPulseTimer = 0;
let pendingMidiActivity = null;
const activeMidiNotes = new Set();

const MAX_RECORDING_SECONDS = 120;
const MAX_RECORDING_BYTES = 25 * 1024 * 1024;
const RECORDER_LIVE_FRAME_INTERVAL = 1000 / 20;

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const COMPUTER_KEYS = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j', 'k'];
const MIXER_CHANNEL_LABELS = Object.freeze({
  synthGain: 'VCO-volum',
  noiseGain: 'Noise-volum',
  kickGain: 'Kick-volum',
  micGain: 'Mikrofonvolum',
  sampleAGain: 'Sample A-volum',
  sampleBGain: 'Sample B-volum',
  padGain: 'Pad Sampler-volum',
});
const MIDI_ACTION_TARGETS = Object.freeze([
  ...Array.from({ length: 16 }, (_, index) => ({
    value: `action:sequence-step:${index}`,
    label: `Sequencertrinn ${index + 1}`,
    target: { kind: 'action', action: 'sequence-step-toggle', index },
    mode: 'toggle',
  })),
  {
    value: 'action:sequencer-toggle',
    label: 'Sequencer start/stopp',
    target: { kind: 'action', action: 'sequencer-toggle' },
    mode: 'toggle',
  },
  {
    value: 'action:kick-trigger',
    label: 'Manuell Kick-trigger',
    target: { kind: 'action', action: 'kick-trigger' },
    mode: 'trigger',
  },
  ...Array.from({ length: PAD_COUNT }, (_, index) => ({
    value: `action:pad-trigger:${index}`,
    label: `Pad ${index + 1} trigger`,
    target: { kind: 'action', action: 'pad-trigger', index },
    mode: 'trigger',
  })),
]);
const MIDI_PARAMETER_BY_KEY = new Map(CONTINUOUS_PARAMETERS.map((definition) => [definition.key, definition]));

function readSession() {
  try { return sanitizePreset(JSON.parse(localStorage.getItem(SESSION_KEY))); } catch (_error) { return clonePreset(defaultPreset); }
}

function commitSession() {
  window.clearTimeout(sessionSaveTimer);
  sessionSaveTimer = 0;
  if (!pendingSessionSave) return;
  pendingSessionSave = false;
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch (_error) { /* Presets still work without session persistence */ }
  projectSync?.schedule(state);
}

function persistSession(immediate = false) {
  pendingSessionSave = true;
  window.clearTimeout(sessionSaveTimer);
  if (immediate) commitSession();
  else sessionSaveTimer = window.setTimeout(commitSession, SESSION_SAVE_DELAY);
}

function persistLocalSessionOnly() {
  window.clearTimeout(sessionSaveTimer);
  sessionSaveTimer = 0;
  pendingSessionSave = false;
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch (_error) { /* Active session still remains Init in memory */ }
}

function flushAudioParameters() {
  window.clearTimeout(audioApplyTimer);
  audioApplyTimer = 0;
  if (!pendingAudioParameters.size) return;
  const keys = [...pendingAudioParameters];
  pendingAudioParameters.clear();
  engine.updateParameters(keys, state);
}

function queueAudioParameter(key) {
  pendingAudioParameters.add(key);
  if (!audioApplyTimer) audioApplyTimer = window.setTimeout(flushAudioParameters, AUDIO_APPLY_INTERVAL);
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function setSyncStatus(message, active = false) {
  const status = $('#syncStatus');
  status.textContent = message;
  status.classList.toggle('active', active);
}

function initializeProjectSync() {
  projectSync = new ProjectSync({
    onState: async (savedState) => {
      const previousSamples = state.samples;
      const previousPads = state.pads;
      const next = sanitizePreset(savedState);
      for (const slot of SAMPLE_SLOTS) {
        if (engine.hasSample(slot) && !sampleMetadataMatches(next.samples[slot], previousSamples[slot])) engine.removeSample(slot);
      }
      for (let index = 0; index < PAD_COUNT; index += 1) {
        if (engine.hasPadSample(index) && !sampleMetadataMatches(next.pads[index], previousPads[index])) {
          cancelPadActivations(index);
          engine.removePadSample(index);
          activePadUi.delete(index);
        } else if (previousPads[index]?.mode === 'loop-hold' && next.pads[index]?.mode === 'one-shot') {
          stopPadPlayback(index);
        }
      }
      resetSequencerSelection({ render: false });
      state = next;
      if (!isModuleEnabled(state, 'padSampler')) stopAllPadPlayback();
      if (engine.context) await hydratePadSamples();
      syncControls();
      showToast('Lokalt oppsett er hentet');
    },
    onStatus: setSyncStatus,
    onError: (error) => showToast(error.message),
  });
  sampleLibrary = new LocalSampleLibrary();
  $('#projectId').value = projectSync.projectId;

  if (projectSync.projectId) {
    const initialSync = projectSync.pending ? projectSync.save(state) : projectSync.load();
    initialSync.catch((error) => projectSync.fail(error));
  }
}

function initializeSharedRecordingLibrary() {
  try { sharedRecordingLibrary = new SharedRecordingLibrary(); }
  catch (error) { sharedRecordingLibrary = null; window.setTimeout(() => showToast(error.message), 0); }
}

function renderAudioPlayback(view) {
  audioPlaybackView = view;
  const status = $('#audioStatus');
  status.textContent = view.topStatus;
  status.classList.toggle('active', view.running);
  const player = $('#audioPlayer');
  player.dataset.state = view.state;
  $('#audioPlayerState').textContent = view.playerTitle;
  $('#audioPlayerStatus').textContent = view.playerCopy;
  $('#audioPlayerWaveformStatus').textContent = view.waveformStatus;

  for (const id of ['audioToggle', 'playerAudioToggle']) {
    const button = $(`#${id}`);
    button.textContent = view.startLabel;
    button.disabled = view.startDisabled;
    button.setAttribute('aria-pressed', String(view.running));
    if (view.busy) button.setAttribute('aria-busy', 'true');
    else button.removeAttribute('aria-busy');
  }
  for (const id of ['audioStop', 'playerAudioStop']) {
    const button = $(`#${id}`);
    button.disabled = view.stopDisabled;
    if (view.state === 'stopping') button.setAttribute('aria-busy', 'true');
    else button.removeAttribute('aria-busy');
  }

  if (!view.waveformLive) {
    $('#audioPlayerWaveformPath').setAttribute('d', flatWaveformPath());
    lastPlayerWaveformFrame = 0;
  }
}

async function ensureAudio() {
  const started = await audioPlaybackController.start();
  if (!started) return false;
  try {
    if (!samplesHydrated) {
      if (!sampleHydrationPromise) {
        sampleHydrationPromise = hydrateSamples().finally(() => { sampleHydrationPromise = null; });
      }
      await sampleHydrationPromise;
    }
    requestMidi();
    return true;
  } catch (error) {
    showToast(error.message);
    return false;
  }
}

async function stopAudio() {
  return audioPlaybackController.stop();
}

function updateAudioPlayerOffset() {
  const player = $('#audioPlayer');
  const height = Math.ceil(player.getBoundingClientRect().height);
  document.documentElement.style.setProperty('--audio-player-offset', `${height + 16}px`);
}

function initializeAudioPlayback() {
  audioPlaybackController = createAudioPlaybackController({
    engine,
    getState: () => state,
    onPause: pauseSequencerForAudioLifecycle,
    onResume: resumeSequencerForAudioLifecycle,
    onChange: renderAudioPlayback,
    onError: (error) => showToast(error.message),
  });
  if ('ResizeObserver' in window) {
    audioPlayerResizeObserver = new ResizeObserver(updateAudioPlayerOffset);
    audioPlayerResizeObserver.observe($('#audioPlayer'));
  }
  window.addEventListener('resize', updateAudioPlayerOffset, { passive: true });
  requestAnimationFrame(updateAudioPlayerOffset);
}

function createSegmentButtons(container, options, stateKey, onChange) {
  container.replaceChildren();
  for (const option of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'segment-button';
    button.dataset.value = option.value;
    button.textContent = option.label;
    button.setAttribute('aria-pressed', String(state[stateKey] === option.value));
    button.classList.toggle('active', state[stateKey] === option.value);
    button.addEventListener('click', () => {
      state[stateKey] = option.value;
      for (const sibling of container.children) {
        const selected = sibling.dataset.value === String(option.value);
        sibling.classList.toggle('active', selected);
        sibling.setAttribute('aria-pressed', String(selected));
      }
      engine.applyState(state);
      persistSession();
      onChange?.(option.value);
    });
    container.append(button);
  }
}

function updateSliderVisual(input, definition, actualValue) {
  const sliderValue = valueToSlider(definition, actualValue);
  const min = Number(input.min);
  const max = Number(input.max);
  const fill = ((sliderValue - min) / (max - min)) * 100;
  input.style.setProperty('--fill', `${Math.max(0, Math.min(100, fill))}%`);
  input.closest('.control-row')?.style.setProperty('--fill', `${fill}%`);
}

function getStateParameterValue(key) {
  const padParameter = parsePadParameterKey(key);
  return padParameter
    ? state.pads[padParameter.index]?.[padParameter.property]
    : state[key];
}

function setStateParameterValue(key, value) {
  const padParameter = parsePadParameterKey(key);
  if (padParameter) state.pads[padParameter.index][padParameter.property] = value;
  else state[key] = value;
}

function getDefaultParameterValue(key) {
  const padParameter = parsePadParameterKey(key);
  return padParameter
    ? createEmptyPadMetadata()[padParameter.property]
    : defaultPreset[key];
}

function syncRenderedControls(key, value, origin = null) {
  for (const { input, output, definition } of renderedControls.get(key) || []) {
    if (input !== origin) input.value = String(definition.scale === 'log' ? valueToSlider(definition, value) : value);
    output.textContent = formatParameter(definition, value);
    updateSliderVisual(input, definition, value);
  }
}

function createSlider(definition, instanceId) {
  const row = document.createElement('div');
  row.className = 'control-row';
  const id = `control-${definition.key}-${instanceId}`;
  const label = document.createElement('label');
  label.htmlFor = id;
  label.textContent = definition.label;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'range';
  input.setAttribute('aria-label', definition.ariaLabel || definition.label);
  const currentValue = getStateParameterValue(definition.key);
  if (definition.scale === 'log') {
    input.min = '0';
    input.max = '1000';
    input.step = '1';
    input.value = String(valueToSlider(definition, currentValue));
  } else {
    input.min = String(definition.min);
    input.max = String(definition.max);
    input.step = String(definition.step);
    input.value = String(currentValue);
  }
  const output = document.createElement('output');
  output.htmlFor = id;
  output.textContent = formatParameter(definition, currentValue);
  input.addEventListener('input', () => {
    const actual = definition.scale === 'log' ? sliderToValue(definition, input.value) : Number(input.value);
    setStateParameterValue(definition.key, actual);
    syncRenderedControls(definition.key, actual, input);
    queueAudioParameter(definition.key);
    persistSession();
  });
  input.addEventListener('dblclick', () => {
    const fallback = getDefaultParameterValue(definition.key);
    setStateParameterValue(definition.key, fallback);
    syncRenderedControls(definition.key, fallback);
    queueAudioParameter(definition.key);
    persistSession();
  });
  row.append(label, input, output);
  if (!renderedControls.has(definition.key)) renderedControls.set(definition.key, new Set());
  renderedControls.get(definition.key).add({ input, output, definition });
  updateSliderVisual(input, definition, currentValue);
  return row;
}

function unregisterRenderedControls(container) {
  for (const [key, controls] of renderedControls) {
    for (const control of [...controls]) {
      if (container.contains(control.input)) controls.delete(control);
    }
    if (!controls.size) renderedControls.delete(key);
  }
}

function renderSelectedPadControls() {
  const container = $('#padParameterControls');
  unregisterRenderedControls(container);
  const definitions = PAD_PARAMETER_DEFINITIONS.map((definition) => ({
    ...definition,
    key: createPadParameterKey(selectedPadIndex, definition.key),
    ariaLabel: `Pad ${selectedPadIndex + 1}: ${definition.label}`,
  }));
  container.setAttribute('aria-label', `Lydparametere for Pad ${selectedPadIndex + 1}`);
  container.replaceChildren(...definitions.map((definition) => createSlider(definition, container.id)));
}

function renderControls(group, containerId) {
  const container = $(containerId);
  const ownDefinitions = parameterGroups[group].filter((definition) => !definition.editorOnly);
  const definitions = group === 'mixer'
    ? [
        ...MIXER_CHANNEL_KEYS.map((key) => {
          const definition = Object.values(parameterGroups).flat().find((candidate) => candidate.key === key);
          return { ...definition, label: MIXER_CHANNEL_LABELS[key] };
        }),
        ...ownDefinitions.filter((definition) => !MIXER_CHANNEL_KEYS.includes(definition.key)),
      ]
    : ownDefinitions;
  container.replaceChildren(...definitions.map((definition) => createSlider(definition, container.id)));
}

function renderInterface() {
  renderedControls.clear();
  createSegmentButtons($('#waveformButtons'), [
    { value: 'sine', label: 'Sinus' }, { value: 'triangle', label: 'Tri' },
    { value: 'sawtooth', label: 'Sag' }, { value: 'pulse', label: 'Puls' },
  ], 'waveform', () => engine.refreshLiveWave());
  createSegmentButtons($('#noiseButtons'), [
    { value: 'white', label: 'Hvit' }, { value: 'pink', label: 'Rosa' }, { value: 'brown', label: 'Brun' },
  ], 'noiseColor');
  createSegmentButtons($('#filterButtons'), [
    { value: 'lowpass', label: 'LP' }, { value: 'bandpass', label: 'BP' }, { value: 'highpass', label: 'HP' },
  ], 'filterType');
  createSegmentButtons($('#lfoTargetButtons'), [
    { value: 'pitch', label: 'Pitch' }, { value: 'filter', label: 'Filter' }, { value: 'fold', label: 'Fold' },
  ], 'lfoTarget');
  renderControls('vco', '#vcoControls');
  renderControls('noise', '#noiseControls');
  renderControls('sampleHold', '#sampleHoldControls');
  renderControls('wavefolder', '#wavefolderControls');
  renderControls('filter', '#filterControls');
  renderControls('envelope', '#envelopeControls');
  renderControls('lfo', '#lfoControls');
  renderControls('kick', '#kickControls');
  renderControls('transport', '#transportControls');
  renderControls('sequence', '#sequenceControls');
  renderControls('microphone', '#microphoneControls');
  renderControls('voiceFx', '#voiceFxControls');
  renderControls('sampleA', '#sampleAControls');
  renderControls('sampleB', '#sampleBControls');
  renderControls('padSampler', '#padSamplerControls');
  renderControls('mixer', '#mixerControls');
  renderControls('delay', '#delayControls');
  renderControls('master', '#masterControls');
  renderVoicePresets();
  renderSourceStates();
  renderSampleState('A');
  renderSampleState('B');
  renderPadSampler();
  renderSteps();
  renderSequenceLength();
  renderKeyboard();
  renderPresets();
  renderModuleLayout();
}

function syncControls({ persist = true } = {}) {
  for (const key of renderedControls.keys()) syncRenderedControls(key, getStateParameterValue(key));
  renderInterface();
  engine.applyState(state);
  if (persist) persistSession();
}

function renderVoicePresets() {
  const container = $('#voicePresetButtons');
  container.replaceChildren();
  for (const [name, values] of Object.entries(voicePresets)) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'segment-button';
    button.textContent = name;
    button.classList.toggle('active', state.voicePreset === name);
    button.setAttribute('aria-pressed', String(state.voicePreset === name));
    button.addEventListener('click', () => {
      Object.assign(state, values, { voicePreset: name });
      syncControls();
      showToast(`Stemmeeffekt: ${name}`);
    });
    container.append(button);
  }
}

function setStateButton(id, active) {
  const button = $(`#${id}`);
  button.classList.toggle('active', active);
  button.setAttribute('aria-pressed', String(active));
}

function renderSourceStates() {
  for (const key of ['synthMute', 'synthSolo', 'noiseMute', 'noiseSolo', 'noiseDrone', 'kickMute', 'kickSolo', 'micMute', 'micSolo', 'padMute', 'padSolo']) setStateButton(key, state[key]);
  const active = engine.isMicrophoneActive();
  $('#micStatus').textContent = active ? (state.micMonitoring ? 'På · monitor' : 'På · monitor av') : 'Av';
  $('#micStatus').classList.toggle('active', active);
  $('#startMic').disabled = active;
  $('#stopMic').disabled = !active;
  $('#toggleMicMonitor').disabled = !active;
  $('#toggleMicMonitor').textContent = state.micMonitoring ? 'Monitor på' : 'Monitor av';
  $('#toggleMicMonitor').classList.toggle('active', state.micMonitoring);
}

function renderSampleState(slot) {
  const prefix = `sample${slot}`;
  const metadata = state.samples[slot];
  const loaded = engine.hasSample(slot);
  const ready = loaded || metadata.stored;
  const missingLocal = samplesHydrated && metadata.stored && !loaded;
  $(`#${prefix}Status`).textContent = missingLocal ? 'Må kobles til på denne enheten' : ready ? `${metadata.name || `Sample ${slot}`} · ${Number(metadata.duration).toFixed(1)} s` : 'Tom';
  $(`#${prefix}Status`).classList.toggle('active', ready);
  for (const suffix of ['Play', 'Stop', 'Remove']) $(`#${prefix}${suffix}`).disabled = !ready;
  $(`#${prefix}Edit`).disabled = !loaded;
  $(`#${prefix}Edit`).title = loaded ? `Rediger Sample ${slot}` : missingLocal ? 'Last samplet inn på denne enheten før redigering' : `Importer lyd til Sample ${slot} før redigering`;
  for (const flag of ['Loop', 'Reverse', 'Mute', 'Solo']) setStateButton(`${prefix}${flag}`, state[`${prefix}${flag}`]);
  drawSampleWaveform(slot);
  updateSampleProgress(slot);
}

function padLoadStatus(index) {
  const metadata = state.pads[index];
  if (engine.hasPadSample(index)) return activePadUi.has(index) ? 'Spiller' : 'Klar';
  if (metadata.stored && samplesHydrated) return 'Lyd mangler på denne enheten';
  if (metadata.stored) return 'Tilordnet';
  return 'Tom';
}

function updateSelectedPadEditor() {
  const metadata = state.pads[selectedPadIndex];
  const status = padLoadStatus(selectedPadIndex);
  $('#selectedPadHeading').textContent = `Pad ${selectedPadIndex + 1}`;
  $('#selectedPadName').textContent = metadata.name ? `${metadata.name} · ${status}` : status;
  $('#padMode').value = metadata.mode;
  $('#padRemove').disabled = !metadata.stored && !engine.hasPadSample(selectedPadIndex);
  document.querySelectorAll('.sample-pad').forEach((button) => {
    const index = Number(button.dataset.padIndex);
    button.classList.toggle('selected', index === selectedPadIndex);
    if (index === selectedPadIndex) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}

function updatePadButton(index) {
  const button = document.querySelector(`.sample-pad[data-pad-index="${index}"]`);
  if (!button) return;
  const metadata = state.pads[index];
  const status = padLoadStatus(index);
  button.classList.toggle('active', activePadUi.has(index));
  button.classList.toggle('missing', metadata.stored && samplesHydrated && !engine.hasPadSample(index));
  button.setAttribute('aria-pressed', String(activePadUi.has(index)));
  button.querySelector('.pad-name').textContent = metadata.name || 'Tom';
  button.querySelector('.pad-state').textContent = status;
  button.setAttribute('aria-label', `Pad ${index + 1}: ${metadata.name || 'tom'}. ${status}. ${metadata.mode === 'loop-hold' ? 'Loop av/på' : 'One-shot'}.`);
}

function updatePadSamplerStatus() {
  const assigned = state.pads.filter((pad) => pad.stored).length;
  const loaded = state.pads.filter((_pad, index) => engine.hasPadSample(index)).length;
  $('#padSamplerStatus').textContent = `${loaded} klare · ${assigned} tilordnet`;
  $('#padSamplerStatus').classList.toggle('active', loaded > 0);
}

function selectPad(index) {
  const nextIndex = Math.max(0, Math.min(PAD_COUNT - 1, Number(index) || 0));
  const changed = nextIndex !== selectedPadIndex;
  selectedPadIndex = nextIndex;
  updateSelectedPadEditor();
  if (changed || !$('#padParameterControls').children.length) renderSelectedPadControls();
}

async function startPad(index, velocity = 1, isCurrent = () => true) {
  selectPad(index);
  if (!(await ensureAudio())) return false;
  if (!isCurrent()) return false;
  if (!engine.hasPadSample(index)) {
    showToast(state.pads[index].stored
      ? `Pad ${index + 1}: Lyden mangler på denne enheten`
      : `Pad ${index + 1} er tom`);
    return false;
  }
  const started = engine.playPad(index, {
    velocity,
    mode: state.pads[index].mode,
    onEnded: () => {
      activePadUi.delete(index);
      updatePadButton(index);
      updateSelectedPadEditor();
    },
  });
  if (started) {
    activePadUi.add(index);
    updatePadButton(index);
    updateSelectedPadEditor();
  }
  return started;
}

function cancelPadActivations(index) {
  padActivationController.cancel(index);
}

function cancelAllPadActivations() {
  padActivationController.cancelAll(PAD_COUNT);
}

function stopPadPlayback(index, { cancelPending = true } = {}) {
  if (cancelPending) cancelPadActivations(index);
  engine.stopPad(index);
  activePadUi.delete(index);
  updatePadButton(index);
  updateSelectedPadEditor();
}

function stopAllPadPlayback() {
  cancelAllPadActivations();
  engine.stopAllPads();
  activePadUi.clear();
  refreshPadSampler();
}

function activatePad(index, velocity = 1) {
  const padIndex = Math.max(0, Math.min(PAD_COUNT - 1, Number(index) || 0));
  selectPad(padIndex);
  return padActivationController.activate(padIndex, velocity);
}

function bindPadButton(button, index) {
  button.addEventListener('pointerdown', async (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    heldPadPointers.set(event.pointerId, index);
    await activatePad(index, 1);
  });
  for (const eventName of ['pointerup', 'pointercancel']) {
    button.addEventListener(eventName, (event) => {
      if (heldPadPointers.get(event.pointerId) !== index) return;
      heldPadPointers.delete(event.pointerId);
    });
  }
  button.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key) || event.repeat) return;
    event.preventDefault();
    heldPadKeys.add(index);
    void activatePad(index, 1);
  });
  button.addEventListener('keyup', (event) => {
    if (!['Enter', ' '].includes(event.key)) return;
    event.preventDefault();
    heldPadKeys.delete(index);
  });
  button.addEventListener('click', (event) => {
    event.preventDefault();
    selectPad(index);
  });
}

function renderPadSampler() {
  const grid = $('#padGrid');
  grid.replaceChildren(...Array.from({ length: PAD_COUNT }, (_, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sample-pad';
    button.dataset.padIndex = String(index);
    button.setAttribute('aria-pressed', 'false');
    const number = document.createElement('strong');
    number.textContent = String(index + 1);
    const name = document.createElement('span');
    name.className = 'pad-name';
    const status = document.createElement('small');
    status.className = 'pad-state';
    button.append(number, name, status);
    bindPadButton(button, index);
    return button;
  }));
  for (let index = 0; index < PAD_COUNT; index += 1) updatePadButton(index);
  updatePadSamplerStatus();
  updateSelectedPadEditor();
  renderSelectedPadControls();
}

function refreshPadSampler() {
  const buttons = document.querySelectorAll('.sample-pad');
  if (buttons.length !== PAD_COUNT) {
    renderPadSampler();
    return;
  }
  for (let index = 0; index < PAD_COUNT; index += 1) updatePadButton(index);
  updatePadSamplerStatus();
  updateSelectedPadEditor();
}

function drawSampleWaveform(slot) {
  const peaks = engine.getSampleWaveform(slot, 96);
  const path = $(`#sample${slot}Waveform`);
  if (!peaks.length) { path.setAttribute('d', 'M0 37H320'); return; }
  const top = peaks.map((peak, index) => `${index ? 'L' : 'M'}${(index / (peaks.length - 1) * 320).toFixed(1)} ${(37 - peak * 32).toFixed(1)}`);
  const bottom = peaks.slice().reverse().map((peak, reversedIndex) => {
    const index = peaks.length - 1 - reversedIndex;
    return `L${(index / (peaks.length - 1) * 320).toFixed(1)} ${(37 + peak * 32).toFixed(1)}`;
  });
  path.setAttribute('d', `${top.join('')} ${bottom.join('')} Z`);
}

function formatPlaybackTime(value) {
  const totalSeconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getSampleClipDuration(slot) {
  const info = engine.getSampleInfo(slot);
  if (!info) return 0;
  const prefix = `sample${slot}`;
  const start = Math.min(state[`${prefix}Start`], state[`${prefix}End`] - 0.01);
  const end = Math.max(state[`${prefix}End`], start + 0.01);
  return Math.max(0, (end - start) * info.duration);
}

function updateSampleProgress(slot) {
  const prefix = `sample${slot}`;
  const progressElement = $(`#${prefix}Progress`);
  if (!progressElement) return;
  const playback = engine.getSamplePlaybackState(slot);
  const duration = playback?.durationSeconds ?? getSampleClipDuration(slot);
  const elapsed = playback?.elapsedSeconds ?? 0;
  const playhead = $(`#${prefix}Playhead`);
  playhead.hidden = !playback;
  if (playback) {
    const x = Math.max(0, Math.min(320, playback.positionRatio * 320));
    playhead.setAttribute('x1', x.toFixed(2));
    playhead.setAttribute('x2', x.toFixed(2));
  }
  const currentText = formatPlaybackTime(elapsed);
  const durationText = formatPlaybackTime(duration);
  $(`#${prefix}ProgressTime`).textContent = `${currentText} / ${durationText}`;
  progressElement.classList.toggle('active', Boolean(playback));
  progressElement.setAttribute('aria-valuemax', String(Math.max(0, duration)));
  progressElement.setAttribute('aria-valuenow', String(Math.max(0, elapsed)));
  progressElement.setAttribute('aria-valuetext', playback
    ? `${currentText} av ${durationText}${playback.reverse ? ', reverse' : ''}${playback.loop ? ', loop' : ''}`
    : `Stoppet, ${currentText} av ${durationText}`);
}

function stopSamplePlayback(slot) {
  engine.stopSample(slot);
  updateSampleProgress(slot);
}

function formatEditorTime(value) {
  const seconds = Math.max(0, Number(value) || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = (seconds % 60).toFixed(3).padStart(6, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}

function setSampleEditorStatus(message) {
  $('#sampleEditorStatus').textContent = message;
}

function setSampleEditorBusy(busy) {
  if (!sampleEditorDraft) return;
  sampleEditorDraft.busy = Boolean(busy);
  const dialog = $('#sampleEditorDialog');
  dialog.classList.toggle('busy', sampleEditorDraft.busy);
  for (const id of ['closeSampleEditor', 'sampleEditorStartHandle', 'sampleEditorEndHandle', 'sampleEditorStartTime', 'sampleEditorEndTime', 'previewSampleSelection', 'stopSampleSelection', 'resetSampleSelection', 'cancelSampleEditor', 'cropSampleSelection']) {
    $(`#${id}`).disabled = sampleEditorDraft.busy;
  }
}

function drawSampleEditorWaveform(slot) {
  const peaks = engine.getSampleWaveform(slot, 512);
  const path = $('#sampleEditorWaveform');
  if (!peaks.length) { path.setAttribute('d', 'M0 120H1000'); return; }
  const top = peaks.map((peak, index) => `${index ? 'L' : 'M'}${(index / (peaks.length - 1) * 1000).toFixed(1)} ${(120 - peak * 108).toFixed(1)}`);
  const bottom = peaks.slice().reverse().map((peak, reversedIndex) => {
    const index = peaks.length - 1 - reversedIndex;
    return `L${(index / (peaks.length - 1) * 1000).toFixed(1)} ${(120 + peak * 108).toFixed(1)}`;
  });
  path.setAttribute('d', `${top.join('')} ${bottom.join('')} Z`);
}

function updateSampleEditorSelection(startSeconds, endSeconds, changedEdge = 'end') {
  if (!sampleEditorDraft) return;
  const { duration, sampleRate } = sampleEditorDraft;
  const minimum = Math.max(1 / sampleRate, 0.001);
  let start = Number.isFinite(Number(startSeconds)) ? Number(startSeconds) : sampleEditorDraft.start;
  let end = Number.isFinite(Number(endSeconds)) ? Number(endSeconds) : sampleEditorDraft.end;
  if (changedEdge === 'start') {
    end = Math.max(minimum, Math.min(duration, end));
    start = Math.max(0, Math.min(end - minimum, start));
  } else {
    start = Math.max(0, Math.min(duration - minimum, start));
    end = Math.max(start + minimum, Math.min(duration, end));
  }
  sampleEditorDraft.start = start;
  sampleEditorDraft.end = end;
  const startPercent = duration ? (start / duration) * 100 : 0;
  const endPercent = duration ? (end / duration) * 100 : 100;
  const selection = $('#sampleEditorSelection');
  selection.style.left = `${startPercent}%`;
  selection.style.width = `${Math.max(0, endPercent - startPercent)}%`;
  const startHandle = $('#sampleEditorStartHandle');
  const endHandle = $('#sampleEditorEndHandle');
  startHandle.style.left = `${startPercent}%`;
  endHandle.style.left = `${endPercent}%`;
  for (const [handle, value] of [[startHandle, start], [endHandle, end]]) {
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', String(duration));
    handle.setAttribute('aria-valuenow', value.toFixed(3));
    handle.setAttribute('aria-valuetext', formatEditorTime(value));
  }
  $('#sampleEditorStartTime').value = start.toFixed(3);
  $('#sampleEditorEndTime').value = end.toFixed(3);
  $('#sampleEditorSelected').textContent = `Valgt: ${formatEditorTime(end - start)}`;
}

function openSampleEditor(slot, trigger = document.activeElement) {
  const info = engine.getSampleInfo(slot);
  if (!info) { showToast(`Importer eller last inn Sample ${slot} lokalt før redigering`); return; }
  const prefix = `sample${slot}`;
  const initial = normalizeSampleSelection(
    info.duration,
    info.duration * Number(state[`${prefix}Start`] || 0),
    info.duration * Number(state[`${prefix}End`] || 1),
    1 / info.sampleRate,
  );
  sampleEditorDraft = { slot, duration: info.duration, sampleRate: info.sampleRate, start: initial.start, end: initial.end, busy: false };
  sampleEditorReturnTarget = trigger;
  $('#sampleEditorTitle').textContent = `Rediger Sample ${slot}`;
  $('#sampleEditorFilename').textContent = state.samples[slot]?.name || `Sample ${slot}`;
  $('#sampleEditorTotal').textContent = `Total: ${formatEditorTime(info.duration)}`;
  for (const id of ['sampleEditorStartTime', 'sampleEditorEndTime']) $(`#${id}`).max = String(info.duration);
  drawSampleEditorWaveform(slot);
  updateSampleEditorSelection(initial.start, initial.end, 'end');
  setSampleEditorStatus('Klar for redigering');
  setSampleEditorBusy(false);
  const dialog = $('#sampleEditorDialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  window.requestAnimationFrame(() => $('#sampleEditorStartHandle').focus());
}

function closeSampleEditor(result = 'cancel') {
  if (sampleEditorDraft?.busy) return;
  const dialog = $('#sampleEditorDialog');
  if (dialog.open && typeof dialog.close === 'function') dialog.close(result);
  else {
    dialog.removeAttribute('open');
    finishSampleEditorClose();
  }
}

function finishSampleEditorClose() {
  if (sampleEditorDraft) stopSamplePlayback(sampleEditorDraft.slot);
  sampleEditorDraft = null;
  sampleEditorReturnTarget?.focus?.();
  sampleEditorReturnTarget = null;
}

function resetSampleEditorSelection() {
  if (!sampleEditorDraft) return;
  updateSampleEditorSelection(0, sampleEditorDraft.duration, 'end');
  setSampleEditorStatus('Hele lydfilen er valgt');
}

async function previewSampleEditorSelection() {
  if (!sampleEditorDraft) return;
  if (!(await ensureAudio())) return;
  if (!engine.playSampleRange(sampleEditorDraft.slot, sampleEditorDraft.start, sampleEditorDraft.end)) {
    setSampleEditorStatus(`Sample ${sampleEditorDraft.slot} kunne ikke spilles`);
    return;
  }
  setSampleEditorStatus(`Spiller valgt område · ${formatEditorTime(sampleEditorDraft.end - sampleEditorDraft.start)}`);
}

function stopSampleEditorSelection() {
  if (!sampleEditorDraft) return;
  stopSamplePlayback(sampleEditorDraft.slot);
  setSampleEditorStatus('Avspilling stoppet');
}

async function cropSampleEditorSelection() {
  if (!sampleEditorDraft || sampleEditorDraft.busy) return;
  const { slot, start, end } = sampleEditorDraft;
  setSampleEditorBusy(true);
  setSampleEditorStatus('Oppretter og lagrer lokal WAV-kopi…');
  try {
    const result = engine.createSampleCrop(slot, start, end);
    await putSample(slot, result.blob, result.metadata);
    engine.commitSampleCrop(slot, result);
    state.samples[slot] = result.metadata;
    state[`sample${slot}Start`] = 0;
    state[`sample${slot}End`] = 1;
    renderSampleState(slot);
    persistSession();
    setSampleEditorStatus(`Klippet er lagret lokalt · ${formatEditorTime(result.metadata.duration)}`);
    setSampleEditorBusy(false);
    closeSampleEditor('saved');
    showToast(`Sample ${slot} er klippet til en lokal WAV-kopi`);
  } catch (_error) {
    setSampleEditorBusy(false);
    setSampleEditorStatus('Klippingen kunne ikke fullføres. Enheten kan mangle ledig minne. Det opprinnelige samplet er beholdt.');
  }
}

function updateSampleEditorFromPointer(event, edge) {
  if (!sampleEditorDraft || sampleEditorDraft.busy) return;
  const bounds = $('#sampleEditorTimeline').getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  const seconds = ratio * sampleEditorDraft.duration;
  if (edge === 'start') updateSampleEditorSelection(seconds, sampleEditorDraft.end, edge);
  else updateSampleEditorSelection(sampleEditorDraft.start, seconds, edge);
}

function bindSampleEditorHandle(id, edge) {
  const handle = $(`#${id}`);
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    updateSampleEditorFromPointer(event, edge);
  });
  handle.addEventListener('pointermove', (event) => {
    if (handle.hasPointerCapture(event.pointerId)) updateSampleEditorFromPointer(event, edge);
  });
  handle.addEventListener('keydown', (event) => {
    if (!sampleEditorDraft || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : Math.max(0.001, Math.min(0.1, sampleEditorDraft.duration / 1000));
    let value = edge === 'start' ? sampleEditorDraft.start : sampleEditorDraft.end;
    if (event.key === 'Home') value = 0;
    else if (event.key === 'End') value = sampleEditorDraft.duration;
    else value += event.key === 'ArrowRight' ? step : -step;
    if (edge === 'start') updateSampleEditorSelection(value, sampleEditorDraft.end, edge);
    else updateSampleEditorSelection(sampleEditorDraft.start, value, edge);
  });
}

function setRecorderStatus(message, active = false) {
  $('#recorderStatus').textContent = message;
  $('#recorderStatus').classList.toggle('active', active);
}

function clearRecorderTimers() {
  window.clearTimeout(recorderLimitTimer);
  window.clearInterval(recorderClockTimer);
  recorderLimitTimer = 0;
  recorderClockTimer = 0;
}

function updateRecorderClock() {
  const elapsed = recorderStartedAt ? Math.min(MAX_RECORDING_SECONDS, (Date.now() - recorderStartedAt) / 1000) : 0;
  $('#recorderTimer').textContent = `${formatPlaybackTime(elapsed)} / 02:00`;
}

function stopRecorderLiveWaveform({ resetPath = false } = {}) {
  if (recorderLiveAnimationFrame) window.cancelAnimationFrame(recorderLiveAnimationFrame);
  recorderLiveAnimationFrame = 0;
  recorderLiveLastDraw = 0;
  recorderLiveSamples = new Float32Array(0);
  resetRecordingWaveformHistory(recorderLiveHistory);
  if (resetPath) $('#recorderWaveform').setAttribute('d', recordingWaveformPath(recorderLiveHistory));
}

function updateRecorderLiveWaveform(timestamp) {
  recorderLiveAnimationFrame = 0;
  if (!engine.isSupportRecordingActive()) return;
  if (!recorderLiveLastDraw || timestamp - recorderLiveLastDraw >= RECORDER_LIVE_FRAME_INTERVAL) {
    const sampleCount = engine.getSupportRecordingAnalysisSize();
    if (recorderLiveSamples.length !== sampleCount) recorderLiveSamples = new Float32Array(sampleCount);
    if (sampleCount && engine.readSupportRecordingWaveform(recorderLiveSamples)) {
      appendRecordingWaveformFrame(recorderLiveHistory, recorderLiveSamples, 4);
    } else {
      resetRecordingWaveformHistory(recorderLiveHistory);
    }
    $('#recorderWaveform').setAttribute('d', recordingWaveformPath(recorderLiveHistory));
    recorderLiveLastDraw = timestamp;
  }
  recorderLiveAnimationFrame = window.requestAnimationFrame(updateRecorderLiveWaveform);
}

function startRecorderLiveWaveform() {
  stopRecorderLiveWaveform({ resetPath: true });
  recorderLiveAnimationFrame = window.requestAnimationFrame(updateRecorderLiveWaveform);
}

function renderRecorderControls() {
  const active = engine.isSupportRecordingActive();
  const busy = recorderStopping || Boolean(recorderDraft?.busy);
  const live = active || recorderStopping;
  const hasDraft = Boolean(recorderDraft);
  $('#startRecorder').disabled = active || busy;
  $('#startRecorder').classList.toggle('active', active);
  $('#stopRecorder').disabled = !active || recorderStopping;
  $('#cancelRecorder').disabled = !active || recorderStopping;
  $('#closeRecorder').disabled = busy;
  $('#cancelRecordingName').disabled = busy;
  for (const input of document.querySelectorAll('input[name="recorderSource"]')) input.disabled = active || busy;
  for (const id of ['recorderStartHandle', 'recorderEndHandle', 'recorderStartTime', 'recorderEndTime', 'previewRecorder', 'stopRecorderPreview', 'resetRecorderTrim', 'discardRecorderDraft', 'saveRecorderDraft']) {
    $(`#${id}`).disabled = !recorderDraft || busy;
  }
  const surface = $('#recorderDraft');
  surface.hidden = !live && !hasDraft;
  surface.classList.toggle('live', live);
  $('#recorderDraftTitle').textContent = active
    ? 'Direkte bølgeform'
    : recorderStopping
      ? 'Klargjør opptak'
      : 'Midlertidig utkast';
  $('#recorderTotal').hidden = live;
  $('#recorderSelected').hidden = live;
  for (const control of surface.querySelectorAll('[data-recorder-trim]')) control.hidden = live || !hasDraft;
  $('#recorderTimeline').setAttribute(
    'aria-label',
    active
      ? 'Rullende bølgeform for aktivt opptak'
      : recorderStopping
        ? 'Bølgeform for opptak som klargjøres'
        : 'Bølgeform og valgt opptaksområde',
  );
}

function drawRecorderWaveform() {
  const peaks = engine.getRecordingWaveform(recorderDraft?.buffer, 512);
  const path = $('#recorderWaveform');
  if (!peaks.length) { path.setAttribute('d', 'M0 120H1000'); return; }
  const top = peaks.map((peak, index) => `${index ? 'L' : 'M'}${(index / (peaks.length - 1) * 1000).toFixed(1)} ${(120 - peak * 108).toFixed(1)}`);
  const bottom = peaks.slice().reverse().map((peak, reversedIndex) => {
    const index = peaks.length - 1 - reversedIndex;
    return `L${(index / (peaks.length - 1) * 1000).toFixed(1)} ${(120 + peak * 108).toFixed(1)}`;
  });
  path.setAttribute('d', `${top.join('')} ${bottom.join('')} Z`);
}

function updateRecorderSelection(startSeconds, endSeconds, changedEdge = 'end') {
  if (!recorderDraft) return;
  const { duration, buffer } = recorderDraft;
  const minimum = Math.max(1 / buffer.sampleRate, 0.001);
  let start = Number.isFinite(Number(startSeconds)) ? Number(startSeconds) : recorderDraft.start;
  let end = Number.isFinite(Number(endSeconds)) ? Number(endSeconds) : recorderDraft.end;
  if (changedEdge === 'start') {
    end = Math.max(minimum, Math.min(duration, end));
    start = Math.max(0, Math.min(end - minimum, start));
  } else {
    start = Math.max(0, Math.min(duration - minimum, start));
    end = Math.max(start + minimum, Math.min(duration, end));
  }
  recorderDraft.start = start;
  recorderDraft.end = end;
  const startPercent = duration ? (start / duration) * 100 : 0;
  const endPercent = duration ? (end / duration) * 100 : 100;
  const selection = $('#recorderSelection');
  selection.style.left = `${startPercent}%`;
  selection.style.width = `${Math.max(0, endPercent - startPercent)}%`;
  const startHandle = $('#recorderStartHandle');
  const endHandle = $('#recorderEndHandle');
  startHandle.style.left = `${startPercent}%`;
  endHandle.style.left = `${endPercent}%`;
  for (const [handle, value] of [[startHandle, start], [endHandle, end]]) {
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', String(duration));
    handle.setAttribute('aria-valuenow', value.toFixed(3));
    handle.setAttribute('aria-valuetext', formatEditorTime(value));
  }
  $('#recorderStartTime').value = start.toFixed(3);
  $('#recorderEndTime').value = end.toFixed(3);
  $('#recorderSelected').textContent = `Valgt: ${formatEditorTime(end - start)}`;
}

function renderRecorderDraft() {
  renderRecorderControls();
  if (!recorderDraft) return;
  $('#recorderTotal').textContent = `Total: ${formatEditorTime(recorderDraft.duration)}`;
  for (const id of ['recorderStartTime', 'recorderEndTime']) $(`#${id}`).max = String(recorderDraft.duration);
  drawRecorderWaveform();
  updateRecorderSelection(recorderDraft.start, recorderDraft.end, 'end');
}

function discardRecorderDraft(message = 'Utkastet er forkastet') {
  engine.stopSupportPreview();
  recorderDraft = null;
  stopRecorderLiveWaveform({ resetPath: true });
  renderRecorderControls();
  setRecorderStatus(message);
}

function openRecorder(returnTarget = document.activeElement, targetSlot = '') {
  recorderReturnTarget = returnTarget;
  sharedRecordingTargetSlot = normalizeLibraryTargetSlot(targetSlot);
  $('#sharedLibraryTarget').textContent = sharedRecordingTargetSlot
    ? `Mål: ${sampleTargetLabel(sharedRecordingTargetSlot)}. Velg ønsket opptak under.`
    : 'Velg Sample A eller B for et opptak.';
  const dialog = $('#recorderDialog');
  if (!dialog.open) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  renderRecorderDraft();
  refreshSharedRecordingLibrary();
  window.requestAnimationFrame(() => $('#startRecorder').focus());
}

function closeRecorder() {
  if (recorderStopping || recorderDraft?.busy) return;
  if (engine.isSupportRecordingActive()) {
    if (!window.confirm('Avbryt det aktive opptaket og lukk Opptaker?')) return;
    cancelRecorderCapture();
  }
  engine.stopSupportPreview();
  stopSharedRecordingPreview();
  const dialog = $('#recorderDialog');
  if (dialog.open && typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

function finishRecorderClose() {
  stopRecorderLiveWaveform({ resetPath: !recorderDraft });
  engine.stopSupportPreview();
  stopSharedRecordingPreview();
  recorderReturnTarget?.focus?.({ preventScroll: true });
  recorderReturnTarget = null;
  sharedRecordingTargetSlot = '';
  $('#sharedLibraryTarget').textContent = 'Velg Sample A eller B for et opptak.';
}

async function startRecorderCapture() {
  try {
    if (recorderDraft && !window.confirm('Forkast eksisterende utkast og start et nytt opptak?')) return;
    discardRecorderDraft('Klargjør opptak…');
    if (!(await ensureAudio())) return;
    const source = document.querySelector('input[name="recorderSource"]:checked')?.value || 'master';
    const microphoneWasActive = engine.isMicrophoneActive();
    await engine.startSupportRecording(source);
    if (source === 'microphone' && !microphoneWasActive) {
      state.micMonitoring = false;
      engine.setMicMonitoring(false);
      renderSourceStates();
    }
    recorderStartedAt = Date.now();
    updateRecorderClock();
    recorderClockTimer = window.setInterval(updateRecorderClock, 250);
    recorderLimitTimer = window.setTimeout(() => finishRecorderCapture(true), MAX_RECORDING_SECONDS * 1000);
    startRecorderLiveWaveform();
    setRecorderStatus(source === 'microphone' ? 'Tar opp fra mikrofon…' : 'Tar opp masterutgang…', true);
    renderRecorderControls();
  } catch (error) {
    clearRecorderTimers();
    stopRecorderLiveWaveform({ resetPath: true });
    engine.cancelSupportRecording();
    setRecorderStatus(`Opptaket kunne ikke starte: ${error.message}`);
    renderRecorderControls();
  }
}

async function finishRecorderCapture(reachedLimit = false) {
  if (!engine.isSupportRecordingActive() || recorderStopping) return;
  recorderStopping = true;
  clearRecorderTimers();
  stopRecorderLiveWaveform();
  setRecorderStatus('Stopper og klargjør utkast…', true);
  renderRecorderControls();
  try {
    const result = await engine.stopSupportRecording();
    const duration = Math.min(result.duration, MAX_RECORDING_SECONDS);
    recorderDraft = { buffer: result.buffer, source: result.source, duration, start: 0, end: duration, busy: false };
    $('#recorderTimer').textContent = `${formatPlaybackTime(duration)} / 02:00`;
    setRecorderStatus(reachedLimit ? 'Stoppet ved maksgrensen. Utkastet er klart.' : 'Stoppet. Utkastet er klart.');
    renderRecorderDraft();
  } catch (error) {
    stopRecorderLiveWaveform({ resetPath: true });
    setRecorderStatus(`Opptaket kunne ikke klargjøres: ${error.message}`);
  } finally {
    recorderStopping = false;
    renderSourceStates();
    renderRecorderControls();
  }
}

function cancelRecorderCapture() {
  clearRecorderTimers();
  stopRecorderLiveWaveform({ resetPath: true });
  engine.cancelSupportRecording();
  renderSourceStates();
  recorderStopping = false;
  recorderStartedAt = 0;
  $('#recorderTimer').textContent = '00:00 / 02:00';
  discardRecorderDraft('Avbrutt. Ingen fil ble lagret.');
}

async function previewRecorderSelection() {
  if (!recorderDraft) return;
  try {
    if (!(await ensureAudio())) throw new Error('Lydmotoren kunne ikke startes.');
    const playback = await engine.playRecordingRange(recorderDraft.buffer, recorderDraft.start, recorderDraft.end);
    if (!playback.started) return;
    setRecorderStatus(`Spiller valgt område · ${formatEditorTime(playback.duration)}`, true);
  } catch (error) {
    setRecorderStatus(`Kunne ikke spille valgt område: ${error.message}`);
  }
}

function stopRecorderSelection() {
  engine.stopSupportPreview();
  if (recorderDraft) setRecorderStatus('Avspillingen er stoppet. Utkastet er klart.');
}

function openRecordingNameDialog() {
  if (!recorderDraft) return;
  const now = new Date();
  $('#recordingName').value = `Opptak ${now.toLocaleDateString('no-NO')} ${now.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}`;
  $('#recordingNameError').textContent = '';
  const dialog = $('#recordingNameDialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  window.requestAnimationFrame(() => $('#recordingName').select());
}

function closeRecordingNameDialog() {
  if (recorderDraft?.busy) return;
  const dialog = $('#recordingNameDialog');
  if (dialog.open && typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
  $('#saveRecorderDraft').focus();
}

async function saveRecorderDraft() {
  if (!recorderDraft || recorderDraft.busy) return;
  const name = $('#recordingName').value.trim();
  if (!name) { $('#recordingNameError').textContent = 'Skriv inn et navn på opptaket.'; $('#recordingName').focus(); return; }
  if (!sharedRecordingLibrary) { $('#recordingNameError').textContent = 'Fellesbiblioteket er ikke tilgjengelig i denne installasjonen.'; return; }
  recorderDraft.busy = true;
  renderRecorderControls();
  $('#confirmRecordingName').disabled = true;
  setRecorderStatus('Lagrer trimmet WAV…', true);
  try {
    const selection = engine.createRecordingSelection(recorderDraft.buffer, recorderDraft.start, recorderDraft.end);
    if (selection.blob.size > MAX_RECORDING_BYTES) throw new Error('Det valgte området er større enn 25 MB. Trim opptaket kortere.');
    const result = await sharedRecordingLibrary.upload(selection.blob, { name, duration: selection.duration, source: recorderDraft.source });
    if ($('#recordingNameDialog').open) $('#recordingNameDialog').close();
    recorderDraft = null;
    stopRecorderLiveWaveform({ resetPath: true });
    renderRecorderControls();
    renderSharedRecordingLibrary(result.files, result.limits);
    setRecorderStatus(`Lagret «${name}» i fellesbiblioteket.`);
    showToast(`«${name}» er lagret i fellesbiblioteket`);
  } catch (error) {
    recorderDraft.busy = false;
    renderRecorderControls();
    $('#recordingNameError').textContent = error.message;
    setRecorderStatus(`Lagringen feilet: ${error.message}`);
  } finally {
    $('#confirmRecordingName').disabled = false;
  }
}

function updateRecorderFromPointer(event, edge) {
  if (!recorderDraft || recorderDraft.busy) return;
  const bounds = $('#recorderTimeline').getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  const seconds = ratio * recorderDraft.duration;
  if (edge === 'start') updateRecorderSelection(seconds, recorderDraft.end, edge);
  else updateRecorderSelection(recorderDraft.start, seconds, edge);
}

function bindRecorderHandle(id, edge) {
  const handle = $(`#${id}`);
  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    updateRecorderFromPointer(event, edge);
  });
  handle.addEventListener('pointermove', (event) => {
    if (handle.hasPointerCapture(event.pointerId)) updateRecorderFromPointer(event, edge);
  });
  handle.addEventListener('keydown', (event) => {
    if (!recorderDraft || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 1 : Math.max(0.001, Math.min(0.1, recorderDraft.duration / 1000));
    let value = edge === 'start' ? recorderDraft.start : recorderDraft.end;
    if (event.key === 'Home') value = 0;
    else if (event.key === 'End') value = recorderDraft.duration;
    else value += event.key === 'ArrowRight' ? step : -step;
    if (edge === 'start') updateRecorderSelection(value, recorderDraft.end, edge);
    else updateRecorderSelection(recorderDraft.start, value, edge);
  });
}

function stopSharedRecordingPreview() {
  sharedRecordingPreview?.pause();
  sharedRecordingPreview = null;
  if (sharedRecordingPreviewUrl) URL.revokeObjectURL(sharedRecordingPreviewUrl);
  sharedRecordingPreviewUrl = '';
}

function renderSharedRecordingLibrary(files = [], limits = {}) {
  const list = $('#sharedLibraryList');
  list.replaceChildren();
  const totalBytes = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
  $('#sharedLibraryUsage').textContent = `${files.length}/${limits.files || 100} opptak · ${formatBytes(totalBytes)}/${formatBytes(limits.bytes || (200 * 1024 * 1024))}`;
  if (!files.length) {
    const empty = document.createElement('p');
    empty.className = 'library-empty';
    empty.textContent = 'Ingen lagrede opptak i denne appinstallasjonen.';
    list.append(empty);
    return;
  }
  for (const file of files) {
    const row = document.createElement('div');
    row.className = 'library-item';
    row.setAttribute('role', 'listitem');
    const info = document.createElement('div');
    info.className = 'library-file';
    const name = document.createElement('strong');
    name.textContent = file.name;
    const details = document.createElement('small');
    const source = file.source === 'microphone' ? 'Mikrofon' : 'Masterutgang';
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString('no-NO') : '';
    details.textContent = `${source} · ${formatEditorTime(file.duration)} · ${formatBytes(file.size)}${date ? ` · ${date}` : ''}`;
    info.append(name, details);
    const actions = document.createElement('div');
    actions.className = 'library-actions';
    actions.append(libraryButton('Lytt', () => previewSharedRecording(file)));
    for (const slot of getLibraryLoadTargets(sharedRecordingTargetSlot)) {
      actions.append(libraryButton(`Bruk i ${sampleTargetLabel(slot)}`, () => loadSharedRecording(file, slot), 'primary'));
    }
    row.append(info, actions);
    list.append(row);
  }
}

async function refreshSharedRecordingLibrary() {
  if (!sharedRecordingLibrary) { renderSharedRecordingLibrary(); $('#sharedLibraryUsage').textContent = 'Ikke tilgjengelig'; return; }
  try {
    $('#sharedLibraryUsage').textContent = 'Henter…';
    const result = await sharedRecordingLibrary.list();
    renderSharedRecordingLibrary(result.files, result.limits);
  } catch (error) {
    renderSharedRecordingLibrary();
    $('#sharedLibraryUsage').textContent = navigator.onLine ? 'Kunne ikke hente' : 'Frakoblet';
    showToast(error.message);
  }
}

async function previewSharedRecording(file) {
  try {
    stopSharedRecordingPreview();
    const blob = await sharedRecordingLibrary.download(file.id);
    sharedRecordingPreviewUrl = URL.createObjectURL(blob);
    sharedRecordingPreview = new Audio(sharedRecordingPreviewUrl);
    sharedRecordingPreview.addEventListener('ended', stopSharedRecordingPreview, { once: true });
    await sharedRecordingPreview.play();
  } catch (error) { stopSharedRecordingPreview(); showToast(error.message); }
}

async function loadSharedRecording(file, slot) {
  const padIndex = padIndexFromTarget(slot);
  const assigned = padIndex >= 0 ? state.pads[padIndex].stored : state.samples[slot].stored;
  if (assigned && !window.confirm(`Erstatt ${sampleTargetLabel(slot)} med ${file.name}?`)) return;
  try {
    if (!(await ensureAudio())) return;
    const blob = await sharedRecordingLibrary.download(file.id);
    try { Object.defineProperty(blob, 'name', { value: `${file.name}.wav` }); } catch (_error) { /* Metadata fallback below */ }
    if (padIndex >= 0) {
      await loadPadBlob(padIndex, blob, { name: file.name, type: 'audio/wav' });
      showToast(`«${file.name}» er lastet i Pad ${padIndex + 1}`);
      if (sharedRecordingTargetSlot) closeRecorder();
      return;
    }
    const metadata = { ...(await engine.loadSampleBlob(slot, blob)), name: file.name, type: 'audio/wav', stored: true };
    await putSample(slot, blob, metadata);
    state.samples[slot] = metadata;
    state[`sample${slot}Start`] = 0;
    state[`sample${slot}End`] = 1;
    renderSampleState(slot);
    persistSession();
    showToast(`«${file.name}» er lastet i Sample ${slot}`);
    if (sharedRecordingTargetSlot) closeRecorder();
  } catch (error) { showToast(error.message); }
}

async function hydrateSamples() {
  for (const slot of SAMPLE_SLOTS) {
    try {
      const stored = await getSample(slot);
      if (!stored?.blob) continue;
      if (state.samples[slot].stored && state.samples[slot].name && !sampleMetadataMatches(state.samples[slot], stored.metadata)) continue;
      const metadata = await engine.loadSampleBlob(slot, stored.blob);
      state.samples[slot] = { ...metadata, ...stored.metadata, stored: true };
      renderSampleState(slot);
    } catch (_error) {
      state.samples[slot] = clonePreset(defaultPreset).samples[slot];
    }
  }
  await hydratePadSamples();
  samplesHydrated = true;
  persistSession();
}

async function hydratePadSamples() {
  for (let index = 0; index < PAD_COUNT; index += 1) {
    try {
      if (!state.pads[index].stored) {
        cancelPadActivations(index);
        engine.removePadSample(index);
        activePadUi.delete(index);
        continue;
      }
      const stored = await getPadSample(index);
      if (!stored?.blob) {
        cancelPadActivations(index);
        engine.removePadSample(index);
        activePadUi.delete(index);
        continue;
      }
      if (state.pads[index].stored && state.pads[index].name
        && !sampleMetadataMatches(state.pads[index], stored.metadata)) {
        cancelPadActivations(index);
        engine.removePadSample(index);
        activePadUi.delete(index);
        continue;
      }
      const decoded = await engine.decodePadBlob(index, stored.blob);
      cancelPadActivations(index);
      engine.commitPadBuffer(index, decoded.buffer);
      activePadUi.delete(index);
      state.pads[index] = {
        ...decoded.metadata,
        ...stored.metadata,
        stored: true,
        mode: state.pads[index].mode,
        rate: state.pads[index].rate,
        gain: state.pads[index].gain,
        pan: state.pads[index].pan,
        tone: state.pads[index].tone,
        send: state.pads[index].send,
      };
    } catch (_error) {
      cancelPadActivations(index);
      engine.removePadSample(index);
      activePadUi.delete(index);
    }
  }
  refreshPadSampler();
}

function sampleMetadataMatches(reference, candidate) {
  if (!reference?.name || !candidate?.name) return false;
  return reference.name === candidate.name && Math.abs(Number(reference.duration) - Number(candidate.duration)) < 0.05;
}

function padTarget(index) { return `pad:${index}`; }

function padIndexFromTarget(target) {
  const match = /^pad:(\d+)$/.exec(String(target || ''));
  const index = match ? Number(match[1]) : -1;
  return Number.isInteger(index) && index >= 0 && index < PAD_COUNT ? index : -1;
}

function sampleTargetLabel(target) {
  const index = padIndexFromTarget(target);
  return index >= 0 ? `Pad ${index + 1}` : `Sample ${target}`;
}

async function loadPadBlob(index, blob, overrides = {}) {
  stopPadPlayback(index);
  const decoded = await engine.decodePadBlob(index, blob);
  const metadata = {
    ...state.pads[index],
    ...decoded.metadata,
    ...overrides,
    stored: true,
    mode: state.pads[index]?.mode === 'loop-hold' ? 'loop-hold' : 'one-shot',
  };
  await putPadSample(index, blob, metadata);
  engine.commitPadBuffer(index, decoded.buffer);
  activePadUi.delete(index);
  state.pads[index] = metadata;
  selectedPadIndex = index;
  refreshPadSampler();
  persistSession();
  return metadata;
}

async function importPad(index, file) {
  if (!file) return;
  if (state.pads[index].stored && !window.confirm(`Erstatt Pad ${index + 1}?`)) return;
  try {
    if (!(await ensureAudio())) return;
    const metadata = await loadPadBlob(index, file);
    showToast(`${metadata.name} er lastet i Pad ${index + 1}`);
  } catch (error) { showToast(error.message); }
}

async function removePadSlot(index) {
  if (state.pads[index].stored && !window.confirm(`Fjern lyden fra Pad ${index + 1} på denne enheten?`)) return;
  try {
    cancelPadActivations(index);
    engine.removePadSample(index);
    activePadUi.delete(index);
    await deletePadSample(index);
    state.pads[index] = createEmptyPadMetadata();
    refreshPadSampler();
    persistSession();
  } catch (error) { showToast(error.message); }
}

async function importSample(slot, file) {
  if (!file) return;
  if (state.samples[slot].stored && !window.confirm(`Erstatt Sample ${slot}?`)) return;
  try {
    if (!(await ensureAudio())) return;
    const metadata = await engine.loadSampleBlob(slot, file);
    await putSample(slot, file, metadata);
    state.samples[slot] = metadata;
    state[`sample${slot}Start`] = 0;
    state[`sample${slot}End`] = 1;
    renderSampleState(slot);
    persistSession();
    showToast(`${metadata.name} lastet i Sample ${slot}`);
  } catch (error) { showToast(error.message); }
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value === 0) return '0 kB';
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} kB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function stopLibraryPreview() {
  libraryPreview?.pause();
  libraryPreview = null;
  if (libraryPreviewUrl) URL.revokeObjectURL(libraryPreviewUrl);
  libraryPreviewUrl = '';
}

function libraryButton(label, handler, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `button ${className}`.trim();
  button.textContent = label;
  button.addEventListener('click', handler);
  return button;
}

function updateSampleLibraryTarget() {
  const target = $('#sampleLibraryTarget');
  if (sampleLibraryTargetSlot) {
    const label = sampleTargetLabel(sampleLibraryTargetSlot);
    target.textContent = `Mål: ${label}. Velg «Bruk i ${label}» på ønsket fil.`;
    target.dataset.target = sampleLibraryTargetSlot;
  } else {
    target.textContent = 'Administrer biblioteket, eller velg Sample A, B eller en pad for hver fil.';
    delete target.dataset.target;
  }
}

function closeSampleLibraryDialog() {
  const dialog = $('#sampleLibraryDialog');
  if (typeof dialog.close === 'function') dialog.close();
  else {
    dialog.removeAttribute('open');
    finishSampleLibraryClose();
  }
}

function finishSampleLibraryClose() {
  stopLibraryPreview();
  const returnTarget = sampleLibraryReturnTarget;
  sampleLibraryTargetSlot = '';
  sampleLibraryReturnTarget = null;
  updateSampleLibraryTarget();
  if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
}

function openSampleLibrary(targetSlot = '', returnTarget = document.activeElement) {
  const hasLocalProject = Boolean(projectSync?.projectId);
  if (!hasLocalProject) {
    const localProjectEntered = Boolean($('#projectId').value.trim());
    showToast(localProjectEntered
      ? 'Trykk Hent for å åpne det lokale prosjektet før du åpner samplebiblioteket.'
      : 'Koble til eller opprett et lokalt prosjekt før du åpner samplebiblioteket.');
    (localProjectEntered ? $('#loadProject') : $('#projectId')).focus();
    return false;
  }
  sampleLibraryTargetSlot = normalizeLibraryTargetSlot(targetSlot);
  sampleLibraryReturnTarget = returnTarget;
  updateSampleLibraryTarget();
  const dialog = $('#sampleLibraryDialog');
  if (!dialog.open) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  refreshLocalLibrary();
  return true;
}

async function useLocalSample(file, slot) {
  const loaded = await loadLocalSample(file, slot);
  if (loaded && sampleLibraryTargetSlot) closeSampleLibraryDialog();
}

function renderLocalLibrary(files = [], limits = {}) {
  const list = $('#sampleLibraryList');
  list.replaceChildren();
  const totalBytes = files.reduce((sum, file) => sum + Number(file.size || 0), 0);
  $('#sampleLibraryUsage').textContent = `${files.length}/${limits.files || 100} filer · ${formatBytes(totalBytes)}/${formatBytes(limits.bytes || (200 * 1024 * 1024))}`;
  if (!files.length) {
    const empty = document.createElement('p');
    empty.className = 'library-empty';
    empty.textContent = 'Biblioteket er tomt. Velg flere lydfiler over.';
    list.append(empty);
    return;
  }
  for (const file of files) {
    const row = document.createElement('div');
    row.className = 'library-item';
    row.setAttribute('role', 'listitem');
    const info = document.createElement('div');
    info.className = 'library-file';
    const name = document.createElement('strong');
    name.textContent = file.name;
    const details = document.createElement('small');
    const date = file.createdAt ? new Date(file.createdAt).toLocaleDateString('no-NO') : '';
    details.textContent = `${formatBytes(file.size)}${date ? ` · ${date}` : ''}`;
    info.append(name, details);
    const actions = document.createElement('div');
    actions.className = 'library-actions';
    actions.append(libraryButton('Lytt', () => previewLocalSample(file)));
    for (const slot of getLibraryLoadTargets(sampleLibraryTargetSlot)) {
      actions.append(libraryButton(`Bruk i ${sampleTargetLabel(slot)}`, () => useLocalSample(file, slot), 'primary'));
    }
    actions.append(libraryButton('Slett', () => deleteLocalSample(file), 'ghost'));
    row.append(info, actions);
    list.append(row);
  }
}

async function refreshLocalLibrary() {
  try {
    $('#sampleLibraryUsage').textContent = 'Henter…';
    const result = await sampleLibrary.list();
    renderLocalLibrary(result.files, result.limits);
  } catch (error) {
    renderLocalLibrary();
    $('#sampleLibraryUsage').textContent = 'Ikke koblet til';
    showToast(error.message);
  }
}

async function uploadLocalSamples() {
  const input = $('#sampleLibraryFiles');
  const button = $('#uploadSampleLibrary');
  try {
    button.disabled = true;
    button.textContent = 'Laster opp…';
    const result = await sampleLibrary.upload(input.files);
    input.value = '';
    $('#sampleLibrarySelection').textContent = 'Ingen filer valgt';
    renderLocalLibrary((await sampleLibrary.list()).files, { files: 100, bytes: 200 * 1024 * 1024 });
    showToast(`${result.uploaded} filer lagt i det lokale biblioteket`);
  } catch (error) { showToast(error.message); }
  button.textContent = 'Last opp';
  button.disabled = !input.files.length;
}

async function previewLocalSample(file) {
  try {
    stopLibraryPreview();
    const blob = await sampleLibrary.download(file.id);
    libraryPreviewUrl = URL.createObjectURL(blob);
    libraryPreview = new Audio(libraryPreviewUrl);
    libraryPreview.addEventListener('ended', stopLibraryPreview, { once: true });
    await libraryPreview.play();
  } catch (error) { stopLibraryPreview(); showToast(error.message); }
}

async function loadLocalSample(file, slot) {
  const padIndex = padIndexFromTarget(slot);
  const assigned = padIndex >= 0 ? state.pads[padIndex].stored : state.samples[slot].stored;
  if (assigned && !window.confirm(`Erstatt ${sampleTargetLabel(slot)} med ${file.name}?`)) return false;
  try {
    if (!(await ensureAudio())) return;
    const blob = await sampleLibrary.download(file.id);
    try { Object.defineProperty(blob, 'name', { value: file.name }); } catch (_error) { /* Metadata fallback below */ }
    if (padIndex >= 0) {
      await loadPadBlob(padIndex, blob, { name: file.name, type: file.type || blob.type });
      showToast(`${file.name} er lastet fra det lokale biblioteket til Pad ${padIndex + 1}`);
      return true;
    }
    const metadata = { ...(await engine.loadSampleBlob(slot, blob)), name: file.name, type: file.type || blob.type, stored: true };
    await putSample(slot, blob, metadata);
    state.samples[slot] = metadata;
    state[`sample${slot}Start`] = 0;
    state[`sample${slot}End`] = 1;
    renderSampleState(slot);
    persistSession();
    showToast(`${file.name} lastet fra det lokale biblioteket til Sample ${slot}`);
    return true;
  } catch (error) { showToast(error.message); return false; }
}

async function deleteLocalSample(file) {
  if (!window.confirm(`Slett «${file.name}» fra det lokale biblioteket?`)) return;
  try {
    await sampleLibrary.remove(file.id);
    const result = await sampleLibrary.list();
    renderLocalLibrary(result.files, result.limits);
    showToast(`${file.name} er slettet fra det lokale biblioteket`);
  } catch (error) { showToast(error.message); }
}

async function removeSampleSlot(slot) {
  if (state.samples[slot].stored && !window.confirm(`Fjern Sample ${slot} fra denne enheten?`)) return;
  try {
    engine.removeSample(slot);
    await deleteSample(slot);
    state.samples[slot] = clonePreset(defaultPreset).samples[slot];
    renderSampleState(slot);
    persistSession();
  } catch (error) { showToast(error.message); }
}

function toggleBoolean(key) {
  state[key] = !state[key];
  engine.applyState(state);
  renderSourceStates();
  if (key.startsWith('sample')) renderSampleState(key.includes('sampleA') ? 'A' : 'B');
  if (key.startsWith('pad')) refreshPadSampler();
  persistSession();
}

function clearDisabledSourceState(id) {
  const keys = {
    vco: ['synthSolo'], noise: ['noiseSolo', 'noiseDrone'], kick: ['kickSolo'],
    microphone: ['micSolo'], sampleA: ['sampleASolo'], sampleB: ['sampleBSolo'],
    padSampler: ['padSolo'],
  }[id] || [];
  for (const key of keys) state[key] = false;
}

function getModuleState(id) { return state.moduleLayout.find((module) => module.id === id); }

function normalizeModuleOrder() {
  state.moduleLayout.sort((a, b) => a.order - b.order).forEach((module, order) => { module.order = order; });
}

function renderModuleLayout() {
  normalizeModuleOrder();
  const rack = $('#moduleRack');
  for (const layout of state.moduleLayout) {
    const card = document.querySelector(`[data-module-id="${layout.id}"]`);
    if (!card) continue;
    card.hidden = !layout.visible;
    card.classList.toggle('disabled', !layout.enabled);
    if (!focusedModuleIds.includes(layout.id)) rack.append(card);
    ensureModuleEditBar(card, layout);
    ensureModuleFocusButton(card, layout);
  }
  renderModuleDrawer();
  renderFocusWorkspace();
  for (const slot of SAMPLE_SLOTS) updateSampleProgress(slot);
}

function ensureModuleFocusButton(card, layout) {
  let button = card.querySelector(':scope > header .focus-module');
  if (!button) {
    button = editButton('Utvid', `Åpne ${layout.id} i fokusvisning`, () => openModuleFocus(layout.id));
    button.classList.add('focus-module');
    let actions = card.querySelector(':scope > header .module-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'module-actions';
      card.querySelector(':scope > header')?.append(actions);
    }
    actions.append(button);
  }
}

function openModuleFocus(id) {
  const layout = getModuleState(id);
  if (!layout?.visible || focusedModuleIds.includes(id)) return;
  if (focusedModuleIds.length >= 4) { showToast('Fokusvisningen har plass til maksimalt fire moduler'); return; }
  const card = document.querySelector(`[data-module-id="${id}"]`);
  if (!card) return;
  if (!focusedModuleIds.length) focusReturnTarget = document.activeElement;
  const placeholder = document.createComment(`focus:${id}`);
  card.before(placeholder);
  focusPlaceholders.set(id, placeholder);
  focusedModuleIds.push(id);
  $('#focusGrid').append(card);
  card.classList.add('focused-module');
  renderFocusWorkspace();
  $('#focusWorkspace').hidden = false;
  document.body.classList.add('focus-open');
  $('#closeFocusWorkspace').focus();
}

function closeModuleFocus(id) {
  const index = focusedModuleIds.indexOf(id);
  if (index < 0) return;
  const card = document.querySelector(`[data-module-id="${id}"]`);
  const placeholder = focusPlaceholders.get(id);
  card?.classList.remove('focused-module');
  if (card && placeholder?.parentNode) placeholder.replaceWith(card);
  focusPlaceholders.delete(id);
  focusedModuleIds.splice(index, 1);
  renderFocusWorkspace();
  if (!focusedModuleIds.length) {
    $('#focusWorkspace').hidden = true;
    document.body.classList.remove('focus-open');
    focusReturnTarget?.focus?.();
    focusReturnTarget = null;
    renderModuleLayout();
  }
}

function closeAllModuleFocus() {
  for (const id of [...focusedModuleIds]) closeModuleFocus(id);
}

function moveFocusedModule(id, delta) {
  const index = focusedModuleIds.indexOf(id);
  const target = Math.max(0, Math.min(focusedModuleIds.length - 1, index + delta));
  if (index < 0 || index === target) return;
  focusedModuleIds.splice(index, 1);
  focusedModuleIds.splice(target, 0, id);
  renderFocusWorkspace();
}

function renderFocusWorkspace() {
  const workspace = $('#focusWorkspace');
  if (!workspace) return;
  const grid = $('#focusGrid');
  grid.dataset.count = String(focusedModuleIds.length);
  for (const id of focusedModuleIds) {
    const card = document.querySelector(`[data-module-id="${id}"]`);
    if (!card) continue;
    grid.append(card);
    let toolbar = card.querySelector(':scope > .focus-card-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'focus-card-toolbar';
      toolbar.append(
        editButton('←', `Flytt ${id} til venstre`, () => moveFocusedModule(id, -1)),
        editButton('→', `Flytt ${id} til høyre`, () => moveFocusedModule(id, 1)),
        editButton('Lukk', `Lukk ${id} i fokusvisning`, () => closeModuleFocus(id)),
      );
      card.prepend(toolbar);
    }
  }
  const picker = $('#focusModulePicker');
  picker?.replaceChildren(...state.moduleLayout
    .filter((layout) => layout.visible && !focusedModuleIds.includes(layout.id))
    .map((layout) => editButton(`+ ${MODULE_DEFINITIONS.find((item) => item.id === layout.id)?.label || layout.id}`, `Legg ${layout.id} til fokusvisningen`, () => openModuleFocus(layout.id))));
  $('#focusCount').textContent = `${focusedModuleIds.length} / 4 moduler`;
}

function ensureModuleEditBar(card, layout) {
  let bar = card.querySelector('.module-edit-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'module-edit-bar';
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'drag-handle';
    handle.textContent = '☰ Flytt';
    handle.setAttribute('aria-label', `Flytt ${layout.id}`);
    handle.addEventListener('pointerdown', (event) => startModuleDrag(event, layout.id));
    const before = editButton('←', `Flytt ${layout.id} før`, () => moveModule(layout.id, -1));
    const after = editButton('→', `Flytt ${layout.id} etter`, () => moveModule(layout.id, 1));
    const definition = MODULE_DEFINITIONS.find((module) => module.id === layout.id);
    if (definition?.disableable) bar.append(handle, before, after, editButton('Av/på', `Aktiver eller deaktiver ${layout.id}`, () => toggleModule(layout.id)));
    else bar.append(handle, before, after);
    bar.append(editButton('Fjern', `Fjern ${layout.id}`, () => hideModule(layout.id)));
    card.prepend(bar);
  }
  const toggle = [...bar.children].find((button) => button.textContent === 'Av/på');
  toggle?.classList.toggle('active', !layout.enabled);
}

function editButton(text, label, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'edit-mini';
  button.textContent = text;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', handler);
  return button;
}

function renderModuleDrawer() {
  const drawer = $('#moduleDrawer');
  drawer.replaceChildren();
  for (const layout of state.moduleLayout.filter((module) => !module.visible)) {
    const definition = MODULE_DEFINITIONS.find((module) => module.id === layout.id);
    drawer.append(editButton(`+ ${definition?.label || layout.id}`, `Legg tilbake ${layout.id}`, () => {
      layout.visible = true;
      renderModuleLayout();
      persistSession();
    }));
  }
  if (!drawer.children.length) {
    const empty = document.createElement('span');
    empty.className = 'source-status';
    empty.textContent = 'Ingen skjulte moduler';
    drawer.append(empty);
  }
}

function toggleModule(id) {
  const layout = getModuleState(id);
  if (!layout) return;
  layout.enabled = !layout.enabled;
  if (!layout.enabled) {
    closeModuleFocus(id);
    clearDisabledSourceState(id);
    if (id === 'microphone') engine.stopMicrophone();
    if (id === 'sampleA' || id === 'sampleB') stopSamplePlayback(id.at(-1).toUpperCase());
    if (id === 'padSampler') stopAllPadPlayback();
    if (id === 'sequencer') {
      stopSequencer();
      resetSequencerSelection({ render: true, announce: true });
    }
  }
  engine.applyState(state);
  renderSourceStates();
  renderModuleLayout();
  persistSession();
}

function hideModule(id) {
  const layout = getModuleState(id);
  if (!layout) return;
  layout.visible = false;
  closeModuleFocus(id);
  const definition = MODULE_DEFINITIONS.find((module) => module.id === id);
  if (definition?.disableable) layout.enabled = false;
  clearDisabledSourceState(id);
  if (id === 'microphone') engine.stopMicrophone();
  if (id === 'sampleA' || id === 'sampleB') stopSamplePlayback(id.at(-1).toUpperCase());
  if (id === 'padSampler') stopAllPadPlayback();
  if (id === 'sequencer') {
    stopSequencer();
    resetSequencerSelection({ render: true, announce: true });
  }
  engine.applyState(state);
  renderSourceStates();
  renderModuleLayout();
  persistSession();
}

function moveModule(id, delta) {
  normalizeModuleOrder();
  const index = state.moduleLayout.findIndex((module) => module.id === id);
  const target = Math.max(0, Math.min(state.moduleLayout.length - 1, index + delta));
  if (index === target) return;
  const [module] = state.moduleLayout.splice(index, 1);
  state.moduleLayout.splice(target, 0, module);
  normalizeModuleOrder();
  renderModuleLayout();
  persistSession();
}

function startModuleDrag(event, id) {
  if (!editingModules) return;
  event.preventDefault();
  draggedModuleId = id;
  const card = $(`[data-module-id="${id}"]`);
  card.classList.add('dragging');
  event.currentTarget.setPointerCapture(event.pointerId);
  const move = (moveEvent) => {
    const target = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY)?.closest('[data-module-id]');
    document.querySelectorAll('.module.drop-target').forEach((module) => module.classList.remove('drop-target'));
    if (target && target.dataset.moduleId !== draggedModuleId) target.classList.add('drop-target');
  };
  const finish = (upEvent) => {
    const target = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest('[data-module-id]');
    if (target && target.dataset.moduleId !== draggedModuleId) {
      normalizeModuleOrder();
      const from = state.moduleLayout.findIndex((module) => module.id === draggedModuleId);
      const to = state.moduleLayout.findIndex((module) => module.id === target.dataset.moduleId);
      const [module] = state.moduleLayout.splice(from, 1);
      state.moduleLayout.splice(to, 0, module);
    }
    card.classList.remove('dragging');
    document.querySelectorAll('.module.drop-target').forEach((module) => module.classList.remove('drop-target'));
    draggedModuleId = '';
    event.currentTarget.removeEventListener('pointermove', move);
    event.currentTarget.removeEventListener('pointerup', finish);
    event.currentTarget.removeEventListener('pointercancel', finish);
    renderModuleLayout();
    persistSession();
  };
  event.currentTarget.addEventListener('pointermove', move);
  event.currentTarget.addEventListener('pointerup', finish);
  event.currentTarget.addEventListener('pointercancel', finish);
}

function setEditingModules(enabled) {
  editingModules = Boolean(enabled);
  document.body.classList.toggle('editing', editingModules);
  $('#moduleEditor').hidden = !editingModules;
  $('#editModules').textContent = editingModules ? 'Redigerer…' : 'Rediger moduler';
  $('#editModules').classList.toggle('active', editingModules);
  renderModuleLayout();
}

function resetModuleLayout() {
  if (!window.confirm('Nullstill modulrekkefølge og skjulte moduler? Lydinnstillinger beholdes.')) return;
  state.moduleLayout = clonePreset({ moduleLayout: DEFAULT_MODULE_LAYOUT }).moduleLayout;
  renderModuleLayout();
  persistSession();
}

function selectedStepIndexes() {
  return sortedStepIndexes(selectedSynthSteps, state.sequenceSteps);
}

function formatSelectedStepNumbers(indexes = selectedStepIndexes()) {
  return indexes.map((index) => index + 1).join(', ');
}

function updateMultiSelectStepsButton() {
  const button = $('#multiSelectSteps');
  if (!button) return;
  button.textContent = multiSelectSteps ? 'Velg flere · på' : 'Velg flere · av';
  button.classList.toggle('active', multiSelectSteps);
  button.setAttribute('aria-pressed', String(multiSelectSteps));
}

function setSequencerSelectionStatus(message = '') {
  const status = $('#sequencerSelectionStatus');
  if (!status) return;
  const indexes = selectedStepIndexes();
  if (message) status.textContent = message;
  else if (multiSelectSteps) {
    status.textContent = indexes.length
      ? `${indexes.length} valgt: trinn ${formatSelectedStepNumbers(indexes)}.`
      : 'Flervalg er på. Velg ett eller flere trinn.';
  } else {
    status.textContent = indexes.length
      ? `Trinn ${indexes[0] + 1} er valgt for redigering.`
      : 'Enkeltvalg er på. ● betyr aktiv, ✓ betyr valgt og ▶ betyr spiller.';
  }
}

function resetSequencerSelection({ exitMultiSelect = true, render = false, announce = false } = {}) {
  selectedSynthSteps = new Set();
  activeStepAdjustment = null;
  if (exitMultiSelect) multiSelectSteps = false;
  updateMultiSelectStepsButton();
  if (render) renderSteps();
  if (announce) setSequencerSelectionStatus(exitMultiSelect ? 'Trinnutvalget er ryddet. Enkeltvalg er på.' : '');
}

function toggleMultiSelectSteps() {
  multiSelectSteps = !multiSelectSteps;
  activeStepAdjustment = null;
  if (!multiSelectSteps) selectedSynthSteps.clear();
  renderSteps();
  setSequencerSelectionStatus(
    multiSelectSteps
      ? 'Flervalg er på. Trykk på trinn for å legge dem til eller fjerne dem uten å endre Aktiv / av.'
      : 'Flervalg er av og trinnutvalget er ryddet. Enkeltvalg er på.',
  );
}

function renderSteps() {
  const noteContainer = $('#noteSteps');
  noteContainer.replaceChildren();
  selectedSynthSteps = pruneStepSelection(selectedSynthSteps, state.sequenceSteps);
  for (let index = 0; index < state.sequenceSteps; index += 1) noteContainer.append(createStep(index));
  updateMultiSelectStepsButton();
  renderStepEditor();
}

function renderSequenceLength() {
  createSegmentButtons(
    $('#sequenceLengthButtons'),
    [4, 8, 16].map((value) => ({ value, label: `${value} trinn` })),
    'sequenceSteps',
    () => {
      const before = selectedSynthSteps.size;
      selectedSynthSteps = pruneStepSelection(selectedSynthSteps, state.sequenceSteps);
      renderSteps();
      setSequencerSelectionStatus(
        before > selectedSynthSteps.size
          ? `Utvalget er avgrenset til de ${state.sequenceSteps} synlige trinnene.`
          : '',
      );
    },
  );
}

function createStep(index) {
  const step = state.synthSteps[index];
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'step';
  button.dataset.step = String(index);
  button.dataset.kind = 'synth';
  updateStepButtonState(button, step, index, selectedSynthSteps.has(index));
  bindStepButtonSelection(button, {
    step,
    index,
    kind: 'synth',
    steps: state.synthSteps,
    isMultiSelect: () => multiSelectSteps,
    getSelectedIndexes: () => selectedSynthSteps,
    setSelectedIndexes: (nextSelected) => { selectedSynthSteps = nextSelected; },
    updateButton: updateStepButtonState,
    renderEditor: renderStepEditor,
    persist: persistSession,
    onSelectionChange: (action, selection) => {
      const count = selection.size;
      const messages = {
        activated: `Trinn ${index + 1} er slått på.`,
        deactivated: `Trinn ${index + 1} er slått av.`,
        edit: `Trinn ${index + 1} er valgt for redigering.`,
        selected: `Trinn ${index + 1} er lagt til. ${count} valgt.`,
        deselected: `Trinn ${index + 1} er fjernet. ${count} valgt.`,
      };
      setSequencerSelectionStatus(messages[action]);
    },
  });
  return button;
}

function updateStepButtonState(button, step, index, selected = false) {
  const playing = button.classList.contains('playing');
  button.classList.toggle('active', step.active);
  button.classList.toggle('selected', selected);
  button.dataset.active = String(step.active);
  button.dataset.selected = String(selected);
  button.dataset.playing = String(playing);
  button.setAttribute('aria-pressed', String(multiSelectSteps ? selected : step.active));
  button.setAttribute('aria-controls', 'synthStepEditor');
  button.setAttribute('aria-expanded', String(selected));
  if (playing) button.setAttribute('aria-current', 'step');
  else button.removeAttribute('aria-current');

  let note = button.querySelector('.step-note');
  let flags = button.querySelector('.step-flags');
  if (!note || !flags) {
    note = document.createElement('span');
    note.className = 'step-note';
    flags = document.createElement('span');
    flags.className = 'step-flags';
    flags.setAttribute('aria-hidden', 'true');
    button.replaceChildren(note, flags);
  }
  note.textContent = NOTE_NAMES[((step.note % 12) + 12) % 12];
  flags.textContent = `${step.active ? '●' : '○'}${selected ? ' ✓' : ''}${playing ? ' ▶' : ''}`;

  const stateDescription = `${step.active ? 'på' : 'av'}${selected ? ', valgt for redigering' : ''}${playing ? ', spiller nå' : ''}.`;
  const next = multiSelectSteps
    ? (selected ? 'Trykk for å fjerne fra utvalget.' : 'Trykk for å legge til i utvalget.')
    : !step.active
      ? 'Aktiver for å slå på.'
      : selected
        ? 'Aktiver for å slå av.'
        : 'Aktiver for å åpne redigering.';
  button.setAttribute('aria-label', `Synth trinn ${index + 1}, ${stateDescription} ${next}`);
}

function updateSelectedStepButtons(indexes = selectedStepIndexes()) {
  for (const index of indexes) {
    const button = document.querySelector(`[data-kind="synth"][data-step="${index}"]`);
    if (button) updateStepButtonState(button, state.synthSteps[index], index, selectedSynthSteps.has(index));
  }
}

const STEP_FIELDS = Object.freeze({
  synth: [
    { key: 'note', label: 'Pitch', min: -24, max: 24, step: 1, format: (value) => `${value >= 0 ? '+' : ''}${value} st` },
    { key: 'velocity', label: 'Velocity / nivå', min: 0, max: 1, step: 0.01, format: percent },
    { key: 'gate', label: 'Gate-lengde', min: 0.1, max: 1, step: 0.01, format: percent },
    { key: 'ratchet', label: 'Ratchet', min: 1, max: 4, step: 1, format: (value) => `${value}×` },
  ],
});

function percent(value) { return `${Math.round(Number(value) * 100)}%`; }

function renderStepEditor() {
  activeStepAdjustment = null;
  const indexes = selectedStepIndexes();
  const container = $('#synthStepEditor');
  if (!container) return;
  container.replaceChildren();
  container.hidden = !indexes.length && !multiSelectSteps;
  if (container.hidden) return;

  const heading = document.createElement('div');
  heading.className = 'step-editor-heading';
  const title = document.createElement('strong');
  title.textContent = indexes.length === 1 ? `Synth · trinn ${indexes[0] + 1}` : `Synth · ${indexes.length} trinn valgt`;
  heading.append(title);
  container.append(heading);

  if (!indexes.length) {
    const empty = document.createElement('p');
    empty.className = 'step-editor-summary';
    empty.textContent = 'Velg ett eller flere trinn. Aktiv / av endres ikke når flervalg er på.';
    container.append(empty);
    return;
  }

  const summary = document.createElement('p');
  summary.className = 'step-editor-summary';
  summary.textContent = `Valgte trinn: ${formatSelectedStepNumbers(indexes)}`;
  container.append(summary);

  const controls = document.createElement('div');
  controls.className = 'step-editor-controls';
  for (const field of STEP_FIELDS.synth) controls.append(createStepSlider(indexes, field));
  container.append(controls);

  const discrete = document.createElement('div');
  discrete.className = 'step-discrete-controls';
  discrete.append(
    createStepBooleanControl(indexes, 'active', 'Aktiv / av'),
    createStepBooleanControl(indexes, 'slide', 'Slide / tie'),
  );
  container.append(discrete);

  const help = document.createElement('p');
  help.id = 'stepActionHelp';
  help.className = 'step-editor-summary';
  help.textContent = !canCopyStepSelection(indexes, state.sequenceSteps)
    ? 'Kopier krever nøyaktig ett valgt trinn. Lim inn og Nullstill valgte krever bekreftelse.'
    : stepClipboard
      ? 'Lim inn og Nullstill valgte krever bekreftelse.'
      : 'Kopier dette trinnet før Lim inn på valgte kan brukes.';
  container.append(help);

  const actions = document.createElement('div');
  actions.className = 'step-editor-actions';
  const copy = editButton('Kopier', `Kopier trinn ${indexes[0] + 1}`, copySelectedStep);
  copy.disabled = !canCopyStepSelection(indexes, state.sequenceSteps);
  copy.setAttribute('aria-describedby', help.id);
  const paste = editButton('Lim inn på valgte', `Lim inn kopiert state på valgte trinn ${formatSelectedStepNumbers(indexes)}`, pasteSelectedSteps);
  paste.disabled = !stepClipboard;
  paste.setAttribute('aria-describedby', help.id);
  const reset = editButton('Nullstill valgte', `Nullstill valgte trinn ${formatSelectedStepNumbers(indexes)}`, resetSelectedSteps);
  reset.setAttribute('aria-describedby', help.id);
  actions.append(copy, paste, reset);
  container.append(actions);
}

function createStepSlider(indexes, field) {
  const row = document.createElement('div');
  row.className = 'step-control';
  const id = `synth-step-${field.key}`;
  const caption = document.createElement('label');
  caption.htmlFor = id;
  caption.textContent = field.label;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'range';
  input.min = field.min;
  input.max = field.max;
  input.step = field.step;
  input.setAttribute('aria-label', `${field.label} for valgte trinn ${formatSelectedStepNumbers(indexes)}`);
  const output = document.createElement('output');
  output.setAttribute('for', id);
  const setEqual = editButton('Sett likt', `Sett ${field.label} likt for valgte trinn`, () => {
    setSelectedNumericValue(state.synthSteps, selectedSynthSteps, field, input.value);
    activeStepAdjustment = null;
    updateSelectedStepButtons();
    renderStepEditor();
    persistSession();
    setSequencerSelectionStatus(`${field.label} er satt likt for ${indexes.length} trinn.`);
    showToast(`${field.label}: samme verdi på valgte trinn`);
  });
  setEqual.classList.add('set-equal');

  const refresh = () => {
    const selectionState = numericSelectionState(state.synthSteps, selectedSynthSteps, field);
    if (!selectionState) return;
    input.value = String(selectionState.reference);
    const formatted = field.format(selectionState.reference);
    output.textContent = selectionState.mixed ? `Blandet · ref ${formatted}` : formatted;
    input.setAttribute('aria-valuetext', selectionState.mixed ? `Blandet, referanse ${formatted}` : formatted);
    input.style.setProperty('--fill', `${((selectionState.reference - field.min) / (field.max - field.min)) * 100}%`);
  };
  const beginAdjustment = () => {
    activeStepAdjustment = createRelativeStepAdjustment(
      state.synthSteps,
      selectedSynthSteps,
      field,
      input.value,
    );
  };
  const finishAdjustment = () => {
    if (activeStepAdjustment?.key === field.key) activeStepAdjustment = null;
  };
  input.addEventListener('pointerdown', beginAdjustment);
  input.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key) && !activeStepAdjustment) {
      beginAdjustment();
    }
  });
  input.addEventListener('input', () => {
    const signature = `${field.key}:${selectedStepIndexes().join(',')}`;
    if (!activeStepAdjustment || activeStepAdjustment.signature !== signature) beginAdjustment();
    const changed = applyRelativeStepAdjustment(state.synthSteps, activeStepAdjustment, input.value, field);
    if (field.key === 'note') updateSelectedStepButtons(changed.map(({ index }) => index));
    refresh();
    persistSession();
  });
  for (const eventName of ['change', 'pointerup', 'pointercancel', 'blur']) input.addEventListener(eventName, finishAdjustment);
  refresh();
  row.append(caption, input, output, setEqual);
  return row;
}

function createStepBooleanControl(indexes, key, label) {
  const row = document.createElement('div');
  row.className = 'step-discrete-control';
  const caption = document.createElement('span');
  caption.textContent = label;
  const output = document.createElement('output');
  const group = document.createElement('div');
  group.className = 'step-boolean-actions';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', `${label} for valgte trinn`);
  const selectionState = booleanSelectionState(state.synthSteps, selectedSynthSteps, key);
  output.textContent = selectionState?.mixed ? 'Blandet' : selectionState?.value ? 'På' : 'Av';
  for (const value of [true, false]) {
    const labelValue = value ? 'På' : 'Av';
    const button = editButton(labelValue, `Sett ${label} ${labelValue.toLowerCase()} for valgte trinn`, () => {
      setSelectedBooleanValue(state.synthSteps, selectedSynthSteps, key, value);
      updateSelectedStepButtons();
      renderStepEditor();
      persistSession();
      setSequencerSelectionStatus(`${label} er satt ${labelValue.toLowerCase()} for ${indexes.length} trinn.`);
    });
    button.setAttribute('aria-pressed', String(!selectionState?.mixed && selectionState?.value === value));
    button.classList.toggle('active', !selectionState?.mixed && selectionState?.value === value);
    group.append(button);
  }
  row.append(caption, output, group);
  return row;
}

function copySelectedStep() {
  const indexes = selectedStepIndexes();
  if (!canCopyStepSelection(indexes, state.sequenceSteps)) {
    showToast('Kopier krever nøyaktig ett valgt trinn');
    return;
  }
  stepClipboard = structuredClone(state.synthSteps[indexes[0]]);
  renderStepEditor();
  showToast(`Trinn ${indexes[0] + 1} er kopiert`);
}

function pasteSelectedSteps() {
  const indexes = selectedStepIndexes();
  if (!stepClipboard || !indexes.length) {
    showToast('Kopier først ett synthtrinn');
    return;
  }
  const confirmed = runConfirmedStepAction(
    (message) => window.confirm(message),
    `Lim inn det kopierte trinnet på ${indexes.length} valgte trinn?`,
    () => {
      for (const index of indexes) state.synthSteps[index] = createSynthStep(index, stepClipboard);
    },
  );
  if (!confirmed) {
    setSequencerSelectionStatus('Lim inn på valgte ble avbrutt. Ingen trinn ble endret.');
    return;
  }
  renderSteps();
  persistSession();
  showToast(`Limte inn på ${indexes.length} valgte trinn`);
}

function resetSelectedSteps() {
  const indexes = selectedStepIndexes();
  if (!indexes.length) return;
  const confirmed = runConfirmedStepAction(
    (message) => window.confirm(message),
    `Nullstill ${indexes.length} valgte trinn til standardverdier?`,
    () => {
      for (const index of indexes) state.synthSteps[index] = createSynthStep(index, { active: false, note: 0 });
    },
  );
  if (!confirmed) {
    setSequencerSelectionStatus('Nullstill valgte ble avbrutt. Ingen trinn ble endret.');
    return;
  }
  renderSteps();
  persistSession();
  showToast(`${indexes.length} valgte trinn er nullstilt`);
}

function renderKeyboard() {
  const keyboard = $('#keyboard');
  keyboard.replaceChildren();
  for (let semitone = 0; semitone <= 12; semitone += 1) {
    const midi = (octave + 1) * 12 + semitone;
    const black = [1, 3, 6, 8, 10].includes(semitone % 12);
    const key = document.createElement('button');
    key.type = 'button';
    key.className = `key${black ? ' black' : ''}`;
    key.dataset.note = String(midi);
    key.setAttribute('aria-label', `${NOTE_NAMES[semitone % 12]}${octave + Math.floor(semitone / 12)}`);
    key.innerHTML = `<span>${NOTE_NAMES[semitone % 12]}${octave + Math.floor(semitone / 12)}</span>`;
    key.addEventListener('pointerdown', async (event) => {
      event.preventDefault();
      key.setPointerCapture(event.pointerId);
      if (!(await ensureAudio())) return;
      activePointers.set(event.pointerId, midi);
      key.classList.add('active');
      engine.noteOn(midi, 0.92);
    });
    const release = (event) => {
      if (!activePointers.has(event.pointerId)) return;
      const note = activePointers.get(event.pointerId);
      activePointers.delete(event.pointerId);
      key.classList.remove('active');
      engine.noteOff(note);
    };
    key.addEventListener('pointerup', release);
    key.addEventListener('pointercancel', release);
    keyboard.append(key);
  }
  $('#octaveValue').textContent = `C${octave}–C${octave + 1}`;
}

function baseMidiNote() { return (octave + 1) * 12; }

async function toggleSequencer() {
  if (!isModuleEnabled(state, 'sequencer')) { showToast('Sequencer-modulen er slått av'); return; }
  if (!sequenceRunning && !(await ensureAudio())) return;
  if (sequenceRunning) {
    stopSequencer();
    return;
  }
  sequenceRunning = true;
  sequencePausedForAudio = false;
  $('#sequencerToggle').textContent = sequenceRunning ? 'Stopp' : 'Start';
  $('#sequencerToggle').classList.toggle('active', sequenceRunning);
  currentStep = 0;
  nextStepTime = engine.context.currentTime + 0.05;
  sequenceTimer = window.setInterval(scheduleSequence, SEQUENCER_TICK_MS);
  scheduleSequence();
}

function stopSequencer() {
  sequenceRunning = false;
  sequencePausedForAudio = false;
  window.clearInterval(sequenceTimer);
  sequenceTimer = 0;
  engine.cancelSequencerSchedule();
  pendingVisualSteps.length = 0;
  $('#sequencerToggle').textContent = 'Start';
  $('#sequencerToggle').classList.remove('active');
  clearPlayingSteps();
}

function pauseSequencerForAudioLifecycle() {
  if (!sequenceRunning || sequencePausedForAudio) return;
  sequencePausedForAudio = true;
  window.clearInterval(sequenceTimer);
  sequenceTimer = 0;
  currentStep = resolveSequencerResumeStep(
    pendingVisualSteps,
    currentStep,
    engine.context?.currentTime,
  );
  engine.cancelSequencerSchedule();
  pendingVisualSteps.length = 0;
  clearPlayingSteps();
}

function resumeSequencerForAudioLifecycle() {
  if (!sequenceRunning || !sequencePausedForAudio || engine.context?.state !== 'running') return;
  sequencePausedForAudio = false;
  nextStepTime = engine.context.currentTime + 0.05;
  window.clearInterval(sequenceTimer);
  sequenceTimer = window.setInterval(scheduleSequence, SEQUENCER_TICK_MS);
  scheduleSequence();
}

function scheduleSequence() {
  if (!sequenceRunning || sequencePausedForAudio || engine.context?.state !== 'running') return;
  const now = engine.context.currentTime;
  if (nextStepTime < now + SEQUENCER_RECOVERY_MARGIN) {
    let skipped = 0;
    while (nextStepTime < now + SEQUENCER_RECOVERY_MARGIN && skipped < 32) {
      const stepLength = (60 / state.tempo) / 4;
      const swingFactor = currentStep % 2 === 0 ? 1 + state.swing : 1 - state.swing;
      nextStepTime += stepLength * swingFactor;
      currentStep = (currentStep + 1) % 16;
      skipped += 1;
    }
  }
  const horizon = now + SEQUENCER_LOOKAHEAD_SECONDS;
  while (nextStepTime < horizon) {
    const step = currentStep;
    const synthStep = step % state.sequenceSteps;
    const stepLength = (60 / state.tempo) / 4;
    const synth = state.synthSteps[synthStep];
    if (synth.active) {
      engine.triggerKick(nextStepTime, { sequence: true });
      const interval = stepLength / synth.ratchet;
      const previousIndex = (synthStep - 1 + state.sequenceSteps) % state.sequenceSteps;
      const slideFrom = state.synthSteps[previousIndex].slide ? baseMidiNote() + state.synthSteps[previousIndex].note : null;
      for (let ratchet = 0; ratchet < synth.ratchet; ratchet += 1) {
        engine.scheduleNote(baseMidiNote() + synth.note, nextStepTime + ratchet * interval, interval * state.gate * synth.gate, synth.velocity, ratchet === 0 ? slideFrom : null);
      }
    }
    pendingVisualSteps.push({ time: nextStepTime, step, synthStep });
    const swingFactor = step % 2 === 0 ? 1 + state.swing : 1 - state.swing;
    nextStepTime += stepLength * swingFactor;
    currentStep = (currentStep + 1) % 16;
  }
}

function highlightStep(step) {
  clearPlayingSteps();
  const button = document.querySelector(`[data-kind="synth"][data-step="${step}"]`);
  if (!button) return;
  button.classList.add('playing');
  updateStepButtonState(button, state.synthSteps[step], step, selectedSynthSteps.has(step));
}

function clearPlayingSteps() {
  document.querySelectorAll('.step.playing').forEach((button) => {
    button.classList.remove('playing');
    const index = Number(button.dataset.step);
    updateStepButtonState(button, state.synthSteps[index], index, selectedSynthSteps.has(index));
  });
}

function randomizeSequence() {
  state.synthSteps = state.synthSteps.map((step, index) => createSynthStep(index, { ...step, active: index % 4 === 0 || Math.random() > 0.64, note: [0, 3, 5, 7, 10, 12][Math.floor(Math.random() * 6)], velocity: 0.55 + Math.random() * 0.45 }));
  renderSteps();
  persistSession();
  showToast('Ny variasjon opprettet');
}

function readPresetStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (_error) { return {}; }
}

function renderPresets(selectedName = state.name) {
  const select = $('#presetSelect');
  const saved = readPresetStore();
  select.replaceChildren(new Option('Init', '__init__'));
  for (const name of Object.keys(saved).sort((a, b) => a.localeCompare(b, 'no'))) select.add(new Option(name, name));
  select.value = selectedName === 'Init' ? '__init__' : selectedName;
}

function savePreset() {
  const currentName = state.name === 'Init' ? 'Mitt preset' : state.name;
  const name = window.prompt('Navn på preset', currentName)?.trim();
  if (!name) return;
  const saved = readPresetStore();
  state.name = name.slice(0, 48);
  saved[state.name] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  renderPresets(state.name);
  showToast(`Preset «${state.name}» er lagret lokalt`);
}

async function loadPreset(name) {
  const preset = name === '__init__' ? defaultPreset : readPresetStore()[name];
  const previousPads = state.pads;
  resetSequencerSelection({ render: false });
  state = sanitizePreset(preset);
  for (let index = 0; index < PAD_COUNT; index += 1) {
    if (engine.hasPadSample(index) && !sampleMetadataMatches(state.pads[index], previousPads[index])) {
      engine.removePadSample(index);
    }
  }
  if (engine.context) await hydratePadSamples();
  syncControls();
  showToast(`Lastet ${state.name}`);
}

async function startMicrophone() {
  try {
    if (!(await ensureAudio())) return;
    await engine.startMicrophone();
    state.micMonitoring = false;
    engine.setMicMonitoring(false);
    renderSourceStates();
    showToast('Mikrofonen er klar. Monitoring er av.');
  } catch (error) { showToast(error.message); }
}

function toggleMicMonitoring() {
  if (!state.micMonitoring) {
    const confirmed = window.confirm('Bruk hodetelefoner før monitoring slås på. Høyttalere kan gi kraftig feedback. Har du hodetelefoner på?');
    if (!confirmed) return;
  }
  state.micMonitoring = !state.micMonitoring;
  engine.setMicMonitoring(state.micMonitoring);
  renderSourceStates();
  persistSession();
}

async function toggleMicSampleRecording(slot) {
  try {
    if (!micRecordingSlot) {
      if (state.samples[slot].stored && !window.confirm(`Erstatt Sample ${slot} med et mikrofonopptak?`)) return;
      if (!(await ensureAudio())) return;
      if (!engine.isMicrophoneActive()) await engine.startMicrophone();
      await engine.startMicSampleRecording(slot);
      micRecordingSlot = slot;
      $(`#recordMic${slot}`).classList.add('active');
      $(`#recordMic${slot}`).textContent = `Tar opp ${slot}`;
      $('#stopMicRecord').disabled = false;
      renderSourceStates();
      showToast(`Tar opp mikrofon til Sample ${slot}. Trykk Stopp når opptaket er ferdig.`);
    } else await finishMicSampleRecording();
  } catch (error) { showToast(error.message); }
}

async function finishMicSampleRecording() {
  if (!micRecordingSlot) return;
  const slot = micRecordingSlot;
  try {
    const result = await engine.stopMicSampleRecording();
    await putSample(slot, result.blob, result.metadata);
    state.samples[slot] = result.metadata;
    state[`sample${slot}Start`] = 0;
    state[`sample${slot}End`] = 1;
    renderSampleState(slot);
    persistSession();
    showToast(`Mikrofonopptaket ligger i Sample ${slot}`);
  } catch (error) { showToast(error.message); }
  micRecordingSlot = '';
  for (const candidate of SAMPLE_SLOTS) {
    $(`#recordMic${candidate}`).classList.remove('active');
    $(`#recordMic${candidate}`).textContent = `Mic → ${candidate}`;
  }
  $('#stopMicRecord').disabled = true;
}

function resetMicRecordingUi() {
  micRecordingSlot = '';
  for (const slot of SAMPLE_SLOTS) {
    $(`#recordMic${slot}`).classList.remove('active');
    $(`#recordMic${slot}`).textContent = `Mic → ${slot}`;
  }
  $('#stopMicRecord').disabled = true;
}

async function toggleRecording() {
  try {
    if (!recording) {
      if (!(await ensureAudio())) return;
      await engine.startRecording();
      recording = true;
      $('#recordButton').textContent = 'Stopp opptak';
      $('#recordButton').classList.add('active');
      showToast('Opptak startet');
    } else {
      await engine.stopRecording();
      recording = false;
      $('#recordButton').textContent = 'Ta opp';
      $('#recordButton').classList.remove('active');
      for (const id of ['playRecording', 'downloadRecording', 'downloadWav']) $(`#${id}`).disabled = false;
      showToast('Opptaket er klart');
    }
  } catch (error) { showToast(error.message); }
}

function moduleIsVisible(id) {
  return state.moduleLayout.find((module) => module.id === id)?.visible !== false;
}

function moduleNeedsVisuals(id) {
  if (!moduleIsVisible(id)) return false;
  return !focusedModuleIds.length || focusedModuleIds.includes(id);
}

function updateSequenceVisuals() {
  if (!engine.context || !pendingVisualSteps.length) return;
  const dueTime = engine.context.currentTime + 0.012;
  let latest = null;
  while (pendingVisualSteps[0]?.time <= dueTime) latest = pendingVisualSteps.shift();
  if (latest) highlightStep(latest.synthStep);
}

function updateMeter(name, id, inactive = false) {
  const db = inactive ? -Infinity : engine.getChannelLevel(name);
  const percent = Number.isFinite(db) ? Math.max(0, Math.min(100, ((db + 60) / 60) * 100)) : 0;
  const signature = `${percent.toFixed(1)}:${inactive}`;
  if (lastMeterValues.get(id) === signature) return;
  lastMeterValues.set(id, signature);
  const fill = $(`#${id}`);
  fill.style.width = `${percent}%`;
  const meter = fill.parentElement;
  const level = Number.isFinite(db) ? Math.max(-60, Math.min(0, db)) : -60;
  const text = inactive ? 'Inaktiv' : Number.isFinite(db) ? `${level.toFixed(1)} dB` : '−∞ dB';
  if (meter?.matches('[role="meter"]')) {
    meter.setAttribute('aria-valuenow', String(level));
    meter.setAttribute('aria-valuetext', text);
    meter.classList.toggle('inactive', inactive);
  }
  const output = $(`#${id}Value`);
  if (output) output.textContent = text;
}

function animateScope(timestamp = 0) {
  requestAnimationFrame(animateScope);
  if (document.hidden || !engine.context || timestamp - lastVisualFrame < VISUAL_FRAME_INTERVAL) return;
  lastVisualFrame = timestamp;
  updateSequenceVisuals();
  const playerFrameInterval = reducedMotionQuery.matches ? PLAYER_REDUCED_MOTION_FRAME_INTERVAL : VISUAL_FRAME_INTERVAL;
  const playerNeedsFrame = audioPlaybackView?.waveformLive
    && timestamp - lastPlayerWaveformFrame >= playerFrameInterval;
  const scopeNeedsFrame = moduleNeedsVisuals('scope');
  const data = scopeNeedsFrame || playerNeedsFrame ? engine.getWaveformData(scopeData) : null;

  if (scopeNeedsFrame && data) {
    $('#scopePath').setAttribute('d', masterWaveformPath(data, { height: 96, stride: 8 }));
    const level = engine.getLevel(data);
    $('#outputLevel').textContent = Number.isFinite(level) ? `${Math.max(-60, level).toFixed(1)} dB` : '−∞ dB';
  }
  if (playerNeedsFrame) {
    lastPlayerWaveformFrame = timestamp;
    const level = waveformLevel(data);
    $('#audioPlayerWaveformPath').setAttribute('d', masterWaveformPath(data, {
      stride: reducedMotionQuery.matches ? 8 : 4,
    }));
    const waveformStatus = resolveMasterWaveformStatus({
      playbackState: audioPlaybackView.state,
      hasData: Boolean(data),
      level,
    });
    if ($('#audioPlayerWaveformStatus').textContent !== waveformStatus) {
      $('#audioPlayerWaveformStatus').textContent = waveformStatus;
    }
  }
  for (const [moduleId, name, id] of [
    ['mixer', 'vco', 'synthMeter'], ['mixer', 'noise', 'noiseMeter'], ['mixer', 'kick', 'kickMeter'],
    ['mixer', 'mic', 'micMixerMeter'], ['mixer', 'A', 'sampleAMixerMeter'], ['mixer', 'B', 'sampleBMixerMeter'],
    ['mixer', 'pads', 'padMixerMeter'], ['padSampler', 'pads', 'padMeter'],
    ['microphone', 'mic', 'micMeter'], ['sampleA', 'A', 'sampleAMeter'], ['sampleB', 'B', 'sampleBMeter'],
  ]) {
    if (moduleNeedsVisuals(moduleId)) updateMeter(name, id, name === 'mic' && !engine.isMicrophoneActive());
  }
  for (const slot of SAMPLE_SLOTS) {
    if (moduleNeedsVisuals(`sample${slot}`)) updateSampleProgress(slot);
  }
}

function setMidiConnectionStatus(status = {}) {
  const statusState = status.state || 'disconnected';
  const inputs = midiController?.getInputs?.() || [];
  const enabled = inputs.filter((input) => input.enabled && input.state !== 'disconnected');
  const labels = {
    requesting: 'MIDI: kobler til…',
    connected: enabled.length ? `MIDI: ${enabled.length} aktiv${enabled.length === 1 ? '' : 'e'}` : 'MIDI: ingen aktiv enhet',
    unsupported: 'MIDI: ikke støttet',
    error: 'MIDI: tilkobling feilet',
    disconnected: 'MIDI: ikke koblet',
  };
  const topStatus = $('#midiStatus');
  topStatus.textContent = labels[statusState] || labels.disconnected;
  topStatus.classList.toggle('active', statusState === 'connected' && enabled.length > 0);

  const support = $('#midiSupportMessage');
  if (!support) return;
  const fallback = statusState === 'unsupported'
    ? 'Denne nettleseren støtter ikke Web MIDI. Bruk Chrome eller Edge på en datamaskin; Safari på iPad og iPhone kan ikke koble MIDI direkte.'
    : statusState === 'error'
      ? 'MIDI-tilgangen ble ikke gitt. Kontroller nettlesertillatelsen, koble til enheten og prøv igjen.'
      : statusState === 'connected'
        ? (enabled.length ? `${enabled.length} MIDI-enhet${enabled.length === 1 ? '' : 'er'} er aktivert.` : 'MIDI-tilgang er gitt. Koble til eller aktiver en enhet.')
        : 'Web MIDI fungerer i Chrome og Edge på datamaskin. Safari på iPad og iPhone støtter ikke direkte MIDI-tilkobling.';
  support.textContent = status.message || fallback;
  support.classList.toggle('active', statusState === 'connected');
}

function queueMidiActivity(message) {
  pendingMidiActivity = message;
  if (midiActivityTimer) return;
  midiActivityTimer = window.setTimeout(() => {
    midiActivityTimer = 0;
    const latest = pendingMidiActivity;
    pendingMidiActivity = null;
    if (!latest) return;
    const signal = latest.type === 'cc'
      ? `CC ${latest.number} = ${latest.value}`
      : `Note ${latest.number} ${latest.pressed ? 'på' : 'av'}`;
    const device = latest.deviceName ? ` · ${latest.deviceName}` : '';
    $('#midiActivity').textContent = `Sist mottatt: ${signal} · kanal ${latest.channel}${device}`;
    const status = $('#midiStatus');
    status.classList.add('receiving');
    window.clearTimeout(midiActivityPulseTimer);
    midiActivityPulseTimer = window.setTimeout(() => status.classList.remove('receiving'), 260);
  }, 80);
}

function midiActionMetadata(target) {
  return MIDI_ACTION_TARGETS.find((candidate) => candidate.target.action === target?.action && candidate.target.index === target?.index);
}

function midiTargetLabel(target) {
  if (target?.kind === 'parameter') return MIDI_PARAMETER_BY_KEY.get(target.key)?.label || target.key;
  return midiActionMetadata(target)?.label || target?.action || 'Ukjent mål';
}

function midiTargetValue(target) {
  if (target?.kind === 'parameter') return `parameter:${target.key}`;
  return midiActionMetadata(target)?.value || '';
}

function selectedMidiTarget() {
  const value = $('#midiLearnTarget').value;
  if (value.startsWith('parameter:')) {
    const key = value.slice('parameter:'.length);
    return MIDI_PARAMETER_BY_KEY.has(key) ? { kind: 'parameter', key } : null;
  }
  return MIDI_ACTION_TARGETS.find((candidate) => candidate.value === value)?.target || null;
}

function renderMidiTargets() {
  const parameterGroup = document.querySelector('[data-midi-target-group="continuous"]');
  const actionGroup = document.querySelector('[data-midi-target-group="actions"]');
  parameterGroup.replaceChildren(...CONTINUOUS_PARAMETERS.map((definition) => {
    const option = document.createElement('option');
    option.value = `parameter:${definition.key}`;
    const group = definition.groupLabel || definition.group;
    option.textContent = `${group ? `${group} · ` : ''}${definition.label}`;
    return option;
  }));
  actionGroup.replaceChildren(...MIDI_ACTION_TARGETS.map((definition) => {
    const option = document.createElement('option');
    option.value = definition.value;
    option.textContent = definition.label;
    return option;
  }));
}

function renderMidiDevices() {
  const container = $('#midiDeviceList');
  const inputs = midiController?.getInputs?.() || [];
  if (!inputs.length) {
    const empty = document.createElement('p');
    empty.className = 'midi-empty';
    empty.setAttribute('role', 'listitem');
    empty.textContent = 'Ingen MIDI-enheter er funnet. Koble til en enhet og trykk «Koble til MIDI».';
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...inputs.map((input) => {
    const row = document.createElement('label');
    row.className = 'midi-device-row';
    row.setAttribute('role', 'listitem');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = input.enabled;
    checkbox.dataset.midiInputId = input.id;
    checkbox.setAttribute('aria-label', `Bruk ${input.name || 'MIDI-enhet'}`);
    const text = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = input.name || 'MIDI-enhet';
    const detail = document.createElement('small');
    const manufacturer = input.manufacturer ? `${input.manufacturer} · ` : '';
    detail.textContent = `${manufacturer}${input.state === 'disconnected' ? 'frakoblet' : input.connection === 'open' ? 'tilkoblet' : 'tilgjengelig'}`;
    text.append(name, detail);
    checkbox.addEventListener('change', () => {
      try {
        midiController.setInputEnabled(input.id, checkbox.checked);
      } catch (error) {
        checkbox.checked = !checkbox.checked;
        showToast(error.message);
      }
    });
    row.append(checkbox, text);
    return row;
  }));
}

function midiProfileIsReadOnly(profile) {
  return Boolean(profile?.builtIn || profile?.builtin || profile?.readOnly);
}

function renderMidiProfiles() {
  const select = $('#midiProfileSelect');
  const profiles = midiController?.getProfiles?.() || [];
  const active = midiController?.getActiveProfile?.() || null;
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'Ingen profil valgt';
  select.replaceChildren(empty, ...profiles.map((profile) => {
    const option = document.createElement('option');
    option.value = profile.id;
    const suffix = midiProfileIsReadOnly(profile) ? ' · innebygd' : '';
    option.textContent = `${profile.name}${suffix}`;
    return option;
  }));
  select.value = active?.id || '';
  const locked = midiProfileIsReadOnly(active);
  $('#renameMidiProfile').disabled = !active || locked;
  $('#deleteMidiProfile').disabled = !active || locked;
}

function midiSourceLabel(mapping) {
  const inputs = midiController?.getInputs?.() || [];
  const device = inputs.find((input) => input.id === mapping.source.deviceId);
  const deviceName = mapping.source.deviceId === '*' ? 'Alle enheter' : device?.name || mapping.source.deviceId || 'Ukjent enhet';
  const type = mapping.source.type === 'cc' ? 'CC' : 'Note';
  return `${deviceName} · kanal ${mapping.source.channel} · ${type} ${mapping.source.number}`;
}

function beginMidiRelearn(mapping) {
  const active = midiController.getActiveProfile();
  if (midiProfileIsReadOnly(active)) {
    showToast('Lag først en redigerbar kopi av den innebygde profilen');
    return;
  }
  $('#midiLearnTarget').value = midiTargetValue(mapping.target);
  $('#midiLearnMode').value = mapping.mode;
  $('#midiLearnChannel').value = String(mapping.source.channel);
  try {
    midiLearnMessage = `Beveg ny kontroll for ${midiTargetLabel(mapping.target)}.`;
    midiController.startLearn({
      target: mapping.target,
      mode: mapping.mode,
      channel: mapping.source.channel,
      mappingId: mapping.id,
    });
    $('#midiLearnStatus').focus({ preventScroll: false });
  } catch (error) { showToast(error.message); }
}

function renderMidiMappings() {
  const container = $('#midiMappingList');
  const active = midiController?.getActiveProfile?.() || null;
  const mappings = active ? midiController.getMappings() : [];
  const locked = midiProfileIsReadOnly(active);
  if (!active || !mappings.length) {
    const empty = document.createElement('p');
    empty.className = 'midi-empty';
    empty.setAttribute('role', 'listitem');
    empty.textContent = active ? 'Profilen har ingen MIDI-koblinger ennå.' : 'Velg eller opprett en profil for å bruke MIDI Learn.';
    container.replaceChildren(empty);
    return;
  }
  container.replaceChildren(...mappings.map((mapping) => {
    const row = document.createElement('div');
    row.className = 'midi-mapping-row';
    row.dataset.midiMappingId = mapping.id;
    row.setAttribute('role', 'listitem');

    const enabledLabel = document.createElement('label');
    enabledLabel.className = 'midi-mapping-toggle';
    const enabled = document.createElement('input');
    enabled.type = 'checkbox';
    enabled.checked = mapping.active;
    enabled.disabled = locked;
    enabled.dataset.midiMappingAction = 'toggle';
    enabled.setAttribute('aria-label', `${mapping.active ? 'Deaktiver' : 'Aktiver'} kobling for ${midiTargetLabel(mapping.target)}`);
    enabled.addEventListener('change', () => {
      try {
        midiController.setMappingActive(mapping.id, enabled.checked);
      } catch (error) {
        enabled.checked = !enabled.checked;
        showToast(error.message);
      }
    });
    enabledLabel.append(enabled);

    const summary = document.createElement('div');
    summary.className = 'midi-mapping-summary';
    const name = document.createElement('strong');
    name.textContent = midiTargetLabel(mapping.target);
    const source = document.createElement('small');
    source.textContent = `${midiSourceLabel(mapping)} · ${mapping.mode === 'continuous' ? 'kontinuerlig' : mapping.mode === 'toggle' ? 'av/på' : 'trigger'}${mapping.softTakeover ? ' · soft takeover' : ''}`;
    summary.append(name, source);

    const actions = document.createElement('div');
    actions.className = 'midi-mapping-actions';
    const relearn = document.createElement('button');
    relearn.type = 'button';
    relearn.className = 'button';
    relearn.textContent = 'Lær på nytt';
    relearn.disabled = locked;
    relearn.dataset.midiMappingAction = 'relearn';
    relearn.addEventListener('click', () => beginMidiRelearn(mapping));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'button ghost';
    remove.textContent = 'Slett';
    remove.disabled = locked;
    remove.dataset.midiMappingAction = 'remove';
    remove.addEventListener('click', () => {
      try {
        midiLearnMessage = 'MIDI-koblingen er slettet.';
        midiController.removeMapping(mapping.id);
      } catch (error) { showToast(error.message); }
    });
    actions.append(relearn, remove);
    row.append(enabledLabel, summary, actions);
    return row;
  }));
}

function renderMidiLearnState() {
  const learn = midiController?.getLearnState?.();
  const learning = Boolean(learn?.active ?? learn);
  $('#startMidiLearn').disabled = learning;
  $('#cancelMidiLearn').disabled = !learning;
  const status = $('#midiLearnStatus');
  if (learning) {
    const target = learn.target || selectedMidiTarget();
    status.textContent = midiLearnMessage || `Beveg ønsket fysisk kontroll for ${midiTargetLabel(target)}.`;
    status.classList.add('active');
  } else {
    status.textContent = midiLearnMessage || 'Velg et mål, og beveg deretter ønsket kontroll på MIDI-enheten.';
    status.classList.remove('active');
  }
}

function captureMidiFocus() {
  const active = document.activeElement;
  if (!active?.closest?.('#midiDialog')) return null;
  if (active.id) return { id: active.id };
  if (active.dataset.midiInputId) return { inputId: active.dataset.midiInputId };
  const mappingId = active.closest('[data-midi-mapping-id]')?.dataset.midiMappingId;
  if (mappingId) return { mappingId, action: active.dataset.midiMappingAction || '' };
  return null;
}

function restoreMidiFocus(token) {
  if (!token || !$('#midiDialog').open) return;
  let target = token.id ? document.getElementById(token.id) : null;
  if (!target && token.inputId) {
    target = [...document.querySelectorAll('[data-midi-input-id]')]
      .find((candidate) => candidate.dataset.midiInputId === token.inputId);
  }
  if (!target && token.mappingId) {
    const row = [...document.querySelectorAll('[data-midi-mapping-id]')]
      .find((candidate) => candidate.dataset.midiMappingId === token.mappingId);
    target = [...(row?.querySelectorAll('[data-midi-mapping-action]') || [])]
      .find((candidate) => candidate.dataset.midiMappingAction === token.action);
  }
  (target || $('#midiProfileSelect')).focus({ preventScroll: true });
}

function renderMidiSettings() {
  const focus = captureMidiFocus();
  const dialogScroll = $('#midiDialog').scrollTop;
  const mappingScroll = $('#midiMappingList').scrollTop;
  renderMidiDevices();
  renderMidiProfiles();
  renderMidiMappings();
  renderMidiLearnState();
  $('#midiDialog').scrollTop = dialogScroll;
  $('#midiMappingList').scrollTop = mappingScroll;
  restoreMidiFocus(focus);
}

function handleMidiControllerChange(change = {}) {
  const type = change.type || change.reason || '';
  if (type === 'learn-collision') {
    midiLearnMessage = `Kontrollen er allerede koblet til ${midiTargetLabel(change.collision?.target)}. Velg en annen kontroll eller slett den gamle koblingen.`;
  } else if (type.includes('learn') && type.includes('complete')) midiLearnMessage = 'MIDI-koblingen er lært og lagret.';
  else if (type.includes('mapping') && (change.mapping || type.includes('learn'))) midiLearnMessage = 'MIDI-koblingen er lagret.';
  if (['connected', 'inputs-changed', 'input-enabled-changed'].includes(type)) setMidiConnectionStatus({ state: 'connected' });
  else if (type === 'disconnected') setMidiConnectionStatus({ state: 'disconnected' });
  renderMidiSettings();
}

function applyMidiParameter({ key, value }) {
  if (!MIDI_PARAMETER_BY_KEY.has(key) || !Number.isFinite(Number(value))) return;
  setStateParameterValue(key, Number(value));
  syncRenderedControls(key, getStateParameterValue(key));
  queueAudioParameter(key);
  persistSession();
}

async function applyMidiAction({ action, index, phase, message }) {
  if (phase === 'end') {
    if (action === 'kick-trigger') $('#kickPad').classList.remove('active');
    if (action === 'pad-trigger' && Number.isInteger(index)) {
      const holdKey = `${message?.deviceId}:${message?.channel}:${message?.type}:${message?.number}`;
      heldMidiPadSources.get(index)?.delete(holdKey);
      if (!heldMidiPadSources.get(index)?.size) heldMidiPadSources.delete(index);
    }
    return;
  }
  if (action === 'pad-trigger' && Number.isInteger(index) && index >= 0 && index < PAD_COUNT) {
    const holdKey = `${message?.deviceId}:${message?.channel}:${message?.type}:${message?.number}`;
    if (!heldMidiPadSources.has(index)) heldMidiPadSources.set(index, new Set());
    heldMidiPadSources.get(index).add(holdKey);
    const velocity = message?.type === 'note' ? message.velocity : 1;
    await activatePad(index, velocity);
    return;
  }
  if (action === 'sequence-step-toggle' && Number.isInteger(index) && state.synthSteps[index]) {
    state.synthSteps[index].active = !state.synthSteps[index].active;
    updateSelectedStepButtons([index]);
    if (selectedSynthSteps.has(index)) renderStepEditor();
    persistSession();
    return;
  }
  if (action === 'sequencer-toggle') {
    await toggleSequencer();
    return;
  }
  if (action === 'kick-trigger') {
    if (!(await ensureAudio())) return;
    engine.triggerKick();
    $('#kickPad').classList.add('active');
    window.setTimeout(() => $('#kickPad').classList.remove('active'), 180);
  }
}

async function applyMidiPerformance({ type, note, velocity, channel, deviceId }) {
  const noteKey = `${deviceId}:${channel}:${note}`;
  if (type === 'note-off') {
    activeMidiNotes.delete(noteKey);
    engine.noteOff(note);
    return;
  }
  activeMidiNotes.add(noteKey);
  if (!(await ensureAudio()) || !activeMidiNotes.has(noteKey)) return;
  engine.noteOn(note, velocity);
}

function initializeMidiController() {
  midiController = createMidiController({
    storage: window.localStorage,
    requestMIDIAccess: navigator.requestMIDIAccess
      ? () => navigator.requestMIDIAccess()
      : null,
    getParameterValue: getStateParameterValue,
    onParameterChange: applyMidiParameter,
    onAction: (action) => { void applyMidiAction(action); },
    onPerformance: (message) => { void applyMidiPerformance(message); },
    onMidiMessage: queueMidiActivity,
    onChange: handleMidiControllerChange,
    onStatus: setMidiConnectionStatus,
  });
  renderMidiTargets();
  renderMidiSettings();
  if (!navigator.requestMIDIAccess) setMidiConnectionStatus({ state: 'unsupported' });
}

async function requestMidi({ quiet = false } = {}) {
  if (!midiController) return false;
  try {
    const access = await midiController.connect();
    renderMidiSettings();
    return Boolean(access);
  } catch (error) {
    if (!quiet) showToast(error.message);
    return false;
  }
}

function openMidiSettings(returnTarget = null) {
  midiDialogReturnTarget = returnTarget || document.activeElement;
  renderMidiSettings();
  const dialog = $('#midiDialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  window.setTimeout(() => $('#requestMidiAccess').focus(), 0);
}

function closeMidiSettings() {
  midiController?.cancelLearn?.();
  midiLearnMessage = '';
  const dialog = $('#midiDialog');
  if (dialog.open && typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

function finishMidiSettingsClose() {
  const target = midiDialogReturnTarget;
  midiDialogReturnTarget = null;
  if (target?.isConnected) target.focus();
}

function createMidiProfile() {
  const active = midiController.getActiveProfile();
  const name = window.prompt('Navn på MIDI-profil:', active ? `${active.name} – tilpasset` : 'Min MIDI-profil');
  if (!name?.trim()) return;
  try {
    midiLearnMessage = active ? 'En redigerbar kopi av profilen er opprettet.' : 'MIDI-profilen er opprettet.';
    midiController.createProfile(name.trim(), active ? { fromProfileId: active.id } : {});
  } catch (error) { showToast(error.message); }
}

function renameMidiProfile() {
  const active = midiController.getActiveProfile();
  if (!active || midiProfileIsReadOnly(active)) return;
  const name = window.prompt('Nytt profilnavn:', active.name);
  if (!name?.trim()) return;
  try {
    midiController.renameProfile(active.id, name.trim());
  } catch (error) { showToast(error.message); }
}

function deleteMidiProfile() {
  const active = midiController.getActiveProfile();
  if (!active || midiProfileIsReadOnly(active) || !window.confirm(`Slett MIDI-profilen «${active.name}»?`)) return;
  try {
    midiLearnMessage = 'MIDI-profilen er slettet.';
    midiController.deleteProfile(active.id);
  } catch (error) { showToast(error.message); }
}

function startMidiLearn() {
  let active = midiController.getActiveProfile();
  const target = selectedMidiTarget();
  if (!target) { showToast('Velg først en parameter eller funksjon'); return; }
  if (!active) { showToast('Velg eller opprett først en MIDI-profil'); return; }
  if (midiProfileIsReadOnly(active)) {
    try {
      active = midiController.createProfile(`${active.name} – tilpasset`, { fromProfileId: active.id });
    } catch (error) { showToast(error.message); return; }
  }
  const requestedMode = $('#midiLearnMode').value;
  const action = target.kind === 'action' ? midiActionMetadata(target) : null;
  const mode = requestedMode === 'auto' ? (target.kind === 'parameter' ? 'continuous' : action?.mode || 'toggle') : requestedMode;
  const channelValue = $('#midiLearnChannel').value;
  const channel = channelValue === 'auto' ? null : Number(channelValue);
  try {
    midiLearnMessage = `Beveg ønsket fysisk kontroll for ${midiTargetLabel(target)}.`;
    midiController.startLearn({ target, mode, channel });
  } catch (error) { showToast(error.message); }
}

function cancelMidiLearn() {
  midiLearnMessage = 'MIDI Learn ble avbrutt.';
  midiController.cancelLearn();
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function openInstallInstructions() {
  const dialog = $('#installDialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

async function installApp() {
  if (!deferredInstallPrompt) { openInstallInstructions(); return; }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  if (outcome === 'accepted') $('#installApp').hidden = true;
}

function initializeInstall() {
  $('#installApp').hidden = isStandalone();
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    $('#installApp').hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    $('#installApp').hidden = true;
    showToast('Analog Synthesizer er installert');
  });
}

function clearHeldPerformanceControls() {
  activePointers.clear();
  activeKeys.clear();
  activeMidiNotes.clear();
  heldPadPointers.clear();
  heldPadKeys.clear();
  heldMidiPadSources.clear();
  cancelAllPadActivations();
  activePadUi.clear();
  document.querySelectorAll('.key.active, #kickPad.active, .sample-pad.active').forEach((control) => control.classList.remove('active'));
}

async function stopActiveRecordingsForPanic() {
  let keptDraft = false;
  let keptMasterRecording = false;
  if (engine.isSupportRecordingActive()) {
    await finishRecorderCapture(false);
    keptDraft = Boolean(recorderDraft);
  }
  if (recording) {
    try {
      await engine.stopRecording();
      keptMasterRecording = true;
      for (const id of ['playRecording', 'downloadRecording', 'downloadWav']) $(`#${id}`).disabled = false;
    } catch (_error) { /* Lydstopp og Init-nullstilling skal fortsette */ }
    recording = false;
    $('#recordButton').textContent = 'Ta opp';
    $('#recordButton').classList.remove('active');
  }
  return { keptDraft, keptMasterRecording };
}

async function resetActiveSessionToInit() {
  if (panicResetting) return;
  panicResetting = true;
  const buttons = [...document.querySelectorAll('.panic-action')];
  for (const button of buttons) {
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
  }
  try {
    const preservedPads = state.pads.map((pad) => ({ ...pad }));
    window.clearTimeout(sessionSaveTimer);
    sessionSaveTimer = 0;
    pendingSessionSave = false;
    projectSync?.cancelScheduledSave();
    window.clearTimeout(audioApplyTimer);
    audioApplyTimer = 0;
    pendingAudioParameters.clear();

    stopSequencer();
    stopSharedRecordingPreview();
    stopLibraryPreview();
    engine.stopSupportPreview();
    const recordings = await stopActiveRecordingsForPanic();
    engine.panic();
    engine.stopMicrophone({ force: true });
    resetMicRecordingUi();
    clearHeldPerformanceControls();

    if ($('#sampleEditorDialog').open) closeSampleEditor('panic');
    if ($('#sampleLibraryDialog').open) closeSampleLibraryDialog();
    closeAllModuleFocus();
    setEditingModules(false);

    for (const slot of SAMPLE_SLOTS) {
      engine.removeSample(slot);
      try { await deleteSample(slot); } catch (_error) { /* Bibliotekskilden beholdes; en eventuell lokal cache kan ryddes senere */ }
    }

    state = createInitSession();
    state.pads = preservedPads;
    octave = 3;
    resetSequencerSelection({ render: false });
    stepClipboard = null;
    currentStep = 0;
    nextStepTime = 0;
    syncControls({ persist: false });
    persistLocalSessionOnly();
    setSyncStatus(projectSync?.projectId ? 'Init i aktiv økt · ikke lagret' : 'Kun lokalt', false);

    const preserved = recordings.keptDraft
      ? ' Aktivt opptak er stoppet og beholdt som utkast.'
      : recordings.keptMasterRecording
        ? ' Aktivt masteropptak er stoppet og beholdt.'
        : '';
    showToast(`PANIKK: Aktiv økt er nullstilt til Init. Pad-tilordningene er beholdt.${preserved}`);
  } finally {
    for (const button of buttons) {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
    panicResetting = false;
  }
}

function bindEvents() {
  for (const id of ['audioToggle', 'playerAudioToggle']) $(`#${id}`).addEventListener('click', ensureAudio);
  for (const id of ['audioStop', 'playerAudioStop']) $(`#${id}`).addEventListener('click', stopAudio);
  document.querySelectorAll('.panic-action').forEach((button) => button.addEventListener('click', resetActiveSessionToInit));
  $('#openMidiSettings').addEventListener('click', (event) => openMidiSettings(event.currentTarget));
  $('#closeMidiSettings').addEventListener('click', closeMidiSettings);
  $('#midiDialog').addEventListener('cancel', (event) => { event.preventDefault(); closeMidiSettings(); });
  $('#midiDialog').addEventListener('close', finishMidiSettingsClose);
  $('#requestMidiAccess').addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    try { await requestMidi(); }
    finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }
  });
  $('#midiProfileSelect').addEventListener('change', (event) => {
    try {
      midiLearnMessage = '';
      if (event.target.value) midiController.activateProfile(event.target.value);
      else midiController.deactivateProfile();
    } catch (error) { showToast(error.message); }
  });
  $('#newMidiProfile').addEventListener('click', createMidiProfile);
  $('#renameMidiProfile').addEventListener('click', renameMidiProfile);
  $('#deleteMidiProfile').addEventListener('click', deleteMidiProfile);
  $('#loadMidimixProfile').addEventListener('click', () => {
    try {
      midiLearnMessage = 'Referanseprofilen for to MIDImix er aktivert.';
      midiController.activateProfile(AKAI_MIDIMIX_X2_PROFILE.id);
    } catch (error) { showToast(error.message); }
  });
  $('#startMidiLearn').addEventListener('click', async () => {
    if (!(midiController.getInputs().length || await requestMidi())) return;
    startMidiLearn();
  });
  $('#cancelMidiLearn').addEventListener('click', cancelMidiLearn);
  $('#kickPad').addEventListener('pointerdown', async (event) => {
    event.preventDefault();
    if (!(await ensureAudio())) return;
    engine.triggerKick();
    $('#kickPad').classList.add('active');
  });
  for (const eventName of ['pointerup', 'pointercancel', 'pointerleave']) $('#kickPad').addEventListener(eventName, () => $('#kickPad').classList.remove('active'));
  $('#sequencerToggle').addEventListener('click', toggleSequencer);
  $('#randomizeSequence').addEventListener('click', randomizeSequence);
  $('#multiSelectSteps').addEventListener('click', toggleMultiSelectSteps);
  $('#octaveDown').addEventListener('click', () => { octave = Math.max(1, octave - 1); renderKeyboard(); });
  $('#octaveUp').addEventListener('click', () => { octave = Math.min(6, octave + 1); renderKeyboard(); });
  $('#savePreset').addEventListener('click', savePreset);
  $('#presetSelect').addEventListener('change', (event) => loadPreset(event.target.value));
  $('#resetPreset').addEventListener('click', () => loadPreset('__init__'));
  $('#recordButton').addEventListener('click', toggleRecording);
  $('#playRecording').addEventListener('click', () => engine.playRecording());
  $('#downloadRecording').addEventListener('click', () => engine.downloadRecording());
  $('#downloadWav').addEventListener('click', async () => {
    try { await engine.downloadRecordingAsWav(); } catch (error) { showToast(error.message); }
  });
  $('#openRecorder').addEventListener('click', (event) => openRecorder(event.currentTarget));
  $('#padRecordingLibrary').addEventListener('click', (event) => openRecorder(
    event.currentTarget,
    padTarget(selectedPadIndex),
  ));
  $('#closeRecorder').addEventListener('click', closeRecorder);
  $('#recorderDialog').addEventListener('cancel', (event) => { event.preventDefault(); closeRecorder(); });
  $('#recorderDialog').addEventListener('close', finishRecorderClose);
  $('#startRecorder').addEventListener('click', startRecorderCapture);
  $('#stopRecorder').addEventListener('click', () => finishRecorderCapture(false));
  $('#cancelRecorder').addEventListener('click', cancelRecorderCapture);
  $('#previewRecorder').addEventListener('click', previewRecorderSelection);
  $('#stopRecorderPreview').addEventListener('click', stopRecorderSelection);
  $('#resetRecorderTrim').addEventListener('click', () => {
    if (!recorderDraft) return;
    updateRecorderSelection(0, recorderDraft.duration, 'end');
    setRecorderStatus('Hele opptaket er valgt.');
  });
  $('#discardRecorderDraft').addEventListener('click', () => discardRecorderDraft());
  $('#saveRecorderDraft').addEventListener('click', openRecordingNameDialog);
  $('#cancelRecordingName').addEventListener('click', closeRecordingNameDialog);
  $('#confirmRecordingName').addEventListener('click', saveRecorderDraft);
  $('#recordingName').addEventListener('input', () => { $('#recordingNameError').textContent = ''; });
  $('#recordingName').addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); saveRecorderDraft(); } });
  $('#recordingNameDialog').addEventListener('cancel', (event) => { event.preventDefault(); closeRecordingNameDialog(); });
  $('#recorderStartTime').addEventListener('input', (event) => {
    if (!recorderDraft || event.target.value === '') return;
    updateRecorderSelection(event.target.value, recorderDraft.end, 'start');
  });
  $('#recorderEndTime').addEventListener('input', (event) => {
    if (!recorderDraft || event.target.value === '') return;
    updateRecorderSelection(recorderDraft.start, event.target.value, 'end');
  });
  bindRecorderHandle('recorderStartHandle', 'start');
  bindRecorderHandle('recorderEndHandle', 'end');
  $('#refreshSharedLibrary').addEventListener('click', refreshSharedRecordingLibrary);
  $('#editModules').addEventListener('click', () => setEditingModules(!editingModules));
  $('#installApp').addEventListener('click', installApp);
  $('#closeInstallDialog').addEventListener('click', () => $('#installDialog').close());
  $('#closeSampleEditor').addEventListener('click', () => closeSampleEditor());
  $('#cancelSampleEditor').addEventListener('click', () => closeSampleEditor());
  $('#previewSampleSelection').addEventListener('click', previewSampleEditorSelection);
  $('#stopSampleSelection').addEventListener('click', stopSampleEditorSelection);
  $('#resetSampleSelection').addEventListener('click', resetSampleEditorSelection);
  $('#cropSampleSelection').addEventListener('click', cropSampleEditorSelection);
  $('#sampleEditorDialog').addEventListener('cancel', (event) => {
    if (sampleEditorDraft?.busy) event.preventDefault();
  });
  $('#sampleEditorDialog').addEventListener('close', finishSampleEditorClose);
  $('#sampleEditorStartTime').addEventListener('input', (event) => {
    if (!sampleEditorDraft || event.target.value === '') return;
    updateSampleEditorSelection(event.target.value, sampleEditorDraft.end, 'start');
  });
  $('#sampleEditorEndTime').addEventListener('input', (event) => {
    if (!sampleEditorDraft || event.target.value === '') return;
    updateSampleEditorSelection(sampleEditorDraft.start, event.target.value, 'end');
  });
  bindSampleEditorHandle('sampleEditorStartHandle', 'start');
  bindSampleEditorHandle('sampleEditorEndHandle', 'end');
  $('#closeFocusWorkspace').addEventListener('click', closeAllModuleFocus);
  $('#finishEditing').addEventListener('click', () => setEditingModules(false));
  $('#resetLayout').addEventListener('click', resetModuleLayout);
  $('#createProject').addEventListener('click', async () => {
    try {
      const result = await projectSync.create(state);
      $('#projectId').value = result.projectId;

      showToast(`Lokalt prosjekt opprettet: ${result.projectId}`);
    } catch (error) { projectSync.fail(error); }
  });
  $('#loadProject').addEventListener('click', async () => {
    try {
      await projectSync.load($('#projectId').value);
      $('#projectId').value = projectSync.projectId;
    } catch (error) { projectSync.fail(error); }
  });
  $('#saveProject').addEventListener('click', async () => {
    try {
      projectSync.setLocalProject($('#projectId').value);
      await projectSync.save(state);
    } catch (error) { projectSync.fail(error); }
  });
  $('#openSampleLibrary').addEventListener('click', (event) => openSampleLibrary('', event.currentTarget));
  $('#sampleALibrary').addEventListener('click', (event) => openSampleLibrary('A', event.currentTarget));
  $('#sampleBLibrary').addEventListener('click', (event) => openSampleLibrary('B', event.currentTarget));
  $('#padProjectLibrary').addEventListener('click', (event) => openSampleLibrary(
    padTarget(selectedPadIndex),
    event.currentTarget,
  ));
  $('#closeSampleLibrary').addEventListener('click', closeSampleLibraryDialog);
  $('#sampleLibraryDialog').addEventListener('close', finishSampleLibraryClose);
  $('#refreshSampleLibrary').addEventListener('click', refreshLocalLibrary);
  $('#uploadSampleLibrary').addEventListener('click', uploadLocalSamples);
  $('#sampleLibraryFiles').addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []);
    const bytes = files.reduce((sum, file) => sum + file.size, 0);
    $('#sampleLibrarySelection').textContent = files.length ? `${files.length} filer valgt · ${formatBytes(bytes)}` : 'Ingen filer valgt';
    $('#uploadSampleLibrary').disabled = !files.length;
  });
  const clearLocalData = async () => { if (!window.confirm('Slette alle presets, prosjekter, samples, opptak og MIDI-profiler fra denne nettleseren?')) return; await resetLocalData(); window.location.reload(); };
  $('#resetLocalData').addEventListener('click', clearLocalData);
  $('#resetLocalDataInline').addEventListener('click', clearLocalData);
  $('#forgetProject').addEventListener('click', () => {
    projectSync.forget();
    $('#projectId').value = '';
    renderLocalLibrary();
    showToast('Prosjektet er lukket på denne enheten');
  });

  $('#startMic').addEventListener('click', startMicrophone);
  $('#toggleMicMonitor').addEventListener('click', toggleMicMonitoring);
  $('#stopMic').addEventListener('click', () => {
    engine.stopMicrophone();
    state.micMonitoring = false;
    resetMicRecordingUi();
    renderSourceStates();
    persistSession();
    showToast('Mikrofontilgangen er sluppet');
  });
  $('#micMute').addEventListener('click', () => toggleBoolean('micMute'));
  $('#micSolo').addEventListener('click', () => toggleBoolean('micSolo'));
  $('#synthMute').addEventListener('click', () => toggleBoolean('synthMute'));
  $('#synthSolo').addEventListener('click', () => toggleBoolean('synthSolo'));
  $('#noiseMute').addEventListener('click', () => toggleBoolean('noiseMute'));
  $('#noiseSolo').addEventListener('click', () => toggleBoolean('noiseSolo'));
  $('#noiseDrone').addEventListener('click', () => toggleBoolean('noiseDrone'));
  $('#kickMute').addEventListener('click', () => toggleBoolean('kickMute'));
  $('#kickSolo').addEventListener('click', () => toggleBoolean('kickSolo'));
  $('#padMute').addEventListener('click', () => toggleBoolean('padMute'));
  $('#padSolo').addEventListener('click', () => toggleBoolean('padSolo'));
  $('#recordMicA').addEventListener('click', () => toggleMicSampleRecording('A'));
  $('#recordMicB').addEventListener('click', () => toggleMicSampleRecording('B'));
  $('#stopMicRecord').addEventListener('click', finishMicSampleRecording);
  $('#padFile').addEventListener('change', (event) => {
    void importPad(selectedPadIndex, event.target.files?.[0]);
    event.target.value = '';
  });
  $('#padMode').addEventListener('change', (event) => {
    const mode = event.target.value === 'loop-hold' ? 'loop-hold' : 'one-shot';
    if (state.pads[selectedPadIndex].mode === 'loop-hold' && mode === 'one-shot') {
      stopPadPlayback(selectedPadIndex);
    }
    state.pads[selectedPadIndex].mode = mode;
    refreshPadSampler();
    persistSession();
  });
  $('#padRemove').addEventListener('click', () => removePadSlot(selectedPadIndex));

  for (const slot of SAMPLE_SLOTS) {
    const prefix = `sample${slot}`;
    $(`#${prefix}File`).addEventListener('change', (event) => {
      importSample(slot, event.target.files?.[0]);
      event.target.value = '';
    });
    $(`#${prefix}Play`).addEventListener('click', async () => {
      if (!(await ensureAudio())) return;
      if (!engine.playSample(slot)) showToast(`Sample ${slot} er tom`);
      updateSampleProgress(slot);
    });
    $(`#${prefix}Stop`).addEventListener('click', () => stopSamplePlayback(slot));
    $(`#${prefix}Edit`).addEventListener('click', (event) => openSampleEditor(slot, event.currentTarget));
    $(`#${prefix}Remove`).addEventListener('click', () => removeSampleSlot(slot));
    for (const flag of ['Loop', 'Reverse', 'Mute', 'Solo']) {
      $(`#${prefix}${flag}`).addEventListener('click', () => toggleBoolean(`${prefix}${flag}`));
    }
  }

  window.addEventListener('keydown', async (event) => {
    if (event.key === 'Escape' && $('#sampleEditorDialog').open) return;
    if (event.key === 'Escape' && focusedModuleIds.length) { event.preventDefault(); closeAllModuleFocus(); return; }
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!getModuleState('keyboard')?.visible) return;
    const index = COMPUTER_KEYS.indexOf(event.key.toLowerCase());
    if (index === -1 || activeKeys.has(event.key)) return;
    event.preventDefault();
    if (!(await ensureAudio())) return;
    const note = baseMidiNote() + index;
    activeKeys.set(event.key, note);
    document.querySelector(`[data-note="${note}"]`)?.classList.add('active');
    engine.noteOn(note);
  });
  window.addEventListener('keyup', (event) => {
    if (!activeKeys.has(event.key)) return;
    const note = activeKeys.get(event.key);
    activeKeys.delete(event.key);
    document.querySelector(`[data-note="${note}"]`)?.classList.remove('active');
    engine.noteOff(note);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      flushAudioParameters();
      commitSession();
      stopSequencer();
      cancelAllPadActivations();
      engine.panic();
      activePadUi.clear();
      refreshPadSampler();
    }
  });
  for (const eventName of ['pointerup', 'pointercancel']) document.addEventListener(eventName, () => {
    flushAudioParameters();
    commitSession();
  }, { passive: true });
  window.addEventListener('pagehide', () => {
    flushAudioParameters();
    commitSession();
    cancelAllPadActivations();
    window.clearTimeout(midiActivityTimer);
    window.clearTimeout(midiActivityPulseTimer);
    midiController?.destroy?.();
    audioPlaybackController?.destroy?.();
    audioPlayerResizeObserver?.disconnect?.();
    stopRecorderLiveWaveform({ resetPath: true });
    engine.cancelSupportRecording();
    engine.stopMicrophone();
  });
}

async function initializeUpdates() {
  updateController = new UpdateController({
    isBusy: () => recording || Boolean(micRecordingSlot) || engine.isSupportRecordingActive() || recorderStopping || Boolean(recorderDraft?.busy) || Boolean(sampleEditorDraft?.busy),
    onStatus: (message = 'Ny versjon er klar.', _build = '', applying = false) => {
      $('#updateBanner').hidden = false;
      $('#updateBanner span').textContent = message;
      $('#updateNow').disabled = applying;
      $('#updateNow').textContent = applying ? 'Oppdaterer…' : 'Oppdater nå';
      $('#versionStatus').textContent = 'Oppdatering klar';
    },
    onCurrent: () => {
      $('#updateBanner').hidden = true;
      $('#updateNow').disabled = false;
      $('#updateNow').textContent = 'Oppdater nå';
      $('#versionStatus').textContent = `v${APP_VERSION}`;
    },
    onError: (error) => showToast(error.message),
  });
  $('#updateNow').addEventListener('click', () => updateController.applyUpdate());
  try { await updateController.start(); } catch (_error) { /* App remains usable without PWA install */ }
}

document.documentElement.dataset.version = APP_VERSION;
initializeProjectSync();
initializeSharedRecordingLibrary();
renderInterface();
initializeMidiController();
initializeAudioPlayback();
bindEvents();
initializeInstall();
initializeUpdates();
animateScope();
