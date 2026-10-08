# Nedtelling e-post – første vurdering

## Kandidatmetadata

- **Navn:** Nedtelling e-post
- **Bruksområde:** Forhåndsvise en nedtelling som kan brukes som bilde i en e-postsignatur.
- **Kategori:** Kommunikasjon
- **Målgruppe:** Personer som vil vise en nedtelling i en e-postsignatur.
- **Status:** Første brede vurdering fullført; kandidat beholdt til senere kurateringsrunde. Demo er isolert PR, ikke publisert.
- **Foreslått slug:** `nedtelling-epost`
- **Demoens verdi:** Viser hvordan en nedtellingsgrafikk kan se ut, med live oppdatert canvas og tilgjengelig tekstlig oppsummering.
- **Nødvendige forenklinger:** Ny, selvstendig implementasjon; ingen generering av bilde-URL eller faktisk signaturkode. Ingen GIF/PNG-eksport. Syntetiske forhåndsvalgte tekster; bare dato og tid kan endres lokalt.
- **Risiko:** Kildevarianten avhenger av lagring og rendering via PHP og produserer delbare URL-er. Slike nettverks- og lagringsfunksjoner er utelatt. Dato-/tidsvisningen er en lokal illustrasjon, ikke en ekstern nedtellingstjeneste.
- **Omfang:** Én statisk rute på `/vibe/nedtelling-epost/`, lokal canvas-forhåndsvisning, katalogkort og enkel nullstilling.

## Sikkerhet og personvern

Ingen PHP, serverkode, API-kall, innlogging, cookies, browserlagring, fjernbilder, tredjepartsskript eller hemmeligheter. Ingen e-post eller bilde sendes noe sted. Feltene inneholder kun forhåndsvalgte syntetiske overskrifter og dato/tid; endringene lever bare i sidens minne og kan nullstilles med knappen eller ved å laste siden på nytt. Det er ingen fritekstfelt for personopplysninger.

## QA

- Automatisert statisk test: `node --test tests/vibe-static.test.mjs`.
- JavaScript-syntaks: `node --check vibe/nedtelling-epost/app.js`.
- Nettleserkontroll: direkte rute og refresh, endring av eksempel/dato, nullstilling med tastatur, smal visning, ingen sideveis scrolling og nettverkspanel uten forespørsler fra demokoden.
- Tilgjengelighet: synlige etiketter, tastaturbetjening, fokusmarkering fra sentral stil, skip-lenke og canvas med oppdatert tilgjengelig tekst.

Issue #2 – delvis løst. Kandidaten er ikke kuratert bort. Publisering skjer etter PR-kontroll og grønne porter gjennom etablert Vibe-deployflyt.
