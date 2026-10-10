# Vinterlagring Fornes

Kildebasert, statisk visning av frontendskallet i `/vibe/vinterlagring-fornes/`.

## Kilde og omfang

Kilden er `eirikyven-gif/vinterlagring`, `main` commit `a26c5e99183bded5549bcb4c1ebd03cf2973cf90` (2026-10-10). Ruten gjengir kildefrontendens startside og de tre eksisterende områdene: registrering, kunde og admin. Kildens `app.js` implementerer ingen handlinger; sidene beskriver selv skjema, tokenvisning og adminfunksjoner som placeholders eller framtidig arbeid. Demoen later derfor ikke som om disse arbeidsflytene virker.

`docs/ssot/CURRENT_SSOT.md` beskriver ønsket framtidig funksjonelt scope. Det omfatter innsending av kunde/enheter, autentisert admin, magisk lenke, hendelser og varsling, database, eksport, fornyelse og arkivering. Dette scope er ikke implementert i kildecommitten som er kopiert.

## Personvern og sikkerhet

Alle viste navn, kontaktverdier, enheter, kjennemerker, summer og statistikker er syntetiske eksempelverdier fra kildens mock-UI eller tydelig generiske verdier. Ingen ekte personopplysninger, tokens, hemmeligheter, database, PHP/backend, innlogging, API-kall, e-post, nettleserlagring eller eksterne ressurser følger med. `config.js` beholdes som del av frontendens eksisterende struktur; `apiBasePath` er ubrukt. Ikke skriv inn reelle opplysninger eller bruk demoen til drift.

## Lokal visning

Fra repo-roten: `python3 -m http.server 8000`, åpne `http://localhost:8000/vibe/vinterlagring-fornes/`. Registrering, Kunde og Admin navigerer til de respektive statiske placeholder-sidene.

## QA og deploy

Kjør `node --test tests/vinterlagring.test.mjs` og `node --test tests/*.test.mjs`. Kontroller også alle lenkede ressurser via deployworkflowens statiske validering. Ruten er ikke deployet; deploy følger showcase-repoets vanlige prosess etter review og merge. Endringen løser Issue #2 delvis ved å gjøre eksisterende route kildebasert, men den implementerer ikke kilde-SSoT-funksjonene som ennå mangler i selve kilden.
