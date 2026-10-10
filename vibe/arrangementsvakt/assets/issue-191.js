(function () {
  state.memberSearchQuery = state.memberSearchQuery || '';

  function userDisplayName(user) {
    return safeText(user?.displayName || user?.fullName).trim() || 'Uten navn';
  }

  function userPhone(user) {
    return safeText(user?.phone).trim();
  }

  function phoneDigits(value) {
    return safeText(value).replace(/\D/g, '');
  }

  function phoneHref(value) {
    const phone = userPhone({ phone: value });
    if (!phone) return '';
    const compact = phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
    return phoneDigits(compact).length >= 3 ? `tel:${compact}` : '';
  }

  function normalizedSearchText(value) {
    return safeText(value).toLocaleLowerCase('nb-NO');
  }

  function visibleUsersForDirectory() {
    if (!state.user) return [];
    const users = Array.isArray(state.users) ? state.users : [];
    if ((typeof isLeadershipUser === 'function' ? isLeadershipUser(state.user) : state.user.role === 'raceLead')) return users;

    const visibleTeamIds = new Set((state.teams || []).map((team) => team.id).filter(Boolean));
    if (!visibleTeamIds.size) {
      return users.filter((user) => user.id === state.user.id);
    }

    return users.filter((user) => user.id === state.user.id
      || (user.teamIds || []).some((teamId) => visibleTeamIds.has(teamId)));
  }

  function userMatchesSearch(user, query) {
    const trimmed = safeText(query).trim();
    if (!trimmed) return true;
    const haystack = normalizedSearchText([
      user.fullName,
      user.displayName,
      user.phone,
      phoneDigits(user.phone),
      user.role,
      roleLabels[user.role],
      teamNames(user.teamIds || []),
    ].filter(Boolean).join(' '));
    const normalizedQuery = normalizedSearchText(trimmed);
    const queryDigits = phoneDigits(trimmed);
    return haystack.includes(normalizedQuery)
      || (queryDigits !== '' && phoneDigits(user.phone).includes(queryDigits));
  }

  function memberDirectoryTitle() {
    if ((typeof isLeadershipUser === 'function' ? isLeadershipUser(state.user) : state.user?.role === 'raceLead')) return 'Alle brukere';
    if (state.user?.role === 'teamLead') return 'Medlemmer i mine team';
    return 'Medlemmer i mine team';
  }

  function shouldShowMemberDirectory() {
    if (!state.user) return false;
    if ((typeof isLeadershipUser === 'function' ? isLeadershipUser(state.user) : state.user.role === 'raceLead')) return state.activeTab === 'teams';
    if (state.user.role === 'teamLead') return state.activeTab === 'members';
    return state.activeTab === 'teams';
  }

  function memberRow(user) {
    const name = userDisplayName(user);
    const phone = userPhone(user);
    const meta = [
      { text: (typeof displayRoleLabel === 'function' ? displayRoleLabel(user) : ((typeof displayRoleLabel === 'function' ? displayRoleLabel(user) : (roleLabels[user.role] || user.role)) || 'Ukjent rolle')) },
      { text: teamNames(user.teamIds || []) },
    ];
    if (phone) meta.push({ text: phone });
    meta.push({ text: user.active === false ? 'Inaktiv' : 'Aktiv', tone: user.active === false ? 'archived' : 'ok' });

    return structuredRow({
      title: name,
      eyebrow: user.fullName !== name ? user.fullName : 'Bruker',
      meta,
      foot: phone ? `Telefon: ${phone}` : 'Telefonnummer ikke registrert',
      ariaLabel: `Åpne bruker ${name}`,
      onClick: () => openDetailModal('user', user.id),
      markerTone: user.active === false ? 'archived' : 'info',
    });
  }

  function renderMemberDirectory() {
    const block = $('#memberOverviewBlock');
    const title = $('#memberOverviewTitle');
    const input = $('#memberSearchInput');
    const list = $('#userOverview');
    if (!block || !title || !list) return;

    const show = shouldShowMemberDirectory();
    block.classList.toggle('hidden', !show);
    if (!show) return;

    title.textContent = memberDirectoryTitle();
    if (input && input.value !== state.memberSearchQuery) {
      input.value = state.memberSearchQuery;
    }

    const visibleUsers = visibleUsersForDirectory();
    const filteredUsers = visibleUsers.filter((user) => userMatchesSearch(user, state.memberSearchQuery));
    if (!filteredUsers.length) {
      list.replaceChildren(emptyState(state.memberSearchQuery
        ? 'Ingen medlemmer treffer søket.'
        : 'Ingen medlemmer er tilgjengelige for denne rollen ennå.'));
      return;
    }
    list.replaceChildren(...filteredUsers.map(memberRow));
  }

  function createPhoneLine(phone) {
    const line = document.createElement('p');
    line.className = 'detail-description user-phone-line';
    line.append('Telefon: ');
    const href = phoneHref(phone);
    if (href) {
      const link = document.createElement('a');
      link.className = 'phone-link';
      link.href = href;
      link.textContent = phone;
      line.append(link);
    } else {
      const fallback = document.createElement('span');
      fallback.className = 'phone-muted';
      fallback.textContent = 'Telefonnummer ikke registrert';
      line.append(fallback);
    }
    return line;
  }

  function renderUserPhoneDetail() {
    const user = state.users.find((item) => item.id === state.detailModal.id);
    const stack = $('#detailDialogBody .detail-stack');
    if (!user || !stack || $('.user-phone-line', stack)) return;
    const fullName = $('.detail-description', stack);
    const line = createPhoneLine(userPhone(user));
    if (fullName) {
      fullName.after(line);
    } else {
      stack.prepend(line);
    }
  }

  function incidentTitleForTeamDetail(incident) {
    return safeText(incident?.severityMeta?.name || incident?.title).trim() || 'Hendelse uten tittel';
  }

  function renderTeamDetailWithPhone() {
    const team = state.teams.find((item) => item.id === state.detailModal.id);
    if (!team) return;
    const title = $('#detailDialogTitle');
    const eyebrow = $('#detailDialogEyebrow');
    const body = $('#detailDialogBody');
    eyebrow.textContent = 'Team';
    title.textContent = team.name;

    const members = visibleUsersForDirectory().filter((user) => (user.teamIds || []).includes(team.id));
    const teamIncidents = state.incidents.filter((incident) => (incident.teamIds || []).includes(team.id));
    const detail = document.createElement('div');
    detail.className = 'detail-stack';

    const description = document.createElement('p');
    description.className = 'detail-description';
    description.textContent = team.description || 'Ingen beskrivelse.';
    const count = document.createElement('p');
    count.className = 'detail-counts';
    count.textContent = `${members.length} brukere · ${team.active === false ? 'inaktiv' : 'aktiv'}`;
    const leaders = document.createElement('p');
    leaders.className = 'detail-counts';
    leaders.textContent = `Teamleder: ${teamLeaderNames(team)}`;

    const memberTitle = document.createElement('h3');
    memberTitle.textContent = 'Medlemmer';
    const memberList = document.createElement('div');
    memberList.className = 'compact-list';
    memberList.replaceChildren(...(members.length
      ? members.map(memberRow)
      : [emptyState('Ingen brukere er knyttet til dette teamet ennå.')]));

    const incidentTitle = document.createElement('h3');
    incidentTitle.textContent = 'Hendelser';
    const incidentList = document.createElement('div');
    incidentList.className = 'compact-list';
    if (!teamIncidents.length) {
      incidentList.replaceChildren(emptyState('Ingen aktive hendelser for dette teamet.'));
    } else {
      incidentList.replaceChildren(...teamIncidents.map((incident) => {
        const displayTitle = incidentTitleForTeamDetail(incident);
        return structuredRow({
          title: displayTitle,
          eyebrow: incident.location || 'Uten sted',
          meta: incidentMetaItems(incident).map(({ text, tone }) => ({ text, tone })),
          foot: formatDateTime(incident.createdAt),
          ariaLabel: `Åpne hendelse ${displayTitle}`,
          onClick: () => openDetailModal('incident', incident.id),
          markerTone: incident.escalatedToRaceLead ? 'warning' : (incident.severityMeta?.tone || incident.severity),
        });
      }));
    }

    detail.replaceChildren(description, count, leaders, memberTitle, memberList, incidentTitle, incidentList);
    body.replaceChildren(detail);
  }

  const issue191RenderShellBase = renderShell;
  renderShell = function patchedIssue191RenderShell() {
    issue191RenderShellBase();
    renderMemberDirectory();
  };

  const issue191RenderDetailModalBase = renderDetailModal;
  renderDetailModal = function patchedIssue191RenderDetailModal() {
    issue191RenderDetailModalBase();
    if (state.detailModal.type === 'team') renderTeamDetailWithPhone();
    if (state.detailModal.type === 'user') renderUserPhoneDetail();
  };

  document.addEventListener('input', (event) => {
    if (event.target?.id !== 'memberSearchInput') return;
    state.memberSearchQuery = event.target.value;
    renderMemberDirectory();
  });
}());
