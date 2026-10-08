# Ticker — kilde vurdert, eksisterende demo beholdt

- **Formål:** Vise en kort, rullende tekst med justerbar hastighet og pause/fortsett.
- **Kategori:** Kommunikasjon og små verktøy.
- **Målgruppe:** Alle som vil vise en kort melding eller utforske enkel tickerbevegelse.
- **Kilde og versjon:** `eirikyven-gif/diverse-apper`, `apps/ticker`; kildens README oppgir v1.2.0. Kilden ble lest 2026-10-08 på `main`, commit `0900ffe48fa92dcefae1e6c0d6bbee8e0d02eec530`. Kilden ble ikke endret.
- **Kildestakk:** HTML med innebygd CSS, JavaScript og felles CSS/JS fra `apps/_shared/`. Demoens stack er selvstendig HTML, CSS og JavaScript med eksisterende Vibe hub-stilark.
- **Kildetester:** README oppgir manuelle testpunkter for tekst, hastighet, pause/fortsett og redusert bevegelse. Ingen automatiserte tester er dokumentert i appens README. Testkjøring og utrulling er ikke uavhengig verifisert.
- **API og autentisering:** De inspiserte appfilene har ingen API-/serverkall eller autentisering. De laster felles CSS/JS relativt fra kildeappen. Den statiske demoen bruker ingen eksterne ressurser eller nettverkskall.
- **Lagring og personvern:** Koden oppdaterer tekst i DOM og CSS; ingen browser- eller serverlagring, innsending eller personlig informasjon er synlig i de inspiserte appfilene. Kildeinventaret er begrenset til appens README, `index.html` og `app.js`; dette er ikke en full gjennomgang av hele produktet eller produksjonsmiljøet.
- **Rettigheter:** Rettigheter og lisens for kildekode og eventuelt delt innhold er ikke verifisert. Demoen gjenbruker ikke kildekode, designfiler eller kildetekst; den bruker egen utforming og syntetisk eksempeltekst.
- **Status i gjennomgangen:** Beholdt i bred førstegangsrunde. Dette er en kandidatvurdering, ikke en endelig kuratering eller godkjenning av kildeproduktet.
- **Rute:** `/vibe/ticker/` (slug `ticker`). Denne ruten fantes allerede i `main`; arbeidet oppdaterer vurderingsdokumentasjon og testdekning, og lager ikke en ny rute.
- **Demoens verdi:** Gir en umiddelbar, visuell måte å prøve tekst, fart og pause på uten å sette opp en ticker eller koble til kildeappen.
- **Forenklinger:** Originalt, responsivt grensesnitt med syntetisk eksempeltekst, kort tekstfelt, hastighetskontroll og pauseknapp. Ingen kildekode, kildeinnhold, portalintegrasjon eller kildeversjonsvisning.
- **Risiko:** Rullende tekst kan være ubehagelig eller vanskelig å lese. Demoen respekterer `prefers-reduced-motion` ved å vise teksten statisk og lesbart. Brukerens tekst finnes kun midlertidig i fanen.
- **Omfang:** Tastaturbetjent tekstfelt, skyvefelt og pauseknapp med synlig fokus, responsiv layout og retur til hub. Ingen autentisering, PII, hemmeligheter, eksterne API-er, server, browserlagring, persistens eller eksterne kall.

## Validering

- `node --test tests/*.test.mjs` (23/23), `node --check vibe/ticker/app.js` og `git diff --check` bestod.
- Chromium/Playwright ved 320, 390, 768 og 1440 px: direkte rute og hubretur virket uten overflow; tekst og hastighet endret forhåndsvisningen, pauseknappen og `aria-pressed` oppdaterte status, og redusert bevegelse stoppet animasjonen. Tastaturfokus var synlig. Enter i tekstfeltet ble stoppet lokalt; URL-en forble uendret, og etter omlasting kom eksempelteksten tilbake. Ingen eksterne forespørsler eller sidefeil.
- Ruten er ikke publisert av denne endringen.
