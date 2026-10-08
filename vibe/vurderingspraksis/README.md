# Vurderingspraksis · første vurdering og demo

## Katalogmetadata

- **Bruksområde:** Utforsk et syntetisk eksempel på sammenheng mellom læringsmål, observasjoner og vurdering.
- **Kategori:** Utdanning.
- **Målgruppe:** Faglærere, vurderingsteam og studieplanleggere.
- **Status:** Beholdt i bred førstegangsvurdering; statisk demo laget. Ingen kuratering eller utsiling er gjort.
- **Foreslått slug/rute:** `vurderingspraksis` · `/vibe/vurderingspraksis/`.
- **Demoens verdi:** Viser hvordan mål, oppgave, observerbare spor, faglig drøfting og tilbakemelding kan henge sammen i en kort workshopøvelse.
- **Forenklinger:** Én nyskrevet, oppdiktet situasjon om overlevering av arbeidsstasjon. Fire korte steg med refleksjonsspørsmål; ingen av kildens tekster, dokumenter, flytskjemaer, medier eller visuelle ressurser er kopiert.
- **Risiko:** Lav for denne demoen. Den inneholder ingen reelle deltakere, vurderingsdata eller svarfelt. Kildens eksterne Drive- og YouTube-ressurser og rettigheter til innhold er ikke overført. Eventuell framtidig bruk av kildeinnhold må vurderes separat.
- **Omfang:** Responsiv, statisk lesestøtte med klikk- og tastaturbetjente fasetrinn. Ingen skriving, lagring, innlogging, server eller tredjepartskall.

## Personvern og sikkerhet

- Alt eksempelinnhold er oppdiktet og skrevet særskilt for denne siden.
- Ingen eksterne URL-er, fonter, bilder, medier, API-er eller nettverkskall.
- Ingen innlogging, identifikatorer, personopplysninger, svarinnsending eller analyse.
- Ingen `localStorage`, `sessionStorage`, IndexedDB, cookies eller serverlagring; fasen finnes bare i sidens minne.
- Dette er en demonstrasjon av vurderingsdrøfting, ikke en vurderingsfasit eller offisiell veiledning.

## Test og QA

- Kjør `node --test tests/vibe-static.test.mjs` og `node --check vibe/vurderingspraksis/app.js`.
- Kontroller HTTP-direkterute, hubkort, mobilbredde, tastaturbetjening med piltaster/Home/End, fokusmarkering og fasestatus.
- Bekreft at nettverksforespørsler bare gjelder statiske filer fra samme nettsted, og at valgt fase nullstilles ved ny innlasting.
- Første visuelle Chromium-kontroll og ekstern deploykontroll skal dokumenteres i PR når de faktisk er utført.

Issue #2 omtales som delvis løst. Ruten inngår fortsatt i den brede kandidatrunden; ingen kuratering eller utsiling er gjort.
