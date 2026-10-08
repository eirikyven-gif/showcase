# Nedtelling

En frittstående, statisk nedtellingsbygger på `/vibe/nedtelling/`. Siden bruker bare lokal HTML, CSS og JavaScript, sammen med den delte Vibe-stilen.

Hovedinnholdet bruker samme sentrerte sidebredde som Vibe-huben. Kanonisk adresse har avsluttende skråstrek. Katalogkortets statiske rute uten skråstrek videresendes til katalogens katalogrute med skråstrek.

Tittel, dato, klokkeslett, uttrykk og aksentfarge behandles i minnet i nettleserfanen. Tilbakestill-knappen gjenoppretter det merkede eksempelinnholdet; en ny sideinnlasting starter også med eksempelet. Ingen verdier lagres eller sendes. Skjemaets submit-hendelse avbrytes for å hindre nettleserens standard GET-navigering når brukeren trykker Enter.

Eksempelverdiene er syntetiske. Siden ber ikke om innlogging eller personopplysninger og har ingen deling, opplasting, eksterne bilder, analyse eller sporing.

Hvis dato eller klokkeslett tømmes, viser forhåndsvisningen en kort veiledning og tomme tidsverdier fram til gyldige verdier er valgt. Dette kan gjenskapes ved å tømme datofeltet i nettleseren; siden skal ikke kaste en feil.

Manuell Chromium QA dekker direkte rute og innlasting, katalogkortets videresending til kanonisk rute med skråstrek, Enter uten navigering eller nettverkskall, tomt dato- og klokkeslettfelt, live forhåndsvisning og tilbakestilling, tastaturfokus, redusert bevegelse, samt responsive visningsbredder fra 320 til 1440 piksler.
