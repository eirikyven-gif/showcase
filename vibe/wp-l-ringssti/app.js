(() => {
  const form = document.querySelector('#quiz-form');
  const feedback = document.querySelector('#feedback');
  const reset = document.querySelector('#reset');
  if (!form || !feedback || !reset) return;

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('submit', () => {
    const answer = new FormData(form).get('answer');
    if (!answer) {
      feedback.textContent = 'Velg et svar før du sjekker.';
      feedback.dataset.state = 'incorrect';
      return;
    }
    if (answer === 'b') {
      feedback.textContent = 'Riktig. Fire urter bruker 8 ruter, og to store blomster bruker 6. Til sammen blir det 14 ruter, altså mer enn rammen på 12.';
      feedback.dataset.state = 'correct';
    } else {
      feedback.textContent = 'Prøv igjen. Regn ut plassen for hver plantetype og summer før du tegner.';
      feedback.dataset.state = 'incorrect';
    }
  });

  reset.addEventListener('click', () => {
    form.reset();
    feedback.textContent = 'Velg et svar når du er klar.';
    delete feedback.dataset.state;
    form.querySelector('input').focus();
  });
})();
