# Vurderingspraksis

Source-faithful, local-only showcase copy of `eirikyven-gif/apps-fagskolen/apps/vurderingspraksis` at commit `92379f1108ec71013a06c4e5976a6fe79de81a3e`.

The route retains the source's four work areas, phase guidance, nine-topic flowchart, learning paths and accordion material, glossary, day plan, responsive shortcut menu, modal navigation, keyboard handling, and light/dark appearance. Source participant findings are replaced with invented examples. Institution and workshop date identifiers are removed. Source Drive files, presentations, public references, videos/embeds and all external URLs/calls are not included; unavailable resources are clearly labeled. No source response capture, login, server, private API, or data storage exists.

The page stores only the selected appearance and which day flowcharts have been shown, in two route-specific `localStorage` keys. This is disclosed on the page. **Nullstill lokale valg** removes both keys and reloads the page. Do not enter or store real participant/student information; there are no input fields.

## Privacy and safety

- All displayed participant-style examples are synthetic.
- No external network calls, external resources, login, server, cookies, or response collection.
- Local storage is limited to display preference and flowchart-first-show state, with an on-page reset control.
- This is a demonstration, not official institutional guidance or a grading rubric.
- The source carries institution-specific content and external materials; those materials and source URLs are omitted. Rights for broader redistribution of the source content have not been independently established.

## QA

Run from repository root:

```sh
node --test tests/vurderingspraksis.test.mjs tests/vibe-static.test.mjs
node --check vibe/vurderingspraksis/app.js
node --check vibe/vurderingspraksis/content.js
node --check vibe/vurderingspraksis/appearance.js
```

Validation completed: `node --test tests/*.test.mjs` (87 passed), three `node --check` commands, catalog JSON parse, `git diff --check`, deployment workflow catalog/local-asset validation, and local HTTP 200 checks for the route and its JS/CSS/font assets. Chromium is unavailable in this environment, so visual, interactive browser, assistive-technology, physical-device and external deployment checks remain outstanding. No deployment has occurred.
