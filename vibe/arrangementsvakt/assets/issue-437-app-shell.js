(() => {
  const issue437Version = 'v0.16.21-issue-511-topbar-low-text-2026-06-30';
  const baseTabPanelId = tabPanelId;
  const baseRenderShell = renderShell;

  const mainTabs = [
    { id: 'overview', label: 'Oversikt', icon: 'overview' },
    { id: 'chat', label: 'Meldinger', icon: 'message' },
    { id: 'incidents', label: 'Hendelser', icon: 'incident' },
    { id: 'teams', label: 'Grupper', icon: 'team' },
  ];

  function canSeeAdminAction(user = state.user) {
    return !!user && (isLeadershipUser(user) || isPrimaryLeader(user));
  }

  function shellTabs() {
    if (!state.user) return [];
    return [
      ...mainTabs,
      ...(canSeeAdminAction() ? [{ id: 'admin', label: 'Admin', icon: 'admin' }] : []),
    ];
  }

  roleTabs = function issue437RoleTabs() {
    return shellTabs();
  };

  normalizeActiveTab = function issue437NormalizeActiveTab() {
    const tabs = shellTabs();
    if (!tabs.some((tab) => tab.id === state.activeTab)) {
      state.activeTab = 'overview';
    }
  };

  tabPanelId = function issue437TabPanelId(tabId) {
    if (tabId === 'admin' && canSeeAdminAction()) return 'admin';
    return baseTabPanelId(tabId);
  };

  function activeTabLabel() {
    if (state.activeTab === 'admin') return 'Admin';
    return mainTabs.find((tab) => tab.id === state.activeTab)?.label || 'Oversikt';
  }

  function openAdminPanel() {
    if (!canSeeAdminAction()) return;
    state.activeTab = 'admin';
    renderShell();
  }

  function logoutCurrentUser() {
    $('#logoutButton')?.click();
  }

  function createShellButton({ className, label, text, onClick, hidden = false }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.classList.toggle('hidden', hidden);
    button.addEventListener('click', onClick);
    return button;
  }

  function hideOperativeTestModeText() {
    $('#testModeBanner')?.classList.add('hidden');
    const statusPanel = $('#statusPanel');
    const testLoginMessageVisible = !!state.user
      && state.testMode
      && /^Testinnlogging ok\. Testmodus er aktiv/.test(statusPanel?.textContent || '');
    if (statusPanel && testLoginMessageVisible) {
      statusPanel.textContent = '';
      statusPanel.classList.add('hidden');
    }
  }

  function ensureAppShell() {
    const appView = $('#appView');
    if (!appView || !state.user) return null;
    let shell = $('#issue437AppShell');
    if (shell) return shell;

    shell = document.createElement('header');
    shell.id = 'issue437AppShell';
    shell.className = 'issue437-app-shell';
    shell.setAttribute('aria-label', 'App-toppfelt');
    shell.innerHTML = `
      <div class="issue437-shell-top">
        <div class="issue437-shell-brand" aria-hidden="true">AV</div>
        <div class="issue437-shell-title">
          <p class="eyebrow"></p>
          <h1></h1>
          <p class="issue437-shell-meta"></p>
        </div>
        <span class="issue437-shell-role-chip"></span>
        <div class="issue437-shell-actions" aria-label="Toppvalg"></div>
      </div>
      <label class="issue437-shell-search">
        <span class="issue437-shell-search-mark" aria-hidden="true"></span>
        <input class="issue437-shell-search-input" type="search" autocomplete="off" aria-label="Søk team, melding eller hendelse" placeholder="Søk">
      </label>
    `;

    appView.prepend(shell);
    return shell;
  }

  function syncAppShell() {
    const shell = ensureAppShell();
    document.body?.toggleAttribute('data-issue437-shell', !!state.user);
    if (!shell) return;
    $('#adminShortcutButton')?.classList.add('hidden');

    const roleText = displayRoleLabel(state.user);
    const userName = state.user?.displayName || state.user?.fullName || '';
    $('.issue437-shell-brand', shell).textContent = 'AV';
    $('.issue437-shell-title .eyebrow', shell).textContent = activeTabLabel();
    $('.issue437-shell-title h1', shell).textContent = 'Arrangementsvakt';
    $('.issue437-shell-meta', shell).textContent = [activeEventName(), userName].filter(Boolean).join(' · ');
    const roleChip = $('.issue437-shell-role-chip', shell);
    if (roleChip) {
      roleChip.textContent = roleText;
      roleChip.setAttribute('aria-label', `Rolle: ${roleText}`);
    }

    const searchInput = $('.issue437-shell-search-input', shell);
    if (searchInput && searchInput.value !== (state.issue391HomeSearch || '')) {
      searchInput.value = state.issue391HomeSearch || '';
    }
    if (searchInput) {
      searchInput.oninput = (event) => {
        state.issue391HomeSearch = event.target.value;
        if (state.activeTab === 'overview') renderOverviewRows();
      };
    }

    const actions = $('.issue437-shell-actions', shell);
    actions.replaceChildren(
      createShellButton({
        className: 'issue437-shell-action issue437-shell-action-admin',
        label: 'Åpne admin',
        text: 'A',
        hidden: !canSeeAdminAction(),
        onClick: openAdminPanel,
      }),
      createShellButton({
        className: 'issue437-shell-logout',
        label: 'Logg ut gjeldende bruker',
        text: 'Logg ut',
        onClick: logoutCurrentUser,
      }),
    );
  }

  renderBottomNav = function issue437RenderBottomNav() {
    const nav = $('#bottomNav');
    if (!nav) return;
    nav.replaceChildren(...mainTabs.map((tab) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bottom-nav-button';
      button.dataset.icon = tab.icon;
      const badge = tab.id === 'chat' ? state.messageUnreadCount : (tab.id === 'incidents' ? priorityIncidentCount() : 0);
      button.textContent = badge > 0 ? `${tab.label} (${badge})` : tab.label;
      button.setAttribute('aria-label', tab.label);
      button.setAttribute('aria-current', tab.id === state.activeTab ? 'page' : 'false');
      button.addEventListener('click', () => {
        state.activeTab = tab.id;
        renderShell();
      });
      return button;
    }));
  };

  renderShell = function issue437RenderShell() {
    baseRenderShell();
    hideOperativeTestModeText();
    if (!state.user) {
      $('#issue437AppShell')?.remove();
      document.body?.removeAttribute('data-issue437-shell');
      return;
    }
    syncAppShell();
    renderBottomNav();
    renderTabPanels();
    renderFloatingIncidentButton();
    hideOperativeTestModeText();
  };

  function loadIssue438OverviewAssets() {
    const version = 'v0.16.7-issue-465-ui-cleanup-2026-06-27';
    if (!document.querySelector('link[data-issue438-overview]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = `assets/issue-438-prioritized-overview.css?v=${version}`;
      css.dataset.issue438Overview = 'true';
      document.head.append(css);
    }
    if (!window.arrangementsvaktIssue438 && !document.querySelector('script[data-issue438-overview]')) {
      const script = document.createElement('script');
      script.src = `assets/issue-438-prioritized-overview.js?v=${version}`;
      script.defer = true;
      script.dataset.issue438Overview = 'true';
      document.head.append(script);
    }
  }

  function loadIssue427MessageAssets() {
    const version = 'v0.16.8-issue-467-message-wcag-2026-06-27';
    if (!document.querySelector('link[data-issue427-messages]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = `assets/issue-427-messages-chat-thread.css?v=${version}`;
      css.dataset.issue427Messages = 'true';
      document.head.append(css);
    }
    if (!window.arrangementsvaktIssue427 && !document.querySelector('script[data-issue427-messages]')) {
      const script = document.createElement('script');
      script.src = `assets/issue-427-messages-chat-thread.js?v=${version}`;
      script.defer = true;
      script.dataset.issue427Messages = 'true';
      document.head.append(script);
    }
  }

  function loadIssue440IncidentAssets() {
    const version = 'v0.15.9-issue-450-low-text-2026-06-26';
    if (!document.querySelector('link[data-issue440-incidents]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = `assets/issue-440-incident-case-list.css?v=${version}`;
      css.dataset.issue440Incidents = 'true';
      document.head.append(css);
    }
    if (!window.arrangementsvaktIssue440 && !document.querySelector('script[data-issue440-incidents]')) {
      const script = document.createElement('script');
      script.src = `assets/issue-440-incident-case-list.js?v=${version}`;
      script.defer = true;
      script.dataset.issue440Incidents = 'true';
      document.head.append(script);
    }
  }

  function loadIssue441TeamAssets() {
    const version = 'v0.16.0-issue-450-low-text-2026-06-26';
    if (!document.querySelector('link[data-issue441-teams]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = `assets/issue-441-team-role-overview.css?v=${version}`;
      css.dataset.issue441Teams = 'true';
      document.head.append(css);
    }
    if (!window.arrangementsvaktIssue441 && !document.querySelector('script[data-issue441-teams]')) {
      const script = document.createElement('script');
      script.src = `assets/issue-441-team-role-overview.js?v=${version}`;
      script.defer = true;
      script.dataset.issue441Teams = 'true';
      document.head.append(script);
    }
  }

  function loadIssue494IconAssets() {
    const version = 'v0.16.20-issue-509-qa-restpoints-2026-06-30';
    if (!document.querySelector('link[data-issue494-icons]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = `assets/issue-494-svg-icons.css?v=${version}`;
      css.dataset.issue494Icons = 'true';
      document.head.append(css);
    }
    if (!window.arrangementsvaktIssue494 && !document.querySelector('script[data-issue494-icons]')) {
      const script = document.createElement('script');
      script.src = `assets/issue-494-svg-icons.js?v=${version}`;
      script.defer = true;
      script.dataset.issue494Icons = 'true';
      document.head.append(script);
    }
  }

  function loadIssue497FabAssets() {
    const version = 'v0.16.17-issue-497-consistent-fab-2026-06-29';
    if (!document.querySelector('link[data-issue497-fab]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = `assets/issue-497-consistent-fab.css?v=${version}`;
      css.dataset.issue497Fab = 'true';
      document.head.append(css);
    }
    if (!window.arrangementsvaktIssue497 && !document.querySelector('script[data-issue497-fab]')) {
      const script = document.createElement('script');
      script.src = `assets/issue-497-consistent-fab.js?v=${version}`;
      script.defer = true;
      script.dataset.issue497Fab = 'true';
      document.head.append(script);
    }
  }

  loadIssue438OverviewAssets();
  loadIssue427MessageAssets();
  loadIssue440IncidentAssets();
  loadIssue441TeamAssets();
  loadIssue494IconAssets();
  loadIssue497FabAssets();

  window.arrangementsvaktIssue437 = { version: issue437Version, canSeeAdminAction };
})();
