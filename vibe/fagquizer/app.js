const STORE = 'vibe-fagquizer-demo-v2';
const view = document.querySelector('#view');
const identity = document.querySelector('#identity');
const readState = () => { try { return JSON.parse(localStorage.getItem(STORE)) || { role: 'student', progress: {}, cards: {} }; } catch { return { role: 'student', progress: {}, cards: {} }; } };
let state = readState();
const save = () => { if(activity) state.active=JSON.parse(JSON.stringify(activity)); localStorage.setItem(STORE, JSON.stringify(state)); };
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dataReady = Promise.resolve(window.FAGQUIZER_DATA);
let data;
let trail = [];
let activity = null;
function updateIdentity() {
  identity.innerHTML = `<span class="tag">${state.role === 'admin' ? 'Demo-admin' : 'Demo-elev'} · syntetisk rolle</span> <button class="link-button" id="switch-role" type="button">Bytt demobruker</button>`;
  document.querySelector('#switch-role').addEventListener('click', () => { state.role = state.role === 'admin' ? 'student' : 'admin'; save(); trail = []; renderHome(); });
}
function button(label, action, cls='secondary') { return `<button class="${cls}" type="button" data-action="${action}">${label}</button>`; }
function card(tag, title, description, action) { return `<button class="card" type="button" data-action="${action}"><span class="tag">${tag}</span><h2>${title}</h2><p>${description}</p><span class="open">Åpne →</span></button>`; }
function frame(title, subtitle, body, crumb='') {
  const crumbs = `<nav class="crumbs" aria-label="Brødsmuler">${crumb ? `<button data-action="${crumb}">← Tilbake</button>` : ''}<button data-action="home">Alle fag</button></nav>`;
  const resume=title==='Velg fag'&&state.active?`<section class="panel"><strong>Pågående demoøkt</strong><p>Fremdriften lagres bare lokalt i denne nettleseren.</p>${button('Fortsett økten','resume','primary')}</section>`:'';
  view.innerHTML = `${crumbs}<header class="hero"><span class="pill">${state.role === 'admin' ? 'Administrasjon · demo' : 'Fagquizer · elevdemo'}</span><h1>${title}</h1><p>${subtitle}</p></header>${resume}${body}`;
  view.focus();
}
function renderHome() {
  updateIdentity();
  trail = [];
  if (state.role === 'admin') return renderAdmin();
  frame('Velg fag', 'Finn faget du skal øve på. Inne på faget velger du et tema, og deretter quiz eller flashcards.', `<section class="intro"><h2>Fag</h2></section><div class="grid">${card('Fag','🔬 Naturfag','Utforsk naturfaglige temaer, fra universet til laboratoriet.','nature')}${card('Fag','🌍 Samfunnsfag','Lær om landskap, naturkrefter og hvordan mennesker bruker områdene rundt seg.','society')}</div><div class="notice"><strong>Syntetisk demoinnlogging</strong><p>Elev- og adminroller er forhåndsdefinerte demonstrasjoner. Ingen brukernavn eller passord blir spurt om eller kontrollert.</p></div>`);
}
function renderSubject(subject) {
  trail = [subject];
  const nature = subject === 'nature';
  const name = nature ? 'Naturfag' : 'Samfunnsfag';
  const topic = nature ? 'Fra universet til laboratoriet' : 'Landskapet og menneskene';
  frame(name, nature ? 'Velg et tema for faget.' : 'Utforsk hvordan landskap formes av naturkrefter og menneskers bruk.', `<section class="intro"><h2>Tema: ${topic}</h2><p>${nature ? 'Naturfag, teknologi og hvordan forskere undersøker verden.' : 'Hvordan landskapet endrer seg, og hvilke naturfarer og interessekonflikter som kan oppstå.'}</p></section><div class="grid">${card('Tema',topic,nature?'Svar på spørsmål om naturfag og få en forklaring etter hvert svar.':'Lær om landskap, naturkrefter, arealbruk og naturfarer.','topic')}</div>`, 'home');
}
function renderTopic(subject) {
  trail = [subject, 'topic'];
  const nature = subject === 'nature';
  const title = nature ? 'Fra universet til laboratoriet' : 'Landskapet og menneskene';
  const body = nature
    ? card('Quiz','Ta quizen','Test hva du kan om naturfag, teknologi og hvordan forskere finner ut av ting.','quiz-nature')
    : card('Quiz','Ta quizen','Spørsmål om hvordan landskap formes, brukes og påvirkes av naturfarer. Hint og forklaringer følger hvert spørsmål.','quiz-society') + card('Åpne svar · KI i originalen','Forklar med egne ord','Øv på sentrale fagbegreper med fritekstsvar. Originalen bruker serverbasert KI-vurdering.','open') + card('Ordquiz','Skriv riktig fagord','Les en kort forklaring og skriv inn fagordet som passer.','words') + card('Flashcards','Øv med flashcards','Se et fagbegrep, prøv å forklare det selv, og vend kortet for å sjekke.','cards');
  frame(title,'Velg hvordan du vil jobbe med temaet.',`<section class="intro"><h2>Velg aktivitet</h2></section><div class="grid">${body}</div>`,subject);
}
function startQuiz(kind) {
  const source = kind === 'nature' ? data.nature : data.society;
  const items = source.map((q) => ({...q}));
  items.sort(() => Math.random() - .5);
  activity = { type:'quiz', kind, items, pos:0, score:0, selected:false, start:Date.now() };
  state.progress[kind] ||= { attempts:0, completed:0, best:0 };
  state.progress[kind].attempts++;
  save();
  paintQuestion();
}
function paintQuestion() {
  const a = activity, q = a.items[a.pos], total = a.items.length;
  const percent = Math.round(100*a.pos/total);
  const qText = q.q;
  let content;
  if (q.type === 'open') {
    const unlocked=Boolean(a.openSolved?.[a.pos]);
    content = `<label class="tag" for="free-answer">Åpent spørsmål</label><h2 class="question">${esc(qText)}</h2><label for="free-answer">Skriv svaret ditt med egne ord.</label><textarea class="answer-text" id="free-answer" maxlength="500" aria-describedby="feedback"></textarea><div class="feedback" id="feedback" role="status" aria-live="polite"></div><div class="actions">${button('Sjekk svaret','check-open','primary')}<button class="primary" data-action="next-question" ${unlocked?'':'disabled'}>Neste spørsmål</button></div>`;
  } else if (a.kind === 'society') {
    content = `<div class="topic">${esc(q.topic)}</div><h2 class="question">${esc(qText)}</h2><button id="hint-toggle" class="quiet" aria-expanded="false">Vis hint</button><p id="hint-text" class="hint" hidden>${esc(q.hint)}</p><div class="choices">${q.answers.map((ans,n)=>`<button class="choice" data-choice="${n}"><span class="letter">${'ABCD'[n]}</span><span>${esc(ans[0])}</span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite"></div><div class="actions"><button class="primary" data-action="next-question" ${a.selected?'':'disabled'}>Neste spørsmål</button></div>`;
  } else {
    content = `<div class="topic">${esc(q.topic)}</div><h2 class="question">${esc(qText)}</h2><div class="choices">${q.a.map((ans,n)=>`<button class="choice" data-choice="${n}"><span class="letter">${'ABC'[n]}</span><span>${esc(ans)}</span></button>`).join('')}</div><div class="feedback" id="feedback" role="status" aria-live="polite"></div><div class="actions"><button class="primary" data-action="next-question" ${a.selected?'':'disabled'}>Neste spørsmål</button></div>`;
  }
  frame(a.kind === 'nature' ? 'Fra universet til laboratoriet' : 'Landskapet og menneskene', a.kind === 'nature' ? 'Test hva du kan om naturfag, teknologi og hvordan forskere finner ut av ting. Velg det svaret du synes passer best.' : 'Spørsmål og svaralternativer blandes for en ny runde.', `<section class="panel"><div class="progress"><span>Spørsmål ${a.pos+1} av ${total}</span><span>${a.score} poeng</span></div><div class="track"><div class="bar" style="width:${percent}%"></div></div>${content}</section>`, 'topic');
  view.querySelectorAll('[data-choice]').forEach((el)=>el.addEventListener('click',()=>selectChoice(Number(el.dataset.choice))));
  view.querySelector('#hint-toggle')?.addEventListener('click',(e)=>{const p=view.querySelector('#hint-text');p.hidden=!p.hidden;e.currentTarget.setAttribute('aria-expanded',String(!p.hidden));e.currentTarget.textContent=p.hidden?'Vis hint':'Skjul hint';});
  view.querySelector('#free-answer')?.focus();
  if(a.selected && q.type!=='open' && a.selectedChoice!==undefined){const buttons=[...view.querySelectorAll('[data-choice]')];buttons.forEach((el,i)=>{el.disabled=true;const correct=a.kind==='society'?q.answers[i][2]:i===q.c;if(correct)el.classList.add('correct');if(i===a.selectedChoice&&!correct)el.classList.add('wrong');});view.querySelector('#feedback').textContent=a.feedback||'';}
}
function selectChoice(n) {
  const a=activity,q=a.items[a.pos];if(a.selected)return;a.selected=true;
  const society=a.kind==='society', correct=society?q.answers[n][2]:n===q.c;
  view.querySelectorAll('[data-choice]').forEach((el,i)=>{el.disabled=true;const isCorrect=society?q.answers[i][2]:i===q.c;if(isCorrect)el.classList.add('correct');if(i===n&&!correct)el.classList.add('wrong');});
  if(correct)a.score++;
  let explanation=society?q.answers[n][1]:q.why;
  view.querySelector('#feedback').textContent=(correct?'Riktig! ':'Nesten! ')+explanation;
  a.selectedChoice=n;a.feedback=view.querySelector('#feedback').textContent;
  const next=view.querySelector('[data-action="next-question"]');if(next)next.disabled=false;
  save();
}
function checkOpen() {
  const q=activity.items[activity.pos], answer=view.querySelector('#free-answer').value.trim();
  if(!answer){view.querySelector('#feedback').textContent='Skriv et svar før du sjekker det.';return;}
  const key=`open-${activity.pos}`;const attempts=(activity.tries?.[key]||0)+1;activity.tries ||= {};activity.tries[key]=attempts;
  const supported=answer.length>25 && /land|vann|jord|trær|mennes|vind|is|bre|vei|hus|flom|skred/i.test(answer);
  const accepted=supported && attempts<3;
  const feedback=view.querySelector('#feedback');
  feedback.textContent=accepted?'Demovurdering: svaret ser ut til å inneholde et relevant fagord. Dette er en lokal regelbasert simulering, ikke KI-vurdering.':attempts<3?'Demovurdering: utdyp svaret med et relevant fagbegrep, og prøv igjen. Hint åpnes etter to forsøk.':`Et eksempel på et relevant svar: ${q.example || 'Forklar fagbegrepet med sentrale kjennetegn.'} (syntetisk eksempel)`;
  if(attempts>=2&&attempts<3)feedback.textContent+=' Du har brukt to demo-forsøk; bruk hintet i spørsmålet.';
  if(accepted||attempts>=3){activity.openSolved ||= {};activity.openSolved[activity.pos]=true;const next=view.querySelector('[data-action="next-question"]');if(next)next.disabled=false;}
  save();
}
function nextQuestion(){const a=activity;if(a.pos<a.items.length-1){a.pos++;a.selected=false;save();paintQuestion();return;}a.completed=true;const p=state.progress[a.kind];p.completed++;p.best=Math.max(p.best,a.score);activity=null;state.active=null;save();paintResult();}
function paintResult(){const a=activity;frame('Quizen er ferdig',a.kind==='nature'?'Du får vite om svaret er riktig før du går videre.':'Du kan prøve igjen og se om du får enda flere poeng.',`<section class="panel"><div class="score">${a.score} / ${a.items.length}</div><h2 class="section-title">${a.score>=Math.ceil(a.items.length*.75)?'Godt jobbet! Du har fått med deg mye.':'Fint at du prøvde! Se gjennom temaene og prøv igjen.'}</h2><p>Dette forsøket er demodata og ligger bare i denne nettleseren.</p><div class="actions">${button('Prøv igjen','retry','primary')}${button('Til temaet','topic')}</div></section>`,'topic');}
function startCards(){const pos=Math.min(state.cards.position||0,data.cards.length-1);activity={type:'cards',pos,flipped:Boolean(state.cards[pos])};save();paintCard();}
function paintCard(){const a=activity,card=data.cards[a.pos];frame('Landskapet og menneskene','Se et fagbegrep, prøv å forklare det selv, og vend kortet for å sjekke.',`<section class="panel"><div class="progress"><span>Kort ${a.pos+1} av ${data.cards.length}</span><span>${a.flipped?'Svar vist':'Prøv å forklare først'}</span></div><button class="flashcard" id="flip" aria-pressed="${a.flipped}"><strong>${a.flipped?esc(card.definition):esc(card.term)}</strong><span class="muted">${a.flipped?'Trykk for å skjule svaret':'Trykk eller Enter for å snu kortet'}</span></button><div class="actions">${button('Forrige kort','card-prev')}${button('Neste kort','card-next','primary')}</div></section>`,'topic');view.querySelector('#flip').addEventListener('click',()=>{a.flipped=!a.flipped;state.cards[a.pos]=a.flipped;state.cards.position=a.pos;save();paintCard();});}
function startWords(){activity={type:'words',pos:0,tries:0,first:0};save();paintWord();}
function paintWord(){const a=activity,q=data.words[a.pos];frame('Skriv riktig fagord','Les forklaringen og skriv fagordet som passer. Skriv selve ordet, ikke en lang forklaring.',`<section class="panel"><div class="progress"><span>Spørsmål ${a.pos+1} av ${data.words.length}</span><span>${a.first} riktige på første forsøk</span></div><div class="track"><div class="bar" style="width:${Math.round(100*a.pos/data.words.length)}%"></div></div><div class="topic">Spørsmål ${a.pos+1}</div><h2 class="question">${esc(q.prompt)}</h2><p class="hint">${esc(q.sentence)}</p><label for="word-answer">Hvilket fagord passer?</label><input class="answer-input" id="word-answer" maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false"><div id="feedback" class="feedback" role="status" aria-live="polite"></div><div class="actions">${button('Sjekk ordet','check-word','primary')}${button('Neste oppgave','next-word','secondary')}</div></section>`,'topic');view.querySelector('#word-answer').focus();}
function checkWord(){const input=view.querySelector('#word-answer'),value=input.value.trim().toLocaleLowerCase('no').replace(/[.,!?]/g,'');if(!value){view.querySelector('#feedback').textContent='Skriv et fagord før du sjekker.';input.focus();return;}activity.tries++;const expected=String(data.cards.find(c=>c.term.toLocaleLowerCase('no')===value)?.term||'').toLocaleLowerCase('no');const map=['naturlandskap','kulturlandskap','landskapsformer','indre krefter','ytre krefter','frostforvitring','tregrensa','kystlandskap','innlandslandskap','arealbrukskonflikt','naturfare','naturkatastrofe','skred','kvikkleire','flom'];const ok=value===map[activity.pos]||value===map[activity.pos].replace(/e$/,'');const feedback=view.querySelector('#feedback');if(ok){if(activity.tries===1)activity.first++;feedback.textContent='Riktig!';}else feedback.textContent='Ikke helt. Les forklaringen og prøv på nytt. (Lokal demovurdering; ingen KI brukes.)';save();}
function startOpen(){activity={type:'open',pos:0,tries:0,solved:{}};save();paintOpen();}
function paintOpen(){const q=data.open[activity.pos];const solved=Boolean(activity.solved?.[activity.pos]);frame('Forklar med egne ord','Øv på sentrale fagbegreper med fritekstsvar. Den opprinnelige appen ber en KI vurdere faginnholdet. I denne kopien brukes en lokal demonstrasjon uten KI.',`<section class="panel"><div class="progress"><span>Spørsmål ${activity.pos+1} av ${data.open.length}</span><span>${activity.tries} forsøk på denne oppgaven</span></div><div class="topic">${esc(q.topic)}</div><h2 class="question">${esc(q.q)}</h2><label for="open-answer">Skriv svaret ditt med egne ord.</label><textarea class="answer-text" id="open-answer" maxlength="500" aria-describedby="open-feedback"></textarea><div class="feedback" id="open-feedback" role="status" aria-live="polite"></div><div class="actions">${button('Sjekk svaret','open-check','primary')}<button class="secondary" data-action="open-hint" ${activity.tries>=2?'':'hidden'}>Vis hint</button><button class="secondary" data-action="open-next" ${solved?'':'disabled'}>Neste spørsmål</button></div></section><div class="notice"><strong>Demovurdering</strong><p>Kun en enkel lokal tekstregel, ingen KI, server eller persondata. Fasit-/kriteriegrunnlag fra originalens private adminflate er ikke publisert som klientinnhold.</p></div>`,'topic');}
function renderAdmin(){updateIdentity();frame('Administrasjon · demo','Originalen har en egen adminflate med elev- og forsøksadministrasjon. Her vises kun faste, syntetiske eksempeldata uten autentisering.',`<section class="intro"><h2>Testoversikt</h2></section><div class="stats"><div class="stat"><strong>3</strong>syntetiske demoelever</div><div class="stat"><strong>12</strong>demoforsøk</div><div class="stat"><strong>2</strong>fag</div></div><section class="panel"><h2 class="section-title">Syntetisk elevoversikt</h2><p>Elev Nord · 5 forsøk · 4 fullført<br>Elev Sør · 4 forsøk · 3 fullført<br>Elev Vest · 3 forsøk · 2 fullført</p><p>Ingen av radene er virkelige personer. Originalens kontooppretting, passord/PIN, adminautorisasjon og serverlagrede elevdetaljer finnes ikke i demoen.</p>${button('Tilbake til elevvisning','switch-student','primary')}</section>`);
}
function dispatch(action){
 if(action==='home'){activity=null;renderHome();return;}if(action==='switch-student'){state.role='student';save();renderHome();return;}
 if(action==='resume'){activity=state.active;if(activity?.type==='quiz')paintQuestion();else if(activity?.type==='cards')paintCard();else if(activity?.type==='words')paintWord();else if(activity?.type==='open')paintOpen();return;}
 if(action==='nature'||action==='society'){renderSubject(action);return;}if(action==='topic'){renderTopic(trail[0]||'society');return;}
 if(action==='quiz-nature'){startQuiz('nature');return;}if(action==='quiz-society'){startQuiz('society');return;}
 if(action==='next-question'){nextQuestion();return;}if(action==='retry'){startQuiz(activity.kind);return;}
 if(action==='check-open'){checkOpen();return;}
 if(action==='cards'){startCards();return;}if(action==='card-prev'){activity.pos=(activity.pos+data.cards.length-1)%data.cards.length;activity.flipped=false;state.cards.position=activity.pos;save();paintCard();return;}if(action==='card-next'){activity.pos=(activity.pos+1)%data.cards.length;activity.flipped=false;state.cards.position=activity.pos;save();paintCard();return;}
 if(action==='words'){startWords();return;}if(action==='check-word'){checkWord();return;}if(action==='next-word'){activity.pos++;activity.tries=0;if(activity.pos>=data.words.length){const score=activity.first;activity=null;state.active=null;save();frame('Ordquizen er ferdig',`Du fikk ${score} riktige på første forsøk.`, `<section class="panel">${button('Ta ordquizen på nytt','words','primary')}${button('Til temaet','topic')}</section>`,'topic');}else{save();paintWord();}return;}
 if(action==='open'){startOpen();return;}if(action==='open-check'){const answer=view.querySelector('#open-answer').value.trim();const feedback=view.querySelector('#open-feedback');if(!answer){feedback.textContent='Skriv et svar før du sjekker det.';view.querySelector('#open-answer').focus();return;}activity.tries++;const supported=answer.length>25&&/land|vann|jord|trær|mennes|vind|is|bre|vei|hus|flom|skred/i.test(answer);if(supported||activity.tries>=3){activity.solved||={};activity.solved[activity.pos]=true;feedback.textContent=supported?'Demovurdering: svaret inneholder et relevant ord. Dette er ikke en faglig KI-vurdering.':'Et eksempel: '+(data.cards.find((c)=>c.term.toLowerCase()===data.open[activity.pos].topic.toLowerCase())?.definition||'Forklar begrepet med sentrale kjennetegn og et eksempel.')+' (syntetisk eksempel)';}else{feedback.textContent=activity.tries>=2?'Prøv igjen. Hint er nå tilgjengelig.':'Prøv å utdype svaret med et fagbegrep. Dette er en lokal demo, ikke KI.';}const msg=feedback.textContent;save();paintOpen();document.querySelector('#open-feedback').textContent=msg;return;}if(action==='open-hint'){if(activity.tries<2)return;view.querySelector('#open-feedback').textContent='Hint: del svaret i hva som skjer, hvorfor det skjer og hva det fører til.';return;}if(action==='open-next'){if(!activity.solved?.[activity.pos])return;activity.pos++;activity.tries=0;if(activity.pos>=data.open.length){activity=null;state.active=null;save();frame('Åpne svar fullført','Du har sett alle spørsmålene.',`<section class="panel">${button('Begynn på nytt','open','primary')}${button('Til temaet','topic')}</section>`,'topic');}else{save();paintOpen();}return;}
}
document.addEventListener('click',(event)=>{const target=event.target.closest('[data-action]');if(target)dispatch(target.dataset.action);});
document.querySelector('#reset').addEventListener('click',()=>{localStorage.removeItem(STORE);state={role:'student',progress:{},cards:{}};activity=null;renderHome();});
document.addEventListener('keydown',(event)=>{if(event.key==='Enter'&&event.target.id==='word-answer'){event.preventDefault();checkWord();}if(event.key==='Enter'&&event.target.id==='open-answer'&&event.ctrlKey){event.preventDefault();dispatch('open-check');}});
dataReady.then((loaded)=>{data=loaded;renderHome();}).catch((error)=>{view.innerHTML=`<p role="alert">${esc(error.message)}</p>`;});
