# Fagquizer · tro kopi for Showcase

**Issue #2:** Delvis løst av denne isolerte appkopien. Rute: `/vibe/fagquizer/`.

## Katalogmetadata

- **Bruksområde:** Øve på naturfag og samfunnsfag med quizer, flashcards og fagbegreper.
- **Kategori:** Utdanning og læring.
- **Målgruppe:** Elever, undervisere og personer som utforsker læringsapper.
- **Status:** Kandidat beholdt etter bred vurdering; statisk kopi med syntetiske demoidentiteter.
- **Demoens verdi:** Gjenskaper fag → tema → aktivitet, quizer med forklaring og progresjon, flashcards, ordquiz, åpne svar og separat adminoversikt.
- **Omfang:** Statisk HTML/CSS/JavaScript på én direkterute. Fagstoffet ligger i lokale fixtures i `data.js`.

## Kilde og bevaring

- **Repo / mappe:** `eirikyven-gif/diverse-apper/apps/quiz/`.
- **Kildecommit lest:** `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530` (`main`). Kilderepoet er bare lest; ingen endringer er gjort der.
- **Instrukser lest:** kilde-`AGENTS.md`, app-README, rutene for begge fag/temaer/aktiviteter, API-/spørsmålsmodellen og tilgjengelige tester.
- **Låste krav lest:** styringsdokument og SSoT v0.1–v0.6. v0.5 fastsetter testapp uten ekte brukere/elevdata; v0.6 krever separat KI-vurdert ordquiz i originalen.
- **Bevart innhold:** Naturfag og samfunnsfag, temaene, alle flervalgsspørsmål, svar og forklaringer, 16 flashcards, 15 ordquizdefinisjoner og 15 åpne spørsmål. Kildekomponentenes studentnavigasjon og aktivitetsvalg er tilgjengelig.

## Simuleringer og kontroller

- PIN-/passordinnlogging er erstattet med en forhåndsdefinert demoelevrolle og en rolleknapp til syntetisk admin. Ingen legitimasjon spørres etter eller kontrolleres.
- Adminvisningen viser faste, oppdiktede summer og demoelever. Den har ikke konto-/innholdsredigering eller reell elevdetaljstatistikk.
- Flervalg, rekkefølge, poeng, flashcardvending, ordsvar, fritekst og forsøk kjører i nettleseren. Åpne svar bruker en enkel heuristikk/fast eksempeltekst i stedet for KI og er tydelig merket som ikke-faglig vurdering. Ordquiz godtar bare det tilhørende målordet med enkel normalisering.
- Syntetisk rolle, quizsummer, pågående øktstatus og flashcardposisjon/-tilstand lagres kun i nettleserens `localStorage` under `vibe-fagquizer-demo-v2`. Rå svartekster lagres ikke. Tekstfeltene ber brukeren uttrykkelig om ikke å skrive personopplysninger.
- «Nullstill all demodata» sletter hele appens lagringsnøkkel. Ingen serverlagring, cookies, konto, auth, API, eksterne KI-kall, telemetry, hemmeligheter eller private/livedata.
- Offline direkteåpning er støttet når ruteaktiva er lastet; klienten gjør ingen `fetch`, XHR, beacon eller andre API-kall.
- Ingen lisens eller særskilt rettighet til kildeinnhold er funnet i materialet. Kopien gjengir undervisningstekster etter oppdraget om tro kopi; opphavsrett/offentlig gjenbrukstillatelse er uavklart.

## Tester og QA

Fokustester kontrollerer rute, katalogmetadata, alle fixtureantall og undervisningsinnhold, fullstendige aktivitetstyper, localStorage/nullstilling, syntetisk rollemerking, tastatur og fokus samt fravær av API/auth/cookie/nettverkskode/secrets.

Kjør fra repo-roten:

```sh
node --test tests/fagquizer.test.mjs
node --check vibe/fagquizer/app.js
node --check vibe/fagquizer/data.js
```

QA skal i tillegg kontrollere direkterute/refresh og hubretur, quiz/flashcard/ordquiz/åpent-svarflyt, reset etter lokal lagring, bredder fra 320 px, tastatur, synlig fokus og statusmeldinger. Kildens egne PHP-/Python-tester retter seg mot serverfunksjoner som denne statiske kopien ikke inneholder; de kjøres ikke mot showcase.

## Endret funksjon med vilje

Ingen live/auth/serverbaserte funksjoner er beholdt: PIN/admininnlogging, serverforsøk/API-er, serverlagret elevhistorikk, OpenAI/Gemini-kall, reell adminredigering/statistikk og fasit-/kriteriekonfigurasjon. KI-svar simuleres lokalt; demoen er ikke offisielt kursmateriell, læringsanalyse eller faglig vurderingsverktøy.

**Deploystatus:** Ikke deployet av denne PR-en.
