(() => {
  const issue441Version = 'v0.16.0-issue-441-team-role-overview-2026-06-26';
  const baseRenderOverview = renderOverview;
  const baseRenderShell = renderShell;

  function text(value) {
    return String(value ?? '').trim();
  }

  function timestamp(value) {
    const time = new Date(text(value)).getTime();
    return Number.isFinite(time) ? time : 0;
  }

  function displayTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const sameDay = date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate();
    if (sameDay) return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function ownTeamIds() {
    if (!state.user) return new Set();
    const userId = text(state.user.id);
    const ids = new Set((state.user.teamIds || []).map(String));
    state.teams
      .filter((team) => userId && (team.leaderIds || []).map(String).includes(userId))
      .forEach((team) => ids.add(String(team.id)));
    return ids;
  }

  function issue441AllowedTeams() {
    const own = ownTeamIds();
    return [...getAllowedTeams()].sort((a, b) => {
      const ownBucket = Number(!own.has(String(a.id))) - Number(!own.has(String(b.id)));
      if (ownBucket) return ownBucket;
      return text(a.name).localeCompare(text(b.name), 'nb');
    });
  }

  function teamMembers(team) {
    return state.users.filter((user) => user.active !== false && (user.teamIds || []).map(String).includes(String(team.id)));
  }

  function teamIncidents(team) {
    return state.incidents.filter((incident) => (incident.teamIds || []).map(String).includes(String(team.id)));
  }

  function openIncidents(team) {
    return teamIncidents(team).filter((incident) => !['resolved', 'archived'].includes(incident.status));
  }

  function messageTeamIds(message) {
    const ids = [];
    if (message.teamId) ids.push(message.teamId);
    if (Array.isArray(message.teamIds)) ids.push(...message.teamIds);
    if (Array.isArray(message.targetTeamIds)) ids.push(...message.targetTeamIds);
    if (message.targetType === 'teams' && Array.isArray(message.targetIds)) ids.push(...message.targetIds);
    return ids.map(String).filter(Boolean);
  }

  function unreadMessages(team) {
    const teamId = String(team.id);
    const controlled = (state.messages || []).filter((message) => (
      message.read === false && messageTeamIds(message).includes(teamId)
    ));
    const threads = (state.threadChat?.threads || []).filter((thread) => (
      String(thread.teamId || '') === teamId
      && (thread.read === false || thread.unread === true || Number(thread.unreadCount) > 0)
    ));
    return controlled.length + threads.length;
  }

  function threadComments(threadId) {
    const id = text(threadId);
    return (state.threadChat?.comments || [])
      .filter((comment) => text(comment.threadId) === id)
      .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt));
  }

  function teamThreadActivity(team) {
    const teamId = String(team.id);
    const threads = (state.threadChat?.threads || []).filter((thread) => String(thread.teamId || '') === teamId);
    return threads.map((thread) => {
      const latest = threadComments(thread.id)[0];
      return {
        title: latest?.body || thread.title || thread.body,
        at: latest?.createdAt || thread.updatedAt || thread.createdAt,
      };
    }).sort((a, b) => timestamp(b.at) - timestamp(a.at))[0] || null;
  }

  function latestActivity(team) {
    const incidents = teamIncidents(team).map((incident) => ({
      title: incident.title || incident.description || incident.location,
      at: incident.updatedAt || incident.createdAt,
    }));
    const messages = (state.messages || [])
      .filter((message) => messageTeamIds(message).includes(String(team.id)))
      .map((message) => ({ title: message.body, at: message.createdAt }));
    const thread = teamThreadActivity(team);
    return [...incidents, ...messages, ...(thread ? [thread] : [])]
      .sort((a, b) => timestamp(b.at) - timestamp(a.at))[0] || null;
  }

  function teamTone(team) {
    const open = openIncidents(team);
    if (open.some((incident) => incident.escalatedToRaceLead || incident.severity === 'critical')) return 'critical';
    if (open.some((incident) => incident.severity === 'urgent' || incident.status === 'new')) return 'warning';
    if (team.active === false) return 'archived';
    if (open.length) return 'working';
    return 'ok';
  }

  function issue441TeamRow(team) {
    const members = teamMembers(team).length;
    const open = openIncidents(team).length;
    const unread = unreadMessages(team);
    const latest = latestActivity(team);
    const status = team.active === false ? 'Inaktiv' : (open ? `${open} åpne saker` : 'Rolig');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue441-team-row';
    button.dataset.tone = teamTone(team);
    button.dataset.own = ownTeamIds().has(String(team.id)) ? 'true' : 'false';
    button.setAttribute('aria-label', `Åpne team ${team.name}. ${status}. ${members} medlemmer.`);
    button.addEventListener('click', () => openDetailModal('team', team.id));
    button.innerHTML = `
      <span class="issue441-team-marker" aria-hidden="true"></span>
      <span class="issue441-team-main">
        <span class="issue441-team-top">
          <strong></strong>
          <span class="issue441-team-time"></span>
        </span>
        <span class="issue441-team-text"></span>
        <span class="issue441-team-meta"></span>
      </span>
      <span class="issue441-team-status">
        <span class="issue441-team-label"></span>
        <span class="issue441-team-sub"></span>
      </span>
    `;
    $('.issue441-team-marker', button).textContent = text(team.name).charAt(0).toUpperCase() || 'T';
    $('.issue441-team-top strong', button).textContent = team.name || 'Gruppe uten navn';
    $('.issue441-team-time', button).textContent = displayTime(latest?.at);
    $('.issue441-team-text', button).textContent = [`${members} medlemmer`, status, unread ? `${unread} ulest` : ''].filter(Boolean).join(' · ');
    $('.issue441-team-meta', button).textContent = '';
    $('.issue441-team-meta', button).classList.add('hidden');
    $('.issue441-team-label', button).textContent = status;
    $('.issue441-team-sub', button).textContent = ownTeamIds().has(String(team.id)) ? 'Eget' : '';
    return button;
  }

  function visibleContactUsers() {
    const search = text($('#memberSearchInput')?.value).toLowerCase();
    const allowedIds = new Set(issue441AllowedTeams().map((team) => String(team.id)));
    const users = state.users.filter((user) => (
      user.active !== false
      && (isLeadershipUser() || (user.teamIds || []).some((id) => allowedIds.has(String(id))))
    ));
    if (!search) return users;
    return users.filter((user) => [
      user.displayName,
      user.fullName,
      user.phone,
      displayRoleLabel(user),
      teamNames(user.teamIds || []),
    ].map(text).join(' ').toLowerCase().includes(search));
  }

  function contactRow(user) {
    const name = user.displayName || user.fullName || 'Ukjent medlem';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue441-contact-row';
    button.setAttribute('aria-label', `Åpne medlem ${name}`);
    button.addEventListener('click', () => openDetailModal('user', user.id));
    button.innerHTML = `
      <span class="issue441-contact-marker" aria-hidden="true"></span>
      <span class="issue441-contact-main">
        <strong></strong>
        <span></span>
      </span>
      <span class="issue441-contact-role"></span>
    `;
    $('.issue441-contact-marker', button).textContent = text(name).charAt(0).toUpperCase() || 'M';
    $('.issue441-contact-main strong', button).textContent = name;
    $('.issue441-contact-main span', button).textContent = teamNames(user.teamIds || []);
    $('.issue441-contact-role', button).textContent = displayRoleLabel(user);
    return button;
  }

  function renderTeamSurface() {
    const panel = $('#teamPanel');
    const teamOverview = $('#teamOverview');
    if (!panel || !teamOverview) return;
    panel.dataset.issue441Teams = 'true';
    $('#teamPanelTitle').textContent = isLeadershipUser() ? 'Grupper' : 'Mine grupper';
    $('#teamPanelEyebrow').textContent = isLeadershipUser() ? 'Gruppestatus' : 'Egne grupper';

    const teams = issue441AllowedTeams();
    teamOverview.className = 'compact-list issue441-team-list';
    if (!teams.length) {
      teamOverview.replaceChildren(emptyState('Ingen grupper er tilgjengelige for denne rollen ennå.'));
    } else {
      teamOverview.replaceChildren(...teams.map(issue441TeamRow));
    }

    const memberBlock = $('#memberOverviewBlock');
    const userOverview = $('#userOverview');
    if (!memberBlock || !userOverview) return;
    const showContacts = !isLeadershipUser();
    memberBlock.classList.toggle('hidden', !showContacts);
    if (!showContacts) return;
    $('#memberOverviewTitle').textContent = 'Kontakter';
    userOverview.className = 'compact-list issue441-contact-list';
    const contacts = visibleContactUsers();
    if (!contacts.length) {
      userOverview.replaceChildren(emptyState('Ingen relevante medlemmer å vise.'));
      return;
    }
    userOverview.replaceChildren(...contacts.map(contactRow));
  }

  renderOverview = function issue441RenderOverview() {
    baseRenderOverview();
    renderTeamSurface();
  };

  renderShell = function issue441RenderShell() {
    baseRenderShell();
    if (state.user && state.activeTab === 'teams') renderTeamSurface();
  };

  $('#memberSearchInput')?.addEventListener('input', () => {
    if (state.user && state.activeTab === 'teams') renderTeamSurface();
  });

  if (state.user && state.activeTab === 'teams') renderTeamSurface();

  window.arrangementsvaktIssue441 = { version: issue441Version };
})();