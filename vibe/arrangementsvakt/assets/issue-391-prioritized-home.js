(() => {
  const issue391Version = 'v0.14.2-issue-414-prototype-prioritized-home-2026-06-22';
  const baseRoleTabs = roleTabs;
  const baseTabPanelId = tabPanelId;
  const baseRenderTabPanels = renderTabPanels;
  const baseRenderShell = renderShell;
  const baseRenderOverviewRows = renderOverviewRows;
  const baseRenderBottomNav = renderBottomNav;

  state.issue391HomeSearch = state.issue391HomeSearch || '';

  function issue391TabRank(tab) {
    const order = ['overview', 'incidents', 'chat', 'teams', 'offline', 'admin'];
    const index = order.indexOf(tab.id);
    return index === -1 ? 99 : index;
  }

  function issue391TabOrder(tabs) {
    return [...tabs].sort((a, b) => issue391TabRank(a) - issue391TabRank(b));
  }

  roleTabs = function issue391RoleTabs() {
    if (!state.user) return [];
    const tabs = baseRoleTabs().filter((tab) => tab.id !== 'overview');
    return issue391TabOrder([
      { id: 'overview', label: 'Hjem' },
      ...tabs,
    ]);
  };

  normalizeActiveTab = function issue391NormalizeActiveTab() {
    const tabs = roleTabs();
    if (!tabs.some((tab) => tab.id === state.activeTab)) {
      state.activeTab = tabs[0]?.id || 'overview';
    }
  };

  tabPanelId = function issue391TabPanelId(tabId) {
    if (tabId === 'overview') return 'overview';
    return baseTabPanelId(tabId);
  };

  function issue391IsStandaloneMode() {
    return window.navigator.standalone === true
      || window.matchMedia?.('(display-mode: standalone)').matches
      || window.matchMedia?.('(display-mode: fullscreen)').matches;
  }

  function issue391PushStatus() {
    if (!state.user) return { label: 'Varsler ukjent', tone: 'warning' };
    if (state.push?.enabled) return { label: 'Varsler på', tone: 'ok' };
    if (!pushApiSupported()) return { label: 'Varsler ikke støttet', tone: 'warning' };
    if (Notification.permission === 'denied') return { label: 'Varsler blokkert', tone: 'critical' };
    if (state.push?.needsServerKey || state.push?.hasPublicKey === false) return { label: 'Varslingsoppsett mangler', tone: 'critical' };
    return { label: 'Varsler må slås på', tone: 'warning' };
  }

  function issue391InstallStatus() {
    return issue391IsStandaloneMode()
      ? { label: 'Hjem-skjerm', tone: 'ok' }
      : { label: 'Installer app', tone: 'warning' };
  }

  function issue391ReadinessModel() {
    const install = issue391InstallStatus();
    const push = issue391PushStatus();
    const blocking = [install, push].find((item) => item.tone === 'critical') || null;
    const warning = [install, push].find((item) => item.tone === 'warning') || null;

    if (blocking) {
      return {
        tone: 'critical',
        eyebrow: 'Krever handling',
        title: blocking.label,
        text: 'Sjekk oppsettet før ordinær operativ bruk. Kritiske avvik vises fortsatt tydelig i egne statusfelt.',
        chip: blocking,
      };
    }

    if (warning) {
      return {
        tone: 'warning',
        eyebrow: 'Bruksklar',
        title: warning.label,
        text: warning.label === 'Installer app'
          ? 'Åpne fra Hjem-skjerm for mest appaktig bruk. Teknisk QA kan fortsatt fortsette i nettleser.'
          : 'Varsler bør slås på før operativ bruk. Feed og badge fungerer fortsatt som fallback.',
        chip: warning,
      };
    }

    return {
      tone: 'ok',
      eyebrow: 'Bruksklar',
      title: 'Klar for operativ bruk',
      text: '',
      chip: { label: 'App + varsler', tone: 'ok' },
    };
  }

  function issue391IsOpenIncident(incident) {
    return !['resolved', 'archived'].includes(incident.status);
  }

  function issue391IncidentTone(incident) {
    if (incident.escalatedToRaceLead || incident.severity === 'critical') return 'critical';
    if (incident.severity === 'urgent') return 'warning';
    if (incident.status === 'working') return 'info';
    return 'neutral';
  }

  function issue391Time(value) {
    if (!value) return 'Ukjent tid';
    return new Date(value).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
  }

  function issue391DateValue(value) {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
  }

  function issue391MessageTitle(message) {
    return messageTypeLabel(message);
  }

  function issue391MessagePreview(message) {
    return safeText(message.body).trim().slice(0, 120) || 'Tom melding';
  }

  function issue391SearchText(item) {
    return [item.kind, item.type, item.title, item.text, item.meta, item.label].map(safeText).join(' ').toLowerCase();
  }

  function issue391StatusChips() {
    const criticalCount = state.incidents.filter((incident) => issue391IsOpenIncident(incident) && ['critical', 'urgent'].includes(incident.severity)).length;
    const openNeeds = state.incidents.filter((incident) => issue391IsOpenIncident(incident) && incident.status === 'working').length;
    const offlineCount = offlineIncidents().length;
    const unreadCount = state.messageUnreadCount || state.messages.filter((message) => message.read === false).length;
    const install = issue391InstallStatus();
    const push = issue391PushStatus();
    const chips = [
      ...(state.testMode ? [{ label: 'Testmodus', tone: 'warning' }] : []),
      ...(install.tone === 'ok' && push.tone === 'ok'
        ? [{ label: 'App + varsler', tone: 'ok' }]
        : [install, push]),
      { label: `${criticalCount} viktige`, tone: criticalCount ? 'critical' : 'ok' },
      { label: `${unreadCount} uleste`, tone: unreadCount ? 'info' : 'ok' },
      { label: `${openNeeds} åpne`, tone: openNeeds ? 'warning' : 'ok' },
      { label: `${offlineCount} ikke sendt`, tone: offlineCount ? 'warning' : 'ok' },
    ];
    return chips;
  }

  function issue391IncidentFeedItem(incident, rank, label) {
    const comments = incident.comments?.length || 0;
    const images = incident.imageRefs?.length || 0;
    return {
      id: `incident-${incident.id}`,
      kind: 'incident',
      rank,
      at: issue391DateValue(incident.updatedAt || incident.createdAt),
      tone: issue391IncidentTone(incident),
      label,
      title: incident.title || 'Hendelse uten tittel',
      text: incident.description || incident.location || 'Ingen beskrivelse.',
      meta: [teamNames(incident.teamIds || []), incident.location || '', `${comments} kommentarer`, images ? `${images} bilder` : ''].filter(Boolean).join(' · '),
      time: issue391Time(incident.updatedAt || incident.createdAt),
      onClick: () => openDetailModal('incident', incident.id),
    };
  }

  function issue391MessageFeedItem(message, rank, label = 'Ny melding') {
    return {
      id: `message-${message.id}`,
      kind: 'message',
      rank,
      at: issue391DateValue(message.createdAt),
      tone: message.read === false ? 'info' : 'neutral',
      label,
      title: issue391MessageTitle(message),
      text: issue391MessagePreview(message),
      meta: [message.senderName || 'Ukjent avsender', message.teamName || '', message.read === false ? 'Ulest' : 'Lest'].filter(Boolean).join(' · '),
      time: issue391Time(message.createdAt),
      onClick: () => openDetailModal('message', message.id),
    };
  }

  function issue391BuildFeedItems() {
    const items = [];
    const usedIncidents = new Set();
    const usedMessages = new Set();

    state.incidents
      .filter((incident) => issue391IsOpenIncident(incident) && (incident.escalatedToRaceLead || ['critical', 'urgent'].includes(incident.severity)))
      .forEach((incident) => {
        usedIncidents.add(incident.id);
        items.push(issue391IncidentFeedItem(incident, incident.severity === 'critical' || incident.escalatedToRaceLead ? 100 : 90, incident.escalatedToRaceLead ? 'Hevet' : (severityLabels[incident.severity] || 'Viktig')));
      });

    state.messages
      .filter((message) => message.read === false)
      .forEach((message) => {
        usedMessages.add(message.id);
        items.push(issue391MessageFeedItem(message, 80));
      });

    state.incidents
      .filter((incident) => issue391IsOpenIncident(incident) && !usedIncidents.has(incident.id))
      .forEach((incident) => {
        usedIncidents.add(incident.id);
        items.push(issue391IncidentFeedItem(incident, incident.status === 'working' ? 70 : 60, incident.status === 'working' ? 'Åpent behov' : (statusLabels[incident.status] || 'Hendelse')));
      });

    offlineIncidents().forEach((incident, index) => {
      items.push({
        id: `offline-${index}`,
        kind: 'offline',
        rank: 75,
        at: issue391DateValue(incident.savedAt),
        tone: 'warning',
        label: 'Ikke sendt',
        title: incident.title || 'Hendelse lagret lokalt',
        text: incident.description || 'Hendelsen ligger i lokal kø og må sendes på nytt.',
        meta: incident.savedAt ? `Lagret ${formatDateTime(incident.savedAt)}` : 'Lagret lokalt',
        time: issue391Time(incident.savedAt),
        onClick: () => { state.activeTab = 'offline'; renderShell(); },
      });
    });

    state.messages
      .filter((message) => !usedMessages.has(message.id))
      .slice(0, 4)
      .forEach((message) => items.push(issue391MessageFeedItem(message, 40, 'Siste melding')));

    state.incidents
      .filter((incident) => !usedIncidents.has(incident.id))
      .slice(0, 4)
      .forEach((incident) => items.push(issue391IncidentFeedItem(incident, 30, 'Siste aktivitet')));

    return items.sort((a, b) => b.rank - a.rank || b.at - a.at).slice(0, 12);
  }

  function issue391Chip({ label, tone }) {
    const chip = document.createElement('span');
    chip.className = 'issue391-status-chip';
    chip.dataset.tone = tone || 'neutral';
    chip.textContent = label;
    return chip;
  }

  function issue391IconAction({ label, icon, targetId, tone }) {
    const target = $(`#${targetId}`);
    if (!target) return null;
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'issue391-icon-action';
    action.dataset.tone = tone || 'neutral';
    action.textContent = icon;
    action.disabled = target.disabled;
    action.setAttribute('aria-label', label);
    action.title = label;
    action.addEventListener('click', () => target.click());
    return action;
  }

  function issue391HomeHeader() {
    const header = document.createElement('header');
    header.className = 'issue391-app-header';

    const mark = document.createElement('span');
    mark.className = 'issue391-app-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = 'A';

    const copy = document.createElement('div');
    copy.className = 'issue391-app-title';
    copy.innerHTML = '<p class="eyebrow">Arrangementsvakt</p><h2>Hjem</h2><p></p>';
    $('p:last-child', copy).textContent = [activeEventName(), displayRoleLabel(state.user), state.user?.displayName || state.user?.fullName].filter(Boolean).join(' · ');

    const actions = document.createElement('div');
    actions.className = 'issue391-app-actions';
    const push = issue391PushStatus();
    const actionItems = [
      issue391IconAction({ label: push.label, icon: 'V', targetId: 'pushToggleButton', tone: push.tone }),
      issue391IconAction({ label: 'Logg ut', icon: 'Ut', targetId: 'logoutButton' }),
    ].filter(Boolean);
    actions.replaceChildren(...actionItems);

    header.replaceChildren(mark, copy, actions);
    return header;
  }

  function issue391ReadyCard() {
    const model = issue391ReadinessModel();
    const card = document.createElement('section');
    card.className = 'issue391-ready-card';
    card.dataset.tone = model.tone;
    card.setAttribute('aria-label', model.eyebrow);

    const row = document.createElement('div');
    row.className = 'issue391-ready-row';
    const copy = document.createElement('div');
    copy.innerHTML = '<p class="eyebrow"></p><h3></h3>';
    $('.eyebrow', copy).textContent = model.eyebrow;
    $('h3', copy).textContent = model.title;
    row.append(copy, issue391Chip(model.chip));

    if (!model.text) {
      card.replaceChildren(row);
      return card;
    }

    const text = document.createElement('p');
    text.textContent = model.text;
    card.replaceChildren(row, text);
    return card;
  }

  function issue391SearchBox() {
    const label = document.createElement('label');
    label.className = 'issue391-home-search';
    label.innerHTML = '<span>Søk</span>';
    const input = document.createElement('input');
    input.type = 'search';
    input.autocomplete = 'off';
    input.placeholder = 'Søk team, melding eller hendelse';
    input.value = state.issue391HomeSearch || '';
    input.addEventListener('input', (event) => {
      state.issue391HomeSearch = event.target.value;
      renderOverviewRows();
    });
    label.append(input);
    return { label, input };
  }

  function issue391FeedCard(item) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'issue391-feed-card';
    card.dataset.tone = item.tone || 'neutral';
    card.dataset.kind = item.kind || 'item';
    card.setAttribute('aria-label', `${item.label}: ${item.title}`);
    card.addEventListener('click', item.onClick);

    const top = document.createElement('span');
    top.className = 'issue391-feed-card-top';
    top.append(issue391Chip({ label: item.label, tone: item.tone }), Object.assign(document.createElement('small'), { textContent: item.time }));

    const title = document.createElement('strong');
    title.textContent = item.title;
    const text = document.createElement('span');
    text.className = 'issue391-feed-card-text';
    text.textContent = item.text;
    const meta = document.createElement('small');
    meta.className = 'issue391-feed-card-meta';
    meta.textContent = item.meta;

    card.replaceChildren(top, title, text, meta);
    return card;
  }

  function issue391SyncHomeHead() {
    const panel = $('.overview-panel');
    if (!panel) return;
    panel.dataset.issue391Home = 'true';
    const title = $('.panel-head h2', panel);
    const lead = $('.panel-head p', panel);
    if (title) title.textContent = 'Hjem';
    if (lead) lead.textContent = 'Prioritert feed for operativ bruk.';
  }

  renderOverviewRows = function issue391RenderOverviewRows() {
    const list = $('#overviewRows');
    if (!list) return;
    const activeElement = document.activeElement;
    const restoreSearchFocus = activeElement?.matches?.('.issue391-home-search input') === true;
    const selectionStart = restoreSearchFocus ? activeElement.selectionStart : null;
    const selectionEnd = restoreSearchFocus ? activeElement.selectionEnd : null;
    issue391SyncHomeHead();
    list.className = 'issue391-home-root';

    const chips = document.createElement('div');
    chips.className = 'issue391-status-rail';
    chips.setAttribute('aria-label', 'Operativ status');
    chips.replaceChildren(...issue391StatusChips().map(issue391Chip));

    const { label: search, input } = issue391SearchBox();

    const heading = document.createElement('div');
    heading.className = 'issue391-feed-heading';
    heading.innerHTML = '<div><p class="eyebrow">Krever handling</p><h3>Prioritert feed</h3></div>';
    const count = document.createElement('span');
    count.className = 'issue391-feed-count';

    const query = safeText(state.issue391HomeSearch).trim().toLowerCase();
    const feedItems = issue391BuildFeedItems().filter((item) => !query || issue391SearchText(item).includes(query));
    count.textContent = `${feedItems.length} saker`;
    heading.append(count);

    const feed = document.createElement('section');
    feed.className = 'issue391-feed-stack';
    feed.setAttribute('aria-label', 'Prioritert feed');
    if (!feedItems.length) {
      feed.replaceChildren(emptyState(query ? 'Ingen saker matcher søket.' : 'Ingen kritiske hendelser, uleste meldinger eller åpne behov nå.'));
    } else {
      feed.replaceChildren(...feedItems.map(issue391FeedCard));
    }

    list.replaceChildren(issue391HomeHeader(), issue391ReadyCard(), chips, search, heading, feed);

    if (restoreSearchFocus) {
      input.focus({ preventScroll: true });
      try {
        if (selectionStart !== null && selectionEnd !== null) {
          input.setSelectionRange(selectionStart, selectionEnd);
        }
      } catch (_) {
        // Some mobile browsers do not allow restoring selection on search inputs.
      }
    }
  };

  renderBottomNav = function issue391RenderBottomNav() {
    baseRenderBottomNav();
    $$('#bottomNav .bottom-nav-button').forEach((button) => {
      const text = button.textContent || '';
      if (text.startsWith('Hjem')) button.dataset.icon = 'home';
      if (text.startsWith('Hendelser')) button.dataset.icon = 'incident';
      if (text.startsWith('Meldinger') || text.startsWith('Chat')) button.dataset.icon = 'message';
      if (text.startsWith('Team') || text.startsWith('Mine team')) button.dataset.icon = 'team';
      if (text.startsWith('Ikke sendt')) button.dataset.icon = 'offline';
      if (text.startsWith('Admin')) button.dataset.icon = 'admin';
    });
  };

  renderTabPanels = function issue391RenderTabPanels() {
    if (state.activeTab === 'overview') {
      $$('[data-tab-panel]').forEach((panel) => {
        const active = panel.dataset.tabPanel === 'overview';
        panel.classList.toggle('hidden', !active);
        panel.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      return;
    }
    baseRenderTabPanels();
  };

  function issue414ApplyPrototypeHomeChrome() {
    const compactHome = !!state.user && state.activeTab === 'overview';
    $('#appView')?.toggleAttribute('data-issue412-home', compactHome);
    document.body?.toggleAttribute('data-issue414-home', compactHome);
    $('#testModeChip')?.classList.toggle('hidden', compactHome || !state.testMode);
    $('#testModeBanner')?.classList.toggle('hidden', compactHome || !state.testMode);
  }

  renderShell = function issue391RenderShell() {
    const requestedTab = state.activeTab;
    const defaultedHome = !!state.user && !requestedTab;
    if (defaultedHome) state.activeTab = 'overview';
    baseRenderShell();
    if (!state.user) {
      document.body?.removeAttribute('data-issue414-home');
      return;
    }
    issue414ApplyPrototypeHomeChrome();
    if (requestedTab === 'overview' || defaultedHome) state.activeTab = 'overview';
    if (!roleTabs().some((tab) => tab.id === state.activeTab)) state.activeTab = 'overview';
    renderOverviewRows();
    renderBottomNav();
    renderTabPanels();
    renderFloatingIncidentButton();
    issue414ApplyPrototypeHomeChrome();
  };

  window.addEventListener('hashchange', () => {
    if (state.user && window.location.hash.replace(/^#/, '') === 'overview') {
      state.activeTab = 'overview';
      renderShell();
    }
  });

  window.arrangementsvaktIssue391 = { version: issue391Version };
})();
