# Fagquizer · liten regelquiz

**Issue #2:** Delvis løst av denne isolerte kandidatdemoen. Dette er ikke en port av kildeappen eller en produksjonsutrulling.

## Katalogmetadata

- **Navn:** Fagquizer · liten regelquiz.
- **Bruksområde:** Utforsk en kort, original flervalgsinteraksjon bygget rundt en oppdiktet regel.
- **Kategori:** Utdanning og læringsgrensesnitt.
- **Målgruppe:** Personer som utforsker quizgrensesnitt, inkludert undervisere og studenter.
- **Status:** Beholdt i bred førstegangsrunde; original, forenklet konseptdemo. Ingen kuratering eller utsiling er gjort.
- **Foreslått slug/rute:** `fagquizer` · `/vibe/fagquizer/`.
- **Demoens verdi:** Viser et enkelt spørsmål, native svarvalg, lokal tilbakemelding og omstart.
- **Forenklinger:** Ett fiktivt regelspørsmål med ett fast svar. Ingen fagplan, spørsmål fra kilden, fritekst, flashcards, brukerkonto, elevforsøk, timer eller vurderingsmodell.
- **Risiko:** Kilden inneholder elev- og admininnlogging, private serverlagrede forsøk og OpenAI/Gemini-vurdering. Ingen av disse mekanismene finnes her. Demoen er ikke offisielt kursmateriell eller et validert undervisnings- eller vurderingsverktøy.
- **Omfang:** Selvstendig statisk rute. Svarvalg og tilbakemelding finnes kun i sidens minne. Ingen nettverkskall, browser/serverlagring, telemetry, auth, API, upload, PII eller secrets.
- **Kilderettigheter:** Ingen gjenbrukslisens ble funnet i den gjennomgåtte README/runtime/testoversikten. Rettighetene til kildekode, utforming og kildemateriale er uavklart. Ruten er skrevet selvstendig og kopierer ikke kildeinnhold eller aktiva.

## Kildebelegg og usikkerhet

- **Kilde:** `eirikyven-gif/diverse-apper/apps/quiz`, offentlig `main`, lest 2026-10-09; kildekoden er kun lest. Kilde-README blob SHA: `ff2a1468361afb4993838afe4a44aa9269ec2658`.
- **Formål og status:** Kilde-README beskriver fag- og temabaserte quizer, flashcards, elevinnlogging, separat admin og privat serverlagret forsøksstatistikk. Den beskriver også åpne, KI-vurderte svar. Låst Notion v0.3 beskriver dette KI-omfanget; v0.2 omhandler elevdetaljstatistikk. Låst v0.5 sier testapp uten reelle brukere eller elevdata og har forrang for v0.3/v0.4 om miljøformål. Låst v0.6 viderefører testbegrensningene og avgrenser KI-vurdering av ordquiz. README beskriver implementerte KI-/ordquizfunksjoner. Eldre SSoT-versjoner er derfor ikke alene gjeldende beskrivelse; kilde-README og senere SSoT-er er kontrollert, men full Git-historikk og produksjonsdrift ble ikke revidert.
- **Stack:** Kilde-README beskriver PHP 8.1+, HTML/CSS/JavaScript, PHP API-er og privat serversidelagring. Showcase-ruten er statisk HTML/CSS/JavaScript.
- **Tester:** Kilde-README oppgir PHP-enhet-/HTTP-tester, Python-kjørere og valgfri Playwright/Chromium-test, inkludert `open-evaluation-test.php`, `word-ai-test.py` og `logout-test.py`. Kildetestene ble ikke kjørt; krav fra README er ikke uavhengig kontrollert.
- **API, auth og lagring:** Kilde-README dokumenterer PIN-basert elevinnlogging, separat adminrolle/CSRF, forsøks-API-er og private datarot utenfor webrot. Den dokumenterer server-side OpenAI/Gemini-adaptere, leverandørnøkler i runtime secrets, maksimalt tre åpne-svarforsøk og at fritekstsvar ikke lagres i historikken. Dette er dokumentasjon, ikke uavhengig produksjonsrevisjon. Showcase bruker ingen av disse delene.
- **Personvern og risiko:** Kildens kontrakter omfatter interne elev-ID-er, quiz-/spørsmåls-ID-er, forsøksutfall og tider. v0.5 forbyr reelle personopplysninger og ekte elevsvar i testappen; v0.3/v0.2 beskriver eldre eller utfyllende personvernkrav. Faktisk drift er ikke bekreftet. Demoen har ingen persondata eller vedvarende data.
- **Rettigheter:** Ingen lisens er dokumentert i gjennomgåtte kildematerialer. Opphavsrett og tillatelse er derfor uavklart; ingen kildekode, spørsmål, svar, tekst eller visuelle aktiva er kopiert.
- **Rute:** Ny unik `/vibe/fagquizer/`-rute i forhold til `main` `4a70da69210fd4586e1fcf455fa871d8e05e85d9`, som har Vibe `0.33.0` og 35 katalogruter. Denne ruten gir 36 katalogruter totalt.

## Kontroller

- Native radioknapper, synlige labels, tastaturfokus, live-region for svar, mobiltilpasning fra 320 px og redusert bevegelse.
- Omstart tømmer valget; tastaturfokus forblir på knappen «Start på nytt».
- Direkterute/refresh og lenke tilbake til Vibe-huben.
- Ingen eksterne URL-er, nettverk, autentisering, cookies, lokal lagring, opplasting, elevsvar eller hemmeligheter.
- Ingen deploy utført.
- Validering: full Node-suite, 37 tester bestått; JavaScript-syntaks, JSON, rute-/lenke- og personvernsøk bestått. Chromium ved 320, 390, 768, 1024 og 1440 px besto; ingen horisontal overflow eller konsollfeil. Tastaturfokus, ubesvart tilstand, fast svar og omstart kontrollert.

## Avgrensning

Spørsmålet handler bare om å følge den lokale oppdiktede regelen i teksten. Det tester ikke fagkunnskap. Ett fast svar gir ingen evidens om læringsutbytte, vurderingskvalitet eller egnethet i undervisning.
