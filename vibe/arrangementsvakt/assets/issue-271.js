(() => {
  const issue271Version = 'v0.10.1-chat-thread-open-hotfix-2026-06-09';
  const issue271State = { observer: null, observing: null, rendering: false, renderQueued: false };

  state.chatIncidentSource = null;
  state.chatIncidentSubmitting = false;

  [
    'invalid_incident_source',
    'chat_source_not_found',
    'chat_source_team_required',
    'chat_incident_not_allowed',
  ].forEach((error) => nonRetryableIncidentErrors.add(error));

  function issue271Objects(value) {
    return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];
  }

  function issue271Text(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function issue271Timestamp(value) {
    const timestamp = new Date(issue271Text(value)).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function issue271ThreadComments(threadId) {
    const selectedThreadId = issue271Text(threadId);
    return issue271Objects(state.threadChat?.comments)
      .filter((comment) => issue271Text(comment.threadId) === selectedThreadId)
      .sort((a, b) => issue271Timestamp(a.createdAt) - issue271Timestamp(b.createdAt));
  }

  function issue271SelectedThread() {
    const selectedThreadId = issue271Text(state.threadChat?.selectedThreadId);
    if (!selectedThreadId) return null;
    return issue271Objects(state.threadChat?.threads)
      .find((thread) => issue271Text(thread.id) === selectedThreadId) || null;
  }

  function issue271SourceKey(source) {
    return `${issue271Text(source?.sourceType || 'unknown')}:${issue271Text(source?.id || 'missing')}`;
  }

  function issue271CanConvert(source) {
    return !!source && typeof source === 'object' && !source.incidentId && source.canCreateIncident === true;
  }

  function issue271ThreadSource(thread) {
    return {
      sourceType: 'thread',
      kind: 'chatThread',
      id: issue271Text(thread.id),
      threadId: issue271Text(thread.id),
      teamId: issue271Text(thread.teamId),
      teamName: issue271Text(thread.teamName),
      title: issue271Text(thread.title),
      body: issue271Text(thread.body),
      createdBy: issue271Text(thread.createdBy),
      createdByName: issue271Text(thread.createdByName),
      createdAt: issue271Text(thread.createdAt),
      incidentId: issue271Text(thread.incidentId),
      canCreateIncident: thread.canCreateIncident === true,
    };
  }

  function issue271CommentSource(comment, thread) {
    return {
      sourceType: 'comment',
      kind: 'chatComment',
      id: issue271Text(comment.id),
      threadId: issue271Text(thread.id),
      teamId: issue271Text(thread.teamId),
      teamName: issue271Text(thread.teamName),
      title: issue271Text(thread.title),
      body: issue271Text(comment.body),
      createdBy: issue271Text(comment.createdBy),
      createdByName: issue271Text(comment.createdByName),
      createdAt: issue271Text(comment.createdAt),
      incidentId: issue271Text(comment.incidentId),
      canCreateIncident: comment.canCreateIncident === true,
    };
  }

  function issue271ConvertedLabel() {
    const label = document.createElement('span');
    label.className = 'issue271-chat-incident-state';
    label.textContent = 'Opprettet som hendelse';
    return label;
  }

  function issue271ActionBlock(source) {
    const block = document.createElement('div');
    block.className = 'issue271-chat-incident-actions';
    block.dataset.issue271Source = issue271SourceKey(source);

    if (source.incidentId) {
      block.append(issue271ConvertedLabel());
      return block;
    }
    if (!issue271CanConvert(source)) {
      return block;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary issue271-chat-incident-button';
    button.textContent = 'Gjør til hendelse';
    button.addEventListener('click', () => issue271OpenIncidentFromChat(source));
    block.append(button);
    return block;
  }

  function issue271InsertAfter(node, newNode) {
    if (!node?.parentNode) return;
    node.parentNode.insertBefore(newNode, node.nextSibling);
  }

  function issue271ObserveDetail(detail) {
    if (!detail || !issue271State.observer) return;
    issue271State.observer.observe(detail, { childList: true, subtree: true });
  }

  function issue271RenderChatActions() {
    const detail = $('#threadChatDetailDialogBody');
    if (!detail || issue271State.rendering) return;
    const thread = issue271SelectedThread();
    if (!thread) return;

    const observer = issue271State.observer;
    const shouldResumeObserver = observer && issue271State.observing === detail;
    issue271State.rendering = true;
    if (shouldResumeObserver) observer.disconnect();
    try {
      $$('.issue271-chat-incident-actions', detail).forEach((node) => node.remove());

      const originalBody = $('.thread-original-body', detail);
      if (originalBody) {
        issue271InsertAfter(originalBody, issue271ActionBlock(issue271ThreadSource(thread)));
      }

      const comments = issue271ThreadComments(thread.id);
      $$('.thread-comment', detail).forEach((commentNode, index) => {
        const comment = comments[index];
        if (!comment) return;
        const paragraphs = $$('p', commentNode);
        const commentBody = paragraphs.find((paragraph) => !paragraph.classList.contains('thread-comment-meta')) || paragraphs[paragraphs.length - 1];
        issue271InsertAfter(commentBody, issue271ActionBlock(issue271CommentSource(comment, thread)));
      });
    } finally {
      issue271State.rendering = false;
      if (shouldResumeObserver) issue271ObserveDetail(detail);
    }
  }

  function issue271EnsureObserver() {
    const detail = $('#threadChatDetailDialogBody');
    if (!detail || issue271State.observing === detail) return;
    issue271State.observer?.disconnect();
    issue271State.observing = detail;
    issue271State.observer = new MutationObserver(() => {
      if (issue271State.rendering || issue271State.renderQueued) return;
      issue271State.renderQueued = true;
      window.queueMicrotask(() => {
        issue271State.renderQueued = false;
        issue271RenderChatActions();
      });
    });
    issue271ObserveDetail(detail);
  }

  function issue271SetSourceHint(source) {
    const form = $('#incidentForm');
    if (!form) return;
    $('#chatIncidentSourceHint')?.remove();
    const hint = document.createElement('p');
    hint.id = 'chatIncidentSourceHint';
    hint.className = 'form-hint full issue271-chat-source-hint';
    hint.textContent = [
      'Fra chat',
      source.teamName || 'Ukjent team',
      source.createdByName || 'Ukjent avsender',
      source.createdAt ? formatDateTime(source.createdAt) : '',
    ].filter(Boolean).join(' · ');
    const descriptionLabel = $('[name="description"]', form)?.closest('label');
    if (descriptionLabel) {
      issue271InsertAfter(descriptionLabel, hint);
    }
  }

  function issue271SelectTeam(source) {
    const form = $('#incidentForm');
    const select = $('[name="teamIds"]', form);
    if (!select || !source.teamId) return;
    let option = [...select.options].find((candidate) => candidate.value === source.teamId);
    if (!option) {
      option = document.createElement('option');
      option.value = source.teamId;
      option.textContent = source.teamName || 'Chat-team';
      select.append(option);
    }
    [...select.options].forEach((candidate) => {
      candidate.selected = candidate.value === source.teamId;
    });
  }

  function issue271SelectDefaultSeverity() {
    const select = $('[name="severity"]', $('#incidentForm'));
    if (!select) return;
    const preferred = [...select.options].find((option) => option.value === 'followUp');
    const fallback = [...select.options].find((option) => option.value);
    select.value = (preferred || fallback)?.value || '';
  }

  function issue271FillIncidentForm(source) {
    const form = $('#incidentForm');
    if (!form) return;
    const title = $('[name="title"]', form);
    const location = $('[name="location"]', form);
    const description = $('[name="description"]', form);
    const escalated = $('[name="escalatedToRaceLead"]', form);
    if (title) title.value = source.title || '';
    if (location) location.value = '';
    if (description) description.value = source.body || '';
    if (escalated) escalated.checked = false;
    const image = $('[name="image"]', form);
    if (image) image.value = '';
    issue271SelectDefaultSeverity();
    issue271SelectTeam(source);
    issue271SetSourceHint(source);
    description?.focus();
  }

  function issue271OpenIncidentFromChat(source) {
    state.chatIncidentSource = source;
    const threadDialog = $('#threadChatDetailDialog');
    if (threadDialog?.open && threadDialog.close) {
      threadDialog.close();
    }
    openIncidentModal();
    issue271FillIncidentForm(source);
  }

  function issue271ApiSource(source) {
    return {
      kind: issue271Text(source.kind),
      id: issue271Text(source.id),
      threadId: issue271Text(source.threadId),
    };
  }

  function issue271ApplyChatResponse(data = {}) {
    if (!state.threadChat || typeof state.threadChat !== 'object') state.threadChat = {};
    if (Array.isArray(data.chatThreads)) state.threadChat.threads = issue271Objects(data.chatThreads);
    if (Array.isArray(data.chatComments)) state.threadChat.comments = issue271Objects(data.chatComments);
    if (Array.isArray(data.chatTeams)) state.threadChat.teams = issue271Objects(data.chatTeams);
    if (Array.isArray(data.myTeamIds)) state.threadChat.myTeamIds = data.myTeamIds;
    if (data.chatFilter?.mode) state.threadChat.filter = data.chatFilter.mode;
    if (data.chatFilter) state.threadChat.teamId = data.chatFilter.teamId || '';
    state.threadChat.loaded = true;
  }

  async function issue271MarkSourceConverted(source, incidentId) {
    const data = await api('chat-threads.php', {
      method: 'POST',
      body: JSON.stringify({
        action: 'markIncidentCreated',
        sourceType: source.sourceType,
        sourceId: source.id,
        threadId: source.threadId,
        incidentId,
        filter: state.threadChat?.filter || 'all',
        teamIdFilter: state.threadChat?.teamId || '',
      }),
    });
    issue271ApplyChatResponse(data);
    if (window.__arrangementsvaktIssue239?.renderThreadChat) {
      window.__arrangementsvaktIssue239.renderThreadChat();
    }
  }

  function issue271SetIncidentSubmitting(submitting) {
    const form = $('#incidentForm');
    const submit = form?.querySelector('[type="submit"]');
    if (!submit) return;
    submit.disabled = submitting;
    submit.textContent = submitting ? 'Oppretter hendelse' : 'Send hendelse';
  }

  function issue271ClearIncidentSource() {
    state.chatIncidentSource = null;
    $('#chatIncidentSourceHint')?.remove();
    issue271SetIncidentSubmitting(false);
  }

  const issue271SubmitIncidentBase = submitIncident;
  submitIncident = async function issue271SubmitIncident(payload) {
    const source = state.chatIncidentSource;
    if (!source) {
      return issue271SubmitIncidentBase(payload);
    }
    if (state.chatIncidentSubmitting) {
      return false;
    }
    state.chatIncidentSubmitting = true;
    issue271SetIncidentSubmitting(true);
    try {
      const incident = await issue271SubmitIncidentBase({ ...payload, source: issue271ApiSource(source) });
      if (incident?.id) {
        try {
          await issue271MarkSourceConverted(source, incident.id);
        } catch (_) {
          setStatus('Hendelsen er opprettet, men chatmarkeringen kunne ikke oppdateres.', 'warning');
        }
      }
      return incident;
    } finally {
      state.chatIncidentSubmitting = false;
      issue271SetIncidentSubmitting(false);
    }
  };

  const issue271RenderMessagesBase = renderMessages;
  renderMessages = function issue271RenderMessages() {
    issue271RenderMessagesBase();
    issue271EnsureObserver();
    issue271RenderChatActions();
  };

  $('#incidentDialog')?.addEventListener('close', () => {
    if (!state.chatIncidentSubmitting) issue271ClearIncidentSource();
  });

  issue271EnsureObserver();
  window.arrangementsvaktIssue271 = {
    version: issue271Version,
    renderChatActions: issue271RenderChatActions,
  };
})();
