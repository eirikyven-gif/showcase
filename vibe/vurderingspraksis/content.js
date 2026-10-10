'use strict';
// Source-derived learning structure with synthetic, local-only showcase content.
const Workshop = (() => {
  const sources = {
    day1: '',
    day2: '',
    work: '',
    august: '',
    thyf: '',
    lub: '',
    nkr: '',
    nkrLevels: '',
    assessment: ''
  };
  // Ordering follows the approved flow from competence needs through evaluation.
  const topics = [
    {key:'workplace',title:'Kompetansebehov i yrkesfeltet',text:'Ta utgangspunkt i kompetansen emnet skal gi, og læringsaktivitetene som bygger opp under denne.',questions:['Hvilken kompetanse skal emnet gi?','Hvilke arbeidsoppgaver fra yrkesfeltet gjør denne kompetansen relevant?']},
    {key:'overall',title:'Sammenheng med studieplanen',text:'O-LUB-er beskriver læringsutbyttet for hele utdanningen. Se emnets LUB-er i sammenheng med studieplanens O-LUB-er og progresjon.',questions:['Hvilke O-LUB-er svarer emnets LUB-er opp?','Hvordan henger koblingen sammen med progresjonen i studieplanen?']},
    {key:'lub',title:'Emnets LUB-er',text:'Gå gjennom alle LUB-ene i ett emne. Drøft kompetansen de beskriver og hvordan de henger sammen med emnet.',questions:['Dekker LUB-ene emnet?','Er de tydelige og realistiske å arbeide med?','Passer de til forventet NKR-nivå og kategori?']},
    {key:'assessment',title:'Vurderingsformer',text:'Ta utgangspunkt i fagskolens godkjente vurderingsordninger. Alle emner skal ha eksamen. Se vurderingene i sammenheng med emnets LUB-er.',questions:['Hvordan viser studenten kompetansen i emnet?','Hvilke LUB-er vurderes gjennom eksamen eller deleksamen?','Hvordan dokumenteres kompetansen?']},
    {key:'criteria',title:'Vurderingskriterier og sensur',text:'Vurderingskriteriene tydeliggjør hvilken kompetanse studenten skal vise i en vurderingssituasjon.',questions:['Er det tydelig hva som vurderes?','Kan vurderingen begrunnes og dokumenteres?']},
    {key:'activities',title:'Læringsaktiviteter',text:'Læringsaktiviteter støtter studenten i å oppnå LUB-ene. Eksempler er forelesning, veiledning, case- og prosjektarbeid, praksisrelaterte oppgaver, presentasjoner og selvstudium. fagskolen har ingen egen godkjent liste.',questions:['Forbereder aktivitetene studenten på vurderingen?','Hva trenger studenten mer øving på?']},
    {key:'requirements',title:'Arbeidskrav',text:'Arbeidskrav skal støtte studentenes læring og følge fagskolens gjeldende føringer.',questions:['Er arbeidskravene nødvendige, og hva skal de bidra med?']},
    {key:'documentation',title:'Dokumentasjon av kompetanse',text:'Vurder om emnets LUB-er, aktiviteter, vurdering, kriterier og dokumentasjon viser den samme kompetansen.',questions:['Viser dokumentasjonen at studenten har oppnådd LUB-ene?']},
    {key:'evaluation',title:'Emneevaluering',text:'Undersøk hvordan emnet evalueres i dag, og hvordan erfaringer og innspill brukes videre.',questions:['Hvordan evalueres emnet i dag, og hva bygger evalueringen på?','Hvordan bidrar studentene, og hvordan brukes innspillene?','Hvilke erfaringer fra yrkesfeltet og fagrådet bør tas med?','Hva bør videreutvikles, og hvem følger det opp?']}
  ];
  const plan = [
    ['0–10 min','Felles bakgrunn og arbeidsmåte','Gå gjennom de syntetiske eksemplene og relevante føringer for vurderingsarbeidet.'],
    ['10–15 min','Presenter emnet','Emneeieren beskriver emnet og dagens praksis. Still oppklarende spørsmål før innspill.'],
    ['15–60 min','Drøft prioriterte spørsmål','Bruk spørsmålene i flytskjemaet med konkrete emneeksempler. Prioriter de viktigste først; ta flere hvis tiden tillater det. Dere trenger ikke gå gjennom alle.'],
    ['60–75 min','Dokumenter funn og forslag','Få fram hva som fungerer godt, hva som bør forbedres, mulige tiltak og saker som må avklares.'],
    ['75–85 min','Prioriter funn til dag 2','Velg 3–5 funn dere vil ta med til arbeidet med et helt emne og tilhørende studieplan.'],
    ['85–90 min','Kort innspill i plenum','Hver gruppe deler ett kort innspill om det som tas videre.']
  ];
  const august = [
    ['Tydelige mål og kriterier','Eksempel: forventningene kan oppleves uklare.','Mål og kriterier er synlige tidlig.','Konkretiser læringsutbytte og kriterier.'],
    ['Forutsigbar struktur','Eksempel: arbeidsflyt og frister kan variere.','Plan og frister er tydelige.','Avklar plan og kommunikasjon.'],
    ['Tilbakemelding som støtter læring','Eksempel: tilbakemelding gir ikke alltid et neste steg.','Tilbakemelding peker på noe studenten kan prøve.','Knytt tilbakemelding til et konkret læringssteg.'],
    ['Variasjon i vurdering','Eksempel: én vurderingsform viser ikke alltid hele kompetansen.','Vurderingsformen passer til læringsmålet.','Drøft relevante kombinasjoner av vurderingsformer.'],
    ['Sammenheng i vurderingspraksis','Eksempel: kriterier kan tolkes ulikt.','Fagmiljøet kan forklare felles prinsipper.','Drøft kriterier og begrunnelser sammen.']
  ];
  const videos = [];
  const learning = [
    {key:'competence',title:'Læringsutbytte og kompetanse',text:'Læringsutbytte er det studenten kan, forstår og kan gjøre etter emnet eller utdanningen. En emne-LUB beskriver læringsutbyttet i emnet. O-LUB beskriver læringsutbyttet for hele utdanningen. NKR er det nasjonale kvalifikasjonsrammeverket og angir nivå og bredde.',question:'Velg én emne-LUB. Hva skal studenten vite, kunne gjøre og vise? Hvordan henger den sammen med O-LUB og NKR?',videos:[0,1,4]},
    {key:'nkr-levels',title:'NKR nivå 5.1 og 5.2',text:'NKR nivå 5.1 er et delnivå under 5.2. Nivå 5.2 er fullnivået for høyere yrkesfaglig utdanning. Nivåbeskrivelsene er delt i kunnskap, ferdigheter og generell kompetanse. Punktene under oppsummerer NOKUTs beskrivelser, som gjelder på tvers av fagområder. Åpne nivåene for å lese dem.',levels:[
      {title:'Nivå 5.1',categories:[
        {title:'Kunnskap',items:['Kjenne sentrale begreper, arbeidsprosesser og verktøy i et spesialisert fagområde.','Ha innsikt i relevante regler, standarder, avtaler og kvalitetskrav.','Kjenne bransjen og yrkesfeltet, og kunne fornye yrkesfaglig kunnskap.','Forstå hvordan bransjen eller yrket bidrar i samfunnet og verdiskapingen.']},
        {title:'Ferdigheter',items:['Bruke fagkunnskap i praktiske og teoretiske problemstillinger.','Velge og bruke relevante verktøy, materialer, teknikker og uttrykksformer.','Finne informasjon og fagstoff som belyser yrkesfaglige problemstillinger.','Kartlegge en situasjon, finne faglige utfordringer og se når tiltak trengs.']},
        {title:'Generell kompetanse',items:['Forstå yrkes- og bransjeetikk og opptre etisk i yrket.','Utføre arbeid med utgangspunkt i behovene til aktuelle målgrupper.','Bygge relasjoner med fagfeller, andre fagmiljøer og eksterne grupper.','Utvikle arbeidsmåter, produkter eller tjenester som er relevante for yrket.']}
      ]},
      {title:'Nivå 5.2',categories:[
        {title:'Kunnskap',items:['Kjenne begreper, teorier, modeller, prosesser og verktøy i et spesialisert fagområde.','Vurdere eget arbeid opp mot gjeldende normer og krav.','Kjenne yrkets eller bransjens historie, tradisjoner, særpreg og samfunnsrolle.','Ha innsikt i egne muligheter for faglig utvikling.']},
        {title:'Ferdigheter',items:['Forklare faglige valg.','Reflektere over egen yrkesutøvelse og justere den med veiledning.','Finne og vise til relevant fagstoff, og vurdere hvordan det belyser en yrkesfaglig problemstilling.']},
        {title:'Generell kompetanse',items:['Planlegge og gjennomføre yrkesoppgaver og prosjekter alene eller i gruppe, i tråd med etiske krav.','Utveksle synspunkter med andre i bransjen og delta i samtaler om god praksis.','Bidra til utvikling av organisasjonen.']}
      ]}
    ],question:'Hvordan beskriver kategoriene kunnskap, ferdigheter og generell kompetanse forventningene på nivå 5.1 og 5.2?',videos:[1]},
    {key:'alignment',title:'Constructive Alignment',text:'Constructive Alignment beskriver samsvaret mellom læringsutbytte, læringsaktiviteter og vurdering. Læringsaktivitetene gir studenten øving på kompetansen. Vurderingen gir studenten mulighet til å vise kompetansen.',question:'Hjelper aktivitetene studenten å utvikle kompetansen? Gir vurderingsformen studenten mulighet til å vise den?',videos:[2]},
    {key:'feedback',title:'Underveisvurdering og sluttvurdering',text:'Underveisvurdering gir tilbakemelding som støtter videre læring. Sluttvurdering viser i hvilken grad studenten har oppnådd læringsutbyttet. Tilbakemeldinger underveis skal ikke inngå i sluttkarakteren.',question:'Hvordan kan studenten bruke tilbakemeldingene underveis? Hva viser sluttvurderingen?'},
    {key:'requirements',title:'Arbeidskrav og grunnlag for karakter',paragraphs:['Arbeidskrav er obligatoriske krav studenten må oppfylle for å kunne gå opp til eksamen. NOKUTs generelle veiledning omtaler også ordninger der arbeid kan inngå i karaktergrunnlaget; slike ordninger må beskrives tydelig.','fagskolen vurderer arbeidskrav som godkjent eller ikke godkjent. Kravene skal ha lav terskel, og alle må være godkjent før eksamen. Arbeidskrav inngår ikke i karakteren. Eventuelle avvik må vurderes opp mot godkjente regler.'],question:'Hvilke arbeidskrav må studenten få godkjent før eksamen? Hva viser eksamen om studentens kompetanse?'},
    {key:'assessment',title:'Vurderingsform, kriterier og sensur',paragraphs:['Vurderingsformen skal gi studenten mulighet til å vise kompetansen. Kriteriene beskriver hva som vurderes, og sensuren er den faglige vurderingen som gir karakter eller bestått/ikke bestått.','fagskolens føring er at emner med samme LUB skal ha samme vurderingsordning for studenter som tar dem samtidig. Vurdering og eventuell vekting følger den godkjente ordningen. Alle emner har eksamen. Deleksamener kan vektes sammen til én karakter eller ett samlet bestått/ikke bestått-resultat.','Vurderingen skal kunne begrunnes og etterprøves der det er relevant.'],question:'Passer vurderingsformen til kompetansen? Er kriteriene forståelige? Kan vurderingen begrunnes og etterprøves? Har emner med samme LUB samme vurderingsordning?'},
    {key:'transfer',title:'Eksempel til workshopen',text:'Velg én LUB fra eget emne. Ved fagskolen skal læringsaktiviteter og vurderingsinformasjon stå i emnebeskrivelsen og knyttes til emnets LUB-er.',question:'Hva skal studenten lære? Hvilke læringsaktiviteter støtter dette, og hvordan vurderes kompetansen? Står informasjonen i emnebeskrivelsen? Hvilket spørsmål vil du ta opp på workshopen?',videos:[3]}
  ];
  const localRules = [
    'Læringsaktiviteter og vurdering skal beskrives i hvert emne og knyttes til emnets LUB-er. Overordnede felt for dette i studieplanen utgår.',
    'Emnebeskrivelsen samler faglig innhold, forkunnskapskrav, LUB-er, læringsaktiviteter, arbeidskrav og vurderingsordning/eksamen. Feltet Omfang er foreløpig ikke i bruk.',
    'Arbeidskrav skal støtte arbeid med LUB-ene og forberede til eksamen. Terskelen for godkjenning skal være lav. Alle krav vurderes Godkjent/Ikke godkjent og må være godkjent før eksamen. Arbeidskrav inngår ikke i karakteren.',
    'Emner med samme LUB kan ha ulike arbeidskrav. Studenter som tar emnene samtidig, skal ha samme vurderingsordning. Vurdering og eventuell vekting følger den godkjente ordningen.',
    'Alle emner skal ha eksamen. Flere deleksamener kan vektes til én endelig karakter A–F eller ett samlet bestått/ikke bestått-resultat. Bruk godkjent vurderingsordning.',
    'Endring av utdanningens O-LUB kan kreve endringsmelding eller ny akkrediteringssøknad til NOKUT. Registrer det som formell avklaring.',
    'Ved faktisk studieplanrevisjon skal gjeldende prosedyre og sjekkliste følges.'
  ];
  return {sources,topics,plan,august,videos,learning,localRules};
})();
