# Analog Synthesizer · kandidatvurdering

## Vurdering

- **Status:** Beholdt i bred førstegangsvurdering. Ingen kurateringsbeslutning eller utsiling er gjort.
- **Bruksområde:** Spill syntetiske toner og utforsk grunnleggende synthlyd i nettleseren.
- **Kategori og målgruppe:** Musikk · musikere, lydinteresserte og nybegynnere innen synthesizere.
- **Demoens verdi:** Hør og spill umiddelbart, og utforsk hvordan tonehøyde, filter, volum og klang påvirker lyden uten utstyr eller konto.
- **Forenkling:** Eksisterende showcase-rute er en selvstendig én-oktavs oscillatorflate med tre klangvalg og tre kontroller. Den utelater kildeappens modulrack, sequencer, mikrofon/stemmebehandling, samples og filimport, MIDI, opptak/eksport, prosjekter, serverlagring og PWA.
- **Omfang:** Denne leveransen kompletterer metadata og vurderingsdokumentasjon samt en målrettet regresjonstest for den allerede eksisterende `/vibe/analog-synthesizer/`-ruten. Ruteimplementasjonen endres ikke.

## Kilde og usikkerhet

Kilden ble lest skrivebeskyttet fra [eirikyven-gif/diverse-apper, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`](https://github.com/eirikyven-gif/diverse-apper/tree/0900ffe48fa92dcefae1c6d0bbee8e0d02eec530/apps/analog-synthesizer), mappe `apps/analog-synthesizer/`. Gjennomgått: README, `version.json`, HTML-entrypoint, hoved- og lydmotor, MIDI-kontroller, prosjekt-sync, samplelagring, serverbibliotek, service worker, PHP-endepunkter, testmanifest og QA-notat. README og `version.json` oppgir v0.15.1. README beskriver en aktivt utviklet webapp og en produksjonsmålsti; faktisk deploy, reell produksjonsbruk og full driftspraksis er ikke kontrollert.

Kildens synlige stack er HTML/CSS/ES modules, Web Audio API/AudioWorklet, Web MIDI, `getUserMedia`, MediaRecorder, IndexedDB, localStorage, service worker/PWA og PHP/JSON-API-er. Kilde-README angir `npm --prefix apps/analog-synthesizer run check` og `npm --prefix apps/analog-synthesizer test`. `docs/qa-v0.15.1.md` rapporterer 105/105 tester og automatisert Chromium/axe-kontroll ved 320, 390, 768 og 1440 CSS-piksler; fysisk iPhone/iPad, installert PWA og desktop Web MIDI-kontroll står der fortsatt som åpne. Resultatene er kilde-dokumenterte, ikke kjørt på nytt i denne arbeidsrunden.

Notion-sporingsrad: [Analog Synthesizer](https://app.notion.com/p/3f3ba9485bce816b807efe0f986bf957). Showcase vurderes under **Kravspesifikasjon – Vibe-utstilling v0.1 LÅST**. Kildens konsoliderte [SSoT v0.2](https://app.notion.com/p/3a3ba9485bce81ed964dc34b64ffb2ff) er LÅST og har senere låste presiseringer gjennom v0.15.0. Appens oversiktsside viser en eldre DRAFT-status som ikke samsvarer med dette. SSoT v0.3 er en nyere, separat DRAFT. Kildens låste SSoT oppgir MIT som lisensvalg, men ingen LICENSE-fil eller selvstendig lisensdeklarasjon ble funnet i repoet; effektiv lisensdekning er ikke uavhengig bekreftet.

Selv om den låste kildespesifikasjonen oppgir MIT som lisensvalg, ble ingen LICENSE-fil eller selvstendig lisensdeklarasjon funnet i repoet. Kode-, design-, ikon- og innholdsrettigheter er derfor ikke uavhengig verifisert. Showcase-implementasjonen er selvstendig og kopierer ikke kildekode, kildetekst eller aktiva.

## API, tilgang og personvern

Kildeappen har mikrofontilgang gjennom `getUserMedia`, MIDI-tilgang gjennom `requestMIDIAccess({sysex:false})`, MediaRecorder-opptak og filimport. Den bruker localStorage for økt-/presetdata og prosjekt-ID/PIN, IndexedDB for sampledata og same-origin `fetch` til `api/projects.php`, `api/sample-library.php` og `api/recording-library.php`. PHP-endepunktene håndterer prosjekt- og lyddata; prosjekt-PIN verifiseres mot hash. Service worker leverer offline-cache. Lyd, stemmer, importerede filer, MIDI-informasjon og prosjekter kan være sensitive. Oppbevaring, produksjonsadgang og full personvernpraksis er ikke uavhengig revidert.

Den eksisterende showcase-ruten har ingen mikrofon- eller MIDI-tilgang, filinput, opptak, server/API-kall, autentisering, nettleserlagring eller eksterne forespørsler. Den spiller bare forhåndsdefinerte toner fra Web Audio etter eksplisitt trykk på «Start lyd». Kontrollene finnes bare i sidens minne; ingen personopplysninger eller hemmeligheter brukes.

## Rute og QA

- Eksisterende direkte rute: `/vibe/analog-synthesizer/`; den og katalogoppføringen beholdes uten duplisering.
- Route README rapporterer tidligere 9/9 tester i `tests/vibe-static.test.mjs`, JS-syntakskontroll og isolert interaksjonsharness for lydstart, preset, peker-/tastaturtoner og stopp. Dette er tidligere resultat, ikke QA for denne metadataendringen.
- Denne PR-ens dedikerte regresjonstest kontrollerer kandidatfeltene, lenker/etiketter og at demoen ikke eksponerer mikrofon, MIDI, nettverk, lagring, filimport eller autentisering.
- Denne metadataendringen inkluderer ikke ny visuell nettleser- eller skjermleser-QA.
- Ingen deploy. Issue #2 omtales som delvis løst; uavhengig coordinator-QA og grønne CI-porter kreves før merge.
