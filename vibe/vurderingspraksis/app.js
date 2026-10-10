'use strict';
(() => {
  const W=Workshop;
  const $=id=>document.getElementById(id);
  const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const downloadIcon='<svg class="download-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3v12m-5-5 5 5 5-5M5 19h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const link=(url,label,download=false)=>url?`<a class="resource-link${download?' download-link':''}" href="${escape(url)}"${download?' download':' target="_blank" rel="noopener noreferrer"'}>${download?downloadIcon:''}<span>${escape(label)}</span></a>`:`<span class="resource-link unavailable">${escape(label)} – ikke med i den lokale demoen</span>`;
  const list=items=>`<ul>${items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul>`;
  const source=(url,label)=>`<div class="source"><span class="source-label">Kilde</span>${link(url,label)}</div>`;
  const wordSource=(url,label)=>`<div class="source document-source">${link(url,label,true)}</div>`;
  const learningCopy=topic=>(topic.paragraphs||[topic.text]).map(paragraph=>`<p>${escape(paragraph)}</p>`).join('');
  const nkrAccordions=topic=>`<p>${escape(topic.text)}</p><div class="nkr-accordions" aria-label="NKR-nivåbeskrivelser">${topic.levels.map(level=>`<details><summary>${escape(level.title)}</summary>${level.categories.map(category=>`<section><h4>${escape(category.title)}</h4><ul>${category.items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></section>`).join('')}</details>`).join('')}</div>`;
  const FLOW_SEEN_KEY='vibe-vurderingspraksis-flow-seen-v1';
  const FLOWCHART_PRESENTATION='';
  const glossary=[
    ['LUB – læringsutbyttebeskrivelse','Beskriver hva studenten skal kunne, forstå eller gjøre etter læringen.'],
    ['Emne-LUB / E-LUB','Læringsutbyttebeskrivelse for ett emne.'],
    ['O-LUB – overordnet LUB','Beskriver læringsutbyttet for hele utdanningen.'],
    ['Emneeier','Personen som presenterer emnet og følger opp innspill om emnets LUB-er i workshopen.'],
    ['NKR – Nasjonalt kvalifikasjonsrammeverk for livslang læring','Rammeverket beskriver nivået og bredden i læringsutbyttet. Læringsutbytte deles inn i kunnskap, ferdigheter og generell kompetanse.'],
    ['NKR nivå 5.1','Et delnivå under 5.2 i NKR nivå 5. Utdanningens nivå beskriver forventet læringsutbytte.'],
    ['NKR nivå 5.2','Fullnivå 5 i NKR. Utdanningens nivå beskriver forventet læringsutbytte.'],
    ['Læringsaktivitet','Arbeid og aktiviteter som støtter studenten i å oppnå emnets LUB-er.'],
    ['Arbeidskrav','Obligatoriske krav studenten må få godkjent for å kunne gå opp til eksamen. I fagskolens føring vurderes arbeidskrav som godkjent/ikke godkjent, med lav terskel, og alle krav må være godkjent før eksamen.'],
    ['Vurderingsform','Måten studenten får vist kompetansen sin på.'],
    ['Vurderingskriterier','Beskriver hvilken kompetanse som vurderes og hva studenten må vise.'],
    ['Constructive Alignment – konstruktiv sammenheng','Sammenhengen mellom læringsutbytte, læringsaktiviteter og vurdering.']
  ];
  let view='prep', modalRoute=null, modalOpener=null, modalHistory=[];
  let quickMenuOpen=false;
  let seenFlows=new Set(), sessionSeenFlows=new Set();
  const resources=new Map();
  try {
    const stored=JSON.parse(localStorage.getItem(FLOW_SEEN_KEY)||'[]');
    if(Array.isArray(stored))seenFlows=new Set(stored.filter(day=>['day1','day2'].includes(day)));
  } catch {}

  function glossaryMarkup(){return `<p>Praktiske forklaringer til begrepene som brukes i workshopen.</p><dl class="glossary-list">${glossary.map(([term,definition])=>`<div><dt>${escape(term)}</dt><dd>${escape(definition)}</dd></div>`).join('')}</dl>`;}
  function flowMarkup(day){
    return `<div class="flow-grid" data-flow-day="${day}">${W.topics.map(topic=>`<section class="flow-step"><h3>${escape(topic.title)}</h3><p>${escape(topic.text)}</p><ul>${topic.questions.map(question=>`<li>${escape(question)}</li>`).join('')}</ul></section>`).join('<span class="flow-arrow" aria-hidden="true">↓</span>')}</div>`;
  }
  function alignment(){return `<section class="panel"><h3>Constructive Alignment</h3><p>Constructive Alignment beskriver samsvaret mellom læringsutbytte, læringsaktiviteter og vurdering. Læringsutbyttet sier hva studenten skal kunne. Aktivitetene støtter læringen. Vurderingen viser hva studenten mestrer, og kriteriene sier hva som vurderes.</p><p>Se hvordan emnets LUB-er dekker kompetansen i yrkesfeltet, hvordan aktivitetene forbereder studentene, og hvordan vurdering og kriterier viser hva de har lært.</p>${source(W.sources.assessment,'NOKUT – Vurdering av studentens kompetanse')}</section>`;}
  function localRules(){return `<section class="panel"><h3>Eksempler på lokale føringer</h3><p>Syntetiske eksempler. Kontroller alltid gjeldende regler og godkjente ordninger i egen organisasjon.</p>${list(W.localRules)}</section>`;}
  function dayRailMarkup(area){
    const instructions={
      prep:{frame:'Forbered individuelt med utgangspunkt i ett emne.',steps:[
        'Se gjennom temaene og spørsmålene i flytskjemaet, og gjør en første prioritering av hva du mener gruppen bør drøfte. Ta med vurderingen til dag 1, der gruppen blir enige om prioriteringene.',
        'Arbeid individuelt. Bruk spørsmålene i flytskjemaet og Word-filene som støtte.',
        'Gå gjennom ett emne og alle tilhørende LUB-er. Se læringsaktiviteter, oppgaver, kriterier og arbeidskrav i sammenheng med emnets LUB-er og vurderingspraksis.',
        'Gå gjennom læringsstiene og relevante fagressurser.',
        'Skriv notater og refleksjoner i Word-dokumentet.'
      ]},
      day1:{frame:'Dag 1 handler om å bruke arbeidsmetodikken, ikke om å rekke alt. Emneeieren presenterer emnet, LUB-ene og vurderingspraksisen. Bruk flytskjemaets spørsmål til drøfting, og ta funnene med til dag 2.',steps:[
        'Bli enige om hvilket emne gruppen skal se på.',
        'Bruk spørsmålene i flytskjemaet til å drøfte emnet med konkrete eksempler. Prioriter spørsmålene dere mener er viktigst; rekker dere mer, tar dere flere. Dere trenger ikke gå gjennom alle.',
        'Still oppklarende spørsmål, og drøft emnets LUB-er, arbeidskrav og eksamener.',
        'Finn det som fungerer godt, og det som må forbedres. Dokumenter innspill og forslag til tiltak i Word.',
        'Velg 3–5 funn dere vil prioritere på dag 2.'
      ]},
      day2:{frame:'Gruppene dannes etter emne eller studieretning. Ta med funn og diskusjoner fra dag 1; ikke start kartleggingen på nytt.',steps:[
        'Velg ett helt emne med tilhørende studieplan.',
        'Bygg videre på funnene fra dag 1. Bruk spørsmålene i flytskjemaet til å drøfte emnet. Prioriter spørsmålene dere mener er viktigst; har dere tid, tar dere flere. Dere trenger ikke gå gjennom alle.',
        'Bruk LUB-verktøyet til å se hvilke O-LUB-er emnet svarer opp, og kontroller koblingene mot emnet og studieplanen.',
        'Dokumenter funn og forslag til tiltak i Word. Prioriter tiltakene, og noter ansvar, frist og avklaringer med fagskolen.'
      ]},
      afterwork:{frame:'Gå gjennom egne emner, ett emne om gangen, med utgangspunkt i spørsmålene i flytskjemaet. Bruk samme arbeidsmåte på andre emner.',steps:[
        'Gå gjennom egne emner ett om gangen med utgangspunkt i spørsmålene i flytskjemaet.',
        'Se på læringsaktiviteter og vurdering i lys av emnet og LUB-ene.',
        'Bruk LUB-verktøyet til å se hvilke O-LUB-er emnet svarer opp. Kontroller koblingene mot studieplanen.',
        'Følg opp tiltakene fra dag 1 og dag 2. Dokumenter og begrunn koblingene i word-dokumentene, og noter ansvar, frist og avklaringer.'
      ]}
    }[area];
    return `<p class="rail-frame"><strong>Ramme</strong> ${escape(instructions.frame)}</p><section class="rail-goals" aria-label="Arbeidsinstrukser"><ol>${instructions.steps.map(item=>`<li>${escape(item)}</li>`).join('')}</ol></section><div class="rail-flow-actions"><button type="button" data-show-flow="${area}" aria-haspopup="dialog">Vis spørsmålene i flytskjemaet</button></div>`;
  }
  function workAreaHeading(area){
    const headings={prep:['Forberedelse','Før workshopen'],day1:['Workshop dag 1','Kollegial gjennomgang av ett emne'],day2:['Workshop dag 2','Arbeid videre med ett emne og tilhørende studieplan'],afterwork:['Etterarbeid','Oppfølging etter workshopen']}[area];
    return headings?`<h2 id="view-heading" tabindex="-1">${escape(headings[0])}</h2><p>${escape(headings[1])}</p>`:'';
  }
  function markFlowSeen(day){
    sessionSeenFlows.add(day);seenFlows.add(day);
    try{localStorage.setItem(FLOW_SEEN_KEY,JSON.stringify([...seenFlows]));}catch{}
  }
  function maybeOpenFirstFlow(day){
    if(!['day1','day2'].includes(day)||seenFlows.has(day)||sessionSeenFlows.has(day))return;
    markFlowSeen(day);openRoute({type:'flow',day},document.querySelector(`[data-show-flow="${day}"]`));
  }
  function day1Source(){return `<div class="day-body"><p>Emneeieren presenterer emnet, emnets LUB-er og vurderingspraksisen. Bruk spørsmålene i flytskjemaet til drøfting med konkrete eksempler. Prioriter spørsmålene dere mener er viktigst; rekker dere mer, tar dere flere. Dere trenger ikke gå gjennom alle.</p><p>Dokumenter underveis i Word hva som fungerer godt, hva som bør forbedres, forslag til tiltak og saker som må avklares. Velg 3–5 funn dere vil prioritere på dag 2.</p><section class="panel"><h3>Tidsplan for dag 1</h3><div class="table-scroll"><table><caption>Kjøreplan for dag 1</caption><thead><tr><th scope="col">Tid</th><th scope="col">Arbeid</th></tr></thead><tbody>${W.plan.map(([time,title,text])=>`<tr><td>${escape(time)}</td><td><strong>${escape(title)}</strong><br>${escape(text)}</td></tr>`).join('')}</tbody></table></div></section><section class="panel"><h3>Syntetiske eksempler på funn</h3><p>Eksemplene under er oppdiktet og illustrerer situasjon, ønsket situasjon og mulig tiltak.</p>${W.august.map(([title,situation,wanted,action])=>`<h4>${escape(title)}</h4><p><strong>Situasjon:</strong> ${escape(situation)}<br><strong>Ønsket situasjon:</strong> ${escape(wanted)}<br><strong>Foreslått tiltak:</strong> ${escape(action)}</p>`).join('')}</section>${alignment()}<section class="panel"><h3>Oppsummering og innspill til dag 2</h3><p>Prioriter 3–5 funn eller prinsipper til dag 2. Ta med faglige forskjeller som må bevares.</p><div class="actions"><button type="button" data-view="day2">Gå til dag 2</button></div></section></div>`;}
  function day2Source(){return `<div class="day-body"><p>Dag 2 bygger videre på funnene og diskusjonene fra dag 1. Bruk arbeidsmetodikken på ett helt emne og tilhørende studieplan. Ta med funnene fra dag 1, og bruk spørsmålene i flytskjemaet til å drøfte emnets LUB-er, læringsaktiviteter og vurderingspraksis. Prioriter spørsmålene dere mener er viktigst; har dere tid, tar dere flere. Dere trenger ikke gå gjennom alle.</p><p>Bruk LUB-verktøyet til å se hvilke O-LUB-er emnet svarer opp, og kontroller koblingene mot emneinnhold og studieplan. Dokumenter underveis i Word, og avslutt med å prioritere tiltak for videre oppfølging.</p>${localRules()}<p>Følg tidsrammen i samlingsprogrammet. Ta arbeidsmåten videre til andre emner i etterarbeidet.</p></div>`;}
  function afterwork(){return `<div class="day-body"><p>Hovedoppgaven etter workshopen er å gå gjennom egne emner ett om gangen med utgangspunkt i spørsmålene i flytskjemaet.</p><p>Se på læringsaktiviteter og vurdering i lys av emnet og LUB-ene. Følg opp tiltakene fra dag 1 og dag 2, og noter hva som skal gjøres, hvem som følger opp og når.</p><p>Bruk LUB-verktøyet til å se hvilke O-LUB-er emnet svarer opp. Kontroller koblingene mot studieplanen. Dokumenter og begrunn koblingene i word-dokumentene.</p><section class="panel"><h3>LUB-verktøyet</h3><p>Matrisen viser O-LUB-ene og emne-LUB-ene, slik at du kan se hvilke O-LUB-er emnet svarer opp. Bruk spørsmålene i flytskjemaet til drøfting, og dokumenter faglige vurderinger og begrunnelser i Word.</p><p>Eksterne verktøy og dokumenter er ikke koblet til denne demoen.</p><p>Eksterne verktøy og dokumenter er ikke koblet til denne demoen.</p></section></div>`;}
  function launcher(label,attribute,value,description=''){return `<button type="button" ${attribute}="${escape(value)}" aria-haspopup="dialog"><span>${escape(label)}</span>${description?`<span class="entry-description">${escape(description)}</span>`:''}</button>`;}
  function register(key,title,html){resources.set(key,{title,html});return launcher(title,'data-resource',key);}
  function prep(){return `<p>Bruk fagstoffet og arbeidsdokumentene sammen med spørsmålene i flytskjemaet når du forbereder emnet.</p><p class="inline-actions"><button type="button" data-view="resources">Åpne læringsstiene</button></p>`;}
  function resourceView(){
    const learning=W.learning.map((topic,index)=>launcher(topic.title,'data-learning-step',index)).join('');
    return `<div class="section-heading"><h2 id="view-heading" tabindex="-1">Læringsstiene</h2><button type="button" data-view="prep">Tilbake til forberedelse</button></div><p>Åpne bolkene i valgfri rekkefølge. Les teksten og bruk drøftingsspørsmålene i bolkene til egen refleksjon eller samtale.</p><div class="overview resource-overview" aria-label="Læringsstier">${learning}</div>`;
  }
  function compactDay(day){
    const template=document.createElement('template');template.innerHTML=day==='day1'?day1Source():day2Source();
    const root=template.content;
    const body=root.querySelector('.day-body')||root;
    body.querySelector(':scope > p')?.remove();
    body.querySelectorAll('.document-source').forEach(source=>source.remove());
    const container=document.createElement('div');container.append(root);return container.innerHTML;
  }
  function quickMenuMarkup(area){
    const goal='<p><strong>Mål:</strong> Arbeid helhetlig med ett emne.</p><p>Se emnets LUB-er i sammenheng med læringsaktiviteter, arbeidskrav og vurderingspraksis.</p><p>Bruk spørsmålene i flytskjemaet til å drøfte:</p><ul><li>Hva som fungerer</li><li>Hva som bør forbedres</li><li>Hvilke tiltak dere vil prioritere</li></ul>';
    const documents=[
      [W.sources.day1,'Dag 1-dokument: oppgave og kjøreplan'],
      [W.sources.day2,'Dag 2-dokument: emne- og studieplanarbeid'],
      [W.sources.work,'Arbeidsdokument: LUB-gjennomgang, innspill og oppfølging']
    ];
    return `<nav class="quick-menu-content" aria-label="Arbeidsstøtte og dokumenter"><header class="quick-menu-header"><h2 class="quick-menu-title">Arbeidsstøtte og dokumenter</h2><button type="button" class="quick-menu-close" data-close-quick-menu aria-label="Lukk snarveier">Lukk <span aria-hidden="true">›</span></button></header><div class="quick-menu-goal">${goal}</div><section class="quick-group"><h3>Flytskjema</h3><button type="button" data-show-flow="${area}" aria-haspopup="dialog">Vis spørsmålene i flytskjemaet</button>${link(FLOWCHART_PRESENTATION,'Last ned PowerPoint-presentasjonen med flytskjema',true)}</section><section class="quick-group"><h3>Arbeidsdokumenter</h3><div class="quick-links">${documents.map(([url,label])=>link(url,label,true)).join('')}</div></section><section class="quick-group"><h3>Oppslagsverk og verktøy</h3><button type="button" data-open-glossary aria-haspopup="dialog">Begrepsliste</button><button type="button" data-view="resources">Åpne læringsstiene</button>${link('','Åpne LUB-verktøyet')}</section><section class="quick-group"><h3>Bakgrunnsmateriale</h3>${link(W.sources.thyf,'Åpne fagskolens lokale føringer (PDF)')}${link(W.sources.august,'Last ned oppsummeringen fra august',true)}</section></nav>`;
  }
  function updateQuickMenuState(){
    const menu=$('quick-menu'),toggle=$('quick-menu-toggle'),mobile=matchMedia('(max-width: 900px)').matches;
    const expanded=!mobile||quickMenuOpen;
    menu.classList.toggle('is-collapsed',mobile&&!quickMenuOpen);
    menu.inert=mobile&&!quickMenuOpen;
    if(mobile&&!quickMenuOpen)menu.setAttribute('aria-hidden','true');else menu.removeAttribute('aria-hidden');
    toggle.setAttribute('aria-expanded',String(expanded));
    toggle.innerHTML=quickMenuOpen?'Lukk meny <span aria-hidden="true">›</span>':'Snarveier <span aria-hidden="true">⌄</span>';
  }
  function setQuickMenuOpen(open,moveFocus=false){
    quickMenuOpen=open;updateQuickMenuState();
    if(moveFocus){if(open)$('quick-menu').querySelector('.quick-menu-close')?.focus();else $('quick-menu-toggle').focus();}
  }
  function renderResource(focus=false){
    resources.clear();$('resource').innerHTML=view==='prep'?prep():view==='resources'?resourceView():view==='afterwork'?afterwork():compactDay(view);
    const workshopView=['prep','day1','day2','afterwork'].includes(view);
    $('workshop-layout').classList.toggle('has-quick-menu',workshopView);
    $('work-area-heading').hidden=!workshopView;$('work-area-heading').innerHTML=workshopView?workAreaHeading(view):'';
    $('day-rail').hidden=!workshopView;$('day-rail').innerHTML=workshopView?dayRailMarkup(view):'';
    $('quick-menu').hidden=!workshopView;$('quick-menu').innerHTML=workshopView?quickMenuMarkup(view):'';
    $('quick-menu-toggle').hidden=!workshopView;quickMenuOpen=false;updateQuickMenuState();
    document.querySelectorAll('nav [data-view]').forEach(button=>{if(button.dataset.view===(view==='resources'?'prep':view))button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    if(focus)$('view-heading').focus();
  }
  function showRoute(route){
    modalRoute=route;const content=$('dialog-content');content.replaceChildren();
    document.querySelector('[data-modal-back]').hidden=!modalHistory.length;
    document.querySelector('[data-open-flow]').hidden=!['prep','day1','day2','afterwork'].includes(view)||route.type==='flow';
    document.querySelector('.modal-top [data-open-glossary]').hidden=route.type==='glossary';
    if(route.type==='glossary'){
      $('dialog-title').textContent='Begrepsliste';content.innerHTML=glossaryMarkup();
    }else if(route.type==='learning'){
      const topic=W.learning[route.index];$('dialog-title').textContent=topic.title;
      content.innerHTML=`<p class="hint">Bolk ${route.index+1} av ${W.learning.length}</p>${topic.key==='nkr-levels'?nkrAccordions(topic):learningCopy(topic)}<h3>Drøftingsspørsmål</h3><p>${escape(topic.question)}</p><p>Bruk spørsmålet i læringsbolken til egen refleksjon eller samtale.</p><div class="link-group" aria-label="Læringsressurser">${topic.key==='nkr-levels'?link(W.sources.nkrLevels,'Les NOKUTs nivåbeskrivelser for NKR 5.1 og 5.2'):link(W.sources.nkr,'Slå opp i NKR')}${link(W.sources.lub,'Les NOKUTs veiledning om læringsutbytte')}</div>${source(W.sources.assessment,'NOKUT – Vurdering av studentens kompetanse')}<div class="actions"><button type="button" data-learning-previous ${route.index===0?'disabled':''}>Forrige bolk</button><button type="button" data-learning-next ${route.index===W.learning.length-1?'disabled':''}>Neste bolk</button></div>`;
    }else if(route.type==='flow'){
      $('dialog-title').textContent='Flytskjema';content.innerHTML=`<p>Flytskjemaet følger arbeidet fra arbeidslivets behov til emneevaluering. Bruk spørsmålene til drøfting.</p>${flowMarkup(route.day||view)}`;
    }else{
      const resource=resources.get(route.key);$('dialog-title').textContent=resource.title;content.innerHTML=resource.html;
    }
    content.scrollTop=0;$('work-dialog').scrollTop=0;$('dialog-title').focus();
  }
  function openRoute(route,opener,push=false){
    if($('work-dialog').open){if(push&&modalRoute)modalHistory.push(modalRoute);showRoute(route);return;}
    modalHistory=[];modalOpener=opener||document.activeElement;showRoute(route);$('work-dialog').showModal();$('dialog-title').focus();
  }
  function finishDialog(){
    $('work-dialog').close();$('dialog-content').replaceChildren();modalHistory=[];modalRoute=null;
    document.querySelector('.modal-top [data-open-glossary]').hidden=false;
    if(modalOpener?.isConnected)modalOpener.focus();else $('view-heading').focus();
  }
  function back(){if(modalHistory.length)showRoute(modalHistory.pop());else finishDialog();}
  $('reset-local-data')?.addEventListener('click',()=>{localStorage.removeItem(FLOW_SEEN_KEY);localStorage.removeItem('vibe-vurderingspraksis-appearance-v2');localStorage.removeItem('vibe-vurderingspraksis-appearance-v1');location.reload();});
  $('dialog-done').addEventListener('click',finishDialog);
  $('work-dialog').addEventListener('cancel',event=>{event.preventDefault();finishDialog();});
  $('quick-menu-toggle').addEventListener('click',()=>setQuickMenuOpen(!quickMenuOpen, true));
  window.addEventListener('resize',updateQuickMenuState);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&quickMenuOpen&&matchMedia('(max-width: 900px)').matches){event.preventDefault();setQuickMenuOpen(false,true);}});
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-close-quick-menu')){setQuickMenuOpen(false,true);return;}
    if(button.hasAttribute('data-open-glossary')){openRoute({type:'glossary'},button,$('work-dialog').open);return;}
    if(button.dataset.view){if($('work-dialog').open)finishDialog();view=button.dataset.view;renderResource(true);maybeOpenFirstFlow(view);return;}
    if(button.dataset.resource){openRoute({type:'resource',key:button.dataset.resource},button);return;}
    if(button.dataset.scrollTo){const target=$(button.dataset.scrollTo);target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});target?.querySelector('h3')?.focus();return;}
    if(button.dataset.showFlow){openRoute({type:'flow',day:button.dataset.showFlow},button,$('work-dialog').open);return;}
    if(button.hasAttribute('data-open-flow')){openRoute({type:'flow',day:view},button,$('work-dialog').open);return;}
    if(button.dataset.learningStep!==undefined){openRoute({type:'learning',index:Number(button.dataset.learningStep)},button);return;}
    if(button.hasAttribute('data-learning-previous')){showRoute({type:'learning',index:modalRoute.index-1});return;}
    if(button.hasAttribute('data-learning-next')){showRoute({type:'learning',index:modalRoute.index+1});return;}
    if(button.hasAttribute('data-modal-back')){back();return;}
  });
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href]')].filter(element=>element.getClientRects().length);const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }));
  renderResource();maybeOpenFirstFlow(view);
})();
