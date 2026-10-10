/* Browser-only API adapter. All sample records are synthetic and saved on this device only. */
(() => {
  const key = 'ukelonn-showcase-demo-v1';
  const initial = () => ({
    activeUserId: 'adult-a',
    tasks: [
      { id: 'task-room', name: 'Rydde rom', payment_ore: 12500, requires_image: false, active: true },
      { id: 'task-kitchen', name: 'Rydde kjøkken', payment_ore: 9000, requires_image: false, active: true },
      { id: 'task-dishes', name: 'Sette inn oppvask', payment_ore: 3500, requires_image: false, active: true },
      { id: 'task-garden', name: 'Vanne planter', payment_ore: 5000, requires_image: true, active: true },
      { id: 'task-laundry', name: 'Brette klær', payment_ore: 7000, requires_image: false, active: true },
      { id: 'task-inactive', name: 'Vaske vinduer', payment_ore: 15000, requires_image: false, active: false },
    ],
    users: [{ id: 'adult-a', name: 'Voksen A', active: true }, { id: 'adult-b', name: 'Voksen B', active: true }],
    registrations: [
      { id: 'reg-1', task_id: 'task-room', task_name: 'Rydde rom', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 12500, status: 'approved', submitted_at: '2026-10-08T15:00:00Z', period_id: '2026-10-02T18:00:00Z', attachments: [] },
      { id: 'reg-2', task_id: 'task-dishes', task_name: 'Sette inn oppvask', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 3500, status: 'approved', submitted_at: '2026-10-09T15:00:00Z', period_id: '2026-10-02T18:00:00Z', attachments: [] },
      { id: 'reg-3', task_id: 'task-kitchen', task_name: 'Rydde kjøkken', user_id: 'adult-b', user_name: 'Voksen B', payment_ore: 9000, status: 'approved', submitted_at: '2026-10-09T16:00:00Z', period_id: '2026-10-02T18:00:00Z', attachments: [] },
      { id: 'reg-old', task_id: 'task-laundry', task_name: 'Brette klær', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 7000, status: 'approved', submitted_at: '2026-09-30T15:00:00Z', period_id: '2026-09-25T18:00:00Z', attachments: [] },
    ],
    suggestions: [{ id: 'suggestion-1', user_name: 'Voksen B', description: 'Sortere gjenvinning', proposed_payment_ore: 4000, status: 'pending', approved_payment_ore: null }],
    claims: [{ id: 'claim-1', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 12500, period_id: '2026-10-02T18:00:00Z', registration_ids: ['reg-1'], status: 'pending', created_at: '2026-10-09T17:00:00Z' }],
    periods: [{ id: 'period-current', starts_at: '2026-10-02T18:00:00Z', ends_at: '2026-10-09T18:00:00Z' }],
    payments: [],
  });
  const read = () => { try { return { ...initial(), ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return initial(); } };
  let data = read();
  document.addEventListener('submit', event => event.preventDefault(), true);
  const save = () => localStorage.setItem(key, JSON.stringify(data));
  const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const money = amount => Math.round((Number(amount) || 0) * 100);
  const bodyOf = async init => { try { return JSON.parse(init.body || '{}'); } catch { return {}; } };
  const periodId = () => data.periods[0]?.starts_at || '2026-10-02T18:00:00Z';
  const forUser = () => data.registrations.filter(row => row.user_id === data.activeUserId);
  const activeUser = () => data.users.find(user => user.id === data.activeUserId) || { id: 'adult-a', name: 'Voksen A' };
  const totals = rows => rows.reduce((sum, row) => sum + Number(row.payment_ore || 0), 0);
  const periodKeys = userId => [...new Set(data.registrations.filter(row => !userId || row.user_id === userId).map(row => row.period_id))];
  const pendingIds = userId => new Set(data.claims.filter(claim => claim.user_id === userId && claim.status === 'pending').flatMap(claim => claim.registration_ids || []));
  const paidIds = userId => new Set(data.payments.filter(payment => payment.user_id === userId).flatMap(payment => payment.registration_ids || []));
  const registrationsFor = (userId, period) => data.registrations.filter(row => row.user_id === userId && row.period_id === period && row.status === 'approved');
  const grossFor = (userId, period) => totals(registrationsFor(userId, period));
  const paidFor = (userId, period) => totals(data.payments.filter(row => row.user_id === userId && row.period_id === period));
  const eligibleFor = (userId, period) => {
    const pending = pendingIds(userId), paid = paidIds(userId);
    return registrationsFor(userId, period).filter(row => !pending.has(row.id) && !paid.has(row.id));
  };
  const outstandingFor = (userId, period) => Math.max(0, grossFor(userId, period) - paidFor(userId, period));
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!url.pathname.includes('/api/')) throw new TypeError('Ukelønn-demoen tillater bare lokale simuleringer.');
    const route = url.pathname.split('/api/').pop();
    const method = (init.method || 'GET').toUpperCase();
    const body = await bodyOf(init);
    let result = {};
    if (route === 'auth.php') {
      const role = document.body.dataset.role || (location.pathname.includes('/admin') ? 'admin' : 'user');
      result = { authenticated: true, identity: { role, id: role === 'admin' ? 'demo-admin' : activeUser().id, name: role === 'admin' ? 'Demo-admin' : activeUser().name }, csrfToken: 'demo-only' };
    } else if (route === 'admin/tasks.php') {
      if (method === 'POST') data.tasks.push({ id: 'task-' + crypto.randomUUID(), name: body.name, payment_ore: money(body.payment), requires_image: !!body.requires_image, active: true });
      if (method === 'PATCH') data.tasks = data.tasks.map(t => t.id === body.id ? { ...t, name: body.name ?? t.name, payment_ore: body.payment == null ? t.payment_ore : money(body.payment), requires_image: body.requires_image ?? t.requires_image, active: body.active ?? t.active } : t);
      if (method === 'DELETE') {
        if (data.registrations.some(row => row.task_id === body.id)) return response({ error: 'Gjøremål med historikk kan ikke slettes. Deaktiver det i stedet.' }, 409);
        data.tasks = data.tasks.filter(t => t.id !== body.id);
      }
      save(); result = { tasks: data.tasks };
    } else if (route === 'admin/tasks-excel.php') result = { count: 0 };
    else if (route === 'admin/users.php') {
      if (method === 'POST') data.users.push({ id: 'user-' + crypto.randomUUID(), name: body.name || 'Demo-bruker', active: true });
      if (method === 'PATCH') data.users = data.users.map(u => u.id === body.id ? { ...u, name: body.name ?? u.name, active: body.active ?? u.active } : u);
      if (method === 'DELETE') data.users = data.users.filter(u => u.id !== body.id);
      save(); result = { users: data.users };
    } else if (route === 'admin/periods.php') {
      if (method === 'POST') data.periods.push({ id: 'period-' + crypto.randomUUID(), starts_at: new Date(body.starts_at).toISOString(), ends_at: new Date(body.ends_at).toISOString() });
      save(); result = { periods: data.periods, active: data.periods[0] };
    } else if (route === 'registrations.php') {
      if (method === 'POST') for (const id of body.task_ids || []) { const task = data.tasks.find(t => t.id === id); if (task) data.registrations.unshift({ id: 'reg-' + crypto.randomUUID(), task_id: id, task_name: task.name, user_id: activeUser().id, user_name: activeUser().name, payment_ore: task.payment_ore, status: 'approved', submitted_at: new Date().toISOString(), period_id: periodId(), attachments: (body.attachments?.[id] || []).map(() => 'synthetic-local-attachment') }); }
      if (method === 'PATCH') data.registrations = data.registrations.map(row => { if (row.id !== body.id) return row; const task = data.tasks.find(t => t.id === body.task_id); return task ? { ...row, task_id: task.id, task_name: task.name, payment_ore: task.payment_ore, status: 'changed' } : row; });
      if (method === 'DELETE') data.registrations = data.registrations.filter(row => row.id !== body.id);
      save(); result = { tasks: data.tasks.filter(t => t.active), registrations: forUser().filter(r => r.period_id === periodId()), period: { starts_at: data.periods[0]?.starts_at, ends_at: data.periods[0]?.ends_at } };
    } else if (route === 'overview.php') {
      const mine = forUser(), active = eligibleFor(activeUser().id, periodId()), history = periodKeys(activeUser().id).filter(period => period !== periodId()).map(period => {
        const registrations = mine.filter(row => row.period_id === period);
        return { period_id: period, payment_ore: totals(registrations), outstanding_ore: outstandingFor(activeUser().id, period), paid_ore: paidFor(activeUser().id, period), registrations: registrations.map(row => ({ ...row, status: row.status === 'approved' ? 'Godkjent' : row.status })) };
      });
      const eligible = periodKeys(activeUser().id).reduce((sum, period) => sum + totals(eligibleFor(activeUser().id, period)), 0);
      const outstanding = periodKeys(activeUser().id).reduce((sum, period) => sum + outstandingFor(activeUser().id, period), 0);
      result = { user: { name: activeUser().name }, active: { tasks: active.length, payment_ore: totals(active) }, total: { tasks: mine.filter(row => row.status === 'approved').length, payment_ore: totals(mine.filter(row => row.status === 'approved')) }, payout: { available_payment_ore: eligible, outstanding_payment_ore: outstanding }, payout_claims: data.claims.filter(c => c.user_id === activeUser().id), history };
    } else if (route === 'suggestions.php') {
      if (method === 'POST') data.suggestions.push({ id: 'suggestion-' + crypto.randomUUID(), user_name: activeUser().name, description: body.description, proposed_payment_ore: money(body.payment), status: 'pending', approved_payment_ore: null });
      save(); result = { suggestions: data.suggestions };
    } else if (route === 'admin/suggestions.php') {
      if (method === 'PATCH') data.suggestions = data.suggestions.map(s => {
        if (s.id !== body.id) return s;
        if (body.decision === 'approve') data.tasks.push({ id: 'task-' + crypto.randomUUID(), name: s.description, payment_ore: money(body.payment), requires_image: false, active: true });
        return { ...s, status: body.decision === 'approve' ? 'approved' : 'rejected', approved_payment_ore: body.decision === 'approve' ? money(body.payment) : null };
      });
      save(); result = { suggestions: data.suggestions };
    } else if (route === 'payout-claims.php') {
      if (method === 'POST') {
        const eligible = periodKeys(activeUser().id).flatMap(period => eligibleFor(activeUser().id, period));
        data.claims.push({ id: 'claim-' + crypto.randomUUID(), user_id: activeUser().id, user_name: activeUser().name, payment_ore: totals(eligible), registration_ids: eligible.map(row => row.id), status: 'pending', created_at: new Date().toISOString() });
      }
      save(); result = { claims: data.claims };
    } else if (route === 'admin/payout-claims.php') {
      if (method === 'POST') data.claims = data.claims.map(c => {
        if (c.id !== body.id) return c;
        if (body.action === 'approve') for (const period of periodKeys(c.user_id)) {
          const registrationIds = (c.registration_ids || []).filter(id => data.registrations.some(row => row.id === id && row.period_id === period));
          const payment = totals(data.registrations.filter(row => registrationIds.includes(row.id)));
          if (payment) data.payments.push({ user_id: c.user_id, period_id: period, payment_ore: payment, registration_ids: registrationIds });
        }
        return { ...c, status: body.action === 'approve' ? 'paid' : 'rejected' };
      });
      save(); result = { claims: data.claims };
    } else if (route === 'admin/payments.php') {
      if (method === 'POST') for (const id of body.user_ids || []) {
        const eligible = eligibleFor(id, body.period_id);
        if (eligible.length) data.payments.push({ user_id: id, payment_ore: totals(eligible), registration_ids: eligible.map(row => row.id), period_id: body.period_id });
      }
      save(); result = { rows: data.users.flatMap(user => periodKeys(user.id).map(period => ({ user_id: user.id, user_name: user.name, payment_ore: totals(eligibleFor(user.id, period)), period_id: period }))).filter(row => row.payment_ore > 0), payments: body.user_ids || [] };
    } else if (route === 'admin/registrations.php') result = { registrations: data.registrations };
    else if (route === 'admin/user-history.php') result = { user: data.users.find(u => u.id === url.searchParams.get('user_id')) || data.users[0], registrations: data.registrations.filter(r => r.user_id === (url.searchParams.get('user_id') || 'adult-a')) };
    else if (route === 'attachments.php') result = { attachment: { id: 'local-image-' + crypto.randomUUID() } };
    save();
    return response(result);
  };
  window.UkelonnDemo = {
    importTasks(rows) {
      let count = 0;
      for (const row of rows) {
        const name = String(row.name || '').trim();
        const payment = Number(String(row.payment || '').trim().replace(',', '.'));
        if (!name || !Number.isFinite(payment) || payment < 0) continue;
        data.tasks.push({ id: 'task-' + crypto.randomUUID(), name, payment_ore: money(payment), requires_image: /^(ja|yes|true|1|x)$/i.test(String(row.requiresImage || '').trim()), active: true });
        count += 1;
      }
      save();
      return count;
    },
  };
  document.addEventListener('click', event => {
    const choice = event.target.closest('[data-demo-user]');
    if (!choice) return;
    event.preventDefault();
    data.activeUserId = choice.dataset.demoUser;
    save();
    location.assign(choice.href);
  });
  const announce = () => {
    if (!document.body) return;
    const bar = document.createElement('aside'); bar.className = 'demo-notice'; bar.setAttribute('aria-label', 'Demo og lokal lagring');
    bar.innerHTML = '<span><strong>Demo:</strong> bruk bare syntetiske opplysninger. Endringer lagres bare lokalt i denne nettleseren, aldri på en server.</span><button type="button" class="button button-secondary">Nullstill alle demoendringer</button>';
    bar.querySelector('button').addEventListener('click', () => { localStorage.removeItem(key); location.reload(); });
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.insertAdjacentElement('afterend', bar);
    else document.body.prepend(bar);
  };
  document.addEventListener('DOMContentLoaded', announce, { once: true });
})();
