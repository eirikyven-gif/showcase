(() => {
  'use strict';
  const initial = [
    { name: 'Velkommen', minutes: 5 },
    { name: 'Felles introduksjon', minutes: 10 },
    { name: 'Gruppearbeid', minutes: 20 },
    { name: 'Pause', minutes: 10 }
  ];
  let segments = initial.map((item) => ({ ...item }));
  let active = 0;
  let remaining = segments[0].minutes * 60;
  let interval = null;
  const $ = (selector) => document.querySelector(selector);
  const name = $('#active-name');
  const countdown = $('#countdown');
  const nextName = $('#next-name');
  const list = $('#segments');
  const status = $('#status');
  const startButton = $('#start-pause');

  function format(seconds) {
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function render() {
    const current = segments[active];
    name.textContent = current ? current.name : 'Alle segmenter er ferdige';
    countdown.textContent = current ? format(remaining) : '00:00';
    countdown.setAttribute('aria-label', current ? `Tid igjen ${format(remaining)}` : 'Alle segmenter er ferdige');
    nextName.textContent = segments[active + 1]?.name || 'Ingen flere';
    $('#segment-count').textContent = `${segments.length} segmenter`;
    startButton.textContent = interval ? 'Pause' : 'Start';
    list.replaceChildren();
    segments.forEach((segment, index) => {
      const item = document.createElement('li');
      item.className = `segment${index < active ? ' done' : ''}`;
      if (index === active) item.setAttribute('aria-current', 'step');
      const number = document.createElement('span');
      number.className = 'segment-index';
      number.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.className = 'segment-name';
      label.textContent = segment.name;
      const duration = document.createElement('span');
      duration.className = 'segment-duration';
      duration.textContent = `${segment.minutes} min`;
      item.append(number, label, duration);
      list.append(item);
    });
  }

  function tick() {
    if (remaining > 0) remaining -= 1;
    if (remaining === 0) {
      if (active < segments.length - 1) {
        active += 1;
        remaining = segments[active].minutes * 60;
        status.textContent = `Neste segment: ${segments[active].name}.`;
      } else {
        clearInterval(interval);
        interval = null;
        active += 1;
        status.textContent = 'Tidsplanen er ferdig.';
      }
    }
    render();
  }

  startButton.addEventListener('click', () => {
    if (!segments.length || active >= segments.length) return;
    if (interval) {
      clearInterval(interval);
      interval = null;
      status.textContent = 'Timeren er satt på pause.';
    } else {
      interval = window.setInterval(tick, 1000);
      status.textContent = 'Timeren går.';
    }
    render();
  });

  $('#reset').addEventListener('click', () => {
    clearInterval(interval);
    interval = null;
    segments = initial.map((item) => ({ ...item }));
    active = 0;
    remaining = segments[0].minutes * 60;
    status.textContent = 'Eksempelplanen er tilbakestilt.';
    render();
  });

  $('#add').addEventListener('click', () => {
    const input = $('#segment-name');
    const duration = Number($('#segment-minutes').value);
    const segmentName = input.value.trim();
    if (!segmentName || !Number.isInteger(duration) || duration < 1 || duration > 180) {
      status.textContent = 'Skriv inn et navn og en varighet mellom 1 og 180 minutter.';
      (!segmentName ? input : $('#segment-minutes')).focus();
      return;
    }
    segments.push({ name: segmentName, minutes: duration });
    status.textContent = `${segmentName} er lagt til i køen.`;
    render();
    input.focus();
  });

  render();
})();
