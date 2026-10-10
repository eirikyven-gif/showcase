(function () {
  state.severities = state.severities || [];

  const defaultSeverities = [
    { id: 'info', name: 'Info', description: 'Informasjon eller lav praktisk betydning.', tone: 'info', sortOrder: 10, active: true, isCritical: false },
    { id: 'followUp', name: 'Normal', description: 'Ordinær hendelse som må følges opp.', tone: 'normal', sortOrder: 20, active: true, isCritical: false },
    { id: 'urgent', name: 'Haster', description: 'Krever rask avklaring eller handling.', tone: 'urgent', sortOrder: 30, active: true, isCritical: true },
    { id: 'critical', name: 'Kritisk', description: 'Kritisk hendelse som må prioriteres umiddelbart.', tone: 'critical', sortOrder: 40, active: true, isCritical: true },
  ];
  const toneLabels = {
    neutral: 'Nøytral',
    normal: 'Normal',
    info: 'Info',
    urgent: 'Haster',
    critical: 'Kritisk',
    warning: 'Varsel',
    ok: 'OK',
  };

  if (typeof nonRetryableIncidentErrors !== 'undefined') {
    nonRetryableIncidentErrors.add('invalid_severity');
  }

  function severities() {
    return Array.isArray(state.severities) && state.severities.length ? state.severities : defaultSeverities;
  }

  function activeSeverities() {
    return severities().filter((severity) => severity.active !== false);
  }

  function severityById(id) {
    return severities().find((severity) => severity.id === id)
      || defaultSeverities.find((severity) => severity.id === id)
      || null;
  }

  function incidentSeverityMeta(incident) {
    const meta = incident?.severityMeta;
    if (meta && meta.id) return meta;
    const fallback = severityById(incident?.severity);
    if (fallback) return fallback;
    return {
      id: incident?.severity || '',
      name: incident?.severity || 'Ukjent alvorlighetsgrad',
      description: '',
      tone: 'neutral',
      sortOrder: 0,
      active: false,
      isCritical: false,
    };
  }

  function severityTone(incident) {
    return incidentSeverityMeta(incident).tone || incident.severity || 'neutral';
  }

  function severityIsCritical(incident) {
    const meta = incidentSeverityMeta(incident);
    return !!meta.isCritical || ['critical', 'urgent'].includes(incident?.severity);
  }

  function severitySortOrder(incident) {
    const order = Number(incidentSeverityMeta(incident).sortOrder);
    return Number.isFinite(order) ? order : 0;
  }

  async function fetchSeverities() {
    if (!state.user) return;
    const suffix = (typeof isPrimaryLeader === 'function' ? isPrimaryLeader(state.user) : state.user.role === 'raceLead') ? '?includeInactive=1' : '';
    const data = await api(`severities.php${suffix}`);
    state.severities = data.severities || [];
  }

  function fillIncidentSeveritySelect() {
    const form = $('#incidentForm');
    const select = form ? $('[name="severity"]', form) : null;
    if (!select) return;
    const current = select.value;
    const options = activeSeverities();
    if (!options.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'Ingen aktive alvorlighetsgrader';
      option.disabled = true;
      option.selected = true;
      select.replaceChildren(option);
      return;
    }
    select.replaceChildren(...options.map((severity) => {
      const option = document.createElement('option');
      option.value = severity.id;
      option.textContent = severity.name || severity.id;
      option.selected = severity.id === current;
      return option;
    }));
    if (!options.some((severity) => severity.id === select.value)) {
      select.value = options.find((severity) => severity.id === 'followUp')?.id || options[0].id;
    }
  }

  incidentMetaItems = function patchedIssue184IncidentMetaItems(incident) {
    const severity = incidentSeverityMeta(incident);
    return [
      { text: severity.name || incident.severity, type: 'severity', tone: severity.tone || incident.severity },
      severity.active === false ? { text: 'Inaktiv grad', type: 'severityState', tone: 'archived' } : null,
      { text: statusLabels[incident.status] || incident.status, type: 'status', tone: incident.status },
      { text: teamNames(incident.teamIds || []), type: 'team' },
      { text: incident.location || 'Uten sted', type: 'location' },
      incident.escalatedToRaceLead ? { text: 'Hevet til Løpsleder', type: 'escalated', tone: 'warning' } : null,
    ].filter(Boolean);
  };

  renderOverviewStats = function patchedIssue184RenderOverviewStats() {
    const stats = $('#overviewStats');
    const criticalCount = state.incidents.filter((incident) => severityIsCritical(incident)).length;
    const escalatedCount = state.incidents.filter((incident) => incident.escalatedToRaceLead).length;
    const workingCount = state.incidents.filter((incident) => incident.status === 'working').length;
    const offlineCount = offlineIncidents().length;
    const items = [
      { label: 'Haster/kritisk', value: criticalCount, tone: criticalCount ? 'urgent' : 'neutral' },
      { label: 'Hevet', value: escalatedCount, tone: escalatedCount ? 'warning' : 'neutral' },
      { label: 'Under arbeid', value: workingCount, tone: workingCount ? 'working' : 'neutral' },
      { label: 'Ikke sendt', value: offlineCount, tone: offlineCount ? 'warning' : 'neutral' },
    ];
    stats.replaceChildren(...items.map(({ label, value, tone }) => {
      const item = document.createElement('span');
      item.className = 'summary-pill';
      item.dataset.tone = tone;
      item.innerHTML = '<strong></strong><small></small>';
      $('strong', item).textContent = value;
      $('small', item).textContent = label;
      return item;
    }));
  };

  renderIncidents = function patchedIssue184RenderIncidents() {
    const list = $('#incidentList');
    const sorted = [...state.incidents].sort((a, b) => {
      const priority = (incident) => (incident.escalatedToRaceLead ? 1000 : 0) + severitySortOrder(incident);
      return priority(b) - priority(a) || safeText(b.createdAt).localeCompare(safeText(a.createdAt));
    });
    if (!sorted.length) {
      list.replaceChildren(emptyState('Ingen aktive hendelser å vise.'));
      return;
    }

    list.replaceChildren(...sorted.map((incident) => {
      const row = structuredRow({
        className: 'incident-row',
        title: incident.title || 'Hendelse uten tittel',
        eyebrow: incident.location || 'Uten sted',
        meta: incidentMetaItems(incident).map(({ text, tone }) => ({ text, tone })),
        foot: `${formatDateTime(incident.createdAt)} · ${incident.comments?.length || 0} kommentarer · ${incident.imageRefs?.length || 0} bilder`,
        ariaLabel: `Åpne hendelse ${incident.title || 'uten tittel'}`,
        onClick: () => openDetailModal('incident', incident.id),
        markerTone: incident.escalatedToRaceLead ? 'warning' : severityTone(incident),
      });
      row.dataset.severity = incident.severity;
      row.dataset.escalated = String(!!incident.escalatedToRaceLead);
      return row;
    }));
  };

  function renderTeamDetailWithSeverities() {
    const team = state.teams.find((item) => item.id === state.detailModal.id);
    if (!team) return;
    const title = $('#detailDialogTitle');
    const eyebrow = $('#detailDialogEyebrow');
    const body = $('#detailDialogBody');
    eyebrow.textContent = 'Team';
    title.textContent = team.name;
    const members = state.users.filter((user) => (user.teamIds || []).includes(team.id));
    const teamIncidents = state.incidents.filter((incident) => (incident.teamIds || []).includes(team.id));
    const detail = document.createElement('div');
    detail.className = 'detail-stack';
    const description = document.createElement('p');
    description.className = 'detail-description';
    description.textContent = team.description || 'Ingen beskrivelse.';
    const count = document.createElement('p');
    count.className = 'detail-counts';
    count.textContent = `${members.length} brukere · ${team.active === false ? 'inaktiv' : 'aktiv'}`;
    const leaders = document.createElement('p');
    leaders.className = 'detail-counts';
    leaders.textContent = `Teamleder: ${teamLeaderNames(team)}`;
    const memberTitle = document.createElement('h3');
    memberTitle.textContent = 'Medlemmer';
    const memberList = document.createElement('div');
    memberList.className = 'compact-list';
    if (!members.length) {
      memberList.replaceChildren(emptyState('Ingen brukere er knyttet til dette teamet ennå.'));
    } else {
      memberList.replaceChildren(...members.map((member) => structuredRow({
        title: member.displayName || member.fullName,
        eyebrow: member.fullName !== (member.displayName || member.fullName) ? member.fullName : 'Bruker',
        meta: [
          { text: (typeof displayRoleLabel === 'function' ? displayRoleLabel(member) : (roleLabels[member.role] || member.role)) },
          { text: member.active === false ? 'Inaktiv' : 'Aktiv', tone: member.active === false ? 'archived' : 'ok' },
        ],
        ariaLabel: `Åpne bruker ${member.displayName || member.fullName}`,
        onClick: () => openDetailModal('user', member.id),
        markerTone: member.active === false ? 'archived' : 'info',
      })));
    }
    const incidentTitle = document.createElement('h3');
    incidentTitle.textContent = 'Hendelser';
    const incidentList = document.createElement('div');
    incidentList.className = 'compact-list';
    if (!teamIncidents.length) {
      incidentList.replaceChildren(emptyState('Ingen aktive hendelser for dette teamet.'));
    } else {
      incidentList.replaceChildren(...teamIncidents.map((incident) => {
        const severity = incidentSeverityMeta(incident);
        return structuredRow({
          title: incident.title || 'Hendelse uten tittel',
          eyebrow: incident.location || 'Uten sted',
          meta: [
            { text: severity.name || incident.severity, tone: severity.tone || incident.severity },
            severity.active === false ? { text: 'Inaktiv grad', tone: 'archived' } : null,
            { text: statusLabels[incident.status] || incident.status, tone: incident.status },
          ].filter(Boolean),
          foot: formatDateTime(incident.createdAt),
          ariaLabel: `Åpne hendelse ${incident.title || 'uten tittel'}`,
          onClick: () => openDetailModal('incident', incident.id),
          markerTone: incident.escalatedToRaceLead ? 'warning' : severityTone(incident),
        });
      }));
    }
    detail.replaceChildren(description, count, leaders, memberTitle, memberList, incidentTitle, incidentList);
    body.replaceChildren(detail);
  }

  function resetSeverityForm() {
    const form = $('#severityForm');
    if (!form) return;
    form.reset();
    form.dataset.severityId = '';
    $('[name="tone"]', form).value = 'normal';
    $('[name="sortOrder"]', form).value = '50';
    $('[name="active"]', form).checked = true;
    $('[data-severity-form-title]', form).textContent = 'Ny alvorlighetsgrad';
    $('[data-severity-submit]', form).textContent = 'Opprett alvorlighetsgrad';
  }

  function startSeverityEdit(severity) {
    const form = $('#severityForm');
    if (!form) return;
    form.dataset.severityId = severity.id;
    $('[name="name"]', form).value = severity.name || '';
    $('[name="description"]', form).value = severity.description || '';
    $('[name="tone"]', form).value = severity.tone || 'normal';
    $('[name="sortOrder"]', form).value = String(severity.sortOrder ?? 50);
    $('[name="active"]', form).checked = severity.active !== false;
    $('[name="isCritical"]', form).checked = !!severity.isCritical;
    $('[data-severity-form-title]', form).textContent = 'Rediger alvorlighetsgrad';
    $('[data-severity-submit]', form).textContent = 'Lagre alvorlighetsgrad';
    form.scrollIntoView({ block: 'nearest' });
    $('[name="name"]', form).focus();
  }

  function severityFormPayload(form) {
    const id = form.dataset.severityId || '';
    return {
      action: id ? 'update' : 'create',
      id,
      name: $('[name="name"]', form).value,
      description: $('[name="description"]', form).value,
      tone: $('[name="tone"]', form).value,
      sortOrder: Number($('[name="sortOrder"]', form).value || 0),
      active: $('[name="active"]', form).checked,
      isCritical: $('[name="isCritical"]', form).checked,
    };
  }

  async function saveSeverity(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api('severities.php', { method: 'POST', body: JSON.stringify(severityFormPayload(form)) });
      setStatus('Alvorlighetsgraden er lagret.');
      await fetchSeverities();
      resetSeverityForm();
      renderSeverityAdmin();
      fillIncidentSeveritySelect();
    } catch (error) {
      setStatus('Alvorlighetsgraden kunne ikke lagres.', 'error');
    }
  }

  async function toggleSeverity(severity) {
    const payload = severity.active === false
      ? { action: 'update', id: severity.id, active: true }
      : { action: 'deactivate', id: severity.id };
    try {
      await api('severities.php', { method: 'POST', body: JSON.stringify(payload) });
      setStatus(severity.active === false ? 'Alvorlighetsgraden er aktivert.' : 'Alvorlighetsgraden er deaktivert.');
      await fetchSeverities();
      renderSeverityAdmin();
      fillIncidentSeveritySelect();
    } catch (error) {
      setStatus('Alvorlighetsgraden kunne ikke oppdateres.', 'error');
    }
  }

  function installSeverityAdmin() {
    const admin = $('#adminPanel');
    if (!admin || $('#severityAdminSection')) return;
    const section = document.createElement('section');
    section.id = 'severityAdminSection';
    section.className = 'severity-admin-section';
    section.innerHTML = `
      <div class="section-heading">
        <div>
          <p class="eyebrow">Hendelser</p>
          <h3>Alvorlighetsgrader</h3>
        </div>
        <button id="newSeverityButton" class="secondary" type="button">Ny grad</button>
      </div>
      <div id="severityAdminList" class="severity-admin-list" aria-live="polite"></div>
      <form id="severityForm" class="card-form severity-form">
        <h3 data-severity-form-title>Ny alvorlighetsgrad</h3>
        <label>Navn <input name="name" maxlength="80" required></label>
        <label>Beskrivelse <textarea name="description" maxlength="240"></textarea></label>
        <label>Tone
          <select name="tone">
            <option value="normal">Normal</option>
            <option value="neutral">Nøytral</option>
            <option value="info">Info</option>
            <option value="urgent">Haster</option>
            <option value="critical">Kritisk</option>
            <option value="warning">Varsel</option>
            <option value="ok">OK</option>
          </select>
        </label>
        <label>Sortering <input name="sortOrder" type="number" min="0" max="999" step="1" value="50"></label>
        <label class="checkbox"><input name="active" type="checkbox" checked> Aktiv</label>
        <label class="checkbox"><input name="isCritical" type="checkbox"> Regnes som haster/kritisk</label>
        <div class="severity-form-actions">
          <button data-severity-submit type="submit">Opprett alvorlighetsgrad</button>
          <button id="cancelSeverityEditButton" class="secondary" type="button">Nullstill</button>
        </div>
      </form>
    `;
    admin.append(section);
    $('#severityForm').addEventListener('submit', saveSeverity);
    $('#newSeverityButton').addEventListener('click', resetSeverityForm);
    $('#cancelSeverityEditButton').addEventListener('click', resetSeverityForm);
  }

  function renderSeverityAdmin() {
    if (!(typeof isPrimaryLeader === 'function' ? isPrimaryLeader(state.user) : state.user?.role === 'raceLead')) return;
    installSeverityAdmin();
    const list = $('#severityAdminList');
    if (!list) return;
    const items = severities();
    if (!items.length) {
      list.replaceChildren(emptyState('Ingen alvorlighetsgrader er satt opp ennå.'));
      return;
    }
    const head = document.createElement('div');
    head.className = 'severity-table-head';
    head.innerHTML = '<span>Grad</span><span>Detaljer</span><span>Handling</span>';
    const rows = items.map((severity) => {
      const row = document.createElement('div');
      row.className = 'severity-row';
      row.dataset.marker = severity.tone || 'normal';

      const main = document.createElement('span');
      main.className = 'row-main';
      const title = document.createElement('strong');
      title.textContent = severity.name || severity.id;
      const description = document.createElement('small');
      description.textContent = severity.description || 'Ingen beskrivelse';
      main.replaceChildren(title, description);

      const meta = document.createElement('span');
      meta.className = 'row-meta';
      meta.replaceChildren(
        rowMetaChip(`Sort ${severity.sortOrder ?? 0}`),
        rowMetaChip(toneLabels[severity.tone] || severity.tone || 'Normal', severity.tone || 'normal'),
        rowMetaChip(severity.active === false ? 'Inaktiv' : 'Aktiv', severity.active === false ? 'archived' : 'ok'),
        rowMetaChip(severity.isCritical ? 'Haster/kritisk' : 'Ordinær', severity.isCritical ? 'warning' : 'neutral'),
      );

      const actions = document.createElement('span');
      actions.className = 'severity-actions';
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'secondary';
      edit.textContent = 'Rediger';
      edit.addEventListener('click', () => startSeverityEdit(severity));
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'secondary';
      toggle.textContent = severity.active === false ? 'Aktiver' : 'Deaktiver';
      toggle.addEventListener('click', () => toggleSeverity(severity));
      actions.replaceChildren(edit, toggle);

      row.replaceChildren(main, meta, actions);
      return row;
    });
    list.replaceChildren(head, ...rows);
  }

  const issue184RefreshDataBase = refreshData;
  refreshData = async function patchedIssue184RefreshData() {
    if (state.user) await fetchSeverities();
    return issue184RefreshDataBase();
  };

  const issue184RenderShellBase = renderShell;
  renderShell = function patchedIssue184RenderShell() {
    issue184RenderShellBase();
    fillIncidentSeveritySelect();
    renderSeverityAdmin();
  };

  const issue184OpenIncidentModalBase = openIncidentModal;
  openIncidentModal = function patchedIssue184OpenIncidentModal() {
    issue184OpenIncidentModalBase();
    fillIncidentSeveritySelect();
  };

  const issue184RenderDetailModalBase = renderDetailModal;
  renderDetailModal = function patchedIssue184RenderDetailModal() {
    issue184RenderDetailModalBase();
    if (state.detailModal.type === 'team') renderTeamDetailWithSeverities();
  };
}());
