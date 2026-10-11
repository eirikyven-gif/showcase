# WP Varelager · lokal simulering

**Paritet er uavklart.** Issue #2 er delvis adressert; PR #90 forblir draft. Se [kildebasert parity-matrise](PARITY.md) før noen omtale av funksjonsdekning.

## Kilde og avgrensning

Det arkiverte `eirikyven-gif/Wp-varelager` ble kontrollert i kildekode og runtime-visninger, ikke utledet fra ruteslug. Inspisert `main` SHA `e080136b7b0bc20e1885c9c9456f7143ca170861`, tree `7506300fcd587546f7772e1cab4d55293bd7b947`. Kilderepoet er ikke endret. Demoen har syntetiske eksempler og holder all redigering i sidens minne.

Lokale source-parity-substitutter: velg syntetisk rolle og hver av de ti kilde-capabilities; kontroller blir lokalt gated etter valgte capabilities. Opprett en syntetisk delingsoppføring, åpne samme-side `#share-preview` og kopier den tokenløse ruten. Velg bilde-/dokumentfixture, før metadata i vedleggslisten, vis lokalt generert illustrasjon/tekst og slett metadata. Dette modellerer UI-flytene uten ekte innlogging, server-roller, offentlig token/URL, utsending, filopplasting eller filbytes. Kildegrensene og nøyaktig mapping står i [PARITY.md](PARITY.md).

## Status og QA

Se matrisen for kildefil/funksjonsbevis, felt, handlinger, nåværende dekning og konkrete gap per område. Kildearbeidsflytene er implementert lokalt, inkludert separate adminskjermer, avtaler, rapport/opptelling, tokenløs delingsforhåndsvisning/kopiering, CSV/XLSX, innstillinger, notater og syntetisk vedleggsfixture-liste/visning/fjerning. Matrisen oppgir kildehandling, lokal ekvivalent, presis sikkerhetsgrense og Chromium-QA per kildeområde. Korreksjoner for tomme varevalg, SKU-validering/-generering, leiedatofeil og egendefinerte felt er kildebasert og dokumentert der. Ekte identitet/lagring, private filbytes/media, offentlig bearer-lenke og e-post er fortsatt deaktivert. De synlige arbeidsflytene har lokale substitutter; begrensningene er ikke beskrevet som helt utelatte brukerflyter.

Kontroller på denne revisjonen: `node --check vibe/wp-varelager/app.js`; `node --test tests/wp-varelager.test.mjs tests/wp-varelager-accessibility.test.mjs` (10 tester); Chromium-interaksjonstest av reader/visitor/admin-gating, delingsoppretting/kopiering/forhåndsvisning/retur og image-/document-fixture add/list/view/delete. Browser-run hadde ingen JavaScript-feil eller off-origin-forespørsler. Vibe static validation run #329 passed for the pushed parity correction; PR remains draft while source parity is reviewed.

Versjon/katalog: showcase-baseline `0.60.3`, 42 katalogoppføringer i kandidatgrenen; releaseversjon utsettes til koordinator bekrefter rekkefølgen. Ikke merge eller deploy før parity-matrisen er lukket og relevante kontroller består.
