# Kriterieverksted · første vurdering og konseptdemo

## Førsterundeinventar

- **App/kandidat:** `apps-fagskolen/apps/vurderingsarbeid`; oppgitt slug `vurderingsarbeid-fagskolen`.
- **Navn:** Kriterieverksted.
- **Bruksområde:** Planlegg synlige vurderingskriterier fra et kompetansemål og en oppgave.
- **Kategori:** Utdanning.
- **Målgruppe:** Faglærere, vurderingsteam og studieplanleggere ved fagskole.
- **Status/anbefaling:** Beholdt som kandidat i bred førstegangsvurdering; original statisk konseptdemo laget. Ingen kuratering eller utsiling.
- **Foreslått slug/rute:** `vurderingsarbeid-fagskolen` · `/vibe/vurderingsarbeid-fagskolen/`.
- **Demoens synlige verdi:** Viser ett oppdiktet kompetansemål, en mulig oppgave, tre observerbare kriterieutkast og en enkel sjekkliste for kvaliteten på planen.
- **Nødvendige forenklinger:** Nytt, syntetisk tema om trygg overlevering av arbeidsstasjon. Ingen kildekode, tekster, vurderingsskjema eller data er kopiert. Sjekklisten vurderer kriterieplanen, aldri personer eller studentarbeid.
- **Avhengigheter:** Ingen runtime-avhengigheter; HTML, CSS og nettleser-JavaScript. Lokalt hub-stilark.
- **Risiko:** Kildekandidaten kan behandle sensitive vurderings- og studentdata. Ingen data eller intern kildekode er undersøkt. Demoen har ingen personfelt, poeng, karakterer, innlogging, lagring eller nettverkskall. Kildeinnhold/rettigheter er uavklart.
- **Estimert omfang:** Liten, selvstendig statisk rute; ett syntetisk eksempel og en lokal sjekkliste.
- **Kildestatus og usikkerhet:** Kildens metadata kunne ikke verifiseres: GitHub API-oppslag for `apps-fagskolen/apps` returnerte 404 i denne arbeidsøkten. Kilderepoet ble ikke klonet eller åpnet, eikä kode, README, issue, pakkeinnhold eller studentdata leset. Brukerens interne inventar sier at dette kan være en migrasjonspakke med uklar entrypoint. Teknologistakk, faktisk funksjon, avhengigheter, tester, utrulling og dataflyt er derfor ukjent.
- **Mulig overlapp:** Intern inventarinformasjon peker på mulig overlapp med den separate `app-vurderingsarbeid`-kandidaten. Relasjonen og eventuell funksjonell duplisering er ikke verifisert; begge beholdes i bred gjennomgang.
- **Kilde:** Oppgitt kandidatidentifikator `apps-fagskolen/apps/vurderingsarbeid`; metadataoppslag feilet med 404 2026-10-08. Ingen kildefiler lest.

## Personvern og sikkerhet

- Alt scenario- og kriterieinnhold er oppdiktet og formulert for denne demoen.
- Ingen studentopplysninger, svar, prestasjoner, poeng eller karakterer.
- Ingen fritekstfelt, autentisering, API, backend, konto, analyse, cookies, storage, secrets, CDN eller eksterne forespørsler.
- Sjekklistemarkeringer finnes kun i sidens minne og forsvinner ved omlasting.
- Dette er et konsept for fagpersoners planlegging, ikke en vurderingsfasit eller offisiell veiledning.

## Test og QA

- Kontroller JavaScript med `node --check vibe/vurderingsarbeid-fagskolen/app.js`.
- Kontroller hubkatalogens JSON og rutedokumentets statiske integritet.
- `node --check vibe/vurderingsarbeid-fagskolen/app.js`, katalogens JSON-parsing og `git diff --check` bestod. `node --test tests/vibe-static.test.mjs`: 11/11 bestod.
- Chromium direkterute svarte 200; mobilvisning 375 px hadde ikke horisontal overflow. Tastaturnavigasjon nådde alle tre lenkede sjekkbokser; Space oppdaterte status. Overskriftsstruktur, fieldset/legend og navngitte sjekkbokser er til stede.
- Nettverkslogg: 8 forespørsler til lokal origin, 0 eksterne. Ingen JavaScript-sidefeil. Tilgjengelighetssjekken var manuell semantikk-/tastaturkontroll, ikke full WCAG-revisjon.

Issue #2 omtales som delvis fremdrift. Ruten inngår fortsatt i bred kandidatrunde; ingen kuratering eller utsiling er gjort.
