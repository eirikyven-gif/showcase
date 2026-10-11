# Parity audit: WP Læringssti

Audit date: 2026-10-11
Showcase route: `/vibe/wp-l-ringssti/`
Verified source: `eirikyven-gif/WP-l-ringssti`, commit `b358faabd862355ae7e666a9953d8a708b983786`, archive `wp-learningsti-mvp_v0.5.6.zip` (SHA-256 `bd0411bb9087440a211969bc0d358dae87725bf98fb546dd224fa26f85327d16`). The source repository and archive were read-only. `diverse-apper/apps/larebot` is a separate application and is not this route's source.

## Source surfaces and workflow map

| Source surface | Source task/content and choices | Showcase implementation | Result |
|---|---|---|---|
| Frontend overview | Lists configured modules with title/subtitle, lock state and completed check; locked modules cannot be opened | Synthetic two-module overview, matching lock and completion states | Preserved |
| Player | Open module, one content element at a time, previous/next, position indicator, return to overview, finish module | Same controls; completion now returns to overview and records checkmark | Corrected |
| Locked module | Displays locked message; no unlock transition is implemented by v0.5.6 | Synthetic second module remains locked; explanation now describes configured lock rather than implying completion unlocks it | Corrected |
| Player persistence | `localStorage` stores per-path completed modules and last module/step; quiz attempts and case draft are stored separately | One route-specific local demo key stores synthetic player/editor state; reset removes it | Preserved with one reset control |
| Quiz | Radio or checkbox choices; server checks answer; correct locks answer, persists attempt and enables next; wrong answer permits retry; optional feedback and Dypdykk modal stub | Local answer check with synthetic answer key; correct enables next, wrong permits retry, Dypdykk is explanatory only | Safety-simulated; no scoring/security value |
| Case | Markdown prompt, deliverables, draft textarea, explicit local save/delete and KI-sensor modal stub | Synthetic prompt and deliverables; unsaved draft stays in memory until explicit save/delete; saved draft uses resettable browser localStorage; KI-sensor is explanatory only | Preserved without transmitting text |
| Editor: modules/elements | Create/delete/reorder modules and elements; edit fields; per-module and per-element open/close; open/close all; element types factBox, accordion, hierarchy, timeline, richText, quiz, case | All listed types and CRUD/reorder are represented; collapse controls and open/close all added | Corrected |
| Editor: save/validation | Explicit save button; warnings for missing/invalid IDs, required content, quiz choices, case, timeline tags and labels; save remains possible with warnings | Explicit “Lagre lokalt”; corresponding local validation warnings are shown; no network or server persistence | Safety-simulated |
| Global timeline | Add/edit/delete events and tags; configure timeline elements to show all or filter by tags | Synthetic global events with CRUD and all/filter configuration | Preserved |
| Path media | List linked WordPress attachments; refresh list, attach/select media, tag attachments to path | Synthetic illustration cards with local inclusion toggles; no file picker, attachment IDs, uploads or private media | Intentionally simplified |
| Editor UI state | Per-path module/element collapsed state in localStorage | Collapse state stored in the same resettable synthetic demo state | Preserved |

## Content and source uncertainty

The v0.5.6 archive contains plugin implementation and `README.txt`, but no course configuration, source course text, media files or tests. Therefore the parcell/garden lesson, quiz wording, feedback, case, timeline and illustrations in Showcase are original synthetic examples; they are not represented as original course content. The archive README says quiz/case are absent while the PHP/JS runtime implements quiz/case and KI stubs. The implementation is the behavior reference; the documentary conflict remains recorded in the catalog.

The plugin archive has no test suite or test command. The repository root at the pinned commit contains the archive and an import/master log. Source behavior was inspected in `assets/admin-editor.js`, `assets/block-frontend.js`, and `wp-learningsti-mvp.php`; source tests were not run because none are included.

## Privacy and safety boundary

WordPress roles/nonces, admin AJAX, server-side configuration and quiz checking, attachment library operations, and external KI services are omitted. Showcase has no auth, API, cookies, remote requests or server storage. Only synthetic lesson content, local editor changes, quiz progress and synthetic case draft are stored in `localStorage`; “Nullstill demo” removes the route's key. The answer key is client-visible, so the quiz is illustrative and cannot be used for real assessment. No source private data, secrets, real identities or source media are included.

## QA status

Automated source-feature and provenance assertions pass with `node --test tests/wp-l-ringssti.test.mjs` (6/6). Chromium QA passes with `node --test qa/wp-l-ringssti-parity.mjs` (2/2), including quiz retry/gating, progression and completion, local draft persistence, keyboard focus and Enter activation, editor collapse/save/validation, boolean checkbox storage, reset, no off-origin requests, and no page errors. At 390 px and 1440 px, document width equals viewport width. Screen reader testing and physical-device checks remain unverified. Do not mark parity complete if any source workflow listed above is missing.
