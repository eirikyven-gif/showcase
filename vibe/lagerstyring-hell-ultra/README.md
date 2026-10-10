# Lagerstyring Hell Ultra

Lokal, statisk demonstrasjon av Hell Ultra Lagerstyring: søk og filtrer lageroversikten, sorter eller grupper treff, bytt mellom kort og tabell, åpne en vare med utlånshistorikk og se en navngitt delt liste. Velg **Lageransvarlig (simulert)** for å endre status på en eksempellagervare i den aktive sideøkten.

## Rute og kilde

Showcase-ruten er `/vibe/lagerstyring-hell-ultra/`. Kilden er WordPress-pluginen `eirikyven-gif/lagerstyring-hell-ultra`, SHA `f1f13246677d15de24e84070d8dad74f2a0376ee`. Kildens portal vises på en WordPress-side som administratoren selv velger via `[hul_inventory_portal]`; dermed finnes ingen fast kilde-URL eller side-slug å kopiere. Kildens varepost-type bruker også `/lager-enhet/{post-slug}`; pluginen omdirigerer enkeltposten til varedetaljens magic-lenke. Detalj- og listelenkene bruker `/hul-lager/item/{32-tegns-token}` og `/hul-lager/liste/{32-tegns-token}`. Demoen mapper disse til `#/item/{syntetisk-id}` og `#/list/{lokal-liste-id}` under showcase-ruten. Dette er ruteekvivalenter for demonstrasjon, ikke WordPress-permalenker eller delbare tilgangstokens.

Den eksisterende `lagerkart-vinter`-demoen viser et rad-/meterkart for vinterlagrede kjøretøy. Den dekker ikke dette lagerets kategoriserte vareportal, varedetaljer eller delte lister og er ikke en duplikat.

## Innhold, personvern og sikkerhet

- Alle varer, kategorier, plasseringer, låntakere, datoer, ansvarlige, verdier og arrangementer er syntetiske. Ingen produksjonsdata, media eller hemmeligheter fra kilde er brukt.
- WordPress-brukerinnlogging, roller/capabilities og nonce er fjernet. Rollevelgeren er en ren lokal UI-simulator, ikke tilgangskontroll.
- Magic-linktoken-generering, lagring og validering er fjernet. URL-fragmentene inneholder kun lokale eksempel-ID-er.
- Statusendringer for simulert lageransvarlig finnes kun i JavaScript-minne og nullstilles ved omlasting. Ingen cookies, localStorage/sessionStorage, server/API, tredjepartsressurser eller nettverkskall brukes.
- Ingen opplasting, dokument-/bildevisning fra kildens private medielager, XLSX-import/eksport eller reell lånebehandling. Utlån og historikk vises som syntetisk, skrivebeskyttet eksempelinnhold.

## Kjør lokalt

Fra repo-roten: `python3 -m http.server 8000`, åpne `http://localhost:8000/vibe/lagerstyring-hell-ultra/`.

## QA og publisering

Automatiserte route/safety checks kjøres med `node --test tests/lagerstyring-hell-ultra.test.mjs`; kjør også full CI-kommandolinje `node --test tests/*.test.mjs` og `git diff --check`. QA-status og resterende risiko føres i PR-beskrivelsen. Ruten ikke publisert; deploy krever vanlig godkjent deployflyt etter merge.
