# Nedtelling

En frittstående, statisk nedtellingsbygger på `/vibe/nedtelling/`. Siden bruker bare lokal HTML, CSS og JavaScript, sammen med den delte Vibe-stilen.

Tittel, dato, klokkeslett, uttrykk og aksentfarge behandles i minnet i nettleserfanen. Tilbakestill-knappen gjenoppretter det merkede eksempelinnholdet; en ny sideinnlasting starter også med eksempelet. Ingen verdier lagres eller sendes. Skjemaets submit-hendelse avbrytes for å hindre nettleserens standard GET-navigering når brukeren trykker Enter.

Eksempelverdiene er syntetiske. Siden ber ikke om innlogging eller personopplysninger og har ingen deling, opplasting, eksterne bilder, analyse eller sporing.

Manuell Chromium QA dekker direkte rute og innlasting, Enter uten navigering eller nettverkskall, live forhåndsvisning og tilbakestilling, hub-lenke, tastaturfokus, redusert bevegelse, samt responsive visningsbredder fra 320 til 1440 piksler.
