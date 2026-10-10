(() => {
  const issue440Version = 'v0.15.9-issue-440-incident-case-list-2026-06-26';
  const baseRenderIncidents = renderIncidents;
  const baseRenderShell = renderShell;

  function text(value) {
    return String(value ?? '').trim();
  }

  function timestamp(value) {
    const time = new Date(text(value)).getTime();
    return Number.isFinite(time) ? time : 0;
  }

  function displayTime(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const sameDay = date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate();
    if (sameDay) return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleString('nb-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function excerpt(value, fallback = 'Ingen beskrivelse.') {
    const normalized = text(value).replace(/\s+/g, ' ');
    if (!normalized) return fallback;
    return normalized.length <= 118 ? normalized : `${normalized.slice(0, 117).trim()}...`;
  }

  function commentsFor(incident) {
    return Array.isArray(incident.comments) ? incident.comments.filter(Boolean) : [];
  }

  function latestComment(incident) {
    return commentsFor(incident)
      .sort((a, b) => timestamp(b.createdAt) - timestamp(a.createdAt))[0] || null;
  }

  function isOpenIncident(incident) {
    return !['resolved', 'archived'].includes(incident.status);
  }

  function priorityScore(incident) {
    if (incident.escalatedToRaceLead) return 500;
    if (incident.severity === 'critical') return 400;
    if (incident.severity === 'urgent') return 300;
    if (incident.status === 'new') return 220;
    if (incident.status === 'working') return 180;
    if (incident.severity === 'followUp') return 120;
    if (incident.status === 'resolved') return 20;
    if (incident.status === 'archived') return 0;
    return 80;
  }

  function sortedIncidents() {
    return [...(state.incidents || [])].sort((a, b) => {
      const priority = priorityScore(b) - priorityScore(a);
      if (priority) return priority;
      return timestamp(b.updatedAt || b.createdAt) - timestamp(a.updatedAt || a.createdAt);
    });
  }

  function statusTone(incident) {
    if (incident.escalatedToRaceLead || incident.severity === 'critical') return 'critical';
    if (incident.severity === 'urgent' || incident.status === 'new') return 'urgent';
    if (incident.status === 'working') return 'working';
    if (incident.status === 'resolved') return 'resolved';
    if (incident.status === 'archived') return 'archived';
    if (incident.severity === 'followUp') return 'follow-up';
    return 'neutral';
  }

  function primaryLabel(incident) {
    if (incident.escalatedToRaceLead) return 'Hevet';
    if (incident.severity === 'critical') return 'Kritisk';
    if (incident.severity === 'urgent') return 'Haster';
    if (incident.status === 'working') return 'Arbeid';
    if (incident.status === 'resolved') return 'Løst';
    if (incident.status === 'archived') return 'Arkiv';
    return severityLabels[incident.severity] || statusLabels[incident.status] || 'Sak';
  }

  function activityText(incident) {
    const latest = latestComment(incident);
    return [teamNames(incident.teamIds || []), incident.location || 'Uten sted'].filter(Boolean).join(' · ');
  }

  function metaLine(incident) {
    const commentCount = commentsFor(incident).length;
    const imageCount = Array.isArray(incident.imageRefs) ? incident.imageRefs.length : 0;
    return [
      commentCount ? (commentCount === 1 ? '1 kommentar' : `${commentCount} kommentarer`) : '',
      imageCount ? (imageCount === 1 ? '1 bilde' : `${imageCount} bilder`) : '',
    ].filter(Boolean).join(' · ');
  }

  function issue440CaseRow(incident) {
    const title = text(incident.title) || 'Hendelse uten tittel';
    const tone = statusTone(incident);
    const status = statusLabels[incident.status] || incident.status || 'Ukjent status';
    const severity = severityLabels[incident.severity] || incident.severity || 'Ukjent prioritet';
    const updated = incident.updatedAt || incident.createdAt;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue440-case-row';
    button.dataset.tone = tone;
    button.dataset.status = text(incident.status) || 'unknown';
    button.dataset.open = isOpenIncident(incident) ? 'true' : 'false';
    button.dataset.escalated = String(!!incident.escalatedToRaceLead);
    button.setAttribute('aria-label', `Åpne hendelse: ${title}. ${primaryLabel(incident)}. ${status}. ${displayTime(updated)}`);
    button.addEventListener('click', () => openDetailModal('incident', incident.id));
    button.innerHTML = `
      <span class="issue440-case-marker" aria-hidden="true"></span>
      <span class="issue440-case-main">
        <span class="issue440-case-top">
          <strong></strong>
          <span class="issue440-case-time"></span>
        </span>
        <span class="issue440-case-text"></span>
        <span class="issue440-case-meta"></span>
      </span>
      <span class="issue440-case-status">
        <span class="issue440-case-label"></span>
        <span class="issue440-case-sub"></span>
      </span>
    `;
    $('.issue440-case-marker', button).textContent = primaryLabel(incident).charAt(0).toUpperCase();
    $('.issue440-case-top strong', button).textContent = title;
    $('.issue440-case-time', button).textContent = displayTime(updated);
    $('.issue440-case-text', button).textContent = activityText(incident);
    $('.issue440-case-meta', button).textContent = '';
    $('.issue440-case-meta', button).classList.add('hidden');
    $('.issue440-case-label', button).textContent = primaryLabel(incident);
    $('.issue440-case-sub', button).textContent = [status, severity].filter(Boolean).join(' · ');
    return button;
  }

  function syncIncidentChrome() {
    const panel = $('#incidentPanel');
    if (!panel) return;
    panel.dataset.issue440Incidents = 'true';
    const eyebrow = $('#incidentPanel .section-heading .eyebrow');
    const heading = $('#incidentPanel .section-heading h2');
    if (eyebrow) eyebrow.textContent = 'Saksliste';
    if (heading) heading.textContent = 'Hendelser';
  }

  renderIncidents = function issue440RenderIncidents() {
    baseRenderIncidents();
    syncIncidentChrome();
    const list = $('#incidentList');
    if (!list) return;
    list.className = 'incident-list issue440-case-list';
    const incidents = sortedIncidents();
    if (!incidents.length) {
      list.replaceChildren(emptyState('Ingen aktive hendelser å vise.'));
      return;
    }
    list.replaceChildren(...incidents.map(issue440CaseRow));
  };

  renderShell = function issue440RenderShell() {
    baseRenderShell();
    if (state.user && state.activeTab === 'incidents') renderIncidents();
  };

  if (state.user && state.activeTab === 'incidents') renderIncidents();

  window.arrangementsvaktIssue440 = { version: issue440Version };
})();