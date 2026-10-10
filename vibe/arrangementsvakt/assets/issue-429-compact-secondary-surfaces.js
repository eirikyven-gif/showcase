(() => {
  const issue429Version = 'v0.14.7-issue-429-compact-secondary-surfaces-2026-06-23';
  const baseRenderOverview = renderOverview;
  const baseRenderOffline = renderOffline;
  const baseRenderShell = renderShell;

  function issue429Text(value) {
    return String(value ?? '').trim();
  }

  function issue429Timestamp(value) {
    const timestamp = new Date(issue429Text(value)).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function issue429Time(value) {
    if (!value) return 'Ukjent tid';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Ukjent tid';
    const now = new Date();
    const sameDay = date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate();
    if (sameDay) return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function issue429Icon(name) {
    const paths = {
      team: ['M16 21v-2a4 4 0 0 0-8 0v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M22 21v-2a4 4 0 0 0-3-3.87'],
      admin: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0', 'M19 5v4', 'M17 7h4'],
      offline: ['M12 3v18', 'M5 8h14', 'M7 16h10', 'M8 12h8'],
      event: ['M4 4h16v16H4z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
      user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21a8 8 0 0 1 16 0'],
      import: ['M12 3v12', 'M7 10l5 5 5-5', 'M5 21h14'],
      export: ['M12 21V9', 'M7 14l5-5 5 5', 'M5 3h14'],
      push: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('issue429-icon');
    (paths[name] || paths.team).forEach((pathData) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      svg.append(path);
    });
    return svg;
  }

  function issue429Chip(label, tone = 'neutral') {
    const chip = document.createElement('span');
    chip.className = 'issue429-chip';
    chip.dataset.tone = tone;
    chip.textContent = label;
    return chip;
  }

  function issue429TeamIncidents(team) {
    return state.incidents.filter((incident) => (incident.teamIds || []).includes(team.id));
  }

  function issue429TeamUnread(team) {
    return state.messages.filter((message) => {
      if (message.read !== false) return false;
      return message.teamId === team.id || message.teamName === team.name || (message.teamIds || []).includes(team.id);
    }).length;
  }

  function issue429TeamRow(team) {
    const members = state.users.filter((user) => user.active !== false && (user.teamIds || []).includes(team.id));
    const incidents = issue429TeamIncidents(team);
    const openIncidents = incidents.filter((incident) => !['resolved', 'archived'].includes(incident.status));
    const latest = [...incidents].sort((a, b) => {
      return Math.max(issue429Timestamp(b.updatedAt), issue429Timestamp(b.createdAt))
        - Math.max(issue429Timestamp(a.updatedAt), issue429Timestamp(a.createdAt));
    })[0] || null;
    const unread = issue429TeamUnread(team);

    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'issue429-row issue429-team-row';
    row.dataset.tone = openIncidents.length ? 'warning' : (team.active === false ? 'archived' : 'ok');
    row.setAttribute('aria-label', `Åpne team ${team.name}`);
    row.addEventListener('click', () => openDetailModal('team', team.id));

    const icon = document.createElement('span');
    icon.className = 'issue429-row-icon';
    icon.append(issue429Icon('team'));

    const main = document.createElement('span');
    main.className = 'issue429-row-main';
    const title = document.createElement('strong');
    title.textContent = team.name || 'Team uten navn';
    const preview = document.createElement('span');
    preview.className = 'issue429-preview';
    preview.textContent = latest?.title || team.description || 'Ingen siste hendelse.';
    const meta = document.createElement('span');
    meta.className = 'issue429-meta';
    meta.textContent = [
      `${members.length} medlemmer`,
      `Teamleder: ${teamLeaderNames(team)}`,
      latest ? issue429Time(latest.updatedAt || latest.createdAt) : '',
    ].filter(Boolean).join(' · ');
    main.append(title, preview, meta);

    const side = document.createElement('span');
    side.className = 'issue429-row-side';
    side.append(
      issue429Chip(team.active === false ? 'Inaktiv' : 'Aktiv', team.active === false ? 'archived' : 'ok'),
      issue429Chip(`${openIncidents.length} åpne`, openIncidents.length ? 'warning' : 'ok'),
      ...(unread ? [issue429Chip(`${unread} ulest`, 'info')] : []),
    );

    row.append(icon, main, side);
    return row;
  }

  function issue429UserRow(user) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'issue429-row issue429-user-row';
    row.dataset.tone = user.active === false ? 'archived' : 'info';
    const name = user.displayName || user.fullName || 'Bruker';
    row.setAttribute('aria-label', `Åpne bruker ${name}`);
    row.addEventListener('click', () => openDetailModal('user', user.id));
    const icon = document.createElement('span');
    icon.className = 'issue429-row-icon';
    icon.append(issue429Icon('user'));
    const main = document.createElement('span');
    main.className = 'issue429-row-main';
    const title = document.createElement('strong');
    title.textContent = name;
    const preview = document.createElement('span');
    preview.className = 'issue429-preview';
    preview.textContent = user.fullName !== name ? user.fullName : displayRoleLabel(user);
    const meta = document.createElement('span');
    meta.className = 'issue429-meta';
    meta.textContent = [displayRoleLabel(user), teamNames(user.teamIds || [])].filter(Boolean).join(' · ');
    main.append(title, preview, meta);
    const side = document.createElement('span');
    side.className = 'issue429-row-side';
    side.append(issue429Chip(user.active === false ? 'Inaktiv' : 'Aktiv', user.active === false ? 'archived' : 'ok'));
    row.append(icon, main, side);
    return row;
  }

  renderOverview = function issue429RenderOverview() {
    baseRenderOverview();
    const teamOverview = $('#teamOverview');
    const userOverview = $('#userOverview');
    const teamPanel = $('#teamPanel');
    if (!teamOverview || !userOverview || !teamPanel) return;
    teamPanel.dataset.issue429Surface = 'team';

    const visibleTeams = getAllowedTeams();
    teamOverview.className = 'issue429-list issue429-team-list';
    if (!visibleTeams.length) {
      teamOverview.replaceChildren(issue429CompactEmpty('Ingen team er tilgjengelige for denne rollen.'));
    } else {
      teamOverview.replaceChildren(...visibleTeams.map(issue429TeamRow));
    }

    const activeUsers = state.users.filter((user) => user.active !== false);
    const visibleUsers = isLeadershipUser()
      ? activeUsers
      : activeUsers.filter((user) => (user.teamIds || []).some((id) => (state.user.teamIds || []).includes(id)));
    userOverview.className = 'issue429-list issue429-user-list';
    if (!visibleUsers.length) {
      userOverview.replaceChildren(issue429CompactEmpty('Ingen medlemmer å vise.'));
    } else {
      userOverview.replaceChildren(...visibleUsers.map(issue429UserRow));
    }
  };

  function issue429CompactEmpty(text) {
    const empty = document.createElement('p');
    empty.className = 'issue429-empty';
    empty.textContent = text;
    return empty;
  }

  function issue429OfflineRow(incident, index) {
    const row = document.createElement('article');
    row.className = 'issue429-row issue429-offline-row';
    row.dataset.tone = 'warning';
    const icon = document.createElement('span');
    icon.className = 'issue429-row-icon';
    icon.append(issue429Icon('offline'));
    const main = document.createElement('span');
    main.className = 'issue429-row-main';
    const title = document.createElement('strong');
    title.textContent = incident.title || `Hendelse ${index + 1}`;
    const preview = document.createElement('span');
    preview.className = 'issue429-preview';
    preview.textContent = incident.description || incident.location || 'Lagret lokalt og venter på sending.';
    const meta = document.createElement('span');
    meta.className = 'issue429-meta';
    meta.textContent = [incident.location || '', incident.savedAt ? `Lagret ${issue429Time(incident.savedAt)}` : 'Lagret lokalt'].filter(Boolean).join(' · ');
    main.append(title, preview, meta);
    const side = document.createElement('span');
    side.className = 'issue429-row-side';
    side.append(issue429Chip('Ikke sendt', 'warning'));
    row.append(icon, main, side);
    return row;
  }

  renderOffline = function issue429RenderOffline() {
    baseRenderOffline();
    const panel = $('#offlinePanel');
    const list = $('#offlineList');
    const retry = $('#retryOfflineButton');
    if (!panel || !list) return;
    panel.dataset.issue429Surface = 'offline';
    const offline = offlineIncidents();
    if (retry) {
      retry.classList.toggle('hidden', offline.length === 0);
      retry.textContent = 'Send på nytt';
    }
    list.className = 'issue429-list issue429-offline-list';
    if (!offline.length) {
      list.replaceChildren(issue429CompactEmpty('Ingen lokale hendelser venter på sending.'));
      return;
    }
    list.replaceChildren(...offline.map(issue429OfflineRow));
  };

  function issue429AdminItems() {
    const userCount = state.users.filter((user) => user.active !== false).length;
    const teamCount = state.teams.filter((team) => team.active !== false).length;
    const openIncidents = state.incidents.filter((incident) => !['resolved', 'archived'].includes(incident.status)).length;
    return [
      { tab: 'arrangement', icon: 'event', title: 'Arrangement', text: activeEventName(), meta: 'Aktivt oppsett og arrangementvalg', tone: 'info' },
      { tab: 'team', icon: 'team', title: 'Team', text: `${teamCount} aktive team`, meta: 'Liste, oppretting og redigering', tone: 'ok' },
      { tab: 'users', icon: 'user', title: 'Brukere', text: `${userCount} aktive brukere`, meta: 'Medlemmer, roller og PIN', tone: 'info' },
      { tab: 'import', icon: 'import', title: 'Import', text: 'Medlemsimport', meta: 'Valider og importer XLSX', tone: 'neutral' },
      { tab: 'push', icon: 'push', title: 'Varsler', text: state.push?.enabled ? 'Push aktiv' : 'Pushstatus', meta: 'Diagnose og testvarsler', tone: state.push?.enabled ? 'ok' : 'warning' },
      { tab: 'incidents', icon: 'event', title: 'Hendelsesvalg', text: `${openIncidents} åpne hendelser`, meta: 'Valg og sortering', tone: openIncidents ? 'warning' : 'ok' },
      { tab: 'export', icon: 'export', title: 'Eksport', text: 'CSV og JSON', meta: 'Last ned operativt datagrunnlag', tone: 'neutral' },
    ];
  }

  function issue429AdminRow(item) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'issue429-row issue429-admin-row';
    row.dataset.tone = item.tone;
    row.dataset.adminTab = item.tab;
    row.setAttribute('aria-label', `Åpne adminvalg ${item.title}`);
    row.addEventListener('click', () => {
      state.adminTab = item.tab;
      window.arrangementsvaktIssue270?.sync?.();
      document.querySelector(`[data-admin-tab-panel="${item.tab}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    const icon = document.createElement('span');
    icon.className = 'issue429-row-icon';
    icon.append(issue429Icon(item.icon));
    const main = document.createElement('span');
    main.className = 'issue429-row-main';
    const title = document.createElement('strong');
    title.textContent = item.title;
    const preview = document.createElement('span');
    preview.className = 'issue429-preview';
    preview.textContent = item.text;
    const meta = document.createElement('span');
    meta.className = 'issue429-meta';
    meta.textContent = item.meta;
    main.append(title, preview, meta);
    const side = document.createElement('span');
    side.className = 'issue429-row-side';
    side.append(issue429Chip('Åpne', item.tone));
    row.append(icon, main, side);
    return row;
  }

  function issue429SyncAdmin() {
    const panel = $('#adminPanel');
    const heading = $('#adminPanel .admin-heading');
    if (!panel || !heading) return;
    panel.dataset.issue429Surface = 'admin';
    let hub = $('#issue429AdminHub');
    if (!hub) {
      hub = document.createElement('section');
      hub.id = 'issue429AdminHub';
      hub.className = 'issue429-admin-hub';
      hub.setAttribute('aria-label', 'Adminvalg');
      heading.after(hub);
    }
    hub.replaceChildren(...issue429AdminItems().map(issue429AdminRow));

    const nav = $('#issue270AdminTabNav');
    if (nav && nav.previousElementSibling !== hub) hub.after(nav);

    $$('#adminPanel details').forEach((details) => {
      if (details.dataset.issue429Bound === 'true') return;
      details.dataset.issue429Bound = 'true';
      details.open = false;
    });
  }

  renderShell = function issue429RenderShell() {
    baseRenderShell();
    issue429SyncAdmin();
  };

  if (state.user) {
    renderOverview();
    renderOffline();
    issue429SyncAdmin();
  }

  window.arrangementsvaktIssue429 = { version: issue429Version, syncAdmin: issue429SyncAdmin };
})();
