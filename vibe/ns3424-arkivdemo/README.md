# NS 3424 · arkivert læringsapp

Showcase-rute: `/vibe/ns3424-arkivdemo/`.

## Kilde

`eirikyven-gif/ns3456`, arkivert commit `5c58678269fb2c24d83af8afedeb65c8878732ff`, tree `142c31e21eb1afe5f10eeee23f3d8cb145209745`. Appfil: `app/app-fdvu-ns3424_v0.1.1.html`, blob `fe8376dc96e81eefbda9b1f399a0e6e1c19d4c4b`. Kilderepoet er lest skrivebeskyttet. Uavhengig gjennomgang av synlige skjermer og arbeidsflyter ligger i [PARITY.md](PARITY.md).

## Funksjon og avgrensninger

Ruten gjengir kildens læringsoversikt med 11 moduler: start, formål/avgrensning, analysenivå 1–3, TG/TGIU, KG/sannsynlighet/risiko, observasjon versus tolkning og fem caser. Quiztilbakemelding, mini-case med 200-ords grense, modulavslutning, casearbeidsark og fremdrift simuleres lokalt i sideminnet. Casearbeidsarkene følger feltene og fullføringsvilkårene i den pinnede HTML-appen: analysenivå, observasjoner, TG/TGIU- og KG-/risikobegrunnelser, tre tiltak og et valgfritt felt for videre undersøkelser. MASTER-loggens øvrige skjemaelementer finnes ikke i appens synlige casearbeidsark. Om- og feedbackdialoger har ingen kontaktinfo eller innsending; feedback tømmes når dialogen lukkes.

Alle fem case er merket syntetiske. Auth, kontoer, dev-PIN, KI, feedback-kø, backend/API, identifikatorer, vedvarende lagring, kildekort, forfatterkontakt og private rapportreferanser er fjernet. Kildens arbeidsark omtaler manuell kopiering til rapport, men har ingen innebygd rapport-/PDF-/utskriftsflyt. Denne kopien legger ikke til en slik produktflyt.

Demoen er kun en pedagogisk illustrasjon, ikke faglig veiledning. Innhold er ikke verifisert mot gjeldende standard. Gjenbruksrettigheter er ikke avklart.

## QA/status

Kjør `node --test tests/ns3424-arkivdemo.test.mjs` eller hele settet `node --test tests/*.test.mjs`. Paritetsrettelsen er i PR #100 og avventer releasekøen: #97 v0.60.4, #94 v0.60.5, deretter #100 v0.60.6. VERSION står på main-baselinen v0.60.3 til PR #100 får sin tur; PR-en er draft, ikke merget eller publisert.
