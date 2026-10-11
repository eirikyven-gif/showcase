# Inntekter og kostnader

En kildebasert, lokal demonstrasjon av arbeidsflyten i den opprinnelige Excel-appen. Rute: `/vibe/inntekter-kostnader/`.

## Kilde og funksjonsparitet

- Kildecheckout: `eirikyven-gif/diverse-apper`, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (2026-10-07). Kildens appmappe er `apps/inntekter-og-kostnader/`; undersøkte `README.md`, `index.html`, `assets/Registrering.bas`, `assets/Bruksanvisning.txt`, `assets/ThisWorkbook_events.txt` og arbeidsboken `assets/oversikt_inntekter_kostnader.xlsm` (arknavn og oppsett lest uten å kjøre makroer).
- Showcase-demoen gjenskaper sentrale funksjoner i årsarket: registrere, endre og slette poster; velge måned og dato; legge til kategorier; se inntekter først; beregne inntekter, utgifter og rest per måned; summer per kategori gjennom året; definere faste poster og legge dem inn én gang; opprette neste årsark.
- Faste poster i kilden legges automatisk inn ved åpning/månedsskifte, med sluttdato og deduplisering. Demoen viser opprettelse og manuell engangsinnlegging av faste eksempelposter. Den lager ikke bakgrunnshendelser eller automatisk gjentakelse.
- Originalens Excel-knapper og regnearkformler er erstattet med nettleserinteraksjoner. Månedlige summer per kategori og år er beregnet fra postene; demoen viser ikke hver enkelt Excel-formel eller arkbeskyttelse.

## Sikkerhets- og personvernerstatninger

- Alle forhåndsutfylte kategorier og beløp er syntetiske; UI-en ber om ikke å skrive inn ekte økonomiske/personlige opplysninger.
- Oppføringer, nye kategorier, faste poster og nytt år lever bare i JavaScript-minne. Reload/nullstilling skjer ved oppdatering eller lukking. Ingen `localStorage`, `sessionStorage`, IndexedDB, cookies, nettverkskall eller serverlagring.
- Ingen innlogging, brukerkontoer, private API-er, betalinger, eksport, opplasting eller reelle makroer. Kildens XLSM, ZIP, VBA og veiledning kopieres ikke inn eller lenkes.

## Kildeinventar og usikkerhet

- Kilden er en statisk nedlastingsside for en makroaktivert Excel-arbeidsbok med VBA. Arbeidsboken lagrer brukeropplysninger lokalt i brukerens fil. Ingen innlogging eller API-avhengighet er beskrevet; nettsidens manuelle nedlasting av veiledning finnes ikke i demoen.
- Ingen appversjon/release-tag, appspesifikk testkommando eller lisens/gjenbrukstillatelse ble funnet i kildecheckoutet. Excel- og VBA-kompatibilitet er ikke testet; kildemakroer ble ikke kjørt. Gjenbruk av kildens makroartefakter er utelatt.
- Økonomiopplysninger er sensitive. Demoen er ikke regnskap eller økonomisk rådgivning.

## Verifikasjon

- Appens statiske kontroll ligger i `tests/vibe-static.test.mjs`; den kontrollerer katalogrute, de sentrale arbeidsflytene, syntetiske data og fravær av nettverk/lagring.
- Chromium-kontroll på 390 og 1280 px bekreftet registrering, redigering, sletting, engangsinnlegging av fast post, nytt år og nullstilling etter reload. Ingen JavaScript-feil eller eksterne forespørsler; ingen horisontalt sideoverløp på mobil. Tastaturflyt/skjermleser er ikke manuelt kontrollert.
- Produksjonsdeploy gjøres av koordinator etter samlet godkjenning. Denne endringen endrer ikke `VERSION`.
- Issue #2: delvis løst.
