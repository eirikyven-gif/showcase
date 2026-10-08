# Plantekasse på papir

En original, forenklet og statisk læringssti laget som en bred kandidat til Vibe-utstillingen. Kandidaten beholdes uten kuratering eller utsiling.

## Katalogmetadata

- **Navn:** Plantekasse på papir — WP-l-ringssti-konsept
- **Slug / rute:** `wp-l-ringssti` — `/vibe/wp-l-ringssti/`
- **Status:** Beholdt i bred kandidatgjennomgang; original konseptdemo laget. Ingen kuratering eller utsiling.
- **Kilde:** Offentlig repo `eirikyven-gif/WP-l-ringssti`, standardgren `main`; undersøkt 2026-10-08. Repoet inneholder README og `wp-learningsti-mvp_v0.5.6.zip`.
- **Kildeversjon og usikkerhet:** ZIP-navn og pluginheader angir v0.5.6. ZIP-ens README omtaler adminredigering og sier at backend-sync og quiz/case/KI ikke finnes i denne versjonen. Pluginfila inneholder samtidig en server-side quiz/AJAX-rute. Den tidligere repooversikten beskriver bredere v0.4.x–0.5.x-status, planlagt WordPress-autentisering og Google Sheet-sync samt servervalidert quiz. Dokumentasjonen spriker om funksjonsstatus; dette er en kandidatvurdering, ikke en verifisering av en kjørende installasjon eller av nåværende funksjonsomfang.
- **Formål:** Vise en kort læringsflyt med en fiktiv modul, en enkel forklaring og et kontrollspørsmål.
- **Kategori:** Utdanning
- **Målgruppe:** Undervisere, studenter og personer som utforsker statiske læringsgrensesnitt
- **Demoverdi:** Gjør læringsstiens modulstruktur og umiddelbare quiztilbakemelding konkret uten å kreve en LMS-installasjon.
- **Forenklinger:** Én oppdiktet modul om å planlegge en plantekasse; ett flervalgs spørsmål. Alt innhold er skrevet fra grunnen av. Demoen etterligner ikke pluginens adminredigering, WordPress-blokker, mediebibliotek, roller eller backend.
- **Risiko:** Kildeproduktet er knyttet til læring og kan berøre sensitive student- og aktivitetsdata. Kildens faktiske utrulling, databruk, tester og deploystatus er ikke verifisert. Demoen inneholder ingen personopplysninger og samler ikke inn studentaktivitet. Planteeksemplet er syntetisk og er ikke faglig dyrkingsveiledning.
- **Omfang:** Selvstendig HTML, CSS og JavaScript. Ingen WordPress/PHP, autentisering, Sheet-sync, API, backend, servervalidert quiz, studentaktivitet, persondata, lagring, hemmeligheter eller eksterne forespørsler. Quizvalget og tilbakemeldingen finnes kun midlertidig i fanen og forsvinner ved oppdatering.

## Avgrensning mot andre apper

Denne kandidaten gjelder WordPress-pluginrepoet `WP-l-ringssti`. Den er ikke WP-laringssti v0.9-webappen og skal ikke bruke den appens funksjoner, innhold eller versjon som beskrivelse av pluginen. Den er også en selvstendig kandidat ved siden av den eksisterende Vibe-demoen `laringssti-fagskolen`; læringsinnhold, kode og medier er ikke kopiert fra den demoen eller kilderepoet.

## Lokal forhåndsvisning

Start HTTP-serveren fra repoets rot med `python3 -m http.server 8000`, og åpne `http://localhost:8000/vibe/wp-l-ringssti/`.
