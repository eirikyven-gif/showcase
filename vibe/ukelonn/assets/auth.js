(() => {
  const root = window.Ukelonn?.root || './';
  const authEndpoint = root + 'api/auth.php';
  const usersEndpoint = root + 'api/admin/users.php';
  let csrfToken = '';
  let users = [];
  let editingUserId = '';

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Forespørselen kunne ikke fullføres.');
    return payload;
  }

  const show = (element, text) => {
    if (!element) return;
    element.textContent = text;
    element.hidden = !text;
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }[character]));

  document.querySelectorAll('[data-login-form]').forEach(form => form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = document.querySelector('[data-message="' + form.dataset.loginForm + '"]');
    show(message, '');
    const isAdmin = form.dataset.loginForm === 'admin';
    try {
      await request(authEndpoint, {
        method: 'POST',
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form).entries()), action: isAdmin ? 'admin_login' : 'user_login' }),
      });
      location.assign(form.dataset.redirect || root + (isAdmin ? 'admin/' : 'registrer/'));
    } catch (error) {
      show(message, error.message);
    }
  }));

  function renderUsers(nextUsers) {
    users = nextUsers || [];
    const target = document.querySelector('[data-users]');
    if (!target) return;
    target.innerHTML = users.map(user => {
      const id = escapeHtml(user.id);
      const name = escapeHtml(user.name);
      return '<tr><th scope="row">' + name + '</th>'
        + '<td><span class="status-tag ' + (user.active ? 'status-active' : 'status-inactive') + '">' + (user.active ? 'Aktiv' : 'Deaktivert') + '</span></td>'
        + '<td><a class="button button-secondary" href="historikk/?user_id=' + encodeURIComponent(user.id) + '" aria-label="Åpne gjøremålshistorikk for ' + name + '">Åpne historikk</a></td>'
        + '<td><button class="button button-secondary" type="button" data-edit-user="' + id + '" aria-label="Rediger ' + name + '">Rediger</button></td></tr>';
    }).join('');
  }

  async function loadUsers() {
    const target = document.querySelector('[data-users]');
    if (!target) return;
    const message = document.querySelector('[data-message="list"]');
    show(message, '');
    try {
      const session = await request(authEndpoint);
      if (!session.authenticated || session.identity?.role !== 'admin') {
        location.assign(root + 'admin/logg-inn/');
        return;
      }
      csrfToken = session.csrfToken || '';
      const payload = await request(usersEndpoint);
      renderUsers(payload.users);
    } catch (error) {
      show(message, error.message);
    }
  }

  function openUserDialog(id) {
    const user = users.find(item => item.id === id);
    const dialog = document.querySelector('[data-user-edit-dialog]');
    if (!user || !dialog?.showModal) return;
    editingUserId = id;
    dialog.dataset.focusUserId = id;
    dialog.querySelector('[data-edit-user-name]').value = user.name;
    const demoPinField = dialog.querySelector('[data-edit-user-pin]');
    if (demoPinField) demoPinField.value = '';
    dialog.querySelector('[data-edit-user-active]').checked = Boolean(user.active);
    show(dialog.querySelector('[data-edit-user-error]'), '');
    dialog.showModal();
    dialog.querySelector('[data-edit-user-name]').focus();
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-edit-user]');
    if (trigger) openUserDialog(trigger.dataset.editUser);
  });

  const userDialog = document.querySelector('[data-user-edit-dialog]');
  userDialog?.addEventListener('close', () => {
    const id = userDialog.dataset.focusUserId;
    editingUserId = '';
    if (id) requestAnimationFrame(() => document.querySelector('[data-edit-user="' + CSS.escape(id) + '"]')?.focus());
  });

  document.querySelector('[data-user-edit]')?.addEventListener('submit', async event => {
    event.preventDefault();
    const dialog = document.querySelector('[data-user-edit-dialog]');
    const form = event.currentTarget;
    const save = form.querySelector('[data-save-user-edit]');
    if (!editingUserId || !dialog) return;
    const error = dialog.querySelector('[data-edit-user-error]');
    const body = {
      id: editingUserId,
      name: dialog.querySelector('[data-edit-user-name]').value.trim(),
      active: dialog.querySelector('[data-edit-user-active]').checked,
    };
    const pin = dialog.querySelector('[data-edit-user-pin]')?.value.trim() || '';
    if (pin) body.pin = pin;
    show(error, '');
    save.disabled = true;
    save.setAttribute('aria-busy', 'true');
    try {
      const payload = await request(usersEndpoint, {
        method: 'PATCH',
        headers: { 'X-CSRF-Token': csrfToken },
        body: JSON.stringify(body),
      });
      renderUsers(payload.users);
      dialog.close();
    } catch (requestError) {
      show(error, requestError.message);
    } finally {
      save.disabled = false;
      save.removeAttribute('aria-busy');
    }
  });

  document.querySelector('[data-cancel-user-edit]')?.addEventListener('click', () => userDialog?.close());

  const createForm = document.querySelector('[data-user-create]');
  if (createForm) {
    createForm.addEventListener('submit', async event => {
      event.preventDefault();
      const message = document.querySelector('[data-message="create"]');
      show(message, '');
      try {
        await request(usersEndpoint, {
          method: 'POST',
          headers: { 'X-CSRF-Token': csrfToken },
          body: JSON.stringify(Object.fromEntries(new FormData(createForm).entries())),
        });
        createForm.reset();
        await loadUsers();
      } catch (error) {
        show(message, error.message);
      }
    });
    document.querySelector('[data-refresh-users]')?.addEventListener('click', loadUsers);
    loadUsers();
  }
})();
