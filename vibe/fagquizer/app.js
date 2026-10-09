const answers = document.querySelectorAll('input[name="answer"]');
const checkButton = document.querySelector('#check');
const restartButton = document.querySelector('#restart');
const feedback = document.querySelector('#feedback');

checkButton.addEventListener('click', () => {
  const choice = document.querySelector('input[name="answer"]:checked');
  feedback.hidden = false;
  if (!choice) {
    feedback.className = 'feedback neutral';
    feedback.textContent = 'Velg et svar først.';
    return;
  }
  const correct = choice.value === 'stop';
  feedback.className = `feedback ${correct ? 'success' : 'try-again'}`;
  feedback.textContent = correct
    ? 'Riktig etter den oppdiktede regelen: ▲ betyr «stopp».'
    : 'Ikke helt. Se på regelen i spørsmålet og prøv igjen.';
});

restartButton.addEventListener('click', () => {
  answers.forEach((answer) => { answer.checked = false; });
  feedback.hidden = true;
  feedback.textContent = '';
});
