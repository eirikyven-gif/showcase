# Emneoversikt — konsept

Original, statisk konseptside for en fagskoleemneside. Innholdet er oppdiktet og skrivebeskyttet.

| Felt | Vurdering |
|---|---|
| Slug | `emnebeskrivelser-editor` |
| Use case | Se en samlet eksempeloversikt over et emne, fra metadata og læringsutbytte til plan, arbeid, pensum og vurdering. |
| Kategori | Utdanning |
| Målgruppe | Undervisere, studieplanleggere og personer som utforsker emnepresentasjon. |
| Status | Kandidaten beholdes i bred førstegangsvurdering. Originalt konsept; ingen kuratering eller utsiling. |
| Konseptverdi | Viser struktur og informasjonsprioritering uten å utgi seg for å være en fungerende editor. |
| Syntetisk innhold | Fiktivt emne «Bærekraftig materialbruk», kode BYG-204, metadata, læringsutbytte, melding, fire planrader, to arbeidskrav, tre ressursoppføringer og vurderingsformat. Ingen virkelige kurs, studenter, ansatte eller institusjoner. |
| Full kandidatstruktur | Kildedokumentasjonen beskriver emnenavn, kort beskrivelse, emnekode, semester, emneansvarlig og sist oppdatert; nyheter; generell informasjon; fremdriftsplan med uke, tema, undervisning/aktivitet, pensum, oppgave/fristsignal og status; oppgaver; pensum; arbeidskrav; eksamen; ekstra seksjoner; footer og versjonsinformasjon. Kildens utvidbare komponenter omfatter toppbilde med alt-tekst/bildetekst, tabeller, lenker/ressurser, kontakt, FAQ, vurderingskriterier, veiledning, datoer, læringsutbytte, begreper, prosjekt og praksis. Konseptet viser representative generiske felt, ikke alle komponentene. |
| Risiko | Emnesider kan inneholde studentaktivitet, personopplysninger, kontaktdata, interne fagtekster eller upublisert materiale. Ingen slikt innhold eller kildetekst er kopiert. |
| Forenklinger | Ingen editor, skjema, fritekst, endringer, PIN, tilgangskontroll, studentvisning, lagring, lokal historikk, import/eksport, opplasting eller eksterne ressurser. |
| Teknisk omfang | Lokale HTML- og CSS-filer. Ingen JavaScript, nettverkskall, API, cookies, nettleserlagring, kontoer, server eller tredjepartsbiblioteker. |

## Kildeinventar og usikkerhet

Kandidatkilden er `eirikyven-gif/fagskolen-emnebeskrivelser`, under `app/`. Offentlig `main` ved commit `d5bc306bc9f017354bd487ff8608b0659196e4dd` og dokumentasjon ble lest 2026-10-09; kilderepoet er ikke endret. README-en skiller mellom en variant uten PIN-lås og en PIN-variant. Dokumentasjonen beskriver offline, enkeltfilbasert redigering og eksport. PIN-dokumentasjonen sier at frontend/offline-PIN ikke gir fullverdig sikkerhet. PIN-varianten sammenligner en lokalt avledet PBKDF2-verdi i nettleseren og låser opp editorgrensesnittet; det er ikke servervalidert identitet eller tilgangskontroll. Varianten laster også en separat PIN-konfigurasjonsfil fra samme mappe. Kodeinventaret viser lokal nettleserlagring av redigert side/palett og en separat lokal snapshot-historikk. PIN-konfigurasjonen ble kontrollert, men ingen PIN-verdi, hash, salt eller annen kildehemmelighet er gjengitt eller gjenbrukt.

Det er rapportert en mulig tilsvarende appfamilieversjon under `apps-fagskolen`; forholdet er ikke verifisert. Aktiv versjon, faktisk distribusjons-/lagringsbruk og rettighetsstatus for innhold er uavklart. Ingen kildeinnhold, kode, skjermbilder, stiler, emneeksempler eller persondata er overført. Ingen lisensfil ble funnet i den inspiserte kilderoten. Eventuell senere kildebruk krever derfor egen avklaring av rettigheter, duplisering og innholdsrisiko.

## Personvern og drift

Siden viser bare forhåndsskrevet, syntetisk innhold. Ingen interaktive felt eller mekanisme for å lagre, sende, laste opp eller hente data. Nettleseren laster kun rutens egne HTML- og CSS-filer.

## QA for showcase-ruten

`node --test tests/*.test.mjs` består i showcase-repoet. Kilde-repoet har ingen egen testmappe, package.json eller testscript; dets AGENT.md beskriver manuelle funksjonskontroller som ikke ble kjørt her. Chromium ble kjørt ved 320, 390, 768 og 1440 px uten dokument-overflow; fremdriftstabellen har egen horisontal rulling. Tastatursjekk nådde synlig hopp-lenke og navngitt hjemlenke først. Landemerker, én H1, norske sidemål, tabelloverskrifter og null skjema-/input-/knappelementer ble kontrollert. Browseren lastet kun rutens HTML og lokale CSS; ingen konsollfeil eller eksterne forespørsler. Dette er en manuell nettlesersjekk, ikke en full WCAG-revisjon med skjermleser.
