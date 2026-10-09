const modules = [
  {
    title: 'Start med det du har',
    summary: 'Se etter en liten vane du allerede kan påvirke.',
    steps: [
      { title: 'Velg ett lite grep', text: 'En endring er lettere å prøve når den passer inn i noe du allerede gjør. Tenk på et fiktivt eksempel: ta med en kopp du kan bruke flere ganger.' },
      { title: 'Sjekk forståelsen', text: 'Hva gjør et lite, realistisk grep lettere å holde på med?', options: ['Det passer inn i en eksisterende vane', 'Det krever at alle gjør det samme'], answer: 0 }
    ]
  },
  {
    title: 'Prøv og reflekter',
    summary: 'Lag en enkel plan og vurder hva som fungerte.',
    steps: [
      { title: 'Lag en plan', text: 'Velg når du vil prøve grepet, og hva som kan hjelpe deg å huske det. I denne demoen blir svaret ikke lagret.' },
      { title: 'Refleksjon', text: 'Etterpå kan du spørre deg selv: Hva var enkelt? Hva vil jeg justere neste gang?' }
    ]
  }
];

const overview = document.querySelector('#overview');
const player = document.querySelector('#player');
const completed = new Set();
let activeModule = null;
let activeStep = 0;
let answered = false;

function renderOverview() {
  overview.replaceChildren();
  modules.forEach((module, index) => {
    const card = document.createElement('article');
    card.className = 'module-card';
    const copy = document.createElement('div');
    const label = document.createElement('p');
    label.className = 'card-kicker';
    label.textContent = `Modul ${index + 1}`;
    const heading = document.createElement('h3');
    heading.textContent = module.title;
    const summary = document.createElement('p');
    summary.textContent = module.summary;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = completed.has(index) ? 'Åpne igjen' : 'Start modul';
    button.setAttribute('aria-label', `${completed.has(index) ? 'Åpne igjen' : 'Start'}: ${module.title}`);
    button.addEventListener('click', () => openModule(index));
    copy.append(label, heading, summary);
    card.append(copy, button);
    if (completed.has(index)) {
      const status = document.createElement('span');
      status.className = 'complete-label';
      status.textContent = 'Fullført i denne økten';
      card.append(status);
    }
    overview.append(card);
  });
}

function openModule(index) {
  activeModule = index;
  activeStep = 0;
  answered = false;
  overview.hidden = true;
  player.hidden = false;
  renderStep();
}

function renderStep(message = '') {
  const module = modules[activeModule];
  const step = module.steps[activeStep];
  player.replaceChildren();
  const kicker = document.createElement('p');
  kicker.className = 'card-kicker';
  kicker.textContent = `${module.title} · steg ${activeStep + 1} av ${module.steps.length}`;
  const heading = document.createElement('h2');
  heading.textContent = step.title;
  const copy = document.createElement('p');
  copy.textContent = step.text;
  player.append(kicker, heading, copy);
  let feedback = null;

  if (step.options) {
    const group = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = 'Velg ett svar';
    group.append(legend);
    step.options.forEach((option, index) => {
      const label = document.createElement('label');
      label.className = 'answer-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'demo-answer';
      input.value = String(index);
      input.disabled = answered;
      label.append(input, document.createTextNode(option));
      group.append(label);
    });
    player.append(group);
    if (!answered) {
      const check = document.createElement('button');
      check.type = 'button';
      check.textContent = 'Sjekk svar';
      check.addEventListener('click', () => {
        const selected = player.querySelector('input[name="demo-answer"]:checked');
        if (!selected) {
          renderStep('Velg et svar før du fortsetter.');
          return;
        }
        answered = Number(selected.value) === step.answer;
        renderStep(answered ? 'Riktig! Du kan gå videre.' : 'Prøv igjen. Velg svaret som beskriver et realistisk lite grep.');
      });
      player.append(check);
    }
  }
  if (message) {
    feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('tabindex', '-1');
    feedback.textContent = message;
    player.append(feedback);
  }

  const actions = document.createElement('div');
  actions.className = 'player-actions';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'secondary-button';
  back.textContent = 'Til moduloversikten';
  back.addEventListener('click', () => {
    player.hidden = true;
    overview.hidden = false;
    activeModule = null;
    renderOverview();
    overview.querySelector('button')?.focus();
  });
  actions.append(back);
  if (activeStep < module.steps.length - 1) {
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Neste steg';
    next.disabled = Boolean(step.options && !answered);
    next.addEventListener('click', () => { activeStep += 1; answered = false; renderStep(); });
    actions.append(next);
  } else {
    const finish = document.createElement('button');
    finish.type = 'button';
    finish.textContent = 'Fullfør modul';
    finish.addEventListener('click', () => {
      const completedIndex = activeModule;
      completed.add(completedIndex);
      player.hidden = true;
      overview.hidden = false;
      activeModule = null;
      renderOverview();
      overview.querySelectorAll('button')[completedIndex]?.focus();
    });
    actions.append(finish);
  }
  player.append(actions);
  feedback?.focus();
}

renderOverview();
