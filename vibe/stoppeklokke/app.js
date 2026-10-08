const display = document.getElementById('display');
const startStopButton = document.getElementById('startStop');
const lapButton = document.getElementById('lap');
const resetButton = document.getElementById('reset');
const laps = document.getElementById('laps');
const lapCount = document.getElementById('lap-count');
const status = document.getElementById('status');

let startedAt = 0;
let elapsedMs = 0;
let intervalId = null;
let previousLapMs = 0;

const formatMs = (ms) => {
  const centiseconds = Math.floor(ms / 10) % 100;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
};

const currentElapsed = () => elapsedMs + (intervalId ? performance.now() - startedAt : 0);
const render = () => { display.textContent = formatMs(currentElapsed()); };

const start = () => {
  if (intervalId) return;
  startedAt = performance.now();
  intervalId = window.setInterval(render, 37);
  startStopButton.textContent = 'Pause';
  lapButton.disabled = false;
  resetButton.disabled = false;
  status.textContent = 'Stoppeklokken går.';
};

const pause = () => {
  if (!intervalId) return;
  elapsedMs = currentElapsed();
  window.clearInterval(intervalId);
  intervalId = null;
  startStopButton.textContent = 'Fortsett';
  status.textContent = 'Pauset. Du kan fortsette når du vil.';
  render();
};

startStopButton.addEventListener('click', () => (intervalId ? pause() : start()));

lapButton.addEventListener('click', () => {
  const elapsed = currentElapsed();
  const lapTime = elapsed - previousLapMs;
  previousLapMs = elapsed;
  const emptyMessage = laps.querySelector('.empty-laps');
  if (emptyMessage) emptyMessage.remove();
  const item = document.createElement('li');
  const number = document.createElement('span');
  number.className = 'lap-number';
  number.textContent = `Runde ${laps.children.length + 1}`;
  const time = document.createElement('span');
  time.className = 'lap-time';
  time.textContent = `${formatMs(elapsed)}  ·  +${formatMs(lapTime)}`;
  item.append(number, time);
  laps.prepend(item);
  const count = laps.children.length;
  lapCount.textContent = `${count} ${count === 1 ? 'runde' : 'runder'}`;
  status.textContent = `Runde ${count} registrert.`;
});

resetButton.addEventListener('click', () => {
  window.clearInterval(intervalId);
  intervalId = null;
  startedAt = 0;
  elapsedMs = 0;
  previousLapMs = 0;
  laps.replaceChildren();
  const emptyMessage = document.createElement('li');
  emptyMessage.className = 'empty-laps';
  emptyMessage.textContent = 'Rundetidene dine vises her.';
  laps.append(emptyMessage);
  lapCount.textContent = '0 runder';
  startStopButton.textContent = 'Start';
  lapButton.disabled = true;
  resetButton.disabled = true;
  status.textContent = 'Stoppeklokken er nullstilt.';
  render();
});

render();
