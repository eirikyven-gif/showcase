# Vurderingsarbeid: kildeparitet

Kilde: `eirikyven-gif/app-vurderingsarbeid`, commit `73cb9eded2f6517e3ebfbed45bdaf8e70395dac3`. Sammenligningen er gjort mot `app/vurderingsverktoy.html`, `docs/ssot/ssot_vurderingsverktoy_v0.1.17.md` og `docs/ki/KI_DATAGRUNNLAG_OG_FALLBACK.md` ved denne committen. Kildecheckout forble uendret.

## Dekningsmatrise

| Kildeområde | Kildebevis | Showcase-implementasjon | Dekning |
|---|---|---|---|
| Rubrikk og vurdering | Kilde-HTML `scoreKriterium:814`, `setSvar:2000`; SSoT `6.1–6.4`, KRF-1–64 | Kriterier, svar/poeng, vekting, indikator, K0 og stikkord per punkt/kriterium | Bevart; klikket i browser på kildearbeidsboka |
| Excel-mal, import og kontroll | Kilde-HTML `importFromWorkbook:958`, `downloadMal:1486`, `startExcelImportFlow:2737`; SSoT `6.2`, KRF-70–80 | Kildegenerert mal med de sju arkene importeres i browser etter anonymisering. Showcase-mal genereres separat. Importkontroll og to-trinns ny-import-reset beholdes. | Bevart; kildearbeidsbok-fixture kjørt |
| Oppgavetekst og rubrikkgrunnlag | Kilde-HTML `importFromWorkbook:958`, `buildDataPrompt:2107`; KRF-47–49 | Importert Oppgavetekst blir med i eksport og prompt; oppgaveinnholdet følger kildemalen. | Bevart; assert på kildeoppgaveteksten |
| Datasett per kull | Kilde-HTML `exportDatasett:1338`, `importDatasett:1402`; KRF-74–75 | Kullarbeidsbok med fingerprint, studenter, svar, stikkord og resultatmetadata eksporteres og leses tilbake. | Bevart; faktisk XLSX-rundtur i browser |
| Student- og kullflyt | Kilde-HTML `getFilteredStudentsForOversikt:2873`, `setStudentOversiktFilter:2914`, `renderStudentOversikt:2925`, `openNyttKullModal:3363`, `openFlyttModal:3382`, `bekreftFlyttStudent:3404`; KRF-57a–d | Oversikt/progresjonsfilter, kulloppretting/-bytte og flytting av student med vurderingsdata | Bevart; filter, oppretting og flytting kjørt i browser |
| Vurderingsreset og personvernreset | Kilde-HTML `openNullstillVurderingModal:3091`, `bekreftNullstillVurderinger:3183`; showcase `resetDemoData` | Bekreftet reset per elev, full lokal nulstilling | Bevart; begge browser-handlinger kjørt |
| Oppsummering/eksport | Kilde-HTML `exportTekst:2482`; KRF-57–64 | Tekstlig oppsummering inneholder arbeidsgrunnlag og godkjent slutttekst. Utkast vises ikke som godkjent. | Bevart; begge tilstander kontrollert |
| Underveis-fremovermelding | Kilde-HTML `buildDataPrompt:2107`, `copyKiFremoverPrompt:2424`, `genKiFremover:2432`; KRF-65, 69a–d, 82–84, 91, 98–101 | Kildens tre promptinstruksjoner beholdes. Lokal regelbasert tekst viser registrerte svar/mangler, kan redigeres, lagres per elev og nullstilles. | Interaksjon bevart; ekstern KI-kvalitet er ikke simulert |
| Sluttvurdering | Kilde-HTML `copyKiEndeligPrompt:2428`, `genKiEndelig:2458`, `godkjennSlutttekst:2071`; KRF-66–69, 97, 99, 122 | Kildens fem promptblokker, 3–5 fremoverpunkter og K0 «kun hvis relevant» beholdes. Ordinære punkt må være besvart; utkast redigeres og godkjennes eksplisitt. | Interaksjon bevart; faktisk provider-generering er fjernet |
| Prompt/manual fallback | Kilde-HTML `buildSystemPrompt:2089`, `buildAiClipboardText:2097`, `buildDataPrompt:2107`, `copyKiPromptFromModal:2372`; KI-notat `24–76` | System- og datapromptens kildeinnhold, svar/stikkord/indikator/K0 og type-spesifikke instruksjoner vises før kopiering; manuell fallback ved clipboard-feil. | Bevart; identitetsfelt sendes ikke inn i prompt |
| KI-innstillinger | Kilde-HTML `openInnstillinger:2699`, `saveAiKey:2604`, `testKiOppsett:2676`; KRF-103–121 | Lokal styringstekst og reset; provider/modell/nøkkelkontroller fjernet. | Delvis; begrunnelse per funksjon i funksjonsregisteret |
| Person-/konto-/serverdata og secrets | KI-notat `66–76`; SSoT KRF-93, 104–121 | Syntetisk startdata. Ingen auth/konto/server, nøkkel, privat tjeneste, fetch/XHR eller eksterne ressurser. Importert innhold lagres bare i localStorage, opplyst og slettbart. | Sikkerhetsredusert |

## Direkte kildeinventar

Inventaret bygger på uendret `app/vurderingsverktoy.html` ved SHA `73cb9eded2f6517e3ebfbed45bdaf8e70395dac3`. Det finnes 141 unike navngitte funksjonsdeklarasjoner i fila. [FUNCTION-COVERAGE.json](FUNCTION-COVERAGE.json) viser hver deklarasjon med kildelinje, bevart funksjon, lokal erstatning eller konkret sikkerhetsbegrunnelse. 103 beholder kildens funksjonsnavn, 9 har en eksplisitt lokal/sikrere erstatning og 29 er fjernet fordi de håndterer reelle provider-nøkler, eksterne kall/responser eller falsk tilkoblingsstatus. `importFromWorkbook` beholder kildeflyten for gyldig ny arbeidsbok; hvis en bekreftet nyimport gir blokkere, beholder demoen forrige lokale økt og viser importkontrollen. Kilden nullstilte økten også ved blokkert arbeidsbok. Dette avviket hindrer utilsiktet lokalt datatap og er browser-testet. Inventaret er kontrollert av Node-testen.

`tests/fixtures/vurderingsarbeid-source-template-synthetic.xlsx` er faktisk generert ved å åpne den låste kilde-HTML-en og aktivere `downloadMal()` i browser. Bare student-ID/navn/klasse er skiftet til `DEMO-01/02`, `Eksempelstudent A/B` og `Syntetisk eksempelgruppe`; alle kildeark, rubrikk, svarsett, terskler og Oppgavetekst er beholdt. Showcase-importen er kjørt mot denne fila. Kilderepositoriet forble uendret.

## Browser-, tastatur- og responsive QA

`qa/vurderingsarbeid-browser.mjs` kjører kildearbeidsbok → import, ugyldig arbeidsbok → blokkering uten å miste tidligere økt, rubrikkscoring → søk/indikator/progresjon/K0-filtre, kulloppretting/-bytte, vellykket flytting med bevart vurdering, duplikat-ID-konflikt, individuell reset, datasett-XLSX-eksport/import, promptforhåndsvisning, elevbundet underveisutkast, sluttprompt, generering, eksplisitt godkjenning og eksport. Kildens endelige promptkrav er kontrollert direkte: fem blokker, 3–5 fremoverpunkter og K0 bare hvis relevant. All nettlesertrafikk holdes på samme origin. Kontrollert manuelt: 4/4 browser-scenarier passerer.

KI-støtte-skjermbilder for 1365px og 375px er inspisert. Tastaturtest bekrefter tab/Enter-navigasjon, synlig tastaturfokus og navn på synlige kontroller; bredder 320, 375, 390, 768, 1024 og 1365px har ingen horisontal dokument-overflyt. Nettleserens automatiske `/favicon.ico`-forespørsel gir 404; appen har ingen favicon-lenke eller egen favicon-forespørsel, så det er ikke lagt til et nytt asset.

## Presise forskjeller/gjenstående gap

- Ekte Gemini/OpenAI/Claude-generering er ikke implementert. Den lokale «Generer»-handlingen bygger kun nøkterne, regelbaserte utkast av registrerte svar/indikator/K0. Dette er ikke en språkmodell og gir ikke KI-kvalitet. Dette er en bevisst sikkerhetsgrense; derfor er Issue #2 fortsatt merket delvis løst.
- Provider/model-valg, API-nøkkellagring/visning/fjerning, ekstern oppsettstest, tidsstempler og leverandørfeilkategorier er fjernet, ikke simulert som falske vellykkede tjenester. Innstillingspanelet beholder redigerbar global styringstekst og lokal reset; lokale innstillinger lagres i samme lokale arbeidsdata.
- Manuell promptkopiering kan føre vurderingsgrunnlag ut av nettleseren først hvis brukeren selv limer det inn et annet sted. Varsel vises både ved funksjonen og før kopiering. Standarddata er syntetiske; egne importer kan likevel inneholde sensitive personopplysninger.
- Ingen lisens eller eksplisitt tillatelse til gjenbruk ble identifisert i de undersøkte kildefilene.

## Kontrollpunkter

- Exact source SHA og katalogversjon testes i `tests/vurderingsarbeid-source-faithful.test.mjs`.
- Ingen kildefiler ble endret.
- Runtime kontrolleres for nettverkskall, leverandør-URL-er, nøkler og CDN.
- Full suite/browser-QA-status skal registreres ved PR-review. Draft skal beholdes inntil parity og sikkerhetskontroller er gjennomgått.
