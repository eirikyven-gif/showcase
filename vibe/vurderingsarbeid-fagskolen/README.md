# Vurderingsarbeid · fagskole

Kildebasert lokal kopi på `/vibe/vurderingsarbeid-fagskolen/` fra `eirikyven-gif/app-vurderingsarbeid` commit `73cb9eded2f6517e3ebfbed45bdaf8e70395dac3`. Kildekoden er ikke endret. Direkte sammenligning og dekning står i [PARITY.md](PARITY.md).

## Arbeidsflyt

Kopien beholder importkontroll, Excel-mal og datasettimport/-eksport, svarsett og vektet rubrikkscore, K0/formelle krav, elev- og kulloversikt, progresjonsfiltre, individuell vurderingsnullstilling, elevflytting, tekstlig oppsummering, fremovermelding underveis, sluttvurderingsutkast, redigering, kopiering av promptgrunnlag og eksplisitt godkjenning av slutttekst. Standardelevene og vurderingsdataene er syntetiske. Rubrikk, svarsett og eksempeloppgavetekst beholder kildeappens arbeidsmal; student-ID/-navn/-klasse er erstattet med tydelige syntetiske etiketter.

KI-panelet er en **lokal simulering**, ikke KI: genereringsknappene lager et deterministisk struktureringsutkast fra aktiv vurdering og kaller ingen modell. Kildeappens eksterne provider, API-nøkkel, tilkoblingstest og nettverksgenerering er tatt ut. Promptgrunnlaget vises før brukeren velger å kopiere det. Lokal styringstekst lagres på enheten.

## Lokal data og personvern

Excel-filer og vurderingsdata behandles i nettleseren. Endringer lagres i `localStorage` på enheten og sendes ikke til en server. Ikke importer ekte studentopplysninger. Kopiert prompt kan inneholde oppgavetekst, svar og stikkord; eventuell deling etter kopiering styres av brukeren. «Nullstill demo» fjerner lokale arbeidsdata. XLSX-biblioteket er bundlet lokalt, uten CDN.

## Kilde og status

Kildebevis, funksjonsmatrise og sikkerhetsunntak er dokumentert i [PARITY.md](PARITY.md). Showcase-baseline er `origin/main` `38518a5466b8a3f9098d916c0f9190c696ffb0d9`, `VERSION 0.60.1`; denne endringen foreslår `0.61.0`. Issue #2 er delvis løst mens ekte ekstern KI-tjeneste er erstattet av lokal simulering. Lisens/gjenbrukstillatelse er ikke funnet i gjennomgått kildemateriale og må avklares. Draft PR; ikke merget eller deployet.

## QA

`node --test tests/*.test.mjs`: 110/110 tester bestod. Playwright/Chromium-QA på 1365px kontrollerte de to syntetiske elevene, per-elev underveisutkast, promptvisning uten elevnavn/ID, fullstendig vurdering, redigering/godkjenning og at ikke-godkjent sluttutkast holdes utenfor eksport. Mobil/desktop bredder 320, 375, 390, 768, 1024 og 1365px hadde ingen horisontal overflow. Lokal styringstekst overlevde reload; Nullstilling fjernet lokal arbeidsøkt. Ingen off-origin requests eller JS/runtime-feil. Én nettleserstandardforespørsel etter `/favicon.ico` ga 404 på den lokale testserveren; ruten bruker ingen favicon i denne isolerte servertesten. Testene dekker representative arbeidsflyter, ikke alle Excel-varianter eller full WCAG-/skjermleser-/enhetstest.
