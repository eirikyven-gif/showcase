(() => {
  const startInput = document.getElementById('start');
  const output = document.getElementById('output');
  const startNowButton = document.getElementById('start-now');
  const resetButton = document.getElementById('reset');

  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days} dager · ${hours} timer · ${minutes} minutter · ${seconds} sekunder`;
  };

  const render = () => {
    if (!startInput.value) {
      output.textContent = 'Velg starttid eller trykk «Start nå».';
      return;
    }
    const startTime = new Date(startInput.value).getTime();
    if (!Number.isFinite(startTime)) {
      output.textContent = 'Velg et gyldig starttidspunkt.';
      return;
    }
    output.textContent = `Forløpt: ${formatDuration(Math.max(0, Date.now() - startTime))}`;
  };

  startNowButton.addEventListener('click', () => {
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    startInput.value = localNow.toISOString().slice(0, 16);
    render();
  });
  resetButton.addEventListener('click', () => {
    startInput.value = '';
    render();
    startInput.focus();
  });
  startInput.addEventListener('input', render);
  window.setInterval(render, 1000);
  render();
})();
