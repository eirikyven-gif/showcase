# Stoppeklokke

En statisk stoppeklokke på `/vibe/stoppeklokke/`, basert på den gjennomgåtte Stoppeklokke v1.2.0-funksjonaliteten. Start, pause/fortsett, nullstill og registrering av rundetid er implementert i vanlig HTML, CSS og JavaScript.

Stoppeklokken måler forløpt tid med `performance.now()`. Rundelisten viser både samlet tid og tiden siden forrige runde. Klokke og rundetider holdes bare i minnet mens fanen er åpen; tilbakestilling og sideinnlasting tømmer dem.

Siden bruker ingen innlogging, serverlagring, personopplysninger, hemmeligheter, private tjenester eller API-kall. Den bruker ikke `localStorage`, `sessionStorage`, cookies, IndexedDB, nettverksforespørsler, eksterne biblioteker eller sporing. Det finnes ingen demooppføringer; alle målinger opprettes av den som bruker verktøyet.

## QA og statiske kontroller

- Katalogkortet lenker til `/vibe/stoppeklokke/`, med kanonisk avsluttende skråstrek.
- Start, pause, fortsett, runde og nullstill fungerer med museklikk og tastatur.
- Rundene får fortløpende nummer og viser samlet tid samt rundens deltid.
- Tid og rundeliste starter på nytt etter innlasting; ingen nettleserlagring brukes.
- Kontrollene har tilgjengelige navn, fokusmarkering, statusmeldinger og responsiv utforming.
- Kjør `node --test tests/vibe-static.test.mjs` fra rotmappen for repoets statiske validering.

Manuell QA kan gjenskapes lokalt med `python3 -m http.server 8000` fra rotmappen og besøk på `http://localhost:8000/vibe/stoppeklokke/`. Kontroller også kataloglenken fra `/vibe/` og smale visninger.
