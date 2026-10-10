(() => {
  'use strict';
  const seed = () => ({
    title: 'Læringssti · planlegg en parsell',
    modules: [
      { id: 'm01', title: 'Start med rammene', subtitle: 'Planlegging før planting', locked: false, elements: [
        { type: 'richText', title: 'Situasjonen', text: 'Du skal planlegge en liten parsell på **12 ruter**. Målet er å få plass til flere vekster uten å overskride rammen.' },
        { type: 'factBox', title: 'Plassbehov', rows: [{ icon: '✿', label: 'Bladgrønt', text: '1 rute per plante' }, { icon: '❋', label: 'Urter', text: '2 ruter per plante' }, { icon: '✿', label: 'Store blomster', text: '3 ruter per plante' }] },
        { type: 'accordion', title: 'Planleggingstips', items: [{ title: 'Summer før du tegner', text: 'Regn ut hver gruppes plassbehov og legg tallene sammen før du plasserer dem.' }, { title: 'Hold rammen synlig', text: 'Sammenlign summen med de 12 rutene. Hvis den er større, juster planen.' }] },
        { type: 'quiz', title: 'Sjekk forståelsen', question: 'Du vil tegne fire urter og to store blomster. Hva bør du sjekke først?', options: ['Tegn plantene tilfeldig og håp de passer.', 'Regn ut samlet plassbehov og sammenlign med 12 ruter.', 'Legg til flere planter før du tegner.'], correct: [1], multi: false, feedbackCorrect: 'Riktig. 4 × 2 + 2 × 3 = 14 ruter, altså mer enn rammen på 12.', feedbackWrong: 'Ikke helt. Regn ut plassen for hver plantetype og summer først.' },
        { type: 'case', title: 'Lag et forslag', text: 'Sett sammen et forslag som holder seg innenfor 12 ruter. Beskriv hvordan du fordelte plassen.', deliverables: ['En enkel fordeling av rutene', 'En kort begrunnelse'] }
      ] },
      { id: 'm02', title: 'Fra skisse til arbeidsplan', subtitle: 'Prioriter rekkefølgen', locked: true, elements: [
        { type: 'hierarchy', title: 'Arbeidsplan', levels: [{ label: 'Først', items: ['Mål opp rammen', 'Skriv ned plassbehov'] }, { label: 'Deretter', items: ['Tegn plasseringen', 'Kontroller summen'] }] },
        { type: 'timeline', title: 'En enkel rekkefølge', mode: 'all', filterTags: [] }
      ] }
    ],
    timeline: [{ date: 'Steg 1', label: 'Mål opp', description: 'Finn rammens størrelse.', tags: ['plan:forberedelse'] }, { date: 'Steg 2', label: 'Regn ut', description: 'Summer plassen som trengs.', tags: ['plan:beregning'] }, { date: 'Steg 3', label: 'Tegn', description: 'Lag en skisse som passer.', tags: ['plan:skisse'] }],
    media: [{ id: 1, title: 'Ruteplan · eksempelillustrasjon', icon: '▦', linked: true }, { id: 2, title: 'Plantekort · syntetisk eksempel', icon: '✿', linked: true }, { id: 3, title: 'Tidslinje · eksempelgrafikk', icon: '◷', linked: false }],
    activeModule: 0, step: 0, overview: true, completed: [], draft: '', quizChoice: [], feedback: '', feedbackState: '', tab: 'modules'
  });
  const storageKey = 'vibe-wp-l-ringssti-demo-v1';
  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (stored && Array.isArray(stored.modules) && Array.isArray(stored.timeline) && Array.isArray(stored.media) && Array.isArray(stored.completed)) {
        return { ...seed(), ...stored };
      }
    } catch {}
    return seed();
  }
  let state = loadState();
  function persistState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      const status = document.querySelector('#storage-status');
      if (status) status.textContent = 'Nettleseren kunne ikke lagre lokalt. Demoen virker til fanen lukkes.';
    }
  }
  const pathRoot = document.querySelector('#learning-path');
  const editorRoot = document.querySelector('#editor-panel');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const markdown = (value) => esc(value).split('\n').map((line) => line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')).join('<br>');
  const currentModule = () => state.modules[state.activeModule];
  const currentElements = () => currentModule()?.elements || [];
  const humanType = (type) => ({ factBox: 'Faktaboks', accordion: 'Accordion', hierarchy: 'Hirarki', timeline: 'Tidslinje', richText: 'Tekst', quiz: 'Quiz', case: 'Caseoppgave' })[type] || type;
  const resetStepState = () => { state.step = 0; state.quizChoice = []; state.feedback = ''; state.feedbackState = ''; state.draft = ''; };
  const focusStep = () => document.querySelector('[data-step-heading]')?.focus();

  function moduleCard(module, index) {
    const done = state.completed.includes(index);
    return `<button class="module-card" type="button" data-action="open-module" data-index="${index}" ${module.locked ? 'disabled aria-label="' + esc(module.title) + ', låst modul"' : 'aria-current="' + (index === state.activeModule ? 'true' : 'false') + '"'}><span class="module-number">${module.locked ? '⌑' : String(index + 1).padStart(2, '0')}</span><span><span class="module-name">${esc(module.title)}</span><span class="module-detail">${esc(module.subtitle || `${module.elements.length} innholdselementer`)}</span></span><span class="module-check" aria-hidden="true">${done ? '✓' : ''}</span></button>`;
  }
  function renderPath() {
    if (!pathRoot) return;
    const m = currentModule();
    if (!m) { pathRoot.innerHTML = '<div class="empty-state">Ingen moduler i læringsstien ennå.</div>'; return; }
    const locked = !state.overview && m.locked;
    const step = state.overview ? null : m.elements[state.step];
    const progress = m.elements.length ? Math.round((state.step + (state.completed.includes(state.activeModule) ? 1 : 0)) / m.elements.length * 100) : 0;
    let content = '';
    if (state.overview) content = `<div class="overview-intro"><p>Velg en modul for å starte. Låste moduler vises for å illustrere kursrekkefølgen.</p><div class="overview-grid">${state.modules.map(moduleCard).join('')}</div></div>`;
    else if (locked) content = '<div class="locked-panel" role="status"><strong>Modulen er låst.</strong><br>Fullfør forrige steg for å låse den opp. Dette er en forhåndsdefinert demoprofil uten innlogging.</div>';
    else if (!step) content = `<div class="complete-panel"><div class="complete-icon" aria-hidden="true">✓</div><h3>Modul fullført</h3><p>Du har sett alle stegene i denne modulen.</p><button class="button" type="button" data-action="back-overview">Tilbake til moduloversikten</button></div>`;
    else content = renderStep(step, m);
    pathRoot.innerHTML = `<div class="path-layout"><aside class="path-side"><p class="eyebrow">Syntetisk læringssti</p><h2>${esc(state.title)}</h2><p class="sub">En eksempelsti med moduler, innholdselementer og stegvis gjennomføring.</p><div class="badge-row"><span class="badge">${state.modules.length} moduler</span><span class="badge">${state.modules.reduce((sum, mod) => sum + mod.elements.length, 0)} steg</span></div>${state.overview ? '<p class="sample-label">Velg en modul for å begynne.</p>' : `<nav class="module-list" aria-label="Moduler">${state.modules.map(moduleCard).join('')}</nav><button class="button" type="button" data-action="back-overview">Moduloversikt</button>`}<span class="sample-label">Alle navn og eksempler er syntetiske.</span></aside><div class="path-main"><article class="content-card"><div class="module-topline"><h2>${state.overview ? 'Moduloversikt' : esc(m.title)}</h2><span class="step-progress">${state.overview ? 'Velg en modul' : locked ? 'Låst' : step ? `Steg ${state.step + 1} av ${m.elements.length}` : 'Fullført'}</span></div>${!state.overview ? `<div class="progress-track" role="progressbar" aria-label="Fremdrift i modul" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${locked ? 0 : progress}"><span style="width:${locked ? 0 : progress}%"></span></div>` : ''}${content}</article>${!state.overview && !locked && step ? `<div class="player-actions"><button class="button" type="button" data-action="previous" ${state.step === 0 ? 'disabled' : ''}>← Forrige</button><button class="button" type="button" data-action="back-overview">Moduloversikt</button><div class="right">${state.step === m.elements.length - 1 ? '<button class="button primary" type="button" data-action="finish-module">Fullfør modul</button>' : `<button class="button primary" type="button" data-action="next" ${step.type === 'quiz' && !state.completed.includes(state.activeModule + ':' + state.step) ? 'disabled' : ''}>Neste →</button>`}</div></div>` : ''}</div></div>`;
  }
  function renderStep(el, mod) {
    const base = `<p class="step-type">${esc(humanType(el.type))} · ${esc(mod.id)}</p><h3 class="step-title" tabindex="-1" data-step-heading>${esc(el.title || humanType(el.type))}</h3>`;
    if (el.type === 'richText') return `${base}<div class="step-copy">${markdown(el.text)}</div>`;
    if (el.type === 'factBox') return `${base}<p class="step-copy">Informasjon samlet i en faktaboks.</p><div class="fact-grid">${el.rows.map(row => `<div class="fact-row"><span class="fact-icon" aria-hidden="true">${esc(row.icon)}</span><span class="fact-label">${esc(row.label)}</span><span class="fact-text">${esc(row.text)}</span></div>`).join('')}</div>`;
    if (el.type === 'accordion') return `${base}<div class="accordion-list">${el.items.map(item => `<details><summary>${esc(item.title)}</summary><p>${esc(item.text)}</p></details>`).join('')}</div>`;
    if (el.type === 'hierarchy') return `${base}${el.levels.map(level => `<div class="hierarchy"><h4>${esc(level.label)}</h4><ul>${level.items.map(item => `<li>${esc(item)}</li>`).join('')}</ul></div>`).join('')}`;
    if (el.type === 'timeline') { const events = el.mode === 'filter' ? state.timeline.filter(event => event.tags.some(tag => (el.filterTags || []).includes(tag))) : state.timeline; return `${base}<ol class="timeline-list">${events.map(event => `<li><span class="timeline-date">${esc(event.date)}</span><br><strong>${esc(event.label)}</strong><div class="step-copy">${markdown(event.description)}</div></li>`).join('') || '<li>Ingen tidslinjehendelser matcher filteret.</li>'}</ol>`; }
    if (el.type === 'quiz') {
      const inputType = el.multi ? 'checkbox' : 'radio';
      return `${base}<p class="step-copy">${esc(el.question)}</p><fieldset><legend class="visually-hidden">Svaralternativer</legend><div class="quiz-options">${el.options.map((option, index) => `<label class="quiz-option"><input type="${inputType}" name="quiz" value="${index}" ${state.quizChoice.includes(index) ? 'checked' : ''}><span>${esc(option)}</span></label>`).join('')}</div></fieldset><div class="button-row"><button type="button" class="button primary" data-action="check-quiz">Sjekk svar</button><button type="button" class="button" data-action="ai-quiz" ${!state.completed.includes(state.activeModule + ':' + state.step) ? 'disabled' : ''}>Dypdykk (KI)</button></div><p class="quiz-feedback ${state.feedbackState}" tabindex="-1" role="status" aria-live="polite">${esc(state.feedback)}</p>`;
    }
    if (el.type === 'case') return `${base}<p class="step-copy">${esc(el.text)}</p><p><strong>Leveranse</strong></p><ul>${el.deliverables.map(item => `<li>${esc(item)}</li>`).join('')}</ul><label class="field" for="case-draft">Ditt utkast<textarea id="case-draft" class="case-textarea" placeholder="Skriv et kort utkast …">${esc(state.draft)}</textarea></label><div class="case-actions"><button type="button" class="button primary" data-action="save-draft">Lagre utkast midlertidig</button><button type="button" class="button" data-action="clear-draft">Slett utkast</button><button type="button" class="button" data-action="ai-case">KI-sensor</button><span class="save-status" role="status" aria-live="polite" id="draft-status"></span></div><p class="sample-label">Utkast finnes bare i minnet til denne fanen. Det sendes ikke inn og forsvinner ved oppdatering.</p>`;
    return `${base}<p>Dette elementet har ingen eksempelinnhold ennå.</p>`;
  }

  function field(label, value, path, wide = false, multiline = false) {
    const cls = `field${wide ? ' wide' : ''}`;
    return `<label class="${cls}">${esc(label)}${multiline ? `<textarea data-bind="${path}">${esc(value)}</textarea>` : `<input data-bind="${path}" value="${esc(value)}">`}</label>`;
  }
  const pathFor = (mi, ei, key) => `modules.${mi}.elements.${ei}.${key}`;
  function renderElementFields(el, mi, ei) {
    const p = (key) => pathFor(mi, ei, key);
    if (el.type === 'richText') return field('Tekst (syntetisk eksempel)', el.text, p('text'), true, true);
    if (el.type === 'factBox') return `<div class="field wide"><span>Faktarader</span>${el.rows.map((row, ri) => `<div class="element-fields">${field('Ikon', row.icon, `${p('rows')}.${ri}.icon`)}${field('Etikett', row.label, `${p('rows')}.${ri}.label`)}${field('Tekst', row.text, `${p('rows')}.${ri}.text`, true)}<button class="button danger" type="button" data-action="remove-nested" data-mi="${mi}" data-ei="${ei}" data-key="rows" data-index="${ri}">Fjern rad</button></div>`).join('')}<button class="button" type="button" data-action="add-row" data-mi="${mi}" data-ei="${ei}">Legg til rad</button></div>`;
    if (el.type === 'accordion') return `<div class="field wide"><span>Punkter</span>${el.items.map((item, ri) => `<div class="element-fields">${field('Tittel', item.title, `${p('items')}.${ri}.title`)}${field('Tekst', item.text, `${p('items')}.${ri}.text`, true, true)}<button class="button danger" type="button" data-action="remove-nested" data-mi="${mi}" data-ei="${ei}" data-key="items" data-index="${ri}">Fjern punkt</button></div>`).join('')}<button class="button" type="button" data-action="add-item" data-mi="${mi}" data-ei="${ei}">Legg til punkt</button></div>`;
    if (el.type === 'hierarchy') return `<div class="field wide"><span>Nivåer</span>${el.levels.map((level, ri) => `<div class="element-fields">${field('Nivå', level.label, `${p('levels')}.${ri}.label`)}${field('Punkter (ett per linje)', level.items.join('\n'), `${p('levels')}.${ri}.items`, true, true)}<button class="button danger" type="button" data-action="remove-nested" data-mi="${mi}" data-ei="${ei}" data-key="levels" data-index="${ri}">Fjern nivå</button></div>`).join('')}<button class="button" type="button" data-action="add-level" data-mi="${mi}" data-ei="${ei}">Legg til nivå</button></div>`;
    if (el.type === 'timeline') return `<label class="field">Vis hendelser<select data-bind="${p('mode')}"><option value="all" ${el.mode !== 'filter' ? 'selected' : ''}>Alle hendelser</option><option value="filter" ${el.mode === 'filter' ? 'selected' : ''}>Filtrer på tagger</option></select></label>${el.mode === 'filter' ? field('Tagger (kommaseparert)', (el.filterTags || []).join(', '), p('filterTags'), true) : ''}`;
    if (el.type === 'quiz') return `${field('Spørsmål', el.question, p('question'), true, true)}${el.options.map((option, oi) => `<div>${field(`Alternativ ${oi + 1}`, option, `${p('options')}.${oi}`)}<label class="field inline"><input type="checkbox" data-correct="${mi}.${ei}.${oi}" ${el.correct.includes(oi) ? 'checked' : ''}> Riktig svar</label><button type="button" class="button danger" data-action="remove-option" data-mi="${mi}" data-ei="${ei}" data-index="${oi}">Fjern alternativ</button></div>`).join('')}<button type="button" class="button" data-action="add-option" data-mi="${mi}" data-ei="${ei}">Legg til svaralternativ</button><label class="field inline"><input type="checkbox" data-bind="${p('multi')}" ${el.multi ? 'checked' : ''}> Tillat flere riktige svar</label>${field('Tilbakemelding ved riktig svar', el.feedbackCorrect, p('feedbackCorrect'), true, true)}${field('Tilbakemelding ved feil svar', el.feedbackWrong, p('feedbackWrong'), true, true)}`;
    if (el.type === 'case') return `${field('Oppgavetekst', el.text, p('text'), true, true)}${field('Leveransekrav (ett per linje)', el.deliverables.join('\n'), `${p('deliverables')}`, true, true)}`;
    return '';
  }
  function renderEditor() {
    if (!editorRoot) return;
    editorRoot.setAttribute('aria-labelledby', `tab-${state.tab}`);
    if (state.tab === 'modules') {
      editorRoot.innerHTML = `<div class="callout">Endringene simulerer adminredigering. Bruk pilknappene til å endre rekkefølge. Ingen «Lagre»-knapp sender data til en server.</div><div class="section-label">Læringsmoduler</div>${state.modules.length ? state.modules.map((m, mi) => `<section class="module-edit-card"><div class="module-edit-head"><h3>Modul ${mi + 1} · ${esc(m.id)}</h3><div class="edit-controls"><button class="icon-button" type="button" aria-label="Flytt modul opp" data-action="move-module" data-mi="${mi}" data-dir="-1">↑</button><button class="icon-button" type="button" aria-label="Flytt modul ned" data-action="move-module" data-mi="${mi}" data-dir="1">↓</button><button class="button danger" type="button" data-action="remove-module" data-mi="${mi}">Slett</button></div></div><div class="module-fields">${field('Modultittel', m.title, `modules.${mi}.title`)}${field('Undertittel', m.subtitle, `modules.${mi}.subtitle`)}<label class="field inline"><input type="checkbox" data-bind="modules.${mi}.locked" ${m.locked ? 'checked' : ''}> Låst modul</label></div><div class="section-label">Del 1-elementer</div>${m.elements.map((el, ei) => `<article class="element-edit-card"><div class="element-edit-head"><h4>${esc(humanType(el.type))} · ${esc(el.title || `Element ${ei + 1}`)}</h4><div class="edit-controls"><button class="icon-button" type="button" aria-label="Flytt element opp" data-action="move-element" data-mi="${mi}" data-ei="${ei}" data-dir="-1">↑</button><button class="icon-button" type="button" aria-label="Flytt element ned" data-action="move-element" data-mi="${mi}" data-ei="${ei}" data-dir="1">↓</button><button class="button danger" type="button" data-action="remove-element" data-mi="${mi}" data-ei="${ei}">Slett</button></div></div><div class="element-fields">${field('Elementtittel', el.title, pathFor(mi, ei, 'title'), true)}${renderElementFields(el, mi, ei)}</div></article>`).join('')}<div class="button-row"><label class="field">Nytt element<select data-add-type="${mi}"><option value="">Velg type</option><option value="factBox">Faktaboks</option><option value="accordion">Accordion</option><option value="hierarchy">Hirarki</option><option value="timeline">Tidslinje</option><option value="richText">Tekst (markdown)</option><option value="quiz">Quiz</option><option value="case">Caseoppgave</option></select></label><button class="button" type="button" data-action="add-module-element" data-mi="${mi}">Legg til element</button></div></section>`).join('') : '<div class="empty-state">Ingen moduler ennå.</div>'}<button class="button primary" type="button" data-action="add-module">+ Legg til modul</button>`;
    } else if (state.tab === 'timeline') {
      editorRoot.innerHTML = `<div class="callout">Global tidslinje kan gjenbrukes av tidslinje-elementer i modulene. Tagger er syntetiske og lokale.</div><div class="section-label">Hendelser</div>${state.timeline.map((event, i) => `<article class="timeline-edit-card"><div class="element-fields">${field('Dato / steg', event.date, `timeline.${i}.date`)}${field('Tittel', event.label, `timeline.${i}.label`)}${field('Beskrivelse', event.description, `timeline.${i}.description`, true, true)}${field('Tagger (kommaseparert)', event.tags.join(', '), `timeline.${i}.tags`, true)}</div><button class="button danger" type="button" data-action="remove-event" data-index="${i}">Slett hendelse</button></article>`).join('')}<button class="button primary" type="button" data-action="add-event">+ Legg til hendelse</button>`;
    } else {
      editorRoot.innerHTML = `<div class="callout">Sti-media er illustrert med syntetiske eksempler. WordPress-mediebibliotek og attachment-ID-er er ikke koblet til.</div><div class="section-label">Knytt media til læringsstien</div><div class="media-list">${state.media.map((item, i) => `<article class="media-card"><div class="media-art" aria-hidden="true">${esc(item.icon)}</div><strong>${esc(item.title)}</strong><label><input type="checkbox" data-media="${i}" ${item.linked ? 'checked' : ''}> Inkludert i sti-media</label></article>`).join('')}</div>`;
    }
  }
  function updatePath(path, value) {
    const parts = path.split('.'); let obj = state;
    for (let i = 0; i < parts.length - 1; i++) obj = obj[Number.isInteger(Number(parts[i])) && parts[i] !== '' ? Number(parts[i]) : parts[i]];
    const key = parts[parts.length - 1];
    if (key === 'items' || key === 'deliverables') value = value.split('\n').map(s => s.trim()).filter(Boolean);
    if (key === 'tags' || key === 'filterTags') value = value.split(',').map(s => s.trim()).filter(Boolean);
    obj[Number.isInteger(Number(key)) && key !== '' ? Number(key) : key] = value;
  }
  function blankElement(type) {
    const defaults = { factBox: { title: 'Ny faktaboks', rows: [{ icon: '•', label: 'Etikett', text: 'Syntetisk eksempel' }] }, accordion: { title: 'Nytt accordion', items: [{ title: 'Nytt punkt', text: 'Syntetisk eksempeltekst.' }] }, hierarchy: { title: 'Nytt hirarki', levels: [{ label: 'Nivå 1', items: ['Nytt punkt'] }] }, timeline: { title: 'Tidslinje', mode: 'all', filterTags: [] }, richText: { title: 'Tekst', text: 'Skriv eksempeltekst.' }, quiz: { title: 'Quiz', question: 'Skriv spørsmål.', options: ['Alternativ 1', 'Alternativ 2'], correct: [0], multi: false, feedbackCorrect: 'Riktig!', feedbackWrong: 'Prøv igjen.' }, case: { title: 'Caseoppgave', text: 'Skriv oppgavetekst.', deliverables: ['Leveranse'] } };
    return { type, ...defaults[type] };
  }
  function move(array, from, direction) { const to = from + direction; if (to < 0 || to >= array.length) return; [array[from], array[to]] = [array[to], array[from]]; }
  function openDialog(title, copy) {
    const dialog = document.querySelector('#demo-dialog'); document.querySelector('#dialog-title').textContent = title; document.querySelector('#dialog-copy').textContent = copy; dialog.showModal(); document.querySelector('#dialog-close').focus();
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]'); if (!target) return;
    if (target.dataset.action === 'reset-demo') { localStorage.removeItem(storageKey); location.reload(); return; }
    const action = target.dataset.action, mi = Number(target.dataset.mi), ei = Number(target.dataset.ei), ix = Number(target.dataset.index);
    if (action === 'open-module') { state.activeModule = ix; state.overview = false; resetStepState(); renderPath(); focusStep(); }
    else if (action === 'previous') { state.step = Math.max(0, state.step - 1); state.quizChoice = []; state.feedback = ''; renderPath(); focusStep(); }
    else if (action === 'next') { state.step++; state.quizChoice = []; state.feedback = ''; state.feedbackState = ''; renderPath(); focusStep(); }
    else if (action === 'finish-module') { if (!state.completed.includes(state.activeModule)) state.completed.push(state.activeModule); state.step = currentElements().length; renderPath(); }
    else if (action === 'back-overview') { state.step = 0; state.overview = true; renderPath(); document.querySelector('.module-card:not(:disabled)')?.focus(); }
    else if (action === 'check-quiz') {
      const selected = [...document.querySelectorAll('input[name="quiz"]:checked')].map(input => Number(input.value));
      const quiz = currentElements()[state.step];
      if (!selected.length) { state.feedback = 'Velg minst ett svar.'; state.feedbackState = 'bad'; }
      else if (selected.length === quiz.correct.length && selected.every(value => quiz.correct.includes(value))) { state.feedback = quiz.feedbackCorrect; state.feedbackState = 'good'; const key = state.activeModule + ':' + state.step; if (!state.completed.includes(key)) state.completed.push(key); }
      else { state.feedback = quiz.feedbackWrong; state.feedbackState = 'bad'; }
      renderPath(); document.querySelector('.quiz-feedback')?.focus();
    } else if (action === 'save-draft') { state.draft = document.querySelector('#case-draft').value; document.querySelector('#draft-status').textContent = 'Utkast lagret lokalt i denne nettleseren.'; }
    else if (action === 'clear-draft') { state.draft = ''; renderPath(); document.querySelector('#case-draft').focus(); }
    else if (action === 'ai-quiz') openDialog('Dypdykk (KI)', 'Denne kildeknappen er en stub uten tilkoblet backend. I demoen sendes ingen svar videre.');
    else if (action === 'ai-case') openDialog('KI-sensor', 'Dette er en kilde-stub som ikke er koblet til backend. Utkastet vurderes ikke og forlater ikke nettleserfanen.');
    else if (action === 'add-module') { const n = state.modules.length + 1; state.modules.push({ id: `m${String(n).padStart(2, '0')}`, title: `Ny modul ${n}`, subtitle: 'Syntetisk demoinnhold', locked: false, elements: [] }); renderEditor(); }
    else if (action === 'move-module') { move(state.modules, mi, Number(target.dataset.dir)); renderEditor(); }
    else if (action === 'remove-module') { state.modules.splice(mi, 1); state.activeModule = Math.min(state.activeModule, Math.max(0, state.modules.length - 1)); renderEditor(); renderPath(); }
    else if (action === 'move-element') { move(state.modules[mi].elements, ei, Number(target.dataset.dir)); renderEditor(); }
    else if (action === 'remove-element') { state.modules[mi].elements.splice(ei, 1); renderEditor(); renderPath(); }
    else if (action === 'add-module-element') { const select = document.querySelector(`[data-add-type="${mi}"]`); if (select.value === 'case' && state.modules[mi].elements.some(element => element.type === 'case')) openDialog('Én caseoppgave per modul', 'Kildeeditoren tillater kun én caseoppgave i hver modul.'); else if (select.value) { state.modules[mi].elements.push(blankElement(select.value)); renderEditor(); } }
    else if (action === 'add-option') { state.modules[mi].elements[ei].options.push(`Alternativ ${state.modules[mi].elements[ei].options.length + 1}`); renderEditor(); }
    else if (action === 'remove-option') { const quiz = state.modules[mi].elements[ei]; quiz.options.splice(ix, 1); quiz.correct = quiz.correct.filter(value => value !== ix).map(value => value > ix ? value - 1 : value); renderEditor(); }
    else if (action === 'remove-nested') { state.modules[mi].elements[ei][target.dataset.key].splice(ix, 1); renderEditor(); }
    else if (action === 'add-row') { state.modules[mi].elements[ei].rows.push({ icon: '•', label: 'Ny etikett', text: 'Syntetisk tekst' }); renderEditor(); }
    else if (action === 'add-item') { state.modules[mi].elements[ei].items.push({ title: 'Nytt punkt', text: 'Syntetisk tekst' }); renderEditor(); }
    else if (action === 'add-level') { state.modules[mi].elements[ei].levels.push({ label: `Nivå ${state.modules[mi].elements[ei].levels.length + 1}`, items: ['Nytt punkt'] }); renderEditor(); }
    else if (action === 'add-event') { state.timeline.push({ date: 'Nytt steg', label: 'Ny hendelse', description: 'Syntetisk eksempel.', tags: [] }); renderEditor(); }
    else if (action === 'remove-event') { state.timeline.splice(ix, 1); renderEditor(); }
    persistState();
  });
  document.addEventListener('input', (event) => {
    if (event.target.matches('[data-bind]')) { updatePath(event.target.dataset.bind, event.target.type === 'checkbox' ? event.target.checked : event.target.value); persistState(); }
    if (event.target.matches('#case-draft')) { state.draft = event.target.value; persistState(); }
    if (event.target.matches('input[name="quiz"]')) { const value = Number(event.target.value); if (event.target.type === 'radio') state.quizChoice = [value]; else if (event.target.checked) state.quizChoice.push(value); else state.quizChoice = state.quizChoice.filter(item => item !== value); persistState(); }
  });
  document.addEventListener('change', (event) => {
    if (event.target.matches('[data-add-type]')) event.target.dataset.selectedType = event.target.value;
    if (event.target.matches('[data-correct]')) { const [mi, ei, oi] = event.target.dataset.correct.split('.').map(Number); const correct = state.modules[mi].elements[ei].correct; state.modules[mi].elements[ei].correct = event.target.checked ? [...new Set([...correct, oi])] : correct.filter(value => value !== oi); }
    if (event.target.matches('[data-bind]')) { updatePath(event.target.dataset.bind, event.target.value); }
    if (event.target.matches('[data-bind]')) { updatePath(event.target.dataset.bind, event.target.value); }
    if (event.target.matches('[data-media]')) state.media[Number(event.target.dataset.media)].linked = event.target.checked;
    if (event.target.matches('[data-correct], [data-media], [data-bind]')) persistState();
  });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    const edit = button.dataset.view === 'edit'; document.querySelectorAll('[data-view]').forEach(item => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-pressed', item === button ? 'true' : 'false'); });
    document.querySelector('#learn-view').hidden = edit; document.querySelector('#edit-view').hidden = !edit; if (edit) renderEditor(); else renderPath();
  }));
  document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    state.tab = button.dataset.tab; document.querySelectorAll('[data-tab]').forEach(item => { item.classList.toggle('is-active', item === button); item.setAttribute('aria-selected', item === button ? 'true' : 'false'); }); renderEditor();
  }));
  document.querySelector('#dialog-close').addEventListener('click', () => document.querySelector('#demo-dialog').close());
  document.querySelector('#dialog-ok').addEventListener('click', () => document.querySelector('#demo-dialog').close());
  document.querySelector('#demo-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) event.currentTarget.close(); });
  renderPath();
})();
