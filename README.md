# showcase

Grunnrepo for en isolert demo- og presentasjonsplattform som senere skal samle utvalgte apper fra:

- `eirikyven-gif/apps-fagskolen`
- `eirikyven-gif/diverse-apper`
- relevante, godkjente apper fra øvrige kilder

Det er **ikke** gjort migrering eller endringer i eksisterende apper her ennå. Denne første leveransen etablerer bare struktur, appregister og teknisk plan for showcase-løsningen.

## Mål for showcase

Showcase-nettsiden skal på sikt vise:

- appnavn
- bruksområde
- kilde/repo
- status
- auth-status
- lenke til sentral deployet versjon

Showcase skal være en **isolert demo-plattform**:

- ingen produksjonsdata
- ingen produksjonsautentisering
- demoendringer skal enten lagres lokalt i nettleseren eller nullstilles automatisk hver time

## Opprettet mappestruktur

```text
/
├── README.md
├── appregister/
│   └── apps.json
└── showcase-site/
    ├── app.js
    ├── index.html
    └── styles.css
```

## Appregister

Appregisteret ligger i `/home/runner/work/showcase/showcase/appregister/apps.json`.

- Registeret er strukturert for én oppføring per app
- Det skiller mellom `included`, `excluded` og fremtidige godkjente apper
- Det inneholder også foreslått demo-auth og strategi for lagring/nullstilling

### Inkluderte apper i denne første leveransen

Ingen apper er markert som `included` ennå.

Begrunnelse:

- oppgaven ber om grunnstruktur og teknisk plan, ikke migrering
- kilderepoene er ikke inventarisert i denne leveransen
- apper fra øvrige kilder må være eksplisitt godkjent før de tas inn

Neste steg er derfor å fylle registeret med faktiske appoppføringer fra kilderepoene som skal vises i showcase.

### Ekskluderte apper

Følgende apper er registrert som eksplisitt ekskludert:

- Gårdsbehov
- Vinterlagring
- Læringssti for fagskole
- Bilag
- Bilag v5

## Grunnlag for sentral showcase-side

Det er opprettet en enkel statisk side i `/home/runner/work/showcase/showcase/showcase-site`.

Formålet med denne er å gi et lettvekts grunnlag for videre arbeid:

- leser appregisteret fra `appregister/apps.json`
- viser oversikt over inkluderte og ekskluderte apper
- viser foreslått demo-auth
- viser foreslått strategi for lokal lagring og timevis nullstilling

Dette er kun et startpunkt for informasjonsarkitektur, ikke en ferdig produktisert portal.

## Foreslått demo-auth

Foreslått felles demo-innlogging for showcase:

- brukernavn: `demo`
- passord: `showcase-demo`

Prinsipper:

- samme faste credentials kan vises åpent på showcase-siden
- kun for demoformål
- ingen kobling mot produksjonsbrukere eller produksjonsleverandører for auth
- hver app bør på sikt kunne bruke en lokal demo-auth-adapter eller et felles mock-lag

## Foreslått lagring og nullstilling

Anbefalt startstrategi:

1. Lagre demoendringer i `localStorage` eller `sessionStorage`
2. Legg ved et tidsstempel for når demo-data ble opprettet
3. Ved lasting av app:
   - hvis data er eldre enn 60 minutter, slettes de automatisk
   - ellers brukes lokale demo-data videre

Dette gir:

- ingen produksjonsdata
- enkel lokal isolasjon per bruker/nettleser
- forutsigbar automatisk reset uten backend-krav i første fase

Alternativ ved senere behov:

- sentral mock-backend med scheduled reset hver time

## Åpne avklaringer

- Hvilke konkrete apper fra `apps-fagskolen` skal tas med?
- Hvilke konkrete apper fra `diverse-apper` skal tas med?
- Hvilke apper fra øvrige kilder er godkjent for showcase?
- Skal showcase på sikt være ren statisk presentasjon, eller også hoste innpakkede demo-versjoner av appene?
- Skal demo-auth være helt felles for alle showcase-apper, eller kan enkelte apper ha egne synlige demo-brukere?

## Neste anbefalte issue

**Inventariser og godkjenn appkandidater for showcase-registeret**

Forslag til innhold:

- kartlegg alle aktuelle apper i kilderepoene
- merk hvilke som skal inkluderes
- registrer bruksområde, status og kilde per app
- avklar hvilke apper som trenger demo-auth og lokal demo-state
- oppdater `appregister/apps.json` med faktiske `included`-oppføringer
