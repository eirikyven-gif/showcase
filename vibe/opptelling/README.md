# Opptelling

## Første vurdering

- **Navn:** Opptelling
- **Bruksområde:** Viser hvor lang tid som har gått siden brukeren valgte et starttidspunkt, eller fra «Start nå».
- **Kategori:** Tid
- **Målgruppe:** Alle som vil følge med på forløpt tid.
- **Kildestatus:** Inngangsside og oppførsel bekreftet; starttid, live opptelling og nullstilling virker som beskrevet.
- **Foreslått slug:** `opptelling`
- **Demoverdi:** En umiddelbart forståelig klokke som viser oppdatert tid siden et valgt øyeblikk.
- **Forenklinger:** Bruker Vibe sin egen statiske visuelle ramme; beholder bare starttidspunktet i minnet, og viser framtidige tidspunkt som null forløpt tid.
- **Risiko:** Lav. Starttid kan indirekte beskrive en hendelse, men den blir ikke lagret eller sendt, og demoen ber ikke om navn eller annen identifikasjon.
- **Omfang:** Én responsiv side med starttid, «Start nå», live opptelling og nullstilling.
- **Kuratering:** Med i bred første vurderingsrunde; ingen utsiling foreslått her.

## Trygg demoversjon

Ruten `/vibe/opptelling/` er statisk HTML, CSS og JavaScript. Alle endringer finnes bare i minnet i denne fanen. Det finnes ingen innlogging, nettleserlagring, serverlagring, API-kall, eksterne forespørsler eller personopplysningsfelter. Nullstill tømmer starttidspunktet. Direkterute og retur til Vibe-huben er støttet.

## QA

Node-testene dekker katalog/rute, statisk innhold og fravær av nettverks- og lagringskall. Manuell Chromium-kontroll bør verifisere valgt tidspunkt, «Start nå», live oppdatering, framtidig starttid, nullstilling, tastaturfokus, mobilbredde og hub-lenker før publisering.
