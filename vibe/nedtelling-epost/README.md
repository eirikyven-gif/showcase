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

## Kildegjennomgang

- **Kildeversjon:** README oppgir `1.3.0`; inspisert kilde er `main` commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (2026-10-07).
- **Kildestakk:** HTML med innebygd JavaScript, delt `apps/_shared/ui.css` og `ui.js`, samt PHP-endepunktene `counter-presets.php` og `i/index.php` for lagring og bildegjengivelse.
- **Kildetester:** README beskriver manuelle kontroller for oppretting, kopiering av bilde-URL og signatur-HTML, og fravær av diagnoseparametre. Ingen automatiserte tester eller dokumenterte resultater.
- **API, innlogging og lagring:** Den inspiserte HTML-en sender POST med telleroppsett til `counter-presets.php`, og PHP lager en delbar bilde-URL. Ingen autentisering eller cookies fremgår av de inspiserte filene. Serverens videre datalagring/retensjon er ikke undersøkt.
- **Rettigheter:** Ingen lisens eller uttrykkelig tillatelse til gjenbruk er bekreftet. Showcase-koden og utformingen er skrevet separat.
- **Forenklinger:** Bare syntetiske eksempeloverskrifter og lokal dato/tid; ingen fritekstfelt, PHP, lagring, delbar URL, bildeeksport eller signatur-HTML.

## Sikkerhet og personvern

Ingen PHP, serverkode, API-kall, innlogging, cookies, browserlagring, fjernbilder, tredjepartsskript eller hemmeligheter. Ingen e-post eller bilde sendes noe sted. Feltene inneholder kun forhåndsvalgte syntetiske overskrifter og dato/tid; endringene lever bare i sidens minne og kan nullstilles med knappen eller ved å laste siden på nytt. Det er ingen fritekstfelt for personopplysninger.

## QA

- Automatisert statisk test: `node --test tests/vibe-static.test.mjs`.
- JavaScript-syntaks: `node --check vibe/nedtelling-epost/app.js`.
- Nettleserkontroll: direkte rute og refresh, endring av eksempel/dato, nullstilling med tastatur, smal visning, ingen sideveis scrolling og nettverkspanel uten forespørsler fra demokoden.
- Tilgjengelighet: synlige etiketter, tastaturbetjening, fokusmarkering fra sentral stil, skip-lenke og canvas med oppdatert tilgjengelig tekst.

Issue #2 – delvis løst. Kandidaten er beholdt for senere kuratering. Eksisterende rute er gjennomgått; dette arbeidet er ikke en godkjenning av produksjonsintegrasjon eller publisering. Publisering skjer etter PR-kontroll og grønne porter gjennom etablert Vibe-deployflyt.
