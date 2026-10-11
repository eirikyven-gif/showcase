(() => {
  'use strict';

  const KEY = 'vibe-laringssti-demo-v2';
  const categories = [
    { id: 'kartlegg', name: 'Kartlegg bygget', intro: 'Bli kjent med bygget og samle observasjoner før du vurderer tilstanden.' },
    { id: 'vurder', name: 'Vurder funnene', intro: 'Sorter observasjonene, prioriter videre undersøkelser og begrunn vurderingen.' },
  ];
  const pages = [
    { id: 'intro', category: 'kartlegg', title: 'Velkommen til demostien', type: 'reading', criterion: 'none', body: 'I denne syntetiske øvelsen følger du en tilstandsvurdering fra første observasjon til begrunnet prioritering. Arbeid gjennom kategoriene i valgfri rekkefølge. Eksemplet er laget for å vise funksjoner og er ikke faglig rådgivning.' },
    { id: 'video', category: 'kartlegg', title: 'Bli kjent med bygget', type: 'video', criterion: 'video', body: 'Et kort, syntetisk introduksjonsklipp viser et eldre undervisningsbygg. Spill av klippet med den innebygde spilleren; fremdriften registreres når avspillingen er ferdig.', mediaTitle: 'Utvendig gjennomgang · testklipp', transcript: 'Syntetisk testklipp: Bygget har teglfasade, saltak og flere synlige overganger mellom eldre og nyere materialer. Ingen virkelig bygning er avbildet.' },
    { id: 'fasade', category: 'kartlegg', title: 'Se etter synlige tegn', type: 'image', criterion: 'none', body: 'Undersøk den syntetiske illustrasjonen. Hvilke observasjoner bør beskrives nøytralt før du trekker en konklusjon?', mediaTitle: 'Illustrasjon av fasade · syntetisk', alt: 'Tegnet fasade med en markert sprekk i murverket, renne og vindu.' },
    { id: 'lyd', category: 'kartlegg', title: 'Lytt til en feltlogg', type: 'audio', criterion: 'none', body: 'Spill av den korte syntetiske lydmarkøren, og les testtranskripsjonen. Lyd og tekst er laget for denne demoen.', mediaTitle: 'Feltlogg · syntetisk lyd', transcript: 'Testtranskripsjon: «Ved nordveggen sees en smal sprekk over vinduet. Det er ikke registrert målinger i denne øvelsen.»' },
    { id: 'enkeltvalg', category: 'kartlegg', title: 'Kontroller observasjonen', type: 'single', criterion: 'automatic', body: 'Hva er en nøytral observasjon før årsaken er undersøkt?', prompt: 'Velg det beste svaret.', options: ['Det er en smal sprekk over vinduet.', 'Fundamentet har sviktet.', 'Bygget er farlig.'], answer: 0, explanation: 'En observasjon beskriver det som kan sees. Årsak og risiko krever videre undersøkelse.' },
    { id: 'flervalg', category: 'kartlegg', title: 'Velg relevante opplysninger', type: 'multi', criterion: 'automatic', body: 'Flere svar kan være relevante som del av en ryddig feltregistrering.', prompt: 'Hvilke opplysninger kan registreres uten å konkludere om årsaken?', options: ['Plassering og retning', 'Omtrentlig lengde', 'En udokumentert forklaring', 'Dato for observasjonen'], answer: [0, 1, 3], explanation: 'Beskriv plassering, utstrekning og tidspunkt. Hold antakelser adskilt fra observasjonene.' },
    { id: 'sorter', category: 'vurder', title: 'Sorter observasjon og tolkning', type: 'sorting', criterion: 'automatic', body: 'Plasser hvert utsagn i riktig gruppe. Oppgaven lagrer bare resultatet i denne nettleseren.', statements: ['Mørk misfarging under vinduet', 'Fukt kommer fra en lekkasje', 'Sprekken måler omtrent 20 cm', 'Veggen er ustabil'], groups: ['Observasjon', 'Mulig tolkning'], answers: [0, 1, 0, 1], explanation: 'En måling eller synlig beskrivelse er en observasjon. Årsak og stabilitet er tolkninger som trenger underlag.' },
    { id: 'prioriter', category: 'vurder', title: 'Prioriter neste undersøkelse', type: 'priority', criterion: 'automatic', body: 'Sett aktivitetene i en fornuftig rekkefølge. Bruk knappene for å flytte valgt aktivitet opp eller ned.', items: ['Vurder behov for faglig oppfølging', 'Dokumenter plassering og omfang', 'Undersøk området nærmere'], correctOrder: [1, 2, 0], explanation: 'Start med å dokumentere funnet, undersøk det nærmere og vurder deretter nødvendig oppfølging.' },
    { id: 'fritekst', category: 'vurder', title: 'Begrunn vurderingen', type: 'text', criterion: 'text', body: 'Skriv en kort, syntetisk begrunnelse. Ta med hva som er observert, hva som fortsatt er usikkert, og hva du vil undersøke videre.', prompt: 'Din begrunnelse' },
    { id: 'losning', category: 'vurder', title: 'Løsningsforslag · tekst', type: 'solutionText', criterion: 'none', body: 'Sammenstill observasjon, usikkerhet og neste steg. I et reelt oppdrag må metode og konklusjon bygge på dokumenterte undersøkelser og relevant fagkompetanse.', solution: 'Eksempel på struktur: «Det er observert en smal sprekk over vinduet på nordveggen. Årsaken er ikke fastslått. Jeg vil dokumentere plassering og omfang og anbefale nærmere undersøkelse før tilstand eller risiko vurderes.»' },
    { id: 'losning-video', category: 'vurder', title: 'Løsningsforslag · video', type: 'solutionVideo', criterion: 'video', body: 'Se den syntetiske gjennomgangen av hvordan en observasjon kan skilles fra en konklusjon.', mediaTitle: 'Oppsummering · testklipp', transcript: 'Syntetisk testklipp: «Beskriv først hvor funnet er og hva som kan observeres. Noter deretter hva du ikke vet, og foreslå en undersøkelse som kan redusere usikkerheten.»', solution: 'Lærerens eksempeltekst er kun tilgjengelig i lærerforhåndsvisning eller etter at kategorien er fullført.' },
  ];

  const app = document.getElementById('app');
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const pageById = (id) => pages.find((page) => page.id === id);
  const categoryById = (id) => categories.find((category) => category.id === id);
  const blankState = () => ({ role: 'student', alias: 'Demo-elev 01', current: null, done: [], answers: {}, notes: {}, published: true, adminTitle: 'Tilstandsvurdering av et eldre bygg' });
  const loadState = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!value || typeof value !== 'object' || !Array.isArray(value.done) || !Array.isArray(value.done.filter((id) => pageById(id)))) return blankState();
      return { ...blankState(), ...value, done: value.done.filter((id) => pages.some((page) => page.id === id)) };
    } catch { return blankState(); }
  };
  let state = loadState();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { announce('Nettleseren kunne ikke lagre demoen lokalt. Fremdriften gjelder bare denne visningen.'); } };
  const announce = (message) => { const region = document.getElementById('notice'); if (region) region.textContent = message; };
  const completed = (id) => state.done.includes(id);
  const categoryProgress = (id) => {
    const required = pages.filter((page) => page.category === id && page.criterion !== 'none');
    const count = required.filter((page) => completed(page.id)).length;
    return { count, total: required.length, done: count === required.length };
  };
  const moduleDone = () => categories.every((category) => categoryProgress(category.id).done);
  const markDone = (id, message = 'Aktiviteten er registrert i denne nettleseren.') => {
    if (state.role === 'teacher') { announce('Lærerforhåndsvisning lagrer ikke studentaktivitet eller progresjon.'); return; }
    if (!completed(id)) state.done.push(id);
    save();
    const currentPage = location.hash.replace(/^#\/?page\//, '');
    if (currentPage === id) {
      const badge = app.querySelector('.lesson-actions .status');
      if (badge) { badge.textContent = '✓ Fullført'; badge.classList.add('is-done'); }
      const markButton = app.querySelector(`[data-action="complete"][data-page="${id}"]`);
      if (markButton) markButton.textContent = 'Siden er lest ✓';
    }
    announce(message);
  };
  const link = (hash, label, cls = '') => `<a class="${cls}" href="#${esc(hash)}">${label}</a>`;
  const status = (done, label) => `<span class="status ${done ? 'is-done' : ''}">${done ? '✓ Fullført' : esc(label)}</span>`;
  const topbar = () => `<div class="demo-banner"><strong>Testinnhold</strong><span>Alt er syntetisk og kan inneholde faglige feil.</span></div><div class="learning-top"><a href="#home" class="learning-brand">Læringssti</a><div class="user-tools"><span class="demo-user">${esc(state.alias)}</span><button type="button" class="quiet-button" data-action="reset">Nullstill demo</button></div></div><div id="notice" class="sr-live" role="status" aria-live="polite"></div>`;
  const tabs = () => `<nav class="mode-nav" aria-label="Demomodus"><button type="button" data-role="student" aria-pressed="${state.role === 'student'}">Student</button><button type="button" data-role="teacher" aria-pressed="${state.role === 'teacher'}">Lærerforhåndsvisning</button><button type="button" data-role="admin" aria-pressed="${state.role === 'admin'}">Administrasjon</button></nav>`;
  const shell = (content) => `${topbar()}${tabs()}${content}`;
  const cards = () => categories.map((category) => {
    const progress = categoryProgress(category.id);
    const items = pages.filter((page) => page.category === category.id);
    return `<section class="category-card"><div class="category-head"><div><p class="overline">Kategori · valgfri rekkefølge</p><h3>${esc(category.name)}</h3><p>${esc(category.intro)}</p></div>${status(progress.done, `${progress.count} av ${progress.total} obligatoriske aktiviteter`)}</div><ol class="page-list">${items.map((page, index) => `<li>${link(`page/${page.id}`, `<span class="page-number">${index + 1}</span><span><strong>${esc(page.title)}</strong><small>${esc(page.type === 'video' || page.type === 'solutionVideo' ? 'Video · se for å fullføre' : page.type === 'text' ? 'Fritekstsvar' : page.criterion === 'automatic' ? 'Interaktiv oppgave' : 'Læringsside')}</small></span>${completed(page.id) ? '<span aria-label="Fullført">✓</span>' : ''}`, 'page-link')}</li>`).join('')}</ol><div class="category-foot">${link(`category/${category.id}`, `Åpne ${esc(category.name)} →`, 'primary-link')}</div></section>`;
  }).join('');
  const home = () => `<section class="welcome"><p class="overline">Syntetisk demosti · Fagskolen</p><h1>Tilstandsvurdering av et eldre bygg</h1><p class="intro">En sammenhengende testflyt fra kartlegging til vurdering. Kategoriene kan tas i valgfri rekkefølge, og fremdriften viser hva som gjenstår.</p><div class="alert-note"><span aria-hidden="true">ⓘ</span><p>Dette er kun testinnhold. Tekst, bilder, lyd og oppgaver er syntetiske og skal ikke brukes som undervisnings- eller vurderingsgrunnlag.</p></div><div class="progress-card"><div><strong>Modulfremdrift</strong><span>${moduleDone() ? 'Fullført' : 'Kategoriene kan gjennomføres parallelt'}</span></div><span class="progress-count">${categories.filter((item) => categoryProgress(item.id).done).length} / ${categories.length}</span><div class="progress-track" role="img" aria-label="${categories.filter((item) => categoryProgress(item.id).done).length} av ${categories.length} kategorier fullført"><span style="width:${categories.filter((item) => categoryProgress(item.id).done).length / categories.length * 100}%"></span></div></div></section><div class="category-grid">${cards()}</div>`;
  const categoryView = (id) => {
    const category = categoryById(id); if (!category) return home();
    const progress = categoryProgress(id);
    return `<div class="crumbs">${link('home', 'Læringssti')} <span aria-hidden="true">/</span> ${esc(category.name)}</div><section class="welcome compact"><p class="overline">Kategori</p><h1>${esc(category.name)}</h1><p class="intro">${esc(category.intro)}</p><p class="progress-inline">${status(progress.done, `${progress.count} av ${progress.total} obligatoriske aktiviteter fullført`)}</p></section><ol class="page-list expanded">${pages.filter((page) => page.category === id).map((page, index) => `<li>${link(`page/${page.id}`, `<span class="page-number">${index + 1}</span><span><strong>${esc(page.title)}</strong><small>${esc(page.criterion === 'video' ? 'Se video' : page.criterion === 'text' ? 'Skriv svar' : page.criterion === 'automatic' ? 'Løs oppgave' : 'Les side')}</small></span>${completed(page.id) ? '<span aria-label="Fullført">✓</span>' : ''}`, 'page-link')}</li>`).join('')}</ol><p>${link('home', '← Tilbake til modulen', 'back-link-inline')}</p>`;
  };
  const mediaCard = (page) => `<section class="media-card" aria-label="${esc(page.mediaTitle)}"><div class="media-art" role="img" aria-label="${esc(page.alt || page.mediaTitle)}"><svg viewBox="0 0 640 240" aria-hidden="true"><rect width="640" height="240" rx="12" fill="#f4e5e5"/><path d="M68 202V81l117-45 116 45v121M68 82h233M90 111h50v47H90zM215 111h43v91h-43z" fill="#fffaf7" stroke="#702330" stroke-width="5"/><path d="M250 97l-10 15 12 13-13 17" fill="none" stroke="#a9283c" stroke-width="5"/><path d="M335 198h238M380 198V96l89-29 89 29v102M380 97h178" fill="none" stroke="#9e2638" stroke-width="5"/><circle cx="497" cy="140" r="22" fill="#a9283c" opacity=".12"/><text x="320" y="225" text-anchor="middle" fill="#702330" font-size="15" font-family="sans-serif">Illustrasjon laget for testdemoen · ikke et virkelig bygg</text></svg></div><div class="media-caption"><strong>${esc(page.mediaTitle)}</strong><span>Syntetisk testressurs</span></div>${page.type === 'video' || page.type === 'solutionVideo' ? `<video class="demo-video" controls preload="metadata" playsinline aria-label="${esc(page.mediaTitle)}"><source src="/vibe/laringssti-fagskolen/assets/synthetic-building.mp4" type="video/mp4"><track kind="captions" srclang="nb" label="Norsk teksting" src="/vibe/laringssti-fagskolen/assets/synthetic-building.vtt" default>Video kan ikke spilles av i denne nettleseren.</video><p class="transcript">Tekstalternativ: ${esc(page.transcript)}</p><p class="media-hint">Testvideoen er syntetisk. Den fullføres når avspillingen er ferdig.</p>` : page.type === 'audio' ? `<audio class="demo-audio" controls preload="none" aria-label="${esc(page.mediaTitle)}"><source src="/vibe/laringssti-fagskolen/assets/synthetic-tone.wav" type="audio/wav">Lyd kan ikke spilles av i denne nettleseren.</audio><p class="transcript">Lydalternativ: En kort syntetisk tone uten tale. ${esc(page.transcript)}</p>` : ''}</section>`;
  const solution = (page) => state.role === 'teacher' || moduleDone() ? `<aside class="solution-box"><h3>Lærerens løsningsforslag</h3><p>${esc(page.solution)}</p><small>Syntetisk eksempel · ikke fasit for en virkelig vurdering</small></aside>` : '';
  const activity = (page) => {
    if (page.type === 'single' || page.type === 'multi') {
      const multi = page.type === 'multi'; const selected = state.answers[page.id] || [];
      return `<form class="activity" data-activity="${esc(page.id)}"><fieldset><legend>${esc(page.prompt)}</legend><div class="answer-list">${page.options.map((option, index) => `<label class="answer-option"><input type="${multi ? 'checkbox' : 'radio'}" name="answer-${esc(page.id)}" value="${index}" ${selected.includes(index) ? 'checked' : ''}><span>${esc(option)}</span></label>`).join('')}</div></fieldset><button class="primary-button" type="submit">${completed(page.id) ? 'Kontroller på nytt' : 'Kontroller svar'}</button><p class="feedback" id="feedback-${esc(page.id)}" role="status" aria-live="polite"></p></form>`;
    }
    if (page.type === 'sorting') {
      return `<section class="activity"><h2>Sorter utsagnene</h2><p>Velg gruppe for hvert utsagn.</p>${page.statements.map((item, index) => `<label class="sort-row"><span>${esc(item)}</span><select data-sort="${esc(page.id)}" data-index="${index}" aria-label="Gruppe for: ${esc(item)}"><option value="">Velg gruppe</option>${page.groups.map((group, groupIndex) => `<option value="${groupIndex}" ${state.answers[page.id]?.[index] === groupIndex ? 'selected' : ''}>${esc(group)}</option>`).join('')}</select></label>`).join('')}<button class="primary-button" type="button" data-action="check-sort" data-page="${esc(page.id)}">Kontroller sorteringen</button><p class="feedback" id="feedback-${esc(page.id)}" role="status" aria-live="polite"></p></section>`;
    }
    if (page.type === 'priority') {
      const order = state.answers[page.id] || page.items.map((_, index) => index);
      return `<section class="activity"><h2>Prioriteringsliste</h2><ol class="rank-list">${order.map((item, pos) => `<li><span>${esc(page.items[item])}</span><span class="rank-actions"><button type="button" data-action="move" data-page="${esc(page.id)}" data-index="${pos}" data-direction="-1" aria-label="Flytt ${esc(page.items[item])} opp" ${pos === 0 ? 'disabled' : ''}>↑</button><button type="button" data-action="move" data-page="${esc(page.id)}" data-index="${pos}" data-direction="1" aria-label="Flytt ${esc(page.items[item])} ned" ${pos === order.length - 1 ? 'disabled' : ''}>↓</button></span></li>`).join('')}</ol><button class="primary-button" type="button" data-action="check-priority" data-page="${esc(page.id)}">Kontroller rekkefølgen</button><p class="feedback" id="feedback-${esc(page.id)}" role="status" aria-live="polite"></p></section>`;
    }
    if (page.type === 'text') return `<form class="activity" data-text="${esc(page.id)}"><label for="text-${esc(page.id)}">${esc(page.prompt)}</label><textarea id="text-${esc(page.id)}" rows="6" maxlength="1000" placeholder="Skriv et syntetisk øvingssvar …">${esc(state.notes[page.id] || '')}</textarea><div class="form-foot"><span>Svar lagres bare lokalt i denne nettleseren.</span><button class="primary-button" type="submit">${completed(page.id) ? 'Oppdater svar' : 'Lagre svar lokalt'}</button></div><p class="feedback" id="feedback-${esc(page.id)}" role="status" aria-live="polite"></p></form>`;
    return '';
  };
  const pageView = (id) => {
    const page = pageById(id); if (!page) return home(); const category = categoryById(page.category);
    const body = page.body ? `<p class="page-body">${esc(page.body)}</p>` : '';
    const media = ['image', 'video', 'audio', 'solutionVideo'].includes(page.type) ? mediaCard(page) : '';
    const task = ['single', 'multi', 'sorting', 'priority', 'text'].includes(page.type) ? activity(page) : '';
    const next = pages[pages.findIndex((entry) => entry.id === id) + 1];
    const completion = page.criterion === 'none' ? `<button type="button" class="secondary-button" data-action="complete" data-page="${esc(page.id)}">${completed(page.id) ? 'Siden er lest ✓' : 'Marker siden som lest'}</button>` : '';
    return `<div class="crumbs">${link('home', 'Læringssti')} <span aria-hidden="true">/</span> ${link(`category/${category.id}`, esc(category.name))} <span aria-hidden="true">/</span> ${esc(page.title)}</div><article class="lesson"><p class="overline">${esc(category.name)} · ${esc(page.criterion === 'video' ? 'Fremdriftskrav: se video' : page.criterion === 'text' ? 'Fremdriftskrav: fritekstsvar' : page.criterion === 'automatic' ? 'Fremdriftskrav: automatisk oppgave' : 'Læringsside')}</p><h1>${esc(page.title)}</h1>${body}${media}${task}${page.type.startsWith('solution') ? solution(page) : ''}<div class="lesson-actions">${completion}${next ? link(`page/${next.id}`, `Neste side: ${esc(next.title)} →`, 'primary-link') : link('home', 'Tilbake til modulen →', 'primary-link')}${status(completed(page.id), 'Ikke fullført')}</div></article>`;
  };
  const teacher = () => `<section class="welcome compact"><p class="overline">Lærer-modus · forhåndsvisning</p><h1>Forhåndsvis demostien</h1><p class="intro">Denne visningen viser løsningsforslag. Ingen studentprogresjon eller forsøk registreres i lærer-modus.</p><div class="alert-note"><strong>Kun syntetiske testdata</strong><p>Demostien er laget for å prøve kategorier, medier, oppgavetyper og progresjon – ikke for undervisning.</p></div></section><div class="category-grid">${cards()}</div><section class="admin-panel"><h2>Progresjonsregler i demostien</h2><ul><li><strong>Ingen begrensning:</strong> introduksjon, bilder, lyd og løsningsside.</li><li><strong>Se video:</strong> testklippet må startes.</li><li><strong>Fritekstsvar:</strong> et svar må lagres lokalt.</li><li><strong>Automatisk oppgave:</strong> svaret må kontrolleres.</li><li>Modulen fullføres når begge kategorier er fullført; kategoriene kan tas i valgfri rekkefølge.</li></ul></section>`;
  const admin = () => `<section class="welcome compact"><p class="overline">Administrasjon · lokal demonstrasjon</p><h1>Innholdsarbeidsflate</h1><p class="intro">Prøv en forenklet arbeidsflyt for læringssti, kategorier og sider. Endringene finnes bare lokalt og kan nullstilles.</p><div class="alert-note"><strong>Ingen konto eller serverlagring</strong><p>Dette er en syntetisk adminvisning. Den simulerer publisering og innholdsredigering i nettleserminne.</p></div></section><section class="admin-panel"><div class="admin-title"><div><p class="overline">Læringssti</p><h2>${esc(state.adminTitle)}</h2></div><button class="secondary-button" type="button" data-action="toggle-publish">${state.published ? 'Avpubliser demo' : 'Publiser demo'}</button></div><p>Status: <strong>${state.published ? 'Publisert i demoen' : 'Avpublisert i demoen'}</strong></p><h3>Kategorier og sider</h3>${categories.map((category) => `<div class="admin-category"><h4>${esc(category.name)}</h4><ul>${pages.filter((page) => page.category === category.id).map((page) => `<li><span>${esc(page.title)} <small>· ${esc(page.type)} · ${esc(page.criterion)}</small></span><button type="button" class="quiet-button" data-action="preview" data-page="${esc(page.id)}">Forhåndsvis</button></li>`).join('')}</ul></div>`).join('')}<div class="admin-category"><h4>Syntetiske sider lagt til lokalt</h4>${(state.customPages || []).length ? `<ul>${state.customPages.map((page) => `<li><span>${esc(page.title)} <small>· ${esc(categoryById(page.category)?.name || page.category)}</small><br>${esc(page.body)}</span></li>`).join('')}</ul>` : '<p>Ingen egne sider ennå.</p>'}</div><form id="add-page" class="admin-form"><h3>Legg til syntetisk tekstside</h3><label for="new-page-title">Sidetittel</label><input id="new-page-title" name="title" maxlength="70" required><label for="new-page-body">Innhold</label><textarea id="new-page-body" name="body" maxlength="600" rows="3" required></textarea><label for="new-page-category">Kategori</label><select id="new-page-category" name="category">${categories.map((category) => `<option value="${category.id}">${esc(category.name)}</option>`).join('')}</select><button class="primary-button" type="submit">Legg til lokalt</button></form></section>`;
  function render() {
    const route = location.hash.replace(/^#\/?/, '');
    let content;
    if (state.role === 'admin') content = admin();
    else if (state.role === 'teacher') content = route.startsWith('page/') ? pageView(route.slice(5)) : route.startsWith('category/') ? categoryView(route.slice(9)) : teacher();
    else content = route.startsWith('page/') ? pageView(route.slice(5)) : route.startsWith('category/') ? categoryView(route.slice(9)) : home();
    app.innerHTML = shell(content);
    app.querySelectorAll('video').forEach((video) => video.addEventListener('ended', () => {
      const id = location.hash.replace(/^#\/?page\//, '');
      const page = pageById(id);
      if (page?.type === 'video' || page?.type === 'solutionVideo') markDone(id, 'Testvideoen ble sett ferdig. Fremdriften er bare lokal.');
    }));
  }
  const feedback = (id, message, kind = '') => { const el = document.getElementById(`feedback-${id}`); if (el) { el.textContent = message; el.className = `feedback ${kind}`; } };
  const values = (form) => [...form.querySelectorAll('input:checked')].map((input) => Number(input.value));
  app.addEventListener('click', async (event) => {
    const roleButton = event.target.closest('[data-role]');
    if (roleButton) { state.role = roleButton.dataset.role; save(); render(); return; }
    const control = event.target.closest('[data-action]'); if (!control) return;
    const { action, page: id } = control.dataset;
    if (action === 'reset') { if (window.confirm('Nullstille all lokal fremdrift, svar og redigering i Læringssti-demoen?')) { localStorage.removeItem(KEY); state = blankState(); location.hash = 'home'; render(); announce('Demostien er nullstilt.'); } }
    if (action === 'complete') markDone(id, 'Siden er markert som lest.');
    if (action === 'check-sort') {
      const page = pageById(id); const answers = page.statements.map((_, index) => Number(app.querySelector(`[data-sort="${id}"][data-index="${index}"]`).value));
      state.answers[id] = answers; if (state.role !== 'teacher') save();
      if (answers.every((answer, index) => answer === page.answers[index])) { markDone(id); feedback(id, `Riktig. ${page.explanation}`, 'success'); }
      else feedback(id, 'Se på forskjellen mellom det du kan observere, og det du antar om årsak eller konsekvens.', 'error');
    }
    if (action === 'move') {
      const page = pageById(id); const order = state.answers[id] || page.items.map((_, index) => index); const from = Number(control.dataset.index); const to = from + Number(control.dataset.direction);
      if (to >= 0 && to < order.length) [order[from], order[to]] = [order[to], order[from]];
      state.answers[id] = order; if (state.role !== 'teacher') save();
      render();
    }
    if (action === 'check-priority') { const page = pageById(id); const order = state.answers[id] || page.items.map((_, index) => index); if (order.join(',') === page.correctOrder.join(',')) { markDone(id); feedback(id, page.explanation, 'success'); } else feedback(id, 'Prøv å starte med dokumentasjon før du velger videre oppfølging.', 'error'); }
    if (action === 'toggle-publish') { state.published = !state.published; save(); render(); announce('Demoens publiseringsstatus ble endret lokalt.'); }
    if (action === 'preview') { state.role = 'teacher'; save(); location.hash = `page/${id}`; render(); }
  });
  app.addEventListener('change', (event) => {
    if (event.target.matches('[data-sort]')) {
      const id = event.target.dataset.sort; const page = pageById(id); const answers = page.statements.map((_, index) => { const select = app.querySelector(`[data-sort="${id}"][data-index="${index}"]`); return select.value === '' ? null : Number(select.value); }); state.answers[id] = answers; if (state.role !== 'teacher') save();
    }
  });
  app.addEventListener('submit', (event) => {
    const quiz = event.target.closest('[data-activity]');
    if (quiz) {
      event.preventDefault(); const id = quiz.dataset.activity; const page = pageById(id); const chosen = values(quiz); state.answers[id] = chosen; if (state.role !== 'teacher') save();
      const expected = Array.isArray(page.answer) ? page.answer : [page.answer];
      if (JSON.stringify([...chosen].sort()) === JSON.stringify([...expected].sort())) { markDone(id); feedback(id, `Riktig. ${page.explanation}`, 'success'); }
      else feedback(id, 'Svaret er ikke helt riktig ennå. Les oppgaven en gang til og prøv på nytt.', 'error');
      return;
    }
    const textForm = event.target.closest('[data-text]');
    if (textForm) {
      event.preventDefault(); const id = textForm.dataset.text; const value = textForm.querySelector('textarea').value.trim();
      if (value.length < 20) { feedback(id, 'Skriv minst 20 tegn for å prøve denne oppgaven.', 'error'); return; }
      state.notes[id] = value; if (state.role !== 'teacher') save();
      markDone(id); feedback(id, state.role === 'teacher' ? 'Forhåndsvisning: svaret er ikke lagret.' : 'Svaret er lagret lokalt og oppgaven er fullført.', 'success'); return;
    }
    if (event.target.id === 'add-page') {
      event.preventDefault(); const form = event.target; const title = form.elements.title.value.trim(); const body = form.elements.body.value.trim(); const category = form.elements.category.value;
      if (!title || !body) return;
      const custom = JSON.parse(localStorage.getItem(KEY) || '{}'); custom.customPages = [...(custom.customPages || []), { title, body, category }]; state.customPages = custom.customPages; save(); render(); announce('Syntetisk tekstside lagt til lokalt.');
    }
  });
  window.addEventListener('hashchange', render);
  render();
})();
