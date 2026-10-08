# Byggobservasjoner – arkivkandidat

| Felt | Vurdering |
|---|---|
| Use case | Øv på å skille observerbare forhold fra antakelser i to oppdiktede bygningsscener. |
| Category | Utdanning |
| Audience | Studenter, undervisere og nybegynnere innen byggforvaltning. |
| Status | Arkivert ns3456-app beholdt i bred førstegangsvurdering; denne ruten er en ny, generisk øvelse. Ingen kuratering eller utsiling. |
| Slug | `ns3424-arkivdemo` |
| Demo value | Sorterer observasjon mot antakelse i to korte scener. `ns3424-lab` dekker allerede beslektet vedlikeholdsvurdering med et enkelt prioriteringsscenario. Tematisk overlapp er betydelig, så dette presenteres ikke som en egen kildeimplementasjon eller som en separat kildeapp. |
| Simplifications | To syntetiske scener med fire forhåndsskrevne utsagn. Ingen standardmetode, tilstandsgrad, poengmodell, faktisk byggvurdering eller fritekst. |
| Risk | Kan mistolkes som faglig veiledning eller standardinnhold; forbehold står synlig. Kildeinnholdets rettigheter er ikke avklart. Kildens demopinkode er ikke reell autentisering. |
| Scope | Statisk HTML/CSS/JS på `/vibe/ns3424-arkivdemo/`; oppdiktet tekst; svar bare i sidens aktive minne. Ingen lagring, konto, nettverk eller eksterne ressurser. |

## Kildeinventar (intern vurdering)

Kandidatbeskrivelsen identifiserer en arkivert, enkeltfilbasert tilstandsvurderingsdemo omtalt som NS 3424. Den bruker HTML/React/CDN, `localStorage` og et blankt Apps Script-endepunkt. En demopinkode utgjør ikke reell autentisering. Dette er kun det interne inventaret som ble gitt for vurderingen: den arkiverte kildekoden er ikke endret, og ingen eksterne endepunkter ble besøkt.

Kildens innhold og rettigheter er ikke verifisert. Ingen tekst, spørsmål, forklaringer, kode eller scenario fra arkivkandidaten er tatt med. Det finnes allerede en aktiv [NS3424 læringslab](/vibe/ns3424-lab/), med vesentlig tematisk og målgruppemessig overlapp. Kandidaten beholdes synlig i bred førstegangsvurdering, men den nye øvelsen skal ikke fremstilles som en separat implementasjon av arkivappen. Eventuell senere kuratering av kildeinnhold krever avklaring av rettigheter.

## Personvern, sikkerhet og drift

Ruten består av lokale statiske filer. Ingen CDN, React, API, Apps Script, nettverkskall, localStorage, sessionStorage, innlogging, serverlagring, skjema for innsending, PII, hemmeligheter, virkelige bygg eller personer brukes. Svar eksisterer kun i det åpne sidetilstandet og slettes ved nullstilling eller lasting på nytt.

## Faglig avgrensning

Generisk skrivebordsøvelse, ikke NS 3424, ikke standardtekst og ikke faglig råd. Den skal ikke brukes til tilstandsgrader, sikkerhetsbeslutninger eller vurdering av faktiske bygg.
