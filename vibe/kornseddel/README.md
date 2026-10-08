# Kornfølgeseddel

## Første vurdering

- **Bruksområde:** Vise hvordan en enkel følgeseddel for kornlevering kan organiseres og skrives ut.
- **Kategori:** Gårdsdrift og dokumentflyt.
- **Målgruppe:** Gårdsbrukere, transportører og mottak som ønsker å utforske et enkelt skjemaformat.
- **Kildestatus:** Kildestien `apps-fornes-gard/apps/kornseddel` var ikke tilgjengelig i arbeidsområdet. Kildekode og faktisk databehandling, integrasjoner, tilgangsstyring og lagring er derfor ikke verifisert. Ingen kildekode eller originalt innhold er gjengitt.
- **Slug/rute:** `kornseddel` · `/vibe/kornseddel/`.
- **Status:** Beholdt i bred førstegangsvurdering; original statisk konseptdemo laget. Ingen kuratering eller utsiling.
- **Demoverdi:** En utskriftsvennlig eksempeloversikt viser avsender, mottak, dato, eksempelreferanse, varelinje og signaturfelt.
- **Forenklinger:** Én statisk, ikke-redigerbar følgeseddel med oppdiktet gård, mottak, vare, dato, partier, referanse og mengde. Utskriftsknappen åpner bare nettleserens utskriftsdialog.
- **Risiko:** En operativ kornfølgeseddel kan inneholde person-, kontakt-, virksomhets-, identifikasjons-, steds- og leveringsopplysninger. Kildens faktiske behandling og rettighetsstatus kunne ikke vurderes. Demoen har bare syntetiske eksempelverdier, ingen virkelige identifikatorer og ingen datainnsamling. Original kildekode og innhold ble ikke kopiert.
- **Omfang:** Statisk `/vibe/kornseddel/`-rute, katalogoppføring og denne vurderingen. Ingen opplasting/nedlasting, eksterne API-er eller lenker, autentisering, server- eller nettleserlagring, hemmeligheter, personopplysninger eller kildedata.

## QA og status

Repository-testene passerer (12/12), JavaScript-syntaks og `git diff --check` er kontrollert. Chromium åpnet direkteruten med HTTP 200; ved 390 px var det ikke horisontal scrolling. Tastaturfokus er synlig, utskriftsdialogen ble kalt, og ingen eksterne nettverksforespørsler ble observert. Utskriftsstil skjuler navigasjon og knapp og beholder bare følgeseddelen.

PR-en delvis løser Issue #2. Ikke deployet; deploy må kontrollere `/vibe/kornseddel/` sammen med alle katalogrutene.
