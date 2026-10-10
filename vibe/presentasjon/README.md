# Presentasjonsvisning

## Kilde og samsvar

Sammenlignet direkte med `eirikyven-gif/apps-fagskolen/apps/presentasjon` på offentlig `main`, commit `92379f1108ec71013a06c4e5976a6fe79de81a3e` (tree `8dc2e634ea0583afe22599ccdc8a62fe4c9a7144`), lest 2026-10-10. Hovedkildene var README, student- og lærervisning, felles presentasjonsrenderer og tidsstyring, kontrollforhåndsvisning/-status, kontrollinnstillinger og kildetester. Ingen kildefiler er endret.

Demoen bevarer de observerbare funksjonene: to separate visninger; blaing med knapper og piltaster; automatisk lysbildefremdrift; tidsintervall for lysbilder og versjonskontroll med validering og standardtilbakestilling; status/klokke; fullskjerm; og onsdagens 11:45–12:15 bingo/nedtelling i `Europe/Oslo`. Den har også en tidsbegrenset forhåndsvisning av bingo. Lysbildetekster, illustrasjoner og bingoeksempel er skrevet for demoen.

Kildens produksjonsbilde-manifester, gjenoppretting av nettverksfeil og overgangsrenderer er representert av lokalt innebygde dekker og en lokal versjonskontrollindikator. Ingen kildebilder, presentasjonstekster, elev-/lærerdata, betalingsinformasjon, identifikatorer, URL-er for redigering eller hemmeligheter er kopiert. Kildeinnholdets fullstendige slide-for-slide innhold er utilgjengelig i kildearkivet: det leveres fra privat runtime-konfigurasjon og Google Slides. Dette er den viktigste samsvarsbegrensningen.

## Personvern og lagring

Kilden bruker Google Slides/Apps Script, PNG-publisering og servermanifester, PHP/API-er, en innlogget passordbeskyttet kontrollflate, privat serverkonfigurasjon og webhook-hemmelighet. Denne statiske demoen fjerner alt dette. Den bruker bare innebygde syntetiske data, nettleserens klokke og presentasjons-API-et for fullskjerm. Ingen nettverkskall, auth, cookies, API-er, localStorage, sessionStorage, opplasting eller telemetri. Kontroller og testinnstillinger lever bare i sidens JavaScript-minne og forsvinner når siden lastes på nytt; ingen lokal lagring er implementert.

Bingoeksemplet viser `DEMO-000` og `0 kr`; det ber ikke om eller sender betaling. Demoen er ikke et reelt undervisningsprodukt.
