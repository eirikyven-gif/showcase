# Gårdsbehov · første vurdering og syntetisk demo

## Katalogvurdering

- **Navn:** Gårdsbehov.
- **Bruksområde:** Se et syntetisk eksempel på melding, prioritering og oppfølging av et gårdsbehov.
- **Kategori:** Gårdsdrift.
- **Målgruppe:** Gårdsbruk, driftsansvarlige og alle som vil utforske en enkel driftsflyt.
- **Kildestatus:** Aktiv, selvstendig app i et privat monorepo. Kildeversjon inspisert: 0.20.1. README beskriver komplett saksflyt med appinnlogging, brukerroller, session, MariaDB, privat vedleggslagring, e-post-outbox, offentlige statuslenker og offentlig innmelding.
- **Status:** Beholdt i bred førstegangsvurdering; syntetisk statisk demo laget. Ingen kuratering eller utsiling.
- **Foreslått slug/rute:** `gardsbehov-fornes` · `/vibe/gardsbehov-fornes/`.
- **Demoens verdi:** Følg én fiktiv vedlikeholdssak fra melding via prioriteringsgrunnlag til mulig neste steg. Viser sakskontekst, status, prioriteringsfaktorer og hendelseslinje.
- **Forenklinger:** Én oppdiktet sak om en portlås på et tenkt sted, én fiktiv eksempelrolle og to statiske hendelser. Ingen registrering, vedlegg, meldinger, tildeling, e-post, innlogging, API, database eller faktisk statusendring. Prioritetseksempelet er en illustrasjon, ikke en operativ beregning.
- **Avhengigheter:** Kildeappen beskriver PHP-runtime, MariaDB, privat fillager, app-session og e-postkonfigurasjon. Ingen av disse avhengighetene finnes i demoen.
- **Risiko:** Kilden håndterer privat driftsinformasjon og kan behandle personopplysninger og HMS-informasjon. Demoen har lavere risiko fordi alt innhold er syntetisk, uten identifiserende detaljer, opplasting eller innsending. Kildens operative system krever separat sikkerhets-, personvern- og HMS-vurdering før eventuell bruk med reelle data.
- **Omfang:** Responsiv, statisk, skrivebeskyttet visning av én sak, prioriteringsfaktorer og hendelsesforløp. Ingen browser- eller serverlagring og ingen eksterne kall.

## Sikkerhet og personvern

Alt synlig saksinnhold og alle stedsnavn, roller, ID-er og tidsstempler er oppdiktet for denne demoen. Ingen navn på virkelige personer eller steder brukes. Ingen uploadkontroller, meldingsfelt, e-postlenker, statuslenker, loginflater, skjemaer, API-endepunkter eller serverfiler er med. Demoen bruker ikke cookies, nettleserlagring, kontoer, database, analyse eller eksterne ressurser. JavaScript gjør kun en lokal scroll til det statiske saksdetaljpanelet. Ingen secrets eller kildefiler med operative data er kopiert.

## Test, QA og deploy

- Automatiserte tester: `node --test tests/*.test.mjs`.
- JavaScript-syntaks: `node --check vibe/gardsbehov-fornes/app.js`.
- HTTP QA: kontroller `/vibe/gardsbehov-fornes/`, stilark, skript, hubkort og katalogsøk med en lokal statisk server.
- Mobil QA: kontroller smal visning ved 320 px og 390 px, uten horisontal overflyt; kontroller også desktopbredde.
- Tilgjengelighet: semantiske overskrifter og lister, skip-lenke, synlig fokus, navngitte regioner, tekstalternativ for poengskala og ingen informasjon formidlet bare med farge. Kontroller tastaturnavigering og redusert bevegelse.
- Nettverk og lagring: ruten laster bare same-origin statiske filer. Kontroller at den ikke bruker API-/nettverkstransport, cookies, local/session storage eller IndexedDB.
- CI: GitHub Actions-resultat føres i PR etter at kjøringen er ferdig.
- Deploy: ingen deploy er utført av denne PR-en. Bruk etablert **Deploy Vibe to one.com**-workflow fra `main`, start med `dry_run=true`, og kontroller offentlig direkterute, katalogkort og statiske ressurser etter eventuell live-deploy.

Denne leveransen løser Issue #2 delvis ved å legge til én vurdert, isolert kandidatdemo. Kilderepoet er kun inspisert; det er ikke endret. Førsterunden er bred, og ingen kandidater er kuratert bort.
