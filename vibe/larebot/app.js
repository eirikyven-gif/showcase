const examples = {
  'Hva skjer når sola varmer opp vann?': 'Noe av vannet får nok energi til å bli vanndamp og stige opp i lufta. Denne delen av kretsløpet kalles fordamping.',
  'Hvordan blir skyer dannet?': 'Høyt i lufta blir vanndampen avkjølt. Da samler små vanndråper eller iskrystaller seg, og vi kan se dem som skyer.',
  'Hvordan kommer vann tilbake til bakken?': 'Når dråpene eller iskrystallene i skyene blir store nok, faller de som nedbør, for eksempel regn eller snø.'
};
const answer = document.querySelector('#answer');
const selectedQuestion = document.querySelector('#selected-question');
const response = document.querySelector('#response');
const reset = document.querySelector('#reset');

for (const button of document.querySelectorAll('[data-question]')) {
  button.addEventListener('click', () => {
    const question = button.dataset.question;
    selectedQuestion.textContent = question;
    response.textContent = examples[question];
    answer.hidden = false;
    reset.hidden = false;
    reset.focus();
  });
}

reset.addEventListener('click', () => {
  answer.hidden = true;
  reset.hidden = true;
  for (const button of document.querySelectorAll('[data-question]')) button.disabled = false;
  document.querySelector('[data-question]').focus();
});
