# HUL Lagerstyring · lokal demo

Statisk showcase-kopi av den faktiske browserappen i `eirikyven-gif/hul-lager-html-gas`, kildecommit `fdda6419dbe8c8891eb9d27f9f6e56ec3151a602` (undersøkt 2026-10-10). Kilden inneholder en kjørbar, omfattende lagerarbeidsflate; den er ikke bare en arkivert plan eller frontendskall. `app/frontend/app.js` (ca. 636 KB) implementerer blant annet vareliste, søk/filtre/sortering, detalj og redigering, vedlegg, massehandlinger, CSV/XLSX-import og -eksport, masterdata, låntakerregister, utlån/retur, lånesaker, bestillinger, lister og offentlige lesevisninger. `mock-backend.js` implementerer de lokale CRUD- og arbeidsflytene.

Showcasen beholder kildeinnhold og browserfunksjoner på `/vibe/hul-lagerstyring/`. `lagerstyring-hell-ultra` er en separat WordPress-portal med en mindre, skrivebeskyttet lagerdemo. Kandidaten `lagerkart-vinter` er en liten vinterlagrings-/plasseringsdemo, og `vinterlagring-fornes` er et annet produkt. Ingen av disse rutene erstatter eller slås sammen med denne GAS/Sheets-baserte lagerstyringsappen.

## Sikkerhets- og personvernavgrensning

- Runtime er låst til `mockBackend: true` og `authMode: 'none'`. API-kall fra appen rutes til den lokale mock-interceptoren. CSP setter `connect-src 'none'`, slik at nettleseren ikke kan koble til backend, private API-er eller andre nettverkstjenester.
- Ingen GAS-server, Sheets, PHP, database, ekte API-adresse, auth-provider-konfigurasjon, credentials eller deployhemmeligheter er tatt med. Ingen autentisering er tilgjengelig i demoen.
- Seed-inventar, arrangementer, lister og bruker-/lånedata er mockverdier. Besøkende kan likevel skrive inn egne data. Ikke skriv inn personopplysninger eller konfidensiell informasjon.
- Mockdatabasen lagres varig i `localStorage` under `HUL_MOCK_DB_v1`. Appens visningstilstand kan bruke `sessionStorage`. Synlig varsel forklarer dette, og **Nullstill demo** ber om bekreftelse, sletter mockdatabasen og HUL-prefiksnøkler fra localStorage/sessionStorage, og laster eksempeldata på nytt. Nettleserens vanlige lagringsverktøy kan også brukes til å fjerne data.
- Tailwind CSS lastes fra `cdn.tailwindcss.com` for å bevare kildens utility-styling. Dette er den eneste eksterne ressursen. CSP forbyr tilkoblinger med `connect-src 'none'`.

## Kildeinventar og avgrensning

Gjennomgått `AGENTS.md`, `README.md`, `app/frontend/index.html`, `app/frontend/app.js`, `app/frontend/mock-backend.js`, `app/frontend/runtime-config.js`, `app/gas/Code.gs`, `app/gas/README.md` og aktiv prosjektstatus. Kildens repo beskriver GAS/Sheets som backend, men showcase kopierer bare frontend og mock backend. Runtime-konfigurasjonen i kildeversjonen aktiverer allerede mock backend og `authMode: 'none'`; showcase låser og dokumenterer den oppførselen. Mocken demonstrerer mange av appens arbeidsflyter, men erstatter ikke verifisering mot produksjonsbackend og kan avvike fra den.

Issue #2 løses delvis ved å stille ut en faktisk kildeapp med sentrale arbeidsflyter i en isolert rute. Dette innebærer ikke fullstendig kandidatgjennomgang eller bekreftelse av produksjonsdrift.

## Lokal kjøring

Fra repo-roten: `python3 -m http.server 8000`, åpne `http://localhost:8000/vibe/hul-lagerstyring/`. Nettverkstilgang til Tailwind CDN trengs for full stil; funksjonelle backendkall forblir lokale mock-responser.

## Test, QA, risiko og deploy

- Kildebaserte/syntetiske mockfunksjoner beholdes; showcase- og kilde-private server/backendtester gir ingen garanti om datamodellparitet.
- PR-validering: `node --test tests/*.test.mjs`, HTML/lenker via deployworkflowens katalogvalidering, `node --check` for JavaScript og `git diff --check`.
- QA trenger desktop og mobilvisning av førsteinnlasting, vareliste/søk/filter, detalj/redigering, en lokal CRUD-arbeidsflyt, import/eksport, utlån/retur, lister, nettleserkonsoll/nettverksfane og Nullstill demo. Manuell browser-QA er ikke hevdet med mindre den faktisk er gjennomført.
- Risiko: gjenbrukstillatelse for kildekode/UI er uavklart; stor kildefrontend; mulig funksjonsfeil uten Tailwind CDN; localStorage beholder også brukerens egne inndata til reset; kilde- og produktrettigheter er ikke verifisert; mockbackend er ikke produksjonssystem. Demoen er ikke for reell drift.
- Versjon: baseline `main` `425c075` (`VERSION` 0.57.0); foreslått 0.58.0.
- Deploy: ikke deployet. PR skal isoleres og gjennomgås; ikke merge eller deploy som del av dette arbeidet.
