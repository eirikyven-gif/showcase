# Bilag

## Første vurdering

- **Bruksområde:** Få oversikt over bilag i gårdsadministrasjon og støtte sortering og oppfølging.
- **Kategori:** Gårdsadministrasjon og dokumentflyt.
- **Målgruppe:** Gårdsbrukere, regnskapsmedarbeidere og andre som organiserer gårdsdokumentasjon.
- **Kildestatus:** Intern inventarbeskrivelse peker på normalisering og flytting av dokumenter. Kilderepoet `apps-fornes-gard/apps/bilag` var ikke tilgjengelig i arbeidsområdet, så kildekode, databehandling og integrasjoner kunne ikke verifiseres direkte.
- **Slug/rute:** `bilag` · `/vibe/bilag/`.
- **Status:** Beholdt i bred førstegangsvurdering; ingen kuratering eller utsiling.
- **Demoverdi:** En enkel kø med oppdiktede bilagsnavn viser hvordan kategori, dato og status kan støtte oversikt og sortering.
- **Forenklinger:** Original statisk skisse med tre fiktive rader. Handlingen oppdaterer kun synlig status og mappetekst i sidens DOM. Ingen dokumentinnhold, filbehandling, faktisk flytting eller normalisering.
- **Risiko:** Den beskrevne løsningen kan berøre økonomiske dokumenter og personopplysninger. Kildens faktiske risiko, tilgangskontroller, integrasjoner og lagring er ukjent fordi kilden ikke var tilgjengelig. Demoen inneholder ingen virkelige data eller dokumenter og har ingen autentisering, lagring eller nettverksintegrasjon.
- **Omfang:** Én isolert, statisk rute, katalogoppføring og denne vurderingen. Kun syntetiske filnavn, datoer, kategorier og statusverdier. Ingen opplasting/nedlasting, Drive eller webhook, eksterne kall, konto, PII, hemmeligheter, serverlagring eller nettleserlagring.

## Atferd og QA

Trykk «Sorter eksempel» for å endre den fiktive radens status. Endringen eksisterer bare i DOM og forsvinner ved reload. Ingen fil blir åpnet eller flyttet.

Kontroller: `node --test tests/*.test.mjs`; `node --check vibe/bilag/app.js`; `git diff --check`; HTTP-direkterute og lokal nettleserkontroll av mobilvisning, tastaturfokus, statusmelding og nettverksforespørsler. PR-en delvis løser Issue #2. Ikke publisert; deploy må validere `/vibe/bilag/` sammen med alle eksisterende katalogruter.
