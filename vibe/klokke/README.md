# Klokke

En tydelig, selvstendig klokke på `/vibe/klokke/`, laget som en lokal demo av Klokke-funksjonen. Den viser enhetens lokale dato og tid på norsk, med knapper for pause/fortsett og 12-/24-timersformat. Kontrollene finnes bare i minnet og nullstilles ved ny innlasting.

Kildeappen bruker felles CSS og JavaScript fra `apps/_shared/` og lenker tilbake til `../tidteller/index.html`. Disse avhengighetene og portalnavigasjonen er utelatt fordi de ikke hører hjemme i den offentlige, isolerte ruten. Kopien er ren HTML, CSS og nettleser-JavaScript med bare delte, offentlige Vibe-stiler. Ingen backend, auth, nettverkskall, nettleserlagring, informasjonskapsler, analyse, sporing eller personopplysninger brukes. Tid hentes fra enhetens klokke.

## QA-punkter

- Åpne `/vibe/klokke/` direkte og bekreft at dato og klokkeslett oppdateres på norsk.
- Pause og fortsett klokken; bytt mellom 12- og 24-timersformat.
- Bruk tastatur til å nå kontrollene og bekreft synlig fokus og oppdatert status.
- Kontroller smale og brede visninger, inkludert 320 px bredde.
- Bekreft at siden ikke gjør eksterne forespørsler eller lagrer data.

## Utført nettleser-QA

Automatisert nettleser-QA kjørt lokalt 2026-10-08 i Chromium 151.0.7922.173 med Playwright 1.62.1, mot en Python HTTP-server fra repo-roten. Direkteruten svarte 200, dato og klokkeslett ble vist, og Vibe-katalogen viste Klokke-kortet. Tastaturtest nådde pauseknappen via Tab og aktiverte pause/fortsett med Enter; pausetiden holdt seg uendret i 1,3 sekunder. Begge formatvalg oppdaterte knappen og `aria-pressed`. Ved 320, 768 og 1440 px var det ingen horisontal overflow. Nettverksopptak viste ingen forespørsler utenfor den lokale serveren, og siden rapporterte ingen JavaScript-feil. Manuell QA i en interaktiv nettleser er ikke utført.

Reproduser grunnlaget fra repo-roten ved å starte `python3 -m http.server 8000`, åpne `http://localhost:8000/vibe/klokke/` i Chromium og gjenta punktene ovenfor; kontroller også katalogkortet på `http://localhost:8000/vibe/`. Nettlesertesten brukte Playwright til viewport-målinger, tastaturinput, statuskontroll, nettverksopptak og JavaScript-feil.
