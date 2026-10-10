# WP Varelager · lokal simulering

**Paritet er uavklart.** Issue #2 er delvis adressert; PR #90 forblir draft. Se [kildebasert parity-matrise](PARITY.md) før noen omtale av funksjonsdekning.

## Kilde og avgrensning

Det arkiverte `eirikyven-gif/Wp-varelager` ble kontrollert i kildekode og runtime-visninger, ikke utledet fra ruteslug. Inspisert `main` SHA `e080136b7b0bc20e1885c9c9456f7143ca170861`, tree `7506300fcd587546f7772e1cab4d55293bd7b947`. Kilderepoet er ikke endret. Demoen har syntetiske eksempler og holder all redigering i sidens minne.

Sikkerhetssubstitusjoner: ingen ekte innlogging/roller, konto- eller persondata, server/database, private tjenester/API-er, secrets, e-postutsending, delbar URL/token eller private fil/media. De brukerrettede feltene og handlingene skal ellers følge den kjørbare pluginen. Planlagte funksjoner som ikke finnes i pluginens UI legges ikke til som parity.

## Status og QA

Se matrisen for kildefil/funksjonsbevis, felt, handlinger, nåværende dekning og konkrete gap per område. Kildearbeidsflytene er implementert lokalt, inkludert separate adminskjermer, avtaler, rapport/opptelling, delingsoppføringer, CSV/XLSX, innstillinger, notater og vedleggsreferanser. Matrisen oppgir sikkerhetsblokker og må verifiseres mot alle kildehandlinger i browser-QA før parity kan vurderes som løst; derfor markeres demoen ikke som fullstendig trofast.

Kontroller: `node --test tests/wp-varelager.test.mjs` dekker proveniens, katalogversjon, kildefaner, workflow-handlinger, feltskjemaer og sikkerhetsgrenser. Full lokal browser-QA og CI kjøres på denne revisjonen; parity-aksept gjenstår til matrisens sikkerhetsblokker er bekreftet som eneste gap.

Versjon/katalog: showcase `0.61.0`, 42 katalogoppføringer; versjonen følger rebase etter PR #93. Ikke merge eller deploy før parity-matrisen er lukket og relevante kontroller består.
