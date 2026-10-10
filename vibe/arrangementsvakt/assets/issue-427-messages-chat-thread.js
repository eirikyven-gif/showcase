(() => {
  const issue427Version = 'v0.16.19-issue-501-message-cards-2026-06-30';
  const chatEndpoint = 'chat-threads.php';

  state.issue427Messages = state.issue427Messages || {
    selectedConversationId: '',
    search: '',
    filter: 'all',
    loadingThreads: false,
  };
  state.threadChat = state.threadChat || {
    threads: [],
    comments: [],
    teams: [],
    myTeamIds: [],
    filter: 'all',
    teamId: '',
    loaded: false,
  };

  function issue427Text(value) {
    return String(value ?? '').trim();
  }

  function issue427Objects(value) {
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
  }

  function issue427Timestamp(value) {
    const timestamp = new Date(issue427Text(value)).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function issue427Time(value) {
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

  function issue427Preview(value, maxLength = 96) {
    const normalized = issue427Text(value).replace(/\s+/g, ' ');
    if (!normalized) return 'Tom melding';
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 1).trim()}...`;
  }

  function issue427OwnsMessage(message) {
    const userId = issue427Text(state.user?.id);
    return !!userId && [message.senderId, message.createdBy].some((id) => issue427Text(id) === userId);
  }

  function issue427Unread(message) {
    return message.read === false && !issue427OwnsMessage(message);
  }

  function issue427ConversationKind(message) {
    if (message.type === 'teamChat') return 'teamchat';
    if (message.type === 'broadcast' || message.targetType === 'all' || message.targetType === 'teamLeads') return 'broadcast';
    if (message.type === 'directRaceLead' || ['raceLead', 'user', 'members'].includes(message.targetType)) return 'direct';
    if (message.type === 'team' || message.targetType === 'teams') return 'team';
    return 'controlled';
  }

  function issue427KindLabel(kind) {
    if (kind === 'broadcast' || kind === 'team') return 'Varsel';
    if (kind === 'direct') return 'Direkte melding';
    if (kind === 'teamchat') return 'Chat';
    if (kind === 'thread') return 'Hendelse';
    return 'Melding';
  }

  function issue427KindIcon(kind) {
    if (kind === 'broadcast' || kind === 'team') return '!';
    if (kind === 'direct') return 'DM';
    if (kind === 'teamchat') return 'C';
    if (kind === 'thread') return 'H';
    return 'M';
  }

  function issue427TypeTone(conversation) {
    if (conversation?.type === 'teamchat') return 'ok';
    if (conversation?.type === 'thread') return 'incident';
    if (conversation?.kind === 'direct') return 'info';
    if (conversation?.kind === 'broadcast' || conversation?.kind === 'team') return 'warning';
    return 'neutral';
  }

  function issue427OneWayExplanation(conversation) {
    if (conversation?.kind === 'direct') {
      return 'Direkte meldinger kan åpnes, leses og eventuelt bekreftes, men ikke besvares her.';
    }
    if (conversation?.kind === 'broadcast') {
      return 'Varsler og fellesmeldinger kan åpnes, leses og eventuelt bekreftes, men ikke besvares her.';
    }
    return 'Varsler kan åpnes, leses og eventuelt bekreftes, men ikke besvares her.';
  }

  function issue427ControlledTitle(message) {
    if (message.targetType === 'all') return 'Alle';
    if (message.targetType === 'teamLeads') return 'Teamledere';
    if (message.targetType === 'raceLead') return 'Løpsleder';
    if (message.targetType === 'teams') return message.targetLabel || message.teamName || 'Gruppe';
    if (message.targetType === 'members') return message.targetLabel || 'Medlem';
    if (message.targetType === 'user') return message.targetLabel || message.targetUserName || 'Direkte';
    return typeof messageTypeLabel === 'function' ? messageTypeLabel(message) : 'Melding';
  }

  function issue427MessageKey(message) {
    const kind = issue427ConversationKind(message);
    if (message.type === 'teamChat') return `teamchat:${issue427Text(message.teamId || message.teamName || 'team')}`;
    const target = issue427Text(message.targetUserId || message.targetLabel || message.targetUserName || message.teamId || message.teamName || message.targetType || message.type || 'inbox');
    return `${kind}:${target}`;
  }

  function issue427ThreadComments(threadId) {
    const selectedThreadId = issue427Text(threadId);
    return issue427Objects(state.threadChat?.comments)
      .filter((comment) => issue427Text(comment.threadId) === selectedThreadId)
      .sort((a, b) => issue427Timestamp(a.createdAt) - issue427Timestamp(b.createdAt));
  }

  function issue427ThreadPreview(thread) {
    const comments = issue427ThreadComments(thread.id);
    const latest = comments[comments.length - 1];
    return issue427Preview(latest?.body || thread.body || '');
  }

  function issue427ApplyThreadResponse(data = {}) {
    const chatFilter = data && typeof data.chatFilter === 'object' ? data.chatFilter : {};
    state.threadChat.threads = issue427Objects(data.chatThreads).filter((thread) => issue427Text(thread.id));
    state.threadChat.comments = issue427Objects(data.chatComments).filter((comment) => issue427Text(comment.threadId));
    state.threadChat.teams = issue427Objects(data.chatTeams).filter((team) => issue427Text(team.id));
    state.threadChat.myTeamIds = Array.isArray(data.myTeamIds) ? data.myTeamIds.map(issue427Text).filter(Boolean) : [];
    state.threadChat.filter = ['all', 'mine', 'team'].includes(chatFilter.mode) ? chatFilter.mode : (state.threadChat.filter || 'all');
    state.threadChat.teamId = issue427Text(chatFilter.teamId || state.threadChat.teamId || '');
    state.threadChat.loaded = true;
  }

  function issue427ChatPath() {
    const params = new URLSearchParams({
      filter: ['all', 'mine', 'team'].includes(state.threadChat.filter) ? state.threadChat.filter : 'all',
      t: String(Date.now()),
    });
    if (state.threadChat.filter === 'team' && state.threadChat.teamId) params.set('teamId', state.threadChat.teamId);
    return `${chatEndpoint}?${params.toString()}`;
  }

  async function issue427RefreshThreads({ force = false, announce = false } = {}) {
    if (!state.user || state.issue427Messages.loadingThreads) return;
    if (!force && state.threadChat.loaded) return;
    state.issue427Messages.loadingThreads = true;
    try {
      const data = await api(issue427ChatPath());
      issue427ApplyThreadResponse(data);
      if (announce) setStatus('Chat oppdatert.');
    } catch (error) {
      setStatus('Chat kunne ikke oppdateres.', 'error');
    } finally {
      state.issue427Messages.loadingThreads = false;
      if (state.activeTab === 'chat') renderMessages();
    }
  }

  function issue427EnsureThreads() {
    if (state.activeTab !== 'chat' || state.threadChat.loaded || state.issue427Messages.loadingThreads) return;
    issue427RefreshThreads();
  }

  function issue427AddConversation(map, conversation, message) {
    const existing = map.get(conversation.id) || conversation;
    if (!map.has(conversation.id)) map.set(conversation.id, existing);
    if (message) existing.messages.push(message);
    return existing;
  }

  function issue427BuildMessageConversations(map) {
    issue427Objects(state.messages).forEach((message) => {
      const kind = issue427ConversationKind(message);
      const id = issue427MessageKey(message);
      const title = issue427ControlledTitle(message);
      const conversation = issue427AddConversation(map, {
        id,
        type: 'controlled',
        kind,
        title,
        subtitle: issue427KindLabel(kind),
        typeLabel: issue427KindLabel(kind),
        messages: [],
        latestAt: 0,
        unread: 0,
        compose: { type: 'controlled' },
      }, message);
      conversation.latestAt = Math.max(conversation.latestAt, issue427Timestamp(message.createdAt));
      conversation.unread += issue427Unread(message) ? 1 : 0;
      conversation.preview = issue427Preview(message.body);
      conversation.meta = message.senderName || 'Ukjent avsender';
    });
  }

  function issue427BuildTeamChatConversations(map) {
    issue427Objects(state.teamChatMessages).forEach((message) => {
      const id = `teamchat:${issue427Text(message.teamId || message.teamName || 'team')}`;
      const conversation = issue427AddConversation(map, {
        id,
        type: 'teamchat',
        kind: 'teamchat',
        title: message.teamName || 'Gruppechat',
        subtitle: 'Chat',
        typeLabel: 'Chat',
        messages: [],
        latestAt: 0,
        unread: 0,
        compose: { type: 'teamchat', teamId: issue427Text(message.teamId) },
      }, message);
      conversation.latestAt = Math.max(conversation.latestAt, issue427Timestamp(message.createdAt));
      conversation.preview = issue427Preview(message.body);
      conversation.meta = message.senderName || 'Ukjent avsender';
    });
  }

  function issue427BuildThreadConversations(map) {
    issue427Objects(state.threadChat?.threads).forEach((thread) => {
      const comments = issue427ThreadComments(thread.id);
      const latest = comments[comments.length - 1];
      const conversation = issue427AddConversation(map, {
        id: `thread:${issue427Text(thread.id)}`,
        type: 'thread',
        kind: 'thread',
        title: issue427Text(thread.title) || 'Uten tittel',
        subtitle: 'Hendelse',
        typeLabel: 'Hendelse',
        messages: [],
        latestAt: Math.max(issue427Timestamp(thread.updatedAt), issue427Timestamp(latest?.createdAt), issue427Timestamp(thread.createdAt)),
        unread: 0,
        preview: issue427ThreadPreview(thread),
        meta: [thread.teamName || 'Ukjent gruppe', `${comments.length} svar`].filter(Boolean).join(' · '),
        thread,
        comments,
        compose: { type: 'thread', threadId: issue427Text(thread.id) },
      });
      conversation.messages = [
        {
          id: `thread-root-${thread.id}`,
          body: thread.body,
          senderName: thread.createdByName,
          senderId: thread.createdBy,
          createdAt: thread.createdAt,
          kind: 'threadRoot',
          incidentId: thread.incidentId,
        },
        ...comments.map((comment) => ({
          ...comment,
          senderName: comment.createdByName,
          senderId: comment.createdBy,
          kind: 'threadComment',
        })),
      ];
    });
  }

  function issue427BuildConversations() {
    const map = new Map();
    issue427BuildMessageConversations(map);
    issue427BuildTeamChatConversations(map);
    issue427BuildThreadConversations(map);
    return [...map.values()].map((conversation) => {
      conversation.messages = conversation.messages.sort((a, b) => issue427Timestamp(a.createdAt) - issue427Timestamp(b.createdAt));
      if (!conversation.latestAt && conversation.messages.length) {
        conversation.latestAt = issue427Timestamp(conversation.messages[conversation.messages.length - 1].createdAt);
      }
      return conversation;
    }).sort((a, b) => b.latestAt - a.latestAt);
  }

  function issue427ConversationSearchText(conversation) {
    return [
      conversation.title,
      conversation.subtitle,
      conversation.typeLabel,
      conversation.preview,
      conversation.meta,
      conversation.messages.map((message) => message.body).join(' '),
    ].map(issue427Text).join(' ').toLowerCase();
  }

  function issue427FilteredConversations(conversations) {
    const allowedFilters = ['all', 'unread', 'groups', 'direct', 'broadcast'];
    const filter = allowedFilters.includes(state.issue427Messages.filter) ? state.issue427Messages.filter : 'all';
    if (state.issue427Messages.filter !== filter) state.issue427Messages.filter = filter;
    const query = issue427Text(state.issue427Messages.search).toLowerCase();
    return conversations.filter((conversation) => {
      if (filter === 'unread' && !conversation.unread) return false;
      if (filter === 'groups' && !['team', 'teamchat', 'thread'].includes(conversation.kind)) return false;
      if (filter === 'direct' && conversation.kind !== 'direct') return false;
      if (filter === 'broadcast' && conversation.kind !== 'broadcast') return false;
      return !query || issue427ConversationSearchText(conversation).includes(query);
    });
  }

  function issue427Chip(label, tone = 'neutral') {
    const chip = document.createElement('span');
    chip.className = 'issue427-chip';
    chip.dataset.tone = tone;
    chip.textContent = label;
    return chip;
  }

  function issue427FilterButton(filter, label) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue427-filter';
    button.dataset.filter = filter;
    button.setAttribute('aria-pressed', state.issue427Messages.filter === filter ? 'true' : 'false');
    button.textContent = label;
    button.addEventListener('click', () => {
      state.issue427Messages.filter = filter;
      renderMessages();
    });
    return button;
  }

  function issue427Search() {
    const label = document.createElement('label');
    label.className = 'issue427-search';
    label.innerHTML = '<span>Søk</span>';
    const input = document.createElement('input');
    input.type = 'search';
    input.autocomplete = 'off';
    input.placeholder = 'Søk samtaler';
    input.value = state.issue427Messages.search || '';
    input.addEventListener('input', (event) => {
      state.issue427Messages.search = event.currentTarget.value;
      renderMessages();
    });
    label.append(input);
    return { label, input };
  }

  function issue427InfoBox() {
    const box = document.createElement('aside');
    box.className = 'issue427-info-box';
    box.setAttribute('aria-label', 'Svarmulighet i meldinger');
    const icon = document.createElement('span');
    icon.className = 'issue427-info-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'i';
    const text = document.createElement('p');
    text.textContent = 'Varsel og direkte meldinger kan leses og bekreftes, men ikke besvares. Chat og hendelser viser svarfelt når du har tilgang.';
    box.replaceChildren(icon, text);
    return box;
  }

  function issue427ConversationButton(conversation) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'issue427-conversation';
    button.dataset.kind = conversation.kind;
    button.dataset.active = conversation.id === state.issue427Messages.selectedConversationId ? 'true' : 'false';
    const unreadLabel = conversation.unread ? `${conversation.unread} ulest. ` : '';
    button.setAttribute('aria-label', `${conversation.typeLabel || issue427KindLabel(conversation.kind)}. ${unreadLabel}Åpne samtale ${conversation.title}`);
    button.addEventListener('click', () => issue427SelectConversation(conversation.id));

    const icon = document.createElement('span');
    icon.className = 'issue427-conversation-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = issue427KindIcon(conversation.kind);

    const main = document.createElement('span');
    main.className = 'issue427-conversation-main';
    const headline = document.createElement('span');
    headline.className = 'issue427-conversation-headline';
    const title = document.createElement('strong');
    title.textContent = conversation.title;
    const type = issue427Chip(conversation.typeLabel || issue427KindLabel(conversation.kind), issue427TypeTone(conversation));
    type.classList.add('issue427-type-chip');
    headline.append(title, type);
    const preview = document.createElement('span');
    preview.className = 'issue427-conversation-preview';
    preview.textContent = conversation.preview || 'Ingen meldinger ennå';
    const meta = document.createElement('span');
    meta.className = 'issue427-conversation-meta';
    meta.textContent = conversation.meta || conversation.subtitle;
    main.append(headline, preview, meta);

    const side = document.createElement('span');
    side.className = 'issue427-conversation-side';
    const time = document.createElement('small');
    time.textContent = issue427Time(conversation.latestAt);
    side.append(time);
    if (conversation.unread) {
      const unread = document.createElement('span');
      unread.className = 'issue427-unread-dot';
      unread.textContent = conversation.unread > 9 ? '9+' : String(conversation.unread);
      unread.setAttribute('aria-label', `${conversation.unread} ulest`);
      side.append(unread);
    }

    button.append(icon, main, side);
    return button;
  }

  async function issue427MarkConversationRead(conversationId) {
    const conversations = issue427BuildConversations();
    const conversation = conversations.find((item) => item.id === conversationId);
    const unreadMessages = conversation?.messages.filter((message) => message.id && issue427Unread(message) && !String(message.id).startsWith('thread-')) || [];
    if (!unreadMessages.length) return;
    unreadMessages.forEach((message) => { message.read = true; });
    state.unreadMessageCount = Math.max(0, (state.unreadMessageCount || 0) - unreadMessages.length);
    state.messageUnreadCount = Math.max(0, (state.messageUnreadCount || 0) - unreadMessages.length);
    renderBottomNav();
    try {
      for (const message of unreadMessages) {
        const data = await api('messages.php', {
          method: 'POST',
          body: JSON.stringify({ action: 'markRead', messageId: message.id }),
        });
        state.messages = data.messages || state.messages;
        state.unreadMessageCount = data.unreadCount ?? state.unreadMessageCount;
        state.messageUnreadCount = data.unreadCount ?? state.messageUnreadCount;
      }
      renderBottomNav();
      if (state.activeTab === 'chat') renderMessages();
    } catch (error) {
      setStatus('Meldingen kunne ikke markeres som lest.', 'error');
      await refreshData();
    }
  }

  function issue427SelectConversation(id) {
    state.issue427Messages.selectedConversationId = id;
    issue427MarkConversationRead(id);
    renderMessages();
  }

  function issue427Bubble(message) {
    const bubble = document.createElement('article');
    bubble.className = 'issue427-bubble';
    bubble.dataset.own = issue427OwnsMessage(message) ? 'true' : 'false';
    const meta = document.createElement('p');
    meta.className = 'issue427-bubble-meta';
    meta.textContent = [message.senderName || 'Ukjent avsender', issue427Time(message.createdAt)].filter(Boolean).join(' · ');
    const body = document.createElement('p');
    body.textContent = issue427Text(message.body) || 'Tom melding';
    bubble.append(meta, body);
    if (message.incidentId) bubble.append(issue427Chip('Opprettet som hendelse', 'ok'));
    return bubble;
  }

  function issue427ControlledTargets() {
    if (!state.user) return [];
    if (state.user.role === 'raceLead') {
      return [
        { value: 'all', label: 'Alle' },
        { value: 'teams', label: 'Grupper' },
        { value: 'teamLeads', label: 'Teamledere' },
        { value: 'user', label: 'Teamleder' },
      ];
    }
    if (state.user.role === 'teamLead') {
      return [
        { value: 'teams', label: 'Egne grupper' },
        { value: 'members', label: 'Medlem' },
        { value: 'raceLead', label: 'Løpsleder' },
      ];
    }
    return [];
  }

  function issue427Option(value, label, selected = false) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.selected = selected;
    return option;
  }

  function issue427SelectedValues(select) {
    return [...select.selectedOptions].map((option) => option.value).filter(Boolean);
  }

  function issue427ControlledComposer(conversation) {
    const targets = issue427ControlledTargets();
    if (!targets.length) return issue427LockedComposer(issue427OneWayExplanation(conversation));
    const form = document.createElement('form');
    form.className = 'issue427-composer';
    form.dataset.compose = 'controlled';
    form.innerHTML = `
      <div class="issue427-compose-grid">
        <label>Mottakere <select name="targetType" required></select></label>
        <label data-team-row>Grupper <select name="teamIds" multiple></select></label>
        <label data-user-row>Mottaker <select name="targetUserId"></select></label>
        <label class="issue427-check"><input name="requiresAcknowledgement" type="checkbox"> Krev lest</label>
      </div>
      <div class="issue427-input-row">
        <textarea name="body" maxlength="1200" rows="1" placeholder="Skriv kort operativ melding" required></textarea>
        <button type="submit">Send</button>
      </div>
    `;
    const targetSelect = $('[name="targetType"]', form);
    targetSelect.replaceChildren(...targets.map((target) => issue427Option(target.value, target.label)));
    const sync = () => issue427SyncControlledComposer(form);
    targetSelect.addEventListener('change', sync);
    form.addEventListener('submit', issue427SendControlled);
    sync();
    return form;
  }

  function issue427SyncControlledComposer(form) {
    const targetType = $('[name="targetType"]', form).value;
    const teamRow = $('[data-team-row]', form);
    const teamSelect = $('[name="teamIds"]', form);
    const userRow = $('[data-user-row]', form);
    const userSelect = $('[name="targetUserId"]', form);
    const teams = state.controlledTargets?.teamTargets || [];
    const users = targetType === 'members'
      ? (state.controlledTargets?.memberTargets || [])
      : (state.controlledTargets?.teamLeadTargets || []);

    teamRow.classList.toggle('hidden', targetType !== 'teams');
    teamSelect.required = targetType === 'teams';
    teamSelect.replaceChildren(...(targetType === 'teams' ? teams.map((team) => issue427Option(team.id, team.name || 'Uten navn')) : []));

    const showUser = targetType === 'user' || targetType === 'members';
    userRow.classList.toggle('hidden', !showUser);
    userSelect.required = showUser;
    userSelect.replaceChildren(...(showUser ? users.map((user) => issue427Option(user.id, user.displayName || user.fullName || 'Uten navn')) : []));

    const acknowledgement = $('[name="requiresAcknowledgement"]', form);
    const acknowledgementRow = acknowledgement.closest('label');
    const upwardToRaceLead = state.user?.role === 'teamLead' && targetType === 'raceLead';
    acknowledgement.checked = upwardToRaceLead ? false : acknowledgement.checked;
    acknowledgement.disabled = upwardToRaceLead;
    acknowledgementRow.classList.toggle('hidden', upwardToRaceLead);
  }

  async function issue427SendControlled(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const targetType = $('[name="targetType"]', form).value;
    const payload = {
      type: 'controlled',
      targetType,
      body: $('[name="body"]', form).value,
      requiresAcknowledgement: $('[name="requiresAcknowledgement"]', form).checked,
    };
    if (targetType === 'teams') payload.teamIds = issue427SelectedValues($('[name="teamIds"]', form));
    if (targetType === 'user' || targetType === 'members') payload.targetUserId = $('[name="targetUserId"]', form).value;
    try {
      await api('messages.php', { method: 'POST', body: JSON.stringify(payload) });
      form.reset();
      setStatus('Meldingen er sendt.');
      await refreshData();
      state.activeTab = 'chat';
    } catch (error) {
      setStatus('Meldingen kunne ikke sendes.', 'error');
    }
  }

  function issue427ThreadComposer(conversation) {
    if (!conversation.thread?.id) return issue427LockedComposer('Velg en tråd for å svare.');
    const form = document.createElement('form');
    form.className = 'issue427-composer';
    form.dataset.compose = 'thread';
    form.innerHTML = `
      <div class="issue427-input-row">
        <textarea name="body" maxlength="2000" rows="1" placeholder="Skriv svar i tråden" required></textarea>
        <button type="submit">Send</button>
      </div>
    `;
    form.addEventListener('submit', (event) => issue427SendThreadComment(event, conversation.thread.id));
    return form;
  }

  async function issue427SendThreadComment(event, threadId) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const data = await api(chatEndpoint, {
        method: 'POST',
        body: JSON.stringify({
          type: 'chatComment',
          threadId,
          body: form.elements.body.value,
          filter: state.threadChat?.filter || 'all',
          teamIdFilter: state.threadChat?.teamId || '',
        }),
      });
      issue427ApplyThreadResponse(data);
      form.reset();
      setStatus('Svar sendt.');
      renderMessages();
    } catch (error) {
      setStatus('Svaret kunne ikke sendes.', 'error');
    }
  }

  function issue427TeamChatComposer(conversation) {
    const teams = state.teamChatTeams || state.controlledTargets?.teamChatTeams || [];
    const teamId = issue427Text(conversation.compose?.teamId || teams[0]?.id);
    if (!teamId || !teams.some((team) => issue427Text(team.id) === teamId)) {
      return issue427LockedComposer('Gruppechat er ikke tilgjengelig for denne samtalen.');
    }
    const form = document.createElement('form');
    form.className = 'issue427-composer';
    form.dataset.compose = 'teamchat';
    form.dataset.teamId = teamId;
    form.innerHTML = `
      <div class="issue427-input-row">
        <textarea name="body" maxlength="1200" rows="1" placeholder="Skriv i gruppechat" required></textarea>
        <button type="submit">Send</button>
      </div>
    `;
    form.addEventListener('submit', issue427SendTeamChat);
    return form;
  }

  async function issue427SendTeamChat(event) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api('messages.php', {
        method: 'POST',
        body: JSON.stringify({ type: 'teamChat', teamId: form.dataset.teamId, body: form.elements.body.value }),
      });
      form.reset();
      setStatus('Gruppechat er sendt.');
      await refreshData();
      state.activeTab = 'chat';
    } catch (error) {
      setStatus('Gruppechat kunne ikke sendes.', 'error');
    }
  }

  function issue427LockedComposer(message) {
    const footer = document.createElement('footer');
    footer.className = 'issue427-composer issue427-composer-locked';
    footer.textContent = message;
    return footer;
  }

  function issue427Composer(conversation) {
    if (!conversation) return issue427LockedComposer('Velg en samtale.');
    if (conversation.type === 'thread') return issue427ThreadComposer(conversation);
    if (conversation.type === 'teamchat') return issue427TeamChatComposer(conversation);
    if (['broadcast', 'direct', 'team'].includes(conversation.kind)) {
      return issue427LockedComposer(issue427OneWayExplanation(conversation));
    }
    return issue427ControlledComposer(conversation);
  }

  function issue427Thread(conversation) {
    const thread = document.createElement('section');
    thread.className = 'issue427-thread';
    thread.setAttribute('aria-label', 'Chat-tråd');
    if (!conversation) {
      thread.replaceChildren(emptyState('Velg en samtale.'));
      return thread;
    }

    const head = document.createElement('header');
    head.className = 'issue427-thread-head';
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'issue427-back';
    back.textContent = 'Tilbake';
    back.addEventListener('click', () => {
      state.issue427Messages.selectedConversationId = '';
      renderMessages();
    });
    const title = document.createElement('div');
    title.innerHTML = '<h3></h3><p></p>';
    $('h3', title).textContent = conversation.title;
    $('p', title).textContent = [conversation.typeLabel || issue427KindLabel(conversation.kind), conversation.meta].filter(Boolean).join(' · ');
    head.append(back, title, issue427Chip(conversation.typeLabel || issue427KindLabel(conversation.kind), issue427TypeTone(conversation)));

    const stack = document.createElement('div');
    stack.className = 'issue427-bubble-stack';
    stack.replaceChildren(...(conversation.messages.length ? conversation.messages.map(issue427Bubble) : [emptyState('Ingen meldinger i samtalen ennå.')]))

    thread.replaceChildren(head, stack, issue427Composer(conversation));
    return thread;
  }

  function issue427SyncPanelHead(panel) {
    const title = $('.section-heading h2', panel);
    const eyebrow = $('.section-heading .eyebrow', panel);
    if (eyebrow) eyebrow.textContent = 'Meldinger';
    if (title) title.textContent = 'Samtaler';
  }

  renderMessages = function issue427RenderMessages() {
    const panel = $('#chatPanel');
    if (!panel) return;
    issue427EnsureThreads();
    panel.dataset.issue427Messages = 'true';
    issue427SyncPanelHead(panel);

    const conversations = issue427BuildConversations();
    const filtered = issue427FilteredConversations(conversations);
    const narrowViewport = window.matchMedia?.('(max-width: 820px)').matches === true;
    if (state.issue427Messages.selectedConversationId && !filtered.some((conversation) => conversation.id === state.issue427Messages.selectedConversationId)) {
      state.issue427Messages.selectedConversationId = '';
    }
    if (!state.issue427Messages.selectedConversationId && filtered.length && !narrowViewport) {
      state.issue427Messages.selectedConversationId = filtered[0].id;
    }
    const selected = filtered.find((conversation) => conversation.id === state.issue427Messages.selectedConversationId) || null;

    const heading = document.createElement('div');
    heading.className = 'section-heading issue427-heading';
    heading.innerHTML = '<div><p class="eyebrow">Meldinger</p><h2>Samtaler</h2><p></p></div>';
    $('p:last-child', heading).textContent = 'Samtaleliste med varsel, direkte meldinger og chat.';
    const refresh = document.createElement('button');
    refresh.id = 'refreshMessagesButton';
    refresh.type = 'button';
    refresh.className = 'secondary';
    refresh.textContent = state.issue427Messages.loadingThreads ? 'Oppdaterer' : 'Oppdater';
    refresh.disabled = state.issue427Messages.loadingThreads;
    refresh.addEventListener('click', async () => {
      await refreshData();
      await issue427RefreshThreads({ force: true, announce: true });
    });
    heading.append(refresh);

    const filters = document.createElement('div');
    filters.className = 'issue427-filters';
    filters.append(
      issue427FilterButton('all', 'Alle'),
      issue427FilterButton('unread', 'Uleste'),
      issue427FilterButton('groups', 'Grupper'),
      issue427FilterButton('direct', 'Direkte'),
      issue427FilterButton('broadcast', 'Felles'),
    );

    const { label: search, input } = issue427Search();
    const list = document.createElement('aside');
    list.className = 'issue427-conversation-list';
    list.setAttribute('aria-label', 'Samtaleliste');
    list.replaceChildren(...(filtered.length ? filtered.map(issue427ConversationButton) : [emptyState('Ingen samtaler matcher filteret.')]));

    const layout = document.createElement('section');
    layout.className = 'issue427-message-layout';
    layout.dataset.view = selected ? 'thread' : 'list';
    layout.append(list, issue427Thread(selected));

    const activeElement = document.activeElement;
    const restoreSearch = activeElement?.matches?.('.issue427-search input') === true;
    const selectionStart = restoreSearch ? activeElement.selectionStart : null;
    const selectionEnd = restoreSearch ? activeElement.selectionEnd : null;

    panel.replaceChildren(heading, filters, search, issue427InfoBox(), layout);

    if (restoreSearch) {
      input.focus({ preventScroll: true });
      try {
        if (selectionStart !== null && selectionEnd !== null) input.setSelectionRange(selectionStart, selectionEnd);
      } catch (_) {}
    }
  };

  if (state.user && state.activeTab === 'chat') renderMessages();

  window.arrangementsvaktIssue427 = {
    version: issue427Version,
    refreshThreads: issue427RefreshThreads,
  };
})();
