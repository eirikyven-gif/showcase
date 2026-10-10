# Analog Synthesizer · Vibe

A local, faithful showcase copy of the Analog Synthesizer source app. It preserves the oscillator and noise rack, filters/modulation/effects, kick and sequencers, microphone and voice effects, Sample A/B and 12-pad sampler, MIDI mapping/performance, waveform recording and trimming, presets, module layout/focus workspace, and installable offline app behavior.

## Local-only adaptation

Projects have local IDs and are saved in this browser without PINs or accounts. Sample and recording libraries use IndexedDB on this device until cleared. Session state, presets, and MIDI profiles use the same localStorage mechanisms as the source. Imported files, microphone audio, and recordings stay in this browser; there are no PHP endpoints, server APIs, remote synchronization, or third-party requests. This is a public demo: microphone input and recordings can contain personal audio. Do not use sensitive recordings here. Use **Slett alle lokale data** to clear this app's localStorage keys, IndexedDB stores, and its offline cache.

Microphone and MIDI access still require explicit browser permission. Audio starts only after the user's action. Browser support for Web MIDI and installable offline apps varies.

## Run

Serve the repository root over HTTP and open `/vibe/analog-synthesizer/`. No build step is required.

## Provenance and uncertainty

Source: `eirikyven-gif/diverse-apper/apps/analog-synthesizer` at commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (source reports version 0.15.1). This copy retains source interface, engine, worklets, icons, tests, and offline app behavior while adapting project and library persistence to the browser. No PHP endpoints or server authentication are included. Source documentation reports a production target, but deployment and current live behavior were not independently verified. Its app overview and consolidated spec report conflicting lifecycle status. No repository LICENSE file was found; rights coverage for code/design/assets is unverified.


## QA

Run `npm run check` and `npm test` from this folder. These run JavaScript syntax checks and the retained source tests for audio lifecycle, sequencing, MIDI, pads, waveform and recorder behavior. Showcase CI also runs the catalog/privacy regression test in `tests/analog-synthesizer.test.mjs`.

Playwright with headless Chromium loaded the direct route at 320, 390, 768, 1024 and 1440 px. Each viewport had no horizontal document overflow; the visible-control accessible-name smoke check found no unnamed controls among 206 checked controls; the page had an `h1`, no page or console errors, and all 43 observed requests were same-origin. Visual inspection was performed at 390 px. These checks do not establish full WCAG conformance or substitute for screen-reader, physical-device, installed-PWA, microphone, and desktop Web MIDI testing; source-reported physical checks remain unverified here.
