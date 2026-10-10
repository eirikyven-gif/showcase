(() => {
  const issue426Version = 'v0.14.4-issue-426-home-inbox-feed-2026-06-23';
  state.issue426HomeSearch = state.issue426HomeSearch || state.issue391HomeSearch || '';

  function text(value) {
    return safeText(value).trim();
  }

  function timeValue(value) {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
  }

  function shortTime(value) {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' });
  }

  function fullTime(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('no-NO');
  }

  function isOpenIncident(incident) {
    return !['resolved', 'archived'].includes(incident.status);
  }

  function itemSearchText(item) {
    return [item.kind, item.label, item.title, item.preview, item.meta].map(text).join(' ').toLowerCase();
  }

  function readinessItems() {
    if (!state.user) return [];
    const items = [];
    const standalone = window.navigator.standalone === true
      || window.matchMedia?.('(display-mode: standalone)').matches
      || window.matchMedia?.('(display-mode: fullscreen)').matches;
    if (!standalone) {
      items.push({ label: 'Installer app', tone: 'warning', title: 'Installer app for best drift', preview: 'Teknisk QA kan fortsette i nettleser.', action: () => $('#openInstallGuideButton')?.click() });
    }
    if (!state.push?.enabled) {
      const tone = state.push?.needsServerKey || state.push?.hasPublicKey === false ? 'critical' : 'warning';
      items.push({ label: 'Varsler', tone, title: tone === 'critical' ? 'Varslingsoppsett mangler' : 'Slå på varsler', preview: 'Feed og badges fungerer som fallback.', action: () => $('#pushToggleButton')?.click() });
    }
    return items;
  }

  function statusChips() {
    const critical = state.incidents.filter((incident) => isOpenIncident(incident) && ['critical', 'urgent'].includes(incident.severity)).length;
    const unread = state.messageUnreadCount || state.messages.filter((message) => message.read === false).length;
    const working = state.incidents.filter((incident) => isOpenIncident(incident) && incident.status === 'working').length;
    const offline = offlineIncidents().length;
    return [
      ...(state.testMode ? [{ label: 'Testmodus', tone: 'warning' }] : []),
      { label: state.push?.enabled ? 'Push aktiv' : 'Push av', tone: state.push?.enabled ? 'ok' : 'warning' },
      { label: `${critical} viktige`, tone: critical ? 'critical' : 'ok' },
      { label: `${unread} uleste`, tone: unread ? 'info' : 'ok' },
      { label: `${working} under arbeid`, tone: working ? 'warning' : 'ok' },
      { label: `${offline} ikke sendt`, tone: offline ? 'warning' : 'ok' },
    ];
  }

  function incidentTone(incident) {
    if (incident.escalatedToRaceLead || incident.severity === 'critical') return 'critical';
    if (incident.severity === 'urgent') return 'warning';
    if (incident.status === 'working') return 'info';
    return 'neutral';
  }

  function incidentItem(incident, rank, label) {
    const comments = incident.comments?.length || 0;
    const images = incident.imageRefs?.length || 0;
    return {
      kind: 'incident',
      rank,
      at: timeValue(incident.updatedAt || incident.createdAt),
      tone: incidentTone(incident),
      label,
      title: incident.title || 'Hendelse uten tittel',
      preview: incident.description || incident.location || 'Ingen beskrivelse.',
      meta: [teamNames(incident.teamIds || []), incident.location, comments ? `${comments} kommentarer` : '', images ? `${images} bilder` : ''].filter(Boolean).join(' · '),
      time: shortTime(incident.updatedAt || incident.createdAt),
      action: () => openDetailModal('incident', incident.id),
    };
  }

  function messageItem(message, rank, label = null) {
    const isBroadcast = message.type === 'broadcast';
    return {
      kind: isBroadcast ? 'broadcast' : 'message',
      rank,
      at: timeValue(message.createdAt),
      tone: message.read === false ? 'info' : (isBroadcast ? 'warning' : 'neutral'),
      label: label || (isBroadcast ? 'Fellesmelding' : 'Ny melding'),
      title: messageTypeLabel(message),
      preview: text(message.body).slice(0, 120) || 'Tom melding',
      meta: [message.senderName || 'Ukjent avsender', message.teamName || '', message.read === false ? 'Ulest' : 'Lest'].filter(Boolean).join(' · '),
      time: shortTime(message.createdAt),
      action: () => openDetailModal('message', message.id),
    };
  }

  function teamStatusItems() {
    return getAllowedTeams().map((team) => {
      const teamIncidents = state.incidents.filter((incident) => isOpenIncident(incident) && (incident.teamIds || []).includes(team.id));
      const working = teamIncidents.filter((incident) => incident.status === 'working').length;
      const urgent = teamIncidents.filter((incident) => ['critical', 'urgent'].includes(incident.severity) || incident.escalatedToRaceLead).length;
      const memberCount = state.users.filter((user) => user.active !== false && (user.teamIds || []).includes(team.id)).length;
      if (!teamIncidents.length && memberCount > 0) return null;
      return {
        kind: 'team',
        rank: urgent ? 72 : 52,
        at: Math.max(...teamIncidents.map((incident) => timeValue(incident.updatedAt || incident.createdAt)), 0),
        tone: urgent ? 'warning' : 'neutral',
        label: 'Teamstatus',
        title: team.name || 'Team',
        preview: teamIncidents.length ? `${teamIncidents.length} åpne saker${working ? `, ${working} under arbeid` : ''}` : 'Ingen registrerte medlemmer i aktivt team.',
        meta: `${memberCount} medlemmer`,
        time: '',
        action: () => openDetailModal('team', team.id),
      };
    }).filter(Boolean);
  }

  function offlineItems() {
    return offlineIncidents().map((incident) => ({
      kind: 'offline',
      rank: 78,
      at: timeValue(incident.savedAt),
      tone: 'warning',
      label: 'Ikke sendt',
      title: incident.title || 'Hendelse lagret lokalt',
      preview: incident.description || 'Hendelsen ligger i lokal kø.',
      meta: incident.savedAt ? `Lagret ${fullTime(incident.savedAt)}` : 'Lagret lokalt',
      time: shortTime(incident.savedAt),
      action: () => { state.activeTab = 'offline'; renderShell(); },
    }));
  }

  function feedItems() {
    const items = [];
    const usedIncidents = new Set();
    const usedMessages = new Set();
    readinessItems().forEach((item) => items.push({ ...item, kind: 'readiness', rank: item.tone === 'critical' ? 96 : 76, at: Date.now(), meta: 'Bruksklarstatus', time: '' }));
    state.incidents
      .filter((incident) => isOpenIncident(incident) && (incident.escalatedToRaceLead || ['critical', 'urgent'].includes(incident.severity)))
      .forEach((incident) => {
        usedIncidents.add(incident.id);
        items.push(incidentItem(incident, incident.severity === 'critical' || incident.escalatedToRaceLead ? 100 : 90, incident.escalatedToRaceLead ? 'Hevet' : (severityLabels[incident.severity] || 'Viktig')));
      });
    state.messages.filter((message) => message.read === false || message.type === 'broadcast').forEach((message) => {
      usedMessages.add(message.id);
      items.push(messageItem(message, message.read === false ? 84 : 74));
    });
    offlineItems().forEach((item) => items.push(item));
    teamStatusItems().forEach((item) => items.push(item));
    state.incidents.filter((incident) => isOpenIncident(incident) && !usedIncidents.has(incident.id)).forEach((incident) => {
      items.push(incidentItem(incident, incident.status === 'working' ? 68 : 58, incident.status === 'working' ? 'Åpent behov' : (statusLabels[incident.status] || 'Hendelse')));
    });
    state.messages.filter((message) => !usedMessages.has(message.id)).slice(0, 4).forEach((message) => items.push(messageItem(message, 38, 'Siste melding')));
    return items.sort((a, b) => b.rank - a.rank || b.at - a.at).slice(0, 14);
  }

  function chip({ label, tone }) {
    const element = document.createElement('span');
    element.className = 'issue426-chip';
    element.dataset.tone = tone || 'neutral';
    element.textContent = label;
    return element;
  }

  function header() {
    const root = document.createElement('header');
    root.className = 'issue426-header';
    const mark = document.createElement('span');
    mark.className = 'issue426-mark';
    mark.textContent = 'A';
    mark.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div');
    copy.className = 'issue426-title';
    copy.innerHTML = '<p class="eyebrow">Arrangementsvakt</p><h2>Hjem</h2><p></p>';
    $('p:last-child', copy).textContent = [activeEventName(), displayRoleLabel(state.user), state.user?.displayName || state.user?.fullName].filter(Boolean).join(' · ');
    root.append(mark, copy);
    return root;
  }

  function searchBox() {
    const label = document.createElement('label');
    label.className = 'issue426-search';
    label.innerHTML = '<span>Søk</span>';
    const input = document.createElement('input');
    input.type = 'search';
    input.autocomplete = 'off';
    input.placeholder = 'Søk i innboksen';
    input.value = state.issue426HomeSearch || '';
    input.addEventListener('input', (event) => {
      state.issue426HomeSearch = event.target.value;
      state.issue391HomeSearch = event.target.value;
      renderOverviewRows();
    });
    label.append(input);
    return { label, input };
  }

  function row(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue426-feed-row';
    button.dataset.tone = item.tone || 'neutral';
    button.dataset.kind = item.kind || 'item';
    button.setAttribute('aria-label', `${item.label}: ${item.title}`);
    button.addEventListener('click', item.action);
    const main = document.createElement('span');
    main.className = 'issue426-row-main';
    const top = document.createElement('span');
    top.className = 'issue426-row-top';
    top.append(chip({ label: item.label, tone: item.tone }), Object.assign(document.createElement('small'), { textContent: item.time || '' }));
    const title = document.createElement('strong');
    title.textContent = item.title;
    const preview = document.createElement('span');
    preview.className = 'issue426-row-preview';
    preview.textContent = item.preview;
    const meta = document.createElement('small');
    meta.className = 'issue426-row-meta';
    meta.textContent = item.meta;
    main.append(top, title, preview, meta);
    button.append(main);
    return button;
  }

  function syncHomePanel() {
    const panel = $('.overview-panel');
    if (!panel) return;
    panel.dataset.issue391Home = 'true';
    panel.dataset.issue426Home = 'true';
  }

  renderOverviewRows = function issue426RenderOverviewRows() {
    const list = $('#overviewRows');
    if (!list) return;
    const activeElement = document.activeElement;
    const restoreSearchFocus = activeElement?.matches?.('.issue426-search input') === true;
    const selectionStart = restoreSearchFocus ? activeElement.selectionStart : null;
    const selectionEnd = restoreSearchFocus ? activeElement.selectionEnd : null;
    syncHomePanel();
    list.className = 'issue426-home-root';
    const chips = document.createElement('div');
    chips.className = 'issue426-chip-rail';
    chips.setAttribute('aria-label', 'Operativ status');
    chips.replaceChildren(...statusChips().map(chip));
    const heading = document.createElement('div');
    heading.className = 'issue426-feed-heading';
    heading.innerHTML = '<div><p class="eyebrow">Prioritert innboks</p><h3>Det som må håndteres nå</h3></div>';
    const { label: search, input } = searchBox();
    const query = text(state.issue426HomeSearch).toLowerCase();
    const items = feedItems().filter((item) => !query || itemSearchText(item).includes(query));
    const count = document.createElement('span');
    count.className = 'issue426-feed-count';
    count.textContent = `${items.length} saker`;
    heading.append(count);
    const feed = document.createElement('section');
    feed.className = 'issue426-feed';
    feed.setAttribute('aria-label', 'Prioritert feed');
    feed.replaceChildren(...(items.length ? items.map(row) : [emptyState(query ? 'Ingen saker matcher søket.' : 'Innboksen er tom akkurat nå.')]));
    list.replaceChildren(header(), chips, heading, feed, search);
    if (restoreSearchFocus) {
      input.focus({ preventScroll: true });
      try {
        if (selectionStart !== null && selectionEnd !== null) input.setSelectionRange(selectionStart, selectionEnd);
      } catch (_) {}
    }
  };

  if (state.user && state.activeTab === 'overview') renderOverviewRows();
  window.arrangementsvaktIssue426 = { version: issue426Version };
})();
