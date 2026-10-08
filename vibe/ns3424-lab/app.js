const scenarios = [
  {
    title: 'Løs overflate ved inngang',
    detail: 'På et felles inngangsparti er en liten flik av overflatebelegget løs. Underlaget virker fast, og det er ingen synlig fukt.',
    options: ['Følg med ved neste runde', 'Undersøk og planlegg enkel utbedring', 'Sperr av og be om rask faglig vurdering'],
    answer: 1,
    explanation: 'En avgrenset overflateskade uten andre tegn kan undersøkes og følges opp med planlagt vedlikehold.'
  },
  {
    title: 'Vannmerke ved vindu',
    detail: 'Et nytt vannmerke ses under et vindu etter regn. Kilden er ukjent, og området er ikke undersøkt nærmere.',
    options: ['Registrer og undersøk årsaken snart', 'Ignorer til neste år', 'Konkluder med at veggen må skiftes'],
    answer: 0,
    explanation: 'Et nytt tegn på vanninntrenging bør dokumenteres og undersøkes før man trekker konklusjoner om omfang eller tiltak.'
  },
  {
    title: 'Skadet trinn i trapp',
    detail: 'Et trinn i en mye brukt felles trapp beveger seg når det belastes. Flere personer bruker trappen daglig.',
    options: ['Noter det til ordinært vedlikehold', 'Begrens bruk og få forholdet vurdert raskt', 'Mal over skaden'],
    answer: 1,
    explanation: 'Et ustabilt trinn kan gi fallfare. Begrens eksponeringen og be om rask vurdering fra ansvarlig fagperson.'
  }
];

const cases = document.querySelector('#cases');
const progress = document.querySelector('#progress');
const selected = new Map();

function render() {
  cases.replaceChildren();
  scenarios.forEach((scenario, index) => {
    const article = document.createElement('article');
    article.className = 'case';
    const heading = document.createElement('h3');
    heading.textContent = `${index + 1}. ${scenario.title}`;
    const description = document.createElement('p');
    description.textContent = scenario.detail;
    const label = document.createElement('p');
    label.className = 'muted';
    label.textContent = 'Hva bør være neste steg?';
    const choices = document.createElement('div');
    choices.className = 'choices';
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', `Neste steg for: ${scenario.title}`);
    scenario.options.forEach((option, optionIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button secondary choice';
      button.textContent = option;
      button.setAttribute('aria-pressed', selected.get(index) === optionIndex ? 'true' : 'false');
      button.addEventListener('click', () => {
        selected.set(index, optionIndex);
        render();
      });
      choices.append(button);
    });
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.setAttribute('aria-live', 'polite');
    if (selected.has(index)) {
      feedback.textContent = `${selected.get(index) === scenario.answer ? 'God vurdering.' : 'Tenk gjennom risiko og usikkerhet.'} ${scenario.explanation}`;
    }
    article.append(heading, description, label, choices, feedback);
    cases.append(article);
  });
  progress.textContent = `${selected.size} av ${scenarios.length} vurdert`;
}

document.querySelector('#reset').addEventListener('click', () => {
  selected.clear();
  render();
});

render();
