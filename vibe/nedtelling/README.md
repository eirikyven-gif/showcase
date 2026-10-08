# Nedtelling

## Første vurdering

- **Bruksområde:** Lage en visuell nedtelling til en valgt dato og anledning.
- **Kategori:** Planlegging og tid.
- **Målgruppe:** Personer som vil markere en personlig eller praktisk anledning.
- **Foreslått slug:** `nedtelling` (allerede i bruk; ingen ny rute opprettes).
- **Kildeversjon og kilde-stack:** Ikke verifisert. Kildestien `diverse-apper/apps/nedtelling` var ikke tilgjengelig i arbeidsområdet ved vurderingen. Denne ruten kan derfor ikke behandles som en verifisert kopi av en bestemt kildeversjon.
- **Tester i kilden:** Ukjent; kildekoden og eventuell testkonfigurasjon var ikke tilgjengelig.
- **API, autentisering og lagring i kilden:** Ukjent og ikke undersøkt. Ingen kildeserver, API eller lagring ble kontaktet.
- **Personvern:** Showcase-ruten nedenfor bruker bare syntetiske startverdier. Feltene blir i minnet i fanen, og sendes eller lagres ikke. Dette sier ikke noe om databehandlingen i den utilgjengelige kilden.
- **Rettigheter:** Uavklart. Ingen kildekode, tekst, design eller andre kildeaktiva er kopiert inn i denne ruten.
- **Demoverdi:** Gjør tidsstyrt, visuell nedtelling og lokale tilpasninger lette å prøve uten konto.
- **Forenklinger:** Eksisterende rute bruker generiske eksempelverdier og lokal nedtelling; den dokumenterer ikke eller etterligner verifiserte kildefunksjoner.
- **Risiko:** Kildens egenskaper og rettigheter kan ikke vurderes før kilden er tilgjengelig. Ruten må forstås som en uavhengig statisk demo, ikke som kildekodeaudit eller sikkerhetsvurdering av originalen.
- **Omfang:** Eksisterende `/vibe/nedtelling/` og katalogkort. Ingen kildeendringer, nye ruter eller kopiering av kildeinnhold.
- **Teststatus:** Showcase statiske regresjonstester bestått for katalogmetadata, unik slug, submit-vakt, lokal runtime, tastaturmål, mobil-breakpoint og redusert bevegelse. Kildetester ukjent.
- **QA/deploy:** Chromium QA bestått ved 320, 375, 768, 1024 og 1440 px uten horisontal overflow; tastaturfokus/skipplenk, live forhåndsvisning, nullstilling og tom dato kontrollert uten sidefeil. Ingen deploy utført for denne vurderingen.

## Showcase-rutesnapshot

En frittstående, statisk nedtellingsbygger på `/vibe/nedtelling/`. Siden bruker bare lokal HTML, CSS og JavaScript, sammen med den delte Vibe-stilen.

Snapshoten gjelder denne showcase-ruten per 2026-10-08; den er ikke en kildeversjon: HTML, CSS og JavaScript er statiske filer uten rammeverk eller byggetrinn. Ruten har ingen API-kall, autentisering, opplasting, deling, eksterne bakgrunner eller vedvarende lagring. Skjemaet stopper standard innsending. Ingen brukerinput beholdes etter fanens levetid.

Hovedinnholdet bruker samme sentrerte sidebredde som Vibe-huben. Kanonisk adresse har avsluttende skråstrek. Katalogkortets statiske rute uten skråstrek videresendes til katalogens katalogrute med skråstrek.

Tittel, dato, klokkeslett, uttrykk og aksentfarge behandles i minnet i nettleserfanen. Tilbakestill-knappen gjenoppretter det merkede eksempelinnholdet; en ny sideinnlasting starter også med eksempelet. Ingen verdier lagres eller sendes. Skjemaets submit-hendelse avbrytes for å hindre nettleserens standard GET-navigering når brukeren trykker Enter.

Eksempelverdiene er syntetiske. Siden ber ikke om innlogging eller personopplysninger og har ingen deling, opplasting, eksterne bilder, analyse eller sporing.

Hvis dato eller klokkeslett tømmes, viser forhåndsvisningen en kort veiledning og tomme tidsverdier fram til gyldige verdier er valgt. Dette kan gjenskapes ved å tømme datofeltet i nettleseren; siden skal ikke kaste en feil.

Manuell Chromium QA dekker direkte rute og innlasting, katalogkortets videresending til kanonisk rute med skråstrek, Enter uten navigering eller nettverkskall, tomt dato- og klokkeslettfelt, live forhåndsvisning og tilbakestilling, tastaturfokus, redusert bevegelse, samt responsive visningsbredder fra 320 til 1440 piksler.
