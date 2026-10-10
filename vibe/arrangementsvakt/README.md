# Arrangementsvakt · Showcase-kopi

Rute: `/vibe/arrangementsvakt/`. Denne er en funksjonell, statisk og lokal showcase-kopi av `eirikyven-gif/diverse-apper/apps/arrangementsvakt`, kildecommit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`.

## Bevarte flater og flyter

Kopien bruker kildens HTML-struktur, primære stylesheet og gjeldende UI-komponentlag. Den viser rollevalg for Løpsleder, Ledelse, Teamleder og Medlem; rollebasert navigasjon; prioritert oversikt; hendelsesfeed, søk/filtrering, detaljer, statuser, kommentarer og heving; Grupper og medlemsoversikt; samtaler/fellesmeldinger/gruppechat; admin for arrangement, gruppe og brukere; eksport; lokal ikke-sendt kø; og push-/installasjonsrelaterte statusflater i simulert tilstand. Red/white Vibe shell, retur til hub og lokal reset er lagt rundt kildeidentiteten.

## Lokal simulering og personvern

`assets/demo-api.js` erstatter API-et med en klientbasert simulator. Ingen HTTP-forespørsler, PHP, kontoer, PIN-autentisering, cookies, serverlagring, push, eksterne tjenester eller service-workerregistrering brukes. Roller velges som syntetiske demoidentiteter; administratorhandlinger er rollevisninger, ikke sikkerhetskontroller. Alle seednavn, meldinger, arrangementer, steder og hendelser er fiktive. Telefonverdier bruker null-prefiks og nye brukere normaliseres til syntetiske visningsnavn og `000000000`.

Endringer i arbeidsflyten lagres i `localStorage` under `vibe.arrangementsvakt.*`, som er separat fra kildeappens lagringsnøkler. «Nullstill all demoaktivitet» sletter demoens tilstand og ikke-sendtkø og laster inn syntetiske startdata på nytt. Bilder vedlegges ikke persistent; opplastingshandlingen viser bare lokal simuleringsbekreftelse. CSV/JSON-eksport genereres i nettleseren fra syntetiske demoopplysninger.

## Kildekartlegging og usikkerhet

Kilde-README oppgir v0.14.1 issue-412 og beskriver HTML/CSS/JavaScript, PHP API-er og JSON-fillagring. Kilden har 28 Node-smoketester. Gjeldende app har API-er for setup/login, team, brukere, arrangement, hendelser, meldinger, chat, status, filopplasting, medlemsimport, eksport og push. SSoT v0.9 angir felles navigasjon Oversikt/Meldinger/Hendelser/Grupper med rollebasert innhold; v0.10 krever at Meldinger viser samtaler, og Grupper er egen oversikt. Eldre låste SSoT-er, utkast og ryddemarkører overlapper; nyere UI-fasit og appens aktive HTML/JS ble brukt for observerbare flater. Hele testpakken til kilden ble ikke kjørt. Ingen kildedata, serverkode eller hemmeligheter er med i showcase.

## Dekningsgrenser

Simuleringen dekker representative hovedhandlinger i én nettleserprofil. Den reproduserer ikke serverens auth-/rolleautorisasjon, reell flerbrukersynk, push, nettverksfeil, XLSX-importparser, vedvarende bildeopplasting eller PHP-lagring. Rollevalg og syntetisk admin er ikke egnet for reell koordinering. Ingen uttrykkelig lisens ble funnet i kildefilene; gjenbruksrettigheter er ikke dokumentert.

## QA

Denne demoen er en delvis løsning på showcase Issue #2. Direkterute og refresh fungerer via statisk `index.html`; nettleseraktivitet oppbevares lokalt. QA fullført: hele showcase-testsettet passerer 72/72; alle rute-JavaScript-filer passerer `node --check`; `git diff --check` passerer. Headless Chromium verifiserte direkterute, dynamiske lokale UI-aktiva, rollevalg, oppretting av hendelse, refresh/persistens, full reset, keyboard-fokus og retur til hub ved 390 px og 1440 px. Ingen eksterne forespørsler, 404-er, browser/JS-feil eller horisontal overflow ble observert. Manuell WCAG-sjekk dekket semantiske landmarks, formetiketter, fokusrekkefølge/-synlighet og tastaturhandling; ingen formell skjermleser- eller kontrastmåling er kjørt.
