# Hegra Cup Live · vurdering

## Første vurdering

- **Status:** Beholdt i bred førstegangsrunde. Dette er kun en kildevurdering, ikke kuratering eller en operativ appdemo.
- **Kilde:** `eirikyven-gif/diverse-apper/apps/hegra-cup-live`, offentlig `main` ved `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`, lest 2026-10-08. Kildetrær er kun lest.
- **Faktisk status:** Kildens README sier at appmappen foreløpig bare har dokumentasjon og en statisk UI-fasitfil, uten runtime-implementasjon. Appmappen inneholder `README.md`, `docs/ssot/CURRENT_SSOT.md`, `docs/migration/SERVER_TARGET_ARCHITECTURE.md`, `docs/migration/LEGACY_GAS_SHEETS_MAP.md` og `docs/ui/UI_GALLERY.html`.
- **Entrypoints:** Ingen kjørbar appentrypoint eller serverentrypoint er dokumentert i appmappen. `UI_GALLERY.html` er en statisk referansefil, ikke en runtime-app. Kildens README oppgir en deploysti og smoke-URL, men de bekrefter ikke at en deploybar implementasjon finnes.
- **Stack:** Ingen implementert appstack kan fastslås. SSoT beskriver legacy Google Apps Script + Google Sheets. HTML/CSS/JS med PHP eller tilsvarende API og MariaDB/MySQL eller tilsvarende database er foreslått målarkitektur, ikke implementerte komponenter.
- **Tester:** Ingen appspesifikke testfiler, testkommandoer eller testresultater i mappen.
- **API, auth og lagring:** Ingen kjørbar API/auth/storage i mappen. Dokumentene omtaler legacy Sheets-fanene `Settings`, `Teams`, `Matches`, `Users`, `Logs`; faktisk skjema og legacy-kode mangler. Målarkitekturen foreslår separate offentlige leseendepunkter og beskyttede sekretariatsendepunkter, autentisering/autorisasjon, servervalidering og auditlogging. Dette er planer, ikke verifisert funksjon.
- **Personvern:** Dokumentasjonen nevner brukere/roller, lag, kamper og logger, men konkrete felter, persondata, retention, tilgangsoppsett, faktisk behandling og produksjonsbruk er ukjent. Ingen data er hentet fra eller sendt til eksterne tjenester.
- **Rettigheter:** Ingen lisens/reuse-tillatelse er dokumentert i appmappen. Rettigheter til kildeimplementasjon, UI-referansen og eventuelt turneringsinnhold er uavklart.
- **Åpne spørsmål:** Dokumentene sier at siste komplette legacy-versjon, Sheet-kolonner, autorisasjonsnivå, belastnings-/SLA-krav, API-kontrakt, hosting og migreringsregler må avklares. Oppgitte legacy-baselines og versjoner er ikke verifisert mot kildekode.

## Showcase-omfang

Ruten er med vilje en tekstlig assessment-only vurderingsside. Kildens UI-galleri er ikke kopiert fordi det inneholder navngitte klubber/lag; ingen virkelige team-, person- eller kontaktdata gjengis her. Det finnes ingen syntetisk livegalleri fordi kildefunksjoner og visuell/runtime-tilstand ikke kan bekreftes ut fra dokumentasjonen alene.

Ruten bruker kun statisk HTML og lokalt showcase-stilark. Ingen JavaScript, API-kall, innlogging, skjema, lagring, persondata, hemmeligheter eller eksterne ressurser.

## QA

- Full showcase suite: `node --test tests/*.test.mjs` (30/30 passed); catalog JSON and `git diff --check` pass.
- Chromium QA at 320, 390, 768, 1024, and 1440 px: direct route, hub return, skip-link focus, and reload work; no horizontal overflow, page errors, external requests, or runtime data fields. Screen-reader use was not manually verified.
- No source UI image, named club/team data, API, script, form, or external resource is served.
- Deployment and public-host smoke checks have not been performed.

## Issue #2 progress

Delvis fremdrift: kandidaten er vurdert på tilgjengelig kildedokumentasjon og beholdt i bred førstegangsrunde. Manglende runtime, legacy-kilde og uavklarte rettigheter/dataforhold gjør at ingen interaktiv appdemo er laget. Dette fullfører ikke den samlede kandidatgjennomgangen. Ingen merge eller deploy er utført.
