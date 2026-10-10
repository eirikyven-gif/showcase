import {
  PAD_COUNT,
  PAD_PARAMETER_DEFINITIONS,
  createPadParameterKey,
  parameterGroups,
} from './state.js?build=2026-10-10.1';

export const MIDI_STORAGE_KEY = 'analog-synthesizer:midi-profiles:v1';
export const MIDI_PROFILE_VERSION = 2;

const ACTION_NAMES = new Set(['sequence-step-toggle', 'sequencer-toggle', 'kick-trigger', 'pad-trigger']);
const BUTTON_MODES = new Set(['toggle', 'trigger']);
const SOURCE_TYPES = new Set(['cc', 'note']);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function quantize(value, definition) {
  const step = Number(definition.step);
  if (!(step > 0)) return clamp(value, definition.min, definition.max);
  const steps = Math.round((Number(value) - definition.min) / step);
  const result = definition.min + steps * step;
  const decimals = Math.max(0, (String(step).split('.')[1] || '').length);
  return clamp(Number(result.toFixed(Math.min(decimals + 2, 12))), definition.min, definition.max);
}

function inferredScale(definition) {
  if (definition.scale === 'log') return 'log';
  if (Number(definition.min) < 0 && Number(definition.max) > 0) return 'bipolar';
  return 'linear';
}

const sharedContinuousParameters = Object.entries(parameterGroups).flatMap(([group, definitions]) => definitions
  .filter((definition) => !definition.editorOnly)
  .map((definition) => ({
    ...definition,
    id: definition.key,
    group,
    scale: inferredScale(definition),
  })));
const padContinuousParameters = Array.from({ length: PAD_COUNT }, (_, index) => (
  PAD_PARAMETER_DEFINITIONS.map((definition) => {
    const key = createPadParameterKey(index, definition.key);
    return {
      ...definition,
      id: key,
      key,
      group: 'padSampler',
      groupLabel: 'Pad Sampler',
      label: `Pad ${index + 1} · ${definition.label}`,
      scale: inferredScale(definition),
    };
  })
)).flat();

export const CONTINUOUS_PARAMETERS = freezeDeep([
  ...sharedContinuousParameters,
  ...padContinuousParameters,
]);

const parameterByKey = new Map(CONTINUOUS_PARAMETERS.map((definition) => [definition.key, definition]));

if (CONTINUOUS_PARAMETERS.length !== 119 || parameterByKey.size !== 119) {
  throw new Error('MIDI-parameterregisteret skal inneholde 119 unike, kontinuerlige parametere.');
}

export function getParameterDefinition(key) {
  return parameterByKey.get(String(key)) || null;
}

export function scaleMidiValue(definitionOrKey, midiValue) {
  const definition = typeof definitionOrKey === 'string'
    ? getParameterDefinition(definitionOrKey)
    : definitionOrKey;
  if (!definition) throw new Error('Ukjent MIDI-parameter.');
  const raw = Math.round(clamp(midiValue, 0, 127));
  let value;
  if (inferredScale(definition) === 'log') {
    value = definition.min * ((definition.max / definition.min) ** (raw / 127));
  } else if (inferredScale(definition) === 'bipolar') {
    value = raw <= 64
      ? definition.min + ((0 - definition.min) * (raw / 64))
      : ((raw - 64) / 63) * definition.max;
  } else {
    value = definition.min + ((definition.max - definition.min) * (raw / 127));
  }
  return quantize(value, definition);
}

export function valueToMidi7(definitionOrKey, parameterValue) {
  const definition = typeof definitionOrKey === 'string'
    ? getParameterDefinition(definitionOrKey)
    : definitionOrKey;
  if (!definition) throw new Error('Ukjent MIDI-parameter.');
  const value = clamp(parameterValue, definition.min, definition.max);
  let midiValue;
  if (inferredScale(definition) === 'log') {
    midiValue = 127 * (Math.log(value / definition.min) / Math.log(definition.max / definition.min));
  } else if (inferredScale(definition) === 'bipolar') {
    midiValue = value <= 0
      ? 64 * ((value - definition.min) / (0 - definition.min))
      : 64 + (63 * (value / definition.max));
  } else {
    midiValue = 127 * ((value - definition.min) / (definition.max - definition.min));
  }
  return Math.round(clamp(midiValue, 0, 127));
}

export function shouldCaptureSoftTakeover({
  previousMidiValue = null,
  nextMidiValue,
  targetMidiValue,
  threshold = 2,
}) {
  const next = Math.round(clamp(nextMidiValue, 0, 127));
  const target = Math.round(clamp(targetMidiValue, 0, 127));
  const pickup = Math.max(0, Number(threshold) || 0);
  if (Math.abs(next - target) <= pickup) return true;
  if (!Number.isFinite(Number(previousMidiValue))) return false;
  const previous = Math.round(clamp(previousMidiValue, 0, 127));
  return (previous < target && next > target) || (previous > target && next < target);
}

export function normalizeMidiSource(source = {}) {
  const channel = source.channel === '*' ? '*' : Number(source.channel);
  const type = String(source.type || '').toLowerCase();
  const number = Number(source.number);
  if (!(channel === '*' || (Number.isInteger(channel) && channel >= 1 && channel <= 16))) {
    throw new Error('MIDI-kanal må være 1–16 eller "*".');
  }
  if (!SOURCE_TYPES.has(type)) throw new Error('MIDI-kildetype må være "cc" eller "note".');
  if (!Number.isInteger(number) || number < 0 || number > 127) {
    throw new Error('MIDI-nummer må være et heltall fra 0 til 127.');
  }
  return {
    deviceId: String(source.deviceId || '*'),
    channel,
    type,
    number,
  };
}

export function createSourceKey(source) {
  const normalized = normalizeMidiSource(source);
  return `${normalized.deviceId}\u001f${normalized.channel}\u001f${normalized.type}\u001f${normalized.number}`;
}

function sourcesOverlap(left, right) {
  const a = normalizeMidiSource(left);
  const b = normalizeMidiSource(right);
  return a.type === b.type
    && a.number === b.number
    && (a.channel === '*' || b.channel === '*' || a.channel === b.channel)
    && (a.deviceId === '*' || b.deviceId === '*' || a.deviceId === b.deviceId);
}

function normalizeTarget(target = {}) {
  if (target.kind === 'parameter') {
    const key = String(target.key || '');
    if (!parameterByKey.has(key)) throw new Error(`Ukjent MIDI-parameter: ${key || '(tom)'}.`);
    return { kind: 'parameter', key };
  }
  if (target.kind === 'action') {
    const action = String(target.action || '');
    if (!ACTION_NAMES.has(action)) throw new Error(`Ukjent MIDI-handling: ${action || '(tom)'}.`);
    if (action === 'sequence-step-toggle' || action === 'pad-trigger') {
      const index = Number(target.index);
      const maximum = action === 'pad-trigger' ? 11 : 15;
      if (!Number.isInteger(index) || index < 0 || index > maximum) {
        throw new Error(action === 'pad-trigger'
          ? 'Padnummer må være et heltall fra 0 til 11.'
          : 'Sekvensertrinn må være et heltall fra 0 til 15.');
      }
      return { kind: 'action', action, index };
    }
    return { kind: 'action', action };
  }
  throw new Error('MIDI-mål må være en parameter eller handling.');
}

function normalizeMapping(mapping, fallbackId = '') {
  const target = normalizeTarget(mapping.target);
  const source = normalizeMidiSource(mapping.source);
  const mode = target.kind === 'parameter' ? 'continuous' : String(mapping.mode || 'toggle');
  const requestedTakeoverThreshold = Number(mapping.takeoverThreshold);
  if (target.kind === 'parameter' && source.type !== 'cc') {
    throw new Error('Kontinuerlige parametere må styres med MIDI CC.');
  }
  if (target.kind === 'parameter' && mode !== 'continuous') {
    throw new Error('Parameterkoblinger må bruke continuous-modus.');
  }
  if (target.kind === 'action' && !BUTTON_MODES.has(mode)) {
    throw new Error('Handlingskoblinger må bruke toggle- eller trigger-modus.');
  }
  if (target.kind === 'action' && target.action === 'pad-trigger' && mode !== 'trigger') {
    throw new Error('Pad-koblinger må bruke trigger-modus for å bevare Note Off.');
  }
  return {
    id: String(mapping.id || fallbackId),
    name: String(mapping.name || ''),
    active: mapping.active !== false,
    source,
    target,
    mode,
    softTakeover: target.kind === 'parameter' && mapping.softTakeover !== false,
    takeoverThreshold: Math.max(0, Math.min(16, Number.isFinite(requestedTakeoverThreshold) ? requestedTakeoverThreshold : 2)),
    ...(mapping.hardware ? { hardware: clone(mapping.hardware) } : {}),
  };
}

function findCollision(mappings, source, excludedId = null) {
  return mappings.find((mapping) => mapping.id !== excludedId
    && sourcesOverlap(mapping.source, source)) || null;
}

export function validateProfile(profile) {
  const errors = [];
  if (!profile || typeof profile !== 'object') errors.push('Profilen mangler.');
  if (!String(profile?.id || '').trim()) errors.push('Profilen mangler id.');
  if (!String(profile?.name || '').trim()) errors.push('Profilen mangler navn.');
  if (!Array.isArray(profile?.mappings)) errors.push('Profilen mangler en gyldig koblingsliste.');
  const mappings = [];
  const ids = new Set();
  for (const [index, candidate] of (Array.isArray(profile?.mappings) ? profile.mappings : []).entries()) {
    try {
      if (!String(candidate?.id || '').trim()) errors.push(`Kobling ${index + 1} mangler id.`);
      const mapping = normalizeMapping(candidate, `mapping-${index + 1}`);
      if (ids.has(mapping.id)) errors.push(`Duplisert koblings-id: ${mapping.id}.`);
      const collision = findCollision(mappings, mapping.source);
      if (collision) errors.push(`Kildekollisjon mellom ${collision.id} og ${mapping.id}.`);
      ids.add(mapping.id);
      mappings.push(mapping);
    } catch (error) {
      errors.push(`Kobling ${index + 1}: ${error.message}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

function normalizeStoredProfile(profile) {
  return {
    id: String(profile.id),
    name: String(profile.name).trim().slice(0, 80),
    builtIn: false,
    mappings: profile.mappings.map((mapping, index) => normalizeMapping(
      mapping,
      `${profile.id}-mapping-${index + 1}`,
    )),
  };
}

const LEGACY_PAD_PARAMETER_KEYS = new Set(['padPan', 'padTone', 'padSend']);

function migrateStoredProfile(profile) {
  if (!profile || !Array.isArray(profile.mappings)) return profile;
  return {
    ...profile,
    mappings: profile.mappings.filter((mapping) => (
      mapping?.target?.kind !== 'parameter'
      || !LEGACY_PAD_PARAMETER_KEYS.has(String(mapping.target.key || ''))
    )),
  };
}

function continuousMapping(id, key, number, channel = '*', hardware = null) {
  return normalizeMapping({
    id,
    source: { deviceId: '*', channel, type: 'cc', number },
    target: { kind: 'parameter', key },
    mode: 'continuous',
    softTakeover: true,
    ...(hardware ? { hardware } : {}),
  });
}

export const DEFAULT_MIDI_PROFILE = freezeDeep({
  id: 'default-midi',
  name: 'Standard MIDI',
  builtIn: true,
  mappings: [
    continuousMapping('default-lfo-depth', 'lfoDepth', 1),
    continuousMapping('default-master', 'master', 7),
    continuousMapping('default-cutoff', 'cutoff', 74),
  ],
});

const RHYTHM_PARAMETER_KEYS = Object.freeze([
  'kickPitch', 'kickDecay', 'kickSweep', 'kickTone', 'kickDrive',
  'kickGain', 'tempo', 'swing', 'gate',
]);
const OTHER_PARAMETER_KEYS = CONTINUOUS_PARAMETERS
  .map((definition) => definition.key)
  .filter((key) => !RHYTHM_PARAMETER_KEYS.includes(key) && !key.startsWith('pad'));

if (OTHER_PARAMETER_KEYS.length !== 49) {
  throw new Error('MIDImix-referanseprofilen skal beholde de 49 opprinnelige ikke-rytmeparameterne.');
}

const KNOB_CCS = Array.from({ length: 24 }, (_, index) => 16 + index);
const FADER_CCS = Array.from({ length: 9 }, (_, index) => 40 + index);

function hardwareControl(unit, kind, index) {
  const number = kind === 'knob' ? KNOB_CCS[index] : FADER_CCS[index];
  return {
    number,
    metadata: {
      unit,
      control: `${kind}-${index + 1}`,
      label: kind === 'knob' ? `Knob ${index + 1}` : (index === 8 ? 'Masterfader' : `Fader ${index + 1}`),
    },
  };
}

function createAkaiContinuousMappings() {
  const mappings = [];
  const unitOneAssignments = [
    ...RHYTHM_PARAMETER_KEYS.slice(0, 5).map((key, index) => ({ key, ...hardwareControl(1, 'knob', index) })),
    { key: 'kickGain', ...hardwareControl(1, 'fader', 0) },
    ...RHYTHM_PARAMETER_KEYS.slice(6).map((key, index) => ({ key, ...hardwareControl(1, 'knob', index + 5) })),
    ...OTHER_PARAMETER_KEYS.slice(0, 16).map((key, index) => ({ key, ...hardwareControl(1, 'knob', index + 8) })),
    ...OTHER_PARAMETER_KEYS.slice(16, 24).map((key, index) => ({ key, ...hardwareControl(1, 'fader', index + 1) })),
  ];
  const unitTwoAssignments = [
    ...OTHER_PARAMETER_KEYS.slice(24, 48).map((key, index) => ({ key, ...hardwareControl(2, 'knob', index) })),
    { key: OTHER_PARAMETER_KEYS[48], ...hardwareControl(2, 'fader', 0) },
  ];
  for (const [index, assignment] of unitOneAssignments.entries()) {
    mappings.push(continuousMapping(
      `akai-1-parameter-${index + 1}`,
      assignment.key,
      assignment.number,
      1,
      assignment.metadata,
    ));
  }
  for (const [index, assignment] of unitTwoAssignments.entries()) {
    mappings.push(continuousMapping(
      `akai-2-parameter-${index + 1}`,
      assignment.key,
      assignment.number,
      2,
      assignment.metadata,
    ));
  }
  return mappings;
}

function akaiButtonMapping(id, target, note, mode, control, label) {
  return normalizeMapping({
    id,
    source: { deviceId: '*', channel: 1, type: 'note', number: note },
    target,
    mode,
    hardware: { unit: 1, control, label },
  });
}

const akaiActions = [
  ...Array.from({ length: 16 }, (_, index) => akaiButtonMapping(
    `akai-step-${index + 1}`,
    { kind: 'action', action: 'sequence-step-toggle', index },
    36 + index,
    'toggle',
    index < 8 ? `mute-${index + 1}` : `rec-${index - 7}`,
    `Sekvensertrinn ${index + 1}`,
  )),
  akaiButtonMapping(
    'akai-sequencer-toggle',
    { kind: 'action', action: 'sequencer-toggle' },
    52,
    'toggle',
    'bank-left',
    'Sequencer start/stopp',
  ),
  akaiButtonMapping(
    'akai-kick-trigger',
    { kind: 'action', action: 'kick-trigger' },
    53,
    'trigger',
    'bank-right',
    'Kick-trigger',
  ),
];

export const AKAI_MIDIMIX_X2_PROFILE = freezeDeep({
  id: 'akai-midimix-x2',
  name: '2 × Akai MIDImix',
  builtIn: true,
  description: 'Referanseprofil: MIDImix 1 på kanal 1 og MIDImix 2 på kanal 2.',
  deviceSetup: {
    model: 'Akai MIDImix',
    units: [
      { unit: 1, channel: 1, role: 'Kick, sequencer og 24 øvrige parametere' },
      { unit: 2, channel: 2, role: '25 øvrige parametere' },
    ],
    continuousCc: { knobs: KNOB_CCS, faders: FADER_CCS },
    buttonNotes: { first: 36, last: 53 },
  },
  mappings: [...createAkaiContinuousMappings(), ...akaiActions],
});

export const BUILT_IN_MIDI_PROFILES = freezeDeep([
  DEFAULT_MIDI_PROFILE,
  AKAI_MIDIMIX_X2_PROFILE,
]);

for (const profile of BUILT_IN_MIDI_PROFILES) {
  const validation = validateProfile(profile);
  if (!validation.valid) throw new Error(`Ugyldig innebygd MIDI-profil: ${validation.errors.join(' ')}`);
}

export function parseMidiMessage(eventOrData, input = null) {
  const data = eventOrData?.data || eventOrData;
  if (!data || data.length < 3) return null;
  const status = Number(data[0]) & 0xff;
  const number = Number(data[1]) & 0x7f;
  const value = Number(data[2]) & 0x7f;
  const command = status & 0xf0;
  const channel = (status & 0x0f) + 1;
  const device = input || eventOrData?.currentTarget || eventOrData?.target || {};
  const base = {
    deviceId: String(device.id || 'unknown'),
    deviceName: String(device.name || ''),
    channel,
    number,
    value,
    rawData: [status, number, value],
  };
  if (command === 0xb0) {
    return { ...base, type: 'cc', command: 'cc', pressed: value >= 64 };
  }
  if (command === 0x90 && value > 0) {
    return { ...base, type: 'note', command: 'note-on', pressed: true, velocity: value / 127 };
  }
  if (command === 0x80 || (command === 0x90 && value === 0)) {
    return { ...base, type: 'note', command: 'note-off', pressed: false, velocity: 0 };
  }
  return null;
}

function sourceMatches(mappingSource, message) {
  return mappingSource.type === message.type
    && mappingSource.number === message.number
    && (mappingSource.channel === '*' || mappingSource.channel === message.channel)
    && (mappingSource.deviceId === '*' || mappingSource.deviceId === message.deviceId);
}

function createId(prefix, counter) {
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

export function createMidiController({
  storage = null,
  storageKey = MIDI_STORAGE_KEY,
  requestMIDIAccess = null,
  getParameterValue = () => undefined,
  onParameterChange = () => {},
  onAction = () => {},
  onPerformance = () => {},
  onMidiMessage = () => {},
  onChange = () => {},
  onStatus = () => {},
} = {}) {
  let idCounter = 0;
  let midiAccess = null;
  let connectPromise = null;
  let midiStateListener = null;
  let connectionGeneration = 0;
  let learnState = null;
  let activeProfileId = DEFAULT_MIDI_PROFILE.id;
  let profiles = clone(BUILT_IN_MIDI_PROFILES);
  let destroyed = false;
  const inputEnabled = new Map();
  const boundInputs = new Map();
  const mappingRuntime = new Map();

  function status(state, detail = {}) {
    const payload = { state, ...detail };
    onStatus(payload);
    return payload;
  }

  function snapshot(reason, detail = {}) {
    onChange({
      reason,
      ...detail,
      inputs: getInputs(),
      profiles: getProfiles(),
      activeProfile: getActiveProfile(),
      learn: getLearnState(),
    });
  }

  function persist() {
    if (!storage?.setItem) return;
    try {
      storage.setItem(storageKey, JSON.stringify({
        version: MIDI_PROFILE_VERSION,
        activeProfileId,
        inputEnabled: Object.fromEntries(inputEnabled),
        profiles: profiles.filter((profile) => !profile.builtIn),
      }));
    } catch (error) {
      status('error', { message: 'MIDI-profiler kunne ikke lagres.', error });
    }
  }

  function load() {
    if (!storage?.getItem) return;
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return;
      const stored = JSON.parse(raw);
      if (![1, MIDI_PROFILE_VERSION].includes(Number(stored?.version)) || !Array.isArray(stored.profiles)) return;
      const builtInIds = new Set(BUILT_IN_MIDI_PROFILES.map((profile) => profile.id));
      const validProfiles = stored.profiles
        .map(migrateStoredProfile)
        .filter((profile) => !builtInIds.has(profile?.id) && validateProfile(profile).valid)
        .map(normalizeStoredProfile);
      profiles = [...clone(BUILT_IN_MIDI_PROFILES), ...validProfiles];
      if (stored.inputEnabled && typeof stored.inputEnabled === 'object') {
        for (const [inputId, enabled] of Object.entries(stored.inputEnabled)) {
          inputEnabled.set(String(inputId), Boolean(enabled));
        }
      }
      activeProfileId = profiles.some((profile) => profile.id === stored.activeProfileId)
        ? stored.activeProfileId
        : null;
    } catch (error) {
      status('error', { message: 'Lagrede MIDI-profiler kunne ikke leses.', error });
    }
  }

  function resetRuntime() {
    mappingRuntime.clear();
  }

  function requireProfile(profileId = activeProfileId) {
    const profile = profiles.find((candidate) => candidate.id === profileId);
    if (!profile) throw new Error('MIDI-profilen finnes ikke.');
    return profile;
  }

  function requireCustomProfile(profileId = activeProfileId) {
    const profile = requireProfile(profileId);
    if (profile.builtIn) {
      throw new Error('Innebygde MIDI-profiler er skrivebeskyttet. Opprett en kopi før redigering.');
    }
    return profile;
  }

  function getProfiles() {
    return clone(profiles);
  }

  function getActiveProfile() {
    return clone(profiles.find((profile) => profile.id === activeProfileId) || null);
  }

  function getMappings(profileId = activeProfileId) {
    if (!profileId) return [];
    return clone(requireProfile(profileId).mappings);
  }

  function createProfile(name, { fromProfileId = null, activate = true } = {}) {
    const trimmedName = String(name || '').trim().slice(0, 80);
    if (!trimmedName) throw new Error('Profilnavn kan ikke være tomt.');
    idCounter += 1;
    const id = createId('profile', idCounter);
    const sourceMappings = fromProfileId ? requireProfile(fromProfileId).mappings : [];
    const mappings = sourceMappings.map((mapping, index) => ({
      ...clone(mapping),
      id: `${id}-mapping-${index + 1}`,
    }));
    const profile = { id, name: trimmedName, builtIn: false, mappings };
    profiles.push(profile);
    if (activate) activeProfileId = id;
    resetRuntime();
    persist();
    snapshot('profile-created', { profile: clone(profile) });
    return clone(profile);
  }

  function renameProfile(profileId, name) {
    const profile = requireCustomProfile(profileId);
    const trimmedName = String(name || '').trim().slice(0, 80);
    if (!trimmedName) throw new Error('Profilnavn kan ikke være tomt.');
    profile.name = trimmedName;
    persist();
    snapshot('profile-renamed', { profile: clone(profile) });
    return clone(profile);
  }

  function deleteProfile(profileId) {
    const index = profiles.findIndex((profile) => profile.id === profileId);
    if (index < 0) return false;
    if (profiles[index].builtIn) {
      throw new Error('Innebygde MIDI-profiler er skrivebeskyttet. Opprett en kopi før sletting.');
    }
    profiles.splice(index, 1);
    if (activeProfileId === profileId) activeProfileId = null;
    resetRuntime();
    persist();
    snapshot('profile-deleted', { profileId });
    return true;
  }

  function activateProfile(profileId) {
    const profile = requireProfile(profileId);
    activeProfileId = profile.id;
    resetRuntime();
    persist();
    snapshot('profile-activated', { profile: clone(profile) });
    return clone(profile);
  }

  function deactivateProfile(profileId = activeProfileId) {
    if (!profileId || activeProfileId !== profileId) return false;
    activeProfileId = null;
    resetRuntime();
    persist();
    snapshot('profile-deactivated', { profileId });
    return true;
  }

  function findMapping(mappingId, profileId = activeProfileId) {
    const profile = requireProfile(profileId);
    const mapping = profile.mappings.find((candidate) => candidate.id === mappingId);
    if (!mapping) throw new Error('MIDI-koblingen finnes ikke.');
    return { profile, mapping };
  }

  function setMappingActive(mappingId, active, { profileId = activeProfileId } = {}) {
    requireCustomProfile(profileId);
    const { mapping } = findMapping(mappingId, profileId);
    mapping.active = Boolean(active);
    mappingRuntime.delete(mapping.id);
    persist();
    snapshot('mapping-active-changed', { mapping: clone(mapping), profileId });
    return clone(mapping);
  }

  function removeMapping(mappingId, { profileId = activeProfileId } = {}) {
    const profile = requireCustomProfile(profileId);
    const index = profile.mappings.findIndex((mapping) => mapping.id === mappingId);
    if (index < 0) return false;
    profile.mappings.splice(index, 1);
    mappingRuntime.delete(mappingId);
    persist();
    snapshot('mapping-removed', { mappingId, profileId });
    return true;
  }

  function getLearnState() {
    return clone(learnState);
  }

  function startLearn({
    target,
    mode = 'continuous',
    channel = null,
    mappingId = null,
    profileId = activeProfileId,
  }) {
    const profile = requireCustomProfile(profileId);
    const normalizedTarget = normalizeTarget(target);
    const normalizedMode = normalizedTarget.kind === 'parameter' ? 'continuous' : String(mode);
    if (normalizedTarget.kind === 'action' && !BUTTON_MODES.has(normalizedMode)) {
      throw new Error('Knappelæring krever toggle- eller trigger-modus.');
    }
    if (channel != null && channel !== '*' && (!Number.isInteger(Number(channel)) || Number(channel) < 1 || Number(channel) > 16)) {
      throw new Error('MIDI-kanal må være 1–16, "*", eller null.');
    }
    if (mappingId) findMapping(mappingId, profile.id);
    learnState = {
      profileId: profile.id,
      mappingId: mappingId || null,
      target: normalizedTarget,
      mode: normalizedMode,
      channel: channel == null ? null : (channel === '*' ? '*' : Number(channel)),
    };
    snapshot('learn-started');
    return getLearnState();
  }

  function relearnMapping(mappingId, { profileId = activeProfileId, channel = null } = {}) {
    const { mapping } = findMapping(mappingId, profileId);
    return startLearn({
      target: mapping.target,
      mode: mapping.mode,
      channel,
      mappingId,
      profileId,
    });
  }

  function cancelLearn() {
    if (!learnState) return false;
    learnState = null;
    snapshot('learn-cancelled');
    return true;
  }

  function learnFromMessage(message) {
    if (!learnState) return null;
    if (learnState.target.kind === 'parameter' && message.type !== 'cc') {
      return { handled: false, consumed: false, kind: 'learn-waiting-for-cc' };
    }
    if (learnState.target.kind === 'action' && !message.pressed) {
      return { handled: true, consumed: true, kind: 'learn-waiting-for-press' };
    }
    const profile = requireProfile(learnState.profileId);
    const source = normalizeMidiSource({
      deviceId: message.deviceId,
      channel: learnState.channel ?? message.channel,
      type: message.type,
      number: message.number,
    });
    const collision = findCollision(profile.mappings, source, learnState.mappingId);
    if (collision) {
      const result = {
        handled: true,
        consumed: true,
        kind: 'learn-collision',
        collision: clone(collision),
        source,
      };
      snapshot('learn-collision', result);
      return result;
    }
    let mapping;
    if (learnState.mappingId) {
      mapping = profile.mappings.find((candidate) => candidate.id === learnState.mappingId);
      const preserved = { ...mapping, source, target: learnState.target, mode: learnState.mode };
      Object.assign(mapping, normalizeMapping(preserved, mapping.id));
      mappingRuntime.delete(mapping.id);
    } else {
      idCounter += 1;
      mapping = normalizeMapping({
        id: createId('mapping', idCounter),
        active: true,
        source,
        target: learnState.target,
        mode: learnState.mode,
        softTakeover: learnState.target.kind === 'parameter',
      });
      profile.mappings.push(mapping);
    }
    if (mapping.target.kind === 'parameter') {
      const definition = getParameterDefinition(mapping.target.key);
      const currentValue = Number(getParameterValue(mapping.target.key));
      const captured = !mapping.softTakeover || !Number.isFinite(currentValue)
        || Math.abs(message.value - valueToMidi7(definition, currentValue)) <= mapping.takeoverThreshold;
      mappingRuntime.set(mapping.id, {
        captured,
        previousMidiValue: message.value,
        lastOutputMidiValue: captured ? message.value : null,
      });
    }
    learnState = null;
    persist();
    snapshot('learn-completed', { mapping: clone(mapping), profileId: profile.id });
    return {
      handled: true,
      consumed: true,
      kind: 'learned',
      mapping: clone(mapping),
      profileId: profile.id,
    };
  }

  function processParameter(mapping, message) {
    const definition = getParameterDefinition(mapping.target.key);
    const runtime = mappingRuntime.get(mapping.id) || {
      captured: !mapping.softTakeover,
      previousMidiValue: null,
      lastOutputMidiValue: null,
    };
    const currentValue = Number(getParameterValue(mapping.target.key));
    const hasCurrentValue = Number.isFinite(currentValue);
    const currentMidiValue = hasCurrentValue ? valueToMidi7(definition, currentValue) : message.value;
    if (runtime.captured && mapping.softTakeover && runtime.lastOutputMidiValue != null
      && Math.abs(currentMidiValue - runtime.lastOutputMidiValue) > mapping.takeoverThreshold + 1) {
      runtime.captured = false;
    }
    if (!runtime.captured) {
      runtime.captured = !hasCurrentValue || shouldCaptureSoftTakeover({
        previousMidiValue: runtime.previousMidiValue,
        nextMidiValue: message.value,
        targetMidiValue: currentMidiValue,
        threshold: mapping.takeoverThreshold,
      });
    }
    runtime.previousMidiValue = message.value;
    mappingRuntime.set(mapping.id, runtime);
    if (!runtime.captured) {
      return {
        handled: true,
        consumed: true,
        kind: 'parameter',
        applied: false,
        waitingForTakeover: true,
        targetMidiValue: currentMidiValue,
        mapping: clone(mapping),
        message,
      };
    }
    const value = scaleMidiValue(definition, message.value);
    runtime.lastOutputMidiValue = valueToMidi7(definition, value);
    onParameterChange({
      key: definition.key,
      value,
      midiValue: message.value,
      definition: clone(definition),
      mapping: clone(mapping),
      message,
    });
    return {
      handled: true,
      consumed: true,
      kind: 'parameter',
      applied: true,
      waitingForTakeover: false,
      key: definition.key,
      value,
      mapping: clone(mapping),
      message,
    };
  }

  function processAction(mapping, message) {
    const runtime = mappingRuntime.get(mapping.id) || { pressed: false };
    const wasPressed = Boolean(runtime.pressed);
    runtime.pressed = Boolean(message.pressed);
    mappingRuntime.set(mapping.id, runtime);
    if (message.pressed === wasPressed) {
      return {
        handled: true,
        consumed: true,
        kind: 'button',
        activated: false,
        repeated: true,
        mapping: clone(mapping),
        message,
      };
    }
    if (mapping.mode === 'toggle') {
      if (!message.pressed) {
        return {
          handled: true,
          consumed: true,
          kind: 'button',
          activated: false,
          released: true,
          mapping: clone(mapping),
          message,
        };
      }
      onAction({
        ...mapping.target,
        mode: mapping.mode,
        phase: 'toggle',
        mapping: clone(mapping),
        message,
      });
      return {
        handled: true,
        consumed: true,
        kind: 'button',
        activated: true,
        phase: 'toggle',
        mapping: clone(mapping),
        message,
      };
    }
    const phase = message.pressed ? 'start' : 'end';
    onAction({
      ...mapping.target,
      mode: mapping.mode,
      phase,
      mapping: clone(mapping),
      message,
    });
    return {
      handled: true,
      consumed: true,
      kind: 'button',
      activated: message.pressed,
      phase,
      mapping: clone(mapping),
      message,
    };
  }

  function handleMidiMessage(eventOrData, input = null) {
    if (destroyed) return { handled: false, consumed: false, kind: 'destroyed' };
    const message = parseMidiMessage(eventOrData, input);
    if (!message) return { handled: false, consumed: false, kind: 'unsupported' };
    onMidiMessage(clone(message));
    const learned = learnFromMessage(message);
    if (learned) return learned;
    const profile = profiles.find((candidate) => candidate.id === activeProfileId);
    const mapping = profile?.mappings.find((candidate) => candidate.active !== false
      && sourceMatches(candidate.source, message));
    if (mapping) {
      return mapping.target.kind === 'parameter'
        ? processParameter(mapping, message)
        : processAction(mapping, message);
    }
    if (message.type === 'note') {
      const performance = {
        type: message.command,
        note: message.number,
        velocity: message.velocity,
        channel: message.channel,
        deviceId: message.deviceId,
        message,
      };
      onPerformance(performance);
      return {
        handled: true,
        consumed: false,
        kind: 'performance',
        performance,
      };
    }
    return { handled: false, consumed: false, kind: 'unmapped', message };
  }

  function listAccessInputs() {
    if (!midiAccess?.inputs) return [];
    return Array.from(typeof midiAccess.inputs.values === 'function'
      ? midiAccess.inputs.values()
      : midiAccess.inputs);
  }

  function getInputs() {
    return listAccessInputs().map((input) => ({
      id: String(input.id),
      name: String(input.name || ''),
      manufacturer: String(input.manufacturer || ''),
      state: String(input.state || 'unknown'),
      connection: String(input.connection || 'unknown'),
      enabled: inputEnabled.get(String(input.id)) !== false,
    }));
  }

  function bindInputs() {
    const present = new Set();
    for (const input of listAccessInputs()) {
      const id = String(input.id);
      present.add(id);
      if (!inputEnabled.has(id)) inputEnabled.set(id, true);
      if (inputEnabled.get(id)) {
        const listener = (event) => handleMidiMessage(event, input);
        if (boundInputs.get(id)?.input !== input) {
          const old = boundInputs.get(id);
          if (old) old.input.onmidimessage = null;
          input.onmidimessage = listener;
          boundInputs.set(id, { input, listener });
        }
      } else {
        input.onmidimessage = null;
        boundInputs.delete(id);
      }
    }
    for (const [id, bound] of boundInputs) {
      if (!present.has(id)) {
        bound.input.onmidimessage = null;
        boundInputs.delete(id);
      }
    }
  }

  function setInputEnabled(inputId, enabled) {
    const id = String(inputId);
    if (!listAccessInputs().some((input) => String(input.id) === id)) return false;
    inputEnabled.set(id, Boolean(enabled));
    bindInputs();
    persist();
    snapshot('input-enabled-changed', { inputId: id, enabled: Boolean(enabled) });
    return true;
  }

  async function connect() {
    if (destroyed) throw new Error('MIDI-kontrolleren er avsluttet.');
    if (midiAccess) return midiAccess;
    if (connectPromise) return connectPromise;
    if (typeof requestMIDIAccess !== 'function') {
      status('unsupported', { message: 'Web MIDI støttes ikke i denne nettleseren.' });
      return null;
    }
    status('requesting', { message: 'Venter på MIDI-tillatelse.' });
    const generation = connectionGeneration;
    const attempt = (async () => {
      try {
        const access = await requestMIDIAccess({ sysex: false });
        if (!access) throw new Error('Nettleseren returnerte ingen MIDI-tilgang.');
        if (destroyed || generation !== connectionGeneration) return null;
        midiAccess = access;
        bindInputs();
        midiStateListener = () => {
          bindInputs();
          snapshot('inputs-changed');
        };
        if (typeof midiAccess.addEventListener === 'function') midiAccess.addEventListener('statechange', midiStateListener);
        else midiAccess.onstatechange = midiStateListener;
        status('connected', {
          message: 'MIDI er tilkoblet.',
          inputCount: getInputs().length,
        });
        snapshot('connected');
        return midiAccess;
      } catch (error) {
        if (destroyed || generation !== connectionGeneration) return null;
        midiAccess = null;
        status('error', { message: 'MIDI-tilgang ble avvist eller feilet.', error });
        return null;
      }
    })();
    connectPromise = attempt;
    try {
      return await attempt;
    } finally {
      if (connectPromise === attempt) connectPromise = null;
    }
  }

  function disconnect() {
    connectionGeneration += 1;
    connectPromise = null;
    for (const { input } of boundInputs.values()) input.onmidimessage = null;
    boundInputs.clear();
    if (midiAccess && midiStateListener) {
      if (typeof midiAccess.removeEventListener === 'function') midiAccess.removeEventListener('statechange', midiStateListener);
      else if (midiAccess.onstatechange === midiStateListener) midiAccess.onstatechange = null;
    }
    midiStateListener = null;
    midiAccess = null;
    status('disconnected', { message: 'MIDI er frakoblet.' });
    snapshot('disconnected');
  }

  function resetTakeover(mappingId = null) {
    if (mappingId) mappingRuntime.delete(mappingId);
    else resetRuntime();
  }

  function destroy() {
    disconnect();
    destroyed = true;
    learnState = null;
    resetRuntime();
  }

  load();

  return Object.freeze({
    connect,
    disconnect,
    destroy,
    getInputs,
    setInputEnabled,
    getProfiles,
    getActiveProfile,
    getMappings,
    createProfile,
    renameProfile,
    deleteProfile,
    activateProfile,
    deactivateProfile,
    setMappingActive,
    removeMapping,
    startLearn,
    relearnMapping,
    cancelLearn,
    getLearnState,
    handleMidiMessage,
    resetTakeover,
  });
}
