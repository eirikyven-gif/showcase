# Læringssti

Første vurderingsrunde for en kort læringsøvelse. Kandidaten beholdes i den brede vurderingen; ingen kuratering eller utsiling er gjort.

## Katalogmetadata

- **Navn:** Læringssti
- **Bruksområde:** Kort leksjon med tekst, refleksjon og kontrollspørsmål
- **Kategori:** Utdanning
- **Målgruppe:** Fagskolestudenter og undervisere
- **Status:** Statisk Vibe-demonstrasjon; kandidat beholdt til senere kurateringsrunde
- **Foreslått slug:** `laringssti-fagskolen`
- **Demoens verdi:** Viser en liten undervisningsflyt fra forklaring til aktiv gjenhenting med umiddelbar tilbakemelding
- **Omfang:** Én kort leksjon og ett flervalgs kontrollspørsmål

## Kildeinngangspunkt og vurdering

Kildeinngangspunktet er `apps/laringsti/index.php` i kildeprosjektet. Demoen er skrevet fra grunnen av med oppdiktet innhold; kildekode, leksjonstekster, studentdata, medier og tjenestekonfigurasjon er ikke kopiert. Første vurdering bekrefter en læringsflate som er aktuell for studenter og undervisere.

## Forenklinger og risiko

- Oppdiktet eksempel om å formulere læringsmål; ingen originalt kursinnhold.
- Ingen konto, rolle, autentisering, elevidentifikator eller progresjon.
- Ingen PHP, serverlagring, database, API, H5P, mediefil eller ekstern tjeneste.
- Valg og tilbakemelding finnes bare i sidens minne; oppdatering/nullstilling fjerner dem.
- Studentrelatert kildeprodukt gir personvernrisiko hvis reelle kontoer, svar, fremdrift eller innhold eksponeres. Denne demoen samler ikke inn slike opplysninger. Syntetisk undervisningstekst reduserer innholds- og personvernrisikoen.

## QA

`/vibe/laringssti-fagskolen/` er kanonisk direkterute med returlenke til `/vibe/`. Kontrollspørsmålet avbryter standard skjemainnsending og bruker kun nettleserminne. Se PR-sammendraget for tester, responsive kontroller, tastatur og nettverks-/lagringskontroll.
