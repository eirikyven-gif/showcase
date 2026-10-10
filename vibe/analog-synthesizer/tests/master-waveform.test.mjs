import assert from 'node:assert/strict';
import test from 'node:test';
import {
  flatWaveformPath,
  masterWaveformPath,
  resolveMasterWaveformStatus,
  waveformLevel,
} from '../assets/master-waveform.js';

test('master waveform is a flat midpoint before playback and for digital silence', () => {
  assert.equal(flatWaveformPath(), 'M0 45H640');
  const silence = new Uint8Array(512).fill(128);
  assert.equal(masterWaveformPath(silence), 'M0 45H640');
  assert.equal(waveformLevel(silence), -Infinity);
});

test('master waveform path represents real analyser samples', () => {
  const signal = Uint8Array.from({ length: 512 }, (_, index) => (
    Math.round(128 + Math.sin((index / 512) * Math.PI * 8) * 80)
  ));
  const path = masterWaveformPath(signal, { stride: 8 });
  assert.match(path, /^M0\.0 /);
  assert.match(path, /L/);
  assert.notEqual(path, flatWaveformPath());
  assert.ok(waveformLevel(signal) > -10);
});

test('waveform status never presents stopped, missing or silent data as live movement', () => {
  assert.equal(resolveMasterWaveformStatus({ playbackState: 'suspended', hasData: true, level: -4 }), 'Stoppet · flat linje');
  assert.equal(resolveMasterWaveformStatus({ playbackState: 'running', hasData: false }), 'Masteranalyse utilgjengelig · flat linje');
  assert.equal(resolveMasterWaveformStatus({ playbackState: 'running', hasData: true, level: -Infinity }), 'Masterutgang er stille · flat linje');
  assert.equal(resolveMasterWaveformStatus({ playbackState: 'running', hasData: true, level: -12 }), 'Live masterutgang');
});
