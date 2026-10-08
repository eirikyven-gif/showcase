const matrix = document.querySelector('#matrix');
const status = document.querySelector('#matrix-status');
const reset = document.querySelector('#reset-matrix');
const initial = [...matrix.querySelectorAll('.check')].map((button) => button.getAttribute('aria-pressed'));

function updateStatus(message) {
  const total = matrix.querySelectorAll('.check[aria-pressed="true"]').length;
  status.textContent = message || `${total} koblinger markert. Endringer lagres ikke.`;
}

matrix.addEventListener('click', (event) => {
  const button = event.target.closest('.check');
  if (!button) return;
  const selected = button.getAttribute('aria-pressed') === 'true';
  button.setAttribute('aria-pressed', String(!selected));
  button.textContent = selected ? '–' : '✓';
  updateStatus(`Kobling ${selected ? 'fjernet' : 'lagt til'}. Endringer lagres ikke.`);
});

reset.addEventListener('click', () => {
  matrix.querySelectorAll('.check').forEach((button, index) => {
    const selected = initial[index] === 'true';
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = selected ? '✓' : '–';
  });
  updateStatus('Eksempelet er nullstilt. Endringer lagres ikke.');
});

updateStatus();
