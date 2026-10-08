# Bingo

## Første vurdering

- **Formål og bruk:** Et ukentlig, utskrivbart BINGO-brett med navne- og tallbrett, offentlig nedlasting og administrasjon av aktiv uke.
- **Kategori:** Spill og arrangement.
- **Målgruppe:** Arrangører som deler en enkel bingorunde, og deltakere som spiller fra et utdelt brett.
- **Status:** Beholdt i bred førstegangsvurdering. Dette er en original konseptdemo, ikke en kildekodeport eller operativ tjeneste.
- **Slug og kollisjon:** `bingo`; kontrollert mot siste `origin/main` 2026-10-08. Ingen tidligere `bingo`-katalogoppføring eller `/vibe/bingo/`-rute.
- **Kildeversjon:** `eirikyven-gif/diverse-apper`, `main` ved commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`, lest 2026-10-08. Kildens README oppgir Bingo v0.1.0 og deployendring v0.1.1; pakken oppgir versjonen separat. Kilderepoet ble kun klonet og lest, ikke endret.
- **Kildestakk:** PHP API og admin, HTML/CSS/JS-nettleserflater, Node.js `node:test`-tester, Google Apps Script-uketrigger og SSB Statistikkbanken som genereringskilde. Kilden dokumenterer `npm test` og `npm run lint`; ingen av dem ble kjørt fordi kilden ble vurdert skrivebeskyttet og ikke er del av showcase-endringens validering.
- **Kilde-API og integrasjoner:** Offentlig PHP-nedlasting/API, admin- og genereringsendepunkter, SSB tabell 10467, Google Apps Script-trigger og egen deployworkflow. Kilde-API-ene ble ikke kalt.
- **Kildeauth og lagring:** Admin bruker passord/hash-baserte credentials, PHP-sesjon og CSRF. JSON-state, private konfigurasjonsverdier, PDF-filer og assets lagres på serveren. Admin kan laste opp logo/QR; Apps Script bruker et hemmelig trigger-token.
- **Personvern og risiko:** Kildebeskrivelsen omfatter aktive mottakere, leveringsmodell, betalingsinnstillinger, QR/logo, publiseringsmetadata og administratortilgang. Faktisk utrulling, mottakerdata, tilgangsstyring, retention i drift og produksjonsbruk er ikke uavhengig verifisert. Ikke bruk kildetjenesten med reelle mottakere eller betalingsinformasjon uten separat vurdering.
- **Rettigheter/usikkerhet:** Ingen lisens-/rettighetsavklaring ble funnet i de gjennomgåtte Bingo-filene. Opphavsrett til kildeimplementasjon, maler, navn og eventuelle eksterne kildeverdier er derfor uavklart. Ingen av kildens kode, maler, grafikk, tekst, logoer eller virkelige data er tatt med her.
- **Demoverdi:** Brettet gjør den enkle deltakerdelen forståelig og lar besøkende markere og nullstille eksempelruter.
- **Forenklinger:** Ett fast, syntetisk tallbrett; valg endres bare i DOM-minnet. Ingen trekking, flere spillere, utskrift, PDF, generering eller vinnerlogikk.
- **Avhengigheter:** Kun HTML, CSS og nettleser-JavaScript; hubbens eksisterende lokale stilark. Ingen pakker eller tredjepartsressurser.
- **Omfang:** Responsiv `/vibe/bingo/`-side. Ingen innlogging, admin, hemmeligheter, cron, server/API, opplasting, PII, persistent lagring eller eksterne kall. Nullstilling tømmer markeringer og returnerer fokus til første rute.

## QA

Automatisert test dekker katalogmetadata, semantisk knappestruktur, syntetisk brett, toggling, nullstilling, fokus og fravær av nettverk/lagring. `node --check` kjøres på JavaScript, og hele showcase-testpakken kjøres før PR.

Chromium 151 / Playwright QA ved 320, 375, 390, 768, 1024 og 1440 px: direkterute og hubretur virket uten horisontal overflow. Første Tab ga synlig fokus på skipplenken; rutevalg, fri midtrute, statusmelding og reset/fokusretur ble kontrollert. Reload nullstilte brettet. Ingen JavaScript-feil eller eksterne forespørsler. Skjermleser ble ikke manuelt testet. Ingen live- eller deploykontroll er utført.

## Issue #2 progress

Delvis fremdrift: kandidaten beholdes i bred førstegangsrunde og får en isolert, syntetisk statisk demonstrasjon med dokumentert kildeusikkerhet. Dette fullfører ikke den samlede kandidatgjennomgangen. PR er ikke merget eller deployet.

Showcase-versjon ved leveransen: `0.28.0` (minor etter `0.27.5` på siste `main`).
