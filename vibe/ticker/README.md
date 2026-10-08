# Ticker — første vurdering og demo

- **Navn / bruksområde:** Ticker; vis en kort, rullende tekst med valgfri hastighet og pause/fortsett.
- **Kategori / målgruppe:** Verktøy og kommunikasjon; alle som vil vise en kort melding.
- **Kildestatus:** Den inspiserte kilden oppgir v1.2.0 og komplett grunnfunksjonalitet. Den viser tekstfelt, hastighetskontroll, pauseknapp og støtte for redusert bevegelse.
- **Foreslått slug:** `ticker` (`/vibe/ticker/`).
- **Demoens verdi:** Umiddelbar, visuell forhåndsvisning av tekst, fart og pause.
- **Forenklinger:** Frittstående HTML/CSS/JS uten felles kildebibliotek, portalnavigasjon eller kildeversjonsvisning. Bare original syntetisk eksempeltekst.
- **Risiko:** Bevegelse kan være ubehagelig; `prefers-reduced-motion` viser derfor statisk tekst. Brukerens tekst finnes bare i fanens minne. Ingen personlig informasjon kreves.
- **Omfang:** Én statisk rute med tekstfelt, hastighetsvalg, pause/fortsett og retur til hub. Ingen autentisering, nettverkskall, nettleserlagring eller tredjepartsressurser.

## QA og publisering

- Rute: `/vibe/ticker/`; hub: `/vibe/`.
- Automatisert test: `node --test tests/vibe-static.test.mjs` (8 tester bestått); `node --check vibe/ticker/app.js` og `git diff --check` bestått.
- Chromium QA: direkte rute, tekst/hastighet/pause, etiketter, mobilbredde uten horisontal overflow, redusert bevegelse, retur til hub og ingen eksterne kall bestått. Tastaturkontroller ble aktivert med knapper/skyvefelt; synlig fokus følger hubens felles stil.
- Personvern: ingen skjema innsending, innlogging, serverlagring, persistering eller API-kall. Tekst endres kun i DOM.
- Deploy: følger eksisterende showcase one.com-workflow etter merge til `main`; ruten er ikke publisert ennå.
