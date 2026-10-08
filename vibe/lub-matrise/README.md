# LUB-matrise – demo

Direkterute: `/vibe/lub-matrise/`.

## Første vurdering

- **Navn:** LUB-matrise
- **Bruksområde:** Se og rediger koblinger mellom emner og læringsutbytter.
- **Kategori / målgruppe:** Utdanning; faglærere, studieplanleggere og studenter.
- **Kildestatus:** Aktiv statisk fagverktøykandidat, vurdert i første brede runde.
- **Foreslått slug:** `lub-matrise`.
- **Demoverdi:** Gjør matrisevisning og redigering av koblinger utforskbar uten innlogging.
- **Forenklinger:** Ett syntetisk studieeksempel; ekte planer, notater og Excel er utelatt.
- **Rettigheter/data:** Ingen kildekatalogtekst, logoer eller tredjepartskode er kopiert; ingen persondata/private data.
- **Omfang:** Én selvstendig statisk side med in-memory redigering og nullstilling.

Alle emner, koder og læringsutbytteetiketter i denne ruten er nyskrevet,
syntetisk eksempelinnhold. Ingen katalogtekst, kildefiler, logoer eller
tredjepartsbiblioteker er kopiert. Kildeapplikasjonen er ikke endret. Risikoen
for personopplysninger, privat datakilde og rettighetsavhengig fagtekst er
fjernet ved å begrense kopien til en liten, original demonstrasjon.

## Forenklinger og kontroller

- Ingen autentisering, brukerroller, backend, nettverkskall eller lagring.
- Koblinger redigeres i minnet og Nullstill eksempel gjenoppretter startbildet.
- Excel-import/-eksport, ekte studieplaner, kildelenker og notater er utelatt.
- Tastaturbetjente knapper bruker `aria-pressed`; status leses opp via `aria-live`.
- Layouten bruker horisontal rulling for den brede matrisen på smale skjermer.

## QA

Kontrolleres med `node --test tests/vibe-static.test.mjs`, `git diff --check`
og JavaScript-syntakskontroll. Nettleser-QA: direkterute, endre og nullstill
en rute, tastaturfokus, smal visning og ingen eksterne forespørsler. Deploy
venter på PR-merge og tilgjengelige One.com-credentials; ruten er ikke publisert.
