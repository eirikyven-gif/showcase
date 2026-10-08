# Ukelønn – showcase-demo

## Kandidatvurdering

- **Formål:** Registrere avtalte gjøremål for flere brukere og vise ukentlig grunnlag for ukelønn.
- **Kategori:** Familieøkonomi og oppgaveoversikt.
- **Målgruppe:** Voksne familiemedlemmer og voksne som vil utforske en enkel ukentlig oppgave-/beløpsoversikt. Kildens brukerflate ser ut til å omfatte flere familiemedlemmer, men denne demoen er bevisst avgrenset til voksne.
- **Status:** Kilde-README beskriver v0.17.0 og sier eksplisitt at denne versjonen ikke er deployet eller live QA-verifisert. Showcase-kandidaten beholdes i bred førstegangsrunde; ingen kuratering eller utsiling.
- **Kilde:** `eirikyven-gif/diverse-apper`, `apps/ukelonn`, `main`, commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`, lest 2026-10-08. `version.json` oppgir 0.17.0. Kildecheckoutet er kun lest.
- **Stack:** Semantisk HTML, scoped CSS og vanilla JavaScript i klienten; same-origin PHP/JSON API-er; filbasert privat JSON-lagring ifølge arkitekturdokumentasjonen. Ukelønn har egne auth/session-, datarot- og komponentgrenser.
- **Tester:** README dokumenterer Node UI-kontrakter, PHP-sesjonskontrakt og deploysmoke-prosedyre. Kildeversjonen er likevel ikke live QA-verifisert; testene fra kildeappen ble ikke kjørt for denne showcase-endringen.
- **API og auth:** Kilden dokumenterer API-endepunkter for auth, gjøremål, registreringer, forslag, utbetalingskrav, historikk, vedlegg og adminbetalinger. Separat bruker- og admininnlogging; passord/PIN-hasher, server-side rolle/CSRF og PHP-sesjoner. README oppgir persistent fornybar brukercookie uten appstyrt idle-timeout og adminfrist på 180 dager.
- **Lagring:** Privat JSON-data for brukere, roller, sessionrelaterte data, gjøremål, registreringer, perioder, betalinger, historikk og vedlegg. Vedlegg serveres via autorisert endepunkt; runtime-data skal ligge utenfor webroten.
- **Personvern og risiko:** Kan inneholde navn, PIN/passord-hasher, sesjoner, oppgave- og betalingshistorikk og bilder. Kilde-README nevner også e-postvarsler og en frivillig SMS-lenke. Ingen ekte data, identifikatorer, kildekode, API-er, auth eller lagringsmodell er tatt inn i demoen. Ikke inviter barn til å oppgi persondata.
- **Rettigheter/usikkerhet:** Ingen lisens eller gjenbrukstillatelse ble verifisert i inspiserte kildefiler. Demoen er en selvstendig statisk utforming med generiske oppgaver og fiktive voksne; ingen kildeartefakter er kopiert. Produksjonsstatus, faktisk bruk og rettighetsgrunnlag for kildeverk er uavklart.

## Demo og avgrensning

Ny, original `/vibe/ukelonn/`-rute. Viser kun statiske, fiktive ukeoppgaver og beløp for «Voksen A» og «Voksen B». Ingen input, registrering, konto, bilder/opplasting, innlogging, API, nettverkskall, cookies, nettleserlagring, betaling eller datauthenting. Beløp er illustrative, og ingenting beregnes eller utbetales.

## QA

- Automatisert showcase-test dekker unik katalogslug, canonical/direct route, syntetisk vokseninnhold, ingen input eller barnenavn og fravær av auth, nettverk, cookies og lagring.
- Kilde-QA-testene er kun dokumentert i README; ikke kjørt i kilde-repoet.
- Manuell Chromium-QA lokalt: direkte URL og refresh ga HTTP 200; layout testet ved 390 px og 1440 px uten horisontal overflow; første Tab stopper på synlig hoppelenke; null felt/skjema, tom cookie og nettleserlagring, null eksterne forespørsler og JavaScript-feil.
- Full showcase-kontroller: `node --test tests/*.test.mjs` (25 tester bestått), `node --check tests/vibe-static.test.mjs`, JSON parsing av katalog og `git diff --check` bestått.
- Deploy/live QA: ikke utført.
- **Issue #2:** Delvis fremdrift mot bred førstegangsvurdering; Ukelønn beholdes som kandidat. Dette bidraget fullfører ikke Issue #2.
