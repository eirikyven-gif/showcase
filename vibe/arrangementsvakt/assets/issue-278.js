(() => {
  const issue278Version = 'v0.11.0-incident-type-edit-2026-06-09';
  const fallbackSeverities = [
    { id: 'info', name: 'Info', tone: 'info', sortOrder: 10, active: true, isCritical: false },
    { id: 'followUp', name: 'Normal', tone: 'normal', sortOrder: 20, active: true, isCritical: false },
    { id: 'urgent', name: 'Haster', tone: 'urgent', sortOrder: 30, active: true, isCritical: true },
    { id: 'critical', name: 'Kritisk', tone: 'critical', sortOrder: 40, active: true, isCritical: true },
  ];

  function issue278Text(value) {
    return String(value ?? '').trim();
  }

  function issue278Severities() {
    return Array.isArray(state.severities) && state.severities.length ? state.severities : fallbackSeverities;
  }

  function issue278SeverityById(id) {
    const severityId = issue278Text(id);
    return issue278Severities().find((severity) => severity.id === severityId)
      || fallbackSeverities.find((severity) => severity.id === severityId)
      || null;
  }

  function issue278SeverityMeta(incident) {
    const meta = incident?.severityMeta;
    if (meta && (meta.id || meta.name)) return meta;
    const configured = issue278SeverityById(incident?.severity);
    if (configured) return configured;
    return {
      id: issue278Text(incident?.severity),
      name: issue278Text(incident?.severity) || 'Ukjent type',
      tone: issue278Text(incident?.severity) || 'neutral',
      sortOrder: 0,
      active: false,
      isCritical: false,
    };
  }

  function issue278TypeName(incident) {
    const meta = issue278SeverityMeta(incident);
    return issue278Text(meta.currentName || meta.name || incident?.severity) || 'Ukjent type';
  }

  function issue278ActiveTypeOptions(incident) {
    const currentId = issue278Text(incident?.severity);
    const active = issue278Severities().filter((severity) => severity.active !== false);
    if (!currentId || active.some((severity) => severity.id === currentId)) return active;
    return [issue278SeverityMeta(incident), ...active];
  }

  function issue278LedTeamIds() {
    if (!state.user) return new Set();
    return new Set(state.teams
      .filter((team) => (team.leaderIds || []).includes(state.user.id))
      .map((team) => team.id));
  }

  function issue278CanEditIncidentType(incident) {
    if (!state.user || !incident) return false;
    if (issue278Text(incident.createdBy) && issue278Text(incident.createdBy) === issue278Text(state.user.id)) return true;
    if (typeof isPrimaryLeader === 'function' && isPrimaryLeader()) return true;
    if (typeof isLeadershipUser === 'function' && isLeadershipUser()) return true;
    if (state.user.role !== 'teamLead') return false;
    const ledTeamIds = issue278LedTeamIds();
    return (incident.teamIds || []).some((teamId) => ledTeamIds.has(teamId));
  }

  function issue278OptionLabel(severity) {
    const inactive = severity.active === false ? ' (inaktiv)' : '';
    return `${issue278Text(severity.currentName || severity.name || severity.id)}${inactive}`;
  }

  function issue278CreateTypeSelect(incident, status) {
    const select = document.createElement('select');
    select.className = 'issue278-type-select';
    select.setAttribute('aria-label', `Endre type for ${issue278TypeName(incident)}`);
    issue278ActiveTypeOptions(incident).forEach((severity) => {
      const option = document.createElement('option');
      option.value = severity.id;
      option.textContent = issue278OptionLabel(severity);
      option.selected = severity.id === incident.severity;
      option.disabled = severity.active === false;
      select.append(option);
    });
    select.addEventListener('change', () => {
      status.textContent = '';
    });
    return select;
  }

  function issue278TypeErrorMessage(error) {
    const message = error?.message || '';
    if (message === 'forbidden') return 'Du har ikke tilgang til å endre type på denne hendelsen.';
    if (message === 'invalid_severity') return 'Velg en aktiv type.';
    if (message === 'incident_not_in_active_feed') return 'Hendelsen kan ikke oppdateres fra aktiv feed.';
    return 'Type kunne ikke lagres.';
  }

  async function issue278SaveType(incident, select, status, button) {
    const severity = issue278Text(select.value);
    if (!severity || severity === issue278Text(incident.severity)) return;
    button.disabled = true;
    status.textContent = 'Lagrer type...';
    try {
      await updateIncident(incident.id, { action: 'severity', severity });
      setStatus('Type er oppdatert.');
    } catch (error) {
      status.textContent = issue278TypeErrorMessage(error);
      setStatus(issue278TypeErrorMessage(error), 'error');
      button.disabled = false;
    }
  }

  function issue278RenderTypeControl(incident) {
    const section = document.createElement('section');
    section.className = 'issue278-type-section';
    section.setAttribute('aria-label', 'Type');

    const header = document.createElement('div');
    header.className = 'issue278-type-header';
    const label = document.createElement('strong');
    label.textContent = 'Type';
    const current = metaChip(issue278TypeName(incident), 'severity', issue278SeverityMeta(incident).tone || incident.severity || 'neutral');
    current.classList.add('issue278-current-type');
    header.replaceChildren(label, current);
    section.append(header);

    if (!issue278CanEditIncidentType(incident)) {
      const readonly = document.createElement('p');
      readonly.className = 'issue278-type-readonly';
      readonly.textContent = 'Kun lesing';
      section.append(readonly);
      return section;
    }

    const form = document.createElement('form');
    form.className = 'issue278-type-form';
    const status = document.createElement('p');
    status.className = 'issue278-type-status';
    status.setAttribute('aria-live', 'polite');
    const select = issue278CreateTypeSelect(incident, status);
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'secondary';
    button.textContent = 'Lagre type';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      issue278SaveType(incident, select, status, button);
    });
    form.replaceChildren(fieldLabel('Type ', select), button, status);
    section.append(form);
    return section;
  }

  function issue278InsertTypeControl() {
    if (state.detailModal.type !== 'incident') return;
    const incident = state.incidents.find((item) => item.id === state.detailModal.id);
    const detail = $('#detailDialogBody .detail-stack');
    const meta = $('#detailDialogBody .incident-meta');
    if (!incident || !detail || !meta || $('#detailDialogBody .issue278-type-section')) return;
    meta.after(issue278RenderTypeControl(incident));
  }

  const issue278RenderDetailModalBase = renderDetailModal;
  renderDetailModal = function issue278RenderDetailModal() {
    issue278RenderDetailModalBase();
    issue278InsertTypeControl();
  };

  window.arrangementsvaktIssue278 = {
    version: issue278Version,
    canEditIncidentType: issue278CanEditIncidentType,
  };
})();
