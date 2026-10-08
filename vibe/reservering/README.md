# Ledige tider · kalenderkonsept

| Felt | Vurdering |
|---|---|
| Purpose | Utforske en enkel kalenderoversikt med ledige og opptatte tidspunkt. |
| Category | Planlegging og bookingkonsepter. |
| Audience | Små virksomheter, tjenesteytere og personer som utforsker kalenderbasert tilgjengelighet. |
| Status | Beholdt i bred førstegangsvurdering; original, statisk konseptdemo laget. Ingen kuratering eller utsiling. |
| Slug | `reservering` · `/vibe/reservering/` |
| Demo value | Viser hvordan en ukesoversikt kan kommunisere tilgjengelighet raskt på desktop og mobil. |
| Simplifications | Fast kalender med kun oppdiktede ukedager, tider og tilgjengelighet. Ingen valgbare tider eller bestillingsflyt. |
| Risk | Booking håndterer ofte personopplysninger, kalenderstatus og bekreftelsesmekanismer. Slik funksjonalitet er ikke representert. Kildestatus og kildebeskrivelse er ikke verifisert. |
| Scope | Selvstendig statisk HTML/CSS/JS for `/vibe/reservering/`. Ingen kildekode, logo, virksomhet, database, API, innlogging, skjema, e-post, tokenlenker, persistens eller eksterne kall. |

## Kildegjennomgang og usikkerhet

WP-Reservering-kilden er angitt som `Wp-Reservering/wp-reservering`, men kilderepositoriets dokumenter var ikke tilgjengelige i arbeidsområdet for denne gjennomgangen. Funksjoner, implementasjon, datamodell og kildebeskrivelser er derfor uverifisert; dokumentasjonskonflikter er ikke forsøkt avgjort. Demoen er et selvstendig, fiktivt kalenderkonsept og hevder ikke å representere eller være kompatibel med kilden.

## Personvern og sikkerhetsgrenser

Kalenderen inneholder bare generiske, oppdiktede tidspunkt og ledig/opptatt-markeringer. Ingen booking kan opprettes. Det finnes ingen kundeopplysninger, kontaktfelt, autentisering, database, lagring i nettleseren, serverkall, e-post, tokenlenker, API eller eksterne tjenester. Dette er en visuell prototype, ikke en tilgjengelighetskilde.

## Omfang og kontroll

Én statisk rute, én katalogoppføring og denne vurderingen. Tastaturbruk krever ingen interaktive kontroller; tabelloverskrifter beskriver kalenderaksene. Kalenderen kan rulles vannrett på små skjermer uten at sideinnholdet må krympes. Issue #2 er delvis løst ved å beholde kandidaten i bred førstegangsvurdering og legge til en trygg, original konseptdemo.
