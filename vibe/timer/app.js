(() => {
  const input = document.querySelector('#seconds');
  const display = document.querySelector('#display');
  const status = document.querySelector('#status');
  const start = document.querySelector('#start');
  const pause = document.querySelector('#pause');
  const reset = document.querySelector('#reset');
  const durationError = document.querySelector('#duration-error');
  const SAMPLE_SECONDS = 60;

  let remainingMs = SAMPLE_SECONDS * 1000;
  let endTime = 0;
  let intervalId = null;

  function configuredMs() {
    const value = Number(input.value);
    return Number.isSafeInteger(value) && value >= 1 && value <= 5999999 ? value * 1000 : null;
  }

  function validateDuration() {
    const value = configuredMs();
    const message = value === null
      ? 'Skriv inn et helt tall fra 1 til 5 999 999 sekunder.'
      : '';
    input.setCustomValidity(message);
    durationError.textContent = message;
    durationError.hidden = !message;
    return value;
  }

  function format(ms) {
    const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function render() {
    const running = intervalId !== null;
    const current = running ? Math.max(0, endTime - Date.now()) : remainingMs;
    const finished = current <= 0;
    display.textContent = finished ? 'Ferdig' : format(current);
    display.setAttribute('aria-label', finished ? 'Timer ferdig' : `Tid igjen ${format(current)}`);

    if (running && finished) {
      clearInterval(intervalId);
      intervalId = null;
      remainingMs = 0;
      status.textContent = 'Tiden er ute';
      start.textContent = 'Start på nytt';
      pause.disabled = true;
      return;
    }

    if (running) status.textContent = 'Timeren kjører';
    else if (finished) status.textContent = 'Tiden er ute';
    else if (remainingMs < (configuredMs() ?? 0)) status.textContent = 'Pauset';
    else status.textContent = 'Klar til å starte';
    start.textContent = remainingMs < (configuredMs() ?? 0) ? 'Fortsett' : 'Start';
    pause.disabled = !running;
  }

  start.addEventListener('click', () => {
    if (intervalId !== null) return;
    const durationMs = validateDuration();
    if (durationMs === null) {
      input.focus();
      return;
    }
    if (remainingMs <= 0) remainingMs = configuredMs() ?? SAMPLE_SECONDS * 1000;
    endTime = Date.now() + remainingMs;
    intervalId = window.setInterval(render, 200);
    render();
  });

  pause.addEventListener('click', () => {
    if (intervalId === null) return;
    remainingMs = Math.max(0, endTime - Date.now());
    clearInterval(intervalId);
    intervalId = null;
    render();
  });

  reset.addEventListener('click', () => {
    if (intervalId !== null) clearInterval(intervalId);
    intervalId = null;
    input.value = String(SAMPLE_SECONDS);
    input.setCustomValidity('');
    durationError.textContent = '';
    durationError.hidden = true;
    remainingMs = SAMPLE_SECONDS * 1000;
    start.textContent = 'Start';
    render();
  });

  input.addEventListener('input', () => {
    if (intervalId !== null) return;
    const value = validateDuration();
    if (value !== null) remainingMs = value;
    render();
  });

  render();
})();
