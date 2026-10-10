import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AKAI_MIDIMIX_X2_PROFILE,
  BUILT_IN_MIDI_PROFILES,
  CONTINUOUS_PARAMETERS,
  DEFAULT_MIDI_PROFILE,
  MIDI_PROFILE_VERSION,
  MIDI_STORAGE_KEY,
  createMidiController,
  createSourceKey,
  getParameterDefinition,
  parseMidiMessage,
  scaleMidiValue,
  shouldCaptureSoftTakeover,
  validateProfile,
  valueToMidi7,
} from '../assets/midi-controller.js';

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

function midi(status, number, value, id = 'device-a') {
  return {
    data: [status, number, value],
    currentTarget: { id, name: id },
  };
}

test('MIDI registry exposes 59 shared and 60 individual Pad Sampler parameters', () => {
  assert.equal(CONTINUOUS_PARAMETERS.length, 119);
  assert.equal(new Set(CONTINUOUS_PARAMETERS.map((definition) => definition.key)).size, 119);
  const padParameters = CONTINUOUS_PARAMETERS.filter((definition) => definition.key.startsWith('pad.'));
  assert.equal(padParameters.length, 60);
  assert.equal(new Set(padParameters.map((definition) => definition.label)).size, 60);
  for (let index = 0; index < 12; index += 1) {
    assert.deepEqual(
      padParameters
        .filter((definition) => definition.key.startsWith(`pad.${index}.`))
        .map((definition) => definition.key),
      [`pad.${index}.rate`, `pad.${index}.gain`, `pad.${index}.pan`, `pad.${index}.tone`, `pad.${index}.send`],
    );
  }
  for (const editorOnly of ['sampleAStart', 'sampleAEnd', 'sampleBStart', 'sampleBEnd']) {
    assert.equal(getParameterDefinition(editorOnly), null);
  }
  for (const required of ['pitch', 'cutoff', 'kickGain', 'tempo', 'micWet', 'sampleBSend', 'padGain', 'pad.0.rate', 'pad.11.send', 'master']) {
    assert.equal(getParameterDefinition(required)?.key, required);
  }
  for (const removed of ['padPan', 'padTone', 'padSend']) assert.equal(getParameterDefinition(removed), null);
});

test('7-bit scaling supports linear, logarithmic and centered bipolar values', () => {
  assert.equal(scaleMidiValue('master', 0), getParameterDefinition('master').min);
  assert.equal(scaleMidiValue('master', 127), getParameterDefinition('master').max);
  assert.equal(scaleMidiValue('synthPan', 0), -1);
  assert.equal(scaleMidiValue('synthPan', 64), 0);
  assert.equal(scaleMidiValue('synthPan', 127), 1);

  const cutoff = getParameterDefinition('cutoff');
  const expectedMidpoint = Math.sqrt(cutoff.min * cutoff.max);
  assert.ok(Math.abs(scaleMidiValue(cutoff, 63.5) - expectedMidpoint) < 30);
  for (const [key, value] of [
    ['master', 0.78],
    ['cutoff', 4200],
    ['pitch', -7],
    ['synthPan', 0.42],
    ['pad.7.gain', 0.63],
    ['pad.4.tone', 6800],
  ]) {
    const midiValue = valueToMidi7(key, value);
    assert.ok(midiValue >= 0 && midiValue <= 127);
    const definition = getParameterDefinition(key);
    assert.ok(Math.abs(scaleMidiValue(key, midiValue) - value) <= Math.max(definition.step * 2, (definition.max - definition.min) / 100));
  }
});

test('soft takeover captures at the target or when the hardware crosses it', () => {
  assert.equal(shouldCaptureSoftTakeover({ nextMidiValue: 62, targetMidiValue: 64, threshold: 2 }), true);
  assert.equal(shouldCaptureSoftTakeover({ nextMidiValue: 20, targetMidiValue: 64, threshold: 2 }), false);
  assert.equal(shouldCaptureSoftTakeover({
    previousMidiValue: 20,
    nextMidiValue: 90,
    targetMidiValue: 64,
    threshold: 1,
  }), true);
  assert.equal(shouldCaptureSoftTakeover({
    previousMidiValue: 90,
    nextMidiValue: 80,
    targetMidiValue: 64,
    threshold: 1,
  }), false);
});

test('MIDI parsing normalizes channel, device, note-off and CC messages', () => {
  assert.deepEqual(
    parseMidiMessage(midi(0xb2, 74, 91, 'filter-box')),
    {
      deviceId: 'filter-box',
      deviceName: 'filter-box',
      channel: 3,
      number: 74,
      value: 91,
      rawData: [0xb2, 74, 91],
      type: 'cc',
      command: 'cc',
      pressed: true,
    },
  );
  assert.equal(parseMidiMessage(midi(0x90, 60, 0)).command, 'note-off');
  assert.equal(parseMidiMessage(midi(0x81, 60, 44)).channel, 2);
  assert.equal(parseMidiMessage([0xe0, 0, 0]), null);
  assert.notEqual(
    createSourceKey({ deviceId: 'a', channel: 1, type: 'cc', number: 1 }),
    createSourceKey({ deviceId: 'a', channel: 2, type: 'cc', number: 1 }),
  );
});

test('built-in profiles contain the fixed standard mappings and a collision-free 76-control Akai profile', () => {
  assert.equal(BUILT_IN_MIDI_PROFILES.length, 2);
  assert.equal(validateProfile(DEFAULT_MIDI_PROFILE).valid, true);
  assert.deepEqual(
    DEFAULT_MIDI_PROFILE.mappings.map((mapping) => [mapping.source.number, mapping.target.key]),
    [[1, 'lfoDepth'], [7, 'master'], [74, 'cutoff']],
  );

  const profile = AKAI_MIDIMIX_X2_PROFILE;
  const validation = validateProfile(profile);
  assert.deepEqual(validation.errors, []);
  assert.equal(profile.mappings.length, 76);
  const continuous = profile.mappings.filter((mapping) => mapping.target.kind === 'parameter');
  const actions = profile.mappings.filter((mapping) => mapping.target.kind === 'action');
  assert.equal(continuous.length, 58);
  assert.equal(actions.length, 18);
  assert.equal(new Set(continuous.map((mapping) => mapping.target.key)).size, 58);
  assert.ok(continuous.every((mapping) => !mapping.target.key.startsWith('pad')));
  assert.equal(continuous.filter((mapping) => mapping.source.channel === 1).length, 33);
  assert.equal(continuous.filter((mapping) => mapping.source.channel === 2).length, 25);

  const rhythmKeys = new Set([
    'kickPitch', 'kickDecay', 'kickSweep', 'kickTone', 'kickDrive',
    'kickGain', 'tempo', 'swing', 'gate',
  ]);
  const unitOne = continuous.filter((mapping) => mapping.source.channel === 1);
  assert.equal(unitOne.filter((mapping) => rhythmKeys.has(mapping.target.key)).length, 9);
  assert.equal(unitOne.filter((mapping) => !rhythmKeys.has(mapping.target.key)).length, 24);
  assert.equal(continuous.filter((mapping) => mapping.source.channel === 2 && !rhythmKeys.has(mapping.target.key)).length, 25);
  assert.equal(actions.filter((mapping) => mapping.target.action === 'sequence-step-toggle').length, 16);
  assert.equal(actions.filter((mapping) => mapping.target.action === 'sequencer-toggle').length, 1);
  assert.equal(actions.filter((mapping) => mapping.target.action === 'kick-trigger').length, 1);
  assert.equal(new Set(profile.mappings.map((mapping) => createSourceKey(mapping.source))).size, 76);
});

test('profile validation detects intersecting wildcard and exact hardware sources', () => {
  const collision = {
    id: 'collision',
    name: 'Kollisjon',
    mappings: [
      {
        id: 'one',
        source: { deviceId: '*', channel: '*', type: 'cc', number: 9 },
        target: { kind: 'parameter', key: 'master' },
        mode: 'continuous',
      },
      {
        id: 'two',
        source: { deviceId: 'specific', channel: 3, type: 'cc', number: 9 },
        target: { kind: 'parameter', key: 'cutoff' },
        mode: 'continuous',
      },
    ],
  };
  const result = validateProfile(collision);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /Kildekollisjon/);
});

test('profile CRUD, activation and local persistence round-trip', () => {
  const storage = new MemoryStorage();
  const changes = [];
  const controller = createMidiController({ storage, onChange: (change) => changes.push(change.reason) });
  assert.equal(controller.getActiveProfile().id, 'default-midi');

  const created = controller.createProfile('Min rigg');
  assert.equal(controller.getActiveProfile().id, created.id);
  assert.equal(controller.renameProfile(created.id, 'Sceneprofil').name, 'Sceneprofil');
  assert.equal(controller.deactivateProfile(created.id), true);
  assert.equal(controller.getActiveProfile(), null);
  controller.activateProfile(created.id);
  assert.equal(controller.getActiveProfile().name, 'Sceneprofil');

  const restored = createMidiController({ storage });
  assert.equal(restored.getActiveProfile().name, 'Sceneprofil');
  assert.equal(restored.deleteProfile(created.id), true);
  assert.equal(restored.getActiveProfile(), null);
  assert.ok(storage.getItem(MIDI_STORAGE_KEY));
  assert.ok(changes.includes('profile-created'));
  assert.ok(changes.includes('profile-renamed'));
  assert.ok(changes.includes('profile-deactivated'));
});

test('canonical built-in profiles are rehydrated and remain write-protected', () => {
  const storage = new MemoryStorage({
    [MIDI_STORAGE_KEY]: JSON.stringify({
      version: 1,
      activeProfileId: 'default-midi',
      profiles: [{
        ...DEFAULT_MIDI_PROFILE,
        name: 'Manipulert',
        builtIn: false,
        mappings: [],
      }],
    }),
  });
  const controller = createMidiController({ storage });
  assert.equal(controller.getActiveProfile().name, 'Standard MIDI');
  assert.equal(controller.getMappings('default-midi').length, 3);
  assert.throws(() => controller.renameProfile('default-midi', 'Nytt navn'), /skrivebeskyttet/);
  assert.throws(() => controller.deleteProfile('default-midi'), /skrivebeskyttet/);
  assert.throws(
    () => controller.setMappingActive('default-master', false, { profileId: 'default-midi' }),
    /skrivebeskyttet/,
  );
  assert.throws(
    () => controller.removeMapping('default-master', { profileId: 'default-midi' }),
    /skrivebeskyttet/,
  );
  assert.throws(
    () => controller.startLearn({
      target: { kind: 'parameter', key: 'master' },
      profileId: 'default-midi',
    }),
    /skrivebeskyttet/,
  );

  const editableCopy = controller.createProfile('Standard – kopi', { fromProfileId: 'default-midi' });
  assert.equal(editableCopy.mappings.length, 3);
  assert.doesNotThrow(() => controller.startLearn({
    target: { kind: 'parameter', key: 'master' },
    mappingId: editableCopy.mappings[1].id,
    profileId: editableCopy.id,
  }));
});

test('stored custom profiles require mappings and are normalized before runtime use', () => {
  const storage = new MemoryStorage({
    [MIDI_STORAGE_KEY]: JSON.stringify({
      version: 1,
      activeProfileId: 'normalized',
      profiles: [
        { id: 'broken', name: 'Mangler koblinger' },
        {
          id: 'normalized',
          name: 'Normalisert',
          mappings: [{
            id: 'normalized-master',
            source: { deviceId: 'controller', channel: '2', type: 'CC', number: 20 },
            target: { kind: 'parameter', key: 'master' },
            mode: 'continuous',
          }],
        },
      ],
    }),
  });
  assert.equal(validateProfile({ id: 'broken', name: 'Mangler koblinger' }).valid, false);
  const controller = createMidiController({ storage });
  assert.equal(controller.getProfiles().some((profile) => profile.id === 'broken'), false);
  assert.equal(controller.getActiveProfile().id, 'normalized');
  assert.deepEqual(controller.getMappings(), [{
    id: 'normalized-master',
    name: '',
    active: true,
    source: { deviceId: 'controller', channel: 2, type: 'cc', number: 20 },
    target: { kind: 'parameter', key: 'master' },
    mode: 'continuous',
    softTakeover: true,
    takeoverThreshold: 2,
  }]);
  assert.doesNotThrow(() => controller.createProfile('Kopi', { fromProfileId: 'normalized' }));
});

test('v1 MIDI profiles retain valid mappings while deprecated shared pad targets are removed', () => {
  const storage = new MemoryStorage({
    [MIDI_STORAGE_KEY]: JSON.stringify({
      version: 1,
      activeProfileId: 'legacy-pad-profile',
      profiles: [{
        id: 'legacy-pad-profile',
        name: 'Gamle padkontroller',
        mappings: [
          {
            id: 'keep-master',
            source: { deviceId: 'legacy', channel: 1, type: 'cc', number: 7 },
            target: { kind: 'parameter', key: 'master' },
            mode: 'continuous',
          },
          {
            id: 'remove-pad-pan',
            source: { deviceId: 'legacy', channel: 1, type: 'cc', number: 8 },
            target: { kind: 'parameter', key: 'padPan' },
            mode: 'continuous',
          },
          {
            id: 'remove-pad-tone',
            source: { deviceId: 'legacy', channel: 1, type: 'cc', number: 9 },
            target: { kind: 'parameter', key: 'padTone' },
            mode: 'continuous',
          },
          {
            id: 'remove-pad-send',
            source: { deviceId: 'legacy', channel: 1, type: 'cc', number: 10 },
            target: { kind: 'parameter', key: 'padSend' },
            mode: 'continuous',
          },
        ],
      }],
    }),
  });
  const controller = createMidiController({ storage });
  assert.equal(controller.getActiveProfile().id, 'legacy-pad-profile');
  assert.deepEqual(controller.getMappings().map((mapping) => mapping.id), ['keep-master']);
  controller.renameProfile('legacy-pad-profile', 'Migrert profil');
  assert.equal(JSON.parse(storage.getItem(MIDI_STORAGE_KEY)).version, MIDI_PROFILE_VERSION);
});

test('MIDI Learn creates, collision-checks, deactivates and relearns mappings', () => {
  const controller = createMidiController();
  const profile = controller.createProfile('Learn');
  controller.startLearn({
    target: { kind: 'parameter', key: 'master' },
    profileId: profile.id,
  });
  const learned = controller.handleMidiMessage(midi(0xb1, 21, 10, 'akai-one'));
  assert.equal(learned.kind, 'learned');
  assert.deepEqual(learned.mapping.source, {
    deviceId: 'akai-one',
    channel: 2,
    type: 'cc',
    number: 21,
  });

  controller.startLearn({
    target: { kind: 'parameter', key: 'cutoff' },
    profileId: profile.id,
  });
  const collision = controller.handleMidiMessage(midi(0xb1, 21, 64, 'akai-one'));
  assert.equal(collision.kind, 'learn-collision');
  assert.equal(controller.getLearnState().target.key, 'cutoff');
  controller.cancelLearn();

  assert.equal(controller.setMappingActive(learned.mapping.id, false, { profileId: profile.id }).active, false);
  assert.equal(controller.setMappingActive(learned.mapping.id, true, { profileId: profile.id }).active, true);
  controller.relearnMapping(learned.mapping.id, { profileId: profile.id });
  const relearned = controller.handleMidiMessage(midi(0xb0, 22, 33, 'akai-two'));
  assert.equal(relearned.kind, 'learned');
  assert.equal(controller.getMappings(profile.id).length, 1);
  assert.deepEqual(controller.getMappings(profile.id)[0].source, {
    deviceId: 'akai-two',
    channel: 1,
    type: 'cc',
    number: 22,
  });
  assert.equal(controller.removeMapping(learned.mapping.id, { profileId: profile.id }), true);
  assert.equal(controller.getMappings(profile.id).length, 0);
});

test('device, channel, message type and number all participate in matching', () => {
  const values = { master: 0 };
  const changes = [];
  const performances = [];
  const controller = createMidiController({
    getParameterValue: (key) => values[key],
    onParameterChange: (event) => {
      values[event.key] = event.value;
      changes.push(event);
    },
    onPerformance: (event) => performances.push(event),
  });
  const profile = controller.createProfile('Exact matching');
  controller.startLearn({ target: { kind: 'parameter', key: 'master' }, profileId: profile.id });
  controller.handleMidiMessage(midi(0xb2, 19, 0, 'exact-device'));

  assert.equal(controller.handleMidiMessage(midi(0xb2, 19, 127, 'other-device')).kind, 'unmapped');
  assert.equal(controller.handleMidiMessage(midi(0xb1, 19, 127, 'exact-device')).kind, 'unmapped');
  assert.equal(controller.handleMidiMessage(midi(0xb2, 20, 127, 'exact-device')).kind, 'unmapped');
  assert.equal(changes.length, 0);

  const applied = controller.handleMidiMessage(midi(0xb2, 19, 127, 'exact-device'));
  assert.equal(applied.kind, 'parameter');
  assert.equal(applied.applied, true);
  assert.equal(changes.length, 1);
  assert.equal(values.master, 1.25);

  const note = controller.handleMidiMessage(midi(0x92, 19, 100, 'exact-device'));
  assert.equal(note.kind, 'performance');
  assert.equal(note.consumed, false);
  assert.equal(performances[0].type, 'note-on');
});

test('soft takeover waits, crosses without a jump and re-arms after an external edit', () => {
  const values = { cutoff: 4000 };
  const changes = [];
  const controller = createMidiController({
    getParameterValue: (key) => values[key],
    onParameterChange: ({ key, value }) => {
      values[key] = value;
      changes.push(value);
    },
  });
  const profile = controller.createProfile('Pickup');
  controller.startLearn({ target: { kind: 'parameter', key: 'cutoff' }, profileId: profile.id });
  controller.handleMidiMessage(midi(0xb0, 10, 4, 'pickup'));

  const waiting = controller.handleMidiMessage(midi(0xb0, 10, 5, 'pickup'));
  assert.equal(waiting.waitingForTakeover, true);
  assert.equal(changes.length, 0);
  const crossed = controller.handleMidiMessage(midi(0xb0, 10, 120, 'pickup'));
  assert.equal(crossed.applied, true);
  assert.equal(changes.length, 1);

  values.cutoff = 80;
  const rearmed = controller.handleMidiMessage(midi(0xb0, 10, 110, 'pickup'));
  assert.equal(rearmed.waitingForTakeover, true);
  assert.equal(changes.length, 1);
  controller.resetTakeover();
  assert.equal(controller.handleMidiMessage(midi(0xb0, 10, 1, 'pickup')).waitingForTakeover, true);
  assert.equal(controller.handleMidiMessage(midi(0xb0, 10, 20, 'pickup')).applied, true);
});

test('mapped Note and CC buttons provide one toggle per press and balanced trigger phases', () => {
  const actions = [];
  const performances = [];
  const controller = createMidiController({
    onAction: (action) => actions.push(action),
    onPerformance: (event) => performances.push(event),
  });
  const profile = controller.createProfile('Buttons');

  controller.startLearn({
    target: { kind: 'action', action: 'sequence-step-toggle', index: 3 },
    mode: 'toggle',
    profileId: profile.id,
  });
  controller.handleMidiMessage(midi(0x90, 36, 127, 'buttons'));
  controller.handleMidiMessage(midi(0x80, 36, 0, 'buttons'));
  controller.handleMidiMessage(midi(0x90, 36, 127, 'buttons'));
  controller.handleMidiMessage(midi(0x90, 36, 127, 'buttons'));
  controller.handleMidiMessage(midi(0x80, 36, 0, 'buttons'));
  controller.handleMidiMessage(midi(0x80, 36, 0, 'buttons'));
  controller.handleMidiMessage(midi(0x90, 36, 127, 'buttons'));
  assert.deepEqual(actions.map((action) => action.phase), ['toggle', 'toggle']);
  assert.deepEqual(actions.map((action) => action.index), [3, 3]);
  assert.equal(performances.length, 0);

  controller.startLearn({
    target: { kind: 'action', action: 'kick-trigger' },
    mode: 'trigger',
    profileId: profile.id,
  });
  controller.handleMidiMessage(midi(0xb0, 70, 127, 'buttons'));
  controller.handleMidiMessage(midi(0xb0, 70, 0, 'buttons'));
  controller.handleMidiMessage(midi(0xb0, 70, 127, 'buttons'));
  controller.handleMidiMessage(midi(0xb0, 70, 127, 'buttons'));
  controller.handleMidiMessage(midi(0xb0, 70, 0, 'buttons'));
  controller.handleMidiMessage(midi(0xb0, 70, 0, 'buttons'));
  assert.deepEqual(actions.slice(2).map((action) => action.phase), ['start', 'end']);
});

test('unmapped notes remain performance events while mapped note buttons are consumed', () => {
  const performances = [];
  const controller = createMidiController({ onPerformance: (event) => performances.push(event) });
  const profile = controller.createProfile('Note routing');
  controller.startLearn({
    target: { kind: 'action', action: 'sequencer-toggle' },
    mode: 'toggle',
    profileId: profile.id,
  });
  controller.handleMidiMessage(midi(0x90, 42, 100, 'keyboard'));
  controller.handleMidiMessage(midi(0x80, 42, 0, 'keyboard'));
  const mapped = controller.handleMidiMessage(midi(0x90, 42, 100, 'keyboard'));
  assert.equal(mapped.consumed, true);
  assert.equal(performances.length, 0);

  const on = controller.handleMidiMessage(midi(0x90, 60, 100, 'keyboard'));
  const off = controller.handleMidiMessage(midi(0x90, 60, 0, 'keyboard'));
  assert.equal(on.consumed, false);
  assert.equal(off.consumed, false);
  assert.deepEqual(performances.map((event) => event.type), ['note-on', 'note-off']);
  assert.equal(performances[0].velocity, 100 / 127);
});

test('Pad MIDI Learn consumes mapped notes and forwards velocity with matching Note Off', () => {
  const actions = [];
  const performances = [];
  const controller = createMidiController({
    onAction: (action) => actions.push(action),
    onPerformance: (event) => performances.push(event),
  });
  const profile = controller.createProfile('MiniPad');
  controller.startLearn({
    target: { kind: 'action', action: 'pad-trigger', index: 7 },
    mode: 'trigger',
    profileId: profile.id,
  });
  controller.handleMidiMessage(midi(0x92, 48, 100, 'minipad'));
  controller.handleMidiMessage(midi(0x82, 48, 0, 'minipad'));

  const on = controller.handleMidiMessage(midi(0x92, 48, 96, 'minipad'));
  const off = controller.handleMidiMessage(midi(0x82, 48, 0, 'minipad'));
  assert.equal(on.consumed, true);
  assert.equal(off.consumed, true);
  assert.equal(performances.length, 0);
  assert.deepEqual(actions.map((action) => [action.action, action.index, action.phase]), [
    ['pad-trigger', 7, 'start'],
    ['pad-trigger', 7, 'end'],
  ]);
  assert.equal(actions[0].message.velocity, 96 / 127);

  assert.equal(validateProfile({
    id: 'invalid-pad',
    name: 'Invalid pad',
    mappings: [{
      id: 'bad',
      source: { deviceId: '*', channel: 1, type: 'note', number: 48 },
      target: { kind: 'action', action: 'pad-trigger', index: 0 },
      mode: 'toggle',
    }],
  }).valid, false);
});

test('recognized MIDI messages report activity before mapped or unmapped routing', () => {
  const messages = [];
  const controller = createMidiController({ onMidiMessage: (message) => messages.push(message) });
  controller.handleMidiMessage(midi(0xb0, 99, 45, 'activity'));
  controller.handleMidiMessage(midi(0x90, 60, 100, 'activity'));
  assert.deepEqual(messages.map((message) => [message.type, message.number, message.channel, message.deviceId]), [
    ['cc', 99, 1, 'activity'],
    ['note', 60, 1, 'activity'],
  ]);
});

test('Web MIDI lifecycle reports status, lists inputs and supports per-input enablement', async () => {
  const inputA = {
    id: 'input-a',
    name: 'MIDImix A',
    manufacturer: 'Akai',
    state: 'connected',
    connection: 'open',
    onmidimessage: null,
  };
  const inputB = {
    id: 'input-b',
    name: 'MIDImix B',
    manufacturer: 'Akai',
    state: 'connected',
    connection: 'open',
    onmidimessage: null,
  };
  const listeners = new Map();
  const access = {
    inputs: new Map([[inputA.id, inputA], [inputB.id, inputB]]),
    addEventListener: (type, listener) => listeners.set(type, listener),
    removeEventListener: (type) => listeners.delete(type),
  };
  const storage = new MemoryStorage();
  const statuses = [];
  const performance = [];
  const controller = createMidiController({
    storage,
    requestMIDIAccess: async (options) => {
      assert.deepEqual(options, { sysex: false });
      return access;
    },
    onStatus: (status) => statuses.push(status),
    onPerformance: (event) => performance.push(event),
  });
  assert.equal(await controller.connect(), access);
  assert.deepEqual(statuses.map((status) => status.state), ['requesting', 'connected']);
  assert.deepEqual(controller.getInputs().map((input) => [input.id, input.enabled]), [
    ['input-a', true],
    ['input-b', true],
  ]);
  assert.equal(typeof inputA.onmidimessage, 'function');
  inputA.onmidimessage({ data: [0x90, 64, 127] });
  assert.equal(performance.length, 1);

  assert.equal(controller.setInputEnabled('input-a', false), true);
  assert.equal(inputA.onmidimessage, null);
  assert.equal(controller.getInputs()[0].enabled, false);
  assert.equal(controller.setInputEnabled('missing', false), false);
  const inputC = {
    id: 'input-c',
    name: 'Hotplug',
    manufacturer: 'Akai',
    state: 'connected',
    connection: 'open',
    onmidimessage: null,
  };
  access.inputs.set(inputC.id, inputC);
  listeners.get('statechange')();
  assert.equal(controller.getInputs().find((input) => input.id === 'input-c').enabled, true);
  assert.equal(typeof inputC.onmidimessage, 'function');
  controller.disconnect();
  assert.equal(inputB.onmidimessage, null);
  assert.equal(statuses.at(-1).state, 'disconnected');

  const restored = createMidiController({
    storage,
    requestMIDIAccess: async () => access,
  });
  await restored.connect();
  assert.equal(restored.getInputs().find((input) => input.id === 'input-a').enabled, false);
  assert.equal(inputA.onmidimessage, null);
  restored.disconnect();
});

test('parallel Web MIDI connects share one request and one removable state listener', async () => {
  let resolveAccess;
  let requestCount = 0;
  const listeners = new Set();
  const access = {
    inputs: new Map(),
    addEventListener: (type, listener) => { if (type === 'statechange') listeners.add(listener); },
    removeEventListener: (type, listener) => { if (type === 'statechange') listeners.delete(listener); },
  };
  const controller = createMidiController({
    requestMIDIAccess: () => {
      requestCount += 1;
      return new Promise((resolve) => { resolveAccess = resolve; });
    },
  });
  const first = controller.connect();
  const second = controller.connect();
  assert.equal(requestCount, 1);
  resolveAccess(access);
  assert.deepEqual(await Promise.all([first, second]), [access, access]);
  assert.equal(listeners.size, 1);
  controller.disconnect();
  assert.equal(listeners.size, 0);
});

test('unsupported and rejected Web MIDI access are non-throwing status outcomes', async () => {
  const unsupported = [];
  const noApi = createMidiController({ onStatus: (status) => unsupported.push(status) });
  assert.equal(await noApi.connect(), null);
  assert.equal(unsupported.at(-1).state, 'unsupported');

  const rejected = [];
  const denied = createMidiController({
    requestMIDIAccess: async () => {
      throw new Error('denied');
    },
    onStatus: (status) => rejected.push(status),
  });
  assert.equal(await denied.connect(), null);
  assert.deepEqual(rejected.map((status) => status.state), ['requesting', 'error']);
});
