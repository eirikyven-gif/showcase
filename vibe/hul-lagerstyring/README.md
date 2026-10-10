# HUL Lagerstyring · lokal demo

Statisk showcase-kopi av den faktiske browserappen i `eirikyven-gif/hul-lager-html-gas`, kildecommit `fdda6419dbe8c8891eb9d27f9f6e56ec3151a602` (undersøkt 2026-10-10). Kilden inneholder en kjørbar, omfattende lagerarbeidsflate; den er ikke bare en arkivert plan eller frontendskall. `app/frontend/app.js` (650 334 byte) implementerer blant annet vareliste, søk/filtre/sortering, detalj og redigering, vedlegg, massehandlinger, CSV/XLSX-import og -eksport, masterdata, låntakerregister, utlån/retur, lånesaker, bestillinger, lister og offentlige lesevisninger. `mock-backend.js` implementerer de lokale CRUD- og arbeidsflytene.

Showcasen beholder kildeinnhold og browserfunksjoner på `/vibe/hul-lagerstyring/`. `lagerstyring-hell-ultra` er en separat WordPress-portal med en mindre, skrivebeskyttet lagerdemo. Kandidaten `lagerkart-vinter` er en liten vinterlagrings-/plasseringsdemo, og `vinterlagring-fornes` er et annet produkt. Ingen av disse rutene erstatter eller slås sammen med denne GAS/Sheets-baserte lagerstyringsappen.

## Kildeparitet, kontrollert mot commit `fdda6419dbe8c8891eb9d27f9f6e56ec3151a602`

`app/frontend/app.js` er identisk byte for byte i kilde og showcase (SHA-256 `0d0a236b1aec73b3545cbc053222b40d0a1b500b6002ea121fd1e4c1ce778894`). En regresjonstest låser denne kontrollen til den oppgitte kildecommiten. `mock-backend.js` har kildehash `c18f6186351eef5063b90d7a8f9bfa6fb366d6a83cefd63f1b9bc68c68dfe2fe` og showcasehash `d5fb19f3c3a3f9cc3e0b5ac753a2146cbee1f18323a1a3df6e3fea5076e735b9`; den direkte diffen viser uendret seeddata, datamodell og API-handlerne, med parser-/kommentarendring for å gjenkjenne `mock://`. `runtime-config.js` bytter backend-adressen til denne lokale mock-nøkkelen og låser `mockBackend: true` og `authMode: 'none'`. HTML-innpakningen erstatter CDN-styling med lokalt generert CSS, laster lokale script-filer og legger til synlig lokaldemo-/resetinformasjon. CSS-en ble regenerert med den pinnede Tailwind CSS 3.4.17-konfigurasjonen og er identisk med innsendt `style.css` (SHA-256 `f0dd3e5e35597aaa7077285eb3c52be601cf261869d302dadd61c557137408c6`). App-shellen og arbeidsflateinnholdet bygges fortsatt av den identiske `app.js`.

| Kildeområde og kildebevis | Dekning i showcase |
| --- | --- |
| Lagerliste, søk/filter/sortering og lagerkort: `app.js` `renderInventoryList` linje 3048, `renderInventoryControls` 3119 | Samme kildekode og mockdata |
| Varedetalj, vedlegg og vareform/CRUD: `renderDetail` 3328, `renderInventoryFormAttachments` 5583 | Samme kildekode og mockbackend |
| Lagerlister og offentlige liste-/varevisninger: `renderListeArbeidsflate` 6824, `renderOffentligListe` 7344, `renderOffentligVare` 7392 | Samme ruter og UI; deling/data er lokal mock |
| Bestilling og variantvalg: `renderBestillingWorkspace` 7076; lagerkø: `renderLagerWorkspace` 7180 | Samme kildekode og mockbackend |
| Utlån og låntakerregister: `renderLoanSection` 4655, `renderBorrowerRegistry` 12084, `renderLoanCaseRegistry` 12159 | Samme kildekode og syntetiske mockdata |
| Innstillinger, masterdata og brukeradministrasjon: `renderAdminPanel` 5365, `renderAdminUsersPanel` 5462 | Samme UI; uten ekte kontoer eller tilgangskontroll |
| Import/eksport, masseendring, navigasjon og hendelsesbinding: `renderImportPanels` 7701, `bindEvents` 7803 | Samme kildekode; filoperasjoner kjøres lokalt |

**Avgrensninger:** autentisering/autorisasjon, faktiske GAS-/Sheets-kall, serverlagring, kontoer og private produksjonsdata er ikke med. `authMode: 'none'` gir ingen reell tilgangskontroll; bruker-/lånerdata som opprettes i demoen er lokalt lagret og må være syntetiske. Mockens samsvar med produksjonsbackend, inkludert servervalidering, samtidighet, tillatelser og feiltilfeller, er ikke verifisert. Bestillingsflyten er et påvist funksjonsgap: kilde-`app.js` kaller `/api/v1/orders/draft`, `/api/v1/orders/:id` og `/api/v1/orders/:id/lines`, men den pinnede mock-backenden har ingen matchende handlers. Ingen bestillingskontrakt ble funnet i det gjennomgåtte kildeutvalget som kan brukes til å implementere en trofast lokal simulering. Dette må avklares mot kildebackend før flyten kan kalles dekket. Denne konklusjonen gjelder bare den oppgitte kildecommitten.

## Sikkerhets- og personvernavgrensning

- Runtime er låst til `mockBackend: true` og `authMode: 'none'`. API-kall fra appen rutes til den lokale mock-interceptoren. CSP setter `connect-src 'none'`, slik at nettleseren ikke kan koble til backend, private API-er eller andre nettverkstjenester.
- Ingen GAS-server, Sheets, PHP, database, ekte API-adresse, auth-provider-konfigurasjon, credentials eller deployhemmeligheter er tatt med. Ingen autentisering eller tilgangskontroll er tilgjengelig i demoen; kildeappens brukeradministrasjon er bare lokal simulering.
- Seed-inventar, arrangementer, lister og bruker-/lånedata er mockverdier. Besøkende kan likevel skrive inn egne data. Ikke skriv inn personopplysninger eller konfidensiell informasjon.
- Mockdatabasen lagres varig i `localStorage` under `HUL_MOCK_DB_v1`. Appens visningstilstand kan bruke `sessionStorage`. Synlig varsel forklarer dette, og **Nullstill demo** ber om bekreftelse, sletter mockdatabasen og HUL-prefiksnøkler fra localStorage/sessionStorage, og laster eksempeldata på nytt. Nettleserens vanlige lagringsverktøy kan også brukes til å fjerne data.
- Kildens utility-styling er bygget på forhånd til lokal `style.css` med Tailwind CSS 3.4.17. `tailwind.config.cjs` og `tailwind.input.css` dokumenterer den repeterbare byggingen; nettleseren laster ingen CSS-runtime eller andre eksterne ressurser.
- For å regenerere CSS fra repo-roten: `npm exec --yes --package=tailwindcss@3.4.17 -- tailwindcss -i vibe/hul-lagerstyring/tailwind.input.css -o vibe/hul-lagerstyring/style.css --config vibe/hul-lagerstyring/tailwind.config.cjs --minify`.
- CSP begrenser script og stil til samme origin uten inline-kode; bilder, medier og skrifttyper er lokale, med `data:`/`blob:` for vedlegg. `connect-src 'none'` blokkerer alle nettverkstilkoblinger. Mockbackendens `mock://hul-mock.local` er en lokal interceptor-nøkkel, ikke en nettverksadresse.

## Kildeinventar og avgrensning

Gjennomgått kildecommitten `fdda6419dbe8c8891eb9d27f9f6e56ec3151a602`, inkludert `AGENTS.md`, `README.md`, `app/frontend/index.html`, `app/frontend/app.js`, `app/frontend/mock-backend.js`, `app/frontend/runtime-config.js`, `app/gas/Code.gs`, `app/gas/README.md` og aktiv prosjektstatus. Frontend-paritet er kontrollert direkte med SHA-256 av `app.js` og gjennomgang av mockbackend-diffen. Dette verifiserer ikke produksjonsbackendens oppførsel.

Issue #2 løses delvis ved å stille ut den komplette pinnede frontendkildeappen i en isolert rute. Dette bekrefter ikke produksjonsdrift eller serverparitet.

## Lokal kjøring

Fra repo-roten: `python3 -m http.server 8000`, åpne `http://localhost:8000/vibe/hul-lagerstyring/`. Ruten og stilene lastes lokalt; backendkall blir håndtert av nettleserens mock-interceptor.

## Test, QA, risiko og deploy

- Kildebaserte mockfunksjoner beholdes; produksjonsserverens oppførsel er ikke verifisert av showcase-testene.
- PR-validering: `node --test tests/*.test.mjs`, HTML/lenker via deployworkflowens katalogvalidering, `node --check` for JavaScript og `git diff --check`.
- Browser-QA scenariojournal (lokal Chromium, 2026-10-10): lagerlisten lastet med syntetisk eksempelinnhold; varekortet `Drikkeflaske 500 ml` åpnet detaljvisning; redigeringsskjemaet viste seedverdiene. Klikk «Legg til i bestilling» **FEIL**: UI viste `Endepunkt ikke funnet: api/v1/orders/draft`, kurven forble tom. Nullstill demo fjernet mockdatabasens localStorage-nøkkel i tidligere QA. Ingen off-origin requests eller browser-konsollfeil i den tidligere smoken. Følgende E2E-scenarioer er **ikke kjørt / ikke godkjent**: opprett/endre/deaktiver vare, lister og offentlig deling, full bestilling/innsending, utlån/retur, bruker-/masterdata, import/eksport/bulk, underenheter/medier og mobil responsivitet. Kildeparitet alene teller ikke som godkjent E2E-resultat. PR forblir draft til testene er kjørt og funksjonsgapet er avklart.
- Risiko: gjenbrukstillatelse for kildekode/UI er uavklart; stor kildefrontend; localStorage beholder også brukerens egne inndata til reset; kilde- og produktrettigheter er ikke verifisert; mockbackend er ikke produksjonssystem. Demoen er ikke for reell drift.
- Versjon: baseline `main` `38518a5` (`VERSION` 0.60.1); foreslått 0.60.2 for paritetskontroll og dokumentasjon.
- Deploy: ikke deployet. PR skal opprettes som draft; ikke merge eller deploy som del av dette arbeidet.
