(() => {
  const target = document.querySelector('[data-admin-dashboard]');
  if (!target) return;

  const root = window.Ukelonn?.root || '../';
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const money = ore => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format((Number(ore) || 0) / 100);
  const api = async path => {
    const response = await fetch(root + path, { credentials: 'same-origin' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(payload.error || 'Kunne ikke hente status.');
    return payload;
  };

  const card = (label, value, detail, href, linkText) => '<a class="dashboard-card" href="' + href + '"><span class="dashboard-label">' + label + '</span><strong class="dashboard-value">' + value + '</strong><span class="dashboard-detail">' + detail + '</span><span class="dashboard-link">' + linkText + ' →</span></a>';

  async function start() {
    try {
      const [usersData, tasksData, paymentData, claimsData, suggestionsData, periodData] = await Promise.all([
        api('api/admin/users.php'),
        api('api/admin/tasks.php'),
        api('api/admin/payments.php'),
        api('api/admin/payout-claims.php'),
        api('api/admin/suggestions.php'),
        api('api/admin/periods.php'),
      ]);

      const users = usersData.users || [];
      const tasks = tasksData.tasks || [];
      const paymentRows = paymentData.rows || [];
      const claims = claimsData.claims || [];
      const suggestions = suggestionsData.suggestions || [];
      const activePeriod = periodData.active;
      const openAmount = paymentRows.reduce((sum, row) => sum + (Number(row.payment_ore) || 0), 0);
      const openUsers = new Set(paymentRows.map(row => row.user_id)).size;
      const periodLabel = activePeriod ? new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', dateStyle: 'short' }).format(new Date(activePeriod.starts_at)) : 'Ikke tilgjengelig';
      const pendingClaims = claims.filter(claim => claim.status === 'pending').length;
      const pendingSuggestions = suggestions.filter(item => item.status === 'pending').length;

      target.innerHTML = '<div class="dashboard-grid">' +
        card('Aktiv periode', escapeHtml(periodLabel), activePeriod ? 'Ukelønn er åpen for denne perioden.' : 'Ingen aktiv periode.', '../admin/perioder/', 'Se perioder') +
        card('Til utbetaling', money(openAmount), openUsers + ' brukere med opptjening klar.', '../admin/utbetalinger/', 'Gå til utbetalinger') +
        card('Utbetalingskrav', String(pendingClaims), pendingClaims === 1 ? 'Krav venter på behandling.' : 'Krav venter på behandling.', '../admin/utbetalinger/', 'Behandle krav') +
        card('Forslag til gjøremål', String(pendingSuggestions), pendingSuggestions === 1 ? 'Forslag venter på behandling.' : 'Forslag venter på behandling.', '../admin/forslag/', 'Se forslag') +
        card('Aktive brukere', String(users.filter(user => user.active).length), users.length + ' brukere totalt.', '../admin/brukere/', 'Administrer brukere') +
        card('Aktive gjøremål', String(tasks.filter(task => task.active).length), tasks.length + ' gjøremål totalt.', '../admin/gjoremal/', 'Administrer gjøremål') +
        '</div>';
    } catch (error) {
      target.innerHTML = '<p class="error-message" role="alert">' + escapeHtml(error.message) + '</p>';
    }
  }

  start();
})();
