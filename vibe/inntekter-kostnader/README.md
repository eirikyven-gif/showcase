# Inntekter og kostnader

## Første vurdering

- **Navn:** Inntekter og kostnader
- **Bruksområde:** Vise registreringer, månedsoversikt og faste poster for inntekter og utgifter.
- **Kategori:** Økonomi
- **Målgruppe:** Alle som vil se et enkelt eksempel på månedsoversikt.
- **Kildestatus:** Aktiv statisk nedlastingsside for en makroaktivert Excel-arbeidsbok. Kildesiden forklarer lokal Excel-registrering, månedssummer og faste poster. Ingen arbeidsbok eller makrokode kopieres hit.
- **Foreslått slug:** `inntekter-kostnader`
- **Demoverdi:** Gjør sammenhengen mellom inntekter, utgifter, saldo og faste poster synlig uten regnearkprogram.
- **Forenklinger:** Viser tre forhåndsdefinerte måneder med fiktive beløp. Ingen fritekstregistrering, kontooppsett, Excel/VBA, nedlasting, eksport eller reelle betalinger.
- **Risiko:** Økonomi er et sensitivt tema; eksempeltall og poster må forbli tydelig syntetiske. UI-en må ikke antyde at den håndterer faktiske penger eller lagrer regnskap.
- **Omfang:** En statisk rute på `/vibe/inntekter-kostnader/` med lokal månedvelger, summer, eksempelposter og faste eksempelposter.

## Sikkerhet og QA

Alt innhold er statiske HTML/CSS/JS-filer. Ingen innlogging, brukerinnsending, serverlagring, nettverkskall, nettleserlagring, private API-er eller eksterne ressurser. Månedsvelgeren endrer kun innhold i minnet. Posttekst settes med `textContent`. Tallene er oppdiktede demoverdier.

Kontrollert med `node --test tests/vibe-static.test.mjs`; manuell HTTP-rutekontroll utføres før PR. CI og produksjonsdeploystatus oppgis i PR-en etter at GitHub har kjørt workflowene. Ingen offentlig deploy er utført av denne PR-en.
