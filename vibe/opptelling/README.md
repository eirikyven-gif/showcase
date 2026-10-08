# Opptelling — kandidatvurdering og eksisterende demo

## Kandidatvurdering

- **Status:** Beholdt i bred førstegangsvurdering. Eksisterende rute er kontrollert og dokumentert; ingen kuratering eller utsiling foreslås.
- **Formål:** Vise hvor lenge det har gått siden et valgt starttidspunkt, eller fra «Start nå».
- **Kategori og målgruppe:** Tid; alle som vil følge med på forløpt tid.
- **Kilde og versjon:** `eirikyven-gif/diverse-apper`, `apps/opptelling/`; kilde-README oppgir v1.2.0. Koden er lest 2026-10-08 fra `main`, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`. Kilden er ikke endret.
- **Kildestakk og avhengigheter:** Kilde-HTML, appens JavaScript og delt CSS/JS fra `apps/_shared/ui.css` og `apps/_shared/ui.js`. Ruten her er statisk HTML/CSS/JavaScript og bruker Vibe sin delte CSS.
- **Kildetester:** Kilde-README beskriver manuelle kontroller av direkte åpning, live opptelling, nullstilling og returlenke. Ingen automatiserte Opptelling-tester eller testresultater er oppgitt i appmappen. Kilde-README oppgir også deploymål, men faktisk utrulling er ikke verifisert.
- **API og autentisering:** Inspiserte kildefiler viser ingen API-/serverkall eller innlogging. De laster lokale, delte UI-filer. Dette er en avgrenset gjennomgang av app-README, HTML og JavaScript, ikke en full revisjon av hele produktet eller driftsmiljøet.
- **Lagring og personvern:** Inspisert kode viser ingen nettleser- eller serverlagring. Starttidspunktet står i inputfeltet i den åpne fanen. Tidspunkt kan indirekte røpe noe om en hendelse, så demoen bruker bare brukerens eget valg midlertidig og sender eller lagrer det ikke.
- **Rettigheter:** Lisens eller eksplisitt tillatelse til gjenbruk av kildekode, design eller innhold er ikke bekreftet. Denne demoen er en selvstendig implementasjon og kopierer ikke kildefiler, delte kildeaktiva eller kildetekst.
- **Foreslått slug:** `/vibe/opptelling/`. Ruten fantes allerede på `main`; dette arbeidet reviderer dokumentasjon og testdekning, ikke oppretter en ny rute.
- **Demoverdi:** En umiddelbart forståelig klokke viser forløpt tid og reagerer direkte på et valgt tidspunkt.
- **Forenklinger:** Egen Vibe-utforming og ett starttidspunkt. Framtidige tidspunkt vises som null forløpt tid; kildeportal og delte kildeavhengigheter er utelatt.
- **Risiko:** Lav for den lokale demoen. Starttid kan være sensitiv i sammenheng, men ingen navn eller identifikatorer etterspørres, og verdien blir ikke lagret eller sendt. Kildens rettighetsstatus og faktiske produksjonsdrift er uavklart.
- **Omfang:** Én responsiv, tastaturbetjent side med dato-/tidsvalg, «Start nå», live opptelling og nullstilling. Ingen autentisering, server, API, eksterne kall, nettleserlagring, persistens, PII eller hemmeligheter.

## Demo og validering

Demoen bruker bare statiske ressurser fra samme Vibe-rute og hub. Inputverdien lever i sidens minne; nullstilling tømmer den. Ingen eksterne forespørsler, innlogging, API-er eller lagring er med.

Automatiserte tester kjøres med `node --test tests/*.test.mjs`. De dekker Opptelling-beregning, nullstilling, fremtidig starttid, katalogmetadata og statiske sikkerhetsgrenser.

### Lokal Chromium-kontroll

Kjørt 2026-10-08 med Chromium headless og Playwright mot en lokal HTTP-server. Direkteruten svarte 200; valgt tidspunkt ga forløpt tid og oppdaterte seg; Enter aktiverte «Start nå» og «Nullstill», og fokus gikk tilbake til startfeltet. Hubkortet åpnet riktig rute. Ingen horisontal overflow ved 320, 390, 768 eller 1440 px. Nettverksloggen viste bare lokale ruter og ressurser; ingen eksterne forespørsler eller JavaScript-feil.

Kontrollen gjelder den lokale statiske demoen. Live deploy og faktisk publisert rute er ikke kontrollert.

## Issue #2

Denne endringen er et dokumentert, avgrenset bidrag til den brede kandidatgjennomgangen i Issue #2. Eksisterende rute gjennomgås; ingen merge eller deploy inngår.
