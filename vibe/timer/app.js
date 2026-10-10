const secondsInput = document.getElementById('secs');
const output = document.getElementById('output');
const statusEl = document.getElementById('status');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');

let remainingMs = 60000;
let endTime = 0;
let intervalId = null;

const formatMs = (ms) => {
  const safeMs = Math.max(0, ms);
  const minutes = Math.floor(safeMs / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const render = () => {
  const current = intervalId ? Math.max(0, endTime - Date.now()) : remainingMs;
  output.textContent = current > 0 ? formatMs(current) : 'Ferdig';

  if (intervalId && current <= 0) {
    clearInterval(intervalId);
    intervalId = null;
    remainingMs = 0;
    statusEl.textContent = 'Ferdig';
    startButton.textContent = 'Start';
    return;
  }

  statusEl.textContent = intervalId ? 'Kjører' : (remainingMs > 0 ? 'Pauset/klar' : 'Ferdig');
};

const getConfiguredMs = () => Math.max(1000, Number(secondsInput.value || 60) * 1000);

startButton.addEventListener('click', () => {
  if (intervalId) return;
  if (remainingMs <= 0) remainingMs = getConfiguredMs();
  endTime = Date.now() + remainingMs;
  intervalId = setInterval(render, 200);
  startButton.textContent = 'Kjører';
  render();
});

pauseButton.addEventListener('click', () => {
  if (!intervalId) return;
  remainingMs = Math.max(0, endTime - Date.now());
  clearInterval(intervalId);
  intervalId = null;
  startButton.textContent = 'Fortsett';
  render();
});

resetButton.addEventListener('click', () => {
  clearInterval(intervalId);
  intervalId = null;
  remainingMs = getConfiguredMs();
  startButton.textContent = 'Start';
  render();
});

secondsInput.addEventListener('input', () => {
  if (intervalId) return;
  remainingMs = getConfiguredMs();
  render();
});

render();
