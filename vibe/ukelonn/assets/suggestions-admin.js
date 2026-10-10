(() => {
  const root = window.Ukelonn?.root || './';
  const endpoint = root + 'api/admin/suggestions.php';
  const target = document.querySelector('[data-suggestions]');
  if (!target) return;
  let csrfToken = '';
  let suggestions = [];
  const request = async (url, options = {}) => {
    const response = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Forespørselen kunne ikke fullføres.');
    return payload;
  };
  const message = (text) => { const item = document.querySelector('[data-message="suggestions"]'); item.textContent = text; item.hidden = !text; };
  const money = (ore) => (Number(ore || 0) / 100).toFixed(2).replace('.', ',');
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#039;' }[c]));
  const status = (value) => ({ pending: 'Til behandling', approved: 'Godkjent', rejected: 'Avslått' }[value] || value);
  const render = () => {
    if (!suggestions.length) { target.innerHTML = '<tr><td colspan="6">Ingen forslag er sendt inn.</td></tr>'; return; }
    target.innerHTML = suggestions.map((item) => '<tr><td>' + escapeHtml(item.user_name) + '</td><td>' + escapeHtml(item.description) + '</td><td>' + money(item.proposed_payment_ore) + ' kr</td><td><span class="status-tag ' + (item.status === 'pending' ? 'status-pending' : item.status === 'approved' ? 'status-active' : 'status-inactive') + '">' + status(item.status) + '</span></td><td>' + (item.status === 'pending' ? '<label class="sr-only" for="suggestion-payment-' + item.id + '">Godkjent betaling</label><input id="suggestion-payment-' + item.id + '" data-suggestion-payment="' + item.id + '" inputmode="decimal" value="' + money(item.proposed_payment_ore) + '">' : (item.approved_payment_ore === null ? '–' : money(item.approved_payment_ore) + ' kr')) + '</td><td>' + (item.status === 'pending' ? '<div class="record-actions"><button class="button button-primary" type="button" data-approve-suggestion="' + item.id + '">Godkjenn</button><button class="button button-danger" type="button" data-reject-suggestion="' + item.id + '">Avslå</button></div>' : '–') + '</td></tr>').join('');
  };
  async function load() {
    try {
      const session = await request(root + 'api/auth.php');
      if (!session.authenticated || session.identity?.role !== 'admin') { window.location.href = root + 'admin/logg-inn/'; return; }
      csrfToken = session.csrfToken || '';
      suggestions = (await request(endpoint)).suggestions || [];
      render();
    } catch (error) { message(error.message); }
  }
  document.addEventListener('click', async (event) => {
    const approve = event.target.closest('[data-approve-suggestion]');
    const reject = event.target.closest('[data-reject-suggestion]');
    if (!approve && !reject) return;
    const id = (approve || reject).dataset.approveSuggestion || (approve || reject).dataset.rejectSuggestion;
    try {
      const payment = document.querySelector('[data-suggestion-payment="' + id + '"]')?.value.trim().replace(',', '.') || '';
      await request(endpoint, { method: 'PATCH', headers: { 'X-CSRF-Token': csrfToken }, body: JSON.stringify({ id, decision: approve ? 'approve' : 'reject', payment }) });
      await load();
    } catch (error) { message(error.message); }
  });
  document.querySelector('[data-refresh-suggestions]')?.addEventListener('click', load);
  load();
})();