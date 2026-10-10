(() => {
  const issue282Version = 'v0.12.3-issue-287-chat-open-stability-2026-06-09';
  const pushTechnicalPattern = /VAPID|diagnose|backend|__DIR__|DOCUMENT_ROOT|konfig|config|public key|private key|server-dispatch|dispatch|HTTP\s*\d|fingerprint|subscription/i;
  const chatObserverState = { observer: null, rendering: false, renderQueued: false };

  function issue282Text(value) {
    return String(value ?? '').trim();
  }

  function issue282Objects(value) {
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
  }

  function issue282Ids(value) {
    return Array.isArray(value) ? value.map(issue282Text).filter(Boolean) : [];
  }

  function issue282PublicPushText(value) {
    const text = issue282Text(value);
    if (!text) return '';
    if (/VAPID|servern[oø]kkel|konfig|config|public key|private key/i.test(text)) {
      return 'Push er ikke klart satt opp for denne enheten enda.';
    }
    return text
      .replace(/server-dispatch/gi, 'testvarsel')
      .replace(/dispatch/gi, 'utsending')
      .replace(/HTTP\s*\d{3}/gi, 'serverfeil');
  }

  function issue282SanitizeNodeText(node) {
    if (!node) return;
    const text = issue282Text(node.textContent);
    if (pushTechnicalPattern.test(text)) {
      node.textContent = issue282PublicPushText(text);
    }
  }

  function issue282SanitizeNodeTitle(node, fallback = '') {
    if (!node) return;
    const title = issue282Text(node.title);
    if (pushTechnicalPattern.test(title)) {
      node.title = issue282PublicPushText(title) || fallback || issue282Text(node.textContent);
    }
  }

  function issue282SanitizePushTopbar() {
    if (typeof $ !== 'function') return;
    const chip = $('#pushStatusChip');
    const toggle = $('#pushToggleButton');
    const testButton = $('#pushTestButton');
    const hint = $('#pushTestHint');
    issue282SanitizeNodeTitle(chip, 'Pushstatus');
    issue282SanitizeNodeTitle(toggle, 'Endre pushstatus');
    issue282SanitizeNodeTitle(testButton, 'Send testvarsel');
    issue282SanitizeNodeText(hint);
    issue282SanitizeNodeTitle(hint);
  }

  if (typeof renderPushStatus === 'function') {
    const issue282RenderPushStatusBase = renderPushStatus;
    renderPushStatus = function issue282RenderPushStatus() {
      issue282RenderPushStatusBase();
      issue282SanitizePushTopbar();
    };
  }

  function issue282Timestamp(value) {
    const timestamp = new Date(issue282Text(value)).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function issue282SelectedThread() {
    const selectedThreadId = issue282Text(state.threadChat?.selectedThreadId);
    if (!selectedThreadId) return null;
    return issue282Objects(state.threadChat?.threads)
      .find((thread) => issue282Text(thread.id) === selectedThreadId) || null;
  }

  function issue282ThreadComments(threadId) {
    const selectedThreadId = issue282Text(threadId);
    return issue282Objects(state.threadChat?.comments)
      .filter((comment) => issue282Text(comment.threadId) === selectedThreadId)
      .sort((a, b) => issue282Timestamp(a.createdAt) - issue282Timestamp(b.createdAt));
  }

  function issue282LedTeamIds() {
    const userId = issue282Text(state.user?.id);
    if (!userId) return new Set();
    return new Set(issue282Objects(state.teams)
      .filter((team) => issue282Ids(team.leaderIds).includes(userId))
      .map((team) => issue282Text(team.id))
      .filter(Boolean));
  }

  function issue282CanEditChatItem(item, teamId) {
    if (!state.user || !item) return false;
    const userId = issue282Text(state.user.id);
    if (userId && issue282Text(item.createdBy) === userId) return true;
    if (typeof isPrimaryLeader === 'function' && isPrimaryLeader()) return true;
    if (typeof isLeadershipUser === 'function' && isLeadershipUser()) return true;
    if (state.user.role !== 'teamLead') return false;
    return issue282LedTeamIds().has(issue282Text(teamId));
  }

  async function issue282ChatEdit(payload) {
    return api('chat-edit.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async function issue282RefreshChat() {
    if (window.__arrangementsvaktIssue239?.refreshThreadChat) {
      await window.__arrangementsvaktIssue239.refreshThreadChat({ render: true });
      return;
    }
    if (typeof refreshData === 'function') await refreshData();
  }

  function issue282EditError(error) {
    const messages = {
      chat_edit_not_allowed: 'Du har ikke tilgang til a redigere denne chatten.',
      comment_not_found: 'Kommentaren finnes ikke lenger.',
      missing_comment_fields: 'Skriv kommentar for du lagrer.',
      missing_thread_fields: 'Skriv tittel og innlegg for du lagrer.',
      thread_not_found: 'Traden finnes ikke lenger.',
    };
    return messages[error?.message] || 'Chatten kunne ikke lagres.';
  }

  function issue282Field(labelText, control) {
    const label = document.createElement('label');
    label.append(document.createTextNode(labelText));
    label.append(control);
    return label;
  }

  function issue282Button(text, className = 'secondary') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    return button;
  }

  function issue282ShowThreadEditForm(container, thread) {
    const title = document.createElement('input');
    title.name = 'title';
    title.maxLength = 140;
    title.required = true;
    title.value = issue282Text(thread.title);

    const body = document.createElement('textarea');
    body.name = 'body';
    body.maxLength = 2000;
    body.required = true;
    body.value = issue282Text(thread.body);

    const status = document.createElement('p');
    status.className = 'message-empty';
    status.setAttribute('aria-live', 'polite');

    const save = document.createElement('button');
    save.type = 'submit';
    save.textContent = 'Lagre trad';
    const cancel = issue282Button('Avbryt');

    const form = document.createElement('form');
    form.className = 'card-form thread-comment-form issue282-chat-edit-form';
    form.replaceChildren(issue282Field('Tittel ', title), issue282Field('Innlegg ', body), save, cancel, status);
    cancel.addEventListener('click', () => issue282EnhanceThreadDetail({ force: true }));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      save.disabled = true;
      status.textContent = 'Lagrer trad...';
      try {
        await issue282ChatEdit({
          action: 'updateThread',
          threadId: issue282Text(thread.id),
          title: title.value,
          body: body.value,
        });
        setStatus('Traden er oppdatert.');
        await issue282RefreshChat();
      } catch (error) {
        save.disabled = false;
        status.textContent = issue282EditError(error);
        setStatus(issue282EditError(error), 'error');
      }
    });
    container.replaceChildren(form);
    title.focus();
  }

  function issue282ShowCommentEditForm(container, comment) {
    const body = document.createElement('textarea');
    body.name = 'body';
    body.maxLength = 2000;
    body.required = true;
    body.value = issue282Text(comment.body);

    const status = document.createElement('p');
    status.className = 'message-empty';
    status.setAttribute('aria-live', 'polite');

    const save = document.createElement('button');
    save.type = 'submit';
    save.textContent = 'Lagre kommentar';
    const cancel = issue282Button('Avbryt');

    const form = document.createElement('form');
    form.className = 'card-form thread-comment-form issue282-chat-edit-form';
    form.replaceChildren(issue282Field('Kommentar ', body), save, cancel, status);
    cancel.addEventListener('click', () => issue282EnhanceThreadDetail({ force: true }));
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      save.disabled = true;
      status.textContent = 'Lagrer kommentar...';
      try {
        await issue282ChatEdit({
          action: 'updateComment',
          commentId: issue282Text(comment.id),
          threadId: issue282Text(comment.threadId),
          body: body.value,
        });
        setStatus('Kommentaren er oppdatert.');
        await issue282RefreshChat();
      } catch (error) {
        save.disabled = false;
        status.textContent = issue282EditError(error);
        setStatus(issue282EditError(error), 'error');
      }
    });
    container.replaceChildren(form);
    body.focus();
  }

  function issue282InsertEditAction(afterNode, label, actionKey, onEdit) {
    if (!afterNode?.parentNode) return;
    const key = issue282Text(actionKey || label);
    if (!key) return;
    const existing = $$('.issue282-chat-edit-actions', afterNode.parentNode)
      .some((node) => node.dataset.issue282Action === key);
    if (existing) return;

    const actions = document.createElement('div');
    actions.className = 'thread-detail-actions issue282-chat-edit-actions';
    actions.dataset.issue282Action = key;
    const button = issue282Button(label);
    button.addEventListener('click', () => onEdit(actions));
    actions.append(button);
    afterNode.after(actions);
  }

  function issue282CommentBody(commentNode) {
    const paragraphs = $$('p', commentNode);
    return paragraphs.find((paragraph) => !paragraph.classList.contains('thread-comment-meta')) || paragraphs[paragraphs.length - 1] || null;
  }

  function issue282EnhanceThreadDetail({ force = false } = {}) {
    if (typeof $ !== 'function' || typeof $$ !== 'function' || chatObserverState.rendering) return;
    const detail = $('#threadChatDetailDialogBody');
    if (!detail) return;
    const thread = issue282SelectedThread();
    if (!thread) return;

    chatObserverState.rendering = true;
    try {
      if (force) {
        $$('.issue282-chat-edit-actions', detail).forEach((node) => node.remove());
      }
      const originalBody = $('.thread-original-body', detail);
      if (originalBody && issue282CanEditChatItem(thread, thread.teamId)) {
        issue282InsertEditAction(originalBody, 'Rediger trad', `thread:${issue282Text(thread.id)}`, (container) => issue282ShowThreadEditForm(container, thread));
      }

      const comments = issue282ThreadComments(thread.id);
      $$('.thread-comment', detail).forEach((commentNode, index) => {
        const comment = comments[index];
        const commentBody = issue282CommentBody(commentNode);
        if (!comment || !commentBody || !issue282CanEditChatItem(comment, thread.teamId)) return;
        issue282InsertEditAction(commentBody, 'Rediger kommentar', `comment:${issue282Text(comment.id) || index}`, (container) => issue282ShowCommentEditForm(container, comment));
      });
    } finally {
      chatObserverState.rendering = false;
    }
  }

  function issue282QueueThreadEnhancement() {
    if (chatObserverState.rendering || chatObserverState.renderQueued) return;
    chatObserverState.renderQueued = true;
    window.queueMicrotask(() => {
      chatObserverState.renderQueued = false;
      issue282EnhanceThreadDetail();
    });
  }

  function issue282InstallChatObserver() {
    if (chatObserverState.observer || !document.body) return;
    chatObserverState.observer = new MutationObserver(() => {
      if (!$('#threadChatDetailDialog')?.open) return;
      issue282QueueThreadEnhancement();
    });
    chatObserverState.observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', (event) => {
      if (event.target?.closest?.('[data-thread-id]')) {
        window.setTimeout(() => issue282EnhanceThreadDetail(), 0);
      }
    }, true);
  }

  document.addEventListener('DOMContentLoaded', () => {
    issue282SanitizePushTopbar();
    issue282InstallChatObserver();
    issue282EnhanceThreadDetail();
  });

  issue282SanitizePushTopbar();
  issue282InstallChatObserver();

  window.arrangementsvaktIssue282 = {
    version: issue282Version,
    sanitizePushTopbar: issue282SanitizePushTopbar,
    enhanceThreadDetail: issue282EnhanceThreadDetail,
  };
})();
