(() => {
  const form = document.querySelector('#ticker-form');
  const textInput = document.querySelector('#ticker-text');
  const speedInput = document.querySelector('#ticker-speed');
  const speedValue = document.querySelector('#speed-value');
  const card = document.querySelector('.ticker-card');
  const line = document.querySelector('#ticker-line');
  const toggle = document.querySelector('#toggle-motion');
  const status = document.querySelector('#ticker-status');
  const defaultText = 'Hei! Dette er en liten ticker-demo.';

  function updateText() {
    line.textContent = textInput.value.trim() || defaultText;
  }
  function updateSpeed() {
    const seconds = Number(speedInput.value);
    line.style.setProperty('--ticker-duration', `${seconds}s`);
    speedValue.textContent = String(seconds);
  }

  form.addEventListener('submit', (event) => event.preventDefault());
  textInput.addEventListener('input', updateText);
  speedInput.addEventListener('input', updateSpeed);
  toggle.addEventListener('click', () => {
    const paused = card.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Fortsett ticker' : 'Pause ticker';
    status.textContent = paused ? 'Ticker er satt på pause.' : 'Ticker kjører.';
  });
  updateText();
  updateSpeed();
})();
