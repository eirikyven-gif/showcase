(function () {
  if (state.activeTab === 'overview' && !state.user) {
    state.activeTab = null;
  }

  function normalizedIds(ids) {
    return Array.isArray(ids) ? ids.map(String).filter(Boolean) : [];
  }

  function ledTeamIdsForCurrentUser(teams) {
    const userId = String(state.user?.id || '');
    const ledIds = (teams || [])
      .filter((team) => userId && (team.leaderIds || []).map(String).includes(userId))
      .map((team) => String(team.id || ''))
      .filter(Boolean);
    return ledIds.length ? ledIds : normalizedIds(state.user?.teamIds || []);
  }

  roleTabs = function patchedIssue187RoleTabs() {
    if (!state.user) return [];
    if (state.user.role === 'raceLead') {
      return [
        { id: 'incidents', label: 'Hendelser' },
        { id: 'overview', label: 'Oversikt' },
        { id: 'teams', label: 'Team' },
        { id: 'chat', label: 'Meldinger' },
        { id: 'admin', label: 'Admin' },
      ];
    }
    if (state.user.role === 'teamLead') {
      return [
        { id: 'incidents', label: 'Hendelser' },
        { id: 'overview', label: 'Oversikt' },
        { id: 'teams', label: 'Mine team' },
        { id: 'chat', label: 'Meldinger' },
        { id: 'members', label: 'Medlemmer' },
      ];
    }
    return [
      { id: 'chat', label: 'Meldinger' },
      { id: 'teams', label: 'Mine team' },
      { id: 'incidents', label: 'Hendelser' },
      { id: 'offline', label: 'Ikke sendt' },
    ];
  };

  normalizeActiveTab = function patchedIssue187NormalizeActiveTab() {
    const tabs = roleTabs();
    if (!tabs.some((tab) => tab.id === state.activeTab)) {
      state.activeTab = tabs[0]?.id || 'overview';
    }
  };

  getAllowedTeams = function patchedIssue187GetAllowedTeams() {
    if (!state.user) return [];
    const activeTeams = state.teams.filter((team) => team.active !== false);
    if (state.user.role === 'raceLead') return sortTeamsForChoice(activeTeams);
    if (state.user.role === 'teamLead') {
      const ledIds = new Set(ledTeamIdsForCurrentUser(activeTeams));
      return sortTeamsForChoice(activeTeams.filter((team) => ledIds.has(String(team.id || ''))));
    }
    const memberTeamIds = new Set(normalizedIds(state.user.teamIds || []));
    return sortTeamsForChoice(activeTeams.filter((team) => memberTeamIds.has(String(team.id || ''))));
  };

  renderBottomNav = function patchedIssue187RenderBottomNav() {
    const nav = $('#bottomNav');
    const tabs = roleTabs();
    nav.replaceChildren(...tabs.map((tab) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bottom-nav-button';
      button.dataset.tabId = tab.id;
      button.setAttribute('aria-current', tab.id === state.activeTab ? 'page' : 'false');

      const label = document.createElement('span');
      label.className = 'nav-label';
      label.textContent = tab.label;
      button.append(label);

      if (tab.id === 'chat') {
        button.classList.add('has-unread-badge');
        if ((state.unreadMessageCount || 0) > 0) {
          const badge = document.createElement('span');
          badge.className = 'nav-unread-badge';
          badge.textContent = String(state.unreadMessageCount);
          button.append(badge);
        }
      }

      button.addEventListener('click', () => {
        state.activeTab = tab.id;
        renderShell();
      });
      return button;
    }));
  };

  function compactIssue187MessageTime(value) {
    if (!value) return 'Ukjent tid';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Ukjent tid';
    const now = new Date();
    const sameDay = date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate();
    if (sameDay) {
      return date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function syncAcknowledgementControl() {
    const form = $('#controlledMessageForm');
    if (!form) return;
    const targetType = $('[name="targetType"]', form)?.value || '';
    const checkbox = $('[name="requiresAcknowledgement"]', form);
    if (!checkbox) return;
    const row = checkbox.closest('label');
    const upwardToRaceLead = state.user?.role === 'teamLead' && targetType === 'raceLead';
    if (upwardToRaceLead) checkbox.checked = false;
    checkbox.disabled = upwardToRaceLead;
    row?.classList.toggle('hidden', upwardToRaceLead);
  }

  function installAcknowledgementGuard() {
    const form = $('#controlledMessageForm');
    if (!form || form.dataset.issue187AckGuard === 'true') return;
    form.dataset.issue187AckGuard = 'true';
    $('[name="targetType"]', form)?.addEventListener('change', () => {
      setTimeout(syncAcknowledgementControl, 0);
    });
    form.addEventListener('submit', () => syncAcknowledgementControl());
  }

  function canManuallyAcknowledge(message) {
    return !!message?.requiresAcknowledgement
      && !message.acknowledged
      && message.senderId !== state.user?.id
      && message.targetType !== 'raceLead';
  }

  function controlledMessagePreview(message) {
    const normalized = safeText(message.body).replace(/\s+/g, ' ').trim();
    if (!normalized) return 'Tom melding';
    if (normalized.length <= 140) return normalized;
    return `${normalized.slice(0, 139).trim()}…`;
  }

  function controlledMessageFromSelf(message) {
    const senderId = String(message.senderId || '');
    const userId = String(state.user?.id || '');
    return !!senderId && senderId === userId;
  }

  function controlledMessageMeta(message) {
    const fromSelf = controlledMessageFromSelf(message);
    const sender = message.senderName || 'Ukjent avsender';
    const meta = [{ text: fromSelf ? 'Sendt av deg' : `Fra ${sender}` }];

    if (fromSelf) {
      const receipt = message.receiptSummary || null;
      if (message.requiresAcknowledgement && receipt) {
        const total = Number(receipt.total) || 0;
        const acknowledged = Number(receipt.acknowledged) || 0;
        meta.push({
          text: `Bekreftet ${acknowledged}/${total}`,
          tone: total > 0 && acknowledged >= total ? 'ok' : 'warning',
        });
      }
      return meta;
    }

    meta.push({ text: message.read ? 'Lest' : 'Ulest', tone: message.read ? 'ok' : 'warning' });
    if (message.requiresAcknowledgement && message.targetType !== 'raceLead') {
      meta.push({
        text: message.acknowledged ? 'Bekreftet' : 'Må bekreftes',
        tone: message.acknowledged ? 'ok' : 'warning',
      });
    }
    return meta;
  }

  function controlledMessageAriaLabel(message) {
    const status = controlledMessageFromSelf(message)
      ? 'sendt av deg'
      : (message.read ? 'lest' : 'ulest');
    return `Åpne styrt melding ${messageTypeLabel(message)} fra ${message.senderName || 'ukjent avsender'}, ${status}, sendt ${compactIssue187MessageTime(message.createdAt)}`;
  }

  function syncChatModeButtons() {
    $$('.chat-mode-button').forEach((button) => {
      const active = button.dataset.chatMode === state.chatMode;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.replaceChildren(document.createTextNode(button.dataset.chatMode === 'messages' ? 'Meldinger' : 'Teamchat'));
      if (button.dataset.chatMode === 'messages' && state.unreadMessageCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'chat-mode-badge';
        badge.textContent = String(state.unreadMessageCount);
        button.append(badge);
      }
    });
    $('#controlledMessagesPane')?.classList.toggle('hidden', state.chatMode !== 'messages');
    $('#teamChatPane')?.classList.toggle('hidden', state.chatMode !== 'teamchat');
  }

  function renderControlledMessages() {
    const list = $('#messageList');
    if (!list) return;
    if (!state.messages.length) {
      list.replaceChildren(emptyState('Ingen styrte meldinger ennå.'));
      return;
    }
    list.replaceChildren(...state.messages.map((message) => {
      const item = structuredRow({
        className: `compact-row message-row${message.read ? '' : ' is-unread'}`,
        title: messageTypeLabel(message),
        eyebrow: controlledMessagePreview(message),
        meta: controlledMessageMeta(message),
        foot: `Sendt ${compactIssue187MessageTime(message.createdAt)}`,
        ariaLabel: controlledMessageAriaLabel(message),
        onClick: () => openDetailModal('message', message.id),
        markerTone: message.read ? 'info' : 'warning',
      });
      item.dataset.type = 'controlled';
      item.dataset.unread = String(!message.read);
      return item;
    }));
  }

  function renderTeamChatMessages() {
    const list = $('#teamChatList');
    if (!list) return;
    if (!state.teamChatMessages.length) {
      list.replaceChildren(emptyState('Ingen teamchat ennå.'));
      return;
    }
    list.replaceChildren(...state.teamChatMessages.map((message) => {
      const item = document.createElement('article');
      item.className = 'teamchat-message';
      const header = document.createElement('p');
      header.className = 'teamchat-meta';
      header.textContent = [
        message.teamName || 'Ukjent team',
        message.senderName || 'Ukjent avsender',
        compactIssue187MessageTime(message.createdAt),
      ].filter(Boolean).join(' · ');
      const body = document.createElement('p');
      body.className = 'teamchat-body';
      body.textContent = message.body || '';
      item.replaceChildren(header, body);
      return item;
    }));
  }

  renderMessages = function patchedIssue187RenderMessages() {
    fillChatControls();
    installAcknowledgementGuard();
    syncAcknowledgementControl();
    syncChatModeButtons();
    renderControlledMessages();
    renderTeamChatMessages();
  };

  async function acknowledgeMessage(messageId) {
    try {
      const data = await api('messages.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'acknowledge', messageId }),
      });
      state.messages = data.messages || state.messages;
      state.unreadMessageCount = data.unreadCount ?? state.unreadMessageCount;
      setStatus('Meldingen er bekreftet.');
      renderBottomNav();
      renderMessages();
      renderDetailModal();
    } catch (error) {
      setStatus('Meldingen kunne ikke behandles.', 'error');
    }
  }

  const issue187RenderDetailModalBase = renderDetailModal;
  renderDetailModal = function patchedIssue187RenderDetailModal() {
    if (state.detailModal.type !== 'message') {
      issue187RenderDetailModalBase();
      return;
    }

    const message = state.messages.find((item) => item.id === state.detailModal.id);
    const title = $('#detailDialogTitle');
    const eyebrow = $('#detailDialogEyebrow');
    const body = $('#detailDialogBody');
    body.replaceChildren();
    if (!message) {
      eyebrow.textContent = 'Melding';
      title.textContent = 'Melding ikke funnet';
      body.textContent = 'Meldingen finnes ikke lenger.';
      return;
    }

    eyebrow.textContent = 'Styrt melding';
    title.textContent = messageTypeLabel(message);

    const detail = document.createElement('div');
    detail.className = 'detail-stack';
    const meta = document.createElement('p');
    meta.className = 'message-meta';
    meta.textContent = [
      message.senderName,
      compactIssue187MessageTime(message.createdAt),
      message.requiresAcknowledgement && message.targetType !== 'raceLead' ? 'Krever bekreftelse' : '',
    ].filter(Boolean).join(' · ');
    const bodyText = document.createElement('p');
    bodyText.className = 'message-body';
    bodyText.textContent = message.body;
    detail.replaceChildren(meta, bodyText);

    if (canManuallyAcknowledge(message)) {
      const acknowledgeActionLabel = 'Bekreft lest';
      detail.append(rowButton('secondary acknowledge-button', acknowledgeActionLabel, acknowledgeActionLabel, () => acknowledgeMessage(message.id)));
    }

    if (message.canViewReceipts && message.receiptSummary) {
      const summary = document.createElement('p');
      summary.className = 'receipt-summary';
      const receipt = message.receiptSummary;
      summary.textContent = `Lest ${receipt.read}/${receipt.total} · Bekreftet ${receipt.acknowledged}/${receipt.total}`;
      detail.append(summary);
      if (Array.isArray(message.receiptUsers) && message.receiptUsers.length) {
        const receiptList = document.createElement('div');
        receiptList.className = 'receipt-list';
        receiptList.replaceChildren(...message.receiptUsers.map((item) => {
          const row = document.createElement('p');
          row.textContent = `${item.name}: ${item.acknowledgedAt ? 'Bekreftet' : (item.readAt ? 'Lest' : 'Ulest')}`;
          return row;
        }));
        detail.append(receiptList);
      }
    }
    body.append(detail);
  };
}());