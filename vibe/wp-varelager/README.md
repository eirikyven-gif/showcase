# WP Varelager · lokal simulering

**Paritet er uavklart.** Issue #2 er delvis adressert; PR #90 forblir draft. Se [kildebasert parity-matrise](PARITY.md) før noen omtale av funksjonsdekning.

## Kilde og avgrensning

Det arkiverte `eirikyven-gif/Wp-varelager` ble kontrollert i kildekode og runtime-visninger, ikke utledet fra ruteslug. Inspisert `main` SHA `e080136b7b0bc20e1885c9c9456f7143ca170861`, tree `7506300fcd587546f7772e1cab4d55293bd7b947`. Kilderepoet er ikke endret. Demoen har syntetiske eksempler og holder all redigering i sidens minne.

Sikkerhetssubstitusjoner: ingen ekte innlogging/roller, konto- eller persondata, server/database, private tjenester/API-er, secrets, e-postutsending, delbar URL/token eller private fil/media. De brukerrettede feltene og handlingene skal ellers følge den kjørbare pluginen. Planlagte funksjoner som ikke finnes i pluginens UI legges ikke til som parity.

## Status og QA

Se matrisen for kildefil/funksjonsbevis, felt, handlinger, nåværende dekning og konkrete gap per område. Kontaktvisning er implementert lokalt, men må QA-sammenlignes med kilden. Kjente sentrale gap omfatter avtaleformens eksakte arbeidsflyt, rapport/opptelling, CSV/XLSX-kontrakt, delte lister og egne adminvisninger. Derfor er dette ikke en ferdig eller trofast port.

Kontroller: `node --test tests/wp-varelager.test.mjs` dekker proveniens, katalogversjon, seks kildefaner, sikkerhetsgrenser og at åpne gap fortsatt er dokumentert. Full lokal browser-QA, parity-aksept og CI for endelig implementasjon gjenstår. Teststatus må oppdateres etter hver parity-endring.

Versjon/katalog: showcase `0.61.0`, 42 katalogoppføringer; versjonen følger rebase etter PR #93. Ikke merge eller deploy før parity-matrisen er lukket og relevante kontroller består.
