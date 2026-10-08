'use strict';
const status = document.querySelector('#status');
const toggle = document.querySelector('#audio-toggle');
const presetSelect = document.querySelector('#preset');
const controls = {
  frequency: document.querySelector('#frequency'),
  filter: document.querySelector('#filter'),
  volume: document.querySelector('#volume'),
};
let context = null;
let master = null;
let filterNode = null;
const voices = new Map();
const keys = ['a','w','s','e','d','f','t','g','y','h','u','j'];
const presets = {
  warm: { wave: 'sawtooth', octave: 0, cutoff: 3200 },
  bright: { wave: 'triangle', octave: 1, cutoff: 6500 },
  deep: { wave: 'square', octave: -1, cutoff: 1000 },
};
function showValue(name, value) {
  const output = document.querySelector(`output[for="${name}"]`);
  output.value = name === 'frequency' ? `${value} Hz` : name === 'filter' ? `${(Number(value) / 1000).toFixed(1)} kHz` : `${value}%`;
}
Object.entries(controls).forEach(([name, input]) => {
  showValue(name, input.value);
  input.addEventListener('input', () => {
    showValue(name, input.value);
    if (name === 'filter' && filterNode) filterNode.frequency.setTargetAtTime(Number(input.value), context.currentTime, .025);
    if (name === 'volume' && master) master.gain.setTargetAtTime(Number(input.value) / 100, context.currentTime, .025);
  });
});
function applyPreset() {
  const preset = presets[presetSelect.value];
  controls.filter.value = String(preset.cutoff);
  showValue('filter', controls.filter.value);
  if (filterNode) filterNode.frequency.setTargetAtTime(preset.cutoff, context.currentTime, .025);
}
presetSelect.addEventListener('change', applyPreset);
toggle.addEventListener('click', async () => {
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { status.textContent = 'Denne nettleseren støtter ikke Web Audio.'; return; }
    context = new AudioContextClass();
    master = context.createGain();
    filterNode = context.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = Number(controls.filter.value);
    master.gain.value = Number(controls.volume.value) / 100;
    filterNode.connect(master).connect(context.destination);
  }
  if (context.state === 'running') {
    voices.forEach((voice, note) => stopNote(note));
    await context.suspend();
    toggle.textContent = 'Start lyd'; toggle.setAttribute('aria-pressed','false'); status.textContent = 'Av — lyden er stoppet';
  } else {
    try { await context.resume(); toggle.textContent = 'Stopp lyd'; toggle.setAttribute('aria-pressed','true'); status.textContent = 'Klar — spill en tone'; }
    catch { status.textContent = 'Nettleseren kunne ikke starte lyd. Prøv igjen.'; }
  }
});
function startNote(note) {
  if (!context || context.state !== 'running' || voices.has(note)) return;
  const preset = presets[presetSelect.value];
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = preset.wave;
  oscillator.frequency.value = Number(controls.frequency.value) * Math.pow(2, (note - 9) / 12) * Math.pow(2, preset.octave);
  envelope.gain.setValueAtTime(.0001, context.currentTime);
  envelope.gain.exponentialRampToValueAtTime(.65, context.currentTime + .025);
  oscillator.connect(envelope).connect(filterNode);
  oscillator.start(); voices.set(note, { oscillator, envelope });
}
function stopNote(note) {
  const voice = voices.get(note);
  if (!voice) return;
  voice.envelope.gain.cancelScheduledValues(context.currentTime);
  voice.envelope.gain.setTargetAtTime(.0001, context.currentTime, .035);
  voice.oscillator.stop(context.currentTime + .2);
  voices.delete(note);
}
document.querySelectorAll('[data-note]').forEach((button) => {
  const note = Number(button.dataset.note);
  button.addEventListener('pointerdown', (event) => { event.preventDefault(); button.setPointerCapture(event.pointerId); startNote(note); button.classList.add('active'); });
  const release = () => { stopNote(note); button.classList.remove('active'); };
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
});
const heldKeys = new Set();
window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase(); const note = keys.indexOf(key);
  if (note < 0 || event.repeat || event.target.matches('input,select,button')) return;
  event.preventDefault(); heldKeys.add(key); startNote(note);
});
window.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase(); const note = keys.indexOf(key);
  if (note < 0) return; heldKeys.delete(key); stopNote(note);
});
window.addEventListener('blur', () => { heldKeys.forEach((key) => stopNote(keys.indexOf(key))); heldKeys.clear(); });
