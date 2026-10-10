import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  appendRecordingWaveformFrame,
  createRecordingWaveformHistory,
  recordingWaveformPath,
  resetRecordingWaveformHistory,
} from '../assets/recording-waveform.js';

test('digital silence remains a flat midpoint instead of frozen signal data', () => {
  const history = createRecordingWaveformHistory(8);
  appendRecordingWaveformFrame(history, new Float32Array(32), 4);
  assert.deepEqual([...history], [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(recordingWaveformPath(history), 'M0 120H1000');
});

test('new analyser peaks roll in from the right and old peaks roll out', () => {
  const history = createRecordingWaveformHistory(8);
  appendRecordingWaveformFrame(history, Float32Array.from([0, 0.25, -0.5, 1]), 4);
  assert.deepEqual([...history], [0, 0, 0, 0, 0, 0.25, 0.5, 1]);
  assert.match(recordingWaveformPath(history), /^M0\.0 120\.0L/);

  appendRecordingWaveformFrame(history, new Float32Array(4), 4);
  assert.deepEqual([...history], [0, 0.25, 0.5, 1, 0, 0, 0, 0]);
  resetRecordingWaveformHistory(history);
  assert.deepEqual([...history], [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(recordingWaveformPath(history), 'M0 120H1000');
});

test('waveform helpers clamp unsafe sizes and amplitudes', () => {
  const history = createRecordingWaveformHistory(0);
  appendRecordingWaveformFrame(history, Float32Array.from([4]), 99);
  assert.equal(history.length, 1);
  assert.equal(history[0], 1);
  assert.match(recordingWaveformPath(history, { width: 320, midpoint: 37, amplitude: 32 }), /^M0\.0 5\.0/);
});

test('recorder lifecycle starts, stops and clears one throttled live surface', async () => {
  const [app, engine, html, css, worker, updater, packageJson, version] = await Promise.all([
    readFile(new URL('../assets/app.js', import.meta.url), 'utf8'),
    readFile(new URL('../assets/audio-engine.js', import.meta.url), 'utf8'),
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../assets/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
    readFile(new URL('../assets/update-controller.js', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8').then(JSON.parse),
    readFile(new URL('../version.json', import.meta.url), 'utf8').then(JSON.parse),
  ]);
  const section = (start, end) => app.slice(app.indexOf(start), app.indexOf(end));
  const start = section('async function startRecorderCapture', 'async function finishRecorderCapture');
  const finish = section('async function finishRecorderCapture', 'function cancelRecorderCapture');
  const cancel = section('function cancelRecorderCapture', 'async function previewRecorderSelection');
  const close = section('function finishRecorderClose', 'async function startRecorderCapture');

  assert.match(start, /await engine\.startSupportRecording\(source\)/);
  assert.match(start, /startRecorderLiveWaveform\(\)/);
  assert.match(finish, /stopRecorderLiveWaveform\(\)/);
  assert.match(finish, /await engine\.stopSupportRecording\(\)/);
  assert.match(finish, /renderRecorderDraft\(\)/);
  assert.match(cancel, /stopRecorderLiveWaveform\(\{ resetPath: true \}\)/);
  assert.match(cancel, /engine\.cancelSupportRecording\(\)/);
  assert.match(close, /stopRecorderLiveWaveform\(\{ resetPath: !recorderDraft \}\)/);
  assert.match(app, /RECORDER_LIVE_FRAME_INTERVAL = 1000 \/ 20/);
  assert.match(app, /pagehide[\s\S]*stopRecorderLiveWaveform\(\{ resetPath: true \}\)[\s\S]*engine\.cancelSupportRecording\(\)/);

  assert.match(engine, /source === 'microphone' \? this\.micStream : this\.recordDestination\.stream/);
  assert.match(engine, /this\.startSupportRecordingAnalysis\(stream\)/);
  assert.match(engine, /source\.connect\(analyser\)/);
  assert.doesNotMatch(engine, /supportRecordingAnalyser\.connect\(this\.context\.destination\)/);

  assert.equal((html.match(/data-recorder-trim/g) || []).length, 6);
  assert.match(css, /\.recorder-dialog[^}]+overflow-x: hidden/s);
  assert.match(css, /\.recorder-draft \{[^}]*min-width: 0/);
  assert.match(css, /\.recorder-draft \[hidden\] \{ display: none !important; \}/);
  assert.match(worker, /assets\/recording-waveform\.js\?build=\$\{BUILD_ID\}/);
  assert.match(updater, /\.\/assets\/recording-waveform\.js/);
  assert.match(packageJson.scripts.check, /assets\/recording-waveform\.js/);
  assert.deepEqual(version, { version: '0.15.1', build: '2026-10-10.1' });
});
