const BUILD_ID = '2026-10-10.1';
const CACHE_NAME = `analog-synthesizer-${BUILD_ID}`;
const CACHE_PREFIX = 'analog-synthesizer-';
const APP_SHELL = [
  './', './index.html', `./manifest.webmanifest?build=${BUILD_ID}`, './version.json',
  `./assets/styles.css?build=${BUILD_ID}`, `./assets/app.js?build=${BUILD_ID}`, `./assets/audio-engine.js?build=${BUILD_ID}`, `./assets/audio-playback-controller.js?build=${BUILD_ID}`, `./assets/master-waveform.js?build=${BUILD_ID}`, `./assets/recording-waveform.js?build=${BUILD_ID}`, `./assets/sequencer-editor.js?build=${BUILD_ID}`, `./assets/midi-controller.js?build=${BUILD_ID}`,
  `./assets/state.js?build=${BUILD_ID}`, `./assets/pad-activation.js?build=${BUILD_ID}`, `./assets/patch-router.js?build=${BUILD_ID}`, `./assets/sample-store.js?build=${BUILD_ID}`, `./assets/project-sync.js?build=${BUILD_ID}`, `./assets/local-sample-library.js?build=${BUILD_ID}`, `./assets/local-library.js?build=${BUILD_ID}`, `./assets/local-data.js?build=${BUILD_ID}`, `./assets/shared-recording-library.js?build=${BUILD_ID}`,
  `./assets/update-controller.js?build=${BUILD_ID}`, `./assets/icons/icon.svg?build=${BUILD_ID}`,
  './assets/icons/icon-180.png', './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/icon-maskable-512.png',
  `./audio-worklets/noise-processor.js?build=${BUILD_ID}`, `./audio-worklets/voice-processor.js?build=${BUILD_ID}`,
];
const deferredClients = new Set();

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(APP_SHELL.map((path) => cache.add(path)));
    await self.skipWaiting();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'DEFER_RELOAD' && event.source?.id) deferredClients.add(event.source.id);
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: 'VERSION_ACTIVATED', build: BUILD_ID });
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const currentClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of currentClients) {
      if (deferredClients.has(client.id)) continue;
      const url = new URL(client.url);
      if (url.searchParams.get('build') === BUILD_ID) continue;
      url.searchParams.set('build', BUILD_ID);
      await client.navigate(url.href);
    }
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', response.clone()));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  const isStaticAppFile = url.origin === self.location.origin && /\.(?:css|js|json|svg|png|webmanifest)$/.test(url.pathname);
  if (isStaticAppFile) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).then((response) => {
      if (response.ok && response.type !== 'opaque') caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request, { ignoreSearch: true })));
    return;
  }
  event.respondWith(fetch(event.request));
});
