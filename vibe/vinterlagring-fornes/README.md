# Vinterlagring Fornes

En original, statisk eksempelvisning av én fiktiv enhet og én fast lagringsstatus. Ruten er `/vibe/vinterlagring-fornes/`.

## Første vurderingsrunde

- **Formål:** Vise et kort eksempel på hvordan status for en enhet i vinterlagring kan presenteres.
- **Kategori:** Gårdsadministrasjon og lagerstyring.
- **Målgruppe:** Lageransvarlige, gårdsbrukere og personer som utforsker vinterlagring.
- **Status:** Beholdt i bred førstegangsvurdering; original statisk konseptdemo laget. Ingen kuratering eller utsiling.
- **Foreslått slug:** `vinterlagring-fornes`.
- **Synlig demo-verdi:** En samlet oversikt over én eksempelplass, lagringsstatus, miljøsignal og sesongforløp.
- **Forenklinger:** Kun den abstrakte enheten V-04 med status «Lagret». Ingen registrering, kundeprofil, identifikatorer, flytting eller endring av tilstand.
- **Avhengigheter:** Plain HTML og CSS, uten rammeverk, kjøretidsbibliotek eller eksterne ressurser.
- **Risiko:** Kildeappen er beskrevet som en kunde-/adminarbeidsflyt med PHP-session, e-post og database, og risiko knyttet til kundeopplysninger. Kildeproduksjon og kildetest er ikke besøkt; beskrivelsen bygger på tilgjengelig intern inventarinformasjon. Mulig overlapp med Lagerkart Vinter og tilhørighet i samme produktfamilie er uavklart. Den brede første runden beholder begge kandidater; eventuell kuratering er senere arbeid. Demoen er ikke egnet til operativ lagerstyring.
- **Omfang:** Én isolert, responsiv, skrivebeskyttet visning. Ingen innlogging, skjema for personopplysninger, e-post, database, session, API eller lagring.

## Data og personvern

V-04, plass, sesong, miljø og tilstand er oppdiktede eksempelverdier. Ingen PHP, autentisering, kundeopplysninger, personskjema, e-post, database, nettleserlagring, eksterne kall eller eksterne ressurser. Ingen funksjon sender data. Siden viser kun den faste tilstanden i markup.

## Lokal kjøring

Fra repo-roten: `python3 -m http.server 8000`, og åpne `http://localhost:8000/vibe/vinterlagring-fornes/`.

## Tester, QA og publisering

- Tester: `node --test tests/*.test.mjs` (16 bestått) og `git diff --check` bestått.
- QA: Chromium headless på 1440, 390 og 320 px; direkterute, statusinnhold, første tastaturfokus og mobilbredde kontrollert. Ingen vannrett overflow, konsollfeil eller eksterne forespørsler observert.
- Tilgjengelighet: semantiske landemerker og overskrifter, tekstlig status, synlig tastaturfokus og redusert-bevegelse-regel kontrollert. Ingen interaktive skjemafelt.
- Eksterne kall/ressurser: ingen. Nettleseren hentet kun HTML og lokal CSS.
- Deploy: ikke publisert. PR-en delvis løser Issue #2; publisering følger prosjektets vanlige deployflyt etter uavhengig review og merge.
