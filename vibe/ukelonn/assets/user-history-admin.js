(() => {
  const root = window.Ukelonn?.root || '../../../';
  const target = document.querySelector('[data-user-history]');
  if (!target) return;

  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  const money = ore => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(Number(ore || 0) / 100);
  const status = { approved: 'Godkjent', pending: 'Til behandling', rejected: 'Avslått', paid: 'Utbetalt' };
  const dateTime = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value || 'Ukjent tidspunkt' : new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };
  const period = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value || 'Ukjent periode' : new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', dateStyle: 'medium', timeStyle: 'short' }).format(date);
  };
  const api = async url => {
    const response = await fetch(url, { credentials: 'same-origin' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Kunne ikke hente gjøremålshistorikken.');
    return payload;
  };

  async function load() {
    const userId = new URLSearchParams(window.location.search).get('user_id') || '';
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(userId)) {
      target.innerHTML = '<p class="form-message" role="alert">Velg en bruker fra brukeroversikten.</p>';
      return;
    }

    try {
      const payload = await api(root + 'api/admin/user-history.php?user_id=' + encodeURIComponent(userId));
      const user = payload.user || {};
      document.querySelector('[data-user-history-title]').textContent = user.name || 'Bruker';
      document.querySelector('[data-user-history-status]').textContent = user.active ? 'Aktiv konto' : 'Deaktivert konto';
      const registrations = payload.registrations || [];
      target.innerHTML = registrations.length
        ? '<div class="table-wrap"><table class="history-table compact-table"><caption class="sr-only">Gjøremålsregistreringer for ' + escapeHtml(user.name || 'bruker') + '</caption><thead><tr><th scope="col">Gjøremål</th><th scope="col">Beløp</th><th scope="col">Registrert</th><th scope="col">Periode</th><th scope="col">Status</th></tr></thead><tbody>' + registrations.map(item => '<tr><th scope="row">' + escapeHtml(item.task_name || 'Uten navn') + '</th><td>' + escapeHtml(money(item.payment_ore)) + '</td><td>' + escapeHtml(dateTime(item.submitted_at)) + '</td><td>' + escapeHtml(period(item.period_id)) + '</td><td>' + escapeHtml(status[item.status] || item.status || 'Ukjent') + '</td></tr>').join('') + '</tbody></table></div>'
        : '<p class="empty-state" role="status">Denne brukeren har ingen gjøremålsregistreringer ennå.</p>';
    } catch (error) {
      target.innerHTML = '<p class="form-message" role="alert">' + escapeHtml(error.message) + '</p>';
    }
  }

  load();
})();
