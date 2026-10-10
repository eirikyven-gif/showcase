# Gårdsbehov · syntetisk arbeidsflytdemo

## Kilde og formål

- Kilde: `eirikyven-gif/apps-fornes-gard/apps/gardsbehov`, offentlig `main` commit `90014358fb3d70e89265b2b30d38e9376a6927b2` (lest 2026-10-10), appversjon 0.20.1. Kilderepoet er kun inspisert.
- Kilde-README og frontend er gjennomgått. Kilden beskriver komplett innmelding og saksflyt: registrering, konsekvens/hast/HMS-prioritet, Mine saker, scope-avgrenset fellesoversikt, filtre, vurdering, tildeling, notater, statusflyt, ferdigkontroll, lukking og arkiv. Den har også bilderedigering/opplasting, offentlig innmelding/statuslenke, magisk innlogging, e-post og omfattende administrasjon.
- Denne eksisterende ruten (`/vibe/gardsbehov-fornes/`) er gjort om fra en oppdiktet enkeltsaksvisning til en interaktiv, funksjonell demo av kjerneflyten. Den beholder syntetiske eksempelsaker, saksliste, saksdetalj, prioriteringsgrunnlag og hendelser. Nye eksempelmeldinger, rollebaserte visningshandlinger, tildeling, statusovergang, notat, søk/filtrering og arkiv er lagt til.
- Prioritet følger kildens formel: produksjon/drift × hast + HMS/sikkerhet. Alle tre skalaene går fra 0 til 3, og kildeappens nivågrenser er brukt: 0 ingen utslag, 1–2 lav, 3–5 middels og 6 eller mer høy. Maksimal skår i kildemodellen er 12. Beregningen er lokal illustrasjon og har ingen operativ virkning.

## Erstattede eller utelatte deler

- Innlogging, sessions, rollerettigheter, nonce-/tokenflyt og autorisasjon er fjernet. Rollevelgeren simulerer bare hvilke knapper som vises; den er ikke sikkerhetskontroll.
- MariaDB, serverlagring, API-er, private tabeller/filområder, ratebegrensning, idempotens og audit er fjernet. Demoen lagrer bare syntetiske saker i én `localStorage`-nøkkel. Nullstillingsknappen fjerner denne nøkkelen og gjenoppretter startdata. Hvis nettleseren blokkerer lagring, fortsetter økten i minnet.
- Ingen bildevalg, kamera, opplasting, filvisning, kontaktfelt, fritekst, ekte stedsliste, kontoer, offentlig statuslenke, e-post, ekstern aktørdata, API-kall eller eksterne ressurser er med. Kildens adminfunksjoner for kontekster, kategorier, brukere, roller og scope er forklart som funksjonsområder, ikke aktivert.
- Alle ID-er, beskrivelser, steder, roller, tidsangivelser og statusdata er syntetiske. Brukere varsles tydelig om ikke å bruke demoen med reelle personopplysninger, HMS-informasjon, bilder eller driftsmeldinger.

## QA, kontroller og begrensninger

- Showcase-kontroller: `node --check vibe/gardsbehov-fornes/app.js`; `node --test tests/*.test.mjs`; repository CI på PR.
- Manuell QA: kontroller direkterute, tab-keyboard, registrering, beregning, rollebytte, tildeling, status, hendelseslogg, filter, arkiv, reset og localStorage-tilgjengelighet. Kontroller 320/390 px og desktop, tastaturfokus og redusert bevegelse.
- Nettverks-/personvernkontroll: bare same-origin HTML/CSS/JS; appskriptet bruker ikke `fetch`, XHR, cookies eller API. Nettleserlagring er begrenset til den synlige syntetiske demoen og kan nullstilles fra siden.
- Kildetestene ble ikke kjørt; de krever PHP, database, tjenester og fixtures utenfor showcase. Showcase CI og lokalt definerte kontroller gjelder kopien.
- Risiko/begrensning: rolle- og saksflyt er klientbasert simulering, og lokal prioritet/hendelseshistorikk er ikke en revisjonslogg. Kildens sikkerhet, drift, personvern, tillatelser og reelle dataflyt er ikke revidert. Ingen kildeassets eller hemmeligheter er kopiert.

## Leveranse

- Issue #2 delvis løst ved å gjøre den eksisterende kandidaten mer tro mot verifisert kilde.
- Showcase-baseline: `65b8f90`, `VERSION` 0.52.0; foreslått minorversjon 0.53.0.
- PR endrer bare `/vibe/gardsbehov-fornes/`, katalogoppføringen og `VERSION`.
- Ingen merge eller deploy utført. Ved godkjenning kan eksisterende Vibe-deploy først kjøres som `dry_run=true`; verifiser etter eventuell senere deploy rute, statiske ressurser og katalogkort.
