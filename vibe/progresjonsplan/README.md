# Progresjonsplan · bred kandidatvurdering og demo

## Kandidatvurdering

- **Status:** Beholdt i bred førstegangsrunde. Ingen kuratering eller utsiling er gjort.
- **Kilde:** `eirikyven-gif/WP-l-ringssti`, offentlig `main` commit `b358faabd862355ae7e666a9953d8a708b983786`, lest 2026-10-09. Kilden ble klonet til `/tmp` for lesing; ingen kildefiler er endret. Gjennomgått pluginarkiv `wp-learningsti-mvp_v0.5.6.zip` SHA-256 `bd0411bb9087440a211969bc0d358dae87725bf98fb546dd224fa26f85327d16`.
- **Navn/bruksområde:** WP Læringssti beskrives som en Gutenberg-plugin for å organisere læringsinnhold i moduler, innholdselementer, quiz og caseoppgaver. Denne konseptdemoen viser en fiktiv progresjonsplan.
- **Kategori/målgruppe:** Utdanning og læringsgrensesnitt; undervisere, studenter og personer som utforsker læringsdesign. Dette er utledet fra README-formålet, ikke en bekreftet brukerbase.
- **Stack:** Kilden er en WordPress/PHP-plugin med JavaScript- og CSS-aktiva. Showcase-ruten er selvstendig statisk HTML, CSS og JavaScript.
- **Kildetester:** Ingen testmappe eller testkommando ble funnet i repoets rotoversikt. Kildetester ble ikke kjørt. Arkivets runtime og WordPress-installasjon ble ikke satt opp.
- **API/auth/lagring/personvern:** Kode i gjennomgått pluginarkiv har WordPress-rolle-/nonce-kontroller og AJAX-handlere. Masterloggen beskriver lokal lagring av anonymt quizforsøk, caseutkast og UI-/posisjonsstatus; admininnhold lagres i WordPress. Kilden beskriver også framtidig sentral autentisering og mulig WP↔Sheet-sync. Faktisk drift, aktive integrasjoner og datapraksis er ikke uavhengig kontrollert.
- **Rettigheter:** Ingen lisens eller uttrykkelig gjenbrukstillatelse ble funnet i gjennomgåtte rotfiler. Kode-, design- og innholdsrettigheter er uavklart. Demoen kopierer ikke kildekode, tekst, spørsmål, grafikk eller data.
- **Usikkerhet i styringsgrunnlag:** Issue #2 peker til låste Notion-dokumenter, men innholdet var ikke tilgjengelig i checkouten. Kandidatvurderingen bygger på offentlig README, masterlogg og arkivfiler; produktets operative og pedagogiske krav er derfor ikke fastslått.

## Demo, risiko og omfang

- **Foreslått slug/rute:** `progresjonsplan` · `/vibe/progresjonsplan/`. Sluggen var ikke i katalogen på baseline `ec138417c00220de18d5ab838b3e2950eab2a3d6` (38 katalogoppføringer); ruten er isolert.
- **Synlig verdi:** To moduler viser innholdssekvens, ett flervalgsspørsmål med tilbakemelding, og fullføring innenfor gjeldende sideøkt.
- **Forenklinger:** Originalt, generisk tema og egen tekst; ingen kildeinnhold eller -design. Ingen lærereditor, brukerroller, opplasting, fritekstinnlevering, KI, poenghistorikk, reelle kurs eller pedagogisk validering. Framdriften holdes kun i JavaScript-minne mens siden er åpen.
- **Syntetiske data:** Modulnavn, scenario, steg, spørsmål, svar og progresjon er oppdiktet og kan ikke knyttes til en person eller institusjon.
- **Sikkerhetsavgrensning:** Ingen login, WordPress, server, API, eksterne tjenester, nettverkskall, cookies, nettleserlagring, skjema for fritekst, opplasting, telemetry eller hemmeligheter.
- **Risiko:** Dette er en UI-skisse, ikke et kurs, læringsmål, faglig korrekt ressurs eller vurderingsverktøy. Kildens operative datapraksis og framtidige integrasjoner er ikke verifisert. Gjenbruksrettigheter er uavklart.

## QA og issue-status

- Ruten bruker semantiske overskrifter, skip-lenke, native radioknapper, statusregion, synlig fokus, store knapper og mobiltilpasning.
- Testene sjekker metadata, direkte rute, syntetisk innhold, fravær av nettverk/persistens/auth og responsiv-/fokusregler. `node --check vibe/progresjonsplan/app.js`, `node --test tests/*.test.mjs` (42/42) og `git diff --check` bestod.
- Headless Chromium på 390px: modulstart, ubesvart/feil/riktig svar og fullføring verifisert; ingen horisontal overflow, JavaScript-feil eller eksterne forespørsler. Tastatur/fokus og semantikk er inspisert i markup/CSS; ingen uavhengig WCAG-audit er utført.
- Kilderepoet er kun lest. Ingen uavhengig review, deploy eller merge er utført.
- Dette er delvis fremdrift på issue #2, ikke fullføring av issue-et.
