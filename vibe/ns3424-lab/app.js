const checkButton = document.querySelector('#check');
const resetButton = document.querySelector('#reset');
const feedback = document.querySelector('#feedback');

checkButton.addEventListener('click', () => {
  const answer = document.querySelector('input[name="answer"]:checked');
  feedback.className = 'feedback';
  if (!answer) {
    feedback.textContent = 'Velg et alternativ først.';
    feedback.classList.add('try');
    feedback.focus();
    return;
  }
  if (answer.value === 'a') {
    feedback.textContent = 'Godt valg for dette oppdiktede eksempelet: noter observasjonene, undersøk mulig årsak og følg med. En faktisk vurdering krever kvalifisert fagperson og gjeldende kilder.';
    feedback.classList.add('good');
  } else {
    feedback.textContent = 'Prøv igjen: skill mellom det du ser og det du ennå ikke vet. Velg et steg som innhenter informasjon før du trekker en konklusjon.';
    feedback.classList.add('try');
  }
  feedback.focus();
});

resetButton.addEventListener('click', () => {
  document.querySelectorAll('input[name="answer"]').forEach((input) => { input.checked = false; });
  feedback.textContent = '';
  feedback.className = 'feedback';
  document.querySelector('input[name="answer"]').focus();
});
