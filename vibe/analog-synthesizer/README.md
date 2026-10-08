# Analog Synthesizer · første vurdering og demo

## Katalogmetadata

- **Navn:** Analog Synthesizer
- **Bruksområde:** Spill syntetiske toner og utforsk enkle lydparametere i nettleseren.
- **Kategori:** Musikk
- **Målgruppe:** Musikere, lydinteresserte og nybegynnere innen synthesizere.
- **Status:** Kandidat beholdt i bred førstegangsvurdering; statisk demo foreslått og implementert. Ingen kuratering eller utsiling er gjort.
- **Foreslått slug/rute:** `analog-synthesizer` · `/vibe/analog-synthesizer/`
- **Demoens verdi:** Besøkende kan høre sammenhengen mellom tonehøyde, filter, volum og ulike oscillator-klanger uten oppsett eller konto.
- **Omfang:** Én responsiv side med tre klangvalg, tre skyvekontroller, ett oktavområde, mus/touch-knapper og A–J-lignende hjemmerad-tastatur. Web Audio opprettes først etter eksplisitt «Start lyd».
- **Nødvendige forenklinger:** Den opprinnelige appens modulrack, sequencer, MIDI, samplebibliotek, filimport, opptak, deling, prosjekt-ID/PIN, konto/serverfunksjoner, installasjon og offline-cache er utelatt. Kun oscillator, filter og gain brukes; innstillinger finnes bare i sidens minne.
- **Personvernrisiko:** Lyd genereres lokalt; appen ber ikke om mikrofon- eller MIDI-tilgang og sender ikke data. Ingen fritekst, identifikatorer, nettverkskall, informasjonskapsler eller nettleserlagring. Nettleserens egen lydmotor/prosessering gjelder fortsatt.

## Kildeinspeksjon

Kildeappen er en modulær, iPad-orientert synthesizer. README og inngangssiden beskriver Web Audio/AudioWorklet, mikrofon og stemmeeffekter, sampleimport og opptak, ekstern MIDI, serverlagrede prosjekt/samplinger, en service worker/installérbar PWA og en større modul-/sequencerflate. Disse funksjonene gir en interessant lydopplevelse, men utvider tillatelser, dataflyt og driftsflate. Denne demoen er skrevet selvstendig og kopierer ingen kildekode, lydfiler, presets eller private data.

## Sikkerhets- og personvernkontroller

- Ingen innlogging, konto, server/API, serverlagring eller ekstern forespørsel.
- Ingen mikrofon, `getUserMedia`, MediaRecorder, Web MIDI, filvelger, sampleimport eller audio assets.
- Ingen local/session storage, IndexedDB, cookie eller service worker.
- AudioContext opprettes kun etter eksplisitt klikk på «Start lyd»; «Stopp lyd» suspenderer motoren.
- Bare forhåndsdefinerte toner og numeriske kontroller. Ingen identifiserende personopplysninger eller hemmeligheter.

## Test og QA

- `node --test tests/vibe-static.test.mjs`
- `node --check vibe/analog-synthesizer/app.js`
- `git diff --check`
- Bestått lokalt: prosjektets statiske testsett (9/9), `node --check`, `git diff --check`.
- Bestått med isolert JavaScript-interaksjonsharness: AudioContext opprettes først etter klikk; preset, pekeravspilling, tastaturavspilling og stopp.
- Chromium headless startet ikke ferdig i denne containeren, så visuell QA, faktisk mobilvisning og nettverksfanekontroll gjenstår.
- Kildeinspeksjon bekreftet at denne demoen ikke inneholder nettverkskall eller lagringsmekanismer; etter publisering skal direkterute, refresh, hub-retur og eksterne forespørsler kontrolleres på den offentlige siden.
- Ingen uavhengig formell godkjenning kreves etter prosjektjusteringen. PR holdes isolert og issue #2 refereres som delvis løst.
