const form = document.getElementById('countdown-form');
const titleInput = document.getElementById('event-title');
const dateInput = document.getElementById('event-date');
const timeInput = document.getElementById('event-time');
const canvas = document.getElementById('countdown-canvas');
const description = document.getElementById('countdown-description');
const resetButton = document.getElementById('reset-preview');
const initialValues = { title: titleInput.value, date: dateInput.value, time: timeInput.value };
const context = canvas.getContext('2d');

function drawPreview() {
  const title = titleInput.value;
  const target = new Date(`${dateInput.value}T${timeInput.value || '12:00'}:00`);
  const validTarget = !Number.isNaN(target.getTime());
  const secondsLeft = validTarget ? Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000)) : 0;
  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#fff7f4'; context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#9e2638'; context.fillRect(0, 0, 12, canvas.height);
  context.fillStyle = '#61202b'; context.font = '700 30px system-ui, sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle';
  context.fillText(title, canvas.width / 2, 58, canvas.width - 56);
  context.fillStyle = '#302124'; context.font = '700 54px system-ui, sans-serif';
  context.fillText(validTarget ? `${days} dager  ·  ${hours} t  ·  ${minutes} min` : 'Velg en dato', canvas.width / 2, 139, canvas.width - 48);
  context.fillStyle = '#72565a'; context.font = '500 18px system-ui, sans-serif'; context.fillText('ET EKSEMPEL · IKKE SENDT', canvas.width / 2, 190, canvas.width - 40);

  const summary = validTarget ? `${title}. ${days} dager, ${hours} timer og ${minutes} minutter igjen. Syntetisk lokal forhåndsvisning.` : 'Velg en gyldig dato for å oppdatere forhåndsvisningen.';
  canvas.setAttribute('aria-label', summary);
  description.textContent = summary;
}

form.addEventListener('submit', (event) => event.preventDefault());
form.addEventListener('input', drawPreview);
form.addEventListener('change', drawPreview);
resetButton.addEventListener('click', () => {
  titleInput.selectedIndex = 0; dateInput.value = initialValues.date; timeInput.value = initialValues.time;
  drawPreview(); titleInput.focus();
});

drawPreview();
