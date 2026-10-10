(() => {
  const target = document.querySelector('[data-payout-claims]');
  if (!target) return;

  const root = window.Ukelonn?.root || '../../';
  let csrf = '';
  const money = ore => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format((Number(ore) || 0) / 100);
  const timestamp = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value || '') : new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', dateStyle: 'short', timeStyle: 'short' }).format(date);
  };
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const api = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(payload.error || 'Forespørselen kunne ikke fullføres.');
    return payload;
  };
  const status = { pending: 'Til behandling', paid: 'Utbetalt', rejected: 'Avslått' };

  async function refresh() {
    const payload = await api(root + 'api/admin/payout-claims.php');
    const claims = payload.claims || [];
    if (!claims.length) {
      target.innerHTML = '<p class="empty-state" role="status">Ingen utbetalingskrav å behandle.</p>';
      return;
    }

    target.innerHTML = '<div class="panel payout-claims-panel"><div class="table-wrap"><table class="payout-claims-table compact-table"><thead><tr><th scope="col">Bruker</th><th scope="col">Beløp</th><th scope="col">Status</th><th scope="col">Opprettet</th><th scope="col"><span class="sr-only">Handlinger</span></th></tr></thead><tbody>' + claims.map(claim => '<tr><th scope="row">' + esc(claim.user_name || 'Ukjent bruker') + '</th><td>' + money(claim.payment_ore) + '</td><td>' + esc(status[claim.status] || claim.status) + '</td><td>' + esc(timestamp(claim.created_at)) + '</td><td>' + (claim.status === 'pending' ? '<div class="record-actions"><button class="button" type="button" data-claim-action="approve" data-claim-id="' + esc(claim.id) + '">Godkjenn og marker utbetalt</button><button class="button button-danger" type="button" data-claim-action="reject" data-claim-id="' + esc(claim.id) + '">Avslå</button></div>' : '') + '</td></tr>').join('') + '</tbody></table></div></div>';
    target.querySelectorAll('[data-claim-action]').forEach(button => button.addEventListener('click', () => act(button.dataset.claimId, button.dataset.claimAction)));
  }

  async function act(id, action) {
    try {
      await api(root + 'api/admin/payout-claims.php', { method: 'POST', headers: { 'X-CSRF-Token': csrf }, body: JSON.stringify({ id, action }) });
      await refresh();
    } catch (error) {
      target.insertAdjacentHTML('afterbegin', '<p class="error-message" role="alert">' + esc(error.message) + '</p>');
    }
  }

  async function start() {
    try {
      const session = await api(root + 'api/auth.php');
      if (!session.authenticated || session.identity?.role !== 'admin') throw Error('Du har ikke tilgang til utbetalingskravene.');
      csrf = session.csrfToken || '';
      await refresh();
    } catch (error) {
      target.textContent = error.message;
    }
  }

  start();
})();
