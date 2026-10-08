document.querySelectorAll('.sort-button').forEach((button) => {
  button.addEventListener('click', () => {
    const row = button.closest('tr');
    const badge = row.querySelector('[data-status]');
    const folder = row.querySelector('[data-folder]');
    badge.textContent = 'Sortert eksempel';
    badge.dataset.status = 'Sortert eksempel';
    badge.classList.remove('status-new');
    badge.classList.add('status-done');
    folder.textContent = 'Eksempelmappe · Faktura';
    button.textContent = 'Eksempel sortert';
    button.disabled = true;
    document.querySelector('#status-message').textContent = 'Eksempelstatus oppdatert. Ingen fil ble flyttet eller behandlet.';
  });
});
