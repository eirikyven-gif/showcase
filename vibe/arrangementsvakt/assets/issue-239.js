(() => {
  const ISSUE239_CHAT_ENDPOINT = 'chat-threads.php';
  const issue239Errors = {
    team_required: 'Velg team for tråden.',
    team_not_found: 'Teamet finnes ikke lenger.',
    missing_thread_fields: 'Skriv tittel og innlegg.',
    missing_comment_fields: 'Skriv kommentar først.',
    comment_replies_not_supported: 'Kommentarer på kommentarer støttes ikke.',
    thread_not_found: 'Tråden finnes ikke lenger.',
    thread_status_not_allowed: 'Du kan ikke endre status på denne tråden.',
    invalid_thread_status: 'Ugyldig trådstatus.',
    invalid_chat_action: 'Chat-handlingen er ikke gyldig.',
  };

  state.threadChat = state.threadChat || {
    threads: [],
    comments: [],
    teams: [],
    myTeamIds: [],
    filter: 'all',
    teamId: '',
    selectedThreadId: '',
    loading: false,
    loaded: false,
    createLastFocusedElement: null,
    detailLastFocusedElement: null,
  };

  function issue239FriendlyError(error) {
    return issue239Errors[error?.message] || 'Chat kunne ikke oppdateres.';
  }

  function issue239Text(value) {
    return String(value ?? '').trim();
  }

  function issue239Objects(value) {
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
  }

  function issue239Timestamp(value) {
    const timestamp = new Date(issue239Text(value)).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  function issue239ValidFilter(value) {
    return ['all', 'mine', 'team'].includes(value) ? value : 'all';
  }

  function issue239Time(value) {
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

  function issue239ThreadComments(threadId) {
    const selectedThreadId = issue239Text(threadId);
    return issue239Objects(state.threadChat?.comments)
      .filter((comment) => issue239Text(comment.threadId) === selectedThreadId)
      .sort((a, b) => issue239Timestamp(a.createdAt) - issue239Timestamp(b.createdAt));
  }

  function issue239DefaultFilter() {
    return (state.threadChat.myTeamIds || []).length ? 'mine' : 'all';
  }

  function issue239SelectedThread() {
    const selectedThreadId = issue239Text(state.threadChat?.selectedThreadId);
    if (!selectedThreadId) return null;
    return issue239Objects(state.threadChat?.threads)
      .find((thread) => issue239Text(thread.id) === selectedThreadId) || null;
  }

  function issue239ChatPath() {
    const params = new URLSearchParams({
      filter: issue239ValidFilter(state.threadChat.filter || issue239DefaultFilter()),
      t: String(Date.now()),
    });
    if (state.threadChat.filter === 'team' && state.threadChat.teamId) params.set('teamId', state.threadChat.teamId);
    return `${ISSUE239_CHAT_ENDPOINT}?${params.toString()}`;
  }

  function issue239CommentCountLabel(count) {
    const safeCount = Number(count) || 0;
    return safeCount === 1 ? '1 kommentar' : `${safeCount} kommentarer`;
  }

  function issue239Excerpt(value, maxLength = 96) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return 'Tomt innlegg';
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 1).trim()}…`;
  }

  function issue239ThreadPreview(thread) {
    const comments = issue239ThreadComments(thread.id);
    const latestComment = comments[comments.length - 1];
    return issue239Excerpt(latestComment?.body || thread.body || '');
  }

  function issue239ApplyResponse(data = {}) {
    const chatFilter = data && typeof data.chatFilter === 'object' ? data.chatFilter : {};
    state.threadChat.threads = issue239Objects(data.chatThreads).filter((thread) => issue239Text(thread.id));
    state.threadChat.comments = issue239Objects(data.chatComments).filter((comment) => issue239Text(comment.threadId));
    state.threadChat.teams = issue239Objects(data.chatTeams).filter((team) => issue239Text(team.id));
    state.threadChat.myTeamIds = Array.isArray(data.myTeamIds) ? data.myTeamIds.map(issue239Text).filter(Boolean) : [];
    state.threadChat.filter = issue239ValidFilter(chatFilter.mode || state.threadChat.filter || issue239DefaultFilter());
    state.threadChat.teamId = issue239Text(chatFilter.teamId || state.threadChat.teamId || '');
    state.threadChat.loaded = true;
    const current = issue239Text(state.threadChat.selectedThreadId);
    if (current && !state.threadChat.threads.some((thread) => issue239Text(thread.id) === current)) {
      state.threadChat.selectedThreadId = '';
    }
  }

  async function issue239RefreshChat({ render = true, announce = false } = {}) {
    if (!state.user || state.threadChat.loading) return;
    state.threadChat.loading = true;
    if (render) issue239RenderThreadChat();
    try {
      const data = await api(issue239ChatPath());
      issue239ApplyResponse(data);
      if (announce) setStatus('Chat oppdatert.');
    } catch (error) {
      setStatus(issue239FriendlyError(error), 'error');
    } finally {
      state.threadChat.loading = false;
      if (render) issue239RenderThreadChat();
    }
  }

  function issue239InstallThreadChatPane() {
    const pane = $('#teamChatPane');
    if (!pane || pane.dataset.issue239Installed === 'true') return;
    pane.dataset.issue239Installed = 'true';
    pane.innerHTML = `
      <div class="thread-chat-toolbar" aria-label="Chatfilter">
        <div class="thread-chat-filter" role="group" aria-label="Filter">
          <button type="button" data-thread-filter="all">Alle</button>
          <button type="button" data-thread-filter="mine">Mine team</button>
          <label>Team <select id="threadChatTeamFilter"></select></label>
        </div>
        <div class="thread-chat-actions">
          <button id="openThreadCreateDialogButton" type="button">+ Ny tråd</button>
          <button id="refreshThreadChatButton" class="secondary" type="button">Oppdater</button>
        </div>
      </div>
      <div class="thread-chat-layout">
        <section aria-label="Chat-tråder">
          <div id="threadChatList" class="thread-chat-list" aria-live="polite"></div>
        </section>
      </div>
      <dialog id="threadChatCreateDialog" class="incident-dialog thread-chat-dialog thread-create-dialog" aria-labelledby="threadChatCreateTitle">
        <form id="threadChatCreateForm" class="thread-chat-dialog-form" method="dialog">
          <div class="modal-heading full">
            <div>
              <p class="eyebrow">Chat</p>
              <h2 id="threadChatCreateTitle">Ny tråd</h2>
            </div>
            <button id="closeThreadCreateDialogButton" class="secondary icon-button" type="button" aria-label="Lukk ny tråd">×</button>
          </div>
          <div class="thread-dialog-content">
            <label>Team <select name="teamId" required></select></label>
            <label>Tittel <input name="title" maxlength="140" required></label>
            <label>Innlegg <textarea name="body" maxlength="2000" required></textarea></label>
            <div class="modal-actions">
              <button type="submit">Publiser tråd</button>
              <button id="cancelThreadCreateDialogButton" class="secondary" type="button">Avbryt</button>
            </div>
          </div>
        </form>
      </dialog>
      <dialog id="threadChatDetailDialog" class="incident-dialog thread-chat-dialog thread-detail-dialog" aria-labelledby="threadChatDetailTitle">
        <div class="modal-heading full">
          <div>
            <p id="threadChatDetailEyebrow" class="eyebrow">Chat</p>
            <h2 id="threadChatDetailTitle">Tråd</h2>
          </div>
          <button id="closeThreadDetailDialogButton" class="secondary icon-button" type="button" aria-label="Lukk tråd">×</button>
        </div>
        <div id="threadChatDetailDialogBody" class="detail-dialog-body thread-detail-dialog-body"></div>
      </dialog>
    `;
    pane.addEventListener('click', issue239HandlePaneClick);
    $('#refreshThreadChatButton', pane)?.addEventListener('click', () => issue239RefreshChat({ announce: true }));
    $('#openThreadCreateDialogButton', pane)?.addEventListener('click', (event) => issue239OpenCreateDialog(event.currentTarget));
    $('#threadChatTeamFilter', pane)?.addEventListener('change', (event) => {
      state.threadChat.filter = 'team';
      state.threadChat.teamId = issue239Text(event.currentTarget.value);
      state.threadChat.selectedThreadId = '';
      issue239RefreshChat();
    });
    $('#threadChatCreateForm', pane)?.addEventListener('submit', issue239CreateThread);
    $('#closeThreadCreateDialogButton', pane)?.addEventListener('click', issue239CloseCreateDialog);
    $('#cancelThreadCreateDialogButton', pane)?.addEventListener('click', issue239CloseCreateDialog);
    $('#closeThreadDetailDialogButton', pane)?.addEventListener('click', issue239CloseDetailDialog);
    $('#threadChatCreateDialog', pane)?.addEventListener('click', issue239CloseOnBackdrop);
    $('#threadChatDetailDialog', pane)?.addEventListener('click', issue239CloseOnBackdrop);
  }

  function issue239HandlePaneClick(event) {
    const filterButton = event.target.closest('[data-thread-filter]');
    if (filterButton) {
      state.threadChat.filter = issue239ValidFilter(filterButton.dataset.threadFilter);
      state.threadChat.teamId = '';
      state.threadChat.selectedThreadId = '';
      issue239RefreshChat();
      return;
    }
    const threadButton = event.target.closest('[data-thread-id]');
    if (threadButton) {
      issue239OpenThreadDetail(threadButton.dataset.threadId, threadButton);
    }
  }

  function issue239CloseOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    if (event.currentTarget.id === 'threadChatCreateDialog') issue239CloseCreateDialog();
    if (event.currentTarget.id === 'threadChatDetailDialog') issue239CloseDetailDialog();
  }

  function issue239OpenDialog(dialog, fallbackButton) {
    if (!dialog) return false;
    try {
      if (dialog.showModal && !dialog.open) {
        dialog.showModal();
        return true;
      }
    } catch (error) {
      setStatus('Chatdialogen kunne ikke åpnes som modal. Viser chat uten modal-lås.', 'warning');
    }
    if (!dialog.open) dialog.setAttribute('open', '');
    try {
      fallbackButton?.focus?.();
    } catch (_) {}
    return true;
  }

  function issue239CloseDialog(dialog, focusTarget) {
    if (!dialog) return;
    try {
      if (dialog.open && dialog.close) dialog.close();
      else dialog.removeAttribute('open');
    } catch (_) {
      dialog.removeAttribute('open');
    }
    if (dialog.hasAttribute('open') && !dialog.open) dialog.removeAttribute('open');
    try {
      if (focusTarget && document.contains(focusTarget)) focusTarget.focus();
    } catch (_) {}
  }

  function issue239OpenCreateDialog(trigger) {
    state.threadChat.createLastFocusedElement = trigger || document.activeElement;
    issue239FillControls();
    issue239OpenDialog($('#threadChatCreateDialog'), trigger);
  }

  function issue239CloseCreateDialog() {
    issue239CloseDialog($('#threadChatCreateDialog'), state.threadChat.createLastFocusedElement || $('#openThreadCreateDialogButton'));
  }

  function issue239ThreadButtonById(threadId) {
    const selectedThreadId = issue239Text(threadId);
    if (!selectedThreadId) return null;
    return $$('[data-thread-id]').find((button) => issue239Text(button.dataset.threadId) === selectedThreadId) || null;
  }

  function issue239OpenThreadDetail(threadId, trigger) {
    const selectedThreadId = issue239Text(threadId);
    if (!selectedThreadId) {
      setStatus('Chat-tråden mangler id og kan ikke åpnes.', 'error');
      return;
    }
    state.threadChat.selectedThreadId = selectedThreadId;
    state.threadChat.detailLastFocusedElement = trigger || document.activeElement;
    try {
      issue239RenderThreadList();
      issue239RenderThreadDetailDialog();
      issue239OpenDialog($('#threadChatDetailDialog'), trigger);
    } catch (error) {
      state.threadChat.selectedThreadId = '';
      issue239CloseDialog($('#threadChatDetailDialog'), trigger);
      setStatus('Chat kunne ikke åpnes. Prøv å oppdatere chatten.', 'error');
      console.error('Arrangementsvakt chat open failed', error);
    }
  }

  function issue239CloseDetailDialog() {
    issue239CloseDialog(
      $('#threadChatDetailDialog'),
      state.threadChat.detailLastFocusedElement || issue239ThreadButtonById(state.threadChat.selectedThreadId),
    );
  }

  function issue239Option(team, selectedId = '') {
    const option = document.createElement('option');
    option.value = issue239Text(team?.id);
    option.textContent = issue239Text(team?.name) || 'Uten navn';
    option.selected = option.value === issue239Text(selectedId);
    return option;
  }

  function issue239FillControls() {
    const teamSelect = $('#threadChatTeamFilter');
    const createSelect = $('#threadChatCreateForm [name="teamId"]');
    const teams = issue239Objects(state.threadChat.teams).filter((team) => issue239Text(team.id));
    if (teamSelect) {
      teamSelect.replaceChildren(...teams.map((team) => issue239Option(team, state.threadChat.teamId)));
      teamSelect.disabled = teams.length === 0;
    }
    if (createSelect) {
      const previous = createSelect.value;
      const preferred = previous || state.threadChat.myTeamIds?.[0] || teams[0]?.id || '';
      createSelect.replaceChildren(...teams.map((team) => issue239Option(team, preferred)));
      createSelect.disabled = teams.length === 0;
    }
    $$('[data-thread-filter]').forEach((button) => {
      const active = button.dataset.threadFilter === state.threadChat.filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function issue239ThreadCard(thread) {
    const threadId = issue239Text(thread.id);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `thread-card${threadId === issue239Text(state.threadChat.selectedThreadId) ? ' is-active' : ''}`;
    button.dataset.threadId = threadId;
    button.setAttribute('aria-label', `Åpne tråd: ${issue239Text(thread.title) || 'Uten tittel'}`);
    const status = thread.status === 'resolved' ? 'Avklart' : 'Åpen';
    const commentCount = Number(thread.commentCount) || issue239ThreadComments(threadId).length || 0;
    button.innerHTML = `
      <span class="thread-card-top"><strong></strong><span class="thread-status"></span></span>
      <span class="thread-card-title"></span>
      <span class="thread-card-excerpt"></span>
      <span class="thread-card-meta"></span>
    `;
    $('strong', button).textContent = issue239Text(thread.teamName) || 'Ukjent team';
    $('.thread-status', button).textContent = status;
    $('.thread-status', button).dataset.status = thread.status || 'open';
    $('.thread-card-title', button).textContent = issue239Text(thread.title) || 'Uten tittel';
    $('.thread-card-excerpt', button).textContent = issue239ThreadPreview(thread);
    $('.thread-card-meta', button).textContent = `${issue239CommentCountLabel(commentCount)} · ${issue239Time(thread.updatedAt || thread.createdAt)}`;
    return button;
  }

  function issue239RenderThreadList() {
    const list = $('#threadChatList');
    if (!list) return;
    if (state.threadChat.loading && !state.threadChat.loaded) {
      list.replaceChildren(emptyState('Laster chat.'));
      return;
    }
    const threads = issue239Objects(state.threadChat.threads).filter((thread) => issue239Text(thread.id));
    if (!threads.length) {
      list.replaceChildren(emptyState('Ingen chat-tråder.'));
      return;
    }
    list.replaceChildren(...threads.map(issue239ThreadCard));
  }

  function issue239CommentNode(comment) {
    const item = document.createElement('article');
    item.className = 'thread-comment';
    const meta = document.createElement('p');
    meta.className = 'thread-comment-meta';
    meta.textContent = `${issue239Text(comment.createdByName) || 'Ukjent'} · ${issue239Time(comment.createdAt)}`;
    const body = document.createElement('p');
    body.textContent = String(comment.body ?? '');
    item.replaceChildren(meta, body);
    return item;
  }

  function issue239RenderThreadDetailDialog() {
    const titleNode = $('#threadChatDetailTitle');
    const eyebrowNode = $('#threadChatDetailEyebrow');
    const detail = $('#threadChatDetailDialogBody');
    if (!detail) return;
    const thread = issue239SelectedThread();
    if (!thread) {
      if (titleNode) titleNode.textContent = 'Tråd';
      if (eyebrowNode) eyebrowNode.textContent = 'Chat';
      detail.replaceChildren(emptyState('Velg en tråd.'));
      return;
    }
    const threadId = issue239Text(thread.id);
    const comments = issue239ThreadComments(threadId);
    const statusText = thread.status === 'resolved' ? 'Avklart' : 'Åpen';
    if (titleNode) titleNode.textContent = issue239Text(thread.title) || 'Uten tittel';
    if (eyebrowNode) eyebrowNode.textContent = `${issue239Text(thread.teamName) || 'Ukjent team'} · ${statusText}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'thread-detail-stack';

    const meta = document.createElement('p');
    meta.className = 'thread-detail-meta';
    meta.innerHTML = `
      <span class="thread-status"></span>
      <span></span>
      <span></span>
    `;
    $('.thread-status', meta).textContent = statusText;
    $('.thread-status', meta).dataset.status = thread.status || 'open';
    $('span:nth-child(2)', meta).textContent = issue239Text(thread.teamName) || 'Ukjent team';
    $('span:nth-child(3)', meta).textContent = `${issue239Text(thread.createdByName) || 'Ukjent'} · ${issue239Time(thread.createdAt)}`;

    const body = document.createElement('p');
    body.className = 'thread-original-body';
    body.textContent = String(thread.body ?? '');

    const commentsHeading = document.createElement('h3');
    commentsHeading.textContent = 'Kommentarer';

    const commentList = document.createElement('div');
    commentList.className = 'thread-comments';
    commentList.replaceChildren(...(comments.length ? comments.map(issue239CommentNode) : [emptyState('Ingen kommentarer.')]));

    const commentForm = document.createElement('form');
    commentForm.className = 'card-form thread-comment-form';
    commentForm.innerHTML = `
      <label>Ny kommentar <textarea name="body" maxlength="2000" required></textarea></label>
      <button type="submit">Kommenter</button>
    `;
    commentForm.addEventListener('submit', (event) => issue239CreateComment(event, threadId));

    wrapper.append(meta, body, commentsHeading, commentList, commentForm);
    const actions = document.createElement('div');
    actions.className = 'thread-detail-actions';
    if (thread.canResolve) {
      const statusButton = document.createElement('button');
      statusButton.type = 'button';
      statusButton.className = 'secondary';
      statusButton.textContent = thread.status === 'resolved' ? 'Gjenåpne' : 'Marker avklart';
      statusButton.addEventListener('click', () => issue239SetStatus(threadId, thread.status === 'resolved' ? 'open' : 'resolved'));
      actions.append(statusButton);
    }
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'secondary';
    closeButton.textContent = 'Lukk';
    closeButton.addEventListener('click', issue239CloseDetailDialog);
    actions.append(closeButton);
    wrapper.append(actions);
    detail.replaceChildren(wrapper);
  }

  function issue239RenderThreadChat() {
    try {
      issue239InstallThreadChatPane();
      issue239FillControls();
      issue239RenderThreadList();
      if ($('#threadChatDetailDialog')?.open) issue239RenderThreadDetailDialog();
      if (!state.threadChat.loaded && !state.threadChat.loading && state.user) {
        state.threadChat.filter = state.threadChat.filter || issue239DefaultFilter();
        issue239RefreshChat({ render: true });
      }
    } catch (error) {
      state.threadChat.loading = false;
      setStatus('Chat kunne ikke vises. Prøv å oppdatere chatten.', 'error');
      console.error('Arrangementsvakt chat render failed', error);
    }
  }

  async function issue239CreateThread(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
      type: 'chatThread',
      teamId: issue239Text(form.elements.teamId?.value),
      title: String(form.elements.title?.value || ''),
      body: String(form.elements.body?.value || ''),
      filter: state.threadChat.filter,
      teamIdFilter: state.threadChat.teamId,
    };
    try {
      const data = await api(ISSUE239_CHAT_ENDPOINT, { method: 'POST', body: JSON.stringify(payload) });
      issue239ApplyResponse(data);
      state.threadChat.selectedThreadId = data.thread?.id || state.threadChat.selectedThreadId;
      form.reset();
      issue239CloseCreateDialog();
      setStatus('Chat-tråd opprettet.');
      issue239RenderThreadChat();
    } catch (error) {
      setStatus(issue239FriendlyError(error), 'error');
    }
  }

  async function issue239CreateComment(event, threadId) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const data = await api(ISSUE239_CHAT_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ type: 'chatComment', threadId, body: String(form.elements.body?.value || ''), filter: state.threadChat.filter, teamIdFilter: state.threadChat.teamId }),
      });
      issue239ApplyResponse(data);
      state.threadChat.selectedThreadId = threadId;
      form.reset();
      setStatus('Kommentar lagt til.');
      issue239RenderThreadChat();
    } catch (error) {
      setStatus(issue239FriendlyError(error), 'error');
    }
  }

  async function issue239SetStatus(threadId, status) {
    try {
      const data = await api(ISSUE239_CHAT_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({ action: 'setThreadStatus', threadId, status, filter: state.threadChat.filter, teamIdFilter: state.threadChat.teamId }),
      });
      issue239ApplyResponse(data);
      state.threadChat.selectedThreadId = threadId;
      setStatus(status === 'resolved' ? 'Tråden er markert avklart.' : 'Tråden er gjenåpnet.');
      issue239RenderThreadChat();
    } catch (error) {
      setStatus(issue239FriendlyError(error), 'error');
    }
  }

  const issue239RenderMessagesBase = renderMessages;
  renderMessages = function issue239RenderMessages() {
    issue239RenderMessagesBase();
    issue239InstallThreadChatPane();
    $$('.chat-mode-button').forEach((button) => {
      if (button.dataset.chatMode === 'messages') {
        if (button.firstChild) button.firstChild.textContent = 'Styrte meldinger';
        else button.textContent = 'Styrte meldinger';
      }
      if (button.dataset.chatMode === 'teamchat') button.textContent = 'Chat';
    });
    if (state.chatMode === 'teamchat') issue239RenderThreadChat();
  };

  const issue239RefreshDataBase = refreshData;
  refreshData = async function issue239RefreshData() {
    await issue239RefreshDataBase();
    state.threadChat.loaded = false;
    if (state.user && state.chatMode === 'teamchat') {
      await issue239RefreshChat({ render: true });
    }
  };

  if (typeof window !== 'undefined') {
    window.__arrangementsvaktIssue239 = { refreshThreadChat: issue239RefreshChat, renderThreadChat: issue239RenderThreadChat };
  }
})();
