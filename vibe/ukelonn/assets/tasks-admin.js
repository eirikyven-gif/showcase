(() => {
  const root = window.Ukelonn?.root || './';
  const endpoint = root + 'api/admin/tasks.php';
  const authEndpoint = root + 'api/auth.php';
  let csrfToken = '';
  let tasks = [];
  let pendingDeleteId = '';
  let editingTaskId = '';

  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Forespørselen kunne ikke fullføres.');
    return payload;
  };

  const message = (text) => {
    const target = document.querySelector('[data-message="tasks"]');
    if (!target) return;
    target.textContent = text;
    target.hidden = !text;
  };

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character]));

  const formatPayment = (ore) => (Number(ore || 0) / 100).toFixed(2).replace('.', ',');

  function render() {
    const target = document.querySelector('[data-tasks]');
    if (!target) return;
    const query = document.querySelector('[data-task-search]')?.value.trim().toLocaleLowerCase('nb-NO') || '';
    const visible = tasks.filter((task) => task.name.toLocaleLowerCase('nb-NO').includes(query));

    if (!visible.length) {
      target.innerHTML = '<tr><td colspan="5">Ingen gjøremål samsvarer med søket.</td></tr>';
      return;
    }

    target.innerHTML = visible.map((task) => `
      <tr>
        <th scope="row" headers="task-column-name">${escapeHtml(task.name)}</th>
        <td headers="task-column-payment">${formatPayment(task.payment_ore)}</td>
        <td headers="task-column-requirements">${task.requires_image ? 'Bilde kreves' : 'Ingen bildefil'}</td>
        <td headers="task-column-status"><span class="status-tag ${task.active ? 'status-active' : 'status-inactive'}">${task.active ? 'Aktiv' : 'Deaktivert'}</span></td>
        <td headers="task-column-actions"><div class="table-actions">
          <button class="button button-secondary" type="button" data-edit-task="${escapeHtml(task.id)}" aria-label="Rediger ${escapeHtml(task.name)}">Rediger</button>
          <button class="button button-danger" type="button" data-delete-task="${escapeHtml(task.id)}">Slett</button>
        </div></td>
      </tr>`).join('');
  }

  async function load() {
    try {
      const session = await request(authEndpoint);
      if (!session.authenticated || session.identity?.role !== 'admin') {
        window.location.href = root + 'admin/logg-inn/';
        return;
      }
      csrfToken = session.csrfToken || '';
      const payload = await request(endpoint);
      tasks = payload.tasks || [];
      render();
    } catch (error) {
      message(error.message);
    }
  }

  async function mutate(method, body) {
    await request(endpoint, {
      method,
      headers: { 'X-CSRF-Token': csrfToken },
      body: JSON.stringify(body),
    });
    await load();
  }

  function openDeleteDialog(id) {
    pendingDeleteId = id;
    const task = tasks.find((item) => item.id === id);
    const nameTarget = document.querySelector('[data-delete-task-name]');
    if (nameTarget) nameTarget.textContent = task?.name || 'dette gjøremålet';
    const dialog = document.querySelector('[data-task-delete-dialog]');
    if (dialog?.showModal) dialog.showModal();
  }

  function closeDeleteDialog({ restoreFocus = true } = {}) {
    const id = pendingDeleteId;
    pendingDeleteId = '';
    document.querySelector('[data-task-delete-dialog]')?.close();
    if (restoreFocus && id) document.querySelector(`[data-delete-task="${CSS.escape(id)}"]`)?.focus();
  }

  function openEditDialog(id) {
    const task = tasks.find((item) => item.id === id);
    const dialog = document.querySelector('[data-task-edit-dialog]');
    if (!task || !dialog?.showModal) return;
    editingTaskId = id;
    dialog.querySelector('[data-edit-task-name]').value = task.name;
    dialog.querySelector('[data-edit-task-payment]').value = formatPayment(task.payment_ore);
    dialog.querySelector('[data-edit-task-image]').checked = Boolean(task.requires_image);
    dialog.querySelector('[data-edit-task-active]').checked = Boolean(task.active);
    dialog.querySelector('[data-edit-task-error]').hidden = true;
    dialog.showModal();
    dialog.querySelector('[data-edit-task-name]').focus();
  }

  function closeEditDialog({ restoreFocus = true } = {}) {
    const id = editingTaskId;
    editingTaskId = '';
    document.querySelector('[data-task-edit-dialog]')?.close();
    if (restoreFocus && id) {
      document.querySelector(`[data-edit-task="${CSS.escape(id)}"]`)?.focus();
    }
  }

  document.querySelector('[data-task-create]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    message('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await request(endpoint, {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body: JSON.stringify({
          name: data.name,
          payment: data.payment.replace(',', '.'),
          requires_image: form.querySelector('[name="requires_image"]').checked,
        }),
      });
      form.reset();
      await load();
    } catch (error) {
      message(error.message);
    }
  });

  document.querySelector('[data-task-search]')?.addEventListener('input', render);
  document.querySelector('[data-refresh-tasks]')?.addEventListener('click', load);
  document.querySelector('[data-cancel-delete]')?.addEventListener('click', closeDeleteDialog);
  document.querySelector('[data-task-delete-dialog]')?.addEventListener('cancel', () => { pendingDeleteId = ''; });
  document.querySelector('[data-cancel-edit-task]')?.addEventListener('click', () => closeEditDialog());
  document.querySelector('[data-task-edit-dialog]')?.addEventListener('cancel', () => { editingTaskId = ''; });
  document.querySelector('[data-task-edit]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const dialog = document.querySelector('[data-task-edit-dialog]');
    const errorTarget = dialog?.querySelector('[data-edit-task-error]');
    if (!editingTaskId || !dialog) return;
    const id = editingTaskId;
    const payment = dialog.querySelector('[data-edit-task-payment]').value.trim().replace(',', '.');
    try {
      await mutate('PATCH', {
        id,
        name: dialog.querySelector('[data-edit-task-name]').value.trim(),
        payment,
        requires_image: dialog.querySelector('[data-edit-task-image]').checked,
        active: dialog.querySelector('[data-edit-task-active]').checked,
      });
      closeEditDialog({ restoreFocus: false });
      document.querySelector(`[data-edit-task="${CSS.escape(id)}"]`)?.focus();
    } catch (error) {
      if (errorTarget) {
        errorTarget.textContent = error.message;
        errorTarget.hidden = false;
      }
    }
  });
  document.querySelector('[data-confirm-delete]')?.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    closeDeleteDialog({ restoreFocus: false });
    try {
      await mutate('DELETE', { id });
      document.querySelector('[data-refresh-tasks]')?.focus();
    } catch (error) {
      message(error.message);
      document.querySelector(`[data-delete-task="${CSS.escape(id)}"]`)?.focus();
    }
  });

  document.addEventListener('click', async (event) => {
    const edit = event.target.closest('[data-edit-task]');
    const remove = event.target.closest('[data-delete-task]');
    if (!edit && !remove) return;

    const id = (edit || remove).dataset.editTask || (edit || remove).dataset.deleteTask;

    try {
      if (edit) openEditDialog(id);
      else openDeleteDialog(id);
    } catch (error) {
      message(error.message);
    }
  });

  load();
})();
