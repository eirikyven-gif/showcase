/* Browser-only API adapter. All sample records are synthetic and saved on this device only. */
(() => {
  const key = 'ukelonn-showcase-demo-v1';
  const zonedParts = instant => Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(instant).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  const localOsloIso = (year, month, day, hour, minute = 0) => {
    const guess = Date.UTC(year, month - 1, day, hour, minute);
    const zone = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Oslo', timeZoneName: 'longOffset' })
      .formatToParts(new Date(guess)).find(part => part.type === 'timeZoneName')?.value || 'GMT+01:00';
    const match = zone.match(/GMT([+-])(\d{2}):(\d{2})/);
    const offset = match ? (Number(match[2]) * 60 + Number(match[3])) * (match[1] === '+' ? 1 : -1) : 60;
    return new Date(guess - offset * 60000).toISOString();
  };
  const standardPeriod = (now = new Date()) => {
    const parts = zonedParts(now);
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    const daysSinceFriday = (date.getUTCDay() + 2) % 7;
    const afterFridayStart = daysSinceFriday === 0 && (parts.hour > 20 || (parts.hour === 20 && parts.minute >= 0));
    date.setUTCDate(date.getUTCDate() - daysSinceFriday + (afterFridayStart ? 0 : 0));
    if (!afterFridayStart) date.setUTCDate(date.getUTCDate() - (daysSinceFriday === 0 ? 7 : 0));
    const starts_at = localOsloIso(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), 20);
    const endDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 7));
    const ends_at = localOsloIso(endDate.getUTCFullYear(), endDate.getUTCMonth() + 1, endDate.getUTCDate(), 20);
    return { id: starts_at, starts_at, ends_at, source: 'standard' };
  };
  const initial = () => {
    const current = standardPeriod();
    const previousStart = new Date(new Date(current.starts_at).getTime() - 7 * 86400000).toISOString();
    return ({
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
      { id: 'reg-1', task_id: 'task-room', task_name: 'Rydde rom', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 12500, status: 'approved', submitted_at: new Date(new Date(current.starts_at).getTime() + 86400000).toISOString(), period_id: current.id, attachments: [] },
      { id: 'reg-2', task_id: 'task-dishes', task_name: 'Sette inn oppvask', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 3500, status: 'approved', submitted_at: new Date(new Date(current.starts_at).getTime() + 2 * 86400000).toISOString(), period_id: current.id, attachments: [] },
      { id: 'reg-3', task_id: 'task-kitchen', task_name: 'Rydde kjøkken', user_id: 'adult-b', user_name: 'Voksen B', payment_ore: 9000, status: 'approved', submitted_at: new Date(new Date(current.starts_at).getTime() + 2 * 86400000).toISOString(), period_id: current.id, attachments: [] },
      { id: 'reg-old', task_id: 'task-laundry', task_name: 'Brette klær', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 7000, status: 'approved', submitted_at: new Date(new Date(previousStart).getTime() + 3 * 86400000).toISOString(), period_id: previousStart, attachments: [] },
    ],
    suggestions: [{ id: 'suggestion-1', user_name: 'Voksen B', description: 'Sortere gjenvinning', proposed_payment_ore: 4000, status: 'pending', approved_payment_ore: null }],
    claims: [{ id: 'claim-1', user_id: 'adult-a', user_name: 'Voksen A', payment_ore: 12500, period_id: current.id, registration_ids: ['reg-1'], status: 'pending', created_at: new Date(new Date(current.starts_at).getTime() + 3 * 86400000).toISOString() }],
    periods: [],
    payments: [],
    attachments: [],
  });
  };
  const read = () => { try { return { ...initial(), ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return initial(); } };
  let data = read();
  document.addEventListener('submit', event => event.preventDefault(), true);
  const save = () => localStorage.setItem(key, JSON.stringify(data));
  const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  const money = amount => Math.round((Number(amount) || 0) * 100);
  const bodyOf = async init => { try { return JSON.parse(init.body || '{}'); } catch { return {}; } };
  const activePeriod = () => data.periods.map(period => ({ ...period, id: period.id || period.starts_at }))
    .find(period => new Date(period.starts_at) <= new Date() && new Date() < new Date(period.ends_at)) || standardPeriod();
  const periodId = () => activePeriod().id;
  const forUser = () => data.registrations.filter(row => row.user_id === data.activeUserId && row.status !== 'deleted');
  const activeUser = () => data.users.find(user => user.id === data.activeUserId) || { id: 'adult-a', name: 'Voksen A' };
  const totals = rows => rows.reduce((sum, row) => sum + Number(row.payment_ore || 0), 0);
  const periodKeys = userId => [...new Set(data.registrations.filter(row => row.status !== 'deleted' && (!userId || row.user_id === userId)).map(row => row.period_id))].sort();
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
      save(); result = { tasks: [...data.tasks].sort((a, b) => a.name.localeCompare(b.name, 'nb')) };
    } else if (route === 'admin/users.php') {
      if (method === 'POST') data.users.push({ id: 'user-' + crypto.randomUUID(), name: body.name || 'Demo-bruker', active: true });
      if (method === 'PATCH') data.users = data.users.map(u => u.id === body.id ? { ...u, name: body.name ?? u.name, active: body.active ?? u.active } : u);
      save(); result = { users: data.users };
    } else if (route === 'admin/periods.php') {
      if (method === 'POST') {
        const parseDate = value => {
          const local = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
          return local ? new Date(localOsloIso(Number(local[1]), Number(local[2]), Number(local[3]), Number(local[4]), Number(local[5]))) : new Date(value);
        };
        const start = parseDate(body.starts_at), end = parseDate(body.ends_at);
        if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return response({ error: 'Slutt må være etter start.' }, 422);
        const starts_at = start.toISOString();
        data.periods.push({ id: starts_at, starts_at, ends_at: end.toISOString() });
      }
      save(); result = { periods: [...data.periods].sort((a, b) => b.starts_at.localeCompare(a.starts_at)), active: activePeriod() };
    } else if (route === 'registrations.php') {
      if (method === 'POST') {
        const requestId = String(body.request_id || '');
        const repeated = requestId && data.registrations.find(row => row.user_id === activeUser().id && row.period_id === periodId() && row.request_id === requestId);
        if (!repeated) {
          const selected = [...new Set(body.task_ids || [])].map(id => data.tasks.find(task => task.id === id && task.active));
          if (!selected.length || selected.some(task => !task)) return response({ error: 'Ett eller flere valgte gjøremål er ikke lenger aktive.' }, 422);
          for (const task of selected) {
            const ids = body.attachments?.[task.id] || [];
            const stored = ids.map(id => data.attachments.find(item => item.id === id && item.user_id === activeUser().id && item.task_id === task.id && !item.registration_id));
            if (task.requires_image && !stored.length) return response({ error: 'Dette gjøremålet krever minst ett bilde.' }, 422);
            if (ids.length > 3 || stored.some(item => !item)) return response({ error: 'Ett eller flere vedlegg er ikke gyldige for gjøremålet.' }, 422);
            const id = 'reg-' + crypto.randomUUID(), now = new Date().toISOString();
            data.registrations.unshift({ id, task_id: task.id, task_name: task.name, user_id: activeUser().id, user_name: activeUser().name, payment_ore: task.payment_ore, status: 'approved', submitted_at: now, updated_at: now, request_id: requestId, period_id: periodId(), attachments: ids, history: [{ event: 'created', at: now }] });
            for (const attachment of stored) attachment.registration_id = id;
          }
        }
      }
      if (method === 'PATCH') data.registrations = data.registrations.map(row => { if (row.id !== body.id || row.user_id !== activeUser().id || row.status !== 'approved' || row.period_id !== periodId()) return row; const task = data.tasks.find(t => t.id === body.task_id && t.active && !t.requires_image); if (!task) return row; const now = new Date().toISOString(); return { ...row, task_id: task.id, task_name: task.name, payment_ore: task.payment_ore, updated_at: now, history: [...(row.history || []), { event: 'changed', at: now }] }; });
      if (method === 'DELETE') data.registrations = data.registrations.map(row => row.id === body.id && row.user_id === activeUser().id && row.period_id === periodId() && row.status !== 'deleted' ? { ...row, status: 'deleted', deleted_at: new Date().toISOString(), updated_at: new Date().toISOString(), history: [...(row.history || []), { event: 'deleted', at: new Date().toISOString() }] } : row);
      data.registrations.sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
      save(); result = { tasks: data.tasks.filter(t => t.active).sort((a, b) => a.name.localeCompare(b.name, 'nb')), registrations: forUser().filter(r => r.period_id === periodId()), period: activePeriod() };
    } else if (route === 'overview.php') {
      const mine = forUser(), active = eligibleFor(activeUser().id, periodId()), history = periodKeys(activeUser().id).filter(period => period !== periodId()).map(period => {
        const registrations = mine.filter(row => row.period_id === period);
        return { period_id: period, payment_ore: totals(registrations), outstanding_ore: outstandingFor(activeUser().id, period), paid_ore: paidFor(activeUser().id, period), registrations: registrations.map(row => ({ ...row, status: row.status === 'approved' ? 'Godkjent' : row.status })) };
      });
      const eligible = periodKeys(activeUser().id).reduce((sum, period) => sum + totals(eligibleFor(activeUser().id, period)), 0);
      const outstanding = periodKeys(activeUser().id).reduce((sum, period) => sum + outstandingFor(activeUser().id, period), 0);
      result = { user: { name: activeUser().name }, active: { tasks: active.length, payment_ore: totals(active) }, total: { tasks: mine.filter(row => row.status === 'approved').length, payment_ore: totals(mine.filter(row => row.status === 'approved')) }, payout: { available_payment_ore: eligible, outstanding_payment_ore: outstanding }, payout_claims: data.claims.filter(c => c.user_id === activeUser().id).sort((a, b) => b.created_at.localeCompare(a.created_at)), history };
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
        if (!eligible.length) return response({ error: 'Du har ingen godkjent, ikke utbetalt opptjening å be om utbetaling for.' }, 422);
        const requestId = String(body.request_id || '');
        const repeated = data.claims.find(claim => claim.user_id === activeUser().id && claim.request_id === requestId);
        if (!repeated) data.claims.push({ id: 'claim-' + crypto.randomUUID(), request_id: requestId, user_id: activeUser().id, user_name: activeUser().name, payment_ore: totals(eligible), registration_ids: eligible.map(row => row.id), period_id: periodId(), status: 'pending', created_at: new Date().toISOString() });
      }
      save(); result = { claims: data.claims };
    } else if (route === 'admin/payout-claims.php') {
      if (method === 'POST') {
        const claim = data.claims.find(item => item.id === body.id);
        if (!claim) return response({ error: 'Utbetalingskravet ble ikke funnet.' }, 404);
        if (claim.status !== 'pending') return response({ error: 'Kravet er allerede behandlet.' }, 409);
        if (!['approve', 'reject'].includes(body.action)) return response({ error: 'Ugyldig behandling av utbetalingskrav.' }, 422);
        if (body.action === 'approve') {
          const alreadyPaid = paidIds(claim.user_id);
          if ((claim.registration_ids || []).some(id => alreadyPaid.has(id))) return response({ error: 'Kravet kan ikke godkjennes fordi opptjeningen allerede er utbetalt.' }, 409);
          for (const period of periodKeys(claim.user_id)) {
            const registrationIds = (claim.registration_ids || []).filter(id => data.registrations.some(row => row.id === id && row.period_id === period && row.status === 'approved'));
            const payment = totals(data.registrations.filter(row => registrationIds.includes(row.id)));
            if (payment) data.payments.push({ user_id: claim.user_id, period_id: period, payment_ore: payment, registration_ids: registrationIds });
          }
        }
        data.claims = data.claims.map(item => item.id === claim.id ? { ...item, status: body.action === 'approve' ? 'paid' : 'rejected', processed_at: new Date().toISOString() } : item);
      }
      save(); result = { claims: data.claims };
    } else if (route === 'admin/payments.php') {
      if (method === 'POST') for (const id of body.user_ids || []) {
        const eligible = eligibleFor(id, body.period_id);
        if (eligible.length) data.payments.push({ user_id: id, payment_ore: totals(eligible), registration_ids: eligible.map(row => row.id), period_id: body.period_id });
      }
      save(); result = { rows: data.users.flatMap(user => periodKeys(user.id).map(period => ({ user_id: user.id, user_name: user.name, payment_ore: totals(eligibleFor(user.id, period)), period_id: period }))).filter(row => row.payment_ore > 0), payments: body.user_ids || [] };
    } else if (route === 'admin/registrations.php') result = { registrations: data.registrations.filter(row => row.status !== 'deleted').sort((a, b) => b.submitted_at.localeCompare(a.submitted_at)) };
    else if (route === 'admin/user-history.php') {
      const user = data.users.find(u => u.id === url.searchParams.get('user_id'));
      result = user ? { user, registrations: data.registrations.filter(row => row.user_id === user.id && row.status !== 'deleted') } : { error: 'Brukeren ble ikke funnet.' };
    } else if (route === 'attachments.php') {
      const form = init.body instanceof FormData ? init.body : null;
      const taskId = String(form?.get('task_id') || '');
      const task = data.tasks.find(item => item.id === taskId && item.active);
      const file = form?.get('image');
      const existing = data.attachments.filter(item => item.user_id === activeUser().id && item.task_id === taskId && !item.registration_id);
      if (!task || !(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size < 1 || file.size > 5 * 1024 * 1024) return response({ error: 'Velg et gyldig JPG-, PNG- eller WEBP-bilde på maksimalt 5 MB.' }, 422);
      if (existing.length >= 3) return response({ error: 'Du kan legge ved maksimalt tre bilder per gjøremål.' }, 422);
      const attachment = { id: 'local-image-' + crypto.randomUUID(), user_id: activeUser().id, task_id: taskId };
      data.attachments.push(attachment); save(); result = { attachment: { id: attachment.id } };
    }
    save();
    return response(result);
  };
  window.UkelonnDemo = {
    importTasks(rows) {
      const names = new Set();
      const tasks = rows.map(row => {
        const name = String(row.name || '').trim();
        const payment = Number(String(row.payment || '').trim().replace(',', '.'));
        const normalized = name.toLocaleLowerCase('nb-NO');
        if (!normalized || !Number.isFinite(payment) || payment < 0 || names.has(normalized)) throw new Error('Ugyldig eller duplisert gjøremål i Excel-filen.');
        names.add(normalized);
        const yes = value => /^(ja|true|1)$/i.test(String(value || '').trim());
        return { id: 'task-' + crypto.randomUUID(), name, payment_ore: money(payment), active: yes(row.active), requires_image: yes(row.requiresImage) };
      });
      if (!tasks.length) throw new Error('Excel-filen må inneholde minst ett gjøremål.');
      data.tasks = tasks;
      save();
      return tasks.length;
    },
    exportTasks: () => [...data.tasks].sort((a, b) => a.name.localeCompare(b.name, 'nb')),
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
