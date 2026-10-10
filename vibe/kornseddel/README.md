# Kornseddel — kildefaithful demonstrasjon

## Kilde og omfang

Basert på `eirikyven-gif/apps-fornes-gard/apps/kornseddel` ved offentlig `main` commit `90014358fb3d70e89265b2b30d38e9376a6927b2`. Gjennomgått `README.md`, `SSOT.md`, `index.html`, `app.js` og `style.css`. Showcase-ruten viderefører kildens redigerbare skjemaflyt, kornvalg, leverings- og kontrollfelter, synkronisering til tre utskriftskopier og nettleserens `window.print()` på én A4-side.

Alle kildeforhåndsutfylte person-, adresse-, telefon- og produsentverdier er erstattet med tydelig syntetiske eksempelverdier. Ikke bruk ekte opplysninger. Skjemaet lagrer ikke; utfylling finnes bare i fanens minne og forsvinner når fanen lukkes. Ingen autentisering, serverlagring, API, nettverkskall eller hemmeligheter er med. Ingen nettleserlagring eller resetflyt er nødvendig.

Kildens SSOT beskriver Felleskjøpets 2026-blankett med merkevare, grafikk og vilkår. Dette er videreført for kildefidelitet, men gjenbrukstillatelse er ikke uavhengig bekreftet. Kildens faktiske produksjonsstatus er heller ikke verifisert. Demoen er ikke en gyldig leveringsseddel.

## QA, deploy og risiko

PR-en delvis løser Issue #2 ved å gjøre den eksisterende `/vibe/kornseddel/`-ruten kildefaithful. Kilde-repoet ble bare lest; ingen kildefiler er endret. CI-ekvivalent `node --test tests/*.test.mjs` passerer (92/92). Chromium åpnet direkteruten med HTTP 200; ved 390 px og 1280 px var det ingen horisontal scrolling. Endring av eksempelverdier og valg av kornslag ble speilet på alle tre kopiene, og utskriftsdialogen ble kalt. Ingen eksterne nettverkskall eller runtime-feil fra appen ble observert. Skjermleser og fysisk skriver er ikke kontrollert. Ikke deploy denne demoen for operativ bruk. Hovedrisiko er at en utskrift kan forveksles med et faktisk leveringsdokument; syntetisk advarsel vises i appen.
