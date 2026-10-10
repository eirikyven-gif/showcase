(function () {
  const teamSeedOrder = ['support', 'watch', 'secretariat'];
  const errorMessages = {
    api_error: 'Serveren svarte med en feil. Prøv igjen.',
    archive_requires_race_lead: 'Bare Løpsleder kan arkivere hendelser.',
    forbidden: 'Du har ikke tilgang til denne handlingen.',
    incident_not_found: 'Hendelsen finnes ikke lenger.',
    incident_not_in_active_feed: 'Hendelsen er ikke lenger aktiv.',
    invalid_response: 'Serveren svarte uventet. Prøv igjen.',
    missing_active_event: 'Velg et aktivt arrangement først.',
    missing_allowed_team: 'Velg minst ett team du har tilgang til.',
    missing_comment: 'Skriv en kommentar først.',
    missing_name: 'Skriv inn navn.',
    missing_team: 'Velg minst ett team.',
    missing_team_name: 'Skriv inn teamnavn.',
    missing_title: 'Skriv en kort tittel.',
    not_authenticated: 'Logg inn på nytt.',
    primary_leader_already_exists: 'Det finnes allerede en øverste Leder/Løpsleder.',
    setup_locked: 'Setup er allerede låst.',
    store_locked: 'Lagring er opptatt. Prøv igjen.',
    team_not_found: 'Teamet finnes ikke lenger.',
    user_not_found: 'Brukeren finnes ikke lenger.',
  };

  function friendlyErrorMessage(error) {
    return errorMessages[error?.code || error?.message] || 'Noe gikk galt. Prøv igjen.';
  }

  api = async function patchedApi(path, options = {}) {
    return window.demoApi(path, options);
  };

  function orderedTeams(teams) {
    return [...teams].sort((a, b) => {
      const seedA = teamSeedOrder.indexOf(a.testSeedKey || '');
      const seedB = teamSeedOrder.indexOf(b.testSeedKey || '');
      const rankA = seedA === -1 ? 99 : seedA;
      const rankB = seedB === -1 ? 99 : seedB;
      return rankA - rankB
        || safeText(a.name).localeCompare(safeText(b.name), 'no')
        || safeText(a.id).localeCompare(safeText(b.id));
    });
  }

  function teamOptionLabel(team, nameCounts = null) {
    const name = team.name || 'Uten navn';
    const duplicate = nameCounts && (nameCounts.get(name) || 0) > 1;
    if (!duplicate) return name;
    const description = safeText(team.description).replace(/\.$/, '');
    return description ? `${name} - ${description}` : `${name} - ${safeText(team.id).slice(-4)}`;
  }

  function teamOptionLabels(teams) {
    const counts = new Map();
    teams.forEach((team) => counts.set(team.name || 'Uten navn', (counts.get(team.name || 'Uten navn') || 0) + 1));
    return new Map(teams.map((team) => [team.id, teamOptionLabel(team, counts)]));
  }

  function offlineIncidents() {
    try {
      const parsed = JSON.parse(localStorage.getItem(offlineKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  teamNames = function patchedTeamNames(teamIds = []) {
    return teamIds.map((id) => state.teams.find((team) => team.id === id)?.name || 'Annet team').join(', ') || 'Ingen team';
  };

  fillTeamSelects = function patchedFillTeamSelects() {
    const allowedTeams = orderedTeams(getAllowedTeams());
    const labels = teamOptionLabels(allowedTeams);
    $$('select[name="teamIds"]').forEach((select) => {
      const current = new Set([...select.selectedOptions].map((option) => option.value));
      select.replaceChildren(...allowedTeams.map((team) => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = labels.get(team.id) || team.name;
        option.selected = current.has(team.id);
        return option;
      }));
    });
  };

  roleTabs = function patchedRoleTabs() {
    if (!state.user) return [];
    if ((typeof isLeadershipUser === 'function' ? isLeadershipUser(state.user) : state.user.role === 'raceLead')) {
      return [
        { id: 'overview', label: 'Oversikt' },
        { id: 'incidents', label: 'Hendelser' },
        { id: 'teams', label: 'Team' },
        { id: 'chat', label: 'Meldinger' },
        ...(typeof isPrimaryLeader === 'function' && isPrimaryLeader(state.user) ? [{ id: 'admin', label: 'Admin' }] : []),
      ];
    }
    if (state.user.role === 'teamLead') {
      return [
        { id: 'overview', label: 'Oversikt' },
        { id: 'incidents', label: 'Hendelser' },
        { id: 'teams', label: 'Mine team' },
        { id: 'chat', label: 'Meldinger' },
        { id: 'members', label: 'Medlemmer', shortLabel: 'Medl.' },
      ];
    }
    return [
      { id: 'teams', label: 'Mine team' },
      { id: 'incidents', label: 'Hendelser' },
      { id: 'chat', label: 'Chat/Meldinger', shortLabel: 'Chat' },
      { id: 'offline', label: 'Ikke sendt' },
    ];
  };

  renderBottomNav = function patchedRenderBottomNav() {
    const nav = $('#bottomNav');
    const tabs = roleTabs();
    nav.replaceChildren(...tabs.map((tab) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bottom-nav-button';
      button.textContent = tab.shortLabel || tab.label;
      button.setAttribute('aria-label', tab.label);
      button.setAttribute('aria-current', tab.id === state.activeTab ? 'page' : 'false');
      button.addEventListener('click', () => {
        state.activeTab = tab.id;
        renderShell();
      });
      return button;
    }));
  };

  function anyDialogOpen() {
    return !!document.querySelector('dialog[open]');
  }

  function activeTabAllowsGlobalIncidentAction() {
    return roleTabs().some((tab) => tab.id === state.activeTab);
  }

  // v0.12.3-issue-289-global-meld-2026-06-09: keep the existing
  // incident registration flow, but expose the single FAB on every tab
  // the current role can open. Dialogs still hide it so it never stacks
  // over an active modal.
  renderFloatingIncidentButton = function patchedRenderFloatingIncidentButton() {
    const button = $('#openIncidentModalButton');
    if (!button) return;
    const canShow = !!state.user && activeTabAllowsGlobalIncidentAction() && !anyDialogOpen();
    button.classList.toggle('hidden', !canShow);
  };

  document.addEventListener('close', (event) => {
    if (event.target instanceof HTMLDialogElement) renderFloatingIncidentButton();
  }, true);

  const originalRenderDetailModal = renderDetailModal;
  renderDetailModal = function patchedRenderDetailModal() {
    originalRenderDetailModal();
    if (state.detailModal.type !== 'incident') return;
    const incident = state.incidents.find((item) => item.id === state.detailModal.id);
    if (incident) return;
    $('#detailDialogTitle').textContent = 'Hendelsen er lukket';
    $('#detailDialogEyebrow').textContent = 'Detaljer';
    $('#detailDialogBody').textContent = 'Hendelsen er ikke lenger i aktiv feed.';
  };

  fillChatControls = function patchedFillChatControls() {
    const teamSelect = $('[name="teamId"]', $('#teamMessageForm'));
    const allowedTeams = orderedTeams(getAllowedTeams());
    const labels = teamOptionLabels(allowedTeams);
    const current = teamSelect.value;
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Velg team';
    placeholder.disabled = true;
    placeholder.selected = !current || !allowedTeams.some((team) => team.id === current);
    teamSelect.replaceChildren(placeholder, ...allowedTeams.map((team) => {
      const option = document.createElement('option');
      option.value = team.id;
      option.textContent = labels.get(team.id) || team.name;
      option.selected = current === team.id;
      return option;
    }));

    const directForm = $('#directMessageForm');
    const directSelect = $('[name="targetUserId"]', directForm);
    const directTargets = state.messageTargets;
    directSelect.replaceChildren(...directTargets.map((user) => {
      const option = document.createElement('option');
      option.value = user.id;
      option.textContent = `${user.displayName || user.fullName} (${(typeof displayRoleLabel === 'function' ? displayRoleLabel(user) : (roleLabels[user.role] || user.role))})`;
      return option;
    }));
    directForm.classList.toggle('hidden', !state.user || (state.user.role === 'member' && !(typeof isLeadershipUser === 'function' && isLeadershipUser(state.user))) || directTargets.length === 0);
    $('#broadcastMessageForm').classList.toggle('hidden', !(typeof isLeadershipUser === 'function' ? isLeadershipUser(state.user) : state.user?.role === 'raceLead'));
    $('#teamMessageForm').classList.toggle('hidden', allowedTeams.length === 0);
  };

  renderMessages = function patchedRenderMessages() {
    fillChatControls();
    const composeDetails = $('#messageComposeDetails');
    if (composeDetails && !state.messageComposeTouched) {
      const shouldOpen = !window.matchMedia('(max-width: 760px)').matches;
      if (composeDetails.open !== shouldOpen) {
        composeDetails.dataset.autoToggle = 'true';
        composeDetails.open = shouldOpen;
      }
    }
    const list = $('#messageList');
    if (!list) return;
    if (!state.messages.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = 'Ingen meldinger ennå.';
      list.replaceChildren(empty);
      return;
    }

    list.replaceChildren(...state.messages.map((message) => {
      const created = message.createdAt ? new Date(message.createdAt).toLocaleString('no-NO') : '';
      const preview = safeText(message.body).slice(0, 96) || 'Tom melding';
      const item = structuredRow({
        className: 'compact-row message-row',
        title: messageTypeLabel(message),
        eyebrow: preview,
        meta: [
          { text: message.senderName || 'Ukjent avsender' },
          { text: created || 'Ukjent tid' },
        ],
        ariaLabel: `Åpne melding fra ${message.senderName || 'ukjent avsender'}`,
        onClick: () => openDetailModal('message', message.id),
        markerTone: message.type === 'broadcast' ? 'warning' : (message.type === 'directRaceLead' ? 'info' : 'ok'),
      });
      item.dataset.type = message.type;
      return item;
    }));
  };

  updateIncident = async function patchedUpdateIncident(id, payload) {
    const archivesIncident = payload.action === 'status' && payload.status === 'archived';
    try {
      await api('incidents.php', { method: 'POST', body: JSON.stringify({ id, ...payload }) });
      if (archivesIncident && state.detailModal.id === id) closeDetailModal();
      await refreshData();
      if (archivesIncident) setStatus('Hendelsen er arkivert.');
      return true;
    } catch (error) {
      setStatus(friendlyErrorMessage(error), 'error');
      return false;
    }
  };

  submitIncident = async function patchedSubmitIncident(payload) {
    try {
      const data = await api('incidents.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...payload }) });
      setStatus('Hendelsen er sendt.');
      await refreshData();
      return { incident: data.incident, queued: false, failed: false };
    } catch (error) {
      if (error.status) {
        setStatus(friendlyErrorMessage(error), 'error');
        return { incident: null, queued: false, failed: true };
      }
      const offline = offlineIncidents();
      offline.push({ ...payload, savedAt: new Date().toISOString() });
      localStorage.setItem(offlineKey, JSON.stringify(offline));
      setStatus('Hendelsen ble lagret lokalt som ikke sendt.', 'warning');
    }
    await refreshData();
    return { incident: null, queued: true, failed: false };
  };

  async function resetTestData() {
    if (!state.testMode) return;
    try {
      const data = await api('setup.php', { method: 'POST', body: JSON.stringify({ action: 'resetTestData' }) });
      state.user = null;
      state.teams = data.teams || [];
      state.events = data.events || [];
      state.settings = { activeEventId: data.activeEventId || null };
      state.testUsers = data.testUsers || [];
      localStorage.removeItem(offlineKey);
      setStatus('');
      renderTestModeStart();
    } catch (error) {
      setStatus(friendlyErrorMessage(error), 'error');
    }
  }

  function interceptSubmit(selector, handler) {
    const form = $(selector);
    if (!form) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      await handler(event.currentTarget, event);
    }, true);
  }

  interceptSubmit('#incidentForm', async (form) => {
    const payload = formDataObject(form);
    const file = $('[name="image"]', form).files[0];
    const result = await submitIncident(payload);
    const incident = result.incident;
    if (incident && file) {
      const body = new FormData();
      body.append('incidentId', incident.id);
      body.append('image', file);
      try {
        await api('upload.php', { method: 'POST', body });
        setStatus('Hendelsen er sendt med bilde.');
        await refreshData();
      } catch (error) {
        setStatus(friendlyErrorMessage(error), 'error');
        return;
      }
    } else if (result.queued && file) {
      setStatus('Hendelsen ble lagret lokalt uten bildevedlegg. Last opp bildet etter at hendelsen er sendt.', 'warning');
    }
    if (result.failed || (!incident && !result.queued)) return;
    form.reset();
    closeIncidentModal();
  });

  interceptSubmit('#eventForm', async (form) => {
    try {
      await api('events.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...formDataObject(form) }) });
      form.reset();
      setStatus('Arrangementet er opprettet og aktivert.');
      await refreshData();
    } catch (error) {
      setStatus(friendlyErrorMessage(error), 'error');
    }
  });

  interceptSubmit('#teamForm', async (form) => {
    try {
      await api('teams.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...formDataObject(form) }) });
      form.reset();
      setStatus('Teamet er opprettet.');
      await refreshData();
    } catch (error) {
      setStatus(friendlyErrorMessage(error), 'error');
    }
  });

  interceptSubmit('#userForm', async (form) => {
    const payload = formDataObject(form);
    if (state.user.role === 'teamLead') payload.role = 'member';
    try {
      const data = await api('users.php', { method: 'POST', body: JSON.stringify({ action: 'create', ...payload }) });
      setStatus(`Bruker opprettet. PIN vises én gang: ${data.pin}`);
      form.reset();
      await refreshData();
    } catch (error) {
      setStatus(friendlyErrorMessage(error), 'error');
    }
  });

  async function sendMessagePatched(type, payload, form) {
    try {
      await api('messages.php', { method: 'POST', body: JSON.stringify({ type, ...payload }) });
      form.reset();
      setStatus('Meldingen er sendt.');
      await refreshData();
    } catch (error) {
      setStatus(friendlyErrorMessage(error), 'error');
    }
  }

  interceptSubmit('#teamMessageForm', async (form) => {
    await sendMessagePatched('team', { teamId: $('[name="teamId"]', form).value, body: $('[name="body"]', form).value }, form);
  });
  interceptSubmit('#directMessageForm', async (form) => {
    await sendMessagePatched('directRaceLead', { targetUserId: $('[name="targetUserId"]', form).value, body: $('[name="body"]', form).value }, form);
  });
  interceptSubmit('#broadcastMessageForm', async (form) => {
    await sendMessagePatched('broadcast', { body: $('[name="body"]', form).value }, form);
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.matches('.comment-form')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const form = event.target;
      const comment = $('[name="comment"]', form).value;
      const updated = await updateIncident(state.detailModal.id, { action: 'comment', comment });
      if (updated) form.reset();
    }
    if (event.target.matches('.upload-form')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const form = event.target;
      const fileInput = $('[name="image"]', form);
      if (!fileInput.files.length) return;
      const payload = new FormData();
      payload.append('incidentId', state.detailModal.id);
      payload.append('image', fileInput.files[0]);
      try {
        await api('upload.php', { method: 'POST', body: payload });
        form.reset();
        setStatus('Bilde lastet opp.');
        await refreshData();
      } catch (error) {
        setStatus(friendlyErrorMessage(error), 'error');
      }
    }
  }, true);

  const composeDetails = $('#messageComposeDetails');
  if (composeDetails) {
    composeDetails.addEventListener('toggle', (event) => {
      if (event.currentTarget.dataset.autoToggle === 'true') {
        delete event.currentTarget.dataset.autoToggle;
        return;
      }
      state.messageComposeTouched = true;
    });
  }

  $('#resetTestDataButton')?.addEventListener('click', resetTestData);
})();

(() => {
  const issue425Version = 'v0.16.7-issue-465-red-fab-2026-06-27';

  function loadIssue425AppShell() {
    const cssHref = `assets/issue-425-app-shell.css?v=${encodeURIComponent(issue425Version)}`;
    if (!document.querySelector('link[data-issue425-app-shell="style"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      link.dataset.issue425AppShell = 'style';
      document.head.append(link);
    }

    if (document.querySelector('script[data-issue425-app-shell="script"]')) return;
    const script = document.createElement('script');
    script.src = `assets/issue-425-app-shell.js?v=${encodeURIComponent(issue425Version)}`;
    script.defer = true;
    script.dataset.issue425AppShell = 'script';
    document.head.append(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadIssue425AppShell, { once: true });
  } else {
    loadIssue425AppShell();
  }
})();
