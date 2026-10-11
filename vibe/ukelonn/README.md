# Ukelønn – showcase-demo

**Direkterute:** `/vibe/ukelonn/`
**Kilde:** `eirikyven-gif/diverse-apper/apps/ukelonn`, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (kilderepoet er ikke endret). Kilde-README oppgir v0.17.0.
**Låst appgrunnlag:** [SSoT-presisering – Ukelønn v0.14 LÅST](https://app.notion.com/p/3f2ba9485bce81e8a3cbeac59a5cd598). Showcase-funksjonen følger dessuten Vibe-utstilling v0.1, særlig krav 3, 4 og 6.

## Dette kan utforskes

Demoen beholder kildeappens sidemønster, norske produkttekster, bruker- og adminmenyer, kompakte tabeller, modaler, søkefelt og sentrale arbeidsflyter:

- Bruker: registrere ett eller flere gjøremål, se og endre/slette egne registreringer, foreslå gjøremål, se ukesoversikt og løpende saldo, be om utbetaling og åpne tidligere perioder.
- Admin: dashboard, opprette/redigere/deaktivere/slette gjøremål, administrere demo-brukere, se historikk og registreringer, behandle forslag og utbetalingskrav, registrere betalinger og perioder.
- Excel-nedlasting eksporterer hele gjøremålsregisteret med navn, betaling, aktiv-status og bildeflagg. `.xlsx`-import krever samme fire kolonner og erstatter registeret, slik kilde-API-et gjør. Begge deler kjører lokalt.
- Bruker- og admininnganger er rollevalg. Det finnes ingen PIN, passord, konto eller autentisering.

Rutene tilsvarer kildeappens `/`, `/logg-inn/`, `/registrer/`, `/min-oversikt/`, `/historikk/`, `/admin/`, `/admin/gjoremal/`, `/admin/brukere/`, `/admin/brukere/historikk/`, `/admin/registreringer/`, `/admin/forslag/`, `/admin/perioder/`, `/admin/utbetalinger/` og `/admin/logg-inn/`, under `/vibe/ukelonn/`.

## Demo-data, lokal lagring og reset

De to forhåndsdefinerte demobrukerne er **Voksen A** og **Voksen B**; brukerinngangen lar besøkende bytte profil uten PIN eller innlogging. Admin er en separat, simulert rolle. Gjøremål, beløp, status, perioder, registreringer, forslag og betalingshendelser er syntetiske. Foreslåtte navn fra brukerens lokale demoendringer bør fortsatt være fiktive; ikke skriv inn virkelige navn, PIN-er eller betalingsopplysninger.

Endringer lagres med `localStorage` på denne enheten for å bevare arbeidsflyten ved navigasjon, refresh og gjenåpning. En synlig melding på hver side forklarer lagringen og knappen **Nullstill alle demoendringer** sletter demoens nøkkel og starter de syntetiske eksempeldataene på nytt. Ingen cookie, IndexedDB eller sessionStorage brukes.

Appens JavaScript `fetch`-kall blir håndtert av `assets/demo-api.js` i nettleseren og avvises dersom de ikke er lokale API-simuleringer. Ingen API-forespørsel når serveren. Ingen server-side kode eller lagring følger med. Bildevalg følger kildeappens filtype-, størrelses- og antallsgrenser, men filinnhold leses ikke, lagres ikke eller sendes. Et vedlegg gir et lokalt, tydelig merket syntetisk bildeforhåndsvalg i brukerens og adminens visning. Kildeappens valgfrie SMS-handling vises som et merket lokalt SMS-utkast; ingen SMS-app åpnes eller melding sendes. E-postvarsler vises kun gjennom den lokale utbetalingskøen; ingen e-post sendes.

## Kildegjennomgang og grenser

Kilde-README beskriver PHP JSON-API-er, separat admin-/brukerinnlogging med PIN/passord, serverøkter, privat JSON-lagring, periodeoppgjør, vedlegg, e-post og valgfri SMS-lenke. Disse erstattes av lokale, syntetiske simuleringer. Kildens HTML, CSS og klientflyter for de brukerrettede sidene er utgangspunktet; PHP, API-endepunkter, konfigurasjon, autentiseringsverdier, vedlegg og runtime-data er ikke kopiert.

Kilde-UI-testene dokumenterer blant annet tabellrekkefølge, modalredigering/Escape, fokusretur, kompakt mobilvisning, filmal og historikk. Kildens PHP-sesjons- og backendtester gjelder ikke den rene statiske demoen; showcase-testene kontrollerer den lokale simuleringen og rutene i denne kopien.


## Funksjonsdekning mot kildekoden

Sammenligningen er gjort direkte mot kildecommit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`. Kildeklientene for dashboard, historikk, oversikt, perioder, forslag, utbetalinger, brukerhistorikk og oppgaver er i hovedsak kopiert; lokale avvik er listet per arbeidsflyt.

| Brukerrettet flyt | Kildebelegg | Showcase-belegg | Dekning |
| --- | --- | --- | --- |
| Inngang og rolle | `index.html`, `auth.js`, `route-guard.js` | `index.html`, `demo-api.js` og rollevalg | Beholdt som syntetisk rollevalg; PIN/passord og session er sikkerhetsforenklet. |
| Registrere flere gjøremål, søke, summering og periodetekst | `assets/ukelonn.js`: `renderTasks`, `updateSummary`, submit-handler | `assets/ukelonn.js`, lokal API-adapter | Beholdt; standardperioden beregnes fredag kl. 20 Europe/Oslo. |
| Påkrevde bilder og vedleggsvisning | `assets/ukelonn.js`: `uploadImage`, submit-handler; `api/attachments.php` | samme fil + `assets/synthetic-attachment.svg` | Filinnhold er ikke lastet opp. Lokal syntetisk forhåndsvisning erstatter privat bildeinnhold. |
| Endre/slette egne registreringer | `assets/ukelonn.js`: edit/delete handlers; `api/registrations.php` PATCH/DELETE | `assets/ukelonn.js`, `demo-api.js` | Beholdt for godkjente registreringer i aktiv periode; redigering beholder godkjent status og historikk. |
| Foreslå gjøremål og adminbehandle | `assets/suggestions.js`, `assets/suggestions-admin.js`; `api/suggestions.php`, `api/admin/suggestions.php` | samme klientfiler + lokal adapter | Beholdt med lokale syntetiske forslag og godkjenning/avslag. |
| Ukesoversikt, total, saldo og utbetalingskrav | `assets/overview.js`, `api/overview.php`, `api/payout-claims.php` | `assets/overview.js`, `demo-api.js` | Beholdt med lokal saldo/ledger. E-postvarsel er en lokal køtilstand, ikke sendt e-post. SMS er et tekstutkast, ikke ekstern handling. |
| Periodehistorikk og detaljvisning | `assets/history.js`, `api/overview.php` | samme klientfil + adapter | Beholdt for gjeldende og tidligere syntetiske perioder. |
| Admin gjøremål: opprette, søke, redigere, deaktivere/slette | `assets/tasks-admin.js`, `api/admin/tasks.php` | samme klientfil + adapter | Beholdt; kildebegrensning på sletting av historisk brukte gjøremål håndheves lokalt. |
| Excel eksport/import | `assets/tasks-excel.js`, `api/admin/tasks-excel.php` | `assets/tasks-excel.js`, `demo-api.js` | Eksportert arbeidsbok inneholder gjeldende register og de fire kildekolonnene. Import validerer kolonnerekkefølge, navn, beløp og dubletter og erstatter registeret. Kontrollert med syntetisk XLSX round-trip i Chromium. |
| Admin brukere og individuell historikk | `assets/auth.js`, `assets/user-history-admin.js`; `api/admin/users.php`, `api/admin/user-history.php` | samme klientfiler + lokal adapter | Beholdt for syntetiske visningsnavn/status/historikk. PIN-administrasjon og ekte kontoer er fjernet. |
| Admin registreringer og dokumentasjon | `assets/admin-registrations.js`, `api/admin/registrations.php`, `api/attachments.php` | samme klientfil + syntetisk vedleggsbilde | Beholdt; nettlesertest bekrefter at samme lokalt syntetiske bilde åpnes fra bruker- og adminvisning. Vedleggsbytes og filnavn lagres ikke. |
| Perioder | `assets/periods-admin.js`, `api/admin/periods.php`, `api/_periods.php` | samme klientfil + lokal adapter | Beholdt; aktive standard-/egendefinerte perioder følger kildekriteriet. |
| Behandle krav og registrere direkte betaling | `assets/payout-claims-admin.js`, `assets/payments-admin.js`; `api/admin/payout-claims.php`, `api/admin/payments.php` | samme klientfiler + lokal ledger | Beholdt med syntetiske brukere og betalinger; ingen faktisk pengeoverføring. |

### Avgrensede kildeavvik

- Kildekode for PHP-sesjoner, PIN/passord, CSRF, privat fil-/JSON-lagring, mail, SMS-levering, låser og cron kan ikke ha samme sikkerhets-/driftssemantikk i en statisk nettleser-demo. Disse delene er erstattet med tydelig merket local-only simulering; ingen hemmeligheter, kontodata eller vedleggsbytes er brukt. Kildens produkttekster og arbeidsflyter er beholdt; rolleinngang og katalogverdier er merket demo/syntetisk.
- Kildejobben `api/jobs/weekly-settlement.php` sender en konfigurasjonsavhengig e-postrapport. Den kjøres ikke i demoen. Den er en serverjobb uten egen brukerhandling; saldo, perioder og betalingsvisninger drives av den lokale ledger-simuleringen.
- Gjenstående gap: driftsvirkningene som krever kildeappens innlogging, server-/fil-lagring, e-post, SMS eller planlagte cron-jobber finnes ikke i statisk demoform. Dette er sikkerhetskritiske eller eksterne sideeffekter og er erstattet med lokale simuleringer eller utelatt. Ingen øvrige manglende brukerrettede UI-arbeidsflyter er identifisert i denne sammenligningen. Betaling og periodedrift er bare syntetisk; de skal ikke brukes til reelle beslutninger.

## Kontroller

Kildeparitetskontroll kjørt mot brukerrettet HTML/JS og relevant API-semantikk ved kildecommit `0900ffe…`. Browser-scenariene i `qa/ukelonn-showcase-browser.mjs` har disse resultatene:

| Scenario | Resultat |
| --- | --- |
| Alle 14 direkte sideruter, refresh, mobilbredde, intern navigasjon og ingen API-kall på HTTP-serveren | Bestått |
| Syntetisk demo, manglende authfelter, bare lokal lagring og full reset | Bestått |
| Oppgaveoppretting, redigering og XLSX-eksport/-import med registererstatning, fire kolonner og aktiv-/bildeflagg | Bestått |
| Påkrevd bildefil, brukerforhåndsvisning og adminforhåndsvisning; filnavn/bytes fraværende fra lagring | Bestått |
| Sende og adminbehandle forslag; opprette/redigere demo-bruker og åpne dennes historikk | Bestått |
| SMS-utkast uten sms:-lenke, payout-forespørsel, adminbehandling og kontroll mot dobbel utbetaling | Bestått |
| Opprette egendefinert betalingsperiode, formvalidering og synlig periode i adminlista | Bestått |
| Tastaturmeny/Escape, synlig fokus, skip-link og tilgjengelige navn for synlige felt/knapper | Bestått |
| Browserfeil og API-trafikk utenfor nettlesersimuleringen | Ingen observert |

Nettlesertesten avdekket en eksisterende async-formfeil i kildeklienten for perioder (`e.currentTarget` var null etter `await`). Showcase-kopien beholder samme arbeidsflyt og lagrer form-elementet før async-kallet; periodescenarioet bekrefter nå at oppretting fullføres.

Kjør fra showcase-roten:

```sh
node --test tests/ukelonn-showcase.test.mjs
node --test qa/ukelonn-showcase-browser.mjs # manuell Chromium-QA, krever lokalt Playwright og Chromium
node --test tests/vibe-static.test.mjs
```

Manuell QA: åpne `/vibe/ukelonn/` direkte; naviger til hver side og refresh; kontroller lokale endringer etter refresh og full reset; prøv modal med Escape, tastaturfokus, navigasjonsmeny, samt mobilbredder. Demoen skal aldri sende aktivitet eller skjemadata over nettverket.

## Leveransestatus

Dette er en isolert parity-korreksjon for `ukelonn`; PR refererer til Issue #2 som delvis løst. Draft beholdes til source-parity og kontroll er gjennomgått. Ikke merget eller deployet.
