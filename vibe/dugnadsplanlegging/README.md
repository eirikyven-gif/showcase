# Dugnadsplanlegging – første vurdering og demoomfang

- **Bruksområde:** skissere bemanning av oppgaver over tidsrom.
- **Kategori:** Planlegging.
- **Målgruppe:** arrangører, lag og grupper som fordeler dugnadsvakter.
- **Status:** kandidat beholdt i bred første vurderingsrunde; ikke kuratert.
- **Foreslått slug:** `dugnadsplanlegging`.
- **Demoens verdi:** viser skift, tidsrom og tildelt deltaker og lar brukeren endre tildelingen.
- **Kildens flyt:** kildedokumentasjonen beskriver en vaktplanmatrise med oppgaver, tidsrom, bemanningsbehov og tildelinger, import/eksport og konfliktkontroll. Den har også offentlig påmelding, administratorflater og rollebaserte funksjoner.
- **Forenklinger:** selvstendig statisk skiftliste med generiske skiftnavn og syntetiske etiketter «Deltaker A–D». Ingen kildekode, arrangement, deltaker, kontaktdata, logo, API eller serverflyt er kopiert. Ingen registrering, innsending, autentisering, roller, import/eksport, varsling, ekstern tjeneste eller lagring finnes. Valg ligger kun i minnet fram til siden lastes på nytt.
- **Risiko:** dugnadsplaner kan avsløre personers oppholdssted og tilgjengelighet; kilden håndterer navn og kontaktinformasjon. Demoens oppdiktede etiketter og generiske tider gir ikke slike opplysninger. Ingen reell påmelding er mulig.
- **Omfang:** én selvstendig rute `/vibe/dugnadsplanlegging/`, én katalogoppføring, lokal HTML/CSS/JavaScript og vurderingsdokumentasjon. Kilderepoet er kun inspisert.

## Kontroller

- Syntetiske data: alle deltakere og skift er generiske.
- Innlogging, personopplysninger, secrets, serverlagring og eksterne API-/asset-kall: ikke med.
- Demoaktivitet: kun DOM og JavaScript-tilstand i minnet; nullstillingsknappen gjenoppretter eksempelplanen.
- Tastatur og responsivitet: skjemafelt har synlige etiketter og fokusmarkering; smal layout legger hvert skift i egen vertikal rad.


## Kildegjennomgang og usikkerhet

Kilde-repoet ble lest uten endringer ved offentlig main commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`. Gjennomgått: `README.md`, `ROADMAP.md`, `package.json`, HTML-entrypoints, nettlesermoduler, PHP-endepunkter for auth/session/data/signup/export/dugnader, `api/data/.htaccess` og SMS-bridge. `package.json` oppgir v0.6.13, mens README oppgir v0.6.10 og sier PR-review/QA. Faktisk deploy og produksjonsbruk er ukjent. Låst Notion-SSoT v1.0 fastsetter flerdugnadsmodell og at åpen oversikt ikke skal vise e-post eller telefon.

## Stack, tester, API, auth og lagring

Kilden bruker HTML/CSS/JavaScript, Node.js utviklingsserver og PHP-API-er. API-flyten dekker signup, login/session/logout, dugnader, data og eksport. Offentlig påmelding tar navn, e-post og telefon; admin og superadmin bruker sesjonsbasert tilgang. Runtime-data lagres i privat JSON-fil utenfor offentlig lesbar dataflate, og SMS-bridge er dokumentert. Kildens `package.json` har `start` og `check`, men ingen testscript eller `tests/`-mappe ble funnet. README beskriver PHP-lints og manuelle URL-smoketester; disse er ikke kjørt her.

## Demoens avgrensning

Showcase-ruten har kun tre oppdiktede vakter, fire generiske deltakeretiketter og en knapp for å nullstille. Valg lever i minnet i aktiv sideøkt. Det finnes ingen navn-/kontaktfelt, signup, login/roller, API, server, cookies, nettverksforespørsler, lokal lagring eller SMS. Ingen kildekode, logo, arrangement eller persondata er kopiert. Lisens og gjenbrukstillatelse for kilden ble ikke funnet; kildekode-/designrettigheter er uavklart.

## QA og status

Denne endringen kompletterer vurdering, metadata og regresjonsdekning for den eksisterende `/vibe/dugnadsplanlegging/`-ruten. Direkterute, hubretur, syntetiske valg, statusmelding, nullstilling, mobilvisning og fravær av nettverk/persistens kontrolleres. Ingen deploy utført; Issue #2 forblir åpen.
