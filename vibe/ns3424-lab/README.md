# NS3424 Læringslaboratorium (illustrativ demo)

Isolert showcase-rute: `/vibe/ns3424-lab/`.

## Kildegjennomgang

Kilden `eirikyven-gif/ns3424` ble lest skrivebeskyttet på `main`, commit `6938f28097d428d1af4c55d701ebb58bad9ff8a7` (2026-02-07). Repoet inneholder én `index.html` på 1 337 linjer og en README med bare repo-navnet. HTML-filen er selvstendig med innebygd CSS og JavaScript. Den har åtte navigasjonsdeler: introduksjon, tilstandsgrader, analysenivåer, konsekvensgrader, risikomatrise, prosess, praktisk øvelse og kunnskapstest. Øvelsen har seks scenarioer med umiddelbar tilbakemelding; quizen har ti spørsmål, poeng, progresjon og nullstilling. Akkordioner kan åpnes og lukkes.

Ingen byggoppsett, testoppsett, eksterne script/stiler, API-/nettverkskall, autentisering, cookies, nettleserlagring, serverpersistens, identifiserende personopplysninger eller hemmeligheter ble funnet i gjennomgåtte kildefiler. Kildens bunntekst sier «Basert på NS3424:2012». De faglige påstandene og forholdet til gjeldende standard er ikke uavhengig kontrollert. Kildedokumentasjonen bekrefter ikke at de seks praktiske øvelsesscenarioene er oppdiktet. Derfor er bygningsegenskaper og observasjoner i showcase-øvelsen erstattet med seks nye, tydelig merkede syntetiske case.

## Kopi og sikkerhet

Ruten bevarer kildens deler, undervisningstekster, eksempler, scenarioer, graderingsfeedback, quizspørsmål, poengberegning, progresjon og navigasjon. Den har en tydelig avgrensning om at innholdet er illustrativt og ubekreftet, og ikke skal brukes ved faktiske bygg-, sikkerhets- eller vedlikeholdsbeslutninger. Kildens oppgitte 2012-grunnlag er merket som ubekreftet. «Nullstill hele demoen» nullstiller øvelsessvar, quizsvar og resultater, åpne akkordioner og navigasjon.

De seks praktiske øvelsescasene SYN-01–SYN-06 er oppdiktet for denne demoen. Case-ID-er, bygningsegenskaper og observasjoner er laget på nytt og merket «Oppdiktede observasjoner». Øvelsens seks elementer, datafelter, TG-valg, fasitstruktur, fremdrift, poengberegning og tilbakemeldingsflyt er beholdt. Ingen kildebaserte scenario- eller persondetaljer vises. All samhandlingstilstand finnes i JavaScript-minnet mens siden er åpen og slettes også ved omlasting. `localStorage` brukes ikke, siden kilden ikke lagrer tilstand. Ruten har ingen API, nettverkskall, autentisering, serverlagring, skjemafelter, cookies, PII, hemmeligheter eller tredjeparts runtime.

## Usikkerhet

- Ingen lisens eller uttrykkelig gjenbrukstillatelse ble funnet. Ruten gjengir kildeinnhold etter oppdraget; rett til offentlig gjenbruk er uavklart.
- Kilden viser ikke til en autoritativ standardtekst eller kilder. Faglig riktighet, aktualitet og sikkerhetsmessige følger er ikke vurdert av fagperson.
- Kilden har ingen tester eller dokumenterte akseptansekriterier; produksjonsdrift er ikke kontrollert.
- De opprinnelige kildeeksemplene kunne ikke verifiseres som syntetiske og er derfor erstattet i demoen. Demoen vurderer ikke faktiske eiendommer.

## Validering

`node --test tests/ns3424-lab.test.mjs` kontrollerer metadata, kjerneinnhold, syntetiske case-ID-er og data, funksjonskroker, full nullstilling, rute og fravær av nettverkskall, lagring og auth. Hele showcase-testsettet kjøres med `node --test tests/*.test.mjs`. Lokal HTTP- og Chromium-kontroll verifiserer direktelasting, navigasjon, quiz, øvelse, nullstilling, oppdatering av siden, mobilbredde, konsollfeil og eksterne forespørsler. Kildetester finnes ikke. Deploystatus: ikke deployet.
