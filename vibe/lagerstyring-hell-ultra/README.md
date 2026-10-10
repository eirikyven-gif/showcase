# Lagerstyring Hell Ultra

Statisk, isolert demo på `/vibe/lagerstyring-hell-ultra/`. Sammenlignet direkte mot WordPress-pluginen ved kilde SHA `f1f13246677d15de24e84070d8dad74f2a0376ee`. Den bevarer portal-, vare-, liste- og adminarbeidsflytene med syntetiske data. Endringer er kun i minnet for gjeldende sideøkt.

## Ruteavklaring

Kildeportalen er shortcode `[hul_inventory_portal]` på en WordPress-side som administratoren selv velger i innstillinger. Sluggen kan derfor ikke utledes fra repoet. Kildens CPT-rute `/lager-enhet/{post-slug}` videresender til `/hul-lager/item/{32-tegns-token}`, og delte lister bruker `/hul-lager/liste/{32-tegns-token}`. Demoen mapper disse til `#/`, `#/item/{syntetisk-id}` og `#/list/{lokal-liste-id}` under showcase-ruten. Ingen authorization-token kopieres. `lagerkart-vinter` er et separat posisjonskart for vinterlagrede kjøretøy, ikke samme brukerflate.

## Funksjoner bevart

- Offentlig portal med navnesøk, status-/kategori-/plassering-/arrangementsfilter, sortering, gruppering, kort-/tabellvisning, antall treff og tomtilstand.
- Varedetalj med status/tilstand, metadata, beskrivelse/notat, frontend-synlige bilde-/vedleggseksempler, PDF-lignende forhåndsvisning, lokale/globale attributter, underelementer, aktivt utlån og historikk.
- Delte lister med tittel/beskrivelse, aktive/inaktive/utløpte/tomme tilstander, kort-/tabellvisning og varelenker.
- Adminflater for dashboard, vareliste/filtre/quick edit/CRUD, redigering av varer/attributter/underelementer/media, taksonomier, samlelån/retur/historikk/eldre enkeltlån, låntakere, delte lister, pakker og liste fra pakke, import/eksport, innstillinger og testdata.
- XLSX-mal og eksport med `DATA`, `FORKLARING`, `GYLDIGE_VERDIER`; lokal import med forhåndsvisning, validering, bekreftelse og avbryt.

## Sikkerhetsgrenser og avvik

- ingen WP-auth, API eller server/database-persistens: WP-innlogging, capabilities/nonces, server-/databasepersistens, magic-linktoken, ekte låntaker/personopplysninger, private mediefiler, private tjenester og secrets er fjernet. Rollevalget er kun UI-simulering, ikke tilgangskontroll.
- Forhåndslastet innhold er merket syntetisk. Lokalt valgte media/XLSX-filer blir i nettleserøkten; appen bruker ikke API, nettverkskall eller nettleserlagring. Omlasting nullstiller endringene.
- Kildens rollebaserte kapabiliteter simuleres ikke som sikkerhet. En liste-ID i demoen er bare en eksempel-ID, ikke en adgangshemmelighet. WP-side-sluggen for shortcodeportalen er uavklart.
- XLSX-parseren er laget for lokal filbehandling og er QA-et med demoens egen eksport; eksterne leverandør-XLSX-varianter bør fortsatt verifiseres før noen hevder full filformatkompatibilitet.

## QA

Nettleser-ende-til-ende kontroll dekker portalfiltre/visning, detaljmedia/utlån, listetilstander, quick edit, vareeditor/underelement/media, legacy retur, låntaker/lån/retur, liste, pakke, taksonomi, innstillinger, testdata, XLSX eksport/import og mobilbredde. Statisk route/safety-test og full repo CI kjøres i PR #94. Dekningsmatrise, kildebevis og åpne avvik ligger i [`docs/lagerstyring-hell-ultra-parity.md`](../../docs/lagerstyring-hell-ultra-parity.md) og PR-beskrivelsen. Draft forblir draft til alle eventuelle parity-gap er løst og verifisert.

Kjør lokalt fra repo-roten: `python3 -m http.server 8000`, åpne `http://localhost:8000/vibe/lagerstyring-hell-ultra/`.
