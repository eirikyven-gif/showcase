# LUB-matrise – tro kopi for Vibe

Direkterute: `/vibe/lub-matrise/`.

## Kilde og innhold

Arbeidsflyt og offentlig studieinnhold er kopiert fra `eirikyven-gif/apps-fagskolen/apps/lub-matrise/index.html`, commit `3f76106dbef0bb4a3ffc9e87703f1240e5d09d3b` (lest 2026-10-11). Kildens `README.md`, `QA.md`, `SOURCES.md`, `THIRD_PARTY_NOTICES.md` og `catalog-2026-host.md` ble også gjennomgått. Kilden dokumenterer 28 offentlige studieplanoppføringer med emner og overordnede LUB-er.

Demoen beholder studiesøk og valg, matrisen, redigering av studieplaner/emner/LUB-er, koblinger, dokumentasjon, dekningsoversikt og Excel-mal/import/eksport. Originalens faglige innhold og oppførte offentlige studieplankilder følger med. Sjekk innhold mot den gjeldende studieplanen.

## Kontroller

- `node --test tests/lub-matrise-source-parity.test.mjs tests/vibe-static.test.mjs`: 23 tester bestått.
- `node --test tests/*.test.mjs`: 132 tester bestått.
- Inline JavaScript-syntaks og `git diff --check`: bestått.
- Chromium ved 390 px: direkte rute, 28 studieplaner, søk, matrise med 400 ruter, ingen sideskrolling, JavaScript-feil eller eksterne forespørsler ved innlasting.
- Excel-import/eksport er ikke kjørt manuelt i nettleseren. Katalogsnapshotet er datert 2026-10-05; kilden synkroniseres ikke live.

## Sikkerhetsavgrensning

- Statisk klientapp: ingen innlogging, server, backend, eksterne API-kall eller skjema-posting.
- Koblinger, notater og egendefinerte planer lagres bare i `localStorage` under den isolerte nøkkelen `vibeLubPilotV1`.
- «Nullstill demodata» sletter denne nøkkelen og laster startinnholdet på nytt.
- Ikke skriv personopplysninger eller fortrolig informasjon i notatene. Excel-import leses lokalt i nettleseren; eksport lastes ned til brukerens enhet.
- De 28 studieplanene kommer fra offentlig kataloginnhold. Private konto-/studentdata er ikke med.
- Den eksisterende JSZip 3.10.1-komponenten og tilhørende pako-komponent følger med for Excel-funksjonene; lisensinformasjon følger med i [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Visuell styling er tilpasset Vibes røde palett, med «Til apphub»-lenke og lokal reset-knapp. Ingen kilderepoer er endret.
