# Lærebot

Local showcase simulator for the learner and content-admin surfaces of Lærebot. The canonical route is /vibe/larebot/.

## Source and scope

- Source: eirikyven-gif/diverse-apper/apps/larebot, inspected at exact main commit 0900ffe48fa92dcefae1c6d0bbee8e0d02eec530.
- Source files reviewed: README.md, index.html, assets/larebot.js, assets/larebot.css, admin/index.html, assets/admin.js, the API directory listing and app test listing. The source repository was read only.
- Source app uses PIN/admin-password authentication, PHP APIs, server-side private JSON storage, and optional OpenAI/Gemini API keys.
- This page preserves its role switch, subject/topic selection, free-text question flow, conversation replies with source references, and local content/bot configuration surface. Its seed topic and resource are synthetic water-cycle teaching material.

## Safety boundaries

- There is no login, PIN, account creation, student roster, real role enforcement, PHP, server persistence, network request, model invocation, or external service.
- User and PIN management were removed because they would collect identity data and imply authentication. Subject/topic are fixed to the single synthetic example.
- Questions and replies exist only in page memory and are never transmitted or persisted. The page warns visitors not to enter identifying information.
- The editor's synthetic resource, bot label, and provider/model display values persist in localStorage under vibe.larebot.demo.v1, because the source admin surface edits persistent content. Provider labels are display-only and make no API call. A visible reset button removes this one key.
- The existing three water-cycle example questions and their prewritten answers remain available as starter prompts. The source's private curriculum, user records, secrets, API code, and runtime data were not copied.
- The original source UI/content/design license or reuse permission was not found; rights remain unverified. The water-cycle lesson and sample responses in this showcase are original synthetic copy.

## Checks

Run the app-specific static contract check with node --test tests/larebot.test.mjs; CI runs the complete suite with node --test tests/*.test.mjs.

Manual QA: select Elevvisning, choose Naturfag → Vannets kretsløp, submit a typed and a starter question, check the local response and source label; switch to Adminvisning, edit and save the synthetic resource, return to the learner view, then reset and verify defaults return. Check keyboard focus and a narrow viewport.

## Risks and rollout

This is an educational UI demonstration for general audiences, not verified teaching content or an assessment tool. Visitors could still type personal data despite the notice; text stays on the device and is discarded when the page closes. Browser storage may be unavailable or cleared by browser settings. No merge or deployment is part of this PR.
