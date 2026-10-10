(function () {
  state.teamChatMessages = [];
  state.unreadMessageCount = 0;
  state.controlledTargets = {};
  state.teamChatTeams = [];
  state.chatMode = state.chatMode || 'messages';

  const issue183Errors = {
    controlled_message_not_allowed: 'Medlemmer kan ikke sende styrte meldinger.',
    controlled_target_not_allowed: 'Mottakeren er ikke tilgjengelig for rollen din.',
    direct_message_not_allowed: 'Direktemelding er ikke tilgjengelig for mottakeren.',
    invalid_message_type: 'Meldingstypen er ikke gyldig.',
    missing_message: 'Skriv en melding først.',
    missing_message_id: 'Meldingen mangler id.',
    message_not_found: 'Meldingen finnes ikke lenger.',
    target_user_not_allowed: 'Mottakeren er utenfor ansvarsområdet ditt.',
    team_not_allowed: 'Teamet er utenfor ansvarsområdet ditt.',
    teamchat_not_allowed: 'Teamchat er ikke tilgjengelig for dette teamet.',
  };

  function issue183FriendlyError(error) {
    return issue183Errors[error?.code || error?.message] || 'Meldingen kunne ikke behandles.';
  }

  function compactMessageTime(value) {
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

  function issue183TeamOptions(teams) {
    return sortTeamsForChoice(teams || []).map((team) => {
      const option = document.createElement('option');
      option.value = team.id;
      option.textContent = team.name || 'Uten navn';
      return option;
    });
  }

  function selectedValues(select) {
    return [...select.selectedOptions].map((option) => option.value).filter(Boolean);
  }

  function controlledScopeOptions() {
    if (!state.user) return [];
    if (state.user.role === 'raceLead') {
      return [
        { value: 'all', label: 'Alle' },
        { value: 'teams', label: 'Team' },
        { value: 'teamLeads', label: 'Teamledere' },
        { value: 'user', label: 'Teamleder' },
      ];
    }
    if (state.user.role === 'teamLead') {
      return [
        { value: 'teams', label: 'Egne team' },
        { value: 'members', label: 'Medlem' },
        { value: 'raceLead', label: 'Løpsleder' },
      ];
    }
    return [];
  }

  function controlledUserTargets(targetType) {
    const targets = state.controlledTargets || {};
    if (targetType === 'user') return targets.teamLeadTargets || [];
    if (targetType === 'members') return targets.memberTargets || [];
    return [];
  }

  function installChatLayout() {
    const panel = $('#chatPanel');
    if (!panel || panel.dataset.issue183Installed === 'true') return;
    panel.dataset.issue183Installed = 'true';
    const heading = $('.section-heading', panel);

    const switcher = document.createElement('div');
    switcher.className = 'chat-mode-switch';
    switcher.setAttribute('role', 'tablist');
    switcher.setAttribute('aria-label', 'Chatvisning');
    ['messages', 'teamchat'].forEach((mode) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chat-mode-button';
      button.dataset.chatMode = mode;
      button.setAttribute('role', 'tab');
      button.addEventListener('click', () => {
        state.chatMode = mode;
        renderMessages();
      });
      switcher.append(button);
    });

    const messagesPane = document.createElement('section');
    messagesPane.id = 'controlledMessagesPane';
    messagesPane.className = 'chat-pane';
    messagesPane.innerHTML = `
      <div id="messageList" class="message-list" aria-live="polite"></div>
      <details id="controlledMessageComposeDetails" class="message-compose-details" open>
        <summary>Ny styrt melding</summary>
        <form id="controlledMessageForm" class="card-form controlled-message-form">
          <label>Mottakere <select name="targetType" required></select></label>
          <label data-controlled-team-row>Team <select name="teamIds" multiple></select></label>
          <label data-controlled-user-row>Mottaker <select name="targetUserId"></select></label>
          <label class="checkbox"><input name="requiresAcknowledgement" type="checkbox"> Krev Lest-bekreftelse</label>
          <label>Melding <textarea name="body" maxlength="1200" required></textarea></label>
          <button type="submit">Send styrt melding</button>
        </form>
      </details>
    `;

    const teamChatPane = document.createElement('section');
    teamChatPane.id = 'teamChatPane';
    teamChatPane.className = 'chat-pane hidden';
    teamChatPane.innerHTML = `
      <div id="teamChatList" class="teamchat-list" aria-live="polite"></div>
      <details id="teamChatComposeDetails" class="message-compose-details" open>
        <summary>Ny teamchat</summary>
        <form id="teamChatForm" class="card-form">
          <label>Team <select name="teamId" required></select></label>
          <label>Melding <textarea name="body" maxlength="1200" required></textarea></label>
          <button type="submit">Send i teamchat</button>
        </form>
      </details>
    `;

    panel.replaceChildren(heading, switcher, messagesPane, teamChatPane);
    $('[name="targetType"]', messagesPane).addEventListener('change', fillControlledTargetControls);
    $('#controlledMessageForm').addEventListener('submit', sendControlledMessage);
    $('#teamChatForm').addEventListener('submit', sendTeamChatMessage);
  }

  function fillControlledTargetControls() {
    const form = $('#controlledMessageForm');
    if (!form) return;
    const scopeSelect = $('[name="targetType"]', form);
    const current = scopeSelect.value;
    const options = controlledScopeOptions();
    scopeSelect.replaceChildren(...options.map(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      option.selected = value === current;
      return option;
    }));
    if (!options.some((option) => option.value === scopeSelect.value)) {
      scopeSelect.value = options[0]?.value || '';
    }

    const targetType = scopeSelect.value;
    const teamRow = $('[data-controlled-team-row]', form);
    const teamSelect = $('[name="teamIds"]', form);
    const userRow = $('[data-controlled-user-row]', form);
    const userSelect = $('[name="targetUserId"]', form);
    const teamTargets = state.controlledTargets?.teamTargets || [];
    const userTargets = controlledUserTargets(targetType);

    const showTeamRow = targetType === 'teams';
    teamRow.classList.toggle('hidden', !showTeamRow);
    teamSelect.required = showTeamRow;
    if (showTeamRow) {
      const previous = new Set(selectedValues(teamSelect));
      teamSelect.replaceChildren(...issue183TeamOptions(teamTargets));
      [...teamSelect.options].forEach((option, index) => {
        option.selected = previous.has(option.value) || (previous.size === 0 && index === 0);
      });
    } else {
      teamSelect.replaceChildren();
    }

    const showUserRow = targetType === 'user' || targetType === 'members';
    userRow.classList.toggle('hidden', !showUserRow);
    userSelect.required = showUserRow;
    if (showUserRow) {
      const previous = userSelect.value;
      userSelect.replaceChildren(...userTargets.map((user) => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.displayName || user.fullName || 'Uten navn';
        option.selected = previous === user.id;
        return option;
      }));
    } else {
      userSelect.replaceChildren();
    }

    const canSendControlled = options.length > 0;
    $('#controlledMessageComposeDetails').classList.toggle('hidden', !canSendControlled);
  }

  function fillTeamChatControls() {
    const form = $('#teamChatForm');
    if (!form) return;
    const select = $('[name="teamId"]', form);
    const previous = select.value;
    const teams = state.teamChatTeams || state.controlledTargets?.teamChatTeams || [];
    select.replaceChildren(...issue183TeamOptions(teams));
    if (teams.some((team) => team.id === previous)) {
      select.value = previous;
    }
    $('#teamChatComposeDetails').classList.toggle('hidden', teams.length === 0);
  }

  fillChatControls = function patchedIssue183FillChatControls() {
    installChatLayout();
    fillControlledTargetControls();
    fillTeamChatControls();
  };

  messageTypeLabel = function patchedIssue183MessageTypeLabel(message) {
    if (!message || message.type !== 'controlled') return 'Melding';
    if (message.targetType === 'all') return 'Til alle';
    if (message.targetType === 'teamLeads') return 'Til teamledere';
    if (message.targetType === 'raceLead') return 'Til Løpsleder';
    if (message.targetType === 'teams') return `Til team · ${message.targetLabel || 'Ukjent team'}`;
    if (message.targetType === 'members') return `Til medlem · ${message.targetLabel || 'Ukjent medlem'}`;
    return `Direkte · ${message.targetLabel || message.targetUserName || 'Ukjent mottaker'}`;
  };

  function syncChatModeButtons() {
    $$('.chat-mode-button').forEach((button) => {
      const active = button.dataset.chatMode === state.chatMode;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.textContent = button.dataset.chatMode === 'messages' ? 'Meldinger' : 'Teamchat';
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
      const preview = safeText(message.body).slice(0, 96) || 'Tom melding';
      const meta = [
        { text: message.senderName || 'Ukjent avsender' },
        { text: compactMessageTime(message.createdAt) },
      ];
      if (!message.read) meta.push({ text: 'Ulest', tone: 'warning' });
      if (message.requiresAcknowledgement && message.acknowledged) meta.push({ text: 'Bekreftet', tone: 'ok' });
      const item = structuredRow({
        className: `compact-row message-row${message.read ? '' : ' is-unread'}`,
        title: messageTypeLabel(message),
        eyebrow: preview,
        meta,
        ariaLabel: `Åpne melding fra ${message.senderName || 'ukjent avsender'}`,
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
        compactMessageTime(message.createdAt),
      ].filter(Boolean).join(' · ');
      const body = document.createElement('p');
      body.className = 'teamchat-body';
      body.textContent = message.body || '';
      item.replaceChildren(header, body);
      return item;
    }));
  }

  renderMessages = function patchedIssue183RenderMessages() {
    fillChatControls();
    syncChatModeButtons();
    renderControlledMessages();
    renderTeamChatMessages();
  };

  const issue183RenderBottomNavBase = renderBottomNav;
  renderBottomNav = function patchedIssue183RenderBottomNav() {
    issue183RenderBottomNavBase();
    $$('#bottomNav .bottom-nav-button').forEach((button) => {
      if (button.getAttribute('aria-label') !== 'Meldinger' && button.textContent.trim() !== 'Chat') return;
      button.classList.add('has-unread-badge');
      if (state.unreadMessageCount > 0) {
        const badge = document.createElement('span');
        badge.className = 'nav-unread-badge';
        badge.textContent = String(state.unreadMessageCount);
        button.append(badge);
      }
    });
  };

  const issue183RefreshDataBase = refreshData;
  refreshData = async function patchedIssue183RefreshData() {
    if (!state.user) return issue183RefreshDataBase();
    const [teams, users, events, incidents, messages] = await Promise.all([
      api('teams.php'), api('users.php'), api('events.php'), api('incidents.php'), api('messages.php'),
    ]);
    state.teams = teams.teams;
    state.users = users.users;
    state.events = events.events;
    state.settings = events.settings;
    state.incidents = incidents.incidents;
    state.messages = messages.messages || [];
    state.teamChatMessages = messages.teamChatMessages || [];
    state.unreadMessageCount = messages.unreadCount || 0;
    state.messageTargets = messages.directTargets || [];
    state.controlledTargets = messages.controlledTargets || {};
    state.teamChatTeams = messages.teamChatTeams || state.controlledTargets.teamChatTeams || [];
    renderShell();
  };

  const issue183OpenDetailModalBase = openDetailModal;
  openDetailModal = function patchedIssue183OpenDetailModal(type, id) {
    issue183OpenDetailModalBase(type, id);
    if (type === 'message') markMessageRead(id);
  };

  const issue183RenderDetailModalBase = renderDetailModal;
  renderDetailModal = function patchedIssue183RenderDetailModal() {
    if (state.detailModal.type !== 'message') {
      issue183RenderDetailModalBase();
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
      compactMessageTime(message.createdAt),
      message.requiresAcknowledgement ? 'Krever bekreftelse' : '',
    ].filter(Boolean).join(' · ');
    const bodyText = document.createElement('p');
    bodyText.className = 'message-body';
    bodyText.textContent = message.body;
    detail.replaceChildren(meta, bodyText);

    if (message.requiresAcknowledgement && !message.acknowledged && message.senderId !== state.user?.id) {
      detail.append(rowButton('secondary acknowledge-button', 'Lest', 'Bekreft melding som lest', () => acknowledgeMessage(message.id)));
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

  async function markMessageRead(messageId) {
    const message = state.messages.find((item) => item.id === messageId);
    if (!message || message.read || message.senderId === state.user?.id) return;
    message.read = true;
    state.unreadMessageCount = Math.max(0, state.unreadMessageCount - 1);
    renderBottomNav();
    renderMessages();
    try {
      const data = await api('messages.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'markRead', messageId }),
      });
      state.messages = data.messages || state.messages;
      state.unreadMessageCount = data.unreadCount ?? state.unreadMessageCount;
      renderBottomNav();
      renderMessages();
    } catch (error) {
      setStatus(issue183FriendlyError(error), 'error');
      await refreshData();
    }
  }

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
      setStatus(issue183FriendlyError(error), 'error');
    }
  }

  async function sendControlledMessage(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const targetType = $('[name="targetType"]', form).value;
    const payload = {
      type: 'controlled',
      targetType,
      body: $('[name="body"]', form).value,
      requiresAcknowledgement: $('[name="requiresAcknowledgement"]', form).checked,
    };
    if (targetType === 'teams') {
      payload.teamIds = selectedValues($('[name="teamIds"]', form));
    }
    if (targetType === 'user' || targetType === 'members') {
      payload.targetUserId = $('[name="targetUserId"]', form).value;
    }
    try {
      await api('messages.php', { method: 'POST', body: JSON.stringify(payload) });
      form.reset();
      setStatus('Styrt melding er sendt.');
      await refreshData();
    } catch (error) {
      setStatus(issue183FriendlyError(error), 'error');
    }
  }

  async function sendTeamChatMessage(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      type: 'teamChat',
      teamId: $('[name="teamId"]', form).value,
      body: $('[name="body"]', form).value,
    };
    try {
      await api('messages.php', { method: 'POST', body: JSON.stringify(payload) });
      form.reset();
      setStatus('Teamchat er sendt.');
      await refreshData();
      state.chatMode = 'teamchat';
      renderMessages();
    } catch (error) {
      setStatus(issue183FriendlyError(error), 'error');
    }
  }
}());
