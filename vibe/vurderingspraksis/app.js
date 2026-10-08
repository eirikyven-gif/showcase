const phases = [
  {
    id: 'forbered', kicker: 'Før aktiviteten', title: 'Gjør forventningene synlige',
    copy: 'Studenten får vite hva en trygg overlevering innebærer. Oppgaven ber både om handling og en kort begrunnelse, slik at vurderingen kan bygge på mer enn sluttresultatet.',
    questions: ['Hvilke deler av målet kan vi faktisk observere i denne oppgaven?', 'Hva bør studenten få vite på forhånd?'],
  },
  {
    id: 'bevis', kicker: 'Mens studenten arbeider', title: 'Samle relevante observasjoner',
    copy: 'Se etter om arbeidsområdet blir kontrollert, om utstyret håndteres forsvarlig, og om studenten skiller mellom det som er undersøkt og det som må meldes videre.',
    questions: ['Hvilken observasjon viser trygg praksis?', 'Hva kan en kort forklaring avdekke som handlingen alene ikke viser?'],
  },
  {
    id: 'drom', kicker: 'Etter aktiviteten', title: 'Sammenlign spor med kriterier',
    copy: 'Faglærerne legger fram konkrete observasjoner og undersøker om de tolker kriteriene likt. Hvis grunnlaget er tynt, beskriver de hva som mangler før de trekker en konklusjon.',
    questions: ['Hvilke observasjoner støtter vurderingen?', 'Hvor kan to faglærere komme til ulik konklusjon, og hvorfor?'],
  },
  {
    id: 'oppfolging', kicker: 'Neste læringssteg', title: 'Gjør tilbakemeldingen brukbar',
    copy: 'En nyttig tilbakemelding peker på et konkret spor fra arbeidet, forklarer hva det viser i lys av målet, og foreslår én handling studenten kan prøve neste gang.',
    questions: ['Hva bør studenten fortsette med?', 'Hvilket avgrenset neste steg kan gjøre læringen tydeligere?'],
  },
];

const tabs = [...document.querySelectorAll('[role="tab"]')];
const panel = document.querySelector('#phase-panel');
const previous = document.querySelector('#previous-phase');
const next = document.querySelector('#next-phase');
let current = 0;

function showPhase(index, moveFocus = false) {
  current = Math.max(0, Math.min(phases.length - 1, index));
  const phase = phases[current];
  tabs.forEach((tab, tabIndex) => {
    const active = tabIndex === current;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tabs[current].id);
  document.querySelector('#phase-kicker').textContent = phase.kicker;
  document.querySelector('#phase-title').textContent = phase.title;
  document.querySelector('#phase-copy').textContent = phase.copy;
  const list = document.querySelector('#phase-questions');
  list.replaceChildren(...phase.questions.map((question) => {
    const item = document.createElement('li');
    item.textContent = question;
    return item;
  }));
  document.querySelector('#phase-count').textContent = `Stopp ${current + 1} av ${phases.length}`;
  previous.disabled = current === 0;
  next.disabled = current === phases.length - 1;
  if (moveFocus) tabs[current].focus();
}

tabs.forEach((tab, index) => tab.addEventListener('click', () => showPhase(index)));
document.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
  let target = current;
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (current + 1) % phases.length;
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (current - 1 + phases.length) % phases.length;
  else if (event.key === 'Home') target = 0;
  else if (event.key === 'End') target = phases.length - 1;
  else return;
  event.preventDefault();
  showPhase(target, true);
});
previous.addEventListener('click', () => showPhase(current - 1));
next.addEventListener('click', () => showPhase(current + 1));
