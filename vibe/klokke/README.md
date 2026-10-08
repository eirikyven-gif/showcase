# Klokke

En tydelig, selvstendig klokke på `/vibe/klokke/`, laget som en lokal demo av Klokke-funksjonen. Den viser enhetens lokale dato og tid på norsk, med knapper for pause/fortsett og 12-/24-timersformat. Kontrollene finnes bare i minnet og nullstilles ved ny innlasting.

Kildeappen bruker felles CSS og JavaScript fra `apps/_shared/` og lenker tilbake til `../tidteller/index.html`. Disse avhengighetene og portalnavigasjonen er utelatt fordi de ikke hører hjemme i den offentlige, isolerte ruten. Kopien er ren HTML, CSS og nettleser-JavaScript med bare delte, offentlige Vibe-stiler. Ingen backend, auth, nettverkskall, nettleserlagring, informasjonskapsler, analyse, sporing eller personopplysninger brukes. Tid hentes fra enhetens klokke.

## QA-punkter

- Åpne `/vibe/klokke/` direkte og bekreft at dato og klokkeslett oppdateres på norsk.
- Pause og fortsett klokken; bytt mellom 12- og 24-timersformat.
- Bruk tastatur til å nå kontrollene og bekreft synlig fokus og oppdatert status.
- Kontroller smale og brede visninger, inkludert 320 px bredde.
- Bekreft at siden ikke gjør eksterne forespørsler eller lagrer data.
