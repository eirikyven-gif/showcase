# Vibe coding læringsportal

## Første vurdering

- **Navn:** Vibe coding læringsportal
- **Bruksområde:** Veilede en deltaker fra en enkel idé via testbare krav til en konkret testplan.
- **Kategori:** Læring
- **Målgruppe:** Studenter, faglærere og andre som vil lære en idé-til-test-arbeidsflyt.
- **Status:** Kildeinngangspunkt bekreftet; bred førstegangsvurdering dokumentert. Kandidaten er ikke kuratert bort.
- **Foreslått slug:** `vibe-coding`
- **Demoens verdi:** Gjør sammenhengen mellom behov, krav og test synlig i et kort, interaktivt eksempel.
- **Nødvendige forenklinger:** Bytt ut seks-stegs portal, fritekst, kravbygger, rollevalg, kopierbare KI-ledetekster og regnearkgenerator med tre forhåndsskrevne steg. Eksemplet «Pauseplass» og alle stedene er oppdiktet.
- **Personvernrisiko:** Kildeportalen har mange fritekstfelt og lager kopierbar tekst; brukere kunne selv skrive inn personopplysninger i en KI-ledetekst. Denne demoen har ingen fritekstfelt, studentnavn, faktiske steder eller personopplysninger. Besøkende får tydelig beskjed om ikke å skrive inn personopplysninger.
- **Omfang:** Én isolert, statisk rute; klientbasert stegbytte og egenkontroll i minnet; ingen avhengighet av kildeappen.

## Rute og dataflyt

Direkterute: `/vibe/vibe-coding/`. Alt innhold er skrevet som fiktive, syntetiske eksempelverdier. Interaksjon begrenser seg til å bytte mellom tre faste steg og krysse av/nullstille kontrollpunkter. Tilstand ligger kun i JavaScript-objekter og DOM mens fanen er åpen. Ingen skjema, fritekst, nettverkskall, API, autentisering, serverlagring, nettleserlagring, eksterne ressurser, analyse eller sporing.

Kildeinngangspunktet ble kontrollert skrivebeskyttet: `apps/vibe-coding/index.html`, med `app.js` og `styles.css`. Kildeprosjektet ble ikke endret, og kildekode eller eksterne ressurser er ikke kopiert inn i demoen.

## QA

Statisk validering kjøres av prosjektets `tests/vibe-static.test.mjs` og GitHub Actions. Browser QA: stegbytte, reset, tastatur, mobilbredder, direkterute, refresh, hub-retur og kontroll av at demoen ikke utløser eksterne forespørsler.

Lokal Chromium-kontroll ble kjørt mot direkte rute, stegbytte, reset, refresh, tastaturfokus, 390 px mobilbredde, hub-retur og nettverksforespørsler. Ukjent slug ga serverens 404-svar lokalt; kobling fra publisert 404-side må kontrolleres etter deploy fordi statiske hoster håndterer dette ulikt.
