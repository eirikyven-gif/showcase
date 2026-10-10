(() => {
  const issue268Version = 'v0.9.12-role-visual-cleanup-2026-06-08';
  const mobileTeamFabQuery = '(max-width: 760px)';

  function issue268Ids(ids) {
    return Array.isArray(ids) ? ids.map(String).filter(Boolean) : [];
  }

  function issue268Leadership(user = state.user) {
    return !!user && (
      user.role === 'raceLead'
      || user.role === 'leadership'
      || user.isLeadership === true
      || user.isPrimaryLeader === true
    );
  }

  function issue268PrimaryLeader(user = state.user) {
    return !!user && (user.role === 'raceLead' || user.isPrimaryLeader === true);
  }

  function issue268LedTeamIds(user = state.user, teams = state.teams) {
    const userId = String(user?.id || '');
    const ledIds = (teams || [])
      .filter((team) => userId && issue268Ids(team.leaderIds || []).includes(userId))
      .map((team) => String(team.id || ''))
      .filter(Boolean);
    return ledIds.length ? ledIds : issue268Ids(user?.teamIds || []);
  }

  function issue268AllowedTeams(user = state.user, teams = state.teams) {
    if (!user) return [];
    const activeTeams = (teams || []).filter((team) => team?.active !== false);
    if (issue268Leadership(user)) return sortTeamsForChoice(activeTeams);
    if (user.role === 'teamLead') {
      const ledIds = new Set(issue268LedTeamIds(user, activeTeams));
      return sortTeamsForChoice(activeTeams.filter((team) => ledIds.has(String(team.id || ''))));
    }
    const memberTeamIds = new Set(issue268Ids(user.teamIds || []));
    return sortTeamsForChoice(activeTeams.filter((team) => memberTeamIds.has(String(team.id || ''))));
  }

  function issue268ClearLoggedOutTopbar() {
    if (state.user) return;
    const currentUserLabel = $('#currentUserLabel');
    if (currentUserLabel) {
      currentUserLabel.textContent = '';
      currentUserLabel.classList.add('hidden');
    }
    ['pushStatusChip', 'pushToggleButton', 'pushTestButton', 'pushTestHint', 'logoutButton'].forEach((id) => {
      const element = $(`#${id}`);
      if (!element) return;
      if (id === 'pushTestHint') element.textContent = '';
      element.classList.add('hidden');
    });
    const diagnostics = $('#pushDiagnosticsPanel');
    if (diagnostics) {
      diagnostics.classList.add('hidden');
      diagnostics.replaceChildren();
    }
  }

  function issue268CompactPushTopbar() {
    if (!state.user) {
      issue268ClearLoggedOutTopbar();
      return;
    }
    const chip = $('#pushStatusChip');
    const button = $('#pushToggleButton');
    const testButton = $('#pushTestButton');
    const hint = $('#pushTestHint');
    if (!chip || !button || !testButton || !hint) return;

    const supported = typeof pushApiSupported === 'function' && pushApiSupported();
    const blocked = supported && 'Notification' in window && Notification.permission === 'denied';
    const duplicateStatus = button.textContent.trim() !== '' && button.textContent.trim() === chip.textContent.trim();
    const testUnavailable = testButton.disabled || testButton.getAttribute('aria-disabled') === 'true';

    if (blocked) {
      chip.textContent = 'Push blokkert';
      chip.dataset.tone = 'warning';
      chip.title = hint.textContent || button.title || chip.title || 'Nettleseren blokkerer push.';
      button.classList.add('hidden');
      testButton.classList.add('hidden');
      hint.classList.add('hidden');
      return;
    }

    if (duplicateStatus) {
      button.classList.add('hidden');
    }
    if (testUnavailable) {
      if (hint.textContent) chip.title = [chip.title, hint.textContent].filter(Boolean).join(' | ');
      testButton.classList.add('hidden');
      hint.classList.add('hidden');
    }
  }

  function issue268ChatAllowedIds(data = {}) {
    const responseIds = issue268Ids(data.myTeamIds || state.threadChat?.myTeamIds || []);
    if (responseIds.length) return new Set(responseIds);
    return new Set(issue268AllowedTeams().map((team) => String(team.id || '')));
  }

  function issue268FilterChatResponse(path, data) {
    if (!data || typeof data !== 'object' || !String(path).split('?')[0].endsWith('chat-threads.php')) return data;
    if (!state.user || issue268Leadership()) return data;

    const allowedIds = issue268ChatAllowedIds(data);
    const teamAllowed = (team) => allowedIds.has(String(team?.id || ''));
    const threadAllowed = (thread) => allowedIds.has(String(thread?.teamId || ''));
    const chatTeams = Array.isArray(data.chatTeams) ? data.chatTeams.filter(teamAllowed) : [];
    const chatThreads = Array.isArray(data.chatThreads) ? data.chatThreads.filter(threadAllowed) : [];
    const visibleThreadIds = new Set(chatThreads.map((thread) => String(thread.id || '')));
    const chatComments = Array.isArray(data.chatComments)
      ? data.chatComments.filter((comment) => visibleThreadIds.has(String(comment.threadId || '')))
      : [];

    let mode = data.chatFilter?.mode || (allowedIds.size ? 'mine' : 'all');
    let teamId = data.chatFilter?.teamId || '';
    if (state.user.role === 'member' && mode === 'all') {
      mode = 'mine';
      teamId = '';
    }
    if (mode === 'team' && !allowedIds.has(String(teamId))) {
      mode = allowedIds.size ? 'mine' : 'all';
      teamId = '';
    }

    return {
      ...data,
      chatTeams,
      chatThreads,
      chatComments,
      chatFilter: { ...(data.chatFilter || {}), mode, teamId },
      myTeamIds: issue268Ids(data.myTeamIds).length ? data.myTeamIds : [...allowedIds],
    };
  }

  function issue268SyncThreadChatState() {
    if (!state.user || !state.threadChat || issue268Leadership()) return;
    const allowedIds = issue268ChatAllowedIds();
    state.threadChat.teams = (state.threadChat.teams || []).filter((team) => allowedIds.has(String(team.id || '')));
    state.threadChat.threads = (state.threadChat.threads || []).filter((thread) => allowedIds.has(String(thread.teamId || '')));
    const visibleThreadIds = new Set(state.threadChat.threads.map((thread) => String(thread.id || '')));
    state.threadChat.comments = (state.threadChat.comments || []).filter((comment) => visibleThreadIds.has(String(comment.threadId || '')));
    if (state.user.role === 'member' && (!state.threadChat.filter || state.threadChat.filter === 'all')) {
      state.threadChat.filter = allowedIds.size ? 'mine' : 'all';
      state.threadChat.teamId = '';
    }
    if (state.threadChat.filter === 'team' && !allowedIds.has(String(state.threadChat.teamId || ''))) {
      state.threadChat.filter = allowedIds.size ? 'mine' : 'all';
      state.threadChat.teamId = '';
    }
  }

  function issue268SyncMessageSurface() {
    const chatPanel = $('#chatPanel');
    if (!chatPanel) return;
    $('.eyebrow', chatPanel).textContent = 'Kommunikasjon';
    $('h2', chatPanel).textContent = 'Meldinger';
    const refreshMessages = $('#refreshMessagesButton');
    if (refreshMessages) {
      refreshMessages.textContent = 'Oppdater fellesmeldinger';
      refreshMessages.classList.toggle('hidden', state.chatMode === 'teamchat');
    }
    $$('.chat-mode-button').forEach((button) => {
      if (button.dataset.chatMode === 'messages') button.firstChild.textContent = 'Fellesmeldinger';
      if (button.dataset.chatMode === 'teamchat') button.textContent = 'Teamchat';
    });
    const threadRefresh = $('#refreshThreadChatButton');
    if (threadRefresh) threadRefresh.textContent = 'Oppdater teamchat';
    $$('[data-thread-filter="all"]').forEach((button) => {
      button.classList.toggle('hidden', !!state.user && !issue268Leadership());
    });
  }

  function issue268SyncAdminShortcut() {
    const shortcut = $('#adminShortcutButton');
    if (!shortcut) return;
    const hasAdminTab = roleTabs().some((tab) => tab.id === 'admin');
    if (hasAdminTab && state.activeTab === 'teams') shortcut.classList.add('hidden');
  }

  function issue268SyncFab() {
    const button = $('#openIncidentModalButton');
    if (!button) return;
    const hideOnMobileTeam = window.matchMedia(mobileTeamFabQuery).matches && state.activeTab === 'teams';
    button.dataset.issue268MobileTeamHidden = hideOnMobileTeam ? 'true' : 'false';
    if (hideOnMobileTeam) button.classList.add('hidden');
  }

  const baseRoleTabs = roleTabs;
  roleTabs = function issue268RoleTabs() {
    if (!state.user) return [];
    if (issue268Leadership()) {
      return [
        { id: 'incidents', label: 'Hendelser' },
        { id: 'overview', label: 'Oversikt' },
        { id: 'teams', label: 'Team' },
        { id: 'chat', label: 'Meldinger' },
        ...(issue268PrimaryLeader() ? [{ id: 'admin', label: 'Admin' }] : []),
      ];
    }
    return baseRoleTabs();
  };

  getAllowedTeams = function issue268GetAllowedTeams() {
    return issue268AllowedTeams();
  };

  const baseRenderTestModeStart = renderTestModeStart;
  renderTestModeStart = function issue268RenderTestModeStart() {
    baseRenderTestModeStart();
    issue268ClearLoggedOutTopbar();
  };

  const baseRenderPushStatus = renderPushStatus;
  renderPushStatus = function issue268RenderPushStatus() {
    baseRenderPushStatus();
    issue268CompactPushTopbar();
  };

  const baseRenderFloatingIncidentButton = renderFloatingIncidentButton;
  renderFloatingIncidentButton = function issue268RenderFloatingIncidentButton() {
    baseRenderFloatingIncidentButton();
    issue268SyncFab();
  };

  const baseRenderMessages = renderMessages;
  renderMessages = function issue268RenderMessages() {
    issue268SyncThreadChatState();
    baseRenderMessages();
    issue268SyncThreadChatState();
    issue268SyncMessageSurface();
  };

  const baseRenderShell = renderShell;
  renderShell = function issue268RenderShell() {
    baseRenderShell();
    if (!state.user) {
      issue268ClearLoggedOutTopbar();
      return;
    }
    issue268CompactPushTopbar();
    issue268SyncThreadChatState();
    issue268SyncMessageSurface();
    issue268SyncAdminShortcut();
    issue268SyncFab();
  };

  const baseApi = api;
  api = async function issue268Api(path, options = {}) {
    const data = await baseApi(path, options);
    return issue268FilterChatResponse(path, data);
  };

  window.addEventListener('resize', issue268SyncFab);
  window.arrangementsvaktIssue268 = { version: issue268Version };

  if (state.user) renderShell();
  else issue268ClearLoggedOutTopbar();
})();
