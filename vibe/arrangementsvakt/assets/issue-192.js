(function () {
  state.memberImportPreview = null;
  state.memberImportLastFile = null;

  function adminVisible() {
    return typeof isPrimaryLeader === 'function' ? isPrimaryLeader(state.user) : state.user?.role === 'raceLead';
  }

  function sortedByName(items, getName) {
    return [...items].sort((a, b) => safeText(getName(a)).localeCompare(safeText(getName(b)), 'nb'));
  }

  function renderAdminList(target, items, emptyMessage) {
    if (!target) return;
    target.replaceChildren(...(items.length ? items : [emptyState(emptyMessage)]));
  }

  function renderAdminEvents() {
    const list = $('#adminEventList');
    if (!list) return;
    const rows = [...state.events]
      .sort((a, b) => safeText(b.createdAt).localeCompare(safeText(a.createdAt)))
      .map((eventItem) => structuredRow({
        title: eventItem.name || 'Arrangement uten navn',
        eyebrow: '',
        meta: [
          { text: eventItem.active === false ? 'Inaktiv' : 'Aktiv', tone: eventItem.active === false ? 'archived' : 'ok' },
          { text: formatDateTime(eventItem.createdAt) },
        ],
        ariaLabel: `Arrangement ${eventItem.name || 'uten navn'}`,
        onClick: () => {},
        markerTone: eventItem.id === state.settings.activeEventId ? 'ok' : 'info',
      }));
    renderAdminList(list, rows, 'Ingen arrangement er opprettet ennå.');
  }

  function renderAdminTeams() {
    const list = $('#adminTeamList');
    if (!list) return;
    const rows = sortedByName(state.teams, (team) => team.name).map((team) => {
      const memberCount = state.users.filter((user) => (user.teamIds || []).includes(team.id)).length;
      return structuredRow({
        title: team.name || 'Team uten navn',
        eyebrow: team.description || 'Team uten beskrivelse',
        meta: [
          { text: `${memberCount} medlemmer` },
          { text: `Teamleder: ${teamLeaderNames(team)}` },
          { text: team.active === false ? 'Inaktiv' : 'Aktiv', tone: team.active === false ? 'archived' : 'ok' },
        ],
        ariaLabel: `Åpne team ${team.name || 'uten navn'}`,
        onClick: () => openDetailModal('team', team.id),
        markerTone: team.active === false ? 'archived' : 'ok',
      });
    });
    renderAdminList(list, rows, 'Ingen team er opprettet ennå.');
  }

  function renderAdminUsers() {
    const list = $('#adminUserList');
    if (!list) return;
    const rows = sortedByName(state.users, (user) => user.displayName || user.fullName).map((user) => {
      const name = user.displayName || user.fullName || 'Bruker uten navn';
      const fullName = safeText(user.fullName).trim();
      const phone = safeText(user.phone).trim();
      return structuredRow({
        title: name,
        eyebrow: fullName && fullName !== name ? fullName : '',
        meta: [
          { text: (typeof displayRoleLabel === 'function' ? displayRoleLabel(user) : ((typeof displayRoleLabel === 'function' ? displayRoleLabel(user) : (roleLabels[user.role] || user.role)) || 'Ukjent rolle')) },
          { text: teamNames(user.teamIds || []) },
          { text: user.active === false ? 'Inaktiv' : 'Aktiv', tone: user.active === false ? 'archived' : 'ok' },
        ],
        foot: phone ? `Telefon: ${phone}` : '',
        ariaLabel: `Åpne bruker ${name}`,
        onClick: () => openDetailModal('user', user.id),
        markerTone: user.active === false ? 'archived' : 'info',
      });
    });
    renderAdminList(list, rows, 'Ingen brukere er opprettet ennå.');
  }

  function importSummaryText(data) {
    const summary = data?.summary;
    if (!summary) return '';
    if (data.mode === 'commit') {
      return `${data.imported || 0} importert. ${data.skipped || 0} hoppet over.`;
    }
    return `${summary.importable || 0} klare for import. ${summary.blocked || 0} må rettes eller er duplikater.`;
  }

  function renderImportedPins(data, target) {
    const createdUsers = data?.createdUsers || [];
    if (!createdUsers.length) return;
    const title = document.createElement('h4');
    title.textContent = 'Importerte brukere og PIN';
    const list = document.createElement('div');
    list.className = 'compact-list import-pin-list';
    list.replaceChildren(...createdUsers.map((user) => structuredRow({
      title: user.displayName || user.fullName,
      eyebrow: `Rad ${user.rowNumber} · PIN: ${user.pin}`,
      meta: [
        { text: (typeof displayRoleLabel === 'function' ? displayRoleLabel(user) : (roleLabels[user.role] || user.role)) },
        { text: user.active === false ? 'Inaktiv' : 'Aktiv', tone: user.active === false ? 'archived' : 'ok' },
      ],
      ariaLabel: `Importert bruker ${user.displayName || user.fullName}`,
      onClick: () => openDetailModal('user', user.id),
      markerTone: 'ok',
    })));
    target.append(title, list);
  }

  function renderMemberImportPreview() {
    const summary = $('#memberImportSummary');
    const preview = $('#memberImportPreview');
    const commitButton = $('#commitMemberImportButton');
    if (!summary || !preview || !commitButton) return;

    const data = state.memberImportPreview;
    commitButton.disabled = !state.memberImportLastFile || !data?.summary?.importable || data.mode === 'commit';
    summary.replaceChildren();
    preview.replaceChildren();
    if (!data) {
      summary.textContent = 'Last opp en XLSX-fil for å validere før import.';
      return;
    }

    const text = document.createElement('p');
    text.className = 'import-summary-text';
    text.textContent = importSummaryText(data);
    summary.append(text);
    renderImportedPins(data, summary);

    const rows = data.rows || [];
    if (!rows.length) {
      preview.replaceChildren(emptyState('Ingen rader å vise.'));
      return;
    }
    preview.replaceChildren(...rows.map((row) => {
      const values = row.values || {};
      const ready = row.status === 'ready';
      const messages = (row.messages || []).join(' ');
      return structuredRow({
        title: values.fullName || `Rad ${row.rowNumber}`,
        eyebrow: `Rad ${row.rowNumber} · ${messages}`,
        meta: [
          { text: values.roleLabel || roleLabels[values.role] || values.role || 'Rolle mangler' },
          { text: (values.teamNames || []).join(', ') || 'Ingen team' },
          { text: values.active === false ? 'Inaktiv' : 'Aktiv', tone: values.active === false ? 'archived' : 'ok' },
          { text: ready ? 'Klar' : 'Stoppet', tone: ready ? 'ok' : 'warning' },
        ],
        foot: values.phone ? `Telefon: ${values.phone}` : 'Telefonnummer ikke registrert',
        ariaLabel: `Importstatus for rad ${row.rowNumber}`,
        onClick: () => {},
        markerTone: ready ? 'ok' : 'warning',
      });
    }));
  }

  function renderAdminSections() {
    if (!adminVisible()) return;
    renderAdminEvents();
    renderAdminTeams();
    renderAdminUsers();
    renderMemberImportPreview();
  }

  async function submitMemberImport(action) {
    const form = $('#memberImportForm');
    const fileInput = $('[name="file"]', form);
    const file = action === 'commit' ? state.memberImportLastFile : fileInput.files[0];
    if (!file) {
      setStatus('Velg en XLSX-fil først.', 'warning');
      return;
    }
    if (!file.name.toLocaleLowerCase('nb-NO').endsWith('.xlsx')) {
      setStatus('Importfilen må være en .xlsx-fil.', 'error');
      return;
    }

    if (action !== 'commit') {
      state.memberImportLastFile = file;
    }
    const body = new FormData();
    body.append('action', action);
    body.append('file', file);
    try {
      const data = await api('member-import.php', { method: 'POST', body });
      state.memberImportPreview = data;
      renderMemberImportPreview();
      if (action === 'commit') {
        setStatus(`Import fullført: ${data.imported || 0} importert, ${data.skipped || 0} hoppet over.`);
        await refreshData();
      } else {
        setStatus(`Import validert: ${data.summary?.importable || 0} klare, ${data.summary?.blocked || 0} må rettes.`);
      }
    } catch (error) {
      setStatus(`Importen kunne ikke behandles: ${error.message}`, 'error');
    }
  }

  const issue192RenderShellBase = renderShell;
  renderShell = function patchedIssue192RenderShell() {
    issue192RenderShellBase();
    renderAdminSections();
  };

  $('#memberImportForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitMemberImport('preview');
  });

  $('#commitMemberImportButton')?.addEventListener('click', async () => {
    await submitMemberImport('commit');
  });

  $('#memberImportForm [name="file"]')?.addEventListener('change', () => {
    state.memberImportPreview = null;
    state.memberImportLastFile = null;
    renderMemberImportPreview();
  });
}());
