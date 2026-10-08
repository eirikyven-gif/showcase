# Analog Synthesizer · første vurdering og demo

## Katalogmetadata

- **Navn:** Analog Synthesizer
- **Bruksområde:** Spill syntetiske toner og utforsk enkle lydparametere i nettleseren.
- **Kategori:** Musikk
- **Målgruppe:** Musikere, lydinteresserte og nybegynnere innen synthesizere.
- **Status:** Kandidat beholdt i bred førstegangsvurdering; statisk demo foreslått og implementert. Ingen kuratering eller utsiling er gjort.
- **Foreslått slug/rute:** `analog-synthesizer` · `/vibe/analog-synthesizer/`
- **Demoens verdi:** Hør sammenhengen mellom tonehøyde, filter, volum og ulike klanger uten oppsett eller konto.
- **Omfang:** Én responsiv side med tre klangvalg, tre skyvekontroller, ett oktavområde og mus/touch- eller tastaturspilling. Web Audio opprettes først etter eksplisitt «Start lyd».
- **Nødvendige forenklinger:** Demoen er avgrenset til én oktav, noen forhåndsvalgte klanger og grunnleggende lydkontroller. Innstillinger finnes bare mens siden er åpen.
- **Personvernrisiko:** Lav for denne demoen. Lyd genereres lokalt etter brukerens valg; ingen personopplysninger tastes inn eller sendes.

## Sikkerhets- og personvernkontroller

- Ingen innlogging, server/API, lagring eller eksterne forespørsler.
- Ingen tillatelsesdialoger eller importert innhold.
- Ingen nettleserlagring.
- AudioContext opprettes kun etter eksplisitt klikk på «Start lyd»; «Stopp lyd» suspenderer motoren.
- Bare forhåndsdefinerte toner og numeriske kontroller.

## Test og QA

- Bestått: `node --test tests/vibe-static.test.mjs` (9/9), `node --check vibe/analog-synthesizer/app.js`, `git diff --check`.
- Isolert JavaScript-interaksjonsharness bestod for lydstart etter klikk, preset, peker- og tastaturtoner samt stopp.
- Chromium headless startet ikke ferdig i containeren; visuell QA, faktisk mobilvisning og nettverksfanekontroll gjenstår.
- Etter publisering skal direkterute, refresh, hub-retur og nettverksaktivitet kontrolleres på den offentlige siden.
- Issue #2 omtales som delvis løst; PR-en er isolert for denne demoen.
