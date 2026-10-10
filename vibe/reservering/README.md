# Reservering · showcase-kopi

Interaktiv, statisk demonstrasjon av funksjonene i `eirikyven-gif/Wp-Reservering`, tilgjengelig direkte på `/vibe/reservering/`.

## Funksjoner som er bevart

- Kundens kalender med ledige, fulle og blokkerte dager, valg av dato og ledig tidspunkt.
- Bestillingsskjema med navn, telefon, e-post, valgfri merknad og obligatorisk vilkårsaksept.
- Oppsummering før innsending, feltvalidering, lokal bekreftelse og ny booking.
- Lokal ICS-nedlasting for demoreservasjonen.
- Adminoversikt med kommende/tidligere/alle/kansellerte poster, søk, redigering, oppretting, sletting og CSV-eksport.
- Demorolle for redaktør/administrator.
- Ukentlig tilgjengelighet med valg av tidspunkt per ukedag, blokkering av datointervall og fjerning av blokkering.
- Admin-e-postinnstilling som eksempelverdi.

## Syntetisering og personvern

Alle forhåndsutfylte kundeopplysninger er syntetiske (`example.invalid` og reserverte nullverdier). Bestillingsskjemaet håndhever syntetiske verdier: demanavn, telefon som begynner med `000000` og e-post på `.invalid`. Bruk bare demaverdier. Ingen reell WordPress-innlogging, rolleautorisasjon, database, API, e-post, cookie, nettleserlagring, tracking eller serverkall finnes. Endringer finnes bare i sidens minne og forsvinner ved refresh. CSV- og ICS-filer genereres lokalt med syntetiske verdier; ingen data lastes opp. E-post og personlige kanselleringslenker simuleres ikke som fungerende eksterne handlinger.

Kildekoden deklarerer GPL-2.0-or-later. Denne kopien gjenskaper oppførsel og innholdsstruktur i selvstendig statisk kode; den inneholder ikke originalens backend eller kildedata. Faktisk produksjonsbruk/retensjon i kilden er ikke verifisert.

## Kontroll

Kjør showcase-regresjonstestene fra repo-roten med `node --test tests/*.test.mjs`. Testen for reservering kontrollerer rutens funksjonsområder, katalogmetadata, syntetiske eksempeldata og fravær av eksterne nettverks-/lagringsmekanismer.
