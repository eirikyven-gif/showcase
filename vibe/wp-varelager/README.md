# WP Varelager · lokal funksjonssimulering

**Issue #2:** Delvis fremdrift. Dette er en isolert demonstrasjon på `/vibe/wp-varelager/`, ikke en utrulling eller full WordPress-port. PR #90 skal forbli draft fram til kildearbeidsflytene og QA er gjennomgått.

## Kildebelegg

- `eirikyven-gif/Wp-varelager` er arkivert. Kilderepoet er ikke endret.
- Inspisert kilde `main`: commit `e080136b7b0bc20e1885c9c9456f7143ca170861`, tree `7506300fcd587546f7772e1cab4d55293bd7b947`.
- Plugin-entrypoint blob: `efab8c606ffdeb94b01b414ab8a7728f16eb5aca`. Changelog blob: `2c777661911f4c1cb306a84cb6224d5851c31511`. Rot-README er bare 18 byte (`89ac942d4e21c3a832c46d2feb9f232b5779592b`); pluginens `readme.txt` og PHP-implementasjon/Portal_Shortcode ble derfor også inspisert. Koden implementerer en funksjonell WordPress-plugin; slug-likhet ble ikke brukt som bevis for slektskap.
- Showcase-baseline `b5e117cfe6d08f94ed9128523a854218b9d03009` hadde verken denne ruten eller katalogoppføringen.
- Kildens portal har sju områder: Utstyr, Utleie, Rapporter, Delte lister, Import/eksport, Lageropptelling og Innstillinger. Kilden har også speilede admin-sider for utstyr, utleie og innstillinger.

## Dekning i demoen

| Kildeområde | Lokalt representert funksjon |
| --- | --- |
| Utstyr | Søk, kategori/status/plassering/løp-filter, gruppering, tabell/galleri, vare CRUD, bulkstatus/-plassering/-notat, eksport og lagerjustering. Varedetaljer viser verdier, løp, instruks, egenskaper og historikk. |
| Enheter | Serienummer, status, plassering, tilstand, CRUD, detaljvisning, notater, vedleggsreferanser og historikk. |
| Utleie | Leietaker CRUD og syntetisk mailto, avtaleveiviser, linjer, kladdredigering, aktivering, utlånsantall, retur og returmerknad. |
| Rapporter | Oppsummeringer per kategori, status og plassering, verdier og aktive avtaler. |
| Delte lister | Filter, forhåndsvisning, opprettelse og tilbakekalling av lokale demoposter. Ingen offentlig lenke eller token opprettes. |
| Import/eksport | Lokal CSV-import, syntetisk CSV-mal og XLSX-nedlasting laget i nettleseren. Importen validerer obligatoriske SKU/navn og oppdaterer matchende SKU. |
| Lageropptelling | Registrer opptalt antall, differanse, årsak og lokal historikk. |
| Innstillinger | Førstegangsoppsett, kategorier, plasseringer, statuser, løp, vedleggskategorier og egendefinerte metadatafelt med CRUD. In-use-sjekker hindrer enkelte ugyldige slettinger. |
| Admin-snarveier | Åpner de lokale Utstyr-, Utleie- og Innstillinger-visningene. |

Handlinger endrer bare JavaScript-data i sidens minne. Eksempeldata er oppdiktede og merket syntetiske; endringer forsvinner ved omlasting. Kildens funksjonstekster og felter er representert på norsk der det er relevant, men denne demoen er ikke en bit-for-bit gjengivelse av pluginens WordPress-grensesnitt.

## Avgrensninger og sikkerhet

- Ingen WordPress-runtime, kontoer, autentisering, roller eller tilgangskontroll. Innlogging og capability-administrasjon er ikke eksponert som lokale flows.
- Ingen server, database, browser persistence, API, private API-er eller hemmeligheter.
- Ingen opplasting eller lagring av privat media. Vedlegg er lokale syntetiske filnavn/-referanser; «Vis» viser metadata, ikke filinnhold.
- Delte lister er lokale eksempler uten magic link, URL, token eller ekstern lesetilgang.
- Kontaktopplysninger er syntetiske; e-post bruker `.invalid`, telefon og adresse er tydelig fiktive. Mailto åpner ingen reell mottaker.
- CSV leses kun lokalt i nettleseren. Eksportfilen består av syntetiske eksempeldata.

## QA, risiko og levering

- Automatiske kontroller: `node --test tests/wp-varelager.test.mjs` og repository CI `node --test tests/*.test.mjs`.
- Manuell browser-QA: direkte rute og refresh ved 390px og 1440px; vare/enhetsdetaljer, notat, leieavtale fra kladd til aktiv og retur, kontakt CRUD, opprett delingsdemopost, CSV-import, XLSX-nedlasting, lageropptelling og innstillings-CRUD. Kontrollerte horisontal overflow, JavaScript-feil og uventede eksterne forespørsler. XLSX-arkivet ble også kontrollert med `unzip -t`.
- Risiko: en lokal simulering kan se ut som ekte flerbrukerfunksjon; UI-et varsler derfor at data er midlertidige og at lenker/media ikke opprettes. WordPress-integrasjon, tilgangskontroll og faktisk filbehandling må vurderes separat dersom en senere port ønskes.
- Showcase-katalog og SemVer er oppdatert i PR-grenen; versjonsrebasering er utsatt til de andre pågående merge-endringene er landet.
- Ikke deployet og skal ikke merges eller deployes gjennom denne oppgaven. Issue #2 forblir delvis løst.
