# Backyard løpsoversikt (konseptdemo)

| Felt | Vurdering |
|---|---|
| Use case | Utforsk en statisk visning av oppdiktede rundetider, fremdrift og stilling. |
| Category | Sport og arrangement. |
| Audience | Løpsarrangører, deltakere, publikum og OBS-/skjermvisningsansvarlige. |
| Slug | `backyard-stats` · `/vibe/backyard-stats/` |
| Status | Beholdt i bred førstegangsvurdering; original, statisk visualiseringsprototype laget. Ingen kuratering eller utsiling. |
| Demo value | Illustrerer hvordan rundetider, fremdrift og en resultatliste kan samles i en lesbar løpsoversikt. |
| Simplifications | Én fast oversikt med syntetiske verdier, fire oppdiktede kallenavn og et statisk søylediagram. Ingen liveoppdatering, filtre, deltakerprofiler, innlesing, OBS-integrasjon eller eksport. |
| Privacy | Ingen personopplysninger eller kildedata. Ingen innlogging, lagring, input, nettverkskall eller eksterne tjenester. |
| Scope | Selvstendig HTML/CSS på den statiske showcase-ruten. Ingen API, server, JavaScript, hemmeligheter eller persistens. |

## Kildegjennomgang og usikkerhet

Kandidatkilden `eirikyven-gif/Backyard` ble lest skrivebeskyttet ved offentlig main commit `321612ee397b7a5f1651fbb429af8b2b1be4ad77` (2026-10-09). Repoet sier uttrykkelig at det foreløpig er grunnlag/styringsstruktur, ikke et ferdig produkt. De faktiske appfilene er tre tomme HTML-shells for skjerm, embed og OBS, en PHP WordPress-wrapper og arkitektur-/kravdokumenter. Race Result er planlagt datakilde med polling maks én gang per minutt; API-kontrakt, endepunkt, autentisering og appmotor er ikke implementert eller verifisert. Ingen API eller operative tjenester ble besøkt. Kilde-repoet er urørt.

## Kontroll og begrensninger

Chromium coordinator QA: direct route and refresh worked at 390px and 1440px; the page had no horizontal overflow, JavaScript errors, off-site requests, or browser storage. Keyboard focus reaches the skip link and hub-return link; keyboard activation returns to the hub. The visual chart has an accessible text alternative. Kildens fremtidige API/runtime og lisensdekning utover WordPress-wrapperen er uavklart; dette er en original, statisk visningsdemo. Denne leveransen løser Issue #2 delvis: den bidrar med én vurdert konseptdemo til den brede førstegangsrunden, uten å kuratere bort kandidaten.
