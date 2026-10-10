(() => {
  const issue291Version = 'v0.12.4-issue-291-team-tab-overview-removal-2026-06-10';
  const legacyTabIds = new Set(['overview', 'members']);

  function issue291IsLeadership(user = state.user) {
    return !!user && (
      user.role === 'raceLead'
      || user.role === 'leadership'
      || user.isLeadership === true
      || user.isPrimaryLeader === true
    );
  }

  function issue291IsPrimaryLeader(user = state.user) {
    return !!user && (user.role === 'raceLead' || user.isPrimaryLeader === true);
  }

  function issue291TeamLookupRole(user = state.user) {
    return !!user && !issue291IsLeadership(user) && ['teamLead', 'member'].includes(user.role);
  }

  function issue291TeamTabLabel() {
    return 'Grupper';
  }

  function issue291NormalizeTabId(tabId) {
    return legacyTabIds.has(String(tabId || '')) ? 'teams' : tabId;
  }

  function issue291SanitizeLegacyTabStorage() {
    const hashTab = window.location.hash.replace(/^#/, '');
    if (legacyTabIds.has(hashTab)) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#teams`);
    }
  }

  function issue291TabOrder(tabs) {
    const wantedOrder = ['teams', 'incidents', 'chat', 'offline', 'admin'];
    return [...tabs].sort((a, b) => wantedOrder.indexOf(a.id) - wantedOrder.indexOf(b.id));
  }

  const issue291BaseRoleTabs = roleTabs;
  roleTabs = function issue291RoleTabs() {
    if (!state.user) return [];
    const baseTabs = issue291BaseRoleTabs()
      .filter((tab) => !legacyTabIds.has(tab.id))
      .map((tab) => (tab.id === 'teams' ? { ...tab, label: issue291TeamTabLabel(), shortLabel: issue291TeamTabLabel() } : tab));

    if (baseTabs.some((tab) => tab.id === 'teams')) return issue291TabOrder(baseTabs);

    if (issue291IsLeadership()) {
      return issue291TabOrder([
        { id: 'teams', label: issue291TeamTabLabel() },
        { id: 'incidents', label: 'Hendelser' },
        { id: 'chat', label: 'Meldinger' },
        ...(issue291IsPrimaryLeader() ? [{ id: 'admin', label: 'Admin' }] : []),
      ]);
    }

    return issue291TabOrder([
      { id: 'teams', label: issue291TeamTabLabel() },
      ...baseTabs,
    ]);
  };

  const issue291BaseNormalizeActiveTab = normalizeActiveTab;
  normalizeActiveTab = function issue291NormalizeActiveTab() {
    state.activeTab = issue291NormalizeTabId(state.activeTab);
    issue291SanitizeLegacyTabStorage();
    issue291BaseNormalizeActiveTab();
    if (legacyTabIds.has(state.activeTab)) state.activeTab = 'teams';
  };

  const issue291BaseTabPanelId = tabPanelId;
  tabPanelId = function issue291TabPanelId(tabId) {
    return issue291NormalizeTabId(issue291BaseTabPanelId(tabId));
  };

  function issue291UserSearchText(user) {
    return [
      user.displayName,
      user.fullName,
      user.phone,
      displayRoleLabel(user),
      teamNames(user.teamIds || []),
    ].map(safeText).join(' ').toLowerCase();
  }

  function issue291VisibleLookupUsers() {
    const search = safeText($('#memberSearchInput')?.value).trim().toLowerCase();
    const activeUsers = state.users.filter((user) => user.active !== false);
    if (!search) return activeUsers;
    return activeUsers.filter((user) => issue291UserSearchText(user).includes(search));
  }

  function issue291RenderUserLookup(userOverview) {
    const users = issue291VisibleLookupUsers();
    if (!users.length) {
      userOverview.replaceChildren(emptyState('Ingen medlemmer matcher søket.'));
      return;
    }
    userOverview.replaceChildren(...users.map((user) => {
      const name = user.displayName || user.fullName;
      return structuredRow({
        title: name,
        eyebrow: user.fullName !== name ? user.fullName : 'Medlem',
        meta: [
          { text: displayRoleLabel(user) },
          { text: teamNames(user.teamIds || []) },
        ],
        ariaLabel: `Åpne medlem ${name}`,
        onClick: () => openDetailModal('user', user.id),
        markerTone: 'info',
      });
    }));
  }

  const issue291BaseRenderOverview = renderOverview;
  renderOverview = function issue291RenderOverview() {
    issue291BaseRenderOverview();
    const userOverview = $('#userOverview');
    if (!userOverview || !issue291TeamLookupRole()) return;
    issue291RenderUserLookup(userOverview);
  };

  function issue291SyncTeamSurface() {
    state.activeTab = issue291NormalizeTabId(state.activeTab);
    $$('[data-tab-panel="overview"]').forEach((panel) => {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    });

    const memberBlock = $('#memberOverviewBlock');
    const memberTitle = $('#memberOverviewTitle');
    if (memberBlock) {
      memberBlock.classList.toggle('hidden', !(issue291TeamLookupRole() && state.activeTab === 'teams'));
    }
    if (memberTitle && issue291TeamLookupRole()) memberTitle.textContent = 'Medlemmer';
    if ($('#teamPanelTitle')) $('#teamPanelTitle').textContent = issue291IsLeadership() ? 'Grupper' : 'Mine grupper';
    if ($('#teamPanelEyebrow')) $('#teamPanelEyebrow').textContent = issue291IsLeadership() ? 'Gruppestatus' : 'Egne grupper';
    if (issue291TeamLookupRole()) renderOverview();
  }

  const issue291BaseRenderTabPanels = renderTabPanels;
  renderTabPanels = function issue291RenderTabPanels() {
    state.activeTab = issue291NormalizeTabId(state.activeTab);
    issue291BaseRenderTabPanels();
    issue291SyncTeamSurface();
  };

  const issue291BaseRenderShell = renderShell;
  renderShell = function issue291RenderShell() {
    issue291SanitizeLegacyTabStorage();
    state.activeTab = issue291NormalizeTabId(state.activeTab);
    issue291BaseRenderShell();
    issue291SyncTeamSurface();
  };

  $('#memberSearchInput')?.addEventListener('input', () => {
    if (issue291TeamLookupRole() && state.activeTab === 'teams') renderOverview();
  });

  window.addEventListener('hashchange', () => {
    issue291SanitizeLegacyTabStorage();
    if (state.user && legacyTabIds.has(state.activeTab)) {
      state.activeTab = 'teams';
      renderShell();
    }
  });

  issue291SanitizeLegacyTabStorage();
  window.arrangementsvaktIssue291 = { version: issue291Version };
})();
