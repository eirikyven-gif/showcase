# NS 3424 · arkivert læringsapp

Showcase-rute: `/vibe/ns3424-arkivdemo/`.

## Kilde og identitet

Kilden er `eirikyven-gif/ns3456`, arkivert, commit `5c58678269fb2c24d83af8afedeb65c8878732ff` (tree `142c31e21eb1afe5f10eeee23f3d8cb145209745`). Repoets README og `docs/SPEC.md` identifiserer appen som **app-fdvu-ns3424**, en enkeltfilbasert læringsapp for NS 3424. `docs/CHANGELOG.md` dokumenterer v0.1.0 og v0.1.1; den sist oppførte appfilen er `app/app-fdvu-ns3424_v0.1.1.html` (Git blob `fe8376dc96e81eefbda9b1f399a0e6e1c19d4c4b`, 319 633 byte). Kilderepoet er arkivert. Kilde er lest på denne SHA og er ikke endret.

Kildens læringsflyt dekker analysenivå 1–3, TG0–TG3/TGIU, konsekvens (KG), sannsynlighet/risiko, observasjon versus tolkning, tiltak, fem caser og en quizbank på ti spørsmål. Showcase-ruten viderefører åtte læringsdeler, graderskalaer, risikoforklaring, prosess/akkordioner, fem caseøvelser med arbeidsark, TG-feedback og quiz med poeng/progresjon/nullstilling. De fem casebeskrivelsene er skrevet på nytt som syntetiske SYN-01–SYN-05. Frie arbeidsarkssvar lever bare i sidens minne. Risikoutregningen er en forenklet KG × sannsynlighet demonstrasjon; den er ikke en standardberegning.

## Sikkerhet og faglig avgrensning

Kilde-HTML-en bruker eksterne CDN-er, localStorage for identifikatorer/progresjon/feedback, innloggings- og utviklerflyter, Apps Script/backend-kall og et hardkodet Apps Script feedback-endepunkt. Den inneholder også dev-/kildekort og referanser til eksempelrapporter. Disse integrasjonene, autentiseringselementene, identifikatorene, rapportreferansene og kildecasene er ikke tatt med. Showcase-filen er selvstendig HTML/CSS/JavaScript uten eksterne ressurser, nettverkskall, cookies, lagring, telemetry, login, backend, PII eller hemmeligheter. «Nullstill hele demoen» tømmer casevalg og arbeidsark, quizsvar/resultat, akkordioner og navigasjon.

**Kun pedagogisk illustrasjon. Ikke faglig veiledning eller profesjonell tilstandsanalyse.** Påstandene er ikke kontrollert mot gjeldende standard og kan være ufullstendige eller feil. Ikke bruk appen til å vurdere virkelige bygg eller ta sikkerhets-, vedlikeholds- eller investeringsbeslutninger. Bruk autoritative standarder og kvalifisert fagperson. Alle case-ID-er, bygningsforhold og observasjoner er oppdiktet for demoen.

Ingen lisens eller gjenbrukstillatelse fremgår av kildefilene som ble gjennomgått; rettighetene til videre offentlig gjengivelse må avklares. Ingen fagperson har kvalitetssikret innholdet.

## QA og status

Automatiserte kontroller: `node --test tests/ns3424-arkivdemo.test.mjs` og hele CI-settet `node --test tests/*.test.mjs`. Nettleser-QA kontrollerer rutevisning, case-/risikoflyt, quiz og nullstilling dersom Playwright/Chromium er tilgjengelig. Kildens egne tester/CI ble ikke funnet eller kjørt. PR #92 oppdateres mot showcase main `108b0ab`, fra v0.59.0 til v0.60.0. Issue #2 er delvis adressert. PR #92 er åpen for review; ingen merge eller deploy er utført.
