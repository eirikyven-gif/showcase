# Bilag v5 · batchstatus

## Første vurdering

- **Kildestatus:** Read-only gjennomgang av `apps-fornes-gard/apps/bilag-v5/README.md` i GitHub. README-en beskriver PDF-batch, separat ZIP-import, tidsstyrte triggere, batchgrenser, separate låser, Google Drive-/Sheet-flyt, append-only logger og `SYSTEM`-identitet. Backend, tester og data ble ikke hentet eller kjørt; beskrivelser av implementasjonen bygger derfor på README-en og er ikke uavhengig verifisert.
- **Bruksområde:** Synliggjøre status og forskjellen mellom to separate batchløp i dokumentflyt.
- **Kategori:** Gårdsadministrasjon og dokumentflyt.
- **Målgruppe:** Gårdsbrukere, regnskapsmedarbeidere, dokumentansvarlige og utviklere som vurderer batcharbeidsflyt.
- **Status:** Beholdt i bred førstegangsvurdering; original, statisk konseptdemo laget. Ingen kuratering eller utsiling.
- **Slug/rute:** `bilag-v5` · `/vibe/bilag-v5/`.
- **Demoverdi:** To samtidige statuskort og en syntetisk hendelsesoversikt gjør det enkelt å forstå hvorfor PDF-batch og ZIP-import må følges som ulike jobber.
- **Forenklinger:** Fast HTML-visning med fiktive pakkenavn, filnavn, klokkeslett og statusverdier. Ingen interaksjon, jobbkjøring, tidsstyring, filmetadata, retry, lås eller audit-logikk.
- **Risiko:** Kildebeskrivelsen omfatter økonomiske dokumenter, Drive-filer og Sheet-logger som kan inneholde navn, lenker og fil-ID-er. Tilgangsmodell, dataklassifisering, trigger-eier og faktiske data ble ikke verifisert. Eksempelsiden viser bare oppdiktede verdier og peker tydelig på at loggen ikke er en faktisk revisjonslogg.
- **Omfang:** Bare denne isolerte ruten, katalograden og vurderingen. Ingen opplasting/nedlasting, ZIP/PDF-parsing, Drive, Sheet, triggere, systemidentitet, eksterne kall, autentisering, lagring, PII eller hemmeligheter.

## Overlapp med Bilag

`/vibe/bilag/` skisserer én kø med sorteringsstatus. Bilag v5-kilden beskriver en bredere og konkret automatisert arbeidsflyt: én tidsstyrt jobb normaliserer og flytter støttede filer til Dokumentasjon; en separat tidsstyrt ZIP-jobb pakker ut stabile arkiver til Innboks. De to løpene har egne triggere og låser og skriver til egne/relaterte loggfaner. Demoen her overlapper derfor på oversikts- og oppfølgingsbehovet, men fremhever at PDF-batch og ZIP-import er forskjellige steg. Den utfører ingen av dem og presenterer ikke statusene som kildens faktiske driftsstatus.

## QA og publisering

Siden er statisk HTML/CSS uten appskript. Demoen skal vurderes for liten skjerm, lesbar tabell ved horisontal rulling, overskriftsstruktur, skip-lenke, kontrast/fokus fra felles hub-stil, syntetiske verdier og ingen forespørsler utover statiske lokale ressurser. Kjør fra repo-roten: `node --test tests/*.test.mjs` og `git diff --check`; åpne `/vibe/bilag-v5/` med lokal HTTP-server for direkte-rute- og mobilkontroll.

Denne leveransen er et delbidrag til Issue #2. Ingen publisering er utført. Deploystatus er derfor upublisert; den etablerte `diverse-apper`-baserte deployflyten krever merge til `main`, dry-run og deretter godkjent live-kjøring. Denne endringen setter `VERSION` til `0.22.0`, neste minor etter `0.21.0` på `main` ved integrering.
