(() => {
  const issue275Version = 'v0.12.3-issue-286-compact-message-cards-2026-06-09';

  state.messageStatusById = state.messageStatusById || {};

  function issue275IsLeadership(user = state.user) {
    return !!user && (
      user.role === 'raceLead'
      || user.role === 'leadership'
      || user.isLeadership === true
      || user.isPrimaryLeader === true
    );
  }

  function issue275IsTeamLead(user = state.user) {
    return !!user && user.role === 'teamLead' && !issue275IsLeadership(user);
  }

  function issue275Number(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function issue275StatusText(row, includeAck) {
    const total = issue275Number(row.total);
    const read = issue275Number(row.read);
    const acknowledged = issue275Number(row.acknowledged);
    return includeAck
      ? `Lest ${read}/${total} · Bekreftet ${acknowledged}/${total}`
      : `Lest ${read}/${total}`;
  }

  function issue275PersonText(row, requiresAck) {
    const read = row.readAt ? 'Lest' : 'Ulest';
    if (!requiresAck) return read;
    return `${read} / ${row.acknowledgedAt ? 'Bekreftet' : 'Ikke bekreftet'}`;
  }

  function issue275MergeStatuses() {
    state.messages = (state.messages || []).map((message) => {
      const status = state.messageStatusById?.[message.id];
      return status ? { ...message, ...status } : message;
    });
  }

  async function issue275RefreshStatus() {
    if (!state.user || (!issue275IsLeadership() && !issue275IsTeamLead())) {
      state.messageStatusById = {};
      issue275MergeStatuses();
      return;
    }
    try {
      const data = await api('message-status.php');
      state.messageStatusById = data.statusByMessage || {};
      issue275MergeStatuses();
    } catch {
      state.messageStatusById = {};
      issue275MergeStatuses();
    }
  }

  function issue275RemoveDuplicateSummary(row) {
    $$('.row-meta .row-chip', row).forEach((chip) => {
      if (/^(Lest|Bekreftet) \d+\/\d+/.test(chip.textContent.trim())) {
        chip.remove();
      }
    });
  }

  function issue275RowsForMessage(message) {
    if (issue275IsLeadership()) {
      return (message.receiptTeamSummary || []).map((row) => ({
        label: row.teamName || 'Ukjent team',
        value: issue275StatusText(row, !!message.requiresAcknowledgement),
      }));
    }
    if (issue275IsTeamLead()) {
      return (message.receiptUsers || []).map((row) => ({
        label: row.name || 'Ukjent medlem',
        value: issue275PersonText(row, !!message.requiresAcknowledgement),
        note: (row.teamNames || []).join(', '),
      }));
    }
    return [];
  }

  function issue275StatusBlock(message) {
    const rows = issue275RowsForMessage(message);
    if (!rows.length) return null;

    const block = document.createElement('div');
    block.className = 'issue275-detail-status';
    const heading = document.createElement('h3');
    heading.className = 'issue275-status-heading';
    heading.textContent = issue275IsLeadership() ? 'Status per gruppe/team' : 'Status i egne team';
    block.append(heading);

    const list = document.createElement('div');
    list.className = 'issue275-status-list';
    list.replaceChildren(...rows.map((row) => {
      const item = document.createElement('p');
      item.className = 'issue275-status-row';
      const label = document.createElement('strong');
      label.textContent = row.label;
      const value = document.createElement('span');
      value.textContent = row.value;
      item.append(label, value);
      if (row.note) {
        const note = document.createElement('small');
        note.textContent = row.note;
        item.append(note);
      }
      return item;
    }));
    block.append(list);
    return block;
  }

  function issue275EnhanceMessageCards() {
    const rows = $$('#messageList .message-row[data-type="controlled"]');
    rows.forEach((row) => {
      $('.issue275-card-status', row)?.remove();
      row.classList.add('issue286-compact-message-row');
    });
  }

  const issue275RenderMessagesBase = renderMessages;
  renderMessages = function issue275RenderMessages() {
    issue275MergeStatuses();
    issue275RenderMessagesBase();
    issue275EnhanceMessageCards();
  };

  const issue275RenderDetailModalBase = renderDetailModal;
  renderDetailModal = function issue275RenderDetailModal() {
    issue275RenderDetailModalBase();
    if (state.detailModal.type !== 'message') return;
    const body = $('#detailDialogBody');
    const message = state.messages.find((item) => item.id === state.detailModal.id);
    if (!body || !message?.canViewRoleStatus) return;
    $('.receipt-summary', body)?.remove();
    $('.receipt-list', body)?.remove();
    $('.issue275-detail-status', body)?.remove();
    const stack = $('.detail-stack', body) || body;
    const block = issue275StatusBlock(message);
    if (block) stack.append(block);
  };

  const issue275RefreshDataBase = refreshData;
  refreshData = async function issue275RefreshData() {
    await issue275RefreshDataBase();
    await issue275RefreshStatus();
    renderShell();
  };

  window.arrangementsvaktIssue275 = {
    version: issue275Version,
    refreshStatus: issue275RefreshStatus,
  };

  if (state.user) {
    issue275RefreshStatus()
      .then(() => renderShell())
      .catch(() => {});
  }
})();
