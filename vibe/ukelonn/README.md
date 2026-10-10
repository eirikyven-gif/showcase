# Ukelønn – showcase-demo

**Direkterute:** `/vibe/ukelonn/`
**Kilde:** `eirikyven-gif/diverse-apper/apps/ukelonn`, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (kilderepoet er ikke endret). Kilde-README oppgir v0.17.0.
**Låst appgrunnlag:** [SSoT-presisering – Ukelønn v0.14 LÅST](https://app.notion.com/p/3f2ba9485bce81e8a3cbeac59a5cd598). Showcase-funksjonen følger dessuten Vibe-utstilling v0.1, særlig krav 3, 4 og 6.

## Dette kan utforskes

Demoen beholder kildeappens sidemønster, norske produkttekster, bruker- og adminmenyer, kompakte tabeller, modaler, søkefelt og sentrale arbeidsflyter:

- Bruker: registrere ett eller flere gjøremål, se og endre/slette egne registreringer, foreslå gjøremål, se ukesoversikt og løpende saldo, be om utbetaling og åpne tidligere perioder.
- Admin: dashboard, opprette/redigere/deaktivere/slette gjøremål, administrere demo-brukere, se historikk og registreringer, behandle forslag og utbetalingskrav, registrere betalinger og perioder.
- Excel-mal kan lastes ned som en lokal, tom arbeidsbok, og `.xlsx`-rader kan importeres i nettleseren uten serverkall.
- Bruker- og admininnganger er rollevalg. Det finnes ingen PIN, passord, konto eller autentisering.

Rutene tilsvarer kildeappens `/`, `/logg-inn/`, `/registrer/`, `/min-oversikt/`, `/historikk/`, `/admin/`, `/admin/gjoremal/`, `/admin/brukere/`, `/admin/brukere/historikk/`, `/admin/registreringer/`, `/admin/forslag/`, `/admin/perioder/`, `/admin/utbetalinger/` og `/admin/logg-inn/`, under `/vibe/ukelonn/`.

## Demo-data, lokal lagring og reset

De to forhåndsdefinerte demobrukerne er **Voksen A** og **Voksen B**; brukerinngangen lar besøkende bytte profil uten PIN eller innlogging. Admin er en separat, simulert rolle. Gjøremål, beløp, status, perioder, registreringer, forslag og betalingshendelser er syntetiske. Foreslåtte navn fra brukerens lokale demoendringer bør fortsatt være fiktive; ikke skriv inn virkelige navn, PIN-er eller betalingsopplysninger.

Endringer lagres med `localStorage` på denne enheten for å bevare arbeidsflyten ved navigasjon, refresh og gjenåpning. En synlig melding på hver side forklarer lagringen og knappen **Nullstill alle demoendringer** sletter demoens nøkkel og starter de syntetiske eksempeldataene på nytt. Ingen cookie, IndexedDB eller sessionStorage brukes.

Appens JavaScript `fetch`-kall blir håndtert av `assets/demo-api.js` i nettleseren og avvises dersom de ikke er lokale API-simuleringer. Ingen API-forespørsel når serveren. Ingen server-side kode eller lagring følger med. Bildevalg oppfyller kun demonstrasjonsflyten: filinnhold leses ikke, lagres ikke eller sendes; et eventuelt vedlegg vises som simulert. E-post/SMS og private tjenester er ikke kopiert eller kalt.

## Kildegjennomgang og grenser

Kilde-README beskriver PHP JSON-API-er, separat admin-/brukerinnlogging med PIN/passord, serverøkter, privat JSON-lagring, periodeoppgjør, vedlegg, e-post og valgfri SMS-lenke. Disse erstattes av lokale, syntetiske simuleringer. Kildens HTML, CSS og klientflyter for de brukerrettede sidene er utgangspunktet; PHP, API-endepunkter, konfigurasjon, autentiseringsverdier, vedlegg og runtime-data er ikke kopiert.

Kilde-UI-testene dokumenterer blant annet tabellrekkefølge, modalredigering/Escape, fokusretur, kompakt mobilvisning, filmal og historikk. Kildens PHP-sesjons- og backendtester gjelder ikke den rene statiske demoen; showcase-testene kontrollerer den lokale simuleringen og rutene i denne kopien.

## Kontroller

Kjør fra showcase-roten:

```sh
node --test tests/ukelonn-showcase.test.mjs
node --test tests/vibe-static.test.mjs
```

Manuell QA: åpne `/vibe/ukelonn/` direkte; naviger til hver side og refresh; kontroller lokale endringer etter refresh og full reset; prøv modal med Escape, tastaturfokus, navigasjonsmeny, samt mobilbredder. Demoen skal aldri sende aktivitet eller skjemadata over nettverket.

## Leveransestatus

Dette er én isolert showcase-kopi for `ukelonn`; PR refererer til Issue #2 som delvis løst. PR-forfatteren utfører ikke egen godkjenning. Deploy utføres gjennom etablert showcase-flyt etter merge.
