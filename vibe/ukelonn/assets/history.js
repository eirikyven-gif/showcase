(() => {
  const target = document.querySelector('[data-history]');
  if (!target) return;
  const root = window.Ukelonn?.root || './';
  const money = ore => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format((Number(ore) || 0) / 100);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  fetch(root + 'api/overview.php', { credentials: 'same-origin' }).then(async response => {
    const payload = await response.json();
    if (!response.ok) throw Error(payload.error || 'Historikken kunne ikke lastes.');
    return payload;
  }).then(payload => {
    const rows = payload.history || [];
    const selected = new URLSearchParams(window.location.search).get('period_id');
    const period = rows.find(row => row.period_id === selected);
    if (period) {
      const registrations = period.registrations || [];
      target.innerHTML = '<p><a class="button button-secondary history-back-link" href="./">Tilbake til historikk</a></p><h2>Periode fra ' + new Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo'}).format(new Date(period.period_id)) + '</h2><p>Til gode: ' + money(period.outstanding_ore) + '</p><div class="table-wrap"><table class="compact-table"><caption class="sr-only">Mine registreringer i perioden</caption><thead><tr><th scope="col">Beløp</th><th scope="col">Gjøremål</th><th scope="col">Status</th></tr></thead><tbody>' + registrations.map(item => '<tr><td>' + money(item.payment_ore) + '</td><th scope="row">' + escapeHtml(item.task_name) + '</th><td>' + escapeHtml(item.status) + '</td></tr>').join('') + '</tbody></table></div>';
      return;
    }
    target.innerHTML = rows.length ? '<div class="table-wrap"><table class="compact-table history-table"><caption class="sr-only">Tidligere perioder</caption><thead><tr><th scope="col">Periode</th><th scope="col">Opptjent</th><th scope="col">Til gode</th><th scope="col">Utbetalt</th><th scope="col">Vis</th></tr></thead><tbody>' + rows.map(row => '<tr><td>' + new Intl.DateTimeFormat('nb-NO',{timeZone:'Europe/Oslo'}).format(new Date(row.period_id)) + '</td><td>' + money(row.payment_ore) + '</td><td>' + money(row.outstanding_ore) + '</td><td>' + money(row.paid_ore) + '</td><td><a class="button button-secondary" href="?period_id=' + encodeURIComponent(row.period_id) + '">Åpne periode</a></td></tr>').join('') + '</tbody></table></div>' : '<p class="empty-state" role="status">Du har ingen avsluttede perioder ennå.</p>';
  }).catch(error => target.textContent = error.message);
})();
