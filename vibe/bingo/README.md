# Bingo · Vibe-demo

Isolert, statisk nettleserkopi av Bingo-flyten på `/vibe/bingo/`. Den beholder offentlig ukevisning, tall- og navnebrett, utskrifts-/PDF-flyt og administrasjon av betalingstekst, QR-bilde og logo med forhåndsvisning.

## Kilde og krav

- Kilde: `eirikyven-gif/diverse-apper/apps/bingo`, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (kilderepoet er kun lest).
- Gjennomgått: hele appmappen, app-README, samtlige 14 kilde-testfiler, manifest, offentlige/admin-flater, API-er, HTML-maler, CSS/JS, deployworkflow og Google Apps Script-instruks.
- Låst krav: Bingo SSoT v0.1 og presisering v0.2 i Notion. v0.2 fastslår GAS som eneste produksjonsgenerator; admin kan fortsatt vedlikeholde QR/logo/betalingstekst og forhåndsvise begge godkjente brettmaler. Kildens GitHub issue #662, #664 og #666 er også lest.
- Kildens README oppgir ukentlig offentlig PDF-publisering, separat PHP-admin, ukegenerering, appspesifikk konfigurasjon og beskyttet lagring. Koden har PHP-API-er, JSON-state, filopplasting, PHP-sesjon/CSRF, SSB-tabell 10467 og GAS-trigger. Kildearbeidet ble ikke kjørt eller endret.

## Funksjoner som er bevart

- Offentlig aktiv-ukevisning med tallbrett og navnebrett.
- 30 brett av hver type, brettnavigasjon, B/I/N/G/O-oppsett, fri midtrute og utskrift eller «Lagre som PDF» gjennom nettleserens utskriftsdialog.
- Separat admin-visning med syntetisk «Bingo-arrangør»-rolle, betalingslinje med linjeskift, valg av QR- og logobilde, umiddelbar forhåndsvisning og simulert generering/regenerering av aktiv uke.
- De samme brettene og verdiene brukes i offentlig og administrativ forhåndsvisning og ved lokal utskrift.

## Syntetisk eller lokal simulering

- Tallrekkene er deterministiske demoeksempler innenfor BINGO-intervallene 1–75. Navnepoolene bruker bare merkede `Eksempelnavn B-01`-etiketter. Uke og publiseringstid er demoverdier.
- Admininngang er en rolleknapp, ikke innlogging. Det finnes ingen konto, passord, session, cookies eller autentisering.
- Betalingstekst, bildeverdier og simulert aktiv uke lagres i `localStorage` under `vibe-bingo-demo-v1`, slik at kildearbeidsflyten overlever refresh. De forlater ikke nettleseren. Velg «Nullstill alle lokale demodata» for å fjerne dem.
- QR-kode og logo er frivillige eksempelbilder, kun i nettleseren. SVG avvises hvis den inneholder skript eller eksterne ressurshenvisninger; bildefiler over 300 kB avvises for å holde lokal lagring håndterlig.
- Generering oppretter bare 30 lokale syntetiske brett og en lokal statuskvittering. Den kontakter ikke Google Apps Script, SSB, One.com, kilde-API-er eller andre tjenester.
- Nettleserens utskriftsdialog lar besøkende skrive ut eller lagre de 30 syntetiske sidene som PDF. Ingen fil lastes opp eller skrives til server.
- Ingen kildekode, logo, dokumentmal, API-respons, kontoopplysning, hemmelighet, ekte betalingsdata eller identifiserende personopplysninger er med i kopien.

## Risiko og usikkerhet

- Kildedokumentasjonen omtaler betalingsinformasjon, bildeopplastinger, mottakere, admin og serverdrift. Faktisk produksjonsbruk og personvernpraksis er ikke uavhengig verifisert.
- Bruk kun tydelig syntetiske verdier og bilder i demoen. Lokal nettleserlagring deles ikke med serveren, men ligger igjen på enheten til den nullstilles eller nettleserdata slettes.
- Kilde-README/appfilene dokumenterer ikke en lisens for kildekode eller visuelle aktiva. Denne kopien gjenskaper arbeidsflyten selvstendig og tar ikke med kildefiler eller aktiva.
- Retensjon, e-postutsending og mottakerregister finnes ikke som brukerflater i den gjennomgåtte kilden og er derfor ikke lagt til i demoen.

## Tester og QA

Fokusert test finnes i `tests/bingo.test.mjs`. Kjør med `node --test tests/bingo.test.mjs`; full repo-validering kjøres med `node --test tests/*.test.mjs`. JavaScript kontrolleres med `node --check vibe/bingo/bingo.js`.

Responsive visninger, direkterute, refresh, hubretur, begge adminforhåndsvisninger, nettleserutskrift, tastatur, synlig fokus, tilgjengelige etiketter, localStorage-nullstilling og fravær av nettverkskall inngår i QA for PR-en. Faktisk produksjonsdeploy til yven.me er ikke en del av PR-en.

## Issue #2

Delvis adressert: Bingo-kandidaten beholdes i den brede vurderingen og ruten er oppgradert til en funksjonstro, syntetisk arbeidsflytdemo. Dette løser ikke resten av showcase-issue #2.
