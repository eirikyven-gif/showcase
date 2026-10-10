# WP Læringssti · Vibe-demo

En statisk, funksjonell demonstrasjon av WordPress-pluginen WP Læringssti v0.5.6 på `/vibe/wp-l-ringssti/`. Den gjenskaper læringsstiens elevflyt og hovedområdene i redigeringsflaten med syntetiske eksempeldata. Den kjører uten WordPress.

## Kilde og vurderingsgrunnlag

- Kilde: [`eirikyven-gif/WP-l-ringssti`](https://github.com/eirikyven-gif/WP-l-ringssti), offentlig `main`, undersøkt 2026-10-10. Repoet inneholder `wp-learningsti-mvp_v0.5.6.zip`; filene i arkivet ble lest, ikke endret.
- Arkivets pluginheader oppgir v0.5.6. Kilderepoet har ingen lisensfil. Showcase-koden er derfor skrevet selvstendig ut fra kildeappens observerbare funksjoner og bruker ikke PHP-, JS- eller CSS-kildefiler fra pluginarkivet.
- Arkivets `README.txt` sier at quiz og case ikke finnes i v0.5.6, mens PHP- og frontend-JS-koden inneholder quizvalidering, caseoppgave og KI-stubber. Masterloggen `Import` beskriver også v0.5.6-playerflyt. Demoen følger den implementerte pluginoppførselen; kildebeskrivelsenes sprik er fortsatt en usikkerhet.
- Det finnes ingen kurskonfigurasjon eller faktiske kursinnhold i repoet. Parsellinnholdet her er syntetisk, og viser strukturen framfor å fremstille seg som et originalt kurs.

## Funksjoner som er bevart

- Moduloversikt med status, låst modul og modulvis gjennomføring.
- Ett innholdselement om gangen med Forrige/Neste, fremdrift, fullføring og retur til oversikten. Neste på quiz blir tilgjengelig etter riktig svar.
- Faktaboksrader, accordion, hirarki, globale tidslinjeelementer og tekst.
- Quiz med radio-/flervalg, tilbakemelding ved rett/feil, og Dypdykk (KI)-stub etter riktig svar.
- Caseoppgavetekst, leveransekrav, utkast med midlertidig lagre/slette og KI-sensor-stub.
- Redigeringsområder for moduler/elementer, global tidslinje og sti-media; modul-/elementrekkefølge, quizvalg/riktige svar, innholdsredigering og lokale redigeringshandlinger.

## Bevisste demoavgrensninger

- Alle navn, moduler, tekst, tidslinjer og medier er tydelig syntetiske. Ingen personopplysninger eller privat tjenestedata brukes.
- Redigerings- og elevfunksjoner er lokale i fanens minne. Oppdatering nullstiller alt; ingenting sendes, cookies eller nettleserlagring brukes ikke.
- Quiz vurderes lokalt i nettleseren. Riktig svar er dermed synlig i kildefilene og har ingen sikkerhets- eller vurderingsverdi.
- «Dypdykk (KI)» og «KI-sensor» åpner forklarende dialoger, men kaller ikke en KI-tjeneste. Sti-media er illustrasjoner, ikke WordPress-attachments.
- WordPress/Gutenberg-blokk, posttype, roller og capability-kontroller, serverlagring, AJAX, servervalidert fasit, mediebibliotek og eventuell produksjonsintegrasjon er ikke med.
- Demoen gir en forhåndsdefinert rollefølelse via låst modul, uten innlogging eller tilgangskontroll.

## Kjør og kontroller lokalt

Fra Showcase-roten: `python3 -m http.server 8000`, og åpne `http://localhost:8000/vibe/wp-l-ringssti/`.

Kjør fokustestene fra Showcase-roten med `node --test tests/wp-l-ringssti.test.mjs`.
