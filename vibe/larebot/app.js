(() => {
  const STORAGE_KEY = 'vibe.larebot.demo.v1';
  const initial = {
    title: 'Vannets kretsløp – eksempeltekst',
    text: 'Vannets kretsløp er den stadige bevegelsen av vann mellom hav, land og luft. Solvarme får vann fra hav, innsjøer og bakken til å fordampe. Vanndampen stiger og avkjøles, og små dråper eller iskrystaller danner skyer. Når dråpene blir store nok, faller vannet som nedbør. Vannet renner videre til bekker, innsjøer og hav, eller trekker ned i bakken. Solvarme driver fordampingen, mens tyngdekraften trekker vannet nedover.',
    bot: 'Vannbot – eksempel',
    provider: 'local',
    model: 'lokal-demo'
  };
  const examples = [
    ['fordamp', 'Noe av vannet får nok energi fra sola til å bli vanndamp og stige opp i lufta. Denne delen av kretsløpet kalles fordamping.', 'Avsnitt 1'],
    ['sky', 'Høyt i lufta blir vanndampen avkjølt. Da samler små vanndråper eller iskrystaller seg, og vi kan se dem som skyer.', 'Avsnitt 2'],
    ['nedbør', 'Når dråpene eller iskrystallene i skyene blir store nok, faller de som nedbør, for eksempel regn eller snø.', 'Avsnitt 3'],
    ['bakken', 'Vannet faller til bakken som nedbør. Det kan renne til bekker, innsjøer og hav eller trekke ned i bakken.', 'Avsnitt 3'],
    ['kretsløp', 'Vann fordamper, avkjøles og danner skyer, før det faller som nedbør og beveger seg tilbake mot hav og innsjøer. Slik fortsetter vannets kretsløp.', 'Avsnitt 1–3']
  ];
  const $ = (selector) => document.querySelector(selector);
  let config = { ...initial };

  function loadConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === 'object') {
        for (const key of Object.keys(initial)) {
          if (typeof saved[key] === 'string' && saved[key].length <= (key === 'text' ? 5000 : 100)) config[key] = saved[key];
        }
      }
    } catch {
      $('#storage-state').textContent = 'Nettleseren kunne ikke lese lagret oppsett. Standardeksempelet vises.';
    }
    renderAdmin();
  }

  function renderAdmin() {
    $('#resource-title').value = config.title;
    $('#resource-text').value = config.text;
    $('#bot-title').value = config.bot;
    $('#provider').value = ['local', 'openai', 'gemini'].includes(config.provider) ? config.provider : 'local';
    $('#model').value = config.model;
    $('#saved-resource').textContent = config.title + ': ' + config.text;
    $('#storage-state').textContent = 'Kun denne eksempelkonfigurasjonen ligger i localStorage på enheten. Elevspørsmål og svar blir ikke lagret.';
    updateBot();
  }

  function updateBot() {
    $('#bot-name').textContent = config.bot;
    $('#topic-intro').textContent = config.text;
  }

  function showReply(question) {
    const normalized = question.toLocaleLowerCase('nb');
    const match = examples.find(([keyword]) => normalized.includes(keyword));
    const answer = match
      ? match[1]
      : 'Jeg finner ikke et kort, ferdig eksempel på akkurat det i denne syntetiske ressursen. Prøv å spørre om fordamping, skyer eller nedbør.';
    const article = document.createElement('article');
    article.className = 'reply';
    const q = document.createElement('p');
    q.className = 'reply-question';
    q.textContent = question;
    const a = document.createElement('p');
    a.textContent = answer;
    const source = document.createElement('p');
    source.className = 'sources';
    source.textContent = match ? 'Kilde: ' + config.title + ' · ' + match[2] : 'Kilde: ingen treff i eksempelressursen';
    article.append(q, a, source);
    $('#replies').append(article);
    article.scrollIntoView?.({ block: 'nearest' });
  }

  function ask(question) {
    if (!question.trim()) return;
    showReply(question.trim());
    $('#question').value = '';
    $('#chat-message').textContent = 'Lokal eksempelrespons. Ingen melding er sendt eller lagret.';
    $('#question').focus();
  }

  for (const button of document.querySelectorAll('[data-mode]')) {
    button.addEventListener('click', () => {
      const isAdmin = button.dataset.mode === 'admin';
      $('#learner').hidden = isAdmin;
      $('#admin').hidden = !isAdmin;
      for (const choice of document.querySelectorAll('[data-mode]')) {
        const active = choice === button;
        choice.classList.toggle('active', active);
        choice.setAttribute('aria-pressed', String(active));
      }
    });
  }

  const subject = $('#subject');
  const topic = $('#topic');
  subject.add(new Option('Naturfag', 'naturfag'));
  subject.addEventListener('change', () => {
    topic.replaceChildren(new Option('Velg tema', ''));
    if (subject.value) topic.add(new Option('Vannets kretsløp', 'vannets-kretslop'));
    topic.disabled = !subject.value;
    $('#conversation').hidden = true;
    $('#selection-message').textContent = '';
    $('#replies').replaceChildren();
  });
  topic.addEventListener('change', () => {
    const active = topic.value === 'vannets-kretslop';
    $('#conversation').hidden = !active;
    $('#selection-message').textContent = active ? '' : 'Det finnes ingen aktiv eksempelbot for dette valget.';
    if (active) updateBot();
  });
  document.querySelectorAll('[data-starter]').forEach((button) => {
    button.addEventListener('click', () => ask(button.dataset.starter));
  });
  const questionForm = document.querySelector('#question-form');
  questionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    ask($('#question').value);
  });
  const contentForm = document.querySelector('#content-form');
  contentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    config = {
      title: String(form.get('title')).trim(),
      text: String(form.get('text')).trim(),
      bot: String(form.get('bot')).trim(),
      provider: String(form.get('provider')),
      model: String(form.get('model')).trim()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      $('#admin-message').textContent = 'Eksempeloppsettet er lagret lokalt.';
    } catch {
      $('#admin-message').textContent = 'Nettleseren kunne ikke lagre. Oppsettet brukes bare til siden lukkes.';
    }
    renderAdmin();
  });
  $('#reset-demo').addEventListener('click', () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* storage may be unavailable; use defaults for this page */ }
    config = { ...initial };
    renderAdmin();
    $('#admin-message').textContent = 'Demoinnstillingene er nullstilt.';
  });

  loadConfig();
})();
