(() => {
  const issue270Version = 'v0.12.1-issue-282-hotfix-2026-06-09';
  const severityObserverState = { observer: null, list: null, syncing: false };

  function issue270IsLeadership(user = state.user) {
    return !!user && (
      user.role === 'raceLead'
      || user.role === 'leadership'
      || user.isLeadership === true
      || user.isPrimaryLeader === true
    );
  }

  function issue270IsPrimaryLeader(user = state.user) {
    return !!user && (user.role === 'raceLead' || user.isPrimaryLeader === true);
  }

  const baseRoleTabs = roleTabs;
  roleTabs = function issue270RoleTabs() {
    if (!state.user) return [];
    if (issue270IsLeadership()) {
      return [
        { id: 'incidents', label: 'Hendelser' },
        { id: 'overview', label: 'Oversikt' },
        { id: 'teams', label: 'Team' },
        { id: 'chat', label: 'Meldinger' },
        ...(issue270IsPrimaryLeader() ? [{ id: 'admin', label: 'Admin' }] : []),
      ];
    }
    if (state.user.role === 'teamLead') {
      return [
        { id: 'incidents', label: 'Hendelser' },
        { id: 'overview', label: 'Oversikt' },
        { id: 'teams', label: 'Mine team' },
        { id: 'chat', label: 'Meldinger' },
        { id: 'members', label: 'Medlemmer', shortLabel: 'Medl.' },
      ];
    }
    return baseRoleTabs();
  };

  function issue270AdminTabs() {
    return [
      { id: 'arrangement', label: 'Arrangement', selector: '#adminEventTitle' },
      { id: 'team', label: 'Team', selector: '#adminTeamTitle' },
      { id: 'users', label: 'Brukere', selector: '#adminUserTitle' },
      { id: 'import', label: 'Import', selector: '#adminImportTitle' },
      { id: 'push', label: 'Push', selector: '#adminPushTitle' },
      { id: 'incidents', label: 'Hendelser', sectionSelector: '#severityAdminSection' },
      { id: 'export', label: 'Eksport', selector: '#adminExportTitle' },
    ];
  }

  function issue270AdminSection(tab) {
    if (tab.sectionSelector) return $(tab.sectionSelector);
    const title = $(tab.selector);
    return title?.closest('.admin-section') || null;
  }

  function issue270VisibleAdminTabs() {
    return issue270AdminTabs()
      .map((tab) => ({ ...tab, section: issue270AdminSection(tab) }))
      .filter((tab) => tab.section);
  }

  function issue270EnsureAdminNav() {
    const panel = $('#adminPanel');
    const heading = $('#adminPanel .admin-heading');
    if (!panel || !heading) return null;
    let nav = $('#issue270AdminTabNav');
    if (nav) return nav;
    nav = document.createElement('div');
    nav.id = 'issue270AdminTabNav';
    nav.className = 'issue270-admin-tab-nav';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Adminfaner');
    heading.after(nav);
    return nav;
  }

  function issue270NormalizeAdminTab(tabs) {
    state.adminTab = state.adminTab || 'arrangement';
    if (!tabs.some((tab) => tab.id === state.adminTab)) {
      state.adminTab = tabs[0]?.id || 'arrangement';
    }
  }

  function issue270CloseInactiveDetails(section) {
    $$('details[open]', section).forEach((details) => {
      details.open = false;
    });
  }

  function issue270SyncAdminTabs() {
    const panel = $('#adminPanel');
    if (!panel || !issue270IsPrimaryLeader()) return;
    const tabs = issue270VisibleAdminTabs();
    issue270NormalizeAdminTab(tabs);
    const nav = issue270EnsureAdminNav();
    if (!nav) return;

    nav.replaceChildren(...tabs.map((tab) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = `issue270AdminTab-${tab.id}`;
      button.className = 'issue270-admin-tab-button';
      button.dataset.adminTab = tab.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', tab.id === state.adminTab ? 'true' : 'false');
      button.textContent = tab.label;
      button.addEventListener('click', () => {
        if (state.adminTab === tab.id) return;
        state.adminTab = tab.id;
        issue270SyncAdminTabs();
      });
      return button;
    }));

    tabs.forEach((tab) => {
      const active = tab.id === state.adminTab;
      tab.section.classList.add('issue270-admin-tab-panel');
      tab.section.dataset.adminTabPanel = tab.id;
      tab.section.hidden = !active;
      tab.section.setAttribute('aria-hidden', active ? 'false' : 'true');
      tab.section.setAttribute('aria-labelledby', `issue270AdminTab-${tab.id}`);
      if (!active) issue270CloseInactiveDetails(tab.section);
    });
  }

  function issue270SetFirstTextNode(element, text) {
    if (!element) return;
    const firstText = [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
    if (firstText) {
      firstText.textContent = text;
    } else {
      element.prepend(document.createTextNode(text));
    }
  }

  function issue270SyncSeverityLabels() {
    const section = $('#severityAdminSection');
    if (!section) return;
    section.dataset.issue270Enhanced = 'true';
    const eyebrow = $('.eyebrow', section);
    if (eyebrow) eyebrow.textContent = '';
    const title = $('#adminSeverityTitle') || $('.section-heading h3', section);
    if (title) {
      title.id = 'adminSeverityTitle';
      title.textContent = 'Hendelsesvalg';
    }
    const newButton = $('#newSeverityButton');
    if (newButton) newButton.textContent = 'Nytt hendelsesvalg';
    const summary = $('.severity-create-details > summary', section);
    if (summary) issue270SetFirstTextNode(summary, 'Nytt eller rediger hendelsesvalg');

    const formTitle = $('[data-severity-form-title]', section);
    if (formTitle) {
      formTitle.textContent = formTitle.textContent
        .replace('Ny alvorlighetsgrad', 'Nytt hendelsesvalg')
        .replace('Rediger alvorlighetsgrad', 'Rediger hendelsesvalg');
    }
    const submit = $('[data-severity-submit]', section);
    if (submit) {
      submit.textContent = submit.textContent
        .replace('Opprett alvorlighetsgrad', 'Opprett hendelsesvalg')
        .replace('Lagre alvorlighetsgrad', 'Lagre hendelsesvalg');
    }
  }

  function issue270ChipText(node, prefix) {
    return String(node?.textContent || '').trim().toLowerCase().startsWith(prefix);
  }

  function issue270EnhanceSeverityRow(row) {
    if (row.dataset.issue270Card === 'true') return;
    const main = $('.row-main', row);
    const meta = $('.row-meta', row);
    const actions = $('.severity-actions', row);
    const title = $('strong', main);
    const description = $('small', main);
    if (!main || !meta || !actions || !title || !description) return;

    row.dataset.issue270Card = 'true';
    row.classList.add('issue270-severity-card');

    const header = document.createElement('div');
    header.className = 'issue270-severity-card-header';
    const titleWrap = document.createElement('div');
    titleWrap.className = 'issue270-severity-title';
    titleWrap.append(title);

    const sortChip = [...meta.children].find((chip) => issue270ChipText(chip, 'sort '));
    if (sortChip) sortChip.classList.add('issue270-sort-chip');
    header.append(titleWrap);
    if (sortChip) header.append(sortChip);

    const body = document.createElement('div');
    body.className = 'issue270-severity-card-body';
    description.classList.add('issue270-severity-description');
    body.append(description, meta);

    const footer = document.createElement('div');
    footer.className = 'issue270-severity-card-footer';
    footer.append(actions);

    row.replaceChildren(header, body, footer);
  }

  function issue270SyncSeverityCards() {
    const list = $('#severityAdminList');
    if (!list || severityObserverState.syncing) return;
    severityObserverState.syncing = true;
    try {
      issue270SyncSeverityLabels();
      $('.severity-table-head', list)?.classList.add('issue270-hidden-table-head');
      $$('.severity-row', list).forEach(issue270EnhanceSeverityRow);
    } finally {
      severityObserverState.syncing = false;
    }
  }

  function issue270EnsureSeverityObserver() {
    const list = $('#severityAdminList');
    if (!list || severityObserverState.list === list) return;
    severityObserverState.observer?.disconnect();
    severityObserverState.list = list;
    severityObserverState.observer = new MutationObserver(() => {
      window.queueMicrotask(issue270SyncSeverityCards);
    });
    severityObserverState.observer.observe(list, { childList: true });
  }

  function issue270BindSeverityLabelRefresh() {
    const section = $('#severityAdminSection');
    if (!section || section.dataset.issue270Bound === 'true') return;
    section.dataset.issue270Bound = 'true';
    section.addEventListener('click', () => {
      window.setTimeout(() => {
        issue270SyncSeverityLabels();
        issue270SyncSeverityCards();
      }, 0);
    }, true);
  }

  function issue270RefreshMessages(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (state.chatMode === 'teamchat' && window.__arrangementsvaktIssue239?.refreshThreadChat) {
      window.__arrangementsvaktIssue239.refreshThreadChat({ render: true, announce: true });
      return;
    }
    refreshData();
  }

  function issue270SyncMessageRefresh() {
    const button = $('#refreshMessagesButton');
    if (!button) return;
    if (button.dataset.issue270Bound !== 'true') {
      button.dataset.issue270Bound = 'true';
      button.addEventListener('click', issue270RefreshMessages, true);
    }
    const teamChatActive = state.chatMode === 'teamchat';
    button.textContent = teamChatActive ? 'Oppdater teamchat' : 'Oppdater fellesmeldinger';
    button.setAttribute('aria-label', button.textContent);
    button.dataset.issue270RefreshScope = teamChatActive ? 'teamchat' : 'messages';
    button.classList.toggle('hidden', state.activeTab !== 'chat');

    const threadRefresh = $('#refreshThreadChatButton');
    if (threadRefresh) {
      threadRefresh.classList.add('issue270-duplicate-refresh');
      threadRefresh.setAttribute('aria-hidden', 'true');
      threadRefresh.tabIndex = -1;
    }
  }

  function issue270SyncAll() {
    issue270SyncMessageRefresh();
    issue270SyncSeverityLabels();
    issue270EnsureSeverityObserver();
    issue270SyncSeverityCards();
    issue270BindSeverityLabelRefresh();
    issue270SyncAdminTabs();
  }

  const baseRenderMessages = renderMessages;
  renderMessages = function issue270RenderMessages() {
    baseRenderMessages();
    issue270SyncMessageRefresh();
  };

  const baseRenderShell = renderShell;
  renderShell = function issue270RenderShell() {
    baseRenderShell();
    issue270SyncAll();
  };

  window.arrangementsvaktIssue270 = {
    version: issue270Version,
    sync: issue270SyncAll,
  };

  issue270SyncAll();
})();
