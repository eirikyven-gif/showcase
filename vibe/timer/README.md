# Timer — kandidatvurdering og demo

**Status:** beholdt som kandidat i bred førstegangsvurdering. Ingen kuratering eller utsiling er gjort. Den opprinnelige appen er Timer v1.2.0 i `eirikyven-gif/diverse-apper/apps/timer`; kildeinventaret ble lest direkte fra offentlig `main` 2026-10-08 (`0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`). Denne ruten er en ny, original syntetisk demo, ikke en kopi eller port av kildekoden.

## Formål, kategori og målgruppe

Kandidaten er en enkel nedtelling for tidsavgrensede arbeidsøkter og pauser. Kategori: **Fokus**. Målgruppe: alle som vil følge med på en kort økt eller pause. Den lille, konkrete oppgaven gjør start, pause, fortsettelse og ferdigstatus enkel å utforske.

## Kildestatus og usikkerhet

Kildens README oppgir komplett grunnfunksjonalitet i v1.2.0: sekunder, start, pause/fortsett, nullstill, `aria-live`-status og vern mot flere intervaller. README oppgir `../_shared/ui.css` og `../_shared/ui.js` som lokale avhengigheter, samt en portal tilbake til `../tidteller/index.html`. Kilde-HTML/JS viser ingen API, innlogging, nettleserlagring, PII eller hemmeligheter, og ingen eksterne URL-er eller tjenestekall; implementasjonen bruker lokale delte UI-filer. Kilden setter bare nedre grense på ett sekund, og nullstilling bruker gjeldende innstilling. README gir manuelle testpunkter, men ingen testkommando eller automatisert testresultat. Deploy-sti og smoke-URL er oppgitt i README, men faktisk produksjonsstatus ble ikke bekreftet. Versjonsopplysninger bygger på README og HTML; annen versjonsmanifest eller CI-status ble ikke undersøkt. Kildekoden er lest, ikke endret.

## Demo og avgrensing

Åpne `/vibe/timer/`. Demoen har et syntetisk eksempel på 60 sekunder, validerer heltall fra 1 til 5 999 999 sekunder og lar brukeren starte, pause, fortsette og nullstille til eksempelet. Timer og valg finnes kun i minnet i gjeldende fane. Ny innlasting eller nullstilling fjerner tilstanden.

Dette er en forenklet fokusnedtelling, ikke en full port: ingen felles kilde-UI, portalintegrasjon, varsling/lyd, historikk, bakgrunnsplanlegging eller persistens. Risikoen er lav for denne statiske demoen; en timer kan være unøyaktig når nettleseren settes i bakgrunnen, og den kan forveksles med kildeproduktet. Skjermen merker verdien som syntetisk og sier at timeren kjører bare i fanen.

## Teknologi, data og personvern

Original HTML, CSS og JavaScript; responsiv layout og tastaturbetjente native input/knapper. Ingen API, autentisering, server, lagring, PII, hemmeligheter eller eksterne kall. Ingen data forlater fanen. Siden laster bare de statiske Vibe-filene fra samme nettsted.

## QA

Automatisert kontroll kjøres med `node --test tests/vibe-static.test.mjs`. Manuell QA: test gyldig/ugyldig varighet, start, pause, fortsett, fullføring, ny start, endring av varighet og nullstilling under kjøring/etter fullføring; kontroller tastaturfokus, live-status, direkte rute, kanonisk/hublenke og mobilbredder 320–1440 px. I nettverkspanelet skal bare statiske ressurser fra samme nettsted vises. Kontroller at valg ikke overlever sideinnlasting. Chromium QA bestod på 320, 390, 768 og 1440 px uten horisontal overflow. Direkterute, returlenke til hub, start, pause, nullstilling og ugyldig varighet ble kontrollert; ingen sidefeil eller eksterne forespørsler. Skjermleser ble ikke kontrollert manuelt; tilgjengelig status/live-region og etiketter ble vurdert i markup.
