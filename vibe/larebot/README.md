# Lærebot

Første brede vurdering av Lærebot. Kandidaten er beholdt for vurdering; ingen kuratering eller utsiling er gjort.

## Katalogmetadata

- **Navn:** Lærebot
- **Bruksområde:** Utforsk en kort, forhåndsskrevet læringsforklaring om et naturfaglig tema.
- **Kategori:** Utdanning
- **Målgruppe:** Elever, undervisere og andre som vil se et eksempel på læringsstøtte.
- **Status:** Kildeinngangspunkt bekreftet; original, statisk Vibe-demo opprettet. Bred førstegangsvurdering, ikke kuratert.
- **Foreslått slug:** `larebot`
- **Demoens verdi:** Viser hvordan et ferdig eksempelspørsmål kan kobles til en kort forklaring uten å be brukeren skrive inn tekst.
- **Nødvendige forenklinger:** Én oppdiktet læringsenhet og tre faste spørsmål/svar; ingen modellgenerering, valg av fag, PIN, rolle, admin eller kildekobling.
- **Omfang:** Én temaside, tre forhåndsdefinerte valg, tilhørende eksempelrespons og nullstilling.

## Kildeinngangspunkt og vurdering

Kildeinngangspunktet er `apps/larebot/index.html` i `eirikyven-gif/diverse-apper`. Den kilde-HTML-en viser PIN-innlogging, fag-/temavalg og fritekstspørsmål, og laster appens stil og skript fra `assets/`. Kildens README beskriver serverbasert PIN-/sesjonshåndtering, privat JSON-kildelagring og mulige OpenAI/Gemini-integrasjoner. Kilderepoet ble kun lest.

Demoens undervisningstekst, spørsmål og svar er skrevet på nytt og handler om vannets kretsløp. Kildekode, pensumtekst, elevopplysninger, navn, medier, API-konfigurasjon og tjenesteintegrasjoner er ikke kopiert. Rettighetsstatus for kildeproduktets innhold er ikke vurdert eller nødvendig for denne selvstendige demoen; konseptuell inspirasjon er avgrenset til en pedagogisk forklaringsflate. Ingen tredjepartstekst eller -kode brukes.

## Forenklinger og risiko

- Ingen innlogging, PIN, kontoer, elevroller, admin, fritekstfelt, AI eller API.
- Ingen serverkomponenter, serverlagring, nettverkskall, tredjepartskilder, informasjonskapsler eller nettleserlagring.
- Valg viser en fast lokal tekst og finnes bare i sidens minne; oppdatering/nullstilling fjerner visningen.
- Kildeproduktets bruk med ungdomsskoleelever medfører forhøyet personvern- og mindreårigrisiko dersom kontoer, spørsmål, svar, fremdrift eller kildedata behandles. Demoen identifiserer ingen bruker og samler ikke inn elevdata. Innholdet er generisk, syntetisk og ufarlig, men offentlig bruk av læringsmateriell for mindreårige bør fortsatt vurderes i den senere kurateringsrunden.

## QA

Kanonisk direkterute: `/vibe/larebot/`. Siden har tydelige overskrifter, navngitte knapper, synlig tastaturfokus, hoppelenke, live-region for svar, mobilstil og redusert bevegelse. Knappevalg og nullstilling bruker kun nettleserminne. Ingen skjemadata kan sendes.
