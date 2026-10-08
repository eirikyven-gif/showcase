# Timer

En frittstående, statisk kopi av Timer v1.2.0 på `/vibe/timer/`, laget med HTML, CSS og JavaScript. Den beholder nedtelling, start, pause/fortsett, nullstilling og ferdig-status fra kildeappen.

Standardverdien 60 sekunder er et syntetisk eksempel. Brukerens tidsvalg og timeraktivitet finnes bare i minnet til den åpne fanen. «Nullstill eksempel» stopper timeren og gjenoppretter 60 sekunder; lasting på nytt gjør det samme. Ingen nettleserlagring, API, servertilstand, innlogging eller personopplysninger brukes. Ruten har ingen eksterne ressurser eller tredjepartskall.

Ruten bruker den delte Vibe-hubstilen, kanonisk adresse `/vibe/timer/` og navigasjon tilbake til `/vibe/`. Katalogkortet peker direkte til denne ruten.

## QA

Kontroller timerverdi og validering, start, pause, fortsett, fullført-tilstand, start på nytt etter fullføring, endring av varighet, nullstilling mens timeren kjører og etter fullføring, tastaturnavigasjon, skjermleserstatus og visningsbredder fra 320 til 1440 piksler. Kontroller også at direkte rute, kanonisk lenke, hublenke og katalogkort virker. Nettverkspanelet skal bare vise statiske filer fra samme nettsted; ingen data lagres mellom sideinnlastinger.
