# Dugnadsplanlegging – første vurdering og demoomfang

- **Bruksområde:** skissere bemanning av oppgaver over tidsrom.
- **Kategori:** Planlegging.
- **Målgruppe:** arrangører, lag og grupper som fordeler dugnadsvakter.
- **Status:** kandidat beholdt i bred første vurderingsrunde; ikke kuratert.
- **Foreslått slug:** `dugnadsplanlegging`.
- **Demoens verdi:** viser skift, tidsrom og tildelt deltaker og lar brukeren endre tildelingen.
- **Kildens flyt:** kildedokumentasjonen beskriver en vaktplanmatrise med oppgaver, tidsrom, bemanningsbehov og tildelinger, import/eksport og konfliktkontroll. Den har også offentlig påmelding, administratorflater og rollebaserte funksjoner.
- **Forenklinger:** selvstendig statisk skiftliste med generiske skiftnavn og syntetiske etiketter «Deltaker A–D». Ingen kildekode, arrangement, deltaker, kontaktdata, logo, API eller serverflyt er kopiert. Ingen registrering, innsending, autentisering, roller, import/eksport, varsling, ekstern tjeneste eller lagring finnes. Valg ligger kun i minnet fram til siden lastes på nytt.
- **Risiko:** dugnadsplaner kan avsløre personers oppholdssted og tilgjengelighet; kilden håndterer navn og kontaktinformasjon. Demoens oppdiktede etiketter og generiske tider gir ikke slike opplysninger. Ingen reell påmelding er mulig.
- **Omfang:** én selvstendig rute `/vibe/dugnadsplanlegging/`, én katalogoppføring, lokal HTML/CSS/JavaScript og vurderingsdokumentasjon. Kilderepoet er kun inspisert.

## Kontroller

- Syntetiske data: alle deltakere og skift er generiske.
- Innlogging, personopplysninger, secrets, serverlagring og eksterne API-/asset-kall: ikke med.
- Demoaktivitet: kun DOM og JavaScript-tilstand i minnet; nullstillingsknappen gjenoppretter eksempelplanen.
- Tastatur og responsivitet: skjemafelt har synlige etiketter og fokusmarkering; smal layout legger hvert skift i egen vertikal rad.
