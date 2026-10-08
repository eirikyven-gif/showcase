# Workshop-timer

## Første vurdering

- **Bruksområde:** Planlegge og følge en rekkefølge med navngitte tidssegmenter, for eksempel i en workshop.
- **Kategori:** Tid og undervisning.
- **Målgruppe:** Kursholdere, undervisere og møteledere.
- **Kildestatus:** Aktiv, selvstendig HTML-app; kildeutgaven er 1.3.2 og publiseres separat. Kilden beskriver lokal `localStorage` for kø og tema, uten backend, innlogging eller eksterne nettverkskall.
- **Foreslått slug:** `workshop-timer`.
- **Demoverdi:** Viser tydelig hvordan en aktiv timer går videre gjennom en agenda, og kan prøves direkte i nettleseren.
- **Forenklinger:** Syntetisk eksempelplan; varighet i minutter i stedet for sluttider på dagen; ingen redigering/flytting/sletting av eksisterende segmenter; ingen temaendring eller fullskjerm.
- **Personvernrisiko:** Lav i denne statiske kopien. Ingen personopplysninger, autentisering, eksterne tjenester, nettverkskall eller lagring. Segmentnavn er kun i minnet og kan være hva brukeren skriver, så siden opplyser at data forsvinner ved reload.
- **Omfang:** Én isolert route på `/vibe/workshop-timer/`, katalogoppføring og denne vurderingen. Første brede vurderingsrunde; kandidaten beholdes uten kuratering.

## Atferd og QA

Kilden viser klokke, aktivt og neste segment, nedtelling, køredigering, rekkefølgekontroller, tema og fullskjerm. Køen avanserer automatisk når lokal klokketid når segmentets sluttid. Demoen beholder kjerneideen med eksempelagenda, start/pause, automatisk overgang, tilbakestilling og tillegg av nye segmenter. Den bruker `setInterval` bare mens fanen er aktiv, og har ingen submit-skjema.

Kontroller: `node --test tests/vibe-static.test.mjs`; `node --check vibe/workshop-timer/app.js`; `git diff --check`; Chromium for direkte route/refresh, start/pause, segmentovergang, reset, ugyldig/gyldig tillegg, tastaturfokus, mobilbredde og fravær av nettverkskall. PR-en delvis løser Issue #2. Ikke publisert; offentlig rutekontroll følger deploy.
