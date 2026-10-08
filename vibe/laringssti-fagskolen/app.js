const form = document.getElementById('lesson-check');
const feedback = document.getElementById('feedback');
const reset = document.getElementById('reset');

form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('submit', () => {
  const answer = new FormData(form).get('answer');

  if (!answer) {
    feedback.textContent = 'Velg ett av svarene først.';
    feedback.dataset.state = 'error';
    return;
  }

  if (answer === 'b') {
    feedback.textContent = 'Riktig! Målet beskriver en handling du kan vise og forklare.';
    feedback.dataset.state = 'success';
  } else {
    feedback.textContent = 'Prøv igjen. Se etter et mål med en konkret handling.';
    feedback.dataset.state = 'error';
  }
});

reset.addEventListener('click', () => {
  form.reset();
  feedback.textContent = 'Velg et svar for å prøve.';
  delete feedback.dataset.state;
});
