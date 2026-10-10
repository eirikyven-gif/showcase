# Vurderingsarbeid · fagskole

Funksjonell lokal showcase-kopi på `/vibe/vurderingsarbeid-fagskolen/`, basert på `eirikyven-gif/app-vurderingsarbeid` commit `73cb9eded2f6517e3ebfbed45bdaf8e70395dac3`.

## Arbeidsflyt

Importer og eksporter rubrikk/datasett som Excel, gi rubrikksvar med kriterievekting og indikatorer, følg student- og kullprogresjon, filtrer oversikten, flytt studenter mellom kull og nullstill vurderinger. Ved første åpning vises fiktiv rubrikk, oppgave og de syntetiske «Eksempelstudent A/B». Excel-mal og vurderingsutdrag kan også lastes ned lokalt.

## Lokal data og personvern

Excel-filer leses og skrives i nettleseren. Vurderingsendringer lagres i nettleserens `localStorage` på denne enheten; de sendes ikke til en server. Ikke importer ekte studentopplysninger. «Nullstill demo» fjerner demoens lagrede data. Eldre leverandørnøkkelposter fra tidligere versjoner av denne ruten fjernes ved innlasting.

KI-funksjoner, provider-endepunkter, API-nøkler, autentisering og serverfunksjoner fra kilden er tatt ut. XLSX-biblioteket er bundlet lokalt i `assets/`; ingen CDN eller annen ekstern runtime-ressurs brukes.

## QA og deploy

Kjør `node --test tests/vurderingsarbeid-source-faithful.test.mjs` og `node --test tests/*.test.mjs` (103 tester bestod). Chromium/Playwright QA ved 1365px og 375px bekreftet at eksempelrubrikk og to syntetiske elever åpnes, A har 5/5 svar, studentoversikten viser progresjon, oppretting/flytting til kull virker, datasetteksport kan importeres igjen, og Nullstill demo går tilbake til tom tilstand. Mobilvisning har ikke horisontal overflow. Konsollfeil: 0; nettverksforespørsler: side og lokal XLSX-fil, ingen eksterne forespørsler. QA omfatter ikke full WCAG-gjennomgang eller manuell validering av alle mulige Excel-varianter. Endringen løser Issue #2 delvis. Isolert PR; ingen merge eller deploy.

## Kilde og usikkerhet

Tasken startet på showcase v0.56.0; PR-grenen ble rebased på dagens main v0.57.0. SemVer-bumpen er v0.58.0. Kilde-README, `app/vurderingsverktoy.html`, SSoT v0.1.17 og KI-datagrunnlagsnotatet ble lest ved oppgitt SHA. Ingen kildetestkommando ble identifisert. Lisens eller eksplisitt gjenbrukstillatelse ble ikke funnet i gjennomgått appmateriale; rettighetsstatus er uavklart.
