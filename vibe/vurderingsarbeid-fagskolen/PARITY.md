# Vurderingsarbeid: kildeparitet

Kilde: `eirikyven-gif/app-vurderingsarbeid`, commit `73cb9eded2f6517e3ebfbed45bdaf8e70395dac3`. Sammenligningen er gjort mot `app/vurderingsverktoy.html`, `docs/ssot/ssot_vurderingsverktoy_v0.1.17.md` og `docs/ki/KI_DATAGRUNNLAG_OG_FALLBACK.md` ved denne committen. Kildecheckout forble uendret.

## Dekningsmatrise

| Kildeområde | Kildebevis | Showcase-implementasjon | Dekning |
|---|---|---|---|
| Rubrikk og vurdering | `app/vurderingsverktoy.html:252-280, 1670-1801`; SSoT `6.1-6.4`, KRF-1–64 | Kriterienavigasjon, svaralternativ/poeng, vekting, samlet indikator, K0 og notater per punkt/kriterium | Bevart |
| Excel-mal, import og kontroll | HTML `344-358`; SSoT `6.2`, KRF-70–80 | Samme hovedløp med arbeidsbok, importkontroll, blokkere/advarsler og bevaring av siste gyldige arbeidsøkt | Bevart |
| Oppgavetekst og rubrikkgrunnlag | HTML import parser ved `app/vurderingsverktoy.html:980-1026`; SSoT KRF-47–49 | Excel-ark Oppgavetekst importeres, lagres og vises; inngår i promptgrunnlag | Bevart |
| Datasett per kull | SSoT `6.9`, KRF-74–75 | Import/eksport av kullarbeidsbok, svar, stikkord og resultatmetadata | Bevart |
| Student- og kullflyt | SSoT `6.7`; HTML `2925-3240` | Oversikt, søk/indikator/progresjon/K0-filtre, opprett/switch kull, flytt med ID-konfliktkontroll | Bevart |
| Vurderingsreset og personvernreset | HTML `3102-3198`; showcase `resetDemoData` | Bekreftet individuell vurderingsreset; full lokal «Nullstill demo» | Bevart + lokal sikkerhetskontroll |
| Oppsummering/eksport | HTML `326-339, 2482-2538`; SSoT KRF-57–64 | Tekstlig oppsummering og kopiering; godkjent slutttekst kan følge eksport, ikke uavklart sluttutkast | Bevart |
| Underveis-fremovermelding | HTML `282-299, 2030-2065, 2397-2456`; SSoT KRF-65, 69a–d, 82–84, 91, 98–101 | Manuell knapp; lokal deterministisk strukturtekst med styrker/fremdrift, mangler og neste steg; redigerbar, per student, lagret og nullstillbar | Bevart som merket lokal simulering |
| Sluttvurdering | HTML `301-323, 1803-1830, 2458-2477`; SSoT KRF-66–69, 97, 99, 122 | Sperret til ordinære punkt er besvart; strukturert redigerbart utkast, kopi, eksplisitt «Godkjenn som slutttekst»; K0-status tas med | Bevart som merket lokal simulering |
| Prompt/manual fallback | HTML `2081-2129, 2334-2429`; KI-notat `24-76` | Samme grunnlagstyper (oppgave, alle rubrikkpunkt/svar, ikke besvart, stikkord, indikator og K0); forhåndsvisning før valgfri kopiering | Bevart; ingen automatisk deling |
| KI-innstillinger | HTML `360-415, 2580-2735`; SSoT KRF-103–121 | Egen KI-støttefane med lokal styringstekst, lagring og reset; ingen provider-konfigurasjon eller test av ekstern tjeneste | Delvis, sikkerhetskritisk utelatt |
| Person-/konto-/serverdata og secrets | KI-notat `66-76`; SSoT KRF-93, 104–121 | Syntetiske standarddata; ingen autentisering, konto, server, API-nøkkel, leverandørendepunkt, fetch/XHR eller eksterne ressurser; localStorage varslet og kan slettes | Fjernet med lokal erstatning |

## Presise forskjeller/gjenstående gap

- Ekte Gemini/OpenAI/Claude-generering er ikke implementert. Den lokale «Generer»-handlingen bygger kun nøkterne, regelbaserte utkast av registrerte svar/indikator/K0. Dette er ikke en språkmodell og gir ikke KI-kvalitet. Dette er en bevisst sikkerhetsgrense; derfor er Issue #2 fortsatt merket delvis løst.
- Provider/model-valg, API-nøkkellagring/visning/fjerning, ekstern oppsettstest, tidsstempler og leverandørfeilkategorier er fjernet, ikke simulert som falske vellykkede tjenester. Innstillingspanelet beholder redigerbar global styringstekst og lokal reset; lokale innstillinger lagres i samme lokale arbeidsdata.
- Manuell promptkopiering kan føre vurderingsgrunnlag ut av nettleseren først hvis brukeren selv limer det inn et annet sted. Varsel vises både ved funksjonen og før kopiering. Standarddata er syntetiske; egne importer kan likevel inneholde sensitive personopplysninger.
- Ingen lisens eller eksplisitt tillatelse til gjenbruk ble identifisert i de undersøkte kildefilene.

## Kontrollpunkter

- Exact source SHA og katalogversjon testes i `tests/vurderingsarbeid-source-faithful.test.mjs`.
- Ingen kildefiler ble endret.
- Runtime kontrolleres for nettverkskall, leverandør-URL-er, nøkler og CDN.
- Full suite/browser-QA-status skal registreres ved PR-review. Draft skal beholdes inntil parity og sikkerhetskontroller er gjennomgått.
