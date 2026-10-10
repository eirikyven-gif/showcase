(() => {
  const target = document.querySelector('[data-direct-payments]');
  if (!target) return;
  const root = window.Ukelonn?.root || '../../';
  const dialog = document.querySelector('[data-payment-confirm]');
  const money = value => new Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format((Number(value) || 0) / 100);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  let csrf = '';
  let rows = [];
  let selectedPeriod = '';

  const api = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(payload.error || 'Forespørselen kunne ikke fullføres.');
    return payload;
  };

  const showMessage = (message, error = false) => {
    const node = target.querySelector('[data-payment-message]');
    if (!node) return;
    node.textContent = message;
    node.className = error ? 'error-message' : 'form-message';
    node.hidden = false;
  };

  const render = () => {
    const periods = [...new Set(rows.map(row => row.period_id))];
    if (!periods.includes(selectedPeriod)) selectedPeriod = periods[0] || '';
    const current = rows.filter(row => row.period_id === selectedPeriod);
    target.innerHTML = periods.length
      ? '<section class="panel"><p class="eyebrow">Direkte utbetaling</p><h2>Betaling gjennomført</h2><p>Velg brukere med utestående opptjening. Beløp beregnes på nytt når betalingen registreres.</p><label for="payment-period">Periode</label><select id="payment-period" data-payment-period>' + periods.map(period => '<option value="' + esc(period) + '">' + esc(new Intl.DateTimeFormat('nb-NO',{timeZone:"Europe/Oslo"}).format(new Date(period))) + '</option>').join('') + '</select><div class="table-wrap payment-table-wrap"><table class="payment-table compact-table"><caption class="sr-only">Brukere med utestående opptjening</caption><thead><tr><th scope="col">Velg</th><th scope="col">Bruker</th><th scope="col">Til utbetaling</th></tr></thead><tbody data-payment-rows>' + current.map(row => '<tr><td><input type="checkbox" data-payment-user value="' + esc(row.user_id) + '" aria-label="Velg ' + esc(row.user_name) + '"></td><th scope="row">' + esc(row.user_name) + '</th><td>' + money(row.payment_ore) + '</td></tr>').join('') + '</tbody></table></div><p class="period-note" data-payment-selection>0 brukere · ' + money(0) + '</p><button class="button button-primary" type="button" data-open-payment disabled>Betaling gjennomført</button><p data-payment-message role="status" aria-live="polite" hidden></p></section>'
      : '<section class="panel"><p class="empty-state" role="status">Ingen utestående opptjening å betale ut.</p></section>';
    target.querySelector('[data-payment-period]')?.addEventListener('change', event => { selectedPeriod = event.target.value; render(); });
    target.querySelectorAll('[data-payment-user]').forEach(input => input.addEventListener('change', updateSelection));
    target.querySelector('[data-open-payment]')?.addEventListener('click', openDialog);
  };

  const selectedRows = () => {
    const ids = new Set([...target.querySelectorAll('[data-payment-user]:checked')].map(input => input.value));
    return rows.filter(row => row.period_id === selectedPeriod && ids.has(row.user_id));
  };

  const updateSelection = () => {
    const selected = selectedRows();
    const amount = selected.reduce((sum, row) => sum + Number(row.payment_ore || 0), 0);
    const summary = target.querySelector('[data-payment-selection]');
    const button = target.querySelector('[data-open-payment]');
    if (summary) summary.textContent = selected.length + ' brukere · ' + money(amount);
    if (button) button.disabled = selected.length === 0;
  };

  const openDialog = () => {
    const selected = selectedRows();
    const amount = selected.reduce((sum, row) => sum + Number(row.payment_ore || 0), 0);
    dialog.querySelector('[data-payment-confirm-text]').textContent = 'Registrer betaling for ' + selected.length + ' brukere, totalt ' + money(amount) + '?';
    dialog.showModal();
  };

  const submit = async () => {
    const selected = selectedRows();
    try {
      const result = await api(root + 'api/admin/payments.php', { method: 'POST', headers: { 'X-CSRF-Token': csrf }, body: JSON.stringify({ period_id: selectedPeriod, user_ids: selected.map(row => row.user_id) }) });
      dialog.close();
      rows = (await api(root + 'api/admin/payments.php')).rows || [];
      render();
      showMessage('Betaling er registrert for ' + result.payments.length + ' brukere.');
    } catch (error) {
      dialog.close();
      showMessage(error.message, true);
    }
  };

  async function start() {
    try {
      const session = await api(root + 'api/auth.php');
      if (!session.authenticated || session.identity?.role !== 'admin') throw Error('Du har ikke tilgang til utbetalingene.');
      csrf = session.csrfToken || '';
      rows = (await api(root + 'api/admin/payments.php')).rows || [];
      render();
    } catch (error) {
      target.textContent = error.message;
    }
  }

  dialog?.querySelector('[data-cancel-payment]')?.addEventListener('click', () => dialog.close());
  dialog?.querySelector('[data-confirm-payment]')?.addEventListener('click', submit);
  start();
})();
