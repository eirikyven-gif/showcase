# Tidtellerportal

**Rute:** [`/vibe/tidteller/`](/vibe/tidteller/)

## Kandidatvurdering

- **Bruk:** Portal for selvstendige verktøy for klokke, nedtelling, opptelling og tidtaking.
- **Kategori / målgruppe:** Tid · alle som vil finne et enkelt tidsverktøy.
- **Kildestatus:** `eirikyven-gif/diverse-apper/apps/tidteller`, offentlig `main` commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`, lest 2026-10-09. Kildens `index.html` viser v1.10.1, mens README oppgir v1.12.0; ingen app-VERSION eller package manifest finnes. README sier aktiv; produksjonsdeploy er ikke verifisert.
- **Kilde-stack:** Portal er statisk HTML som bruker `apps/_shared/ui.css` og `ui.js`, og lenker til syv underapper. Appmappen inneholder også PHP for opptellingsvalg, e-postnedtelling, bakgrunnsopplasting og renderer. Ingen byggeverktøy ble funnet i appmappen.
- **Tester:** Ingen testmappe, `package.json` eller testkommando i appmappen. Kilde-README/roadmap gir ikke testresultater. Kildetester ble ikke kjørt.
- **API, auth, lagring og personvern:** Portalfilen viser ingen API, auth, input eller lagring. Tilstøtende PHP-endepunkter håndterer lagrede valg, opplasting og dynamisk e-postgrafikk. Lagringsendepunktet har valgfri adminnøkkel; uten konfigurert nøkkel er lagring/sletting åpen for alle med sidetilgang. Hele dataflyten, tilgang, retention og drift er ikke revidert. Showcase-portalen utelater PHP-funksjoner.
- **Rettigheter:** Ingen lisens eller gjenbrukstillatelse funnet. Showcase bruker egen tekst og stil; kildekode, tekst og aktiva er ikke kopiert.
- **Status:** Beholdt i bred førstegangsrunde. Ingen kuratering eller utsiling.

## Demo, forenkling og omfang

- **Demoverdi:** Samler innganger til syv tidsverktøy. Alle målruter er verifisert i showcase-katalogen.
- **Forenklinger:** Original statisk oversikt; ingen av underverktøyene er kopiert inn eller slått sammen. Eksemplene er selvstendige, og portalen deler ikke data med dem.
- **Risiko:** Kildens PHP-endepunkter innebærer lagring og opplasting; faktisk datapraksis er ukjent. Showcase-siden har ingen input, backend eller nettverkskall. Flere tidsverktøy overlapper i funksjon.
- **Omfang:** Kun `/vibe/tidteller/`, med interne lenker til `nedtelling`, `nedtelling-epost`, `klokke`, `stoppeklokke`, `timer`, `ticker` og `opptelling`. Ingen PHP, API, eksterne destinasjoner, auth, lagring, telemetry, persondata eller secrets.
- **Rutevalg:** Ny rute. Eksisterende stoppeklokke-, timer-, nedtellings- og opptellingskandidater forblir egne ruter; portalen gir oversikt uten å duplisere dem.

## Kontroller

- Målrettet test i `tests/tidteller.test.mjs` kontrollerer komplette assessment-felt, unik katalogoppføring, alle interne lenker, hub-retur og fravær av skjema/script/backend-/lagrings-/ekstern runtime.
- Direkterute og refresh, responsivitet, tastaturfokus, skjermleserstruktur og redusert bevegelse kontrolleres separat under QA.
- Ingen deploy er utført.

## Issue #2

Dette er ett avgrenset bidrag til bred førstegangsgjennomgang av kandidatene. Det dokumenterer Tidtellerportal og gjør en enkel intern portaloversikt tilgjengelig; det løser eller lukker ikke Issue #2.
