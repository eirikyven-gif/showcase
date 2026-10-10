export const PORT_TYPES = Object.freeze({ AUDIO: 'audio', CV: 'cv', GATE: 'gate', CLOCK: 'clock' });

export const AUDIO_SOURCE_IDS = Object.freeze(['vco', 'noise', 'kick', 'mic', 'A', 'B', 'pads']);

export const AUDIO_SOURCE_STATE = Object.freeze({
  vco: { moduleId: 'vco', mute: 'synthMute', solo: 'synthSolo' },
  noise: { moduleId: 'noise', mute: 'noiseMute', solo: 'noiseSolo' },
  kick: { moduleId: 'kick', mute: 'kickMute', solo: 'kickSolo' },
  mic: { moduleId: 'microphone', mute: 'micMute', solo: 'micSolo' },
  A: { moduleId: 'sampleA', mute: 'sampleAMute', solo: 'sampleASolo' },
  B: { moduleId: 'sampleB', mute: 'sampleBMute', solo: 'sampleBSolo' },
  pads: { moduleId: 'padSampler', mute: 'padMute', solo: 'padSolo' },
});

const input = (type) => Object.freeze({ direction: 'input', type });
const output = (type) => Object.freeze({ direction: 'output', type });

export const MODULE_PORTS = Object.freeze({
  vco: { pitch: input(PORT_TYPES.CV), out: output(PORT_TYPES.AUDIO) },
  noise: { hold: input(PORT_TYPES.GATE), out: output(PORT_TYPES.AUDIO) },
  sampleHold: { clock: input(PORT_TYPES.CLOCK), out: output(PORT_TYPES.CV) },
  wavefolder: { in: input(PORT_TYPES.AUDIO), fold: input(PORT_TYPES.CV), out: output(PORT_TYPES.AUDIO) },
  filter: { in: input(PORT_TYPES.AUDIO), cutoff: input(PORT_TYPES.CV), out: output(PORT_TYPES.AUDIO) },
  envelope: { in: input(PORT_TYPES.AUDIO), gate: input(PORT_TYPES.GATE), out: output(PORT_TYPES.AUDIO) },
  lfo: { clock: input(PORT_TYPES.CLOCK), out: output(PORT_TYPES.CV) },
  kick: { trigger: input(PORT_TYPES.GATE), out: output(PORT_TYPES.AUDIO) },
  sequencer: { pitch: output(PORT_TYPES.CV), gate: output(PORT_TYPES.GATE), clock: output(PORT_TYPES.CLOCK) },
  microphone: { out: output(PORT_TYPES.AUDIO) },
  voiceFx: { in: input(PORT_TYPES.AUDIO), out: output(PORT_TYPES.AUDIO) },
  sampleA: { trigger: input(PORT_TYPES.GATE), out: output(PORT_TYPES.AUDIO) },
  sampleB: { trigger: input(PORT_TYPES.GATE), out: output(PORT_TYPES.AUDIO) },
  padSampler: { trigger: input(PORT_TYPES.GATE), out: output(PORT_TYPES.AUDIO) },
  mixer: {
    vco: input(PORT_TYPES.AUDIO), noise: input(PORT_TYPES.AUDIO), kick: input(PORT_TYPES.AUDIO),
    mic: input(PORT_TYPES.AUDIO), sampleA: input(PORT_TYPES.AUDIO), sampleB: input(PORT_TYPES.AUDIO),
    pads: input(PORT_TYPES.AUDIO),
    out: output(PORT_TYPES.AUDIO),
  },
  delay: { in: input(PORT_TYPES.AUDIO), out: output(PORT_TYPES.AUDIO) },
  master: { in: input(PORT_TYPES.AUDIO), out: output(PORT_TYPES.AUDIO) },
  scope: { in: input(PORT_TYPES.AUDIO) },
  keyboard: { pitch: output(PORT_TYPES.CV), gate: output(PORT_TYPES.GATE) },
});

const normalled = (from, to) => Object.freeze({ id: `${from}>${to}`, from, to, enabled: true, normalled: true });

export const DEFAULT_PATCH_ROUTES = Object.freeze([
  normalled('vco.out', 'wavefolder.in'),
  normalled('noise.out', 'wavefolder.in'),
  normalled('wavefolder.out', 'filter.in'),
  normalled('filter.out', 'envelope.in'),
  normalled('envelope.out', 'mixer.vco'),
  normalled('envelope.out', 'mixer.noise'),
  normalled('kick.out', 'mixer.kick'),
  normalled('microphone.out', 'voiceFx.in'),
  normalled('voiceFx.out', 'mixer.mic'),
  normalled('sampleA.out', 'mixer.sampleA'),
  normalled('sampleB.out', 'mixer.sampleB'),
  normalled('padSampler.out', 'mixer.pads'),
  normalled('mixer.out', 'master.in'),
  normalled('delay.out', 'master.in'),
  normalled('master.out', 'scope.in'),
]);

function portDefinition(reference) {
  const [moduleId, portId] = String(reference).split('.');
  return MODULE_PORTS[moduleId]?.[portId];
}

export function sanitizePatchRoutes(routes) {
  if (!Array.isArray(routes)) return DEFAULT_PATCH_ROUTES.map((route) => ({ ...route }));
  const valid = [];
  const seen = new Set();
  for (const candidate of routes.slice(0, 64)) {
    const from = String(candidate?.from || '');
    const to = String(candidate?.to || '');
    const source = portDefinition(from);
    const target = portDefinition(to);
    const id = `${from}>${to}`;
    if (!source || !target || source.direction !== 'output' || target.direction !== 'input' || source.type !== target.type || seen.has(id)) continue;
    seen.add(id);
    valid.push({ id, from, to, enabled: candidate.enabled !== false, normalled: Boolean(candidate.normalled) });
  }
  return valid.length ? valid : DEFAULT_PATCH_ROUTES.map((route) => ({ ...route }));
}

export function isSourceAudible(state, sourceId, active = true) {
  const definition = AUDIO_SOURCE_STATE[sourceId];
  if (!definition || !active || state?.[definition.mute]) return false;
  const anySolo = AUDIO_SOURCE_IDS.some((id) => state?.[AUDIO_SOURCE_STATE[id].solo]);
  return !anySolo || Boolean(state?.[definition.solo]);
}

export class AudioPatchRouter {
  constructor() { this.connections = new Map(); }

  connect(id, outputNode, inputNode) {
    if (!id || !outputNode || !inputNode || this.connections.has(id)) return;
    outputNode.connect(inputNode);
    this.connections.set(id, { outputNode, inputNode });
  }

  disconnect(id) {
    const connection = this.connections.get(id);
    if (!connection) return;
    try { connection.outputNode.disconnect(connection.inputNode); } catch (_error) { /* disconnected */ }
    this.connections.delete(id);
  }

  has(id) { return this.connections.has(id); }
}
