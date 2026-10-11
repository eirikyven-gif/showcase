# Læringssti

Statisk showcase-kopi av sentrale Læringssti-funksjoner. Direkterute: `/vibe/laringssti-fagskolen/`.

## Gjennomgått kilde og krav

- Kilde: `eirikyven-gif/apps-fagskolen`, `apps/laringsti/index.php`, commit `89f7b2c086008c91c61d3754853453a37904add5` (sist endret 2026-10-07), samt appens README og UI-/runtime-arkitektur.
- Låst Notion SSoT **v0.22**: administrasjon av emner, grupper og aliaser; læringsstier, kategorier, sider, medier, publisering, lærerforhåndsvisning, studentaktivitet, progresjon og svar.
- Låst Notion SSoT **v0.21**: demostien *Tilstandsvurdering av et eldre bygg*, testinnhold, to obligatoriske kategorier, oppgavetyper, medier og progresjonsregler.

## Kildeparitet

Demostien følger v0.21 med kategoriene **Kartlegg bygget** og **Vurder funnene**, som kan gjennomføres i valgfri rekkefølge. Den viser introduksjons- og læringssider, bilde, spillbar lokal video med norsk teksting, spillbar syntetisk lyd med transkripsjon, enkeltvalg, flervalg, sortering, prioritering, fritekstsvar, tekst- og videoløsningsforslag, lærerforhåndsvisning samt kategori- og modulfremdrift. Video-/tekst-/automatisk fullføring følger demostipresiseringen. Lærerforhåndsvisning viser løsningsforslag uten å registrere studentprogresjon.

Kildekoden støtter langt flere administrative arbeidsflyter enn denne avgrensede statiske demoen, blant annet studentregister, emne-/gruppeadministrasjon, mediaredigering, tilgangsstyring, aktivitetslogg, H5P-varianter, eksport og serverstyrt publisering. Showcase-kopien viser en enkel adminflate for syntetiske kategorier/sider og demo-publisering, ikke hele den produksjonssikre plattformen.

## Innhold og sikkerhetsforenklinger

Kildeinnholdet ligger i privat serverlagring bak autentisering og finnes ikke i kildekoderepoet. Det er ikke hentet fra produksjon. Læringssti, forklaringer, svar og medier i denne ruta er derfor syntetiske eksempler basert på den låste demostiflyten og skal ikke brukes som undervisnings- eller vurderingsgrunnlag. Illustrasjonen er tegnet i ruta; videoen er laget lokalt for demoen og har norsk teksting, mens lydfilen er en kort syntetisk tone uten tale med tekstlig alternativ.

Ingen konto, passord, innlogging, elevregister, ekte alias/PIN, serverlagring, API, cookie, privat mediefil eller ekstern ressurs finnes i demoen. Student-, lærer- og adminmodus velges åpent. Oppgaver, svar, fremdrift, publiseringsstatus og egendefinerte testsider lagres kun i `localStorage` på denne enheten. **Nullstill demo** spør om bekreftelse og fjerner denne nøkkelen.

## QA

`tests/laringssti-fagskolen.test.mjs` kontrollerer SSoT-dekning, katalogoppføring, rutelenker, localStorage-reset og fravær av nettverks-/auth-flater. Manuell nettleser-QA bør prøve begge kategorier i vilkårlig rekkefølge, alle oppgavetyper, lærerforhåndsvisning, lokal adminredigering, mobilbredde, tastatur og reset.
