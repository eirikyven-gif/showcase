const selects = [...document.querySelectorAll('.item select')];
const feedback = document.querySelector('#feedback');

document.querySelector('#check').addEventListener('click', () => {
  const answered = selects.filter((select) => select.value).length;
  const correct = selects.filter((select) => select.value === select.dataset.answer).length;
  if (!answered) {
    feedback.textContent = 'Velg en kategori for å se tilbakemelding.';
  } else if (answered < selects.length) {
    feedback.textContent = `Du har sortert ${answered} av ${selects.length}. En synlig hendelse kan beskrives direkte; en årsak krever mer informasjon.`;
  } else {
    feedback.textContent = `${correct} av ${selects.length} svar passer med eksempelets skille. En antakelse kan være en nyttig hypotese, men bør ikke forveksles med en observasjon.`;
  }
});

document.querySelector('#reset').addEventListener('click', () => {
  selects.forEach((select) => { select.value = ''; });
  feedback.textContent = 'Valgene er nullstilt.';
});
