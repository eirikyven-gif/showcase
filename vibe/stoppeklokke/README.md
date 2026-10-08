# Stoppeklokke

**Route:** [`/vibe/stoppeklokke/`](/vibe/stoppeklokke/)
**Review status:** Retained in the broad first round; this is an independent static concept demo, not a curation or source-code port.

## Candidate assessment

- **Name:** Stoppeklokke
- **Use case:** Measure elapsed time, pause and resume, and record cumulative and split lap times in a browser.
- **Category:** Tid
- **Audience:** People timing a workout, practice session, short activity, or informal lap sequence.
- **Source:** `eirikyven-gif/diverse-apper`, `apps/stoppeklokke/`; publicly readable `main` checked 2026-10-08 at commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`.
- **Source version and stack:** Source README identifies Stoppeklokke v1.2.0. The app is plain HTML and JavaScript, with shared `apps/_shared/ui.css` and `apps/_shared/ui.js`; its README documents no framework or build step.
- **Source tests:** No automated tests found in the app directory. The source README lists manual checks for start/pause/resume, reset, and laps; these are source-documented test points, not independently verified source QA.
- **API and authentication:** No app API, network request, or authentication appears in the reviewed app files.
- **Storage and privacy:** The reviewed app uses in-memory elapsed-time and lap state. No browser or server persistence is present in its HTML/JS; timings are not personal data by themselves, but may reveal activity if retained or shared. The showcase demo keeps timing state in the open tab and sends nothing.
- **Rights uncertainty:** No license or reuse grant was identified in the app README or the reviewed source files. This route uses independently written presentation, markup, styles, and behavior and does not copy source assets or code. Rights to reuse source materials remain unverified.

## Demo assessment

- **Demo value:** Makes a familiar timing interaction immediately testable and demonstrates a useful elapsed-time and split-time view without setup.
- **Simplifications:** One stopwatch, millisecond-derived hundredths, and an in-memory lap list. No saved sessions, named laps, race coordination, or export.
- **Risk:** Low for this synthetic local demo. Users could mistake browser timing for certified or competition-grade measurement; the demo is for informal use and does not claim official accuracy.
- **Scope:** Original static HTML/CSS/JavaScript isolated to this route. Keyboard-operable native buttons and responsive layout. No authentication, server, API, external calls, browser storage, PII, secrets, or source-repository edits.

## QA

- Catalog has exactly one `stoppeklokke` entry, linked to this direct route; the slug does not collide with another route.
- Automated route and catalog checks are in `tests/vibe-static.test.mjs`.
- Run `node --test tests/vibe-static.test.mjs` from the repository root.
- Chromium 151 / Playwright 1.62.1 QA from the repo root: direct route returned 200 at 320, 390, 768, and 1440 px with no horizontal overflow. The first Tab focused the skip link with a visible focus outline. Start, pause, resume, lap recording, reset, and reload clearing the in-memory session worked; the hub-return link reached `/vibe/`. Network capture showed only same-origin requests, with no external calls or JavaScript errors. Deployment and live-host QA have not been performed.

## Issue #2 progress

This route is one small, independently reviewable contribution toward Issue #2's broad first-round candidate showcase. It retains the candidate and documents provenance, uncertainty, privacy boundaries, and a runnable demo. It does not claim that the broader candidate inventory or Issue #2 is complete.
