# Klokke

## Kandidatvurdering

- **Status:** Beholdt i bred førstegangsvurdering; eksisterende isolert demo er gjennomgått. Ingen kuratering eller utsiling.
- **Formål:** Vise lokal dato og klokkeslett på norsk, med pause/fortsett.
- **Kategori:** Tid og hverdagsverktøy.
- **Målgruppe:** Alle som vil ha en tydelig klokke i nettleseren.
- **Foreslått slug:** `/vibe/klokke/` — ruten fantes allerede på siste `main` og er revidert; ingen duplikatrute opprettes.
- **Synlig demoverdi:** Et lite, umiddelbart forståelig eksempel på en lokal verktøyapp med levende klokke og betjening uten konto.
- **Nødvendige forenklinger:** Behold tid/dato og pause/fortsett; bruk enhetens klokke. Utelat kildeappens delte portal-CSS/JS og portaltilbakekobling. Den showcase-ruten har i tillegg 12-/24-timersvalg og egen responsiv, tastaturvennlig utforming.
- **Omfang:** Liten; eksisterende statisk rute, uten backend eller integrasjoner.

## Kildegjennomgang

Kilde: [`eirikyven-gif/diverse-apper`, `apps/klokke`](https://github.com/eirikyven-gif/diverse-apper/tree/main/apps/klokke), lest 2026-10-08 fra `main` på commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`.

Kildens README oppgir versjon 1.2.0, «Komplett grunnfunksjonalitet levert», norsk dato/tid, pause/fortsett og mobilvennlig visning. Teknologien er statisk HTML/CSS og nettleser-JavaScript; appen henter lokal tid med `Date`, formatterer med `no-NO` og oppdaterer visningen med `setInterval`. Den bruker `apps/_shared/ui.css` og `apps/_shared/ui.js`, og lenker til `../tidteller/index.html`.

README-en lister manuelle testpunkter for live oppdatering, norsk format og pause/fortsett. Ingen automatisert test eller testresultat er dokumentert i den gjennomgåtte appmappen. README-en angir en deploysti og smoke-URL, men faktisk deploy er ikke bekreftet. Kodegjennomgangen av appen og de to delte ressursene fant ingen API-kall, eksterne runtime-URL-er, innlogging, konto, serverlagring, nettleserlagring, cookies eller skjemaer. Dette er en avgrenset statisk kildegjennomgang, ikke en revisjon av hele kildeprosjektet eller produksjonsmiljøet. Repoet har ingen lisensfil på roten; rettighetsgrunnlaget for å kopiere kildekode/utforming er derfor uavklart. Showcase-ruten er en selvstendig implementasjon og ikke en kopi av kildefilene.

## Risiko og personvern

Kildeappen viser lokal tid og dato og ser ikke ut til å behandle brukeropplysninger. Produksjonskonfigurasjon og faktisk drift er ikke undersøkt. Rettighetsstatus er usikker fordi lisens ikke er funnet. Demoen bruker bare enhetens klokke; ingen identifiserende data, konto, API, private tjenester, hemmeligheter, nettverkskall eller persistens. Interaksjonsvalg lever bare i sidens minne og nullstilles ved ny innlasting.

## Showcase-scope

Ruten er en original, isolert HTML/CSS/JS-demo med norsk klokke, pause/fortsett, 12-/24-timersformat, tastaturbetjening og responsiv layout. Ingen kildekode, portalavhengigheter eller eksterne kall lastes. Ingen backend, autentisering, server- eller nettleserlagring, PII eller live API-data.

## QA-punkter

- Åpne `/vibe/klokke/` direkte og bekreft at dato og klokkeslett oppdateres på norsk.
- Pause og fortsett klokken; bytt mellom 12- og 24-timersformat.
- Bruk tastatur til å nå kontrollene og bekreft synlig fokus og oppdatert status.
- Kontroller smale og brede visninger, inkludert 320 px bredde.
- Bekreft at siden ikke gjør eksterne forespørsler eller lagrer data.

## Utført nettleser-QA

Automatisert nettleser-QA kjørt lokalt 2026-10-08 i Chromium 151.0.7922.173 med Playwright 1.62.1, mot en Python HTTP-server fra repo-roten. Direkteruten svarte 200, dato og klokkeslett ble vist, og Vibe-katalogen viste Klokke-kortet. Tastaturtest nådde pauseknappen via Tab og aktiverte pause/fortsett med Enter; pausetiden holdt seg uendret i 1,3 sekunder. Begge formatvalg oppdaterte knappen og `aria-pressed`. Ved 320, 768 og 1440 px var det ingen horisontal overflow. Nettverksopptak viste ingen forespørsler utenfor den lokale serveren, og siden rapporterte ingen JavaScript-feil. Manuell QA i en interaktiv nettleser er ikke utført.

Reproduser grunnlaget fra repo-roten ved å starte `python3 -m http.server 8000`, åpne `http://localhost:8000/vibe/klokke/` i Chromium og gjenta punktene ovenfor; kontroller også katalogkortet på `http://localhost:8000/vibe/`. Nettlesertesten brukte Playwright til viewport-målinger, tastaturinput, statuskontroll, nettverksopptak og JavaScript-feil.

PR-status for Issue #2: testene og lokal QA er dokumentert ovenfor; PR-en er ikke deployet, og live-rute etter deploy eierskap/rettighetsavklaring gjenstår.
