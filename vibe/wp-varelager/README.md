# WP Varelager · kildevurdering og syntetisk simulator

**Issue #2:** Delvis fremdrift gjennom en isolert kandidatvurdering. Dette lukker ikke Issue #2 og er ikke en full port eller utrulling.

## Kildebelegg

- **Arkivstatus:** `eirikyven-gif/Wp-varelager` er arkivert. Ingen filer i kilderepoet er endret.
- **Kildeversjon:** `main` SHA `e080136b7b0bc20e1885c9c9456f7143ca170861`, tree SHA `7506300fcd587546f7772e1cab4d55293bd7b947`. Committen 2026-03-07 legger til versjonspakka `wp-varelager_v2.3.0.zip`; pluginens entrypoint oppgir v2.3.0.
- **Kontrollerte blobs:** rot-README `89ac942d4e21c3a832c46d2feb9f232b5779592b` (18 byte); plugin entrypoint `efab8c606ffdeb94b01b414ab8a7728f16eb5aca`; kravspesifikasjon `28d9af847296819f89947ec6b83ac7e01def8853`; changelog `2c777661911f4c1cb306a84cb6224d5851c31511`.
- **Funksjonell kilde:** PHP-pluginen registrerer shortcode `[hu_inventory_portal]`, WordPress capabilities, installasjon og plugin-klasser. Kravspecen og changeloggen beskriver varer og unike enheter, kategorier, status/plassering, verdi, vedlegg, notater/instrukser, utleie/retur, rapporter, magiske leselenker, CSV/XLSX, bulk, oppstart, metadata og lageropptelling. Changeloggen for 2.3.0 beskriver detaljer for varer/enheter, vedlegg, notater og historikk.
- **Kildeteststatus:** Repositoriets workflow `build-release.yml` finnes. Ingen testmappe eller root testscript ble identifisert i den inspiserte trestrukturen; kildekode er ikke kjørt i WordPress-miljø.
- **Sammenligning med showcase:** På showcase main `b5e117c` var `/vibe/wp-varelager/` og katalogslug `wp-varelager` fraværende. Navnelikhet er altså ikke brukt som bevis for en tidligere kildekobling.
- **Rettigheter:** Plugin-entrypoint oppgir GPLv2-or-later. Separat lisensfil ble ikke funnet i den gjennomgåtte trestrukturen. Demoen gjenbruker ikke PHP, kildeaktiva eller ordrett kildetekst.

## Demoens funksjoner og grenser

Ruten viser syntetiske eksempelvarer. Søk, legg til, rediger, slett, juster lagerantall, vis verdioversikt og sammenlign opptalt antall fungerer lokalt i sidens minne. De syv portalområdene fra kildens changelog er representert som faner.

Dette er en avgrenset simulator, ikke full funksjonsparitet. Utleie/retur, delte lister og eksport er kun visuelle eksempler. Unike enheter, vedlegg, notater, revisjonshistorikk, full import/eksport, bulkhandlinger, oppstartveiviser, rolleadministrasjon og redigering av innstillinger er ikke implementert. Kildens nøyaktige UI-tekster er ikke kopiert; kildens README er nesten tom, og spesifikasjonens UI er ikke identisk med et komplett kjørbart grensesnitt.

Alle varer, koder, antall, steder, arrangører og beløp er oppdiktede og merket som syntetiske eksempler. En eventuell lokal CRUD-endring forsvinner ved omlasting.

## Sikkerhet og personvern

- Ingen WordPress-runtime, PHP, database, API, autentisering, roller, delingstokener eller session.
- Ingen ekte navn, e-post, telefon, kundedata, lokasjoner eller kildens inventar.
- Ingen opplasting, vedleggsbehandling, nettverksforespørsler eller persistent browser/serverlagring.
- Ingen kildehemmeligheter eller privat API-er.

## QA, risiko og utrulling

- **QA:** GitHub Actions `Vibe static validation` kjører `node --test tests/*.test.mjs`. Se CI for PR-en; lokale statiske kontroller kjøres før PR-opprettelse.
- **Risiko:** Hovedrisiko er å forveksle visuelle eksempler med fungerende WordPress-arbeidsflyter eller full kildeparitet. Ingen produksjonsdrift eller databehandling er uavhengig verifisert. Rettighetsgrunnlaget for andre kildeartefakter er uavklart.
- **Versjon:** Showcase VERSION følger repository SemVer; denne isolerte ruten er en patch/minor-endring uten produksjonsløfte.
- **Deploy:** Ikke deployet. PR skal ikke merges eller deployes som del av dette arbeidet. Etter eventuell senere godkjenning må direkte `/vibe/wp-varelager/`-rute, refresh og katalogruting kontrolleres.
