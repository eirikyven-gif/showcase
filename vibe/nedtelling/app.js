(() => {
  const form = document.querySelector('#countdown-form');
  const titleInput = document.querySelector('#title');
  const dateInput = document.querySelector('#date');
  const timeInput = document.querySelector('#time');
  const accentInput = document.querySelector('#accent');
  const card = document.querySelector('#countdown-card');
  const previewTitle = document.querySelector('#preview-title');
  const previewDate = document.querySelector('#preview-date');
  const status = document.querySelector('#status');
  const units = ['days', 'hours', 'minutes', 'seconds'].map((id) => document.getElementById(id));
  const defaults = { title: 'En liten feiring', date: '2026-12-24', time: '18:00', style: 'classic', accent: '#a3263c' };
  const styleColors = { classic: '#a3263c', soft: '#bd6371', bold: '#671b2d' };

  function targetDate() {
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const [hour, minute] = (timeInput.value || '00:00').split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute, 0, 0);
  }

  function update() {
    const title = titleInput.value.trim() || 'Noe fint';
    const date = targetDate();
    previewTitle.textContent = title;
    previewDate.textContent = new Intl.DateTimeFormat('nb-NO', { dateStyle: 'full', timeStyle: 'short' }).format(date);
    const remaining = date.getTime() - Date.now();
    if (remaining <= 0) {
      units.forEach((unit) => { unit.textContent = '00'; });
      status.textContent = remaining < -60000 ? 'Denne datoen har vært — velg en ny anledning.' : 'Nå skjer det!';
    } else {
      const seconds = Math.floor(remaining / 1000);
      const values = [Math.floor(seconds / 86400), Math.floor((seconds % 86400) / 3600), Math.floor((seconds % 3600) / 60), seconds % 60];
      units.forEach((unit, index) => { unit.textContent = String(values[index]).padStart(2, '0'); });
      status.textContent = 'Tiden går — snart skjer det.';
    }
    const style = form.elements.style.value;
    const accent = accentInput.value || styleColors[style];
    card.dataset.style = style;
    card.style.setProperty('--accent', accent);
    card.style.setProperty('--soft-accent', `${accent}1a`);
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  document.querySelector('#reset').addEventListener('click', () => {
    titleInput.value = defaults.title;
    dateInput.value = defaults.date;
    timeInput.value = defaults.time;
    accentInput.value = defaults.accent;
    form.elements.style.value = defaults.style;
    update();
    titleInput.focus();
    status.textContent = 'Eksempelet er tilbakestilt.';
  });
  update();
  window.setInterval(update, 1000);
})();
