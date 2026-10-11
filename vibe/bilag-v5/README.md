# Bilag v5 · PDF-batch og ZIP-import

## Kildegjennomgang

Kilde: `eirikyven-gif/apps-fornes-gard/apps/bilag-v5`, commit `90014358fb3d70e89265b2b30d38e9376a6927b2` (lest 2026-10-11). Gjennomgåtte aktive filer: `README.md`, `backend/Config.gs`, `backend/DriveAdapter.gs`, `backend/SheetAdapter.gs`, `backend/SyncService.gs`, `backend/ZipImport.gs`, `tests/AutomationTest.gs`, `tests/ZipImportTest.gs`, `tests/run-automation-tests.js` og `tests/run-zip-import-tests.js`. `arkiv/` er uttrykkelig utelatt fra aktiv kildeleveranse.

## Kildeparitet i demoen

Demoen gjengir arbeidsflytens observerbare valg med lokale syntetiske data:

- **PDF-batch:** allerede behandlede elementer hoppes over; PDF flyttes direkte, mens støttede Google-dokumenter, regneark, JPEG, PNG og ren tekst simuleres som konvertert i kildemappen og deretter flyttet til Dokumentasjon. Originalen markeres beholdt. Ikke-støttet MIME-type hoppes over. Ustabil/uleselig fil gir eget feilutfall uten å stoppe resten.
- **Forsøk:** tre feil blokkerer videre automatisk behandling. En eksplisitt retry registreres separat og nullstiller forsøksrekken uten å fjerne eldre logghendelser.
- **ZIP-import:** ustabil ZIP hoppes over, korrupt ZIP gir isolert feil, oppføringer fra undermapper flates ut til filnavn, traversal/absolutte stier/kataloger/nestet ZIP avvises. Oppføringsnøkkel gir idempotens og eksisterende navn får deterministisk `(2)`-suffiks.
- **Jobbdrift:** PDF og ZIP har separate kontroller og logger, men deler Apps Scripts prosjektlås som serialiserer kjøringene. Maksgrensen er 25 elementer og kjøretidsrammen vises som fire minutter. Originalens tidsutløsere erstattes med manuell start.
- **Register og logger:** kø, forsøk, status og hendelser vises lokalt. Originalens `Bilag`, `Historikk`, `Kjøringslogg` og `ZIP-logg` i Google Sheets er ikke tilkoblet.

Demodata inkluderer særskilte tilfeller for PDF-flytting, konvertering, ustabil og ikke-støttet fil, retry-blokkering, ZIP-kollisjon, traversal, nestet ZIP, ustabil ZIP og korrupt ZIP.

## Trygghetsgrenser

Ingen kildekode eller konfigurasjons-ID-er er kopiert. Ingen filer lastes opp/ned eller leses; ingen ZIP åpnes og ingen PDF konverteres. Ingen Drive/Sheets, API-er, nettverkskall, autentisering, eksterne tjenester eller serverlagring. `localStorage` inneholder kun den faste syntetiske demo-tilstanden under `vibe.bilag-v5.demo.v2` og kan slettes via **Nullstill demo**. Ingen felter tar imot filnavn, personopplysninger eller økonomidata. Loggene er ikke revisjonslogger.

## Tester og QA

Kjør fra repo-roten: `node --test tests/bilag-v5-parity.test.mjs`, `node --check vibe/bilag-v5/app.js`, `node --test tests/*.test.mjs` og `git diff --check`. Siden fungerer på `/vibe/bilag-v5/` og lenker tilbake til `/vibe/`. Kildetestene ble lest, men ikke kjørt i showcase. Denne endringen er et delbidrag til Issue #2. VERSION, merge og deploy håndteres av koordinatoren.
