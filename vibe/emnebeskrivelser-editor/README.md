# Emnebeskrivelser-editor · showcase-kopi

Rute: `/vibe/emnebeskrivelser-editor/`
Kilde: `eirikyven-gif/fagskolen-emnebeskrivelser`, commit `d5bc306bc9f017354bd487ff8608b0659196e4dd`, fil `app/emneside.html` (PIN-fri variant). Kilden er kun lest.

## Hva som er kopiert

Demoen følger den fungerende emneside-editoren: rik tekstredigering og seksjonshandlinger, nyheter, generell informasjon, fremdriftsplan, oppgaver, pensum, arbeidskrav og eksamen; seksjons- og innholdsmaler; lokale bilder og toppbilder; tabeller; paletter; innholdsfortegnelse; ressursoversikt; søk; kontroll- og tilgjengelighetsrapporter; flytting, duplisering, sletting og angre; lokal versjonshistorikk; studentforhåndsvisning; utskrift; og redigerbar/skrivebeskyttet HTML-eksport. Kildens innholdsstruktur og arbeidsflyt er beholdt. Vibe har lagt til rød toppstripe og tydelig demo-/lagringsinformasjon.

Kildegrunnlaget inneholder en generell emnemal, ikke en ferdig fagspesifikk emneside. Derfor bruker demoen malens generiske struktur, eksempelrader og plassholdertekst; fagansvarlig er endret til «Syntetisk fagansvarlig». All grunntekst omtales som syntetisk. Ingen virkelige kurs, studenter, ansatte, institusjoner, kontaktdata eller private API-data er med.

## Forenklinger og personvern

- PIN-varianten og `edit-pin-config.js` er utelatt. Kildeappen sier selv at PIN-låsen kun er en frontend-lås, ikke reell tilgangskontroll.
- Ingen kontoer, server, database, API, cookies eller telemetri. Redigering, lokale snapshots og palett lagres i `localStorage` på samme måte som kildearbeidsflyten. Eksport oppretter en nedlastbar HTML-fil lokalt.
- Appens synlighets- og planleggingskontroller styrer bare den lokale forhåndsvisningen; ingenting publiseres.
- Eksterne bilde-URL-er er deaktivert for å hindre nettverksforespørsler. Bilder kan velges fra enheten og bygges inn i HTML som data-URL.
- Banneret forklarer lokal lagring. «Nullstill lokalt lagret innhold» fjerner innhold, palett og snapshot-historikk for denne demoen og laster siden på nytt.
- Redigeringsfelt kan brukes til å skrive inn egne data. Demoen minner om syntetisk innhold og lokal lagring; brukeren bør unngå å legge inn personopplysninger.

## Kilde og usikkerhet

Kildens `AGENT.md`, `README.md`, `docs/ssot.md`, `docs/pin-redigering.md` og begge HTML-varianter ble lest. Kilde-SSoT angir v1.8.0, mens den PIN-frie HTML-footer oppgir v1.8.4; demoen dokumenterer kildefilens faktiske footer. Kilderoten har ingen testpakke eller package.json. Den oppgir ingen lisensfil eller særskilt gjenbrukstillatelse; rettighetene til kildekode, utforming og originalt innhold er uavklart. Showcase bruker den eksisterende generiske emnemalen etter uttrykkelig oppdrag. Kilderepoet er ikke endret.

## Tester og QA

Showcase-testene kjøres med `node --test tests/*.test.mjs`. Rute og ressurslenker kontrolleres av `vibe-static.test.mjs`. Appspesifikke tester verifiserer kildeversjon, katalogmetadata, alle sentrale arbeidsflyter, syntetisk innhold, localStorage-nøkler og nullstilling, fravær av reelle autentiserings-/nettverksmekanismer og Vibe-/hubruter. Manuelle nettleserkontroller for mobilbredde, tastatur/fokus, dialoger, forhåndsvisning, redigering, eksport og nettverksaktivitet dokumenteres i PR etter gjennomføring.
