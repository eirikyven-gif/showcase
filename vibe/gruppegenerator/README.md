# Gruppegenerator · kandidatvurdering

## Formål og kilde

Kandidaten er en offline nettleserapp for tilfeldig fordeling av innlimte studentnavn. Kildens README beskriver valg av fordelingsmetode, generering av grupper, ny fordeling, flytting av deltakere og Excel-eksport. Kildeinnholdet her er ikke kopiert. Den selvstendige showcase-demoen bruker åtte faste, syntetiske etiketter (Deltaker A–H), et utvalg på 2–4 grupper og en blandeknapp.

Kilde: `eirikyven-gif/apps-fagskolen`, `apps/gruppegenerator`, offentlig `main` commit `65082291abf9892f81e82bb258a0f0134c51cec7`, lest 2026-10-09. Kildekatalogen ble sparse-checkout'et til `/tmp` og ikke endret. Candidate Notion-sporingsrad oppgitt: https://app.notion.com/p/3f3ba9485bce81d9902bd18cb6b6dce0; innholdet i raden ble ikke verifisert i denne gjennomgangen.

## Teknisk vurdering

- **Status:** Beholdt i bred førstegangsrunde; original, forenklet statisk demo. Ingen utsiling eller endelig kuratering.
- **Stack i kilde:** Én selvstendig HTML-fil med innebygd CSS og JavaScript; ingen rammeverk eller tredjepartsbibliotek synlig i appmappen. Nettleserens tilfeldighetsgenerator brukes til blanding.
- **Tester:** Ingen testfiler eller testinstruksjoner i appmappen. Ingen påstand om teststatus utenfor mappen.
- **API og autentisering:** Ingen API eller innlogging omtalt eller funnet i appfilene.
- **Lagring og personvern:** Kildens README sier offline behandling og ingen permanent lagring. Koden håndterer tekst som limes inn og tilbyr lokal regnearknedlasting; dette kan inneholde studentnavn. Ingen serverbehandling er synlig. Faktisk operativ bruk, organisatoriske rutiner og eventuell videre håndtering er ikke verifisert.
- **Rettigheter:** Lisens eller tillatelse til gjenbruk er ikke dokumentert i appmappen. Showcase-ruten er skrevet selvstendig og gjengir ikke kildekode, tekst eller visuell utforming utover det generelle konseptet.

## Demoavgrensning og risiko

Demoen viser grunnideen med syntetiske etiketter og lokal, tilfeldig fordeling. Den har ikke fritekstfelt, identiteter, klasse-/kursnavn, opplasting, eksport, flytting av enkeltpersoner, konto, analytics, API, serverprosessering, persistent nettleserlagring eller eksterne kall. Tilstanden finnes kun i JavaScript-minne mens siden er åpen; knappen Nullstill eksempel gjenoppretter standardutvalget.

Kildeideen kan føre til behandling av studentopplysninger dersom virkelige navn brukes. Denne demoen er ikke beregnet for produksjonsbruk eller ekte deltakerlister. Randomiseringen er demonstrativ og garanterer ikke pedagogisk rettferdighet eller andre fordelingskrav.

## QA og status

Tilgjengelige kontroller er vanlige knapper og en merket select, med synlig tastaturfokus, statusmelding og responsivt oppsett. Direkterute: `/vibe/gruppegenerator/`; lenke tilbake til `/vibe/`. Redusert bevegelse støttes. Ingen deploy eller live-host QA er utført. Headless Chromium QA mot lokal HTTP-server ved 320, 390, 768, 1024 og 1440 px bestod: ingen horisontal overflow, gruppevelger og nullstilling fungerte ved hver bredde.

Dette er én kandidatleveranse i Issue #2. Den lukker ikke Issue #2. Ingen deploy, merge eller egen godkjenning utført.
