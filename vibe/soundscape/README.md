# Soundscape · statisk Vibe-kopi

**Issue #2:** Delvis løst. Dette er en statisk, lokalt fungerende kopi av Soundscape på `/vibe/soundscape/`, ikke kildeappens produksjonsruntime.

## Kilde og krav

- **Kilde:** `eirikyven-gif/diverse-apper/apps/soundscape`, kildecommit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`, appversjon 0.8.0.
- **Lest:** appens README, offentlige visnings-HTML, adminflate, standard-runtime-fixture, modell- og testkontrakter, samt styringsdokumentet og låst SSoT v0.1 med presiseringer i Notion. Kilderepoet ble bare lest.
- **Kravgrunnlag:** Den offentlige flaten viser forståelige vær-/luft-/solsignaler og genererer et kontinuerlig lydbilde fra Web Audio. Adminarbeidsflaten grupperer datakilder, simulering/signaler, parameterkoblinger og kontroll/historikk. Kilden definerer 45 signaler i ni faggrupper og 43 lydmål.
- **Kildens dokumenterte stack:** HTML, CSS, JavaScript-moduler, Web Audio/AudioWorklet, service worker/PWA og PHP API. Kildens pakken definerer `npm run check` og `npm test`; ni testfiler er oppført. Kildens testpakke ble ikke kjørt her, siden kilderepoet ikke ble endret eller hentet inn lokalt.

## Funksjoner i kopien

- Offentlig lytteside med værscene, syntetiske måleverdier, scenarier, påvirkningsoversikt, tilgjengelig datatabell, start/stopp/demp og volumkontroll.
- Web Audio lager lokal, kontinuerlig synth-/noise-lyd. Temperatur påvirker tonehøyde, skydekke filter, nedbør/noise og vind LFO/stereoplassering. Lydmotoren er en forenklet syntese av kildeappens generative motor.
- Simuleringsvalg for normalvær, regnbyge, vindkast, kald natt, soloppgang og midnattssol. Endringer oppdaterer scene, verdier og lydpreview.
- Parameterlab med de fire kildeområdene, alle ni signalgrupper, 45 signaloppføringer, 43 lydmål og representativ Mapping-katalog. Numeriske kontroller, enumvalg, på/av-kontroller og hjelp er lokale.
- Kontrollflate viser syntetisk bruker/rolle og simulert kildestatus. «Hent kilder», «Koble fra», revisjon og autosave gir lokal demorespons; ingen kilde, bruker eller rolle godkjennes reelt.
- Scenariohistorikken er merket syntetisk og genereres i nettleseren. Den er ikke kildens live- eller målte 24-timershistorikk.

## Data, lokal lagring og sikkerhetsgrenser

- Alle verdier, tidsstempler, steder, roller, kilde-/tilkoblingsstatuser og historikk er syntetiske fixtures. CO₂ og AQI er separate felt.
- Ingen `fetch`, XHR, WebSocket, EventSource, API-/PHP-endepunkt, OAuth, konto, reell innlogging, cookie eller serverlagring. Demoen inneholder ingen service worker eller PWA-cache.
- Kildeappens aktive profil-/simulatorkontroller autosaves til `localStorage` under én nøkkel (`vibe.soundscape.demo.v1`). Bare syntetiske signalverdier, parametervalg og scenariotekst lagres lokalt på denne enheten; de sendes ikke til server.
- **Full nullstilling** fjerner denne nøkkelen og gjenoppretter syntetisk standardprofil, parametere og historikk. Nettleserens vanlige lagringsinnstillinger kan også slette nettsteddata.
- Lyd opprettes først etter en eksplisitt Start-handling, går gjennom en dynamisk nivåbegrensning og er kun lokal. «Stopp» suspenderer lydkonteksten.
- Kildeens ekte Netatmo OAuth, MET/NILU-data, koordinater, adminautentisering, roller/rettigheter, delte profiler, serverrevisjoner, live klientoppdatering, secrets og serverhistorikk er fjernet eller lokalt simulert. Ingen kildens private data eller hemmeligheter følger med.

## Usikkerhet og avgrensning

- Styringsdokumentet og SSoT er versjonert og siste Notion-redigering som ble lest er 2026-07-25; faktisk produksjonsstatus etter den datoen er ikke kontrollert.
- Kilden beskriver privat admin, Netatmo OAuth, serverautoritative revisjoner, MET/NILU og PWA. Disse produksjonsfunksjonene kan ikke utføres trygt i en offentlig statisk kopi og er derfor simulert.
- Demoens lydmodell følger signal→parameter-prinsippet, men er ikke bit-/klangidentisk DSP-port av kildeappens `audio-engine.js`. Ingen kildekode, API-respons, profil-ID, bruker eller hemmelighet er kopiert.
- Gjenbruksrettigheter til kildeappens kode, utforming og tekst er ikke dokumentert i de gjennomgåtte appfilene. Showcase-implementasjonen er selvstendig.

## Kjør og QA

Ruten er statiske filer uten byggsteg. Fra repo-roten kan den åpnes på `/vibe/soundscape/` under en HTTP-server. Direkterute/refresh er støttet. Nødvendige fonter, ikoner, stilark og skript er lokale showcase-ressurser.

Fokuserte tester finnes i `tests/soundscape.test.mjs`. Repoets CI kjører alle tester med:

```sh
node --test tests/*.test.mjs
```

Build: ikke aktuelt, ingen byggeverktøykjede. Lint: ingen felles linter konfigurert; JavaScript kontrolleres med `node --check`. Manuell nettleser-/skjermleser-QA-status føres i PR-beskrivelsen.
