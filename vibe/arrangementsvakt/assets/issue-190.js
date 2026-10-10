(function () {
  const fallbackHendelseLabels = {
    info: 'Info',
    followUp: 'Normal',
    urgent: 'Haster',
    critical: 'Kritisk',
  };

  function configuredHendelser() {
    return Array.isArray(state.severities) ? state.severities : [];
  }

  function hendelseNameForSeverity(severityId) {
    const id = safeText(severityId).trim();
    if (!id) return '';
    const configured = configuredHendelser().find((severity) => severity.id === id);
    return safeText(configured?.name || fallbackHendelseLabels[id] || severityLabels[id] || id).trim();
  }

  function incidentHendelseMeta(incident) {
    const meta = incident?.severityMeta;
    if (meta && (meta.name || meta.id)) return meta;
    const configured = configuredHendelser().find((severity) => severity.id === incident?.severity);
    if (configured) return configured;
    const id = safeText(incident?.severity).trim();
    return {
      id,
      name: fallbackHendelseLabels[id] || severityLabels[id] || '',
      tone: id || 'neutral',
      sortOrder: 0,
      active: true,
      isCritical: ['urgent', 'critical'].includes(id),
    };
  }

  function incidentHendelseTitle(incident) {
    const meta = incidentHendelseMeta(incident);
    const hendelseName = safeText(meta.name || meta.currentName).trim();
    return hendelseName || safeText(incident?.title).trim() || 'Hendelse';
  }

  function legacyIncidentTitle(incident) {
    const title = safeText(incident?.title).trim();
    const hendelseTitle = incidentHendelseTitle(incident);
    return title && title !== hendelseTitle ? title : '';
  }

  function incidentHendelseTone(incident) {
    const meta = incidentHendelseMeta(incident);
    return meta.tone || incident?.severity || 'neutral';
  }

  function incidentHendelseSortOrder(incident) {
    const sortOrder = Number(incidentHendelseMeta(incident).sortOrder);
    return Number.isFinite(sortOrder) ? sortOrder : 0;
  }

  function incidentMetaWithoutMainHendelse(incident) {
    return incidentMetaItems(incident).filter((item) => item.type !== 'severity');
  }

  function syncIncidentTitleFromSeverity() {
    const form = $('#incidentForm');
    if (!form) return;
    const severityId = $('[name="severity"]', form)?.value || '';
    const hiddenTitle = $('[name="title"]', form);
    if (hiddenTitle) hiddenTitle.value = hendelseNameForSeverity(severityId);
    const firstOption = $('[name="severity"] option', form);
    if (firstOption?.textContent === 'Ingen aktive alvorlighetsgrader') {
      firstOption.textContent = 'Ingen aktive Hendelse-valg';
    }
  }

  const issue190FormDataObjectBase = formDataObject;
  formDataObject = function patchedIssue190FormDataObject(form) {
    const result = issue190FormDataObjectBase(form);
    if (form?.id === 'incidentForm') {
      const hendelseName = hendelseNameForSeverity(result.severity);
      if (hendelseName) result.title = hendelseName;
    }
    return result;
  };

  const issue190OpenIncidentModalBase = openIncidentModal;
  openIncidentModal = function patchedIssue190OpenIncidentModal() {
    issue190OpenIncidentModalBase();
    syncIncidentTitleFromSeverity();
    const severitySelect = $('[name="severity"]', $('#incidentDialog'));
    if (severitySelect?.focus) severitySelect.focus();
  };

  const issue190RenderShellBase = renderShell;
  renderShell = function patchedIssue190RenderShell() {
    issue190RenderShellBase();
    syncIncidentTitleFromSeverity();
  };

  renderOverviewRows = function patchedIssue190RenderOverviewRows() {
    const list = $('#overviewRows');
    if (!list) return;
    const visibleTeams = getAllowedTeams();
    if (!visibleTeams.length) {
      list.replaceChildren(emptyState('Ingen team er tilgjengelige for denne rollen ennå.'));
      return;
    }
    const head = document.createElement('div');
    head.className = 'table-head';
    head.innerHTML = '<span>Område</span><span>Status</span><span>Siste hendelse</span><span>Åpne</span><span></span>';
    const rows = visibleTeams.map((team) => {
      const teamIncidents = state.incidents.filter((incident) => (incident.teamIds || []).includes(team.id));
      const latest = [...teamIncidents].sort((a, b) => safeText(b.createdAt).localeCompare(safeText(a.createdAt)))[0];
      const openCount = teamIncidents.filter((incident) => !['resolved', 'archived'].includes(incident.status)).length;
      return structuredRow({
        className: 'compact-row table-row',
        title: team.name,
        eyebrow: `${state.users.filter((user) => (user.teamIds || []).includes(team.id)).length} brukere · ${team.description || 'team uten beskrivelse'}`,
        meta: [
          { text: team.active === false ? 'Inaktiv' : 'Aktiv', tone: team.active === false ? 'archived' : 'ok' },
          { text: latest ? incidentHendelseTitle(latest) : 'Ingen hendelser' },
          { text: `${openCount} åpne`, tone: openCount ? 'warning' : 'ok' },
        ],
        ariaLabel: `Åpne team ${team.name}`,
        onClick: () => openDetailModal('team', team.id),
        markerTone: openCount ? 'warning' : (team.active === false ? 'archived' : 'ok'),
      });
    });
    list.replaceChildren(head, ...rows);
  };

  renderIncidents = function patchedIssue190RenderIncidents() {
    const list = $('#incidentList');
    if (!list) return;
    const sorted = [...state.incidents].sort((a, b) => {
      const priority = (incident) => (incident.escalatedToRaceLead ? 1000 : 0) + incidentHendelseSortOrder(incident);
      return priority(b) - priority(a) || safeText(b.createdAt).localeCompare(safeText(a.createdAt));
    });
    if (!sorted.length) {
      list.replaceChildren(emptyState('Ingen aktive hendelser å vise.'));
      return;
    }

    list.replaceChildren(...sorted.map((incident) => {
      const title = incidentHendelseTitle(incident);
      const row = structuredRow({
        className: 'incident-row',
        title,
        eyebrow: incident.location || 'Uten sted',
        meta: incidentMetaWithoutMainHendelse(incident).map(({ text, tone }) => ({ text, tone })),
        foot: `${formatDateTime(incident.createdAt)} · ${incident.comments?.length || 0} kommentarer · ${incident.imageRefs?.length || 0} bilder`,
        ariaLabel: `Åpne hendelse ${title}`,
        onClick: () => openDetailModal('incident', incident.id),
        markerTone: incident.escalatedToRaceLead ? 'warning' : incidentHendelseTone(incident),
      });
      row.dataset.severity = incident.severity;
      row.dataset.escalated = String(!!incident.escalatedToRaceLead);
      return row;
    }));
  };

  renderOffline = function patchedIssue190RenderOffline() {
    const offline = offlineIncidents();
    $('#retryOfflineButton').classList.toggle('hidden', offline.length === 0);
    if (!offline.length) {
      $('#offlineList').replaceChildren(emptyState('Ingen lokale hendelser venter på sending.'));
      return;
    }
    $('#offlineList').replaceChildren(...offline.map((incident) => {
      const item = document.createElement('div');
      item.className = 'offline-item';
      item.innerHTML = '<strong></strong><small></small>';
      $('strong', item).textContent = incidentHendelseTitle(incident);
      $('small', item).textContent = incident.savedAt ? `Lagret lokalt ${new Date(incident.savedAt).toLocaleString('no-NO')}` : 'Lagret lokalt';
      return item;
    }));
  };

  const issue190RenderDetailModalBase = renderDetailModal;
  renderDetailModal = function patchedIssue190RenderDetailModal() {
    issue190RenderDetailModalBase();
    if (state.detailModal.type !== 'incident') return;
    const incident = state.incidents.find((item) => item.id === state.detailModal.id);
    if (!incident) return;
    const title = incidentHendelseTitle(incident);
    $('#detailDialogTitle').textContent = title;
    $$('#detailDialogBody [data-type="severity"]').forEach((chip) => chip.remove());

    const oldTitle = legacyIncidentTitle(incident);
    const description = $('#detailDialogBody .detail-description');
    if (!oldTitle || !description || $('#detailDialogBody [data-legacy-title="true"]')) return;
    const legacy = document.createElement('p');
    legacy.className = 'detail-counts';
    legacy.dataset.legacyTitle = 'true';
    legacy.textContent = `Tittel fra tidligere skjema: ${oldTitle}`;
    description.after(legacy);
  };

  $('#incidentForm')?.addEventListener('change', (event) => {
    if (event.target?.name === 'severity') syncIncidentTitleFromSeverity();
  });

  $('#openIncidentModalButton')?.addEventListener('click', () => {
    setTimeout(() => {
      syncIncidentTitleFromSeverity();
      const severitySelect = $('[name="severity"]', $('#incidentDialog'));
      if (severitySelect?.focus) severitySelect.focus();
    }, 0);
  });
}());
