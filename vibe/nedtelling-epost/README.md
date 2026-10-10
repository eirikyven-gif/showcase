# Nedtelling e-post

En isolert kopi av Nedtelling e-post v1.3.0 på `/vibe/nedtelling-epost/`. Demoen bevarer kildeappens direkte oppretting av en teller for e-postsignatur og den synlige arbeidsflyten fra oppsett til bildeadresse og HTML-kode.

## Kildegjennomgang

- Kilde: `eirikyven-gif/diverse-apper/apps/nedtelling-epost`, `main` commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`; README oppgir v1.3.0. Kilde-repoet ble kun lest.
- Kildens appmappe inneholder `index.html` og `README.md`. Appen har én opprettingsflate med navn, tittel, dato, tid, GIF/PNG-format, «Lagre og generer», bilde-URL og HTML for signatur. Kilde-HTML-en har ingen separat adminflate, login eller kontoflyt.
- Kilde-HTML sender `action: save`, `name` og `config` (`mode`, `title`, `date`, `time`) til `apps/tidteller/counter-presets.php`. Endepunktet skriver `data/counters.json` og returnerer `ok`, `id` og `publicCode`. Bildeadressen bruker den offentlige koden og `gif`/`png`; `apps/tidteller/i/index.php` slår opp koden og videresender til `email-countdown.php`. Standard signaturbilde er 420 × 90. Kildeendepunktet har en valgfri servernøkkel, men kilde-HTML sender ingen nøkkel.
- Gjennomgått også `apps/_shared/ui.css`, `apps/_shared/ui.js`, `apps/tidteller/counter-presets.php`, `apps/tidteller/i/index.php` og rendererens format-/responskontrakt. Kildens README angir manuelle tester for oppretting og kopiering, men ingen appspesifikke testfiler, testkommando eller kjørte resultater ble funnet. Ingen tester ble kjørt mot kildeappen.
- Det ble ikke funnet en appspesifikk governance-/SSoT-fil eller eksplisitt lisens i appmappen. Kildens faktiske produksjonsstatus, datalagringens retensjon/tilgang og gjenbruksrettigheter er ikke uavhengig verifisert. Showcase implementerer funksjonene selvstendig og kopierer ikke kildekode, aktiva eller private data.

## Bevarte funksjoner og innhold

- Samme felter, startverdier, GIF/PNG-valg, direkte genereringsknapp, kopier bildeadresse og kopier HTML for `<img>`.
- Lokal 420 × 90-nedtellingsgrafikk. PNG lages med Canvas. GIF lages lokalt som animert GIF med 60 rammer à ett sekund.
- Oppsett beholdes lokalt etter refresh. Teller med samme navn oppdateres, som i kildeendepunktets navnebaserte lagring.
- Full nullstilling fjerner alle demoens lagrede tellere og tilhørende genererte resultater fra visningen.

## Avgrensning, lagring og personvern

Serverlagring, PHP-endepunkter og offentlig kortkode er erstattet med `localStorage` og et innebygd bilde som `data:`-adresse. Den kopierte bildeadressen virker bare i nettleseren der den ble laget; den er ikke en offentlig eller delbar nettadresse. Dette forklares ved feltene og statusmeldingen. Signatur-HTML kopierer det genererte bildebittet inn i dataadressen.

Det finnes ingen reell autentisering, passord, API, serverpersistens, cookies, analytics, eksterne forespørsler eller kildehemmeligheter. Navn, tittel, dato og tid er brukerredigert lokalt og skal derfor være demo-/syntetiske verdier; ikke skriv inn personopplysninger eller sensitiv hendelsesinformasjon. Full nullstilling er tilgjengelig øverst på siden. Ingen e-post sendes.

## QA og sporbarhet

- Repoets fulle suite: `node --test tests/*.test.mjs`.
- Syntakskontroll: `node --check vibe/nedtelling-epost/app.js`.
- Kontroller direkterute, refresh/gjenoppretting, generering av PNG og animert GIF, kopieringskontroller, reset, tastatur/fokus, tilgjengelige labels/status, smal mobilvisning, katalogoppføring og fravær av nettverkskall.
- CI validerer katalogen, direkteruter, serverkodefrie statiske ressurser og rutetester.
- Issue #2 er delvis adressert av én appisolert PR. Ingen merge eller publisering er utført; offentlig etter-deploykontroll gjenstår.

## Kandidatmetadata

- **Bruksområde:** Opprett nedtelling til bruk i en e-postsignatur.
- **Kategori og målgruppe:** Kommunikasjon; personer som vil vise en nedtelling i e-postsignaturen.
- **Status:** Beholdt i bred førstegangsrunde, før senere kuratering.
- **Slug og omfang:** `nedtelling-epost`; én isolert statisk rute.
- **Demoens verdi:** Beholder oppretting, lokal bildevisning og signaturkoden fra arbeidsflyten.
- **Nødvendige forenklinger:** Lokal dataadresse i stedet for offentlig kortlenke; localStorage i stedet for PHP/JSON på server.
- **Risiko:** Hendelsestittel og tidspunkt kan være sensitivt i operativ bruk. Ingen demoopplysninger forlater nettleseren; veiledningen fraråder å oppgi person- eller sensitiv informasjon.
