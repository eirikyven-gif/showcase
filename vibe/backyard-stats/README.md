# Backyard løpsoversikt (konseptdemo)

| Felt | Vurdering |
|---|---|
| Audience | Løpsarrangører, deltakere, publikum og OBS-/skjermvisningsansvarlige. |
| Slug | `backyard-stats` · `/vibe/backyard-stats/` |
| Status | Beholdt i bred førstegangsvurdering; original, statisk visualiseringsprototype laget. Ingen kuratering eller utsiling. |
| Demo value | Illustrerer hvordan rundetider, fremdrift og en resultatliste kan samles i en lesbar løpsoversikt. |
| Simplifications | Én fast oversikt med syntetiske verdier, fire oppdiktede kallenavn og et statisk søylediagram. Ingen liveoppdatering, filtre, deltakerprofiler, innlesing, OBS-integrasjon eller eksport. |
| Privacy | Ingen personopplysninger eller kildedata. Ingen innlogging, lagring, input, nettverkskall eller eksterne tjenester. |
| Scope | Selvstendig HTML/CSS på den statiske showcase-ruten. Ingen API, server, JavaScript, hemmeligheter eller persistens. |

## Kildegjennomgang og usikkerhet

Kandidatens kilde ble inspisert skrivebeskyttet. Kilden ser ut til å bestå av HTML/JavaScript og en WordPress-wrapper for løpsstatistikk, OBS og innbygging. Dette er bare grunnlag; faktisk kjøremiljø, Race Result API-tilgang, API-kontrakt og datamodell er ikke bekreftet. Ingen API-er, testadresser eller operative tjenester ble besøkt. Prototypen er laget fra grunnen av og påstår ikke å vise live data eller å være kompatibel med Race Result.

## Kontroll og begrensninger

Direkterute, mobilvisning, tastatur og tilgjengelighet, konsoll, nettverk og lagring må gjennomgås før en eventuell publisering. API/runtime og rettigheter er fortsatt uavklart. Denne leveransen løser Issue #2 delvis: den bidrar med én vurdert konseptdemo til den brede førstegangsrunden, uten å kuratere bort kandidaten.
