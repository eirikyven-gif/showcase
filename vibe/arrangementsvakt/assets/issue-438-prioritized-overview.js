(() => {
  const issue438Version = 'v0.16.7-issue-465-ui-cleanup-2026-06-27';
  const baseRenderShell = renderShell;

  state.issue438OverviewSearch = state.issue438OverviewSearch || '';

  function text(value) {
    return String(value ?? '').trim();
  }

  function timestamp(value) {
    const time = new Date(text(value)).getTime();
    return Number.isFinite(time) ? time : 0;
  }

  function shortTime(value) {
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

  function isOpenIncident(incident) {
    return !['resolved', 'archived'].includes(incident.status);
  }

  function ownTeamIds() {
    if (!state.user) return new Set();
    const ids = new Set((state.user.teamIds || []).map(String).filter(Boolean));
    const userId = String(state.user.id || '');
    state.teams
      .filter((team) => userId && (team.leaderIds || []).map(String).includes(userId))
      .forEach((team) => ids.add(String(team.id || '')));
    return ids;
  }

  function incidentForCurrentRole(incident) {
    if (!state.user) return false;
    if (isLeadershipUser()) return true;
    const ids = ownTeamIds();
    return (incident.teamIds || []).some((id) => ids.has(String(id)));
  }

  function visibleIncidents() {
    return state.incidents.filter((incident) => incidentForCurrentRole(incident));
  }

  function priorityRank(incident) {
    if (incident.escalatedToRaceLead || incident.severity === 'critical') return 100;
    if (incident.severity === 'urgent') return 90;
    if (incident.status === 'new') return 80;
    if (incident.status === 'working') return 70;
    if (incident.severity === 'followUp') return 60;
    return 20;
  }

  function incidentTone(incident) {
    if (incident.escalatedToRaceLead || incident.severity === 'critical') return 'critical';
    if (incident.severity === 'urgent' || incident.status === 'new') return 'warning';
    if (incident.status === 'working') return 'info';
    return 'ok';
  }

  function priorityIncidents() {
    return visibleIncidents()
      .filter(isOpenIncident)
      .sort((a, b) => priorityRank(b) - priorityRank(a) || timestamp(b.updatedAt || b.createdAt) - timestamp(a.updatedAt || a.createdAt))
      .slice(0, 4);
  }

  function unreadMessages() {
    const unread = state.messages.filter((message) => message.read === false);
    const fallback = state.messages
      .filter((message) => message.read !== false)
      .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))
      .slice(0, Math.max(0, 3 - unread.length));
    return [...unread, ...fallback].slice(0, 3);
  }

  function unreadCount() {
    return state.unreadMessageCount || state.messageUnreadCount || state.messages.filter((message) => message.read === false).length;
  }

  function issue438Chip({ label, value, tone }) {
    const chip = document.createElement('span');
    chip.className = 'issue438-status-chip';
    chip.dataset.tone = tone || 'neutral';
    chip.innerHTML = '<strong></strong><span></span>';
    $('strong', chip).textContent = String(value);
    $('span', chip).textContent = label;
    return chip;
  }

  function issue438StatusChips() {
    const important = visibleIncidents()
      .filter((incident) => isOpenIncident(incident) && (incident.escalatedToRaceLead || ['critical', 'urgent'].includes(incident.severity)))
      .length;
    const unread = unreadCount();
    const queued = offlineIncidents().length;
    return [
      issue438Chip({ label: isLeadershipUser() ? 'kritisk' : 'sak', value: important, tone: important ? 'critical' : 'ok' }),
      issue438Chip({ label: 'ulest', value: unread, tone: unread ? 'info' : 'ok' }),
      issue438Chip({ label: 'kø', value: queued, tone: queued ? 'warning' : 'ok' }),
    ];
  }

  function row({ kind, title, text: body, meta, tone, label, time, onClick }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue438-row';
    button.dataset.tone = tone || 'neutral';
    button.dataset.kind = kind || 'item';
    button.setAttribute('aria-label', `${label || kind}: ${title}`);
    button.addEventListener('click', onClick);
    button.innerHTML = `
      <span class="issue438-row-icon" aria-hidden="true"></span>
      <span class="issue438-row-main">
        <span class="issue438-row-top"><strong></strong><small></small></span>
        <span class="issue438-row-text"></span>
        <span class="issue438-row-meta"></span>
      </span>
    `;
    $('.issue438-row-icon', button).textContent = label?.charAt(0)?.toUpperCase() || '•';
    $('.issue438-row-top strong', button).textContent = title;
    $('.issue438-row-top small', button).textContent = time || '';
    $('.issue438-row-text', button).textContent = body || '';
    $('.issue438-row-meta', button).textContent = meta || '';
    return button;
  }

  function incidentRow(incident) {
    const comments = incident.comments?.length || 0;
    return row({
      kind: 'incident',
      label: incident.escalatedToRaceLead ? 'Hevet' : (severityLabels[incident.severity] || 'Sak'),
      tone: incidentTone(incident),
      title: incident.title || 'Hendelse uten tittel',
      text: [teamNames(incident.teamIds || []), incident.location || 'Uten sted'].filter(Boolean).join(' · '),
      meta: '',
      time: shortTime(incident.updatedAt || incident.createdAt),
      onClick: () => openDetailModal('incident', incident.id),
    });
  }

  function messageRow(message) {
    return row({
      kind: 'message',
      label: message.read === false ? 'Ulest' : 'Siste',
      tone: message.read === false ? 'info' : 'neutral',
      title: messageTypeLabel(message),
      text: text(message.body).slice(0, 120) || 'Tom melding',
      meta: [message.senderName || 'Ukjent avsender', message.teamName || '', message.read === false ? 'Ulest' : ''].filter(Boolean).join(' · '),
      time: shortTime(message.createdAt),
      onClick: () => openDetailModal('message', message.id),
    });
  }

  function offlineRow(incident, index) {
    return row({
      kind: 'offline',
      label: 'Kø',
      tone: 'warning',
      title: incident.title || 'Hendelse lagret lokalt',
      text: incident.description || 'Ligger i lokal kø.',
      meta: incident.savedAt ? `Lagret ${formatDateTime(incident.savedAt)}` : 'Ikke sendt',
      time: shortTime(incident.savedAt),
      onClick: () => {
        state.activeTab = 'incidents';
        renderShell();
        setStatus(`Hendelse ${index + 1} ligger i lokal kø.`, 'warning');
      },
    });
  }

  function section({ eyebrow, title, count, empty, children }) {
    const block = document.createElement('section');
    block.className = 'issue438-section';
    const head = document.createElement('div');
    head.className = 'issue438-section-head';
    head.innerHTML = '<div><p class="eyebrow"></p><h2></h2></div><span></span>';
    $('.eyebrow', head).textContent = eyebrow;
    $('h2', head).textContent = title;
    $('span', head).textContent = count;
    const list = document.createElement('div');
    list.className = 'issue438-list';
    list.replaceChildren(...(children.length ? children : [emptyState(empty)]));
    block.replaceChildren(head, list);
    return block;
  }

  function openMessageFlow() {
    state.activeTab = 'chat';
    state.chatMode = state.user?.role === 'member' ? 'teamchat' : 'messages';
    renderShell();
    window.setTimeout(() => {
      $('#openThreadCreateDialogButton')?.click();
      $('#controlledMessageComposeDetails, #teamChatComposeDetails')?.setAttribute('open', '');
      $('#controlledMessageForm textarea, #teamChatForm textarea, #teamMessageForm textarea')?.focus({ preventScroll: false });
    }, 0);
  }

  function quickActions() {
    const wrap = document.createElement('section');
    wrap.className = 'issue438-quick-actions';
    const message = document.createElement('button');
    message.type = 'button';
    message.className = 'issue438-quick-action';
    message.innerHTML = '<strong>Send melding</strong><span>Team / mottakere</span>';
    message.setAttribute('aria-label', 'Send melding');
    message.addEventListener('click', openMessageFlow);
    wrap.replaceChildren(message);
    return wrap;
  }

  function renderIssue438Overview() {
    const list = $('#overviewRows');
    if (!list) return;
    const activeElement = document.activeElement;
    const restoreSearchFocus = activeElement?.matches?.('.issue437-shell-search-input, .issue438-search input') === true;
    const selectionStart = restoreSearchFocus ? activeElement.selectionStart : null;
    const selectionEnd = restoreSearchFocus ? activeElement.selectionEnd : null;
    const query = text(state.issue391HomeSearch || state.issue438OverviewSearch).toLowerCase();

    $('.overview-panel')?.setAttribute('data-issue391-home', 'true');
    list.className = 'issue438-overview';

    const incidents = priorityIncidents();
    const queued = offlineIncidents();
    const actionRows = [
      ...incidents.map(incidentRow),
      ...queued.slice(0, Math.max(0, 3 - incidents.length)).map(offlineRow),
    ];

    const messages = unreadMessages().map(messageRow);
    const searchable = [...actionRows, ...messages];
    if (query) {
      searchable.forEach((item) => {
        const match = item.textContent.toLowerCase().includes(query);
        item.classList.toggle('hidden', !match);
      });
    }

    list.replaceChildren(
      Object.assign(document.createElement('div'), { className: 'issue438-status-rail' }),
      section({
        eyebrow: isLeadershipUser() ? 'Følg opp først' : 'For deg',
        title: 'Krever handling',
        count: `${actionRows.length} saker`,
        empty: 'Ingen prioriterte saker nå.',
        children: actionRows,
      }),
      section({
        eyebrow: 'Samtaler',
        title: 'Uleste meldinger',
        count: `${unreadCount()} ulest`,
        empty: 'Ingen relevante meldinger nå.',
        children: messages,
      }),
      quickActions(),
    );
    $('.issue438-status-rail', list).replaceChildren(...issue438StatusChips());

    if (restoreSearchFocus) {
      activeElement.focus({ preventScroll: true });
      try {
        if (selectionStart !== null && selectionEnd !== null) activeElement.setSelectionRange(selectionStart, selectionEnd);
      } catch (_) {}
    }
  }

  renderOverviewRows = renderIssue438Overview;

  renderShell = function issue438RenderShell() {
    baseRenderShell();
    if (state.user && state.activeTab === 'overview') {
      renderIssue438Overview();
    }
  };

  if (state.user && state.activeTab === 'overview') {
    renderIssue438Overview();
  }

  window.arrangementsvaktIssue438 = { version: issue438Version };
})();
