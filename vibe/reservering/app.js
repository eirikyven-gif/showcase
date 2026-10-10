(() => {
  'use strict';

  const slotLabels = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const weekdays = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag', 'Søndag'];
  const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const addDays = (date, days) => { const result = new Date(date); result.setDate(result.getDate() + days); return result; };
  const fmtDate = (value, options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) => new Intl.DateTimeFormat('nb-NO', options).format(new Date(`${value}T12:00:00`));
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const makeFutureDay = (offset, desiredWeekday) => {
    let date = addDays(new Date(), offset);
    while (date.getDay() !== desiredWeekday) date = addDays(date, 1);
    return dateKey(date);
  };
  const dayAvailability = {};
  for (let offset = 1; offset < 44; offset += 1) {
    const date = addDays(new Date(), offset);
    if (date.getDay() !== 0 && date.getDay() !== 6) dayAvailability[dateKey(date)] = 'available';
  }
  const storageKey = 'vibe-reservering-demo-v1';
  const seedBlocked = [{ start: makeFutureDay(1, 6), end: makeFutureDay(1, 6), label: 'Demo – helg' }, { start: makeFutureDay(1, 0), end: makeFutureDay(1, 0), label: 'Demo – helg' }];
  const scheduleSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const seedWeekly = weekdays.map((name, index) => ({ name, enabled: index < 5, slots: index < 5 ? [...scheduleSlots] : [] }));
  const seedReservations = [
    { id: 'demo-101', date: makeFutureDay(1, 1), time: '09:00', name: 'Demakunde Alfa', phone: '00000001', email: 'alfa@example.invalid', note: 'Syntetisk eksempel', status: 'active' },
    { id: 'demo-102', date: makeFutureDay(1, 2), time: '11:00', name: 'Demakunde Beta', phone: '00000002', email: 'beta@example.invalid', note: '', status: 'active' },
    { id: 'demo-103', date: makeFutureDay(-10, 3), time: '14:00', name: 'Demakunde Gamma', phone: '00000003', email: 'gamma@example.invalid', note: '', status: 'active' },
    { id: 'demo-104', date: makeFutureDay(-20, 4), time: '10:00', name: 'Demakunde Delta', phone: '00000004', email: 'delta@example.invalid', note: '', status: 'cancelled' }
  ];
  const syntheticNames = ['Demakunde Eksempel', 'Demakunde Alfa', 'Demakunde Beta', 'Demakunde Gamma', 'Demakunde Delta', 'Demakunde Ny'];
  const syntheticEmails = ['kunde@example.invalid', 'alfa@example.invalid', 'beta@example.invalid', 'gamma@example.invalid', 'delta@example.invalid', 'ny@example.invalid'];
  const syntheticNotes = ['', 'Syntetisk eksempel', 'Demo – eksempelmerknad', 'Demo – oppfølging'];
  const syntheticText = (value) => ['', 'Demo – helg', 'Demo – stengt', 'Syntetisk eksempel'].includes(value);
  const validReservation = (item) => item && typeof item.id === 'string' && /^demo-[a-z0-9-]+$/i.test(item.id) && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && slotLabels.includes(item.time) && syntheticNames.includes(item.name) && /^000000\d{2,}$/.test(item.phone) && syntheticEmails.includes(item.email) && syntheticNotes.includes(item.note) && ['active', 'cancelled'].includes(item.status);
  function readDemoState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved?.version !== 1 || !Array.isArray(saved.reservations) || !saved.reservations.every(validReservation) || !Array.isArray(saved.blocked) || !saved.blocked.every((range) => /^\d{4}-\d{2}-\d{2}$/.test(range.start) && /^\d{4}-\d{2}-\d{2}$/.test(range.end) && range.start <= range.end && syntheticText(range.label)) || !Array.isArray(saved.weekly) || saved.weekly.length !== weekdays.length || !saved.weekly.every((day, index) => day.name === weekdays[index] && typeof day.enabled === 'boolean' && Array.isArray(day.slots) && day.slots.every((time) => scheduleSlots.includes(time))) || !['admin@example.invalid', 'notify@example.invalid'].includes(saved.adminEmail) || !['editor', 'administrator'].includes(saved.demoRole)) return null;
      return saved;
    } catch { return null; }
  }
  const restored = readDemoState();
  let blocked = restored ? restored.blocked : structuredClone(seedBlocked);
  let weekly = restored ? restored.weekly : structuredClone(seedWeekly);
  let reservations = restored ? restored.reservations : structuredClone(seedReservations);
  let adminEmail = restored?.adminEmail || 'admin@example.invalid';
  let demoRole = restored?.demoRole || 'editor';
  function saveDemoState() {
    try { localStorage.setItem(storageKey, JSON.stringify({ version: 1, reservations, blocked, weekly, adminEmail, demoRole })); }
    catch { $('#booking-message').textContent = 'Nettleseren kunne ikke lagre lokalt. Demoen fungerer til siden lukkes.'; }
  }
  let selectedDate = '';
  let selectedTime = '';
  let currentReservationId = '';
  let monthCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  $('#reset-demo').addEventListener('click', () => { try { localStorage.removeItem(storageKey); } catch {} window.location.reload(); });
  $('#admin-email').value = adminEmail;
  $('#demo-role').value = demoRole;

  function setView(view) {
    $('#booking-view').classList.toggle('hidden', view !== 'booking');
    $('#admin-view').classList.toggle('hidden', view !== 'admin');
    $$('[data-view]').forEach((button) => {
      const active = button.dataset.view === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (view === 'admin') renderReservations();
  }
  $$('[data-view]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));

  function dayStatus(key) {
    if (blocked.some((range) => key >= range.start && key <= range.end)) return 'blocked';
    if (!dayAvailability[key]) return 'blocked';
    const weekdayIndex = (new Date(`${key}T12:00:00`).getDay() + 6) % 7;
    if (!weekly[weekdayIndex]?.enabled || weekly[weekdayIndex].slots.length === 0) return 'blocked';
    const count = reservations.filter((item) => item.date === key && item.status === 'active').length;
    return count >= slotLabels.length ? 'full' : 'available';
  }

  function renderCalendar() {
    const y = monthCursor.getFullYear();
    const m = monthCursor.getMonth();
    $('#month-label').textContent = new Intl.DateTimeFormat('nb-NO', { month: 'long', year: 'numeric' }).format(monthCursor);
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(y, m + 1, 0).getDate();
    const cells = weekdays.map((name) => `<div class="weekday" aria-hidden="true">${name.slice(0, 2)}</div>`);
    for (let i = 0; i < offset; i += 1) cells.push('<span class="day-empty" aria-hidden="true"></span>');
    for (let day = 1; day <= count; day += 1) {
      const key = dateKey(new Date(y, m, day));
      const status = dayStatus(key);
      const label = status === 'available' ? 'Ledig' : status === 'full' ? 'Full' : 'Blokkert';
      const selected = selectedDate === key;
      cells.push(`<button type="button" class="day-button ${status}${selected ? ' selected' : ''}" data-date="${key}" ${status !== 'available' ? 'disabled' : ''} aria-pressed="${selected}" aria-label="${escapeHtml(fmtDate(key))} – ${label}"><strong>${day}</strong><small>${label}</small></button>`);
    }
    $('#calendar').innerHTML = cells.join('');
    $$('#calendar [data-date]').forEach((button) => button.addEventListener('click', () => {
      selectedDate = button.dataset.date;
      selectedTime = '';
      renderCalendar(); renderTimes(); updateSummary();
    }));
  }
  $('#previous-month').addEventListener('click', () => { monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1); renderCalendar(); });
  $('#next-month').addEventListener('click', () => { monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1); renderCalendar(); });

  function renderTimes() {
    const wrapper = $('#time-slots');
    if (!selectedDate) {
      $('#selected-date-label').textContent = 'Velg først en ledig dato.';
      wrapper.innerHTML = '<p class="helper">Ledige tidspunkt vises når du velger en dato.</p>';
      return;
    }
    $('#selected-date-label').textContent = fmtDate(selectedDate);
    const weekdayIndex = (new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7;
    const activeSlots = weekly[weekdayIndex]?.enabled ? weekly[weekdayIndex].slots : [];
    const occupied = reservations.filter((item) => item.date === selectedDate && item.status === 'active').map((item) => item.time);
    wrapper.innerHTML = activeSlots.length ? activeSlots.map((time) => {
      const isBusy = occupied.includes(time);
      return `<button type="button" class="time-button${selectedTime === time ? ' selected' : ''}" data-time="${time}" ${isBusy ? 'disabled' : ''} aria-pressed="${selectedTime === time}">${time}${isBusy ? ' · Opptatt' : ''}</button>`;
    }).join('') : '<p class="helper">Ingen ledige tidspunkt denne dagen.</p>';
    $$('#time-slots [data-time]').forEach((button) => button.addEventListener('click', () => { selectedTime = button.dataset.time; renderTimes(); updateSummary(); }));
  }

  function updateSummary() {
    $('#summary-date').textContent = selectedDate ? fmtDate(selectedDate) : 'Ikke valgt';
    $('#summary-time').textContent = selectedTime || 'Ikke valgt';
    $('#booking-summary').value = selectedDate && selectedTime ? `${fmtDate(selectedDate)} kl. ${selectedTime}` : 'Ikke valgt';
    $('#summary-status').textContent = selectedTime ? 'Klar for reservasjon' : 'Velg en ledig tid';
  }

  function clearValidation() {
    ['name', 'phone', 'email'].forEach((name) => { $(`#${name === 'name' ? 'customer-name' : name === 'phone' ? 'customer-phone' : 'customer-email'}`).removeAttribute('aria-invalid'); $(`#${name}-error`).textContent = ''; });
  }
  const bookingForm = document.querySelector('#booking-form');
  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearValidation();
    const name = $('#customer-name').value.trim();
    const phone = $('#customer-phone').value.trim();
    const email = $('#customer-email').value.trim();
    let firstInvalid = null;
    const invalid = (selector, errorSelector, message) => { const field = $(selector); field.setAttribute('aria-invalid', 'true'); $(errorSelector).textContent = message; firstInvalid ||= field; };
    if (!selectedDate || !selectedTime) { $('#booking-message').textContent = 'Velg en ledig dato og et tidspunkt før du fortsetter.'; $('#calendar').scrollIntoView({ block: 'nearest' }); return; }
    if (!syntheticNames.includes(name)) invalid('#customer-name', '#name-error', 'Velg et av de forhåndsdefinerte Demakunde-eksemplene.');
    if (!/^000000\d{2,}$/.test(phone.replace(/\D/g, ''))) invalid('#customer-phone', '#phone-error', 'Bruk et demanummer som begynner med 000000.');
    if (!syntheticEmails.includes(email)) invalid('#customer-email', '#email-error', 'Bruk en av de forhåndsdefinerte example.invalid-adressene.');
    if (!syntheticNotes.includes($('#customer-note').value.trim())) { $('#customer-note').setAttribute('aria-invalid', 'true'); $('#booking-message').textContent = 'Bruk bare tom merknad eller en forhåndsdefinert syntetisk merknad.'; $('#customer-note').focus(); return; }
    if (firstInvalid) { firstInvalid.focus(); $('#booking-message').textContent = 'Kontroller feltene som er markert.'; return; }
    if (!$('#terms').checked) { $('#booking-message').textContent = 'Godta vilkårene for å prøve bekreftelsen.'; $('#terms').focus(); return; }
    const item = { id: `demo-${Date.now()}`, date: selectedDate, time: selectedTime, name, phone, email, note: $('#customer-note').value.trim(), status: 'active' };
    reservations.push(item);
    saveDemoState();
    currentReservationId = item.id;
    $('#confirmation-title').textContent = 'Reservasjonen er registrert i demoen';
    $('#confirmation-copy').textContent = `${fmtDate(item.date)} kl. ${item.time} er lagt til i den lokale demoen for ${item.name}.`;
    $('#cancel-booking').classList.remove('hidden');
    $('#confirmation').classList.remove('hidden');
    $('#booking-message').textContent = 'Demoreservasjonen er lagret lokalt i denne nettleseren.';
    $('#confirmation').focus(); renderCalendar(); renderTimes(); renderReservations();
  });
  $('#reset-booking').addEventListener('click', () => {
    setTimeout(() => { selectedDate = ''; selectedTime = ''; $('#confirmation').classList.add('hidden'); $('#booking-message').textContent = 'Valgene er nullstilt.'; clearValidation(); renderCalendar(); renderTimes(); updateSummary(); }, 0);
  });
  $('#new-booking').addEventListener('click', () => { $('#confirmation').classList.add('hidden'); selectedDate = ''; selectedTime = ''; $('#booking-form').reset(); clearValidation(); renderCalendar(); renderTimes(); updateSummary(); $('#booking-title').focus(); });
  $('#cancel-booking').addEventListener('click', () => {
    const item = reservations.find((reservation) => reservation.id === currentReservationId);
    if (!item || item.status !== 'active') return;
    if (!window.confirm('Avbestille denne syntetiske demoreservasjonen lokalt? Ingen lenke eller e-post brukes.')) return;
    item.status = 'cancelled';
    saveDemoState();
    $('#confirmation-title').textContent = 'Demoreservasjonen er kansellert';
    $('#confirmation-copy').textContent = `${fmtDate(item.date)} kl. ${item.time} er nå markert som kansellert lokalt.`;
    $('#cancel-booking').classList.add('hidden');
    $('#booking-message').textContent = 'Kansellering simulert lokalt. Ingen e-post ble sendt.';
    renderCalendar(); renderTimes(); renderReservations(); updateSummary();
  });
  $('#download-ics').addEventListener('click', () => {
    const latest = reservations.at(-1);
    if (!latest) return;
    const start = latest.date.replaceAll('-', '') + 'T' + latest.time.replace(':', '') + '00';
    const endDate = new Date(`${latest.date}T${latest.time}:00`); endDate.setHours(endDate.getHours() + 1);
    const end = dateKey(endDate).replaceAll('-', '') + 'T' + `${String(endDate.getHours()).padStart(2, '0')}${String(endDate.getMinutes()).padStart(2, '0')}00`;
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Vibe//Syntetisk demo//NB\r\nBEGIN:VEVENT\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:Demoreservasjon – syntetisk eksempel\r\nDESCRIPTION:Dette er en lokal demofil, ikke en ekte reservasjon.\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'demoreservasjon.ics'; link.click(); URL.revokeObjectURL(link.href);
  });

  function setAdminPanel(panel) {
    $$('.admin-tab').forEach((button) => { const active = button.dataset.panel === panel; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
    $$('.admin-panel').forEach((element) => element.classList.toggle('hidden', element.id !== panel));
  }
  $$('.admin-tab').forEach((button) => button.addEventListener('click', () => setAdminPanel(button.dataset.panel)));
  $$('.admin-tab').forEach((button) => button.addEventListener('keydown', (event) => {
    const tabs = $$('.admin-tab'); const index = tabs.indexOf(button);
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
    if (next >= 0) { event.preventDefault(); setAdminPanel(tabs[next].dataset.panel); tabs[next].focus(); }
  }));

  function renderReservations() {
    if (!$('#reservation-rows')) return;
    const query = $('#reservation-search').value.trim().toLocaleLowerCase('nb-NO');
    const filter = $('#reservation-filter').value;
    const today = dateKey(new Date());
    const rows = reservations.filter((item) => {
      const matchesFilter = filter === 'all' || (filter === 'cancelled' ? item.status === 'cancelled' : filter === 'past' ? item.date < today && item.status === 'active' : item.date >= today && item.status === 'active');
      const statusLabel = item.status === 'active' ? 'aktiv' : 'kansellert';
      return matchesFilter && `${item.name} ${item.date} ${statusLabel} ${item.email}`.toLocaleLowerCase('nb-NO').includes(query);
    }).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    $('#reservation-rows').innerHTML = rows.map((item) => `<tr><td>${escapeHtml(fmtDate(item.date, { day: 'numeric', month: 'short', year: 'numeric' }))} ${escapeHtml(item.time)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.email)} · ${escapeHtml(item.phone)}</td><td>${item.status === 'active' ? 'Aktiv' : 'Kansellert'}</td><td><div class="row-actions"><button type="button" class="button secondary" data-edit="${escapeHtml(item.id)}">Rediger</button><button type="button" class="button danger" data-delete="${escapeHtml(item.id)}">Slett</button></div></td></tr>`).join('');
    $('#table-empty').classList.toggle('hidden', rows.length > 0);
    $$('[data-edit]').forEach((button) => button.addEventListener('click', () => openReservationDialog(button.dataset.edit)));
    $$('[data-delete]').forEach((button) => button.addEventListener('click', () => {
      const item = reservations.find((reservation) => reservation.id === button.dataset.delete);
      if (item && window.confirm(`Slette den syntetiske demoposten «${item.name}» lokalt?`)) { reservations.splice(reservations.indexOf(item), 1); saveDemoState(); renderReservations(); $('#admin-message').textContent = 'Demoposten er slettet lokalt.'; renderCalendar(); }
    }));
  }
  $('#reservation-search').addEventListener('input', renderReservations);
  $('#reservation-filter').addEventListener('change', renderReservations);
  $('#export-csv').addEventListener('click', () => {
    const rows = [['Dato', 'Tid', 'Syntetisk navn', 'Syntetisk telefon', 'Syntetisk e-post', 'Status'], ...reservations.map((item) => [item.date, item.time, item.name, item.phone, item.email, item.status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })); link.download = 'demoreservasjoner.csv'; link.click(); URL.revokeObjectURL(link.href);
    $('#admin-message').textContent = 'En CSV med kun syntetiske demoopplysninger er lastet ned lokalt.';
  });

  function openReservationDialog(id = '') {
    const item = id ? reservations.find((reservation) => reservation.id === id) : null;
    $('#dialog-title').textContent = item ? 'Rediger reservasjonsdemo' : 'Ny reservasjonsdemo';
    $('#edit-id').value = item?.id || '';
    $('#edit-name').value = item?.name || 'Demakunde Ny'; $('#edit-phone').value = item?.phone || '00000000'; $('#edit-email').value = item?.email || 'ny@example.invalid';
    $('#edit-date').value = item?.date || makeFutureDay(1, 1); $('#edit-time').value = item?.time || '09:00'; $('#edit-status').value = item?.status || 'active'; $('#edit-note').value = item?.note || '';
    $('#reservation-dialog').showModal(); $('#edit-name').focus();
  }
  $('#add-reservation').addEventListener('click', () => openReservationDialog());
  $('#close-dialog').addEventListener('click', () => $('#reservation-dialog').close());
  const reservationEditForm = document.querySelector('#reservation-edit-form');
  reservationEditForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const id = $('#edit-id').value;
    const value = { id: id || `demo-${Date.now()}`, name: $('#edit-name').value.trim(), phone: $('#edit-phone').value.trim(), email: $('#edit-email').value.trim(), date: $('#edit-date').value, time: $('#edit-time').value, status: $('#edit-status').value, note: $('#edit-note').value.trim() };
    if (!syntheticNames.includes(value.name) || !/^000000\d{2,}$/.test(value.phone.replace(/\D/g, '')) || !value.date || !slotLabels.includes(value.time) || !syntheticEmails.includes(value.email) || !syntheticNotes.includes(value.note)) { $('#admin-message').textContent = 'Bruk bare forhåndsdefinerte syntetiske kundeverdier.'; return; }
    if (id) Object.assign(reservations.find((item) => item.id === id), value); else reservations.push(value);
    saveDemoState(); $('#reservation-dialog').close(); renderReservations(); renderCalendar(); $('#admin-message').textContent = 'Demoreservasjonen er lagret lokalt.';
  });
  $('#demo-role').addEventListener('change', () => { demoRole = $('#demo-role').value; saveDemoState(); $('#admin-message').textContent = `Viser eksempeltilgang for ${$('#demo-role').selectedOptions[0].textContent.toLocaleLowerCase('nb-NO')}. Dette er ikke autentisering.`; });

  function renderWeeklyHours() {
    $('#weekly-hours').innerHTML = weekly.map((day, index) => `<fieldset class="weekday-setting"><legend>${day.name}</legend><label class="day-open"><input type="checkbox" data-day-enabled="${index}" ${day.enabled ? 'checked' : ''}> Åpen</label><div class="slot-checks" aria-label="Tilgjengelige tider ${day.name}">${scheduleSlots.map((time) => `<label><input type="checkbox" data-day-slot="${index}" value="${time}" ${day.slots.includes(time) ? 'checked' : ''}> ${time}</label>`).join('')}</div></fieldset>`).join('');
    const changed = () => {
      if (selectedDate && dayStatus(selectedDate) !== 'available') { selectedDate = ''; selectedTime = ''; }
      else if (selectedTime && selectedDate && !weekly[(new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7].slots.includes(selectedTime)) selectedTime = '';
      saveDemoState(); $('#availability-message').textContent = 'Ukentlig tilgjengelighet lagret lokalt.'; renderCalendar(); renderTimes(); updateSummary();
    };
    $$('[data-day-enabled]').forEach((input) => input.addEventListener('change', () => { weekly[Number(input.dataset.dayEnabled)].enabled = input.checked; changed(); }));
    $$('[data-day-slot]').forEach((input) => input.addEventListener('change', () => { const day = weekly[Number(input.dataset.daySlot)]; day.slots = input.checked ? [...new Set([...day.slots, input.value])].sort() : day.slots.filter((time) => time !== input.value); changed(); }));
  }
  const blockoutForm = document.querySelector('#blockout-form');
  blockoutForm.addEventListener('submit', (event) => {
    event.preventDefault(); const start = $('#blockout-start').value; const end = $('#blockout-end').value; const label = $('#blockout-label').value.trim();
    if (!start || !end || start > end || !label) { $('#availability-message').textContent = 'Velg en gyldig dato eller periode.'; return; }
    if (!syntheticText(label)) { $('#availability-message').textContent = 'Beskrivelsen må være tom eller begynne med Demo eller Syntetisk.'; return; }
    blocked.push({ start, end, label }); saveDemoState(); renderBlockouts(); renderCalendar(); $('#availability-message').textContent = 'Perioden er blokkert lokalt.'; event.currentTarget.reset(); $('#blockout-label').value = 'Demo – stengt';
  });
  function renderBlockouts() {
    $('#blockout-list').innerHTML = blocked.map((range, index) => `<li>${escapeHtml(fmtDate(range.start))}${range.end !== range.start ? ` – ${escapeHtml(fmtDate(range.end))}` : ''} · ${escapeHtml(range.label)} <button type="button" class="button secondary" data-unblock="${index}">Fjern blokkering</button></li>`).join('');
    $$('[data-unblock]').forEach((button) => button.addEventListener('click', () => { blocked.splice(Number(button.dataset.unblock), 1); saveDemoState(); renderBlockouts(); renderCalendar(); $('#availability-message').textContent = 'Blokkeringen er fjernet lokalt.'; }));
  }
  const settingsForm = document.querySelector('#settings-form');
  settingsForm.addEventListener('submit', (event) => { event.preventDefault(); const email = $('#admin-email').value; if (!/^[^\s@]+@[^\s@]+\.invalid$/i.test(email)) { $('#settings-message').textContent = 'Bruk en syntetisk adresse som slutter på .invalid.'; return; } adminEmail = email; saveDemoState(); $('#settings-message').textContent = 'Demoadressen er lagret lokalt. Ingen e-post sendes.'; });

  renderCalendar(); renderTimes(); updateSummary(); renderReservations(); renderWeeklyHours(); renderBlockouts();
})();
