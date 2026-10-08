# Inntekter og kostnader

## Første vurdering

- **Navn:** Inntekter og kostnader.
- **Bruksområde:** Vise registreringer, månedssummer og faste poster for inntekter og utgifter.
- **Kategori:** Økonomi.
- **Målgruppe:** Alle som vil se et enkelt eksempel på en månedsoversikt.
- **Status:** Aktiv kilde-nedlastingsside; beholdt som kandidat i den brede første runden. Showcase-ruten fantes allerede på `main`, så denne endringen lager ingen ny rute.
- **Kilderute:** `diverse-apper/apps/inntekter-og-kostnader`; nedlastingsside publisert som `/apps/inntekter-og-kostnader/`.
- **Kildeversjon:** Ingen appversjon eller release-tag funnet. Vurdert kildecheckout: `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (`2026-10-07`, `fix(ukelonn): repair Mine registreringer editing`). Appversjon kan derfor ikke fastslås separat fra repo-commit.
- **Kildestack:** Statisk HTML-side med innebygd CSS og JavaScript. Produktet den distribuerer er en makroaktivert Excel-arbeidsbok (`.xlsm`) med VBA-modul og `ThisWorkbook`-hendelser; siden tilbyr også ZIP og tekstbasert bruksanvisning. Ingen arbeidsbok, VBA, veiledningstekst eller kildekode er kopiert til showcase.
- **Demoverdi:** Gjør sammenhengen mellom inntekter, utgifter, saldo og faste poster synlig uten Excel.
- **Forenklinger:** Tre forhåndsdefinerte måneder med syntetiske beløp og poster. Ingen fritekstregistrering, kontooppsett, Excel/VBA, nedlasting, eksport eller reelle betalinger.
- **Risiko:** Finansopplysninger er sensitive. Skjermtekster, beløp og kategorier i demoen er oppdiktet og merket som syntetiske. Demoen må ikke oppfattes som regnskap eller økonomisk rådgivning.
- **Rettigheter:** Ingen lisensfil eller uttrykkelig gjenbrukstillatelse ble funnet i kildecheckoutet. Demoen bruker en selvstendig utforming og syntetiske eksempler, og gjenbruker ikke kildeartefakter. Rettigheter til kildens arbeidsbok, VBA og veiledning er fortsatt uavklart.

## Kildeinventar og usikkerhet

- Kildesiden beskriver registrering i Excel på Mac, lokal lagring i arbeidsboken, automatisk månedsoversikt, egendefinerte kategorier, faste månedsposter og opprettelse av nytt årsark.
- VBA-makroer kreves for registreringsknapper, nytt årsark, automatisk innlegging av faste poster og sortering. Siden advarer selv mot å deaktivere Excels makrobeskyttelse generelt.
- Arbeidsboken lagrer brukerens økonomiske oppføringer i den lokale filen ifølge kildeteksten. Kilden beskriver ingen kontotjeneste, privat API eller serverlagring. Nedlastingsside har et lokalt bruksanvisningskall med `fetch`; dette er ikke del av showcase-demoen.
- Ingen innlogging eller brukeridentiteter er beskrevet for kildeappen. Kildens eksterne tjeneste- og API-avhengigheter fremstår som ingen, basert på den statiske siden og tilhørende README.
- Ingen egne testfiler eller testkommando for denne appmappen ble funnet. Det er derfor ikke bekreftet automatisert kilde-QA, Excel-kompatibilitet eller VBA-testdekning.
- Checkoutet har ingen appversjon/tag eller funnet lisensfil. Kildecommit oppgir repo-tilstand, ikke nødvendigvis tidspunkt for siste endring i denne appmappen.

## Showcase-scope og kontroller

- Rute: `/vibe/inntekter-kostnader/`. Ruten var allerede oppført én gang i katalogen; ingen slug- eller rutekollisjon ble funnet, og ingen kopi er lagt til.
- Siden viser tre syntetiske månedsoversikter, eksempelliste og faste eksempelposter. Tallene er kun demoverdier.
- HTML, CSS og JavaScript er statiske filer. Månedvelgeren oppdaterer DOM-en lokalt i minnet; posttekst settes med `textContent`.
- Ingen innlogging, passordfelt, skjema/brukerinput, opplasting, makroer, serverlagring, nettleserlagring, PII, hemmeligheter, private API-er, eksterne runtime-kall eller persistens.
- Kildens nedlastbare regneark, ZIP, VBA og veiledning er ikke inkludert eller lenket fra demoen.

## Tester, QA og status

- Showcase-test: `node --test tests/vibe-static.test.mjs` kontrollerer katalogoppføring, unik slug, direkte canonical-rute, tastaturvennlig `<select>`, syntetiske data og fravær av eksterne kall/persistens i runtime-filer.
- Kilde-QA: Ingen appspesifikk testkommando eller automatisert testdekning funnet.
- Manuell nettleser-/skjermlesertest: Ikke utført i denne audit-endringen.
- CI: Avventer PR-workflow.
- Offentlig HTTP-/produksjonskontroll: Ikke utført.
- Deploy: Ikke publisert av denne endringen.
- **Issue #2:** Delvis løst; kandidaten beholdes i bred første runde.

## PR-diff

Audit-endringen oppdaterer bare denne README-en, legger til en test for den eksisterende ruta og øker patchversjonen. Ingen appkode, katalogrute eller kildefiler endres.
