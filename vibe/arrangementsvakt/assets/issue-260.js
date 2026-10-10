(() => {
  const issue260Version = 'v0.9.9-member-incident-insight-2026-06-08';

  function issue260IncidentEmptyStateMessage() {
    if (typeof state === 'undefined' || !state.user) {
      return 'Ingen aktive hendelser å vise.';
    }
    if (typeof isLeadershipUser === 'function' && isLeadershipUser()) {
      return 'Ingen aktive hendelser å vise.';
    }
    if (state.user.role === 'teamLead') {
      return 'Ingen aktive hendelser for dine team.';
    }
    return 'Ingen aktive hendelser for dine team. Hendelser i andre team vises ikke her.';
  }

  if (typeof renderIncidents !== 'function') return;

  renderIncidents = function renderIssue260Incidents() {
    const list = $('#incidentList');
    const sorted = [...state.incidents].sort((a, b) => {
      const priority = (incident) => (incident.escalatedToRaceLead ? 2 : 0) + (['critical', 'urgent'].includes(incident.severity) ? 1 : 0);
      return priority(b) - priority(a) || safeText(b.createdAt).localeCompare(safeText(a.createdAt));
    });
    if (!sorted.length) {
      list.replaceChildren(emptyState(issue260IncidentEmptyStateMessage()));
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
        markerTone: incident.escalatedToRaceLead ? 'warning' : incident.severity,
      });
      row.dataset.severity = incident.severity;
      row.dataset.escalated = String(!!incident.escalatedToRaceLead);
      return row;
    }));
  };

  window.arrangementsvaktIssue260Version = issue260Version;
})();
