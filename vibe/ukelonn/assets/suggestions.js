(() => {
  const root = window.Ukelonn?.root || './';
  const form = document.querySelector('[data-suggestion-form]');
  if (!form) return;

  const message = document.querySelector('[data-suggestion-message]');
  const feedback = document.querySelector('[data-suggestion-feedback]');
  const dialog = document.querySelector('[data-suggestion-dialog]');
  const submitButton = form.querySelector('[type="submit"]');
  let pendingRequestId = '';

  const openDialog = () => {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  };

  const closeDialog = () => {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };

  document.querySelector('[data-open-suggestion]')?.addEventListener('click', () => {
    if (feedback) feedback.hidden = true;
    openDialog();
  });
  document.querySelector('[data-close-suggestion]')?.addEventListener('click', closeDialog);
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });

  const request = async (url, options = {}) => {
    const { headers = {}, ...requestOptions } = options;
    const response = await fetch(url, {
      ...requestOptions,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...headers },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Forespørselen kunne ikke fullføres.');
    return payload;
  };

  const showError = text => {
    if (message) {
      message.textContent = text;
      message.dataset.tone = 'error';
      message.hidden = !text;
    } else if (feedback) {
      feedback.textContent = text;
      feedback.dataset.tone = 'error';
      feedback.hidden = !text;
    }
  };

  form.addEventListener('input', () => { pendingRequestId = ''; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    showError('');
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form).entries());
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
    }

    try {
      const session = await request(root + 'api/auth.php');
      if (!session.authenticated || session.identity?.role !== 'user') {
        throw new Error('Logg inn med PIN før du sender forslag.');
      }

      if (!pendingRequestId) {
        const generatedId = globalThis.crypto?.randomUUID?.()
          || 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        pendingRequestId = generatedId.replace(/[^A-Za-z0-9_-]/g, '_');
      }

      await request(root + 'api/suggestions.php', {
        method: 'POST',
        headers: { 'X-CSRF-Token': session.csrfToken || '' },
        body: JSON.stringify({
          description: String(data.description || '').trim(),
          payment: String(data.payment || '').replace(',', '.'),
          request_id: pendingRequestId,
        }),
      });

      form.reset();
      pendingRequestId = '';
      if (feedback) {
        feedback.dataset.tone = 'success';
        feedback.textContent = 'Forslaget er sendt til behandling.';
        feedback.hidden = false;
      }
      closeDialog();
    } catch (error) {
      const text = error instanceof TypeError
        ? 'Kunne ikke kontakte Ukelønn akkurat nå. Prøv igjen om litt.'
        : (error.message || 'Forslaget kunne ikke sendes inn.');
      showError(text);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
      }
    }
  });
})();
