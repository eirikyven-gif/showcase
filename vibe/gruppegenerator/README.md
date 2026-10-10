# Gruppegenerator · tro showcase-kopi

Isolert, statisk kopi av `eirikyven-gif/apps-fagskolen/apps/gruppegenerator`, kildecommit `92379f1108ec71013a06c4e5976a6fe79de81a3e` (lest 2026-10-10). Kilderepoet er ikke endret.

## Funksjoner og innhold

- Innliming av en deltaker per linje, inkludert tab-separert tekst fra regneark; tomme linjer og overflødige mellomrom normaliseres.
- Forhåndsvisning av deltakerantall, gruppetall og gruppestørrelser.
- Tilfeldig og så jevn som mulig fordeling etter antall grupper eller deltakere per gruppe.
- Generer på nytt, flytt deltakere mellom grupper med dra-og-slipp eller tastaturbetjente valg, og last ned XLSX lokalt.
- Nullstill arbeidsflaten.

Kilde-README/SSoT omtaler flytting og XLSX som senere arbeid, men den undersøkte kilde-HTML-en implementerer allerede disse funksjonene. Showcase-kopien følger observerbar runtime.

## Trygg demo

Standardlisten bruker tydelig syntetiske etiketter (`Deltaker A`–`Deltaker H`). Innlimt tekst, fordeling og eksport behandles lokalt i nettleseren. Ingen innlogging, kontoer, nettverkskall, API-er, cookies, serverlagring eller permanent nettleserlagring brukes. `localStorage` og `sessionStorage` brukes ikke. Nullstill tømmer arbeidsflaten. XLSX-filen lastes ned direkte fra nettleseren.

Ikke lim inn virkelige navn eller andre personopplysninger. Demoen kan ikke automatisk oppdage personopplysninger en besøkende selv taster inn.

## Kildegrunnlag

Låst [SSoT – Gruppegenerator v0.1](https://app.notion.com/p/3c7ba9485bce81c38ec0fe137019bb84) krever offline arbeidsflyt, linjevis tolking, jevn tilfeldig fordeling, valgfri gruppetelling/-størrelse og ingen backend, innlogging eller permanent lagring. Kilde-README, `index.html` og SSoT ble lest. Kildemappen inneholder ingen tester. Ingen lisens eller separat gjenbrukstillatelse ble funnet; rettighetsstatus er uavklart.

Direkterute: `/vibe/gruppegenerator/`. Endringen oppdaterer eksisterende rute, katalogmetadata og funksjonstester. Den er del av Issue #2 og løser det delvis. Ingen merge, deploy eller offentlig rute-QA utført.
