(() => {
  const issue428Version = 'v0.14.6-issue-428-incidents-inbox-list-2026-06-23';

  state.issue428Incidents = state.issue428Incidents || {
    filter: 'all',
    search: '',
  };

  function issue428Text(value) {
    return String(value ?? '').trim();
  }

  function issue428Timestamp(value) {
    const timestamp = new Date(issue428Text(value)).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function issue428Time(value) {
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

  function issue428Preview(incident) {
    const comments = Array.isArray(incident.comments) ? incident.comments : [];
    const lastComment = comments.length ? comments[comments.length - 1] : null;
    const source = issue428Text(incident.description || incident.location || lastComment?.body || lastComment?.comment || '');
    if (!source) return 'Ingen beskrivelse.';
    const normalized = source.replace(/\s+/g, ' ');
    if (normalized.length <= 104) return normalized;
    return `${normalized.slice(0, 103).trim()}...`;
  }

  function issue428IsOpen(incident) {
    return !['resolved', 'archived'].includes(incident.status);
  }

  function issue428PriorityRank(incident) {
    if (incident.escalatedToRaceLead || incident.severity === 'critical') return 4;
    if (incident.severity === 'urgent') return 3;
    if (incident.status === 'working') return 2;
    if (incident.status === 'new' || incident.status === 'seen') return 1;
    return 0;
  }

  function issue428Tone(incident) {
    if (incident.escalatedToRaceLead || incident.severity === 'critical') return 'critical';
    if (incident.severity === 'urgent') return 'urgent';
    if (incident.status === 'working') return 'working';
    if (incident.status === 'resolved') return 'resolved';
    if (incident.status === 'archived') return 'archived';
    return 'normal';
  }

  function issue428PriorityLabel(incident) {
    if (incident.escalatedToRaceLead) return 'Hevet';
    return severityLabels[incident.severity] || 'Normal';
  }

  function issue428StatusLabel(incident) {
    return statusLabels[incident.status] || incident.status || 'Ukjent';
  }

  function issue428LastActivity(incident) {
    const lastComment = Array.isArray(incident.comments) && incident.comments.length
      ? incident.comments[incident.comments.length - 1]
      : null;
    const commentAt = issue428Timestamp(lastComment?.createdAt);
    const updatedAt = issue428Timestamp(incident.updatedAt);
    const createdAt = issue428Timestamp(incident.createdAt);
    const latest = Math.max(commentAt, updatedAt, createdAt);
    return {
      at: latest,
      label: commentAt && commentAt === latest ? 'Kommentar' : issue428StatusLabel(incident),
      text: lastComment?.body || lastComment?.comment || incident.description || incident.location || '',
    };
  }

  function issue428Chip(label, tone = 'neutral') {
    const chip = document.createElement('span');
    chip.className = 'issue428-chip';
    chip.dataset.tone = tone;
    chip.textContent = label;
    return chip;
  }

  function issue428FilterButton(filter, label, count) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue428-filter';
    button.dataset.filter = filter;
    button.setAttribute('aria-pressed', state.issue428Incidents.filter === filter ? 'true' : 'false');
    button.textContent = `${label} ${count}`;
    button.addEventListener('click', () => {
      state.issue428Incidents.filter = filter;
      renderIncidents();
    });
    return button;
  }

  function issue428SearchText(incident) {
    return [
      incident.title,
      incident.description,
      incident.location,
      teamNames(incident.teamIds || []),
      issue428StatusLabel(incident),
      severityLabels[incident.severity],
    ].map(issue428Text).join(' ').toLowerCase();
  }

  function issue428FilteredIncidents(incidents) {
    const filter = state.issue428Incidents.filter || 'all';
    const query = issue428Text(state.issue428Incidents.search).toLowerCase();
    return incidents.filter((incident) => {
      if (filter === 'priority' && !(incident.escalatedToRaceLead || ['critical', 'urgent'].includes(incident.severity))) return false;
      if (filter === 'open' && !issue428IsOpen(incident)) return false;
      if (filter === 'working' && incident.status !== 'working') return false;
      if (filter === 'resolved' && !['resolved', 'archived'].includes(incident.status)) return false;
      return !query || issue428SearchText(incident).includes(query);
    });
  }

  function issue428Search() {
    const label = document.createElement('label');
    label.className = 'issue428-search';
    label.innerHTML = '<span>Søk</span>';
    const input = document.createElement('input');
    input.type = 'search';
    input.autocomplete = 'off';
    input.placeholder = 'Søk hendelser';
    input.value = state.issue428Incidents.search || '';
    input.addEventListener('input', (event) => {
      state.issue428Incidents.search = event.currentTarget.value;
      renderIncidents();
    });
    label.append(input);
    return { label, input };
  }

  function issue428Row(incident) {
    const activity = issue428LastActivity(incident);
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'issue428-incident-row';
    row.dataset.tone = issue428Tone(incident);
    row.setAttribute('aria-label', `Åpne hendelse ${incident.title || 'uten tittel'}`);
    row.addEventListener('click', () => openDetailModal('incident', incident.id));

    const marker = document.createElement('span');
    marker.className = 'issue428-marker';
    marker.setAttribute('aria-hidden', 'true');

    const main = document.createElement('span');
    main.className = 'issue428-row-main';
    const top = document.createElement('span');
    top.className = 'issue428-row-top';
    const title = document.createElement('strong');
    title.textContent = incident.title || 'Hendelse uten tittel';
    const priority = issue428Chip(issue428PriorityLabel(incident), issue428Tone(incident));
    top.append(title, priority);

    const preview = document.createElement('span');
    preview.className = 'issue428-preview';
    preview.textContent = issue428Preview(incident);

    const meta = document.createElement('span');
    meta.className = 'issue428-meta';
    meta.textContent = [
      teamNames(incident.teamIds || []),
      incident.location || '',
      `${incident.comments?.length || 0} kommentarer`,
      incident.imageRefs?.length ? `${incident.imageRefs.length} bilder` : '',
    ].filter(Boolean).join(' · ');
    main.append(top, preview, meta);

    const side = document.createElement('span');
    side.className = 'issue428-side';
    const time = document.createElement('strong');
    time.textContent = issue428Time(activity.at || incident.updatedAt || incident.createdAt);
    const status = issue428Chip(activity.label, issue428Tone(incident));
    side.append(time, status);

    row.append(marker, main, side);
    return row;
  }

  function issue428SyncHead() {
    const panel = $('#incidentPanel');
    if (!panel) return;
    panel.dataset.issue428Incidents = 'true';
    const eyebrow = $('.section-heading .eyebrow', panel);
    const title = $('.section-heading h2', panel);
    if (eyebrow) eyebrow.textContent = 'Aktiv feed';
    if (title) title.textContent = 'Hendelser';
  }

  renderIncidents = function issue428RenderIncidents() {
    const list = $('#incidentList');
    if (!list) return;
    issue428SyncHead();

    const activeElement = document.activeElement;
    const restoreSearch = activeElement?.matches?.('.issue428-search input') === true;
    const selectionStart = restoreSearch ? activeElement.selectionStart : null;
    const selectionEnd = restoreSearch ? activeElement.selectionEnd : null;

    const allIncidents = [...state.incidents].sort((a, b) => {
      return issue428PriorityRank(b) - issue428PriorityRank(a)
        || issue428LastActivity(b).at - issue428LastActivity(a).at
        || issue428Timestamp(b.createdAt) - issue428Timestamp(a.createdAt);
    });

    const counts = {
      all: allIncidents.length,
      priority: allIncidents.filter((incident) => incident.escalatedToRaceLead || ['critical', 'urgent'].includes(incident.severity)).length,
      open: allIncidents.filter(issue428IsOpen).length,
      working: allIncidents.filter((incident) => incident.status === 'working').length,
      resolved: allIncidents.filter((incident) => ['resolved', 'archived'].includes(incident.status)).length,
    };

    const status = document.createElement('div');
    status.className = 'issue428-status';
    status.append(
      issue428FilterButton('all', 'Alle', counts.all),
      issue428FilterButton('priority', 'Viktig', counts.priority),
      issue428FilterButton('open', 'Åpne', counts.open),
      issue428FilterButton('working', 'Arbeid', counts.working),
      issue428FilterButton('resolved', 'Lukket', counts.resolved),
    );

    const { label: search, input } = issue428Search();
    const incidents = issue428FilteredIncidents(allIncidents);
    const rows = document.createElement('section');
    rows.className = 'issue428-incident-list';
    rows.setAttribute('aria-label', 'Hendelsesliste');
    rows.replaceChildren(...(incidents.length
      ? incidents.map(issue428Row)
      : [emptyState(state.issue428Incidents.search ? 'Ingen hendelser matcher søket.' : 'Ingen hendelser å vise.')]));

    list.className = 'issue428-root';
    list.replaceChildren(status, search, rows);

    if (restoreSearch) {
      input.focus({ preventScroll: true });
      try {
        if (selectionStart !== null && selectionEnd !== null) input.setSelectionRange(selectionStart, selectionEnd);
      } catch (_) {}
    }
  };

  if (state.user && state.activeTab === 'incidents') renderIncidents();

  window.arrangementsvaktIssue428 = { version: issue428Version };
})();
