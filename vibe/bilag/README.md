# Bilagssortering

## Kilde og samsvar

Dette er en interaktiv, statisk showcase-kopi av den aktive Google Apps Script-appen i `eirikyven-gif/forsikring-bilag`, undersøkt på `main` commit `f32f92ed00d1286e25e9cc7a0454ba1ad8c579eb` (2026-08-17). Den aktive appen ligger i `app/bilagsregister.gs` og `app/bilagsregister-core.gs`; repoets `README.md`, `app/README.md` og `docs/bilagssortering.md` beskriver arbeidsflyten. Kun aktiv kode ble brukt som referanse; `arkiv/` er historisk og ble ikke kopiert. Kilde-repoet er kun lest.

Demoen gjengir hovedflyten: start/fortsett en kø i batcher, idempotent behandling av eksempler, klassifisering til Løsøre og Drift, radvis menneskelig X-vurdering, manuell flytting mellom fanene med konfliktbevaring, append-only kjøringslogg, stopp/gjenopptak og bekreftet full nullstilling som bevarer loggen. Kategori, varetekst, begrunnelser, status og syntetiske resultatlinjer er eksplisitt oppdiktet og illustrerer kildekontraktene; de er ikke kopiert fra virkelige bilag eller produsert av en KI-modell. Demoen utfører ikke OCR, Gemini-analyse, fakturavalidering, SHA-/fakturadublettkontroll eller faktisk Google-tjenestekall.

## Sikkerhetsgrense

- Ingen kildefiler kjøres eller distribueres. Bare statisk HTML, CSS og JavaScript i `/vibe/bilag/`.
- Ingen Drive-, Sheets-, Apps Script-, Gemini- eller andre API-kall, nettverksforespørsler, filopplasting, nedlasting eller dokumentlesing.
- Kilde-ID-er, fil-ID-er, API-nøkler, leverandørdata og andre kildehemmeligheter er utelatt. Alle personer, leverandører, bilag, datoer, varelinjer og beløp er syntetiske.
- Demoen bruker ingen innlogging, cookies eller serverlagring. Nettleserlagring under `vibe.bilag.demo.v1` beholder bare køstatus, syntetiske rader og demologg for gjenopptak. «Nullstill demo» krever bekreftelse, starter eksempeldata på nytt og bevarer loggen, tilsvarende kildeflyten. Fjern nøkkelen med nettleserens nettstedslagring om ønskelig.
- X-feltene starter tomme. Appen tar aldri stilling til eierskap, lagerstatus, tilstedeværelse eller skadeomfang; markeringene er brukerens demonstrasjon.
- Nullstilling beskrives og simuleres kun på syntetisk nettlesertilstand. Ingen regneark, filer eller kildedata kan påvirkes.

## Kildefunksjoner og begrensninger

Kildens operative kontroller omfatter verifisering/migrering av regnearkoppsett, rekursiv Drive-lesing, støttet filvalidering, SHA-256 og fakturadublettkontroll, Gemini-uttrekk og dokumentbevisvalidering, kategoristyrt fanemål, pending-write/gjenopptak, teknisk sikkerhetsstopp, manuelle Rad-ID-flyttinger, kjøringslogg, stopp og bekreftet full-nullstilling. Demoflaten bevarer de brukerrettede arbeidsflytene ovenfor, men erstatter alle produksjonsintegrasjoner og algoritmiske kontroller med fast, lokalt syntetisk eksempelinnhold. Dermed er den funksjonell som arbeidsflytdemo, ikke som regnskapsverktøy eller dokumentbehandler.

## QA

Showcase-kontroller: `node --test tests/bilag-source-faithful.test.mjs`, `node --check vibe/bilag/app.js`, `git diff --check`, og repoets CI-validering av katalog/ruter. Kildens `node --test tests/*.test.js` kan kontrollere kildekode med mocks, men tester ikke showcase-porten eller Google Apps Script-produksjonsressurser. Ingen kildeintegrasjon eller produksjonsdeploy inngår.
