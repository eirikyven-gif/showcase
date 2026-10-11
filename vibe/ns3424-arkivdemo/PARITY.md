# NS 3424 archive demo: source parity audit

## Pinned baseline

- Read-only source: `eirikyven-gif/ns3456`, archived commit `5c58678269fb2c24d83af8afedeb65c8878732ff` (tree `142c31e21eb1afe5f10eeee23f3d8cb145209745`).
- Exact app: `app/app-fdvu-ns3424_v0.1.1.html`, blob `fe8376dc96e81eefbda9b1f399a0e6e1c19d4c4b`.
- Other pinned documents read: `README.md`, `docs/SPEC.md`, `docs/ROADMAP.md`, `docs/CONTRIBUTING.md`, `docs/CHANGELOG.md`, `docs/NS3424_endrings-og-risikologg_MASTER.md`, `docs/COPILOT_BRIEF.md`, `docs/COPILOT_AGENT_PROMPT.md`.
- The app file, rather than later plans or an external standard, is the target for user-visible behavior/content parity. All line references below are in the pinned app file.
- Showcase URL remains `/vibe/ns3424-arkivdemo/`.

## Provenance for restored content and behavior

| Restored element | Exact source provenance | Showcase treatment |
| --- | --- | --- |
| Learning-path titles and module groups | `APP_DATA` declares Start, Grunnleggende, Trening and five cases at app lines 482–645; the hierarchy and module completion behavior is implemented by `HierarchyViewer`/module components at 920–1005 and app navigation around 4450–4565. | The 11 titles/groups and session progress are retained. Progress is in memory only. |
| Welcome content | First-run steps and the login handoff are rendered at lines 4828–4950; 30-day suppression uses localStorage at 3901–3980. | Three informational steps are retained as a safe welcome. Login handoff, persistent suppression, and the source’s login/data claims are removed; accurate local-only/privacy text replaces them. This welcome copy is showcase safety copy, not quoted source copy. |
| Start module and goal wording | `APP_DATA.start_intro` at lines 482–515 contains the learning goal, recommended order and one question. | Goal, order and question are retained; the answer response is clearly simulated in memory because normal answer validation is backend-controlled. |
| Purpose, delivery and extent | `APP_DATA.modul_lovverk` at lines 517–559 contains the definition, delivery list, uncertainty guidance, mini-task, quiz question, case-task prompt, keywords, feedback and suggested answer. | Those source strings/activities are represented. The 200-word limit is the source app’s `CASE_MAX_WORDS` at line 2565 and counter/submit UI at 3637–3668. Keyword-based feedback is a local simulation of the source backend evaluator. |
| Analysis levels | Level data is defined around lines 440–450; `HierarchyViewer` at lines 920–1005 lets the user open all levels before completion. | Three source-described levels and the visit-before-complete interaction are retained. |
| TG/TGIU scale and trainer | `TG_SCALE` lines 1580–1588; `TGTrainer` lines 1805–1865. The component asks for a reference level, a TG/TGIU selection, a reason, and requires those entries to complete. | Same visible choices and required inputs; no server evaluation. |
| KG, probability, risk and calculation | `KG_SCALE`/`PROB_SCALE` lines 1590–1604; `riskFrom(kg, prob)` lines 1606–1620; `RiskTrainer` lines 1867–1934. | Same scales, deterministic local score/text and written reason. Results are labeled illustrative. |
| Observation sorting | `ObservationTrainer` starts at line 1936; six example statements and the observation/interpretation choices are in that component. | Six statements, keyboard-operable choices and local feedback. |
| Five case narratives | `CASE_DATA` lines 2041–2077 gives each case title, situation, reference, suggested level and observation count. | Those narratives and counts are represented; each is visibly marked synthetic (`SYN-01`–`SYN-05`). Identifying/report-specific details are excluded. |
| Case worksheet fields and completion | `CaseWorksheet` state and `done` predicate at lines 2079–2099; visible fields at 2101–2215; completion button and manual-copy note at 2217–2230. Required: level, required observations, TG and reason, KG and reason, probability and risk reason, and three action horizons. Further investigations are shown as optional. | The same fields and completion rule are implemented in memory. The optional further-investigation field is retained. No file upload or report creation is added. |
| Quiz bank and answer explanations | `QUIZ_BANK` lines 1650–1788 contains ten questions, choices, correct indices and feedback explanations. The bank is marked DevMode and normal module validation elsewhere uses backend `questionId` handling (e.g. lines 2723 and 3093–3095). | The ten source questions/explanations are included as a local demonstration quiz. The hidden/dev-only source presentation and backend validation are not reproduced; local scoring/feedback is labeled simulated. |
| Manual report handoff | At line 2229 the source says the user may manually copy text into a report. The pinned app file contains no print/PDF/export/download/report-generation action (`window.print`, clipboard API or export controls were not found). | The manual-copy note is retained. No report/export workflow was claimed or added. Generic print CSS is not an app report feature. |
| Feedback surface | Feedback button/dialog is in source lines 138–145; queue, backend submission and retries are at 367–400 and handlers at 5451–5508. | Dialog remains as a local simulation only; it sends/stores nothing and clears on close. This is a security adaptation, not source-equivalent delivery. |

## Concrete source mismatch found and corrected

The earlier PR version treated requirements in `docs/NS3424_endrings-og-risikologg_MASTER.md` as if they were implemented in the pinned app UI. That document’s lines 68–76 lists documentation type, analysis-level rationale, priority, student comment, level 2 evidence checks and level 3 verification/uncertainty rules. The exact pinned app UI does not render or require those items: compare its `CaseWorksheet` state/validation at lines 2079–2099 and fields at 2101–2230. Those extra controls and gates have been removed from the showcase route. The master log remains provenance for a separate plan, not evidence of app behavior.

The route still does not byte-for-byte reproduce the source app’s hosted authentication/backend behavior. Those integrations are intentionally removed under the project’s privacy/safety rules; local quiz and feedback outcomes are labeled simulations.

## What the unresolved factual check means

“Factual correctness against the current NS standard remains unverified” is a provenance/scope limit: this audit did not compare the pinned app’s instructional claims to an external/current copy of NS 3424. It does **not** record a specific factual disagreement, and it is not a new claim that the restored source text is wrong. Source parity is assessed against the exact archived app file above. The README/master log says v0.1.1 was open/no-auth/no-backend, while the pinned HTML actually contains login/dev surfaces, local identifiers/storage, feedback queue and backend integrations; that is a concrete documentation-to-file conflict, handled by following the pinned app’s visible behavior while removing integrations.

## Privacy and network boundary

- All answers and progress stay in page memory. Refresh/close discards them; reset clears interactive state.
- No fetch, XHR, beacon, WebSocket, cookies, local/session storage, IndexedDB, authentication, backend URLs, external runtime assets, PII, secrets or private report data are in the showcase route.
- All five case stories are marked synthetic. Source report names and private/report references are omitted.
- No built-in print, report generation, PDF/export or download function was found in the pinned app file.

## QA and release state

- Static regression coverage: `tests/ns3424-arkivdemo.test.mjs`.
- Browser QA was rerun in Chromium at 1440px and 390px after the case correction: all five source-shaped case workflows completed; no horizontal overflow, page errors or external requests.
- No public deployment check: this PR remains draft and is not merged or deployed.
- Release queue: PR #94 v0.60.6, PR #100 v0.60.7, then new WP Varelager route PR #90 v0.61.0. `VERSION` is set to v0.60.7 as a patch from the rebased main baseline v0.60.6.
