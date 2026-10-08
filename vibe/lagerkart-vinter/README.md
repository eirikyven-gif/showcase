# Lagerkart Vinter

En responsiv, statisk demo av et skjematisk lagerkart med rader, meterlinje, sperrede områder, plasserte kjøretøy og en bank med enheter som venter på plass. Velg enhet for å justere plassering i énmeterssteg, eller ta den ut av kartet. Enheter fra banken kan plasseres på første ledige sted.

## Vurdering og kildeusikkerhet

- **Status:** Beholdt i bred førstegangsvurdering; lokal konseptdemo laget. Ingen kuratering eller utsiling.
- **Foreslått slug:** `lagerkart-vinter`.
- **Bruksområde:** Se og juster plassering av vinterlagrede kjøretøy på et rad- og meterbasert lagerkart.
- **Kategori:** Gårdsadministrasjon og lagerstyring.
- **Målgruppe:** Lageransvarlige, gårdsbrukere og personer som planlegger vinterlagring.
- **Synlig demo-verdi:** Gir en rask visuell oversikt over radkapasitet, plasseringer, sperringer og uplasserte enheter.
- **Forenklinger:** Fire illustrerte rader og sju helt oppdiktede enheter. Kun plassering, uttak, enkel søking og ledig-kapasitetsvisning er med. Ingen import, kundenavn, kjennemerker fra kilden, sesongadministrasjon, eksport, betaling, meldinger eller venteliste.
- **Avhengigheter:** Plain HTML, CSS og JavaScript. Ingen rammeverk eller kjøretidsbibliotek. Typografien bruker bare lokale systemfonter.
- **Risiko:** Kildesystemet håndterer kunde- og kjøretøyopplysninger, admin-innlogging, privat filbasert lagring og en offentlig ventelisteflyt. Produksjons- og testadresser finnes i kildens dokumentasjon, men er ikke besøkt. Kildens admin-/deployhemmeligheter og kundedata er ikke kopiert. Risiko for showcase-demoen er lav når den brukes som statisk eksempel; den er ikke egnet for reell lagerplanlegging.
- **Omfang:** En isolert rute med et lite, syntetisk kart og tastaturbetjente kontroller.

## Data, personvern og sikkerhet

Alle navn/kjennemerker er fiktive eksempelkoder. Demoen har ingen PHP eller server, innlogging, opplasting, API, eksterne data, skjema for personopplysninger, kontakt-/ventelisteflyt, cookies eller lagring. Interaksjoner endres bare i nettleserens minne og nullstilles ved omlasting. Det lastes ingen eksterne ressurser.

## Kjør lokalt

Fra repo-roten: `python3 -m http.server 8000`, og åpne `http://localhost:8000/vibe/lagerkart-vinter/`.

## QA og publisering

- Tester: `node --test tests/*.test.mjs` (12 tester bestått); `git diff --check` bestått.
- QA: Chromium desktop (1440 px) og mobil (390 px); søk, plassering fra bank, enmeters flytting og nettleserkonsoll kontrollert. Ingen ekstern nettverkstrafikk eller mobil sideoverflow observert.
- Deploy: Ikke publisert. Ruten er foreslått under `/vibe/lagerkart-vinter/`; publisering følger showcase sin godkjente deployflyt.
