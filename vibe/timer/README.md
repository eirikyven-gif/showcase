# Timer v1.2.0 — tro Showcase-kopi

**Rute:** [`/vibe/timer/`](/vibe/timer/)
**Issue #2:** Delvis løst av denne app-PR-en.

## Kilde og funksjonalitet

Kilde: `eirikyven-gif/diverse-apper/apps/timer`, offentlig `main` commit `0900ffe48fa92dcefae1c6d0bbee8e0d02eec530`. Kilderepoet er kun lest og er ikke endret. Kildens README og HTML/JavaScript er gjennomgått. Den lille appen har ett sekundfelt (standard 60), start, pause/fortsett, nullstill til gjeldende feltverdi, nedtelling, ferdigtilstand, status meldt med `aria-live` og lenke tilbake til tidtellerportalen. Timeren bruker ett intervall om gangen. Kildens README oppgir ingen automatiserte tester, kun manuelle testpunkter. Delte kilde-UI-filer gir portal-/stilavhengigheter; showcase-ruten bruker Vibe-ramme og egne lokale stiler. Interaksjonene og statusetikettene følger kildeappen, og portaltilbake peker til showcase-kopien av Tidteller.

## Begrensninger og personvern

Timeren kjører lokalt i fanen. Det finnes ingen innlogging, konto, API, nettverkskall, serverlagring, localStorage, cookies, personopplysninger, secrets eller eksterne/private data. Kildeappen lagrer ikke timerverdien; valg og nedtelling forsvinner ved innlasting eller når fanen lukkes. Ingen simulert ekstern tjeneste er nødvendig.

## QA

- Showcase-testene validerer katalogmetadata, direkte rute, kontrollene, tastaturtilgjengelig markup, ingen lagring/nettverk og rutekoblinger.
- Manuell QA: direkte åpning/refresh, start, pause, fortsett, nullstill, endring av sekunder, ferdigstatus og retur til hub.
- Mobilbredder 320–1440 px, tastaturrekkefølge, synlig fokus, etiketter/live-status og redusert bevegelse kontrolleres.
- Ingen egen build-/lintkommando er konfigurert; statiske JavaScript-syntakssjekker og hele Node-testsettet kjøres.
- Deploy: ikke utført. PR: `#2` delvis løst; ingen selv-godkjenning eller merge.
