const lessons = [
  {
    title: 'Finn et lite behov',
    summary: 'En student vil finne et rolig sted å ta en kort pause på campus. Eksemplet bruker ingen faktiske steder eller personer.',
    points: [
      'Vis tre oppdiktede pauseområder.',
      'Vis om hvert område er stille eller sosialt.',
      'La besøkende velge en type pause.'
    ],
    hint: 'Start med hvem som har et behov og hva de vil få gjort.'
  },
  {
    title: 'Gjør behovet testbart',
    summary: 'Vi avgrenser første versjon til et statisk kort med tre oppdiktede steder. Ingen karttjeneste eller tilgjengelighetsdata brukes.',
    points: [
      'Når jeg velger «Stille», vises bare de to oppdiktede stille stedene.',
      'Hvert sted viser et navn, en type og en kort beskrivelse.',
      'En «Vis alle»-handling viser alle tre stedene igjen.'
    ],
    hint: 'Et godt krav sier hva brukeren gjør, hva løsningen viser og hvordan du kan kontrollere det.'
  },
  {
    title: 'Skriv en enkel test',
    summary: 'Testplanen bruker bare de oppdiktede eksempelkortene og beskriver et forventet resultat.',
    points: [
      'Åpne siden: tre fiktive stedskort vises.',
      'Velg «Stille»: nøyaktig to kort vises.',
      'Velg «Vis alle»: alle tre kortene vises på nytt.'
    ],
    hint: 'Test ved å følge handlingen og sammenligne resultatet med det du forventet.'
  }
];

const buttons = [...document.querySelectorAll('[data-step]')];
const title = document.querySelector('#lesson-heading');
const summary = document.querySelector('#step-summary');
const points = document.querySelector('#example-points');
const hint = document.querySelector('#check-hint');
const checks = [...document.querySelectorAll('.check-list input')];
const status = document.querySelector('#check-status');

function selectStep(index) {
  const lesson = lessons[index];
  title.textContent = lesson.title;
  summary.textContent = lesson.summary;
  hint.textContent = lesson.hint;
  points.replaceChildren(...lesson.points.map((point) => {
    const item = document.createElement('li');
    item.textContent = point;
    return item;
  }));
  buttons.forEach((button, buttonIndex) => {
    if (buttonIndex === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  checks.forEach((check) => { check.checked = false; });
  status.textContent = `Viser steg ${index + 1} av ${lessons.length}: ${lesson.title}. Avkryssing er nullstilt.`;
}

buttons.forEach((button) => {
  button.addEventListener('click', () => selectStep(Number(button.dataset.step)));
});

document.querySelector('#reset-checks').addEventListener('click', () => {
  checks.forEach((check) => { check.checked = false; });
  status.textContent = 'Avkryssing er nullstilt.';
});
