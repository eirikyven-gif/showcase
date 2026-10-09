# Kornfølgeseddel

## Første vurdering

- **Bruksområde:** Vise hvordan en enkel følgeseddel for kornlevering kan organiseres og skrives ut.
- **Kategori:** Gårdsdrift og dokumentflyt.
- **Målgruppe:** Gårdsbrukere, transportører og mottak som ønsker å utforske et enkelt skjemaformat.
- **Kildestatus/usikkerhet:** Kildens `SSOT.md` er LÅST og beskriver en statisk, utfyllbar blankett med utskrift. Kilde-README og faktisk produksjonsdeploy er ikke uavhengig verifisert; rettigheter til tredjepartsblanketten og merkevaren er uavklart.
- **Slug/rute:** `kornseddel` · `/vibe/kornseddel/`.
- **Status:** Beholdt i bred førstegangsvurdering; original statisk konseptdemo laget. Ingen kuratering eller utsiling.
- **Demoverdi:** En utskriftsvennlig eksempeloversikt viser avsender, mottak, dato, eksempelreferanse, varelinje og signaturfelt.
- **Forenklinger:** Én statisk, ikke-redigerbar følgeseddel med oppdiktet gård, mottak, vare, dato, partier, referanse og mengde. Utskriftsknappen åpner bare nettleserens utskriftsdialog.
- **Risiko:** En operativ kornfølgeseddel kan inneholde person-, kontakt-, virksomhets-, identifikasjons-, steds- og leveringsopplysninger. Kildens faktiske behandling og rettighetsstatus kunne ikke vurderes. Demoen har bare syntetiske eksempelverdier, ingen virkelige identifikatorer og ingen datainnsamling. Original kildekode og innhold ble ikke kopiert.
- **Omfang:** Statisk `/vibe/kornseddel/`-rute, katalogoppføring og denne vurderingen. Ingen opplasting/nedlasting, eksterne API-er eller lenker, autentisering, server- eller nettleserlagring, hemmeligheter, personopplysninger eller kildedata.

## QA og status

Showcase-testene passerer (53/53); kildeappen har ingen testmappe eller testscript. JavaScript-syntaks og `git diff --check` er kontrollert. Chromium åpnet direkteruten med HTTP 200; ved 390 px var det ikke horisontal scrolling. Tastaturfokus er synlig, utskriftsdialogen ble kalt, og ingen eksterne nettverksforespørsler ble observert. Utskriftsstil skjuler navigasjon og knapp og beholder bare følgeseddelen.

PR-en delvis løser Issue #2. Ruten er ikke deployet; etter senere publisering må `/vibe/kornseddel/` kontrolleres som offentlig besøkende.

## Kildegjennomgang

Kilde-repoet ble lest skrivebeskyttet ved offentlig main commit `90014358fb3d70e89265b2b30d38e9376a6927b2`. Gjennomgått: `README.md`, låst `SSOT.md`, `index.html`, `app.js` og `style.css`. SSoT beskriver en statisk redigerbar kornfølgeseddel for mobil/desktop, nettleserutskrift med tre kopier på stående A4 og ingen konto, innsending eller serverlagring. Den låste kildefilen har reelle forhåndsutfylte person-/produsentverdier; disse er ikke gjengitt her eller i showcase.

Kilden er HTML/CSS/JavaScript med redigerbare felt og `window.print()`. Ingen auth, API, persistent browser storage, testmappe eller package-/byggmanifest ble funnet i appmappen. Kildens låste krav nevner en tredjeparts 2026-blankett med foto, logoer, merkevare og bestemt layout, mens README peker på en Dropbox-PDF. Ingen lisens eller uttrykkelig gjenbrukstillatelse ble funnet. Showcase-demoen kopierer ikke feltene med ekte verdier, teksten, utseendet, merkene eller aktivaene.

## Showcase-kontroller og scope

Eksisterende `/vibe/kornseddel/` er en ikke-redigerbar side med syntetisk Eksempelgård/Prøvemottak, eksempelreferanse og oppdiktet mengde. Utskriftsknappen åpner bare nettleserens utskriftsdialog. Ingen inndata, person-/kontaktdata, nedlasting, auth, nettverk, API, cookies, lokal lagring, secrets eller kildedata. Denne PR-en endrer ikke runtime-ruten; den fullfører kandidatmetadata, kildevurdering og regresjonsdekning.
