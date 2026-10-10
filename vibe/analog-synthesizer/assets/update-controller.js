const CURRENT_BUILD = '2026-10-10.1';
const APP_CACHE_PREFIX = 'analog-synthesizer-';

export class UpdateController {
  constructor({ isBusy, onStatus, onCurrent, onError }) {
    this.isBusy = isBusy;
    this.onStatus = onStatus;
    this.onCurrent = onCurrent;
    this.onError = onError;
    this.registration = null;
    this.reloading = false;
    this.interval = 0;
    this.targetBuild = '';
  }

  async start() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.addEventListener('message', (event) => this.handleMessage(event));
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!this.reloading && !this.isBusy()) this.reload(this.targetBuild || CURRENT_BUILD, true);
    });
    this.registration = await navigator.serviceWorker.register(`./service-worker.js?build=${CURRENT_BUILD}`, { updateViaCache: 'none' });
    this.watchRegistration();
    await this.check();
    this.interval = window.setInterval(() => this.check(), 60000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.check(); });
    window.addEventListener('online', () => this.check());
  }

  watchRegistration() {
    if (this.registration.waiting) void this.check();
    this.registration.addEventListener('updatefound', () => {
      const worker = this.registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) void this.check();
      });
    });
  }

  async check() {
    try {
      const version = await this.readVersion();
      if (!version?.build) return false;
      this.targetBuild = version.build;
      if (version.build === CURRENT_BUILD) {
        this.onCurrent?.(version.build);
        return false;
      }
      if (!(await this.verifyPublishedBuild(version))) {
        this.onCurrent?.(CURRENT_BUILD);
        return false;
      }
      await this.registration?.update();
      this.showUpdate(version.build);
      return true;
    } catch (_error) { /* Offline mode keeps the cached shell */ }
    return false;
  }

  async readVersion() {
    const response = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Kunne ikke lese versjonsfilen.');
    return response.json();
  }

  async verifyPublishedBuild(version) {
    const token = Date.now();
    const paths = [
      './service-worker.js',
      './assets/update-controller.js',
      './assets/app.js',
      './assets/audio-playback-controller.js',
      './assets/master-waveform.js',
      './assets/recording-waveform.js',
      './assets/sequencer-editor.js',
      './assets/midi-controller.js',
      './assets/pad-activation.js',
      './assets/state.js',
      './assets/local-library.js',
      './assets/local-data.js',
      './index.html',
    ];
    const responses = await Promise.all(paths.map((path) => fetch(`${path}?probe=${token}`, { cache: 'no-store' })));
    if (responses.some((response) => !response.ok)) return false;
    const [
      workerSource,
      controllerSource,
      appSource,
      audioPlaybackSource,
      masterWaveformSource,
      recordingWaveformSource,
      sequencerEditorSource,
      midiSource,
      padActivationSource,
      stateSource,
      indexSource,
    ] = await Promise.all(responses.map((response) => response.text()));
    return workerSource.includes(`const BUILD_ID = '${version.build}'`)
      && controllerSource.includes(`const CURRENT_BUILD = '${version.build}'`)
      && appSource.includes(`?build=${version.build}`)
      && audioPlaybackSource.includes('export function createAudioPlaybackController')
      && masterWaveformSource.includes('export function masterWaveformPath')
      && recordingWaveformSource.includes('export function appendRecordingWaveformFrame')
      && sequencerEditorSource.includes('export function applyRelativeStepAdjustment')
      && midiSource.includes('export function createMidiController')
      && padActivationSource.includes('export function createPadActivationController')
      && stateSource.includes(`export const APP_VERSION = '${version.version}'`)
      && indexSource.includes(`data-build="${version.build}"`)
      && indexSource.includes(`app.js?build=${version.build}`);
  }

  async clearAppCaches() {
    if (!('caches' in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(APP_CACHE_PREFIX)).map((key) => caches.delete(key)));
  }

  showUpdate(build = '') {
    this.onStatus?.('Ny versjon tilgjengelig', build);
  }

  async applyUpdate() {
    if (this.isBusy()) {
      this.onError?.(new Error('Oppdateringen venter til aktivt opptak er stoppet.'));
      navigator.serviceWorker.controller?.postMessage({ type: 'DEFER_RELOAD' });
      return false;
    }
    if (!navigator.onLine) {
      this.onError?.(new Error('Koble til nett før oppdateringen kjøres.'));
      return false;
    }
    try {
      const version = await this.readVersion();
      if (!version?.build || !(await this.verifyPublishedBuild(version))) throw new Error('Den nye versjonen er ikke ferdig publisert. Prøv igjen om litt.');
      this.targetBuild = version.build;
      this.onStatus?.('Oppdaterer…', this.targetBuild, true);
      await this.clearAppCaches();
      await this.registration?.unregister();
      this.registration = null;
      this.reload(this.targetBuild, true);
      return true;
    } catch (error) {
      this.onStatus?.('Oppdatering feilet – prøv igjen', this.targetBuild, false);
      this.onError?.(error);
      return false;
    }
  }

  handleMessage(event) {
    if (event.data?.type !== 'VERSION_ACTIVATED') return;
    if (this.isBusy()) {
      event.source?.postMessage({ type: 'DEFER_RELOAD' });
      this.showUpdate(event.data.build);
      return;
    }
    this.targetBuild = event.data.build || this.targetBuild || CURRENT_BUILD;
    this.reload(this.targetBuild, true);
  }

  reload(build, hard = false) {
    if (this.reloading) return;
    this.reloading = true;
    const url = new URL(window.location.href);
    url.searchParams.set('build', build);
    if (hard) url.searchParams.set('refresh', String(Date.now()));
    window.location.replace(url.href);
  }
}
