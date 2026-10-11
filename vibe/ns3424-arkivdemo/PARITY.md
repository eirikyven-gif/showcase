# NS 3424 archive demo: source parity audit

## Baseline

- Read-only source: `eirikyven-gif/ns3456`, archived commit `5c58678269fb2c24d83af8afedeb65c8878732ff`.
- Source tree: `142c31e21eb1afe5f10eeee23f3d8cb145209745`.
- Exact app file: `app/app-fdvu-ns3424_v0.1.1.html`, blob `fe8376dc96e81eefbda9b1f399a0e6e1c19d4c4b`.
- Requirements/docs read at the same source commit: `README.md`, `docs/SPEC.md`, `docs/ROADMAP.md`, `docs/CONTRIBUTING.md`, `docs/CHANGELOG.md`.
- Additional scope notes read: `docs/NS3424_endrings-og-risikologg_MASTER.md`, `docs/COPILOT_BRIEF.md`, `docs/COPILOT_AGENT_PROMPT.md`.
- Showcase URL remains `/vibe/ns3424-arkivdemo/`.

## Independent audit findings and corrections

| Source-visible screen/workflow | Source behavior | Showcase correction | Safety treatment |
| --- | --- | --- | --- |
| Learning overview | 11 modules, grouped by Start, Grunnleggende, Trening and five cases; completion count | Overview with all 11 exact module titles, groups and session-only completion | No account or persisted progress |
| First-run introduction | Three informational steps, then login/guest handoff and a 30-day persistence option | Three-step welcome with learning goal, module guidance and accurate no-network/no-storage/privacy description | Login/guest choice and persistent preference removed |
| Start module | Demo purpose, learning tips, one knowledge question | Same learning goals, guidance and question, with local feedback | No student identifiers or backend answer check |
| Purpose/extent module | Delivery content, uncertainty guidance, mini-task and one question | Text, free-response mini-task, knowledge question, separate 200-word case task, local evaluator/feedback, suggested answer and skip-quiz control | Answers stay in the page; no reporting endpoint |
| Analysis levels | Interactive 1–3 hierarchy; visit all levels before completion | Selectable level cards, details/example, visited count and completion gate | Static source-derived descriptions; no API |
| TG trainer | Reference level, TG0–TG3/TGIU choice, written reason and completion gate | Same controls, source scale descriptions and local completion validation | No account, storage or server evaluation |
| Risk trainer | KG1–KG3, probability low/medium/high, score/text and written reason | Same selections, local deterministic score and reason field | Explicitly illustrative risk only |
| Observation trainer | Six statements sorted as observation/interpretation, immediate feedback | Same six statements, keyboard-operable buttons and local feedback | Example sentences only; no personal/build records |
| Five cases/report schema | Distinct title, situation, reference, suggested analysis level; common report fields include analysis-level reason, documentation type, observations, TG/KG/risk reasons, actions, further investigations, priority and student comment. Level 2 adds documentation/further-investigation/underlay checks; level 3 requires verification and uncertainty marking. | Five separate module cards and per-case worksheet with every listed field; level-dependent requirements; live local risk class and completion feedback | Each scenario labelled synthetic SYN-01–SYN-05; no file upload, source report/private case data or personal data |
| Module completion | Completion message and return to overview | Completion view and session-only overview count | Reset clears all progress |
| Printable/report flow | Source case screen says text can be copied manually into a report. No built-in print, report generation, PDF/export or download function found. | No report/export action or generated summary added; case answers remain visible in their worksheet while the module is open | Browser print stylesheet is generic presentation support only; no report data is transmitted |
| Video, timeline, feedback, auth and developer overlay | Template-level video placeholder, generic placeholder timeline, feedback submission, account login and developer PIN surfaces | Generic media/timeline placeholders are excluded and documented as not NS-specific; About and feedback surfaces are retained with safe local content and no-contact/no-send behavior; auth/developer surfaces omitted | Author/contact data, auth, PINs, user/client/session IDs, localStorage, feedback queue, KI/API and Apps Script endpoint excluded |

## Privacy and network checks

- All form fields and completion state are in page memory only. Refresh/close discards the session state; reset clears all demo state.
- No `fetch`, XHR, beacon, WebSocket, cookies, local/session storage, IndexedDB, external scripts/styles, authentication controls or backend URLs. Feedback submission is a visible local-only simulation that clears on close.
- Source example-report names and private/report references are not shown in the public demo. No PII, secrets or source backend data are copied.
- Source docs (README/master log) describe v0.1.1 as open/no-auth/no-backend, while the pinned HTML contains login/dev, local identifiers, feedback queue and backend code. For safety the actual pinned HTML was audited, while all those integrations were omitted.
- The quiz correct answers and explanatory feedback are local demonstration data because the source's normal quiz validation is backend-controlled.

## QA

- Static regression coverage: `tests/ns3424-arkivdemo.test.mjs`.
- Browser QA: Chromium at 1440px and 390px. Direct route load/refresh; safe welcome steps; About and feedback dialog; feedback no-send behavior; 11 modules; start quiz feedback; 200-word case task/evaluator/suggestion; hierarchy visit gate; TG, risk and observation trainers; all five case screens; common report fields; level 2 checklist/further-investigation gate; level 3 verification/uncertainty gates; source quiz answers/explanations; no horizontal overflow, JavaScript errors or external requests.
- Public deployment checks: not applicable; this correction PR is not merged or deployed.

## Remaining limits

This is a behavior/content parity implementation for the source-visible NS learning flows, with security-sensitive template features removed. The source's generic placeholder video/timeline and login/developer features are intentionally not recreated; the login-dependent first-run content is replaced with accurate safe guidance, while feedback is simulated locally. The source case worksheet only mentions manual copying; it has no built-in print/report/export flow, and the showcase does not add one. Factual correctness against the current NS standard and public reuse rights remain unverified.
