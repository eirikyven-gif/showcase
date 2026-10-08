(() => {
  const dateOutput = document.querySelector('#clock-date');
  const timeOutput = document.querySelector('#clock-time');
  const statusOutput = document.querySelector('#clock-status');
  const pauseButton = document.querySelector('#toggle-clock');
  const formatButton = document.querySelector('#toggle-format');
  let running = true;
  let twelveHour = false;
  let pausedAt = new Date();

  function render() {
    const now = running ? new Date() : pausedAt;
    dateOutput.textContent = new Intl.DateTimeFormat('nb-NO', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(now);
    timeOutput.textContent = new Intl.DateTimeFormat('nb-NO', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: twelveHour
    }).format(now);
  }

  pauseButton.addEventListener('click', () => {
    if (running) pausedAt = new Date();
    running = !running;
    pauseButton.textContent = running ? 'Sett på pause' : 'Fortsett klokken';
    statusOutput.textContent = running ? 'Klokken går' : 'Klokken er satt på pause';
    render();
  });

  formatButton.addEventListener('click', () => {
    twelveHour = !twelveHour;
    formatButton.setAttribute('aria-pressed', String(twelveHour));
    formatButton.textContent = twelveHour ? 'Bruk 24-timersformat' : 'Bruk 12-timersformat';
    render();
  });

  render();
  window.setInterval(() => { if (running) render(); }, 250);
})();
