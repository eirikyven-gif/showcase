# Soundscape · kildevurdering og konseptdemo

**Issue #2:** Delvis løst av dette isolerte kandidatbidraget. Dette er ikke en full port eller produksjonsutrulling.

## Katalogmetadata

- **Navn:** Soundscape · vær som lyd.
- **Bruksområde:** Utforsk en forenklet vær- og lydskisse med tydelig avgrenset temperatur-/tone-interaksjon.
- **Kategori:** Musikk og eksperimentering.
- **Målgruppe:** Lydinteresserte, musikere og personer som utforsker værvisualisering.
- **Status:** Beholdt i bred førstegangsrunde. Original, forenklet demo; ingen kuratering eller utsiling er gjort.
- **Foreslått slug/rute:** `soundscape` · `/vibe/soundscape/`.
- **Demoens verdi:** Syntetisk temperatur justerer tonehøyden i en lokal Web Audio-tone. Syntetisk vind justerer bare en visuell indikator og påvirker ikke lyden.
- **Forenklinger:** Én oscillator, én volumkontroll og syntetisk temperatur/vind. Ingen livevær, solsyklus, luftmålinger, admin, parametereditor, profiler eller generativ flerstemthet.
- **Risiko:** Kilden har en betydelig server- og personvernflate (admin, OAuth, stasjonsdata og historikk) som demoen utelater. Demoen er ikke en værmelding eller fullgod gjengivelse av kildeproduktet. Lyd spilles kun etter eksplisitt brukerhandling.
- **Omfang:** Isolert, statisk rute. Web Audio og eksempelverdier finnes bare i fanens minne. Ingen nettverksforespørsler, browserlagring, konto, API, autentisering, opplasting eller serverfunksjon.
- **Kilderettigheter:** Kilderepoet inneholder ingen identifisert lisens i gjennomgåtte appfiler. Rettigheter til kildekode, visuell utforming og innhold er uavklart. Showcase-demoen er implementert selvstendig uten kopierte kildefiler, tekst, grafikk eller kode.

## Kildebelegg og usikkerhet

- **Kilde og versjon:** `eirikyven-gif/diverse-apper/apps/soundscape`, `main` commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`, kontrollert 2026-10-09. Kildens README og `package.json` oppgir v0.8.0. Kilde-repoet ble bare klonet og lest.
- **Formål og status:** Kildens Notion-governance og låste SSoT beskriver en autonom offentlig vær-til-generativ-lyd-installasjon med eksakte liveverdier, Netatmo som primær datakilde, MET som fallback/leverandør for andre felt, og en separat autentisert admin som styrer sentral servertilstand. README beskriver også en PWA-pilot, med fysisk iPhone-bakgrunnstest som fortsatt produksjonsport. Faktisk produksjonsstatus er ikke uavhengig bekreftet. Kandidatens governance-rad er oppgitt her: [Soundscape](https://app.notion.com/p/3f3ba9485bce8140bdfddcb578987c83).
- **Stack:** HTML, CSS, JavaScript-moduler, Web Audio/AudioWorklet, service worker/PWA og PHP API. Admin- og runtime-kontrakter ligger i `assets/`, `api/`, `index.html`, `admin.html` og `service-worker.js`.
- **Tester:** Kildens `package.json` definerer `check` med `node --check` for runtime-skript og `test` med `node --test tests/*.test.mjs`. Ni testfiler finnes. Testene ble ikke kjørt som del av denne kildevurderingen.
- **API, auth og lagring:** Kilden dokumenterer Netatmo OAuth og MET-data hentet server-side, admininnlogging/-sesjon, sentral konfigurasjon/revisjon og serversidig datalagring. README sier at koordinater og OAuth-hemmeligheter/tokens håndteres server-side, mens værdata caches. Nettleserlagring brukes av kildens PWA-pilot; serverruntime er sannhetskilde for delte profiler. Demoen avslører eller kaller ingen kildeendepunkter. Dette er kildebeskrivelse, ikke uavhengig produksjonsrevisjon.
- **Personvern:** Kildeappen kan behandle Netatmo-stasjonsdata, koordinater, autentiserings-/OAuth-data, adminendringer og runtimehistorikk. Den faktiske driftskonfigurasjonen, brukerne, retention og behandling er ikke kontrollert. Ingen slik data eller mekanisme er tatt med i demoen.
- **Audience og status:** README beskriver offentlig lytteflate og admin for konfigurering. Reell brukermasse og aktiv utrulling er ikke bekreftet.
- **Rute:** `/vibe/soundscape/` og sluggen er kontrollert unike mot katalogen på showcase `main` `68a4396c7455ddeef8824eb0a65f41acf351c988` (31 ruter). Dette er en ny rute.

## Sikkerhets- og personvernkontroller

- Ingen eksterne URL-er, API-kall, auth, OAuth, konto, cookies eller session-logikk.
- Ingen browser- eller serverlagring; ingen opplasting eller personopplysninger.
- Ingen hemmeligheter, kildeverdier eller kildeaktiva.
- Web Audio opprettes først etter «Start lyd». «Stopp lyd» suspenderer lokal AudioContext.
- Tastaturbetjente native knapper/skyvere, synlige labels, fokusstil fra Vibe-huben og støtte for redusert bevegelse.
- Direkterute, kanonisk URL og lenke tilbake til huben er med.

## Begrensninger

Demoens lyd er én enkel oscillator: temperatur justerer tonehøyden; vind justerer bare den visuelle indikatoren og påvirker ikke lyden. Værverdiene er syntetiske; de er verken liveverdier eller en trofast avbildning av kildeverdiene. Tonejusteringen representerer ikke kildens signal-/parameterkoblinger eller produksjonslydmotor. Dette skiller seg med vilje fra SSoT-ens autonome offentlige installasjon med konkrete liveverdier og sentral, adminstyrt runtime. Ingen kildeendepunkter eller kildeinnhold gjengis i demoen. Rettighetsgrunnlaget for kildeappen er uavklart.
