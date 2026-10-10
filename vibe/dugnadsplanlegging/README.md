# Dugnadsplanlegging – trygg showcase-kopi

**Issue #2: delvis løst.** Direkterute: `/vibe/dugnadsplanlegging/`.

## Kilde og funksjoner

Kilden er `eirikyven-gif/diverse-apper/apps/dugnadsplanlegging`, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`, versjon `package.json` v0.6.13 (README oppgir v0.6.10). Kilderepoet er kun lest. Gjennomgått: governance og roadmap, offentlige/admin entrypoints, alle klientmoduler, API/auth/session, lagring, SMS-bridge, deploynotater og testkommando.

Kopien viderefører kildeproduktets synlige arbeidsflyter og norsk produkttekst:

- Vaktmatrise med dag-/statusfilter, detaljvisning og mobil kortliste.
- Oppretting, redigering og sletting av personer/grupper, vakter og tidsfestede bemanningstildelinger; konfliktsjekk.
- Oppslag, oppgavesøk, bemanningsoversikt, manglende telefonliste og import/eksport av JSON.
- SMS-maler, mottakervalg, forhåndsvisning og tørrtest.
- Offentlig påmeldingsvalg og oversikt uten kontaktvisning.
- Lokal dugnadsoppretting/redigering og simulert admin-/superadminrolle.

## Trygghetsgrenser

Ingen PHP, autentisering, PIN/passord, session/cookie, serverlagring, API, analytics, tredjepartsressurser eller nettverkskall. SMS-bro og rolleautorisasjon er simulert; det genererte SMS-området inneholder kun inert forhåndsvisning og sender ikke. Påmelding bruker bare syntetiske deltakeretiketter og trenger ingen kontaktfelt. Adminens kildefelter er beholdt for trohet, men bruk bare oppdiktede verdier.

Vaktplaner og endringer lagres i `localStorage`, separat for hver syntetiske dugnad. Varsel vises over appen. **Nullstill** fjerner alle appens lagringsnøkler og gjenoppretter eksempeldata. JSON import/eksport går kun mellom brukerens egen enhet og lokalt valgt fil. Seed-data inneholder generiske deltakeretiketter og testnummeret `+47 00000000`; ingen ekte personopplysninger eller secrets er lagt inn.

Offentlig oversikt viser oppgaver og syntetiske deltakeretiketter, men aldri telefoner, e-post eller private notater. `localStorage` kan fortsatt inneholde det en besøkende selv skriver; demoen advarer derfor mot ekte data.

## Kildebegrensninger og usikkerhet

Kilden har ingen `tests/`-mappe eller testscript. `package.json` tilbyr syntakskontroll; README beskriver manuelle rutesmoke- og PHP-lintsteg. Kildeversjon/dokumentasjon avviker (0.6.13 mot 0.6.10), og produksjonsdeploy ble ikke kontrollert. Ingen lisensfil ble funnet; Eirik ba uttrykkelig om en tro kopi her. Ekstern redistribusjonsrett er ikke avklart.

## QA

Repoets node-test-suite, syntakskontroll, direktelasting/refresh, lokale ruter og lenker, tastatur, mobilbredder, personvern-/nettverkskall og lokal reset kontrolleres for PR-en. Ingen deploy er utført; ruten publiseres først etter merge og deployflyt.
